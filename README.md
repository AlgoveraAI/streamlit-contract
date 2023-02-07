## Getting started

### Deploy
```
npx hardhar deploy --network maticmum
```

### Verify the deployment (optional)
*This lets you view the contract on polyscan.com and read in values like tokenURIs*
```
npx hardhat verify CONTRACT_ADDRESS --network maticmum --constructor-args arguments.js
```

### Createa a token
```
npx hardhat run scripts/createToken.ts --network maticmum
```

### Mint a token
```
npx hardhat run scripts/mint.ts --network maticmum
```