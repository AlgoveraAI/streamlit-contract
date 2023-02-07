import { config as dotenvConfig } from "dotenv";
import { resolve } from "path";
const hre = require("hardhat");
const { ethers } = hre;
const { defaultAbiCoder } = ethers.utils;

dotenvConfig({ path: resolve(__dirname, "../.env") });

const alchemyKey: string | undefined = process.env.ALCHEMY_KEY;
if (!alchemyKey) {
  throw new Error("Please set your ALCHEMY_KEY in a .env file");
}

export async function getContract(contractName: string, network: string) {
  // find the contract address created at the last run of hardhat deploy
  // requires that contract was deployed with `npx hardhat deploy --write-true`
  const deployment = require(`../deployments/${network}/${contractName}.json`);
  if (!deployment)
    // did you run hardhat deploy with the export-all flag?
    throw `No deployment found for ${contractName} on ${network}`;

  const address = deployment.address;

  // load the contract via ethers.js
  const Contract = await hre.ethers.getContractFactory(contractName);
  if (!Contract || Contract === undefined) {
    throw new Error("Error: could not load contract factory"); // check the name ^
  }
  const contract = await Contract.attach(address);

  // get a provider for estimating gas
  const provider = new hre.ethers.providers.AlchemyProvider(
    network,
    alchemyKey
  );

  console.log("got contract on", network, contract.address);

  return { contract, provider };
}
