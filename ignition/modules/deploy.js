const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const MediaAssetOwnershipModule = buildModule(
  "MediaAssetOwnershipModule",
  (m) => {
    const token = m.contract("MediaAssetOwnership");
    return { token };
  }
);

module.exports = MediaAssetOwnershipModule;
