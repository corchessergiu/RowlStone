### Prerequisites
* npm 10.5
* node v20+  -> [nvm use 20]

### Execute all the commands below in the root directory!
### Steps

1. Installing dependencies
 `npm install` 

2. Compiling smart contract
`npx hardhat compile`

3. Running tests
`npx hardhat test`

![test](https://github.com/corchessergiu/Rowlstone/assets/61419684/d2d3ee01-8992-4845-8d62-53961123e872)

5. Running coverage
`npx hardhat coverage`
![coverage](https://github.com/corchessergiu/Rowlstone/assets/61419684/23d0ddab-7ca9-4767-b0d1-ba9ca1dda35e)

6. Running solhint
`npm run solhint`
![solhint](https://github.com/corchessergiu/Rowlstone/assets/61419684/342eaf7b-f57b-4beb-9803-69c070bc27d7)

7. Running deploy script
`npx hardhat ignition deploy ./ignition/modules/deploy.js --network hardhat` 
![deploy](https://github.com/corchessergiu/Rowlstone/assets/61419684/0dd6d192-cefb-4a68-877f-f8a5601a2283)

8. Running script for contract interactions
`npx hardhat run scripts/contract-interaction.js --network hardhat` 
![scriptRun](https://github.com/corchessergiu/Rowlstone/assets/61419684/fabfdfeb-d268-4369-94cf-cccdbd816ee3)
