// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MediaAssetOwnership {
    // Define a struct to represent a media asset
    struct MediaAsset {
        uint256 id;
        address owner;
        string assetURI;
        string metadata;
    }

    // A counter to generate unique asset IDs
    uint256 public assetGlobalCounter;
    // A mapping to store media assets by their ID
    mapping(uint256 => MediaAsset) public assetNumber;
    // A mapping to keep track of the number of assets registered by each address
    mapping(address => uint256[]) public ownerAssets;

    // Event to be emitted when a new asset is registered
    event AssetRegistered(uint256 indexed assetId, address indexed owner, string assetURI, string metadata);
    // Event to be emitted when an asset ownership is transferred
    event AssetTransferred(uint256 indexed assetId, address indexed from, address indexed to);

    function registerAsset(string memory assetURI, string memory metadata) public {
        require(bytes(assetURI).length > 0, "MediaAsset: Asset URI cannot be empty!");
        require(bytes(metadata).length > 0, "MediaAsset: Metadata cannot be empty!");
        uint256 assetId = assetGlobalCounter++;
        assetNumber[assetId] = MediaAsset({
            id: assetId,
            owner: msg.sender,
            assetURI: assetURI,
            metadata: metadata
        });
        ownerAssets[msg.sender].push(assetId);

        emit AssetRegistered(assetId, msg.sender, assetURI, metadata);
    }

    function transferAsset(uint256 assetId, address to) public {
        require(to != address(0), "MediaAsset: Cannot transfer to 0 address!");
        require(to != msg.sender, "MediaAsset: Cannot transfer to the same address!");
        require(assetNumber[assetId].owner == msg.sender, "MediaAsset: Only the asset owner can transfer ownership!");

        address previousOwner = assetNumber[assetId].owner;
        assetNumber[assetId].owner = to;

        uint256[] storage previousOwnerAssets = ownerAssets[previousOwner];
        for (uint256 i = 0; i < previousOwnerAssets.length; i++) {
            if (previousOwnerAssets[i] == assetId) {
                previousOwnerAssets[i] = previousOwnerAssets[previousOwnerAssets.length - 1];
                previousOwnerAssets.pop();
                break;
            }
        }
        ownerAssets[to].push(assetId);

        emit AssetTransferred(assetId, previousOwner, to);
    }

}
