const { ethers } = require("hardhat");
const { expect } = require("chai");
import { getContract } from "./utils";

describe("Access minting fail cases", function () {
  it("Fails to mint if uri not set", async function () {
    const contract = await getContract("Access");
    const tokenId = 0;
    const mintPrice = ethers.utils.parseEther("0.1");
    await contract.setTokenPrice(tokenId, mintPrice);
    await contract.toggleMintingActive(tokenId);

    await expect(
      contract.mint(tokenId, { value: mintPrice })
    ).to.be.revertedWith("URI not set");
  });
  it("Fails to mint if minting not active", async function () {
    const contract = await getContract("Access");
    const tokenId = 0;
    const mintPrice = ethers.utils.parseEther("0.1");
    await contract.setTokenPrice(tokenId, mintPrice);
    await contract.setTokenURI(tokenId, "ipfs://test");
    await expect(
      contract.mint(tokenId, { value: mintPrice })
    ).to.be.revertedWith("Minting not active");
  });
  it("Fails to mint with incorrect price (unsigned)", async function () {
    const contract = await getContract("Access");
    const tokenId = 0;
    const mintPrice = ethers.utils.parseEther("0.1");
    await contract.setTokenPrice(tokenId, mintPrice);
    await contract.setTokenURI(tokenId, "ipfs://test");
    await contract.toggleMintingActive(tokenId);
    await expect(
      contract.mint(tokenId, { value: mintPrice.sub(1) })
    ).to.be.revertedWith("Incorrect value");
  });

  it("Fails to mint multiple tokens", async function () {
    const contract = await getContract("Access");
    const tokenId = 0;
    const mintPrice = ethers.utils.parseEther("0.1");
    await contract.setTokenPrice(tokenId, mintPrice);
    await contract.setTokenURI(tokenId, "ipfs://test");
    await contract.toggleMintingActive(tokenId);
    await contract.mint(tokenId, { value: mintPrice });
    // try to mint again
    await expect(
      contract.mint(tokenId, { value: mintPrice })
    ).to.be.revertedWith("Already minted");
  });
  it("Fails once exceed max supply", async function () {
    const contract = await getContract("Access");
    const tokenId = 0;
    const mintPrice = ethers.utils.parseEther("0.1");
    await contract.setTokenPrice(tokenId, mintPrice);
    await contract.setTokenURI(tokenId, "ipfs://test");
    await contract.toggleMintingActive(tokenId);
    const owner = await contract.owner();
    await contract.addSigner(owner);
    // set the max supply
    await contract.setMaxSupply(tokenId, 1);
    await contract.mint(tokenId, { value: mintPrice });
    // get someone else to mint
    const signer = await ethers.getSigner(1);
    await expect(
      contract.connect(signer).mint(tokenId, { value: mintPrice })
    ).to.be.revertedWith("Max supply reached");
  });
});

describe("Access minting success cases", function () {
  it("Unsigned mint", async function () {
    const contract = await getContract("Access");
    const tokenId = 0;
    const mintPrice = ethers.utils.parseEther("0.1");
    await contract.setTokenPrice(tokenId, mintPrice);
    await contract.setTokenURI(tokenId, "ipfs://test");
    await contract.toggleMintingActive(tokenId);
    await contract.mint(tokenId, { value: mintPrice });
    console.log("Checking balance");
    const signerBalance = await contract.balanceOf(
      await contract.owner(),
      tokenId
    );
    await expect(signerBalance).to.equal(1);
  });
});

describe("Access transfers", function () {});

describe("Access utils", function () {
  it("Sets URI", async function () {
    const contract = await getContract("Access");
    const uri = "ipfs://test";
    await contract.setTokenURI(0, uri);
    const tokenURI = await contract.uri(0);
    console.log("tokenURI: ", tokenURI);
    expect(tokenURI).to.equal(uri);
  });
  it("Sets a price", async function () {
    const contract = await getContract("Access");
    const tokenId = 0;
    const mintPrice = ethers.utils.parseEther("0.1");
    await contract.setTokenPrice(tokenId, mintPrice);
    const tokenPrice = await contract.tokenPrices(tokenId);
    console.log("tokenPrice: ", tokenPrice);
    expect(tokenPrice).to.equal(mintPrice);
  });
  it("Toggles mintingActive", async function () {
    const contract = await getContract("Access");
    await contract.toggleMintingActive(0);
    const mintingActive = await contract.mintingActive(0);
    console.log("mintingActive: ", mintingActive);
    expect(mintingActive).to.equal(true);
  });
  it("Sets max token supply", async function () {
    const contract = await getContract("Access");
    const desiredMaxSupply = 10;
    await contract.setMaxSupply(0, desiredMaxSupply);
    const maxSupply = await contract.maxSupply(0);
    expect(maxSupply).to.equal(desiredMaxSupply);
  });
  it("Withdraws ETH", async function () {
    const contract = await getContract("Access");
    // mint a token at a price of 0.1 E
    const tokenId = 0;
    const mintPrice = ethers.utils.parseEther("0.1");
    await contract.setTokenPrice(tokenId, mintPrice);
    await contract.setTokenURI(tokenId, "ipfs://test");
    await contract.toggleMintingActive(tokenId);
    const owner = await contract.owner();

    await contract.mint(tokenId, { value: mintPrice });
    // check initial contract balance
    const initialContractBalance = await ethers.provider.getBalance(
      contract.address
    );
    await expect(initialContractBalance).to.equal(mintPrice);

    // get initial owner balance
    const initialOwnerBalance = await ethers.provider.getBalance(owner);
    // withdraw the funds
    await contract.withdrawETH();
    // check contract balance
    const finalContractBalance = await ethers.provider.getBalance(
      contract.address
    );
    expect(finalContractBalance).to.equal(0);
    // check owner balance diff
    const finalOwnerBalance = await ethers.provider.getBalance(owner);
    const diff = finalOwnerBalance.sub(initialOwnerBalance);
    // should have gained the mintPrice (approx - gas fees)
    const estGas = ethers.utils.parseEther("0.005");
    expect(diff).to.be.closeTo(mintPrice, estGas);
    // confirm its gt original bal for sanity
    expect(finalOwnerBalance).to.be.gt(initialOwnerBalance);
  });
  it("Fails to withdraw ETH if not owner", async function () {
    const contract = await getContract("Access");
    // get signers
    const signers = await ethers.getSigners();
    const signer = signers[1]; // not the ower
    await expect(signer.address).to.not.equal(await contract.owner());
    // attempt to withdraw
    await expect(contract.connect(signer).withdrawETH()).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );
  });
});
