pragma solidity ^0.5;
pragma experimental ABIEncoderV2;

contract AccountController {

    // Holds IPFS Hash of owned images
    mapping(address => string[]) private ownedItems;

    constructor() public {
    }

    // Compare two strings
    function strcmp(string memory a, string memory b) 
        public 
        pure 
        returns (bool)
    {
        return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
    }

    modifier notOwned(string memory imageHash,address sender)
    {
        bool isOwned = false;
        for(uint i = 0;i<ownedItems[sender].length;i++)
        {
            if(strcmp(ownedItems[sender][i],imageHash))
            {
                isOwned = true;
                break;
            }
        }
        require(isOwned == false,"Artwork is already owned.");
        _;
    }

    function getOwnedArtworks() 
    view 
    public
    returns(string[] memory) {
        return ownedItems[msg.sender];
    }

    function getOwnedArtworksCount() 
    view 
    public 
    returns (uint) {
        return ownedItems[msg.sender].length;
    }

    function ownArtwork(string memory imageHash,address sender)
    public
    notOwned(imageHash,sender)
    {
        ownedItems[sender].push(imageHash);
    }
}