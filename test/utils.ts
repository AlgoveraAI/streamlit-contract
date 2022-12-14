const { ethers } = require("hardhat");
const {
  getSignatureAccess,
  getSignatureCommunity,
} = require("../scripts/utils");
const { Signer, Contract } = require("ethers");

export async function getContract(contractName: string) {
  let constructorArgs: string[] = [];
  if (contractName === "Access") {
    constructorArgs = ["Access", "ACCESS"];
  }
  const Contract = await ethers.getContractFactory(contractName);
  const contract = await Contract.deploy(...constructorArgs);
  //   const contract = await Contract.deploy(...constructorArgs);
  await contract.deployed();
  return contract;
}
