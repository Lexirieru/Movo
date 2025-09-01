// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/EscrowUSDC.sol";

/*
███╗░░░███╗░█████╗░██╗░░░██╗░█████╗░
████╗░████║██╔══██╗██║░░░██║██╔══██╗
██╔████╔██║██║░░██║╚██╗░██╔╝██║░░██║
██║╚██╔╝██║██║░░██║░╚████╔╝░██║░░██║
██║░╚═╝░██║╚█████╔╝░░╚██╔╝░░╚█████╔╝
╚═╝░░░░░╚═╝░╚════╝░░░░╚═╝░░░░╚════╝░
*/

/**
 * @title DeployUSDCEscrow
 * @dev Script to deploy the EscrowUSDC contract
 */
contract DeployUSDCEscrow is Script {
    
    function run() external {
        // Get deployer private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy EscrowUSDC contract
        // Set fee recipient to deployer address for testing
        address deployer = vm.addr(deployerPrivateKey);
        EscrowUSDC escrowUSDC = new EscrowUSDC(deployer);
        
        vm.stopBroadcast();
        
        // Log deployment information
        console.log("EscrowUSDC deployed at:", address(escrowUSDC));
        console.log("Fee recipient set to:", deployer);
        console.log("Deployer address:", deployer);
        
        // Log contract details
        console.log("Platform fee:", escrowUSDC.platformFeeBps(), "basis points (0.25%)");
        console.log("Min escrow amount:", escrowUSDC.minEscrowAmount(), "USDC (6 decimals)");
        console.log("Max escrow amount:", escrowUSDC.maxEscrowAmount(), "USDC (6 decimals)");
    }
}
