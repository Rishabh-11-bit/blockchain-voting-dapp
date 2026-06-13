const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Voting", function () {
    let Voting;
    let voting;
    let owner;
    let addr1;
    let addr2;
    let candidates = ["Alice", "Bob", "Charlie"];

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();
        Voting = await ethers.getContractFactory("Voting");
        voting = await Voting.deploy(candidates);
    });

    it("Should initialize with correct candidates", async function () {
        const candidatesCount = await voting.candidatesCount();
        expect(candidatesCount).to.equal(candidates.length);
    });

    it("Should allow a voter to cast a vote", async function () {
        await voting.connect(addr1).vote(1);
        const candidate = await voting.candidates(1);
        expect(candidate.voteCount).to.equal(1);
    });

    it("Should not allow double voting", async function () {
        await voting.connect(addr1).vote(1);
        await expect(voting.connect(addr1).vote(1)).to.be.revertedWith("You have already voted.");
    });

    it("Should not allow voting for invalid candidate", async function () {
        await expect(voting.connect(addr1).vote(99)).to.be.revertedWith("Invalid candidate ID.");
    });
});
