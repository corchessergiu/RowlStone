const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Test transfer function", function () {
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

  it("Should try to transfer to 0x address", async function () {
    await MediaAssetOwnershipContract.transferAsset(
      0,
      "0x0000000000000000000000000000000000000000"
    )
      .then((res) => {
        assert.fail("must throw err");
      })
      .catch((err) => {
        expect(err.message).to.contain(
          "MediaAsset: Cannot transfer to 0 address!"
        );
      });
  });

  it("Should try to transfer to same address", async function () {
    await MediaAssetOwnershipContract.transferAsset(0, deployer.address)
      .then((res) => {
        assert.fail("must throw err");
      })
      .catch((err) => {
        expect(err.message).to.contain(
          "MediaAsset: Cannot transfer to the same address!"
        );
      });
  });

  it("Should try to transfer to same address", async function () {
    await MediaAssetOwnershipContract.registerAsset(
      "ipfs://QmTzQ1gY5DJzRRT6t8i5TSz4E2WV1fyCJo2gDGGQNcKsP7",
      JSON.stringify(metadata)
    );
    await MediaAssetOwnershipContract.connect(add1).registerAsset(
      "ipfs://QmTzQ1gY5DJzRRT6t8i5TSz4E2WV1fyCJo2gDGGQNcKsP8",
      JSON.stringify(metadata)
    );

    await MediaAssetOwnershipContract.transferAsset(1, add1.address)
      .then((res) => {
        assert.fail("must throw err");
      })
      .catch((err) => {
        expect(err.message).to.contain(
          "MediaAsset: Only the asset owner can transfer ownership!"
        );
      });
  });

  it("Should transfer asset", async function () {
    await MediaAssetOwnershipContract.registerAsset(
      "ipfs://QmTzQ1gY5DJzRRT6t8i5TSz4E2WV1fyCJo2gDGGQNcKsP7",
      JSON.stringify(metadata)
    );
    await MediaAssetOwnershipContract.connect(add1).registerAsset(
      "ipfs://QmTzQ1gY5DJzRRT6t8i5TSz4E2WV1fyCJo2gDGGQNcKsP8",
      JSON.stringify(metadata)
    );

    let dataBeforeRegister = await MediaAssetOwnershipContract.assetNumber(0);
    expect(Number(dataBeforeRegister[0])).to.equal(0);
    expect(dataBeforeRegister[1]).to.equal(deployer.address);
    expect(dataBeforeRegister[2]).to.equal(
      "ipfs://QmTzQ1gY5DJzRRT6t8i5TSz4E2WV1fyCJo2gDGGQNcKsP7"
    );
    expect(dataBeforeRegister[3]).to.equal(JSON.stringify(metadata));

    await MediaAssetOwnershipContract.transferAsset(0, add1.address);

    let dataAfterTransfer = await MediaAssetOwnershipContract.assetNumber(0);
    expect(Number(dataAfterTransfer[0])).to.equal(0);
    expect(dataAfterTransfer[1]).to.equal(add1.address);
    expect(dataAfterTransfer[2]).to.equal(
      "ipfs://QmTzQ1gY5DJzRRT6t8i5TSz4E2WV1fyCJo2gDGGQNcKsP7"
    );
    expect(dataAfterTransfer[3]).to.equal(JSON.stringify(metadata));
  });

  it("Should execute multiple transfers with same asset", async function () {
    //Register asset with deployer adddress
    await MediaAssetOwnershipContract.registerAsset(
      "ipfs://QmTzQ1gY5DJzRRT6t8i5TSz4E2WV1fyCJo2gDGGQNcKsP7",
      JSON.stringify(metadata)
    );

    let dataAfterRegister = await MediaAssetOwnershipContract.assetNumber(0);
    expect(Number(dataAfterRegister[0])).to.equal(0);
    expect(dataAfterRegister[1]).to.equal(deployer.address);
    expect(dataAfterRegister[2]).to.equal(
      "ipfs://QmTzQ1gY5DJzRRT6t8i5TSz4E2WV1fyCJo2gDGGQNcKsP7"
    );
    expect(dataAfterRegister[3]).to.equal(JSON.stringify(metadata));

    //Transfer asset with id 0 from deloyer to add1
    await MediaAssetOwnershipContract.transferAsset(0, add1.address);

    let dataAfterFirstTransfer = await MediaAssetOwnershipContract.assetNumber(
      0
    );
    expect(dataAfterFirstTransfer[1]).to.equal(add1.address);

    //Transfer asset with id 0 from add1 to add2
    await MediaAssetOwnershipContract.connect(add1).transferAsset(
      0,
      add2.address
    );

    let dataAfterSecondTransfer = await MediaAssetOwnershipContract.assetNumber(
      0
    );
    expect(dataAfterSecondTransfer[1]).to.equal(add2.address);

    //Transfer asset with id 0 from add2 to add3
    await MediaAssetOwnershipContract.connect(add2).transferAsset(
      0,
      add3.address
    );

    let dataAfterThirdTransfer = await MediaAssetOwnershipContract.assetNumber(
      0
    );
    expect(dataAfterThirdTransfer[1]).to.equal(add3.address);

    //Transfer asset with id 0 from add3 to add4
    await MediaAssetOwnershipContract.connect(add3).transferAsset(
      0,
      add4.address
    );

    let dataAfterForthTransfer = await MediaAssetOwnershipContract.assetNumber(
      0
    );
    expect(dataAfterForthTransfer[1]).to.equal(add4.address);

    //Transfer asset with id 0 from add4 back to deployer
    await MediaAssetOwnershipContract.connect(add4).transferAsset(
      0,
      deployer.address
    );

    let dataAfterFifthTransfer = await MediaAssetOwnershipContract.assetNumber(
      0
    );
    expect(dataAfterFifthTransfer[1]).to.equal(deployer.address);
  });

  it("Transfer multiple asset from same owner and verify ownership", async function () {
    await MediaAssetOwnershipContract.registerAsset(
      "ipfs://QmTzQ1gY5DJzRRT6t8i5TSz4E2WV1fyCJo2gDGGQNcKsP7",
      JSON.stringify(metadata)
    );
    await MediaAssetOwnershipContract.registerAsset(
      "ipfs://QmTzQ1gY5DJzRRT6t8i5TSz4E2WV1fyCJo2gDGGQNcKsP8",
      JSON.stringify(metadata)
    );

    await MediaAssetOwnershipContract.registerAsset(
      "ipfs://QmTzQ1gY5DJzRRT6t8i5TSz4E2WV1fyCJo2gDGGQNcKsP2",
      JSON.stringify(metadata)
    );
    await MediaAssetOwnershipContract.registerAsset(
      "ipfs://QmTzQ1gY5DJzRRT6t8i5TSz4E2WV1fyCJo2gDGGQNcKsP3",
      JSON.stringify(metadata)
    );

    let allDeployerIDsAssets = await MediaAssetOwnershipContract.getAllAssets(
      deployer.address
    );
    expect(allDeployerIDsAssets.length).to.equal(4);
    expect(Number(allDeployerIDsAssets[0])).to.equal(0);
    expect(Number(allDeployerIDsAssets[1])).to.equal(1);
    expect(Number(allDeployerIDsAssets[2])).to.equal(2);
    expect(Number(allDeployerIDsAssets[3])).to.equal(3);

    expect(
      await MediaAssetOwnershipContract.verifyOwnership(1, deployer.address)
    ).to.equal(true);
    await MediaAssetOwnershipContract.transferAsset(1, add1.address);
    expect(
      await MediaAssetOwnershipContract.verifyOwnership(1, deployer.address)
    ).to.equal(false);
    expect(
      await MediaAssetOwnershipContract.verifyOwnership(1, add1.address)
    ).to.equal(true);

    expect(
      await MediaAssetOwnershipContract.verifyOwnership(2, deployer.address)
    ).to.equal(true);
    await MediaAssetOwnershipContract.transferAsset(2, add3.address);
    expect(
      await MediaAssetOwnershipContract.verifyOwnership(2, deployer.address)
    ).to.equal(false);
    expect(
      await MediaAssetOwnershipContract.verifyOwnership(2, add3.address)
    ).to.equal(true);

    expect(
      await MediaAssetOwnershipContract.verifyOwnership(0, deployer.address)
    ).to.equal(true);
    await MediaAssetOwnershipContract.transferAsset(0, add4.address);
    expect(
      await MediaAssetOwnershipContract.verifyOwnership(0, deployer.address)
    ).to.equal(false);
    expect(
      await MediaAssetOwnershipContract.verifyOwnership(0, add4.address)
    ).to.equal(true);

    expect(
      await MediaAssetOwnershipContract.verifyOwnership(3, deployer.address)
    ).to.equal(true);
    await MediaAssetOwnershipContract.transferAsset(3, add1.address);
    expect(
      await MediaAssetOwnershipContract.verifyOwnership(3, deployer.address)
    ).to.equal(false);
    expect(
      await MediaAssetOwnershipContract.verifyOwnership(3, add1.address)
    ).to.equal(true);
  });
});
