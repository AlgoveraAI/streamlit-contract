// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Access is ERC1155, Ownable, ReentrancyGuard{
    mapping(uint256 => string) public tokenURIs;
    mapping(uint256 => uint256) public tokenPrices;
    mapping(uint256 => bool) public mintingActive;
    mapping(uint256 => uint256) public maxSupply;
    mapping(uint256 => uint256) public totalSupply;
    // store mapping of addresses who create new tokens (ie app developers) 
    // this can control who can upgrade token info (e.g. price)
    // and where funds are distributed
    mapping(uint256 => address) public creatorAddresses; 

    uint256 public nextTokenId = 0;

    string public name;
    string public symbol;

    event TokenCreated(uint256 tokenId);

     constructor(
        string memory _name,
        string memory _symbol
    ) ERC1155("") {
        name = _name;
        symbol = _symbol;
    }

    /** @dev Mint a particular tokenId 
     */
    function mint(uint256 tokenId)
        public
        payable
        nonReentrant
    {
        // needs metadata, a price, and active minting
        require(bytes(tokenURIs[tokenId]).length > 0, "URI not set");
        require(mintingActive[tokenId], "Minting not active");

        // check the balance (wallets can only use one nft - prevent double minting)
        require(balanceOf(msg.sender, tokenId) == 0, "Already minted");

        // check that a payee address is set
        require(creatorAddresses[tokenId] != address(0), "Payee address not set");

        // check max supply (if set)
        if (maxSupply[tokenId] > 0) {
            require(totalSupply[tokenId] < maxSupply[tokenId], "Max supply reached");
        }

        // check price
        require(msg.value == tokenPrices[tokenId], "Incorrect value");

        // distribute funds - TODO set this as a percentage
        (bool success, ) = payable(creatorAddresses[tokenId]).call{value: msg.value}("");

        // mint
        totalSupply[tokenId] += 1;
        _mint(msg.sender, tokenId, 1, "");
    }

    function createToken(uint256 price, string memory _uri, uint256 supply) public {
        // TODO do we charge developers a fee to create an access token?
        uint256 tokenId = nextTokenId;
        tokenPrices[nextTokenId] = price; // set the price
        tokenURIs[nextTokenId] = _uri; // set the uri (metadata)
        maxSupply[nextTokenId] = supply; // set the max supply
        creatorAddresses[nextTokenId] = msg.sender; // set the payee address
        mintingActive[nextTokenId] = true; // turn minting on
        nextTokenId += 1; // increment the token id
        // emit the tokenId as a log
        emit TokenCreated(tokenId);
    }

    /** @dev Return the URI for a token
     */
    function uri(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        return tokenURIs[tokenId];
    }

    /** @dev Set a price for a token
     */
    function setTokenPrice(uint256 tokenId, uint256 price) public {
        // require that the caller is the creator of the token
        require(creatorAddresses[tokenId] == msg.sender, "Only creator can set price");
        tokenPrices[tokenId] = price;
    }

    /** @dev Set the metadata for a token
     * @param tokenId The token ID
     * @param _uri The metadata uri (e.g. ipfs://...)
     */
    function setTokenURI(uint256 tokenId, string memory _uri) public {
        // require that the caller is the creator of the token
        require(creatorAddresses[tokenId] == msg.sender, "Only creator can set URI");
        tokenURIs[tokenId] = _uri;
    }

    /** @dev Set the minting active flag
     */
    function toggleMintingActive(uint256 tokenId) public onlyOwner {
        // require that the caller is the creator of the token
        require(creatorAddresses[tokenId] == msg.sender, "Only creator can toggle minting");
        mintingActive[tokenId] = !mintingActive[tokenId];
    }

    /** @dev Set token's max supply */
    function setMaxSupply(uint256 tokenId, uint256 supply) public onlyOwner {
        // require that the caller is the creator of the token
        require(creatorAddresses[tokenId] == msg.sender, "Only creator can set max supply");
        maxSupply[tokenId] = supply;
    }

    /**
     * @dev Withdraw ether to owner's wallet
     */
    function withdrawETH() public onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = payable(msg.sender).call{value: balance}("");
        require(success, "Withdraw failed");
    }
}
