pragma solidity ^0.5;

contract ArtworkController {

    struct Artwork {
        address hash;
        address owner;
        uint averageSpent;
        uint donationSum;
        uint donationCount;
    }

    mapping(address => Artwork) public artworks;

}