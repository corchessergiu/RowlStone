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

  it("Should test register function with multiple accounts", async function () {
    //register asset with deployer address
    await MediaAssetOwnershipContract.registerAsset(
      "ipfs://QmTzQ1gY5DJzRRT6t8i5TSz4E2WV1fyCJo2gDGGQNcKsP1",
      JSON.stringify(metadata)
    );

    //register asset with address 1
    await MediaAssetOwnershipContract.connect(add1).registerAsset(
      "ipfs://QmTzQ1gY5DJzRRT6t8i5TSz4E2WV1fyCJo2gDGGQNcKsP2",
      JSON.stringify(metadata)
    );

    //register asset with address 2
    await MediaAssetOwnershipContract.connect(add2).registerAsset(
      "ipfs://QmTzQ1gY5DJzRRT6t8i5TSz4E2WV1fyCJo2gDGGQNcKsP3",
      JSON.stringify(metadata)
    );

    //register asset with address 3
    await MediaAssetOwnershipContract.connect(add3).registerAsset(
      "ipfs://QmTzQ1gY5DJzRRT6t8i5TSz4E2WV1fyCJo2gDGGQNcKsP4",
      JSON.stringify(metadata)
    );

    //register asset with address 4
    await MediaAssetOwnershipContract.connect(add4).registerAsset(
      "ipfs://QmTzQ1gY5DJzRRT6t8i5TSz4E2WV1fyCJo2gDGGQNcKsP5",
      JSON.stringify(metadata)
    );

    //register asset with address 3 again
    await MediaAssetOwnershipContract.connect(add3).registerAsset(
      "ipfs://QmTzQ1gY5DJzRRT6t8i5TSz4E2WV1fyCJo2gDGGQNcKsP6",
      JSON.stringify(metadata)
    );

    expect(await MediaAssetOwnershipContract.assetGlobalCounter()).to.equal(6);
    let assetNumberForDeployer = await MediaAssetOwnershipContract.ownerAssets(
      deployer.address,
      0
    );
    expect(Number(assetNumberForDeployer)).to.equal(0);

    let dataAfterRegisterForDeployer =
      await MediaAssetOwnershipContract.assetNumber(0);
    expect(Number(dataAfterRegisterForDeployer[0])).to.equal(0);
    expect(dataAfterRegisterForDeployer[1]).to.equal(
      await deployer.getAddress()
    );
    expect(dataAfterRegisterForDeployer[2]).to.equal(
      "ipfs://QmTzQ1gY5DJzRRT6t8i5TSz4E2WV1fyCJo2gDGGQNcKsP1"
    );
    expect(dataAfterRegisterForDeployer[3]).to.equal(JSON.stringify(metadata));

    let assetNumberForAdd1 = await MediaAssetOwnershipContract.ownerAssets(
      add1.address,
      0
    );
    expect(Number(assetNumberForAdd1)).to.equal(1);
    let dataAfterRegisterForAdd1 =
      await MediaAssetOwnershipContract.assetNumber(1);
    expect(Number(dataAfterRegisterForAdd1[0])).to.equal(1);
    expect(dataAfterRegisterForAdd1[1]).to.equal(add1.address);
    expect(dataAfterRegisterForAdd1[2]).to.equal(
      "ipfs://QmTzQ1gY5DJzRRT6t8i5TSz4E2WV1fyCJo2gDGGQNcKsP2"
    );
    expect(dataAfterRegisterForAdd1[3]).to.equal(JSON.stringify(metadata));

    let assetNumberForAdd2 = await MediaAssetOwnershipContract.ownerAssets(
      add2.address,
      0
    );
    expect(Number(assetNumberForAdd2)).to.equal(2);
    let dataAfterRegisterForAdd2 =
      await MediaAssetOwnershipContract.assetNumber(2);
    expect(Number(dataAfterRegisterForAdd2[0])).to.equal(2);
    expect(dataAfterRegisterForAdd2[1]).to.equal(add2.address);
    expect(dataAfterRegisterForAdd2[2]).to.equal(
      "ipfs://QmTzQ1gY5DJzRRT6t8i5TSz4E2WV1fyCJo2gDGGQNcKsP3"
    );
    expect(dataAfterRegisterForAdd2[3]).to.equal(JSON.stringify(metadata));

    let assetNumberForAdd3 = await MediaAssetOwnershipContract.ownerAssets(
      add3.address,
      0
    );
    expect(Number(assetNumberForAdd3)).to.equal(3);
    let dataAfterRegisterForAdd3 =
      await MediaAssetOwnershipContract.assetNumber(3);
    expect(Number(dataAfterRegisterForAdd3[0])).to.equal(3);
    expect(dataAfterRegisterForAdd3[1]).to.equal(add3.address);
    expect(dataAfterRegisterForAdd3[2]).to.equal(
      "ipfs://QmTzQ1gY5DJzRRT6t8i5TSz4E2WV1fyCJo2gDGGQNcKsP4"
    );
    expect(dataAfterRegisterForAdd3[3]).to.equal(JSON.stringify(metadata));

    let assetNumberForAdd4 = await MediaAssetOwnershipContract.ownerAssets(
      add4.address,
      0
    );
    expect(Number(assetNumberForAdd4)).to.equal(4);
    let dataAfterRegisterForAdd4 =
      await MediaAssetOwnershipContract.assetNumber(4);
    expect(Number(dataAfterRegisterForAdd4[0])).to.equal(4);
    expect(dataAfterRegisterForAdd4[1]).to.equal(add4.address);
    expect(dataAfterRegisterForAdd4[2]).to.equal(
      "ipfs://QmTzQ1gY5DJzRRT6t8i5TSz4E2WV1fyCJo2gDGGQNcKsP5"
    );
    expect(dataAfterRegisterForAdd4[3]).to.equal(JSON.stringify(metadata));

    let assetNumberForAdd3SecondRegistration =
      await MediaAssetOwnershipContract.ownerAssets(add3.address, 1);
    expect(Number(assetNumberForAdd3SecondRegistration)).to.equal(5);
    let dataAfterRegisterForAdd3SecondRegistration =
      await MediaAssetOwnershipContract.assetNumber(5);
    expect(Number(dataAfterRegisterForAdd3SecondRegistration[0])).to.equal(5);
    expect(dataAfterRegisterForAdd3SecondRegistration[1]).to.equal(
      add3.address
    );
    expect(dataAfterRegisterForAdd3SecondRegistration[2]).to.equal(
      "ipfs://QmTzQ1gY5DJzRRT6t8i5TSz4E2WV1fyCJo2gDGGQNcKsP6"
    );
    expect(dataAfterRegisterForAdd3SecondRegistration[3]).to.equal(
      JSON.stringify(metadata)
    );
  });
});
