// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Main is Ownable {
    mapping(address=>uint) private vaultAccounts;

    constructor() {

    }

    function deposit() public payable {
        vaultAccounts[msg.sender] += msg.value;
    }

    function withdraw(address payable to, uint amount) public onlyOwner {
        require(address(this).balance>=amount, "Contract has insufficient balance");
        require(vaultAccounts[to]>=amount, "Not enough balance");
        to.transfer(amount);
        vaultAccounts[to]-=amount;
    }

    function initiateCryptoPaymentFromVault(address from, address payable to, uint amount)
     public onlyOwner {
        require(address(this).balance>=amount, "Contract has insufficient balance");
        require(vaultAccounts[from]>=amount, "Not enough balance");
        to.transfer(amount);
        vaultAccounts[from]-=amount;
     }

     function initiateUPIPaymentFromVault(address from, uint amount) public onlyOwner {
        require(address(this).balance>=amount, "Contract has insufficient balance");
        require(vaultAccounts[from]>=amount, "Not enough balance");
        vaultAccounts[from]-=amount;
     }
}
