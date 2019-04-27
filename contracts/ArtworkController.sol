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
        uint uploadDate;
        uint transferLimit;
        uint avgTransfer;
        uint transferSum;
        uint transferCount;
        bool staticFee;
    }

    mapping(string => Artwork) private artworks;
    string[] public artworkHashes;

    constructor() public {
    }

    modifier artworkExists(string memory imageHash)
    {
        require(artworks[imageHash].owner != address(0),"Artwork does not exist.");
        _;
    }

    modifier artworkNotExists(string memory imageHash)
    {
        require(artworks[imageHash].owner == address(0),"Artwork already exists.");
        _;
    }

    modifier artworkLimitAvailable(string memory imageHash)
    {
        require(artworks[imageHash].transferLimit > 0, "Artwork Limit is reached");
        _;
    }

    modifier inDonationLimit(string memory imageHash,uint amount)
    {
        uint avgTransfer = artworks[imageHash].avgTransfer;
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

    modifier onlyOwner(string memory imageHash, address sender)
    {
        require(sender == artworks[imageHash].owner, "Only artwork owner can delete the image");
        _;
    }

    function addArtwork(string memory imageHash,bytes32 imageName,bytes16 imageAuthor,string memory imageDescription,uint imageUploadDate,uint imageTransferLimit)
        public
        artworkNotExists(imageHash)
    {
        if(imageTransferLimit == 0)
            imageTransferLimit = ~uint32(0); // Infinite transfer limit if 0

        artworks[imageHash] = Artwork(msg.sender,imageName,imageAuthor,imageDescription,imageUploadDate,imageTransferLimit,0,0,0,false);
        artworkHashes.push(imageHash);
        emit ArtworkSubscribed();
    }

    function deleteArtwork(string memory imageHash)
        public
        onlyOwner(imageHash,msg.sender)
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

    function getArtworkDetails(string memory imageHash)
        public
        view
        artworkExists(imageHash)
        returns(bytes32,bytes16,string memory,uint,uint,uint,uint)
    {
        return (artworks[imageHash].imageName,
                artworks[imageHash].imageAuthor,
                artworks[imageHash].imageDescription,
                artworks[imageHash].uploadDate,
                artworks[imageHash].transferLimit,
                artworks[imageHash].avgTransfer,
                artworks[imageHash].transferCount);
    }  

    function license(string memory imageHash) 
        public 
        payable 
        artworkExists(imageHash)
        differentPerson(msg.sender,artworks[imageHash].owner)
        artworkLimitAvailable(imageHash)
        // inDonationLimit(artworkId,msg.value)
    {
        assert(msg.value > 0);
        assert(msg.value <= address(this).balance);

        Artwork storage artwork = artworks[imageHash];
        artwork.owner.transfer(msg.value);
        artwork.transferSum += msg.value;
        artwork.transferCount++;
        artwork.transferLimit--;
        artwork.avgTransfer = artwork.transferSum / artwork.transferCount;
        emit ArtworkLicensed();
    }

}