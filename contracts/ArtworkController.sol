pragma solidity ^0.5;
pragma experimental ABIEncoderV2;

contract ArtworkController {

    event ArtworkLicensed();
    event ArtworkSubscribed();
    
    struct Artwork {
        address payable owner;
        bytes32 imageName;
        bytes16 imageAuthor;
        string imageDescription;
        bool flexPayment;
        uint avgTransfer;
        uint transferSum;
        uint transferCount;
    }

    mapping(string => Artwork) private artworks;
    string[] public artworkHashes;

    constructor() public {
    }

    modifier artworkExists(string memory artworkHash)
    {
        require(artworks[artworkHash].owner != address(0),"Artwork does not exist.");
        _;
    }

    modifier artworkNotExists(string memory artworkHash)
    {
        require(artworks[artworkHash].owner == address(0),"Artwork already exists.");
        _;
    }

    modifier inDonationLimit(string memory artworkHash,uint amount)
    {
        uint avgTransfer = artworks[artworkHash].avgTransfer;
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

    modifier onlyOwner(string memory artworkHash, address sender)
    {
        require(sender == artworks[artworkHash].owner, "Only artwork owner can delete the image");
        _;
    }

    function addArtwork(string memory artworkHash,bytes32 imageName,bytes16 imageAuthor,string memory imageDescription)
        public
        artworkNotExists(artworkHash)
    {
        artworks[artworkHash] = Artwork(msg.sender,imageName,imageAuthor,imageDescription,false,0,0,0);
        artworkHashes.push(artworkHash);
        emit ArtworkSubscribed();
    }

    function deleteArtwork(string memory artworkHash)
        public
        onlyOwner(artworkHash,msg.sender)
    {
    }

    function getArtworks() view public returns(string[] memory) {
        return artworkHashes;
    }

    function getArtworksLength() view public returns (uint) {
        return artworkHashes.length;
    }

    function getArtworkDetails(string memory artworkHash)
        public
        view
        artworkExists(artworkHash)
        returns(bytes32,bytes16,string memory,bool,uint,uint)
    {
        return (artworks[artworkHash].imageName,artworks[artworkHash].imageAuthor,artworks[artworkHash].imageDescription,artworks[artworkHash].flexPayment,artworks[artworkHash].avgTransfer,artworks[artworkHash].transferCount);
    }  

    function license(string memory artworkHash) 
        public 
        payable 
        artworkExists(artworkHash)
        // inDonationLimit(artworkId,msg.value)
        differentPerson(msg.sender,artworks[artworkHash].owner)
    {
        assert(msg.value > 0);
        assert(msg.value <= address(this).balance);

        Artwork storage artwork = artworks[artworkHash];
        artwork.owner.transfer(msg.value);
        artwork.transferSum += msg.value;
        artwork.transferCount++;
        artwork.avgTransfer = artwork.transferSum / artwork.transferCount;
        emit ArtworkLicensed();
    }

}