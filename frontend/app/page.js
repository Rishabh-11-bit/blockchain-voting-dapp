"use client";
import { useState, useCallback } from "react";
import ConnectWallet from "../components/ConnectWallet";
import CandidateList from "../components/CandidateList";
import ToastContainer from "../components/Toast";

export default function Home() {
    const [account, setAccount] = useState("");
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((type, message, title) => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, type, message, title }]);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <div className="min-h-screen bg-[#0a0f23] text-white font-sans selection:bg-blue-500 selection:text-white overflow-x-hidden">

            {/* Ambient background glow orbs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute -top-40 left-[8%]  w-[640px] h-[640px] bg-blue-700/10   rounded-full blur-[130px]" />
                <div className="absolute bottom-[-8%] right-[4%]  w-[500px] h-[500px] bg-purple-700/10 rounded-full blur-[110px]" />
                <div className="absolute top-[45%] left-[55%]  w-[320px] h-[320px] bg-indigo-600/7  rounded-full blur-[90px]"  />
            </div>

            <div className="relative z-10">
                <main className="container mx-auto px-4 py-14 max-w-5xl">

                    {/* ── Header ── */}
                    <header className="text-center mb-14">
                        {/* Ethereum badge */}
                        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-400/80 bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 rounded-full mb-6">
                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                            Ethereum Blockchain
                        </div>

                        <h1
                            className="text-5xl md:text-7xl font-extrabold bg-clip-text text-transparent
                                       bg-gradient-to-r from-blue-400 via-violet-400 to-purple-500
                                       mb-5 animate-gradient-x leading-tight pb-1"
                        >
                            Decentralized Voting
                        </h1>

                        <p className="text-lg text-gray-400 max-w-xl mx-auto leading-relaxed">
                            Secure, transparent &amp; immutable — every vote is permanently recorded on the Ethereum blockchain.
                        </p>
                    </header>

                    {/* ── Wallet connection ── */}
                    <ConnectWallet setAccount={setAccount} addToast={addToast} />

                    {/* ── How it works — shown only when disconnected ── */}
                    {!account && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16 mt-4 max-w-2xl mx-auto">
                            {[
                                { icon: "🔗", title: "Connect",  body: "Link your MetaMask wallet to get started." },
                                { icon: "🗳️",  title: "Vote",     body: "Choose your candidate and submit on-chain." },
                                { icon: "📊",  title: "Results",  body: "Live vote tallies — fully transparent." },
                            ].map(({ icon, title, body }) => (
                                <div key={title} className="bg-gray-900/40 border border-gray-800/60 rounded-2xl p-5 text-center">
                                    <div className="text-3xl mb-2">{icon}</div>
                                    <h3 className="text-white font-bold mb-1 text-sm">{title}</h3>
                                    <p className="text-gray-500 text-xs leading-relaxed">{body}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ── Candidates ── */}
                    <CandidateList account={account} addToast={addToast} />
                </main>

                {/* ── Footer ── */}
                <footer className="py-10 text-center border-t border-gray-800/50 mt-16">
                    <p className="text-gray-600 text-sm">
                        Built with{" "}
                        <span className="text-gray-500">Solidity</span> ·{" "}
                        <span className="text-gray-500">Hardhat</span> ·{" "}
                        <span className="text-gray-500">Next.js</span> ·{" "}
                        <span className="text-gray-500">ethers.js</span>
                    </p>
                </footer>
            </div>

            {/* ── Toast notifications ── */}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </div>
    );
}
