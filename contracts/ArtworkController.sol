pragma solidity ^0.5;

contract ArtworkController {

    event Donated();

    struct Artwork {
        address hash;
        address owner;
        uint averageDonation;
        uint donationSum;
        uint donationCount;

        bytes16 imageName;
    }

    mapping(address => Artwork) public artworks;
    uint private artworkCount = 0;

    constructor() public {
    }

    modifier inDonationLimit(address artworkId,uint amount)
    {
        uint min = artworks[artworkId].averageDonation - 5;
        uint max = artworks[artworkId].averageDonation + 5;
        if(min < 1)
            min = 1;
        if(max < 0) // Prevent Overflow
            max = 1000;
        require(amount > min && amount < max, "Donation amount should be in the limits of average artwork donation.");
        _;
    }


    function donate(address receiver, uint amount) 
        payable 
        public 
        inDonationLimit(receiver,amount)
    {

        emit Donated();
    }

}