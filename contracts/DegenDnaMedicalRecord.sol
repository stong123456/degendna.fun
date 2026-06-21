// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title Degen DNA Medical Record
/// @notice Sepolia testnet commemorative NFT for degendna.fun reports.
/// @dev No public mint exists. The app mints on behalf of users with MINTER_ROLE.
contract DegenDnaMedicalRecord is ERC721, ERC721URIStorage, AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    uint8 public constant RARITY_COMMON = 0;
    uint8 public constant RARITY_UNCOMMON = 1;
    uint8 public constant RARITY_RARE = 2;
    uint8 public constant RARITY_EPIC = 3;
    uint8 public constant RARITY_LEGENDARY = 4;
    uint8 public constant RARITY_MYTHIC = 5;
    uint8 public constant RARITY_ONE_OF_ONE = 6;

    uint256 public constant MAX_SUPPLY = 9999;
    uint256 public constant MAX_RARITY_TIER = RARITY_ONE_OF_ONE;

    uint256 private _nextTokenId = 1;

    mapping(bytes32 => bool) public mintedReport;
    mapping(address => bool) public walletMinted;
    mapping(uint256 => bytes32) public tokenReportHash;
    mapping(uint256 => uint8) public tokenRarityTier;
    mapping(uint8 => uint256) public rarityMinted;

    event MedicalRecordMinted(
        address indexed to,
        uint256 indexed tokenId,
        bytes32 indexed reportHash,
        uint8 rarityTier,
        string tokenUri
    );

    error MaxSupplyReached();
    error RaritySupplyReached();
    error ReportAlreadyMinted();
    error WalletAlreadyMinted();
    error InvalidReceiver();
    error InvalidReportHash();
    error InvalidRarityTier();
    error EmptyTokenUri();

    constructor(address admin, address minter) ERC721("Degen DNA Medical Record", "DDNA-MED") {
        if (admin == address(0) || minter == address(0)) revert InvalidReceiver();
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, minter);
    }

    function mintMedicalRecord(
        address to,
        string calldata tokenUri,
        bytes32 reportHash,
        uint8 rarityTier
    ) external onlyRole(MINTER_ROLE) whenNotPaused nonReentrant returns (uint256 tokenId) {
        if (to == address(0)) revert InvalidReceiver();
        if (bytes(tokenUri).length == 0) revert EmptyTokenUri();
        if (reportHash == bytes32(0)) revert InvalidReportHash();
        if (rarityTier > MAX_RARITY_TIER) revert InvalidRarityTier();
        if (mintedReport[reportHash]) revert ReportAlreadyMinted();
        if (walletMinted[to]) revert WalletAlreadyMinted();
        if (_nextTokenId > MAX_SUPPLY) revert MaxSupplyReached();
        if (rarityMinted[rarityTier] >= _rarityCap(rarityTier)) revert RaritySupplyReached();

        tokenId = _nextTokenId;
        _nextTokenId += 1;
        rarityMinted[rarityTier] += 1;
        mintedReport[reportHash] = true;
        walletMinted[to] = true;
        tokenReportHash[tokenId] = reportHash;
        tokenRarityTier[tokenId] = rarityTier;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenUri);

        emit MedicalRecordMinted(to, tokenId, reportHash, rarityTier, tokenUri);
    }

    function totalMinted() external view returns (uint256) {
        return _nextTokenId - 1;
    }

    function rarityCap(uint8 rarityTier) external pure returns (uint256) {
        if (rarityTier > MAX_RARITY_TIER) revert InvalidRarityTier();
        return _rarityCap(rarityTier);
    }

    function rarityRemaining(uint8 rarityTier) external view returns (uint256) {
        if (rarityTier > MAX_RARITY_TIER) revert InvalidRarityTier();
        return _rarityCap(rarityTier) - rarityMinted[rarityTier];
    }

    function _rarityCap(uint8 rarityTier) internal pure returns (uint256) {
        if (rarityTier == RARITY_COMMON) return 4500;
        if (rarityTier == RARITY_UNCOMMON) return 2500;
        if (rarityTier == RARITY_RARE) return 1500;
        if (rarityTier == RARITY_EPIC) return 800;
        if (rarityTier == RARITY_LEGENDARY) return 400;
        if (rarityTier == RARITY_MYTHIC) return 249;
        if (rarityTier == RARITY_ONE_OF_ONE) return 50;
        revert InvalidRarityTier();
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
