## Getting started

### Deploy
```
npx hardhat deploy --network maticmum
```

### Verify the deployment (optional)
*This lets you view the contract on polyscan.com and read in values like tokenURIs*
```
npx hardhat verify CONTRACT_ADDRESS --network maticmum --constructor-args arguments.js
```

### Create a token
```
npx hardhat run scripts/createToken.ts --network maticmum
```

### Mint a token
```
npx hardhat run scripts/mint.ts --network maticmum
```
