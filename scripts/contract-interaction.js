const hre = require("hardhat");

async function main() {
  try {
    [deployer, add1, add2, add3] = await ethers.getSigners();
    const MediaAssetOwnershipContract = await hre.ethers.getContractFactory(
      "MediaAssetOwnership"
    );
    const contract = await MediaAssetOwnershipContract.deploy();
    await contract.waitForDeployment();
    
    let contractAddress = await contract.getAddress();
    console.log(`MediaAssetOwnership deployed to: ${contractAddress}`);

    let metadataExemple = {
      name: "Example NFT",
      description: "This is an example of an NFT metadata file stored on IPFS.",
      image: "ipfs://QmTzQ1gY5DJzRRT6t8i5TSz4E2WV1fyCJo2gDGGQNcKsP7",
      attributes: [
        {
          trait_type: "Background",
          value: "Blue",
        },
        {
          trait_type: "Eyes",
          value: "Green",
        },
        {
          trait_type: "Mouth",
          value: "Smile",
        },
        {
          trait_type: "Hat",
          value: "Cap",
        },
      ],
    };

    console.log("Register an asset:");
    console.log(
      "Global counter before asset registration:",
      Number(await contract.assetGlobalCounter())
    );
    await contract.registerAsset(
      "ipfs://QmTzQ1gY5DJzRRT6t8i5TSz4E2WV1fyCJo2gDGGQNcKsP7",
      JSON.stringify(metadataExemple)
    );
    console.log(
      "Global counter after asset registration:",
      Number(await contract.assetGlobalCounter())
    );
    let assetData = await contract.assetNumber(0);
    let assetID = Number(assetData[0]);
    let assetOwner = assetData[1];
    let assetURI = assetData[2];
    let assetMetadata = assetData[3];
    console.log();
    console.log("Actual asset information:");
    console.log("Asset ID: ", assetID);
    console.log("Asset owner: ", assetOwner);
    console.log("AssetURI: ", assetURI);
    console.log("Asset metadata: ", assetMetadata);
    let assetWithID0Owner = await contract.verifyOwnership(0, deployer.address);
    console.log(
      "Ownership verification for deployer address: ",
      assetWithID0Owner
    );

    console.log("Transfer asset");
    console.log("Owner before transfer: ", assetOwner);

    await contract.transferAsset(0, add1.address);
    console.log(`Asset with id 0 transfer from ${deployer.address} to ${add1.address}`);

    let assetDataAfterTransfer = await contract.assetNumber(0);
    let newOwner = assetDataAfterTransfer[1];
    console.log("Asset owner after transfer: ", newOwner);
    console.log();
    let assetWithID0OwnerAfterTransfer = await contract.verifyOwnership(
      0,
      deployer.address
    );
    console.log(
      "Ownership verification after transfer for deployer address: ",
      assetWithID0OwnerAfterTransfer
    );

    let assetWithID0OwnerAfterTransferForAdd1 = await contract.verifyOwnership(
      0,
      add1.address
    );
    console.log(
      "Ownership verification after transfer for add1 address: ",
      assetWithID0OwnerAfterTransferForAdd1
    );
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();
