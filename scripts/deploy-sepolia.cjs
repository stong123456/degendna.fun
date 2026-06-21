const fs = require("node:fs");
const path = require("node:path");
const { ContractFactory, JsonRpcProvider, Wallet, isAddress } = require("ethers");

const root = path.resolve(__dirname, "..");
const artifactPath = path.join(root, "artifacts-solc", "contracts", "DegenDnaMedicalRecord.json");
const envPath = path.join(root, ".env");

function loadLocalEnv() {
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const clean = line.trim();
    if (!clean || clean.startsWith("#")) continue;
    const index = clean.indexOf("=");
    if (index <= 0) continue;
    const key = clean.slice(0, index).trim();
    const value = clean.slice(index + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadLocalEnv();

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

function requiredAddress(name, fallback) {
  const value = process.env[name] || fallback;
  if (!value || !isAddress(value)) throw new Error(`${name} must be a valid EVM address.`);
  return value;
}

async function main() {
  if (!fs.existsSync(artifactPath)) {
    throw new Error("Missing contract artifact. Run npm run compile:contracts first.");
  }

  const rpcUrl = process.env.SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";
  const privateKey = required("SEPOLIA_DEPLOYER_PRIVATE_KEY");
  const provider = new JsonRpcProvider(rpcUrl);
  const deployer = new Wallet(privateKey, provider);
  const admin = requiredAddress("SEPOLIA_NFT_ADMIN", deployer.address);
  const minter = requiredAddress("SEPOLIA_NFT_MINTER", deployer.address);
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  console.log(`Deploying DegenDnaMedicalRecord from ${deployer.address}`);
  console.log(`Admin: ${admin}`);
  console.log(`Minter: ${minter}`);

  const factory = new ContractFactory(artifact.abi, artifact.bytecode, deployer);
  const contract = await factory.deploy(admin, minter);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  const tx = contract.deploymentTransaction();
  console.log(`DegenDnaMedicalRecord deployed to: ${address}`);
  console.log(`Deployment tx: ${tx?.hash || "unknown"}`);
  console.log(`Set SEPOLIA_NFT_CONTRACT_ADDRESS=${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
