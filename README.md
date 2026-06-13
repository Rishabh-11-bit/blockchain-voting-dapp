# Blockchain Voting DApp

A decentralized, tamper-proof voting application built on Ethereum. Every vote is recorded on-chain — no central authority, no manipulation.

## How it works

- Voters connect their **MetaMask** wallet — one wallet = one vote, enforced by the smart contract
- Candidates are set at contract deployment time
- Each vote triggers a `VotedEvent` on-chain and updates the live tally
- The Next.js frontend reads directly from the contract — no backend, no database

## Smart Contract

Written in Solidity (`^0.8.24`). Core logic:

```solidity
function vote(uint _candidateId) public {
    require(!voters[msg.sender], "You have already voted.");
    require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate ID.");
    voters[msg.sender] = true;
    candidates[_candidateId].voteCount++;
    emit VotedEvent(_candidateId);
}
```

Double-voting is blocked at the contract level — not by the UI.

## Stack

| Layer | Tech |
|---|---|
| Smart contract | Solidity `^0.8.24` |
| Development / testing | Hardhat |
| Frontend | Next.js + Ethers.js |
| Wallet auth | MetaMask |
| Network | Ethereum (local Hardhat node / testnet) |

## Setup

### 1. Install dependencies
```bash
npm install
cd frontend && npm install
```

### 2. Start local blockchain
```bash
npx hardhat node
```

### 3. Deploy contract
```bash
npx hardhat run scripts/deploy.js --network localhost
```

### 4. Update frontend contract address
Copy the deployed address into `frontend/utils/contract-address.json`.

### 5. Run frontend
```bash
cd frontend
npm run dev
# Open: http://localhost:3000
```

## Testing

```bash
npx hardhat test
```

Tests cover: candidate registration, single-vote enforcement, double-vote rejection, vote count correctness.

## Research

An IEEE-format research paper accompanies this project covering the architecture, on-chain vs off-chain trade-offs, and gas-cost analysis.
