"use client";
import { useState, useEffect } from "react";
import { getProvider } from "../utils/contract";

function truncateAddress(addr) {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

// Inline MetaMask fox SVG so we have no external dependency
function MetaMaskIcon({ size = 22 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 35 33" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M32.958 1L19.542 10.892l2.476-5.875L32.958 1z" fill="#E2761B" stroke="#E2761B" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2.025 1l13.297 9.986-2.355-5.969L2.025 1zM28.175 23.47l-3.574 5.469 7.647 2.106 2.193-7.455-6.266-.12zM1.587 23.59l2.18 7.455 7.647-2.106-3.574-5.469-6.253.12z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M11.065 14.428l-2.13 3.22 7.584.337-.267-8.162-5.187 4.605zM23.918 14.428l-5.258-4.7-.174 8.257 7.57-.337-2.138-3.22zM11.414 28.939l4.565-2.213-3.936-3.073-.629 5.286zM19.004 26.726l4.578 2.213-.643-5.286-3.935 3.073z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M23.582 28.939l-4.578-2.213.37 3.008-.04 1.25 4.248-2.045zM11.414 28.939l4.261 2.045-.027-1.25.357-3.008-4.591 2.213z" fill="#D7C1B3" stroke="#D7C1B3" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M15.74 21.935l-3.8-1.117 2.68-1.224 1.12 2.34zM19.245 21.935l1.12-2.34 2.693 1.224-3.813 1.116z" fill="#233447" stroke="#233447" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M11.414 28.939l.656-5.469-4.23.12 3.574 5.35zM22.924 23.47l.656 5.47 3.574-5.35-4.23-.12zM26.05 17.648l-7.57.337.7 3.95 1.12-2.34 2.693 1.224 3.057-3.17zM11.94 20.818l2.68-1.224 1.107 2.34.714-3.95-7.584-.337 3.083 3.17z" fill="#CD6116" stroke="#CD6116" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8.935 17.648l3.177 6.193-.107-3.023-3.07-3.17zM22.988 20.818l-.12 3.023 3.19-6.193-3.07 3.17zM15.647 17.985l-.714 3.95.9 4.618.2-6.09-.386-2.478zM19.245 17.985l-.37 2.465.187 6.103.9-4.618-.717-3.95z" fill="#E4751F" stroke="#E4751F" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M19.245 21.935l-.9 4.618.644.44 3.935-3.073.12-3.023-3.8 1.038zM11.94 20.818l.107 3.023 3.936 3.073.643-.44-.9-4.618-3.786-1.038z" fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M19.285 30.984l.04-1.25-.343-.295h-5.07l-.33.295.027 1.25-4.26-2.045 1.49 1.22 3.01 2.087h5.2l3.024-2.087 1.477-1.22-4.265 2.045z" fill="#C0AD9E" stroke="#C0AD9E" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M19.004 26.726l-.643-.44h-3.73l-.643.44-.357 3.008.33-.295h5.07l.343.295-.37-3.008z" fill="#161616" stroke="#161616" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M33.516 11.307l1.13-5.496L32.958 1l-13.954 10.36 5.373 4.539 7.593 2.22 1.677-1.96-.73-.535 1.157-.855-.89-.683 1.157-.89-.815-.629v-.84zM.354 5.81l1.13 5.497-.735.629 1.17.89-.876.683 1.157.855-.73.535 1.664 1.96 7.593-2.22 5.373-4.538L2.025 1 .354 5.811z" fill="#763D16" stroke="#763D16" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M32.97 16.119l-7.593-2.22 2.138 3.22-3.19 6.193 4.216-.054h6.266l-1.837-7.14zM9.616 13.9l-7.593 2.22-1.81 7.139h6.253l4.203.054-3.177-6.193 2.124-3.22zM19.245 17.985l.482-8.39 2.196-5.969H13.09l2.155 5.969.522 8.39.187 2.492.013 6.076h3.73l.027-6.076.24-2.492z" fill="#F6851B" stroke="#F6851B" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );
}

export default function ConnectWallet({ setAccount, addToast }) {
    const [currentAccount, setCurrentAccount] = useState("");
    const [chainId, setChainId] = useState(null);
    const [connecting, setConnecting] = useState(false);
    const [copied, setCopied] = useState(false);

    const isCorrectNetwork = chainId && chainId.toString() === "31337";

    const connectWallet = async () => {
        const provider = getProvider();
        if (!provider) {
            addToast("error", "MetaMask is not installed. Please install it to continue.", "MetaMask Required");
            return;
        }
        setConnecting(true);
        try {
            const accounts = await provider.send("eth_requestAccounts", []);
            const network = await provider.getNetwork();
            setChainId(network.chainId);
            setCurrentAccount(accounts[0]);
            setAccount(accounts[0]);
            addToast("success", `Wallet connected: ${truncateAddress(accounts[0])}`, "Connected");
        } catch {
            addToast("error", "Failed to connect wallet. Please try again.");
        } finally {
            setConnecting(false);
        }
    };

    const switchNetwork = async () => {
        if (!window.ethereum) return;
        try {
            await window.ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: "0x7a69" }],
            });
        } catch (switchError) {
            if (switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: "wallet_addEthereumChain",
                        params: [{
                            chainId: "0x7a69",
                            chainName: "Localhost 8545",
                            rpcUrls: ["http://127.0.0.1:8545"],
                            nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
                        }],
                    });
                } catch {
                    addToast("error", "Failed to add Localhost network to MetaMask.");
                }
            } else {
                addToast("error", "Failed to switch network.");
            }
        }
    };

    const copyAddress = async () => {
        if (!currentAccount) return;
        try {
            await navigator.clipboard.writeText(currentAccount);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // clipboard API may be blocked in some envs
        }
    };

    useEffect(() => {
        const checkWallet = async () => {
            const provider = getProvider();
            if (!provider) return;
            const accounts = await provider.send("eth_accounts", []);
            const network = await provider.getNetwork();
            setChainId(network.chainId);
            if (accounts.length > 0) {
                setCurrentAccount(accounts[0]);
                setAccount(accounts[0]);
            }
        };
        checkWallet();

        if (window.ethereum) {
            const handleAccountsChanged = (accounts) => {
                if (accounts.length > 0) {
                    setCurrentAccount(accounts[0]);
                    setAccount(accounts[0]);
                } else {
                    setCurrentAccount("");
                    setAccount("");
                }
            };
            const handleChainChanged = () => window.location.reload();
            window.ethereum.on("accountsChanged", handleAccountsChanged);
            window.ethereum.on("chainChanged", handleChainChanged);
            return () => {
                window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
                window.ethereum.removeListener("chainChanged", handleChainChanged);
            };
        }
    }, [setAccount]);

    /* ── Connected state ── */
    if (currentAccount) {
        return (
            <div className="flex flex-col items-center gap-3 mb-12">
                <div className="flex flex-col sm:flex-row items-center gap-3">
                    {/* Address badge */}
                    <div className="flex items-center gap-2 bg-gray-900/70 border border-gray-700/60 px-4 py-2.5 rounded-xl backdrop-blur-sm">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.9)]" />
                        <span className="text-gray-300 text-sm font-mono tracking-wide">
                            {truncateAddress(currentAccount)}
                        </span>
                        <button
                            onClick={copyAddress}
                            className="ml-1 text-gray-500 hover:text-gray-300 transition-colors text-xs"
                            title="Copy full address"
                        >
                            {copied ? "✓" : "⧉"}
                        </button>
                    </div>

                    {/* Network badge */}
                    {isCorrectNetwork ? (
                        <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/30 px-3 py-2.5 rounded-xl text-emerald-400 text-xs font-semibold">
                            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                            Localhost 8545
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 bg-red-950/60 border border-red-500/30 px-3 py-2.5 rounded-xl text-red-400 text-xs font-semibold">
                                <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
                                Wrong Network
                            </div>
                            <button
                                onClick={switchNetwork}
                                className="bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition-all border border-red-500/50"
                            >
                                Switch
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    /* ── Disconnected state ── */
    return (
        <div className="flex justify-center mb-12">
            <button
                onClick={connectWallet}
                disabled={connecting}
                className="group flex items-center gap-3 bg-gradient-to-r from-blue-600 to-violet-600
                           hover:from-blue-500 hover:to-violet-500 disabled:opacity-60
                           text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300
                           shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0"
            >
                <MetaMaskIcon size={22} />
                {connecting ? (
                    <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Connecting…
                    </span>
                ) : (
                    "Connect Wallet"
                )}
            </button>
        </div>
    );
}
