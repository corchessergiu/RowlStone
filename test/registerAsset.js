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

  it("Should try to register an asset without URI", async function () {
    await MediaAssetOwnershipContract.registerAsset(
      "",
      JSON.stringify(metadata)
    )
      .then((res) => {
        assert.fail("must throw err");
      })
      .catch((err) => {
        expect(err.message).to.contain(
          "MediaAsset: Asset URI cannot be empty!"
        );
      });
  });

  it("Should try to register an asset without URI", async function () {
    await MediaAssetOwnershipContract.registerAsset(
      "ipfs://QmTzQ1gY5DJzRRT6t8i5TSz4E2WV1fyCJo2gDGGQNcKsP7",
      ""
    )
      .then((res) => {
        assert.fail("must throw err");
      })
      .catch((err) => {
        expect(err.message).to.contain("MediaAsset: Metadata cannot be empty!");
      });
  });

  it("Should update mappings", async function () {
    expect(await MediaAssetOwnershipContract.assetGlobalCounter()).to.equal(0);
    let dataBeforeRegister = await MediaAssetOwnershipContract.assetNumber(0);

    //In case we access a struct at an index that has not been used yet, it will have the default values.
    expect(Number(dataBeforeRegister[0])).to.equal(0);
    expect(dataBeforeRegister[1]).to.equal(
      "0x0000000000000000000000000000000000000000"
    );
    expect(dataBeforeRegister[2]).to.equal("");
    expect(dataBeforeRegister[3]).to.equal("");

    //Revert because try to access data for deployer address from index 0 before we register for that owner
    await MediaAssetOwnershipContract.ownerAssets(deployer.address, 0)
      .then((res) => {
        assert.fail("must throw err");
      })
      .catch((err) => {
        expect(err.message).to.contain(
          "Transaction reverted without a reason string"
        );
      });

    await MediaAssetOwnershipContract.registerAsset(
      "ipfs://QmTzQ1gY5DJzRRT6t8i5TSz4E2WV1fyCJo2gDGGQNcKsP7",
      JSON.stringify(metadata)
    );


    let assetNumberForOwner = await MediaAssetOwnershipContract.ownerAssets(
      deployer.address,
      0
    );
    expect(Number(assetNumberForOwner)).to.equal(0);

    expect(await MediaAssetOwnershipContract.assetGlobalCounter()).to.equal(1);
    let dataAfterRegister = await MediaAssetOwnershipContract.assetNumber(0);
    expect(Number(dataAfterRegister[0])).to.equal(0);
    expect(dataAfterRegister[1]).to.equal(await deployer.getAddress());
    expect(dataAfterRegister[2]).to.equal(
      "ipfs://QmTzQ1gY5DJzRRT6t8i5TSz4E2WV1fyCJo2gDGGQNcKsP7"
    );
    expect(dataAfterRegister[3]).to.equal(JSON.stringify(metadata));
  });
});
