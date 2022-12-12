import { HardhatRuntimeEnvironment } from "hardhat/types";

// npx hardhat deploy --network goerli --write true --tags access --export-all deployments.json

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  console.log("Deployer: ", deployer);
  console.log("Network:", hre.network.name);

  // const SignatureChecker = await deploy("SignatureChecker", {
  //   from: deployer,
  //   log: true,
  // });
  // await sleep(10000); // let the tx propagate to prevent nonce reuse

  /// Deploy the contract
  const name = "Access";
  const symbol = "ACCESS";
  await deploy("Access", {
    from: deployer,
    args: [name, symbol],
    log: true,
    libraries: {
      // SignatureChecker: SignatureChecker.address,
    },
  });
};

module.exports.tags = ["access"];

// verify
// npx hardhat verify 0xa20EC3F0e1f5984a87360EC43E9ac6db34a3b71c --network mainnet --constructor-args arguments.js
