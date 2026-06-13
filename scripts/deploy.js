const hre = require("hardhat");

async function main() {
    const candidates = ["Alice", "Bob", "Charlie"];
    const Verification = await hre.ethers.getContractFactory("Voting");
    const voting = await Verification.deploy(candidates);

    await voting.waitForDeployment();

    console.log(`Voting contract deployed to ${voting.target}`);

    // Write address to frontend
    const fs = require("fs");
    const path = require("path");
    const addressFile = path.join(__dirname, "../frontend/utils/contract-address.json");

    fs.writeFileSync(
        addressFile,
        JSON.stringify({ address: voting.target }, undefined, 2)
    );
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
