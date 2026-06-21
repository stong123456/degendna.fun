const fs = require("node:fs");
const path = require("node:path");
const solc = require("solc");

const root = path.resolve(__dirname, "..");
const contractPath = path.join(root, "contracts", "DegenDnaMedicalRecord.sol");
const outputDir = path.join(root, "artifacts-solc", "contracts");

function findImport(importPath) {
  const candidates = [
    path.join(root, "node_modules", importPath),
    path.join(root, importPath)
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return { contents: fs.readFileSync(candidate, "utf8") };
  }
  return { error: `File not found: ${importPath}` };
}

const input = {
  language: "Solidity",
  sources: {
    "DegenDnaMedicalRecord.sol": {
      content: fs.readFileSync(contractPath, "utf8")
    }
  },
  settings: {
    evmVersion: "cancun",
    optimizer: { enabled: true, runs: 200 },
    outputSelection: {
      "*": {
        "*": ["abi", "evm.bytecode", "evm.deployedBytecode", "metadata"]
      }
    }
  }
};

const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImport }));
for (const item of output.errors || []) {
  const stream = item.severity === "error" ? process.stderr : process.stdout;
  stream.write(`${item.formattedMessage}\n`);
}
if ((output.errors || []).some((item) => item.severity === "error")) process.exit(1);

const contract = output.contracts?.["DegenDnaMedicalRecord.sol"]?.DegenDnaMedicalRecord;
if (!contract) throw new Error("DegenDnaMedicalRecord artifact missing from solc output.");

fs.mkdirSync(outputDir, { recursive: true });
const artifact = {
  contractName: "DegenDnaMedicalRecord",
  sourceName: "contracts/DegenDnaMedicalRecord.sol",
  abi: contract.abi,
  bytecode: contract.evm.bytecode.object.startsWith("0x") ? contract.evm.bytecode.object : `0x${contract.evm.bytecode.object}`,
  deployedBytecode: contract.evm.deployedBytecode.object.startsWith("0x") ? contract.evm.deployedBytecode.object : `0x${contract.evm.deployedBytecode.object}`,
  metadata: contract.metadata
};
const artifactPath = path.join(outputDir, "DegenDnaMedicalRecord.json");
fs.writeFileSync(artifactPath, `${JSON.stringify(artifact, null, 2)}\n`);
console.log(`Wrote ${path.relative(root, artifactPath)}`);
