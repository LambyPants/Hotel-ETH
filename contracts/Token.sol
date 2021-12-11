//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;
import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract BookingToken is ERC20 {
    address public owner;

    event OwnerChanged(address indexed from, address to);

    modifier onlyOwner() {
        require(msg.sender == owner, "owner restricted funtionality");
        _;
    }

    constructor(address _owner) payable ERC20("Lamby's BNB", "LBNB") {
        owner = _owner;
    }

    function decimals() public pure override returns (uint8) {
        return 0;
    }

    function mint(address account, uint256 amount) public onlyOwner {
        _mint(account, amount);
    }

    function burn(address account, uint256 amount) public onlyOwner {
        _burn(account, amount);
    }

    function passMinterRole(address _newOwner) public onlyOwner {
        owner = _newOwner;
        emit OwnerChanged(msg.sender, _newOwner);
    }
}
