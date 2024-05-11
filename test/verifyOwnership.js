const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Test register asset function", function () {
  let MediaAssetOwnershipContract, metadata;
  beforeEach("Set enviroment", async () => {
    [deployer, add1, add2, add3, add4] = await ethers.getSigners();

    MediaAssetOwnershipContract = await ethers.deployContract(
      "MediaAssetOwnership"
    );

    metadata = {
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
  });

  it("Should test ownership after some transfers action", async function () {
    expect(await MediaAssetOwnershipContract.assetGlobalCounter()).to.equal(0);
    await MediaAssetOwnershipContract.registerAsset(
      "ipfs://QmTzQ1gY5DJzRRT6t8i5TSz4E2WV1fyCJo2gDGGQNcKsP7",
      JSON.stringify(metadata)
    );

    expect(
      await MediaAssetOwnershipContract.verifyOwnership(0, deployer.address)
    ).to.equal(true);
    expect(
      await MediaAssetOwnershipContract.verifyOwnership(0, add1.address)
    ).to.equal(false);

    await MediaAssetOwnershipContract.transferAsset(0, add1.address);

    expect(
      await MediaAssetOwnershipContract.verifyOwnership(0, deployer.address)
    ).to.equal(false);
    expect(
      await MediaAssetOwnershipContract.verifyOwnership(0, add1.address)
    ).to.equal(true);

    await MediaAssetOwnershipContract.connect(add1).transferAsset(
      0,
      add4.address
    );

    expect(
      await MediaAssetOwnershipContract.verifyOwnership(0, add1.address)
    ).to.equal(false);
    expect(
      await MediaAssetOwnershipContract.verifyOwnership(0, add4.address)
    ).to.equal(true);

    await MediaAssetOwnershipContract.connect(add4).transferAsset(
      0,
      add2.address
    );

    expect(
      await MediaAssetOwnershipContract.verifyOwnership(0, add4.address)
    ).to.equal(false);
    expect(
      await MediaAssetOwnershipContract.verifyOwnership(0, add2.address)
    ).to.equal(true);
  });
});
