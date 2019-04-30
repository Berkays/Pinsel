pragma solidity ^0.5;
pragma experimental ABIEncoderV2; // Don't use in production

import "./AccountController.sol";

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
    AccountController accountController;

    address payable public pinselAdmin;
    
    using IpfsHash for IpfsHash.Hash;

    event ArtworkLicensed();
    event ArtworkSubscribed();
    
    uint constant ones = ~uint32(0);
    uint constant detailClear = ~uint(0) << 128;

    struct Artwork {
        address payable owner;
        bytes32 imageName;
        bytes16 imageAuthor;
        string imageDescription;
        uint uploadDate;
        ArtworkDetails details;
    }

    struct ArtworkDetails {
        uint fee;
        uint avgTransfer;
        uint transferLimit;
        uint transferCount;
    }

    mapping(string => Artwork) private artworks;
    string[] public artworkHashes;

    constructor(address accountControllerContractAddress,address payable _pinselAdmin) public {
        accountController = AccountController(accountControllerContractAddress);
        pinselAdmin = _pinselAdmin;
    }

    modifier onlyAdmin(address sender)
    {
        require(sender == pinselAdmin, "Only admin can withdraw");
        _;
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
        require(artworks[imageHash].details.transferLimit > 0, "Artwork Limit is reached");
        _;
    }

    modifier inDonationLimit(string memory imageHash,uint amount)
    {
        uint avgTransfer = artworks[imageHash].details.avgTransfer;
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

    modifier valueMeetsfee(string memory imageHash,uint amount)
    {
        uint fee = artworks[imageHash].details.fee;
        require(fee == 0 || fee == amount,"Given value does not meet artwork fee.");
        _;
    }

    modifier differentPerson(address sender,string memory imageHash)
    {
        require(sender != artworks[imageHash].owner, "Sender and receiver cannot be the same account");
        _;
    }

    modifier onlyOwner(string memory imageHash, address sender)
    {
        require(sender == artworks[imageHash].owner, "Only artwork owner can delete the image");
        _;
    }

    function addArtwork(string memory imageHash,bytes32 imageName,bytes16 imageAuthor,string memory imageDescription,uint imageUploadDate,uint imageTransferLimit,uint imageFee)
        public
        artworkNotExists(imageHash)
    {
        if(imageTransferLimit == 0)
            imageTransferLimit = ones; // Infinite transfer limit if 0

        ArtworkDetails memory details = ArtworkDetails(imageFee,0,imageTransferLimit,0);
        artworks[imageHash] = Artwork(msg.sender,imageName,imageAuthor,imageDescription,imageUploadDate,details);
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
        returns(bytes32,bytes16,string memory,uint,ArtworkDetails memory)
    {
        return (artworks[imageHash].imageName,
                artworks[imageHash].imageAuthor,
                artworks[imageHash].imageDescription,
                artworks[imageHash].uploadDate,
                artworks[imageHash].details);
    }  

    function license(string memory imageHash) 
        public 
        payable 
        differentPerson(msg.sender,imageHash)
        artworkExists(imageHash)
        artworkLimitAvailable(imageHash)
        valueMeetsfee(imageHash,msg.value)
        // inDonationLimit(artworkId,msg.value)
    {
        assert(msg.value > 0);
        assert(msg.value <= address(this).balance);

        accountController.ownArtwork(imageHash,msg.sender);

        Artwork storage artwork = artworks[imageHash];
        artwork.owner.transfer(msg.value);

        artwork.details.avgTransfer = ((artwork.details.avgTransfer * artwork.details.transferCount) + msg.value) / (artwork.details.transferCount + 1);
        artwork.details.transferCount++;
        artwork.details.transferLimit--;

        emit ArtworkLicensed();
    }

    function withdraw()
        public
        onlyAdmin(msg.sender)
    {
        pinselAdmin.transfer(address(this).balance);
    }
}