import "hardhat-gas-reporter";
import "hardhat-deploy";
import "@nomicfoundation/hardhat-toolbox";
import "solidity-coverage";
import { HardhatUserConfig } from "hardhat/config";
import { NetworkUserConfig } from "hardhat/types";
import { resolve } from "path";
import { config as dotenvConfig } from "dotenv";

dotenvConfig({ path: resolve(__dirname, "./.env") });

// Ensure that we have all the environment variables we need.
const mnemonic: string | undefined = process.env.MNEMONIC;
if (!mnemonic) {
  throw new Error("Please set your MNEMONIC in a .env file");
}
const alchemyKey: string | undefined = process.env.ALCHEMY_KEY;
if (!alchemyKey) {
  throw new Error("Please set your ALCHEMY_KEY in a .env file");
}

const chainIds = {
  hardhat: 31337,
  mainnet: 1,
  goerli: 5,
};

function getChainConfig(network: keyof typeof chainIds): NetworkUserConfig {
  const url: string =
    "https://eth-" + network + ".alchemyapi.io/v2/" + alchemyKey;
  return {
    accounts: { mnemonic },
    chainId: chainIds[network],
    url: url,
  };
}

const config: HardhatUserConfig = {
  networks: {
    mainnet: {
      ...getChainConfig("mainnet"),
    },
    hardhat: {
      accounts: { mnemonic },
    },
    goerli: {
      ...getChainConfig("goerli"),
    },
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
  },
  namedAccounts: {
    deployer: 0,
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};

export default config;
