// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./interfaces/IIDRX.sol";

/*
███╗░░░███╗░█████╗░██╗░░░██║░█████╗░
████╗░████║██╔══██╗██║░░░██║██╔══██╗
██╔████╔██║██║░░██║╚██╗░██╔╝██║░░██║
██║╚██╔╝██║██║░░██║░╚████╔╝░██║░░██║
██║░╚═╝░██║╚█████╔╝░░╚██╔╝░░╚█████╔╝
╚═╝░░░░░╚═╝░╚════╝░░░░╚═╝░░░░╚════╝░
*/

/**
 * @title EscrowIDRX
 * @dev Smart contract for IDRX escrow system with crypto and fiat withdrawal features
 * 
 * ARCHITECTURE:
 * - Crypto Withdrawal: IDRX directly to receiver wallet
 * - Fiat Withdrawal: Smart contract burns IDRX, frontend handles redeem via IDRX API
 * 
 * FLOW FOR FIAT WITHDRAWAL:
 * 1. User calls withdrawIDRXToFiat() with bank account number
 * 2. Smart contract burns IDRX via burnWithAccountNumber()
 * 3. Frontend gets transaction hash from burning
 * 4. Frontend calls IDRX API (/api/transaction/redeem-request) with tx hash
 * 5. IDRX.co processes fiat withdrawal to bank account
 * 
 * Note: This contract only handles the burning part. Frontend must integrate with IDRX API
 * for complete fiat withdrawal functionality.
 */
