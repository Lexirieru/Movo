// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/*
███╗░░░███╗░█████╗░██╗░░░██╗░█████╗░
████╗░████║██╔══██╗██║░░░██║██╔══██╗
██╔████╔██║██║░░██║╚██╗░██╔╝██║░░██║
██║╚██╔╝██║██║░░██║░╚████╔╝░██║░░██║
██║░╚═╝░██║╚█████╔╝░░╚██╔╝░░╚█████╔╝
╚═╝░░░░░╚═╝░╚════╝░░░░╚═╝░░░░╚════╝░
*/

/**
 * @title EscrowIDRX
 * @dev Smart contract for IDRX escrow system with crypto and fiat withdrawal features
 * Crypto: IDRX directly to receiver wallet
 * Fiat: Frontend handles burning IDRX, escrow only confirms and tracks
 */
contract EscrowIDRX is ReentrancyGuard, Ownable, Pausable {
    
    // ============ STRUCTS ============
    
    struct Receiver {
        address receiverAddress;
        uint256 maxAmount;           // Max amount that can be withdrawn
        uint256 withdrawnAmount;     // Amount already withdrawn
        bool hasWithdrawn;           // Has withdrawn or not
        bool isActive;               // Receiver still active or already refunded
        address depositWallet;       // For crypto withdrawal
        string hashedAccountNumber;  // For IDRX fiat withdrawal
        bool withdrawalTypeSet;      // Has set withdrawal type or not
        WithdrawalType withdrawalType; // Type of withdrawal
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
    
    // ============ ENUMS ============
    
    enum WithdrawalType {
        CRYPTO,  // 0 - IDRX to wallet
        FIAT     // 1 - IDRX burn for fiat
    }
    
    // ============ STATE VARIABLES ============
    
    mapping(bytes32 => EscrowRoom) public escrowRooms;
    mapping(address => bytes32[]) public userEscrows; // Sender escrows
    mapping(address => bytes32[]) public receiverEscrows; // Receiver escrows
    
    // IDRX contract address
    address public constant IDRX_ADDRESS = 0x18bc5bcc660cf2b9ce3cd51a404afe1a0cbd3c22; // IDRX Base Mainnet
    
    // Platform fee (in basis points, 100 = 1%)
    uint256 public platformFeeBps = 25; // 0.25%
    address public feeRecipient;
    
    // Minimum and maximum amounts (2 decimals)
    uint256 public minEscrowAmount = 2000 * 10**2; // 20,000 IDRX
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
    
    event WithdrawalTypeSet(
        bytes32 indexed escrowId,
        address indexed receiver,
        WithdrawalType withdrawalType,
        address depositWallet,
        string hashedAccountNumber
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
        string hashedAccountNumber,
        uint256 burnTxHash
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
    
    constructor(address _feeRecipient) Ownable(msg.sender) {
        feeRecipient = _feeRecipient;
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
                isActive: true,
                depositWallet: address(0),
                hashedAccountNumber: "",
                withdrawalTypeSet: false,
                withdrawalType: WithdrawalType.CRYPTO // Default
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
     * @dev Set withdrawal type for receiver
     * @param _escrowId ID of escrow room
     * @param _withdrawalType Type of withdrawal (0 = crypto, 1 = fiat)
     * @param _withdrawalData Data for withdrawal (wallet address for crypto, hashed account number for fiat)
     */
    function setWithdrawalType(
        bytes32 _escrowId,
        WithdrawalType _withdrawalType,
        string memory _withdrawalData
    ) external whenNotPaused escrowExists(_escrowId) escrowActive(_escrowId) {
        EscrowRoom storage room = escrowRooms[_escrowId];
        Receiver storage receiver = room.receivers[msg.sender];
        
        require(receiver.receiverAddress == msg.sender, "Not authorized receiver");
        require(receiver.isActive, "Receiver is not active");
        require(!receiver.withdrawalTypeSet, "Withdrawal type already set");
        require(!receiver.hasWithdrawn, "Already withdrawn");
        
        receiver.withdrawalTypeSet = true;
        receiver.withdrawalType = _withdrawalType;
        
        if (_withdrawalType == WithdrawalType.CRYPTO) {
            // For crypto withdrawal (IDRX to wallet)
            address depositWallet = address(uint160(bytes20(bytes(_withdrawalData))));
            require(depositWallet != address(0), "Invalid deposit wallet address");
            receiver.depositWallet = depositWallet;
        } else if (_withdrawalType == WithdrawalType.FIAT) {
            // For fiat withdrawal (IDRX burn for fiat)
            require(bytes(_withdrawalData).length > 0, "Hashed account number required");
            receiver.hashedAccountNumber = _withdrawalData;
        }
        
        emit WithdrawalTypeSet(
            _escrowId,
            msg.sender,
            _withdrawalType,
            receiver.depositWallet,
            receiver.hashedAccountNumber
        );
    }
    
    /**
     * @dev Withdraw IDRX to crypto wallet
     * @param _escrowId ID of escrow room
     * @param _amount Amount of IDRX to withdraw
     */
    function withdrawIDRXToCrypto(
        bytes32 _escrowId,
        uint256 _amount
    ) external nonReentrant whenNotPaused escrowExists(_escrowId) escrowActive(_escrowId) {
        EscrowRoom storage room = escrowRooms[_escrowId];
        Receiver storage receiver = room.receivers[msg.sender];
        
        require(receiver.receiverAddress == msg.sender, "Not authorized receiver");
        require(receiver.isActive, "Receiver is not active");
        require(receiver.withdrawalTypeSet, "Withdrawal type not set");
        require(receiver.withdrawalType == WithdrawalType.CRYPTO, "Not crypto withdrawal");
        require(receiver.depositWallet != address(0), "Deposit wallet not set");
        require(_amount > 0, "Amount must be greater than 0");
        require(_amount <= receiver.maxAmount - receiver.withdrawnAmount, "Amount exceeds available balance");
        
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
        require(idrx.transfer(receiver.depositWallet, netAmount), "Transfer to crypto wallet failed");
        
        // Transfer fee to platform
        if (fee > 0) {
            require(idrx.transfer(feeRecipient, fee), "Fee transfer failed");
        }
        
        emit IDRXWithdrawn(_escrowId, msg.sender, _amount, receiver.depositWallet);
        
        // Check if all receivers have withdrawn
        _checkAndCompleteEscrow(_escrowId);
    }
    
    /**
     * @dev Frontend calls IDRX contract to burn, then escrow updates status
     * @param _escrowId ID of escrow room
     * @param _amount Amount of IDRX already burned by frontend
     * @param _burnTxHash Hash of burn transaction from frontend
     */
    function confirmIDRXBurnForFiat(
        bytes32 _escrowId,
        uint256 _amount,
        uint256 _burnTxHash
    ) external nonReentrant whenNotPaused escrowExists(_escrowId) escrowActive(_escrowId) {
        EscrowRoom storage room = escrowRooms[_escrowId];
        Receiver storage receiver = room.receivers[msg.sender];
        
        require(receiver.receiverAddress == msg.sender, "Not authorized receiver");
        require(receiver.isActive, "Receiver is not active");
        require(receiver.withdrawalTypeSet, "Withdrawal type not set");
        require(receiver.withdrawalType == WithdrawalType.FIAT, "Not fiat withdrawal");
        require(bytes(receiver.hashedAccountNumber).length > 0, "Hashed account number not set");
        require(_amount > 0, "Amount must be greater than 0");
        require(_amount <= receiver.maxAmount - receiver.withdrawnAmount, "Amount exceeds available balance");
        
        uint256 fee = (_amount * platformFeeBps) / 10000;
        uint256 netAmount = _amount - fee;
        
        receiver.withdrawnAmount += _amount;
        room.withdrawnAmount += _amount;
        
        // Update status if already withdrawn all
        if (receiver.withdrawnAmount >= receiver.maxAmount) {
            receiver.hasWithdrawn = true;
        }
        
        // Transfer fee to platform (fee taken from escrow balance)
        if (fee > 0) {
            IERC20 idrx = IERC20(IDRX_ADDRESS);
            require(idrx.transfer(feeRecipient, fee), "Fee transfer failed");
        }
        
        emit IDRXBurnedForFiat(
            _escrowId,
            msg.sender,
            _amount,
            receiver.hashedAccountNumber,
            _burnTxHash
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
        bool isActive,
        address depositWallet,
        string memory hashedAccountNumber,
        bool withdrawalTypeSet,
        WithdrawalType withdrawalType
    ) {
        Receiver storage receiver = escrowRooms[_escrowId].receivers[_receiver];
        return (
            receiver.maxAmount,
            receiver.withdrawnAmount,
            receiver.hasWithdrawn,
            receiver.isActive,
            receiver.depositWallet,
            receiver.hashedAccountNumber,
            receiver.withdrawalTypeSet,
            receiver.withdrawalType
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
        if (!receiver.isActive) {
            return 0;
        }
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
