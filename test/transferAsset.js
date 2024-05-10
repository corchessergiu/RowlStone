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
    expect(dataBeforeRegister[1]).to.equal(
      deployer.address
    );
    expect(dataBeforeRegister[2]).to.equal(
      "ipfs://QmTzQ1gY5DJzRRT6t8i5TSz4E2WV1fyCJo2gDGGQNcKsP7"
    );
    expect(dataBeforeRegister[3]).to.equal(JSON.stringify(metadata));

    await MediaAssetOwnershipContract.transferAsset(0, add1.address);

     let dataAfterRegister = await MediaAssetOwnershipContract.assetNumber(0);
     expect(Number(dataAfterRegister[0])).to.equal(0);
     expect(dataAfterRegister[1]).to.equal(add1.address);
     expect(dataAfterRegister[2]).to.equal(
       "ipfs://QmTzQ1gY5DJzRRT6t8i5TSz4E2WV1fyCJo2gDGGQNcKsP7"
     );
     expect(dataAfterRegister[3]).to.equal(JSON.stringify(metadata));

  });
});