contract EscrowIDRX is ReentrancyGuard, Ownable, Pausable {
    
    // ============ STRUCTS ============
    
    struct Receiver {
        address receiverAddress;
        uint256 maxAmount;           // Max amount that can be withdrawn
        uint256 withdrawnAmount;     // Amount already withdrawn
        bool hasWithdrawn;           // Has withdrawn or not
        bool isActive;               // Receiver still active or already refunded
    }
    
    struct EscrowRoom {
        address sender;
        uint256 totalAmount;
        uint256 withdrawnAmount;
        uint256 depositedAmount;
        uint256 refundedAmount;      // Total amount already refunded
        bool isActive;
        bool isCompleted;
        uint256 createdAt;
        mapping(address => Receiver) receivers;
        address[] receiverAddresses;
        uint256 activeReceiverCount; // Number of active receivers
    }
    
    // ============ STATE VARIABLES ============
    
    mapping(bytes32 => EscrowRoom) public escrowRooms;
    mapping(address => bytes32[]) public userEscrows; // Sender escrows
    mapping(address => bytes32[]) public receiverEscrows; // Receiver escrows
    
    // IDRX contract address
    address public constant IDRX_ADDRESS = 0x29Fc20a600B2392b8b659CBD47eAcA44F9Fb71B0; // Mock IDRX Base Testnet
    
    // Platform fee (in basis points, 100 = 1%)
    uint256 public platformFeeBps = 25; // 0.25%
    address public feeRecipient = 0x63470E56eFeB1759F3560500fB2d2FD43A86F179;
    
    // Minimum and maximum amounts (2 decimals)
    uint256 public minEscrowAmount = 20000 * 10**2; // 20,000 IDRX
    uint256 public maxEscrowAmount = 1000000000 * 10**2; // 1B IDRX
    
    // ============ EVENTS ============
    
    event EscrowCreated(
        bytes32 indexed escrowId,
        address indexed sender,
        uint256 totalAmount,
        uint256 createdAt,
        address[] receivers,
        uint256[] amounts
    );
    
    event Allocation(
        bytes32 indexed escrowId,
        address indexed receiver,
        uint256 maxAmount,
        uint256 createdAt
    );
    
    event FundsDeposited(
        bytes32 indexed escrowId,
        address indexed sender,
        uint256 amount
    );
    
    event IDRXWithdrawn(
        bytes32 indexed escrowId,
        address indexed receiver,
        uint256 amount,
        address depositWallet
    );
    
    event IDRXBurnedForFiat(
        bytes32 indexed escrowId,
        address indexed receiver,
        uint256 amount,
        string hashedAccountNumber
    );
    
    event ReceiverRefunded(
        bytes32 indexed escrowId,
        address indexed receiver,
        uint256 refundAmount,
        address indexed sender
    );
    
    event EscrowCompleted(
        bytes32 indexed escrowId,
        uint256 totalWithdrawn
    );
    
    event EscrowCancelled(
        bytes32 indexed escrowId,
        address indexed sender,
        uint256 refundAmount
    );
    
    // ============ MODIFIERS ============
    
    modifier onlyEscrowSender(bytes32 _escrowId) {
        require(escrowRooms[_escrowId].sender == msg.sender, "Only escrow sender");
        _;
    }
    
    modifier escrowExists(bytes32 _escrowId) {
        require(escrowRooms[_escrowId].sender != address(0), "Escrow does not exist");
        _;
    }
    
    modifier escrowActive(bytes32 _escrowId) {
        require(escrowRooms[_escrowId].isActive, "Escrow is not active");
        _;
    }
    
    // ============ CONSTRUCTOR ============
    
    constructor() Ownable(msg.sender) {
        // feeRecipient already set to default value
    }
    
    // ============ MAIN FUNCTIONS ============
    
    /**
     * @dev Create new escrow room with multiple receivers and directly deposit IDRX
     * @param _receivers Array of receiver addresses
     * @param _amounts Array of amounts for each receiver
     * @return escrowId ID of the created escrow
     */
    function createEscrow(
        address[] memory _receivers,
        uint256[] memory _amounts
    ) external nonReentrant whenNotPaused returns (bytes32) {
        require(_receivers.length > 0, "At least one receiver required");
        require(_receivers.length == _amounts.length, "Receivers and amounts length mismatch");
        
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < _amounts.length; i++) {
            totalAmount += _amounts[i];
        }
        
        // Check minimum and maximum amounts
        require(totalAmount >= minEscrowAmount, "Amount below minimum (20,000 IDRX)");
        require(totalAmount <= maxEscrowAmount, "Amount above maximum (1B IDRX)");
        
        bytes32 escrowId = keccak256(
            abi.encodePacked(
                msg.sender,
                IDRX_ADDRESS,
                totalAmount,
                block.timestamp,
                block.number
            )
        );
        
        EscrowRoom storage room = escrowRooms[escrowId];
        room.sender = msg.sender;
        room.totalAmount = totalAmount;
        room.isActive = true;
        room.createdAt = block.timestamp;
        room.activeReceiverCount = _receivers.length;
        
        // Add receivers with max amount
        for (uint256 i = 0; i < _receivers.length; i++) {
            require(_receivers[i] != address(0), "Invalid receiver address");
            require(_amounts[i] > 0, "Amount must be greater than 0");
            
            room.receivers[_receivers[i]] = Receiver({
                receiverAddress: _receivers[i],
                maxAmount: _amounts[i],
                withdrawnAmount: 0,
                hasWithdrawn: false,
                isActive: true
            });
            
            room.receiverAddresses.push(_receivers[i]);
            receiverEscrows[_receivers[i]].push(escrowId);
            
            emit Allocation(
                escrowId,
                _receivers[i],
                _amounts[i],
                block.timestamp
            );
        }
        
        userEscrows[msg.sender].push(escrowId);
        
        // Directly deposit IDRX to escrow
        IERC20 idrx = IERC20(IDRX_ADDRESS);
        require(idrx.transferFrom(msg.sender, address(this), totalAmount), "Transfer to escrow failed");
        room.depositedAmount = totalAmount;
        
        emit EscrowCreated(
            escrowId,
            msg.sender,
            totalAmount,
            block.timestamp,
            _receivers,
            _amounts
        );
        
        emit FundsDeposited(escrowId, msg.sender, totalAmount);
        
        return escrowId;
    }
    
    /**
     * @dev Withdraw IDRX to crypto wallet (receiver's own wallet)
     * @param _escrowId ID of escrow room
     * @param _amount Total amount of IDRX to withdraw (fee will be deducted from this amount)
     */
    function withdrawIDRXToCrypto(
        bytes32 _escrowId,
        uint256 _amount
    ) external nonReentrant whenNotPaused escrowExists(_escrowId) escrowActive(_escrowId) {
        EscrowRoom storage room = escrowRooms[_escrowId];
        Receiver storage receiver = room.receivers[msg.sender];
        
        require(receiver.receiverAddress == msg.sender, "Not authorized receiver");
        require(receiver.isActive, "Receiver is not active");
        require(_amount > 0, "Amount must be greater than 0");
        require(_amount <= receiver.maxAmount - receiver.withdrawnAmount, "Amount exceeds available balance");
        
        // Calculate fee from the total amount
        uint256 fee = (_amount * platformFeeBps) / 10000;
        uint256 netAmount = _amount - fee;
        
        receiver.withdrawnAmount += _amount;
        room.withdrawnAmount += _amount;
        
        // Update status if already withdrawn all
        if (receiver.withdrawnAmount >= receiver.maxAmount) {
            receiver.hasWithdrawn = true;
        }
        
        IERC20 idrx = IERC20(IDRX_ADDRESS);
        
        // Transfer IDRX to crypto wallet
        require(idrx.transfer(msg.sender, netAmount), "Transfer to crypto wallet failed");
        
        // Transfer fee to platform
        if (fee > 0) {
            require(idrx.transfer(feeRecipient, fee), "Fee transfer failed");
        }
        
        emit IDRXWithdrawn(_escrowId, msg.sender, _amount, msg.sender);
        
        // Check if all receivers have withdrawn
        _checkAndCompleteEscrow(_escrowId);
    }
    
    /**
     * @dev Withdraw IDRX to fiat (smart contract burns IDRX, frontend handles redeem)
     * 
     * IMPORTANT: This function burns IDRX tokens using hashedAccountNumber from backend.
     * The actual fiat withdrawal must be handled by the frontend calling IDRX API after this transaction.
     * 
     * FLOW:
     * 1. Backend generates hashedAccountNumber from bank account details
     * 2. This function burns IDRX via burnWithAccountNumber(amount, hashedAccountNumber)
     * 3. Frontend gets transaction hash from burning
     * 4. Frontend calls IDRX API: POST /api/transaction/redeem-request
     * 5. IDRX.co processes fiat withdrawal to bank account
     * 
     * PARAMETERS for IDRX.burnWithAccountNumber():
     * - amount: _amount (IDRX amount to burn)
     * - accountNumber: _hashedAccountNumber (hash dari backend)
     * 
     * Note: User address (_user) is automatically determined by IDRX contract
     * 
     * @param _escrowId ID of escrow room
     * @param _amount Total amount of IDRX to withdraw to fiat (fee will be deducted from this amount)
     * @param _hashedAccountNumber Hashed bank account number generated by backend
     */
    function withdrawIDRXToFiat(
        bytes32 _escrowId,
        uint256 _amount,
        string memory _hashedAccountNumber
    ) external nonReentrant whenNotPaused escrowExists(_escrowId) escrowActive(_escrowId) {
        EscrowRoom storage room = escrowRooms[_escrowId];
        Receiver storage receiver = room.receivers[msg.sender];
        
        require(receiver.receiverAddress == msg.sender, "Not authorized receiver");
        require(receiver.isActive, "Receiver is not active");
        require(_amount > 0, "Amount must be greater than 0");
        require(_amount <= receiver.maxAmount - receiver.withdrawnAmount, "Amount exceeds available balance");
        
        // Calculate fee from the total amount
        uint256 fee = (_amount * platformFeeBps) / 10000;
        
        receiver.withdrawnAmount += _amount;
        room.withdrawnAmount += _amount;
        
        // Update status if already withdrawn all
        if (receiver.withdrawnAmount >= receiver.maxAmount) {
            receiver.hasWithdrawn = true;
        }
        
        // STEP 1: Smart contract burns IDRX using IIDRX interface
        // This destroys the tokens and makes them available for fiat conversion
        // Backend provides hashedAccountNumber for IDRX.co processing
        IIDRX idrx = IIDRX(IDRX_ADDRESS);
        idrx.burnWithAccountNumber(
            _amount,                 // Amount yang di-burn
            _hashedAccountNumber     // Hash dari backend
        );
        
        // STEP 2: Frontend must now call IDRX API to complete fiat withdrawal
        // API endpoint: POST /api/transaction/redeem-request
        // Required params: txHash (from this transaction), amount, bank details
        // Note: IDRX.burnWithAccountNumber() called with correct parameters:
        // - amount: _amount (IDRX amount to burn)
        // - accountNumber: _hashedAccountNumber (hash dari backend)
        // User address (_user) is automatically determined by IDRX contract
        
        // Transfer fee to platform (fee taken from escrow balance)
        if (fee > 0) {
            IERC20 idrxERC20 = IERC20(IDRX_ADDRESS);
            require(idrxERC20.transfer(feeRecipient, fee), "Fee transfer failed");
        }
        
        // Emit event for burning completion
        // Frontend should listen to this event to proceed with IDRX API call
        emit IDRXBurnedForFiat(
            _escrowId,
            msg.sender,
            _amount,
            _hashedAccountNumber
        );
        
        // Check if all receivers have withdrawn
        _checkAndCompleteEscrow(_escrowId);
    }
    
    /**
     * @dev Refund receiver who made wrong input (only sender can do this)
     * @param _escrowId ID of escrow room
     * @param _receiver Address of receiver to refund
     */
    function refundReceiver(
        bytes32 _escrowId,
        address _receiver
    ) external nonReentrant whenNotPaused escrowExists(_escrowId) escrowActive(_escrowId) onlyEscrowSender(_escrowId) {
        EscrowRoom storage room = escrowRooms[_escrowId];
        Receiver storage receiver = room.receivers[_receiver];
        
        require(receiver.receiverAddress != address(0), "Receiver does not exist");
        require(receiver.isActive, "Receiver already refunded");
        require(!receiver.hasWithdrawn, "Cannot refund receiver who already withdrew");
        
        uint256 refundAmount = receiver.maxAmount;
        
        // Update receiver status
        receiver.isActive = false;
        room.activeReceiverCount--;
        room.refundedAmount += refundAmount;
        
        // Refund IDRX to sender
        IERC20 idrx = IERC20(IDRX_ADDRESS);
        require(idrx.transfer(room.sender, refundAmount), "Refund transfer failed");
        
        emit ReceiverRefunded(_escrowId, _receiver, refundAmount, msg.sender);
        
        // Check if escrow should be completed
        _checkAndCompleteEscrow(_escrowId);
    }
    
    /**
     * @dev Cancel escrow and refund funds to sender
     * @param _escrowId ID of escrow room
     */
    function cancelEscrow(
        bytes32 _escrowId
    ) external nonReentrant whenNotPaused escrowExists(_escrowId) onlyEscrowSender(_escrowId) {
        EscrowRoom storage room = escrowRooms[_escrowId];
        
        require(room.isActive, "Escrow is not active");
        
        room.isActive = false;
        
        uint256 refundAmount = room.totalAmount - room.withdrawnAmount - room.refundedAmount;
        
        if (refundAmount > 0) {
            IERC20 idrx = IERC20(IDRX_ADDRESS);
            require(idrx.transfer(room.sender, refundAmount), "Refund transfer failed");
        }
        
        emit EscrowCancelled(_escrowId, room.sender, refundAmount);
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get escrow details
     */
    function getEscrowDetails(bytes32 _escrowId) external view returns (
        address sender,
        uint256 totalAmount,
        uint256 withdrawnAmount,
        uint256 depositedAmount,
        uint256 refundedAmount,
        bool isActive,
        bool isCompleted,
        uint256 createdAt,
        uint256 receiverCount,
        uint256 activeReceiverCount
    ) {
        EscrowRoom storage room = escrowRooms[_escrowId];
        return (
            room.sender,
            room.totalAmount,
            room.withdrawnAmount,
            room.depositedAmount,
            room.refundedAmount,
            room.isActive,
            room.isCompleted,
            room.createdAt,
            room.receiverAddresses.length,
            room.activeReceiverCount
        );
    }
    
    /**
     * @dev Get receiver details
     */
    function getReceiverDetails(bytes32 _escrowId, address _receiver) external view returns (
        uint256 maxAmount,
        uint256 withdrawnAmount,
        bool hasWithdrawn,
        bool isActive
    ) {
        Receiver storage receiver = escrowRooms[_escrowId].receivers[_receiver];
        return (
            receiver.maxAmount,
            receiver.withdrawnAmount,
            receiver.hasWithdrawn,
            receiver.isActive
        );
    }
    
    /**
     * @dev Get withdrawable amount for receiver
     */
    function getWithdrawableAmount(bytes32 _escrowId, address _receiver) external view returns (uint256 withdrawableAmount) {
        Receiver storage receiver = escrowRooms[_escrowId].receivers[_receiver];
        if (!receiver.isActive || receiver.hasWithdrawn) {
            return 0;
        }
        return receiver.maxAmount - receiver.withdrawnAmount;
    }
    
    /**
     * @dev Get allocation for receiver (max amount)
     */
    function getAllocation(bytes32 _escrowId, address _receiver) external view returns (uint256 allocation) {
        Receiver storage receiver = escrowRooms[_escrowId].receivers[_receiver];
        return receiver.maxAmount;
    }
    
    /**
     * @dev Get all receivers for an escrow
     */
    function getEscrowReceivers(bytes32 _escrowId) external view returns (address[] memory receivers) {
        return escrowRooms[_escrowId].receiverAddresses;
    }
    
    /**
     * @dev Get user's escrows (as sender)
     */
    function getUserEscrows(address _user) external view returns (bytes32[] memory escrowIds) {
        return userEscrows[_user];
    }
    
    /**
     * @dev Get receiver's escrows
     */
    function getReceiverEscrows(address _receiver) external view returns (bytes32[] memory escrowIds) {
        return receiverEscrows[_receiver];
    }
    
    // ============ INTERNAL FUNCTIONS ============
    
    /**
     * @dev Check and update escrow status
     */
    function _checkAndCompleteEscrow(bytes32 _escrowId) internal {
        EscrowRoom storage room = escrowRooms[_escrowId];
        
        bool allActiveWithdrawn = true;
        for (uint256 i = 0; i < room.receiverAddresses.length; i++) {
            Receiver storage receiver = room.receivers[room.receiverAddresses[i]];
            if (receiver.isActive && !receiver.hasWithdrawn) {
                allActiveWithdrawn = false;
                break;
            }
        }
        
        if (allActiveWithdrawn && room.activeReceiverCount == 0) {
            room.isCompleted = true;
            room.isActive = false;
            emit EscrowCompleted(_escrowId, room.withdrawnAmount);
        }
    }
}