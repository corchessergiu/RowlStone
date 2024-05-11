### Execute all the commands below in the root directory!
### Steps

1. Installing dependencies
 `npm install` 

2. Compiling smart contract
`npx hardhat compile`

3. Running tests
`npx hardhat test` 

![test](https://github.com/corchessergiu/Rowlstone/assets/61419684/d2d3ee01-8992-4845-8d62-53961123e872)

4. Running coverage
`npx hardhat coverage`

5. Running solhint
`npm run solhint` 
6. Running deploy script
`npx hardhat ignition deploy ./ignition/modules/deploy.js --network hardhat` 

7. Running script for contract interactions
`npx hardhat run scripts/contract-interaction.js --network hardhat` 
