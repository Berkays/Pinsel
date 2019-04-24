pragma solidity ^0.5;
pragma experimental ABIEncoderV2;

contract AccountController {

    mapping(address => string[]) private accounts;

    constructor() public {
    }

    // modifier onlyOwner(address sender,address owner)
    // {
    //     require(sender == owner,'Only owner can access owned artworks.');
    //     _;
    // }

    function getOwnedArtworks() 
    view 
    public 
    returns(string[] memory) {
        return accounts[msg.sender];
    }

    function getOwnedArtworksCount() 
    view 
    public 
    returns (uint) {
        return accounts[msg.sender].length;
    }
}