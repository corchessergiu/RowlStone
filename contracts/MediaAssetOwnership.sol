// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title The contract is designed to manage users' assets.
/// @dev This contract contains a transfer function and a function for registering assets.
contract MediaAssetOwnership {
    /// @notice Define a struct to represent a media asset.
    /// @param id The unique identification ID of the asset.
    /// @param owner The owner of the asset.
    /// @param assetURI The asset URI for the registered asset.
    /// @param metadata The metadata for the registered asset.
    struct MediaAsset {
        uint256 id;
        address owner;
        string assetURI;
        string metadata;
    }

    /// @notice A counter to generate unique asset IDs.
    uint256 public assetGlobalCounter;

    /// @notice Maps to store media assets by their ID.
    mapping(uint256 => MediaAsset) public assetNumber;

    /// @notice Maps to keep track of the number of assets registered by each address.
    mapping(address => uint256[]) public ownerAssets;

    /// @notice Emitted when an asset is registered.
    /// @param assetId The unique identification ID of an asset.
    /// @param owner The owner of the asset.
    /// @param assetURI The asset URI for the registered asset.
    /// @param metadata The metadata for the registered asset.
    event AssetRegistered(
        uint256 indexed assetId,
        address indexed owner,
        string assetURI,
        string metadata
    );

    /// @notice Emitted when an asset is transfered.
    /// @param assetId The unique identification ID of an asset.
    /// @param from The address that was the previous owner of the asset.
    /// @param to The new owner of the asset.
    event AssetTransferred(
        uint256 indexed assetId,
        address indexed from,
        address indexed to
    );

    /// @notice Function responsible for register an asset.
    /// @dev Reverts if assetURI is null.
    /// @dev Reverts if metadata is null.
    /// @dev Emits the 'AssetRegistered' event.
    /// @param assetURI The asset URI for the asset.
    /// @param metadata The metadata for the asset.
    function registerAsset(
        string memory assetURI,
        string memory metadata
    ) public {
        require(
            bytes(assetURI).length > 0,
            "MediaAsset: Asset URI cannot be empty!"
        );
        require(
            bytes(metadata).length > 0,
            "MediaAsset: Metadata cannot be empty!"
        );
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

    /// @notice Function responsible for transfer an asset.
    /// @dev Reverts if to parameter is address(0).
    /// @dev Reverts if to parameter it is the same as msg.sender.
    /// @dev Reverts if the caller of the function is not the owner of the assetId sent as a parameter.
    /// @dev Emits the 'AssetTransferred' event.
    /// @param assetId The asset URI for the asset.
    /// @param to The metadata for the asset.
    function transferAsset(uint256 assetId, address to) public {
        require(to != address(0), "MediaAsset: Cannot transfer to 0 address!");
        require(
            to != msg.sender,
            "MediaAsset: Cannot transfer to the same address!"
        );
        require(
            assetNumber[assetId].owner == msg.sender,
            "MediaAsset: Only the asset owner can transfer ownership!"
        );

        address previousOwner = assetNumber[assetId].owner;
        assetNumber[assetId].owner = to;

        uint256[] storage previousOwnerAssets = ownerAssets[previousOwner];
        for (uint256 i = 0; i < previousOwnerAssets.length; i++) {
            if (previousOwnerAssets[i] == assetId) {
                previousOwnerAssets[i] = previousOwnerAssets[
                    previousOwnerAssets.length - 1
                ];
                previousOwnerAssets.pop();
                break;
            }
        }
        ownerAssets[to].push(assetId);

        emit AssetTransferred(assetId, previousOwner, to);
    }
}
