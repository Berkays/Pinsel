pragma solidity ^0.5;

contract ArtworkController {

    event ArtworkLicensed();
    event ArtworkSubscribed();
    
    struct Artwork {
        address hash;
        address payable owner;
        string imageName;
        bool flexPayment;
        uint avgTransfer;
        uint transferSum;
        uint transferCount;
    }

    mapping(uint => Artwork) public artworks;
    uint private artworkCount = 0;

    constructor() public {
    }

    modifier artworkExists(uint artworkId)
    {
        require(artworks[artworkId].owner != address(0),"Artwork does not exist.");
        _;
    }

    modifier artworkNotExists(uint artworkId)
    {
        require(artworks[artworkId].owner == address(0),"Artwork already exists.");
        _;
    }

    modifier inDonationLimit(uint artworkId,uint amount)
    {
        uint avgTransfer = artworks[artworkId].avgTransfer;
        // int min = int(avgTransfer) - 5;
        uint max = avgTransfer + 5;
        // if(min < 1) // uint overflow
        // {
        //     min = 1;
        // }
        if(max < 0) // Prevent Overflow
        {   
            max = 1000;
        }
        require(amount > 0 && amount < max, "Donation amount should be in the limits of average artwork donation.");
        _;
    }

    modifier differentPerson(address sender,address receiver)
    {
        require(sender != receiver, "Sender and receiver cannot be the same account");
        _;
    }

    function addArtwork(string memory imageName)
        public
        artworkNotExists(artworkCount)
    {
        artworks[artworkCount] = Artwork(msg.sender,msg.sender,imageName,false,0,0,0);
        artworkCount++;
        emit ArtworkSubscribed();
    }

    // function getArtworkDetails() 
    //     public
    //     view
    // {
         
    // }

    function license(uint artworkId) 
        public 
        payable 
        artworkExists(artworkId)
        // inDonationLimit(artworkId,msg.value)
        differentPerson(msg.sender,artworks[artworkId].owner)
    {
        assert(msg.value > 0);
        assert(msg.value <= address(this).balance);

        Artwork storage artwork = artworks[artworkId];
        artwork.owner.transfer(msg.value);
        artwork.transferSum += msg.value;
        artwork.transferCount++;
        artwork.avgTransfer = artwork.transferSum / artwork.transferCount;
        emit ArtworkLicensed();
    }

}