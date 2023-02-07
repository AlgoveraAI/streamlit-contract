import { ethers } from "ethers";
import { getContract } from "./utils";
const hre = require("hardhat");

/*
npx hardhat run scripts/mint.ts --network maticmum
*/

const tokenId = 0;

async function main() {
  // get the contract
  const chainId = await hre.getChainId();
  const network = hre.network.name;
  console.log("network:", network, "chainId:", chainId);
  let { contract, provider } = await getContract("Access", network);

  // check the price
  const price = await contract.tokenPrices(tokenId);
  console.log("configured price", price);

  // check the uri
  const uri = await contract.tokenURIs(tokenId);
  console.log("configured uri", uri);

  // estimate the gas required
  const methodSignature = await contract.interface.encodeFunctionData("mint", [
    tokenId,
  ]);
  const owner = await contract.owner();
  const tx = {
    to: contract.address,
    value: price,
    data: methodSignature,
    from: owner,
  };
  const gasEstimate = await provider.estimateGas(tx);

  // send the transaction to transfer ownership
  const txnReceipt = await contract.mint(tokenId, {
    from: owner,
    value: price,
    gasLimit: gasEstimate,
  });

  console.log("txn pending", txnReceipt["hash"]);

  // await the txn
  const receipt = await txnReceipt.wait();
  console.log("minted!");
  // console.log(receipt);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
