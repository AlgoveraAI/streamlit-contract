import { ethers } from "ethers";
import { getContract } from "./utils";
const hre = require("hardhat");

/*
npx hardhat run scripts/createToken.ts --network maticmum
*/

const price = 1;
const uri =
  "https://gateway.pinata.cloud/ipfs/QmZrFfBGmUmXYUVeTrKdKC1aFeBBEEXQPGhsJtX45GwCC5";
const supply = 1000;

async function main() {
  // get the contract
  const chainId = await hre.getChainId();
  const network = hre.network.name;
  console.log("network:", network, "chainId:", chainId);
  let { contract, provider } = await getContract("Access", network);

  // estimate the gas required
  const methodSignature = await contract.interface.encodeFunctionData(
    "createToken",
    [price, uri, supply]
  );
  const owner = await contract.owner();
  const tx = {
    to: contract.address,
    value: 0,
    data: methodSignature,
    from: owner,
  };
  const gasEstimate = await provider.estimateGas(tx);

  // send the transaction to transfer ownership
  const txnReceipt = await contract.createToken(price, uri, supply, {
    from: owner,
    value: 0,
    gasLimit: gasEstimate,
  });

  console.log("txn pending", txnReceipt["hash"]);

  // await the txn
  const receipt = await txnReceipt.wait();
  console.log("executed");
  console.log(receipt);
  const tokenId = parseInt(receipt.events[0].data, 16);
  console.log("tokenId", tokenId);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
