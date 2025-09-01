// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/EscrowIDRX.sol";

/*
███╗░░░███╗░█████╗░██╗░░░██╗░█████╗░
████╗░████║██╔══██╗██║░░░██║██╔══██╗
██╔████╔██║██║░░██║╚██╗░██╔╝██║░░██║
██║╚██╔╝██║██║░░██║░╚████╔╝░██║░░██║
██║░╚═╝░██║╚█████╔╝░░╚██╔╝░░╚█████╔╝
╚═╝░░░░░╚═╝░╚════╝░░░░╚═╝░░░░╚════╝░
*/

/**
 * @title DeployIDRXEscrow
 * @dev Script to deploy the EscrowIDRX contract
 */
contract DeployIDRXEscrow is Script {
    
    function run() external {
        // Get deployer private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy EscrowIDRX contract
        // Set fee recipient to deployer address for testing
        address deployer = vm.addr(deployerPrivateKey);
        EscrowIDRX escrowIDRX = new EscrowIDRX(deployer);
        
        vm.stopBroadcast();
        
        // Log deployment information
        console.log("EscrowIDRX deployed at:", address(escrowIDRX));
        console.log("Fee recipient set to:", deployer);
        console.log("Deployer address:", deployer);
        
        // Log contract details
        console.log("Platform fee:", escrowIDRX.platformFeeBps(), "basis points (0.25%)");
        console.log("Min escrow amount:", escrowIDRX.minEscrowAmount(), "IDRX (2 decimals)");
        console.log("Max escrow amount:", escrowIDRX.maxEscrowAmount(), "IDRX (2 decimals)");
        console.log("IDRX contract address:", escrowIDRX.IDRX_ADDRESS());
    }
}
