pragma solidity ^0.5;
pragma experimental ABIEncoderV2; // Don't use in production

// Library for IPFS Hash
// IPFS hashes take 46 bytes of space.
library IpfsHash {
    struct Hash {
        bytes32 fHash;
        bytes12 sHash;
    }

    function getHash(Hash memory h)
    pure
    public
    returns(bytes32,bytes12)
    {
        return (h.fHash,h.sHash);
    }
}


contract ArtworkController {
    using IpfsHash for IpfsHash.Hash;

    event ArtworkLicensed();
    event ArtworkSubscribed();
    
    struct Artwork {
        address payable owner;
        bytes32 imageName;
        bytes16 imageAuthor;
        string imageDescription;
        uint32 transferLimit;
        uint avgTransfer;
        uint transferSum;
        uint transferCount;
        bool flexPayment;
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

    modifier artworkLimitAvailable(string memory artworkHash)
    {
        require(artworks[artworkHash].transferLimit > 0, "Artwork Limit is reached");
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

    function addArtwork(string memory artworkHash,bytes32 imageName,bytes16 imageAuthor,string memory imageDescription,uint32 artTransferLimit)
        public
        artworkNotExists(artworkHash)
    {
        if(artTransferLimit == 0)
            artTransferLimit = ~uint32(0); // Infinite transfer limit if 0

        artworks[artworkHash] = Artwork(msg.sender,imageName,imageAuthor,imageDescription,artTransferLimit,0,0,0,false);
        artworkHashes.push(artworkHash);
        emit ArtworkSubscribed();
    }

    function deleteArtwork(string memory artworkHash)
        public
        onlyOwner(artworkHash,msg.sender)
    {
    }

    function getArtworks() 
        view 
        public 
        returns(string[] memory) 
    {
        return artworkHashes;
    }

    function getArtworksLength() 
        view 
        public 
        returns (uint) 
    {
        return artworkHashes.length;
    }

    function getArtworkDetails(string memory artworkHash)
        public
        view
        artworkExists(artworkHash)
        returns(bytes32,bytes16,string memory,uint32,uint,uint,bool)
    {
        return (artworks[artworkHash].imageName,artworks[artworkHash].imageAuthor,artworks[artworkHash].imageDescription,
                artworks[artworkHash].transferLimit,artworks[artworkHash].avgTransfer,
                artworks[artworkHash].transferCount,artworks[artworkHash].flexPayment);
    }  

    function license(string memory artworkHash) 
        public 
        payable 
        artworkExists(artworkHash)
        differentPerson(msg.sender,artworks[artworkHash].owner)
        artworkLimitAvailable(artworkHash)
        // inDonationLimit(artworkId,msg.value)
    {
        assert(msg.value > 0);
        assert(msg.value <= address(this).balance);

        Artwork storage artwork = artworks[artworkHash];
        artwork.owner.transfer(msg.value);
        artwork.transferSum += msg.value;
        artwork.transferCount++;
        artwork.transferLimit--;
        artwork.avgTransfer = artwork.transferSum / artwork.transferCount;
        emit ArtworkLicensed();
    }

}