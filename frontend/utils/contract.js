import { ethers } from "ethers";
import VotingArtifact from "./Voting.json";

import contractAddress from "./contract-address.json";

const CONTRACT_ADDRESS = contractAddress.address;

export const getContract = async (signer) => {
    return new ethers.Contract(CONTRACT_ADDRESS, VotingArtifact.abi, signer);
};

export const getProvider = () => {
    if (typeof window !== "undefined" && window.ethereum) {
        return new ethers.BrowserProvider(window.ethereum);
    }
    return null;
};
