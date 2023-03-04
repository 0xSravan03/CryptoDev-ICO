// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ICryptoDevsNFT.sol";

contract CryptoDevToken is ERC20, Ownable {
    uint256 public maxSupply;
    uint256 public constant TOKEN_PRICE = 0.0001 ether;

    // If caller holding CryptoDevs NFT, He can claim this much amount of Coins for free.(but still needs to pay for gas)
    uint256 public constant CLAIM_AMOUNT_PER_NFT = 10 * (10 ** 18);
    mapping(address => bool) public tokenClaimed;

    ICryptoDevsNFT public CryptoDevsNFT;

    constructor(
        uint256 _maxSupply,
        address _CryptoDevsNFT
    ) ERC20("CryptoDev Token", "CD") {
        maxSupply = _maxSupply * (10 ** decimals());
        CryptoDevsNFT = ICryptoDevsNFT(_CryptoDevsNFT);
    }

    receive() external payable {}

    fallback() external payable {}

    // Mint
    function mint(uint256 _amount) public payable {
        uint256 _requiredAmt = TOKEN_PRICE * _amount;
        require(msg.value == _requiredAmt, "Insufficient Balance");
        uint256 _amountToMint = _amount * (10 ** decimals());
        require(
            totalSupply() + _amountToMint <= maxSupply,
            "Exceeds Max Supply"
        );
        _mint(msg.sender, _amountToMint);
    }

    // claim
    function claim() external {
        uint256 _nftAmount = CryptoDevsNFT.balanceOf(msg.sender);
        require(_nftAmount > 0, "You are not owning any NFTs");
        require(!tokenClaimed[msg.sender], "You have already Claimed");

        _mint(msg.sender, _nftAmount * CLAIM_AMOUNT_PER_NFT);
        tokenClaimed[msg.sender] = true;
    }

    // Withdraw
    function withdraw() external onlyOwner {
        require(address(this).balance > 0, "No funds to Whitdraw");
        (bool sent, ) = payable(owner()).call{value: address(this).balance}("");
        require(sent, "Transaction Failed");
    }
}
