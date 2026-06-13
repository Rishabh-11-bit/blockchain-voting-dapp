const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    const addressPath = path.join(__dirname, "../frontend/utils/contract-address.json");
    if (!fs.existsSync(addressPath)) {
        console.error("Address file not found");
        return;
    }
    const addressData = JSON.parse(fs.readFileSync(addressPath, "utf8"));
    const address = addressData.address;

    console.log(`Checking address: ${address}`);

    const code = await hre.ethers.provider.getCode(address);
    console.log(`Code at address length: ${code.length}`);

    if (code === "0x") {
        console.error("ERROR: No code found at address! Contract is not deployed or node restarted.");
    } else {
        console.log("SUCCESS: Contract code found.");

        const Voting = await hre.ethers.getContractFactory("Voting");
        const voting = Voting.attach(address);
        try {
            const candidates = await voting.getCandidates();
            console.log(`Candidates count: ${candidates.length}`);
            console.log("Candidates:", candidates);
        } catch (e) {
            console.error("Error calling getCandidates:", e);
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
