"use client";
import { useState, useEffect } from "react";
import { getContract, getProvider } from "../utils/contract";

const AVATAR_GRADIENTS = [
    "from-blue-500 to-indigo-600",
    "from-violet-500 to-purple-600",
    "from-rose-500 to-pink-600",
    "from-amber-500 to-orange-500",
    "from-emerald-500 to-teal-600",
    "from-cyan-500 to-blue-500",
];

function getInitials(name) {
    return name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

function SkeletonCard() {
    return (
        <div className="bg-gray-900/50 border border-gray-800/60 rounded-2xl p-6 space-y-4">
            <div className="animate-shimmer rounded-2xl h-14 w-14" />
            <div className="animate-shimmer rounded-lg h-6 w-2/3" />
            <div className="animate-shimmer rounded-lg h-4 w-1/2" />
            <div className="animate-shimmer rounded-full h-2 w-full" />
            <div className="animate-shimmer rounded-xl h-11 w-full mt-2" />
        </div>
    );
}

function Confetti({ show }) {
    if (!show) return null;
    const colors = ["#60a5fa", "#a78bfa", "#f472b6", "#34d399", "#fbbf24", "#fb923c"];
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl z-20">
            {Array.from({ length: 28 }).map((_, i) => (
                <div
                    key={i}
                    className="confetti-particle"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: "-10px",
                        backgroundColor: colors[i % colors.length],
                        animationDelay: `${Math.random() * 0.4}s`,
                        animationDuration: `${0.9 + Math.random() * 0.7}s`,
                        width: `${5 + Math.random() * 8}px`,
                        height: `${5 + Math.random() * 8}px`,
                        borderRadius: Math.random() > 0.5 ? "50%" : "3px",
                    }}
                />
            ))}
        </div>
    );
}

export default function CandidateList({ account, addToast }) {
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [votingFor, setVotingFor] = useState(null);
    const [hasVoted, setHasVoted] = useState(false);
    const [votedFor, setVotedFor] = useState(null); // local – which candidate ID the user voted for
    const [showConfetti, setShowConfetti] = useState(false);
    const [barsVisible, setBarsVisible] = useState(false);

    const totalVotes = candidates.reduce((s, c) => s + parseInt(c.voteCount), 0);

    const fetchCandidates = async () => {
        setLoading(true);
        try {
            const provider = getProvider();
            if (!provider) return;
            const signer = await provider.getSigner();
            const contract = await getContract(signer);
            const data = await contract.getCandidates();
            const formatted = data.map((c) => ({
                id: c.id.toString(),
                name: c.name,
                voteCount: c.voteCount.toString(),
            }));
            setCandidates(formatted);

            // Trigger bar animation after state settles
            setBarsVisible(false);
            setTimeout(() => setBarsVisible(true), 80);

            try {
                const voted = await contract.voters(account);
                setHasVoted(voted);
            } catch {
                // voters mapping may not be public – ignore
            }
        } catch (err) {
            console.error("Error fetching candidates:", err);
            addToast("error", "Failed to load candidates. Is your Hardhat node running?", "Connection Error");
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async (candidateId) => {
        if (!account) {
            addToast("error", "Please connect your wallet first.", "Not Connected");
            return;
        }
        setVotingFor(candidateId);
        try {
            const provider = getProvider();
            const signer = await provider.getSigner();
            const contract = await getContract(signer);

            addToast("pending", "Waiting for transaction confirmation…", "Transaction Pending");
            const tx = await contract.vote(candidateId);
            await tx.wait();

            setVotedFor(candidateId);
            setHasVoted(true);
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 2200);
            addToast("success", "Your vote has been permanently recorded on the blockchain!", "Vote Cast!");
            await fetchCandidates();
        } catch (err) {
            console.error("Vote error:", err);
            const msg =
                err.reason ||
                err.message?.split("(")[0]?.trim() ||
                "Transaction failed. See console for details.";
            addToast("error", msg, "Vote Failed");
        } finally {
            setVotingFor(null);
        }
    };

    useEffect(() => {
        if (account) fetchCandidates();
    }, [account]);

    /* ── No wallet ── */
    if (!account) {
        return (
            <div className="text-center py-24">
                <div className="text-6xl mb-5 animate-float inline-block select-none">🗳️</div>
                <p className="text-gray-500 text-lg">Connect your wallet to participate in voting</p>
            </div>
        );
    }

    /* ── Loading skeleton ── */
    if (loading && candidates.length === 0) {
        return (
            <div>
                <div className="animate-shimmer rounded-full h-9 w-52 mx-auto mb-8" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
                </div>
            </div>
        );
    }

    /* ── Determine leader ── */
    const leaderVotes = Math.max(...candidates.map((c) => parseInt(c.voteCount)));
    const leaderId =
        totalVotes > 0
            ? candidates.find((c) => parseInt(c.voteCount) === leaderVotes)?.id
            : null;

    return (
        <div>
            {/* ── Total votes banner ── */}
            <div className="flex items-center justify-center gap-4 mb-8">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-700 to-transparent max-w-32" />
                <div className="flex items-center gap-2 bg-gray-900/60 border border-gray-700/50 rounded-full px-5 py-2 text-sm">
                    <span className="text-gray-500">Total Votes Cast:</span>
                    <span className="text-white font-bold font-mono text-base">{totalVotes}</span>
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-700 to-transparent max-w-32" />
            </div>

            {/* ── Voted notice ── */}
            {hasVoted && (
                <div className="flex items-center justify-center gap-2 mb-8 bg-emerald-950/50 border border-emerald-500/20 rounded-xl py-3 px-5 max-w-xs mx-auto">
                    <span className="text-emerald-400">✓</span>
                    <p className="text-emerald-400 text-sm font-medium">Your vote has been recorded</p>
                </div>
            )}

            {/* ── Candidate grid ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
                <Confetti show={showConfetti} />

                {candidates.map((candidate, index) => {
                    const votes = parseInt(candidate.voteCount);
                    const pct = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
                    const isLeader = candidate.id === leaderId;
                    const isVotedFor = votedFor === candidate.id;
                    const isVotingThis = votingFor === candidate.id;
                    const gradient = AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length];

                    return (
                        <div
                            key={candidate.id}
                            className={`relative bg-gray-900/60 backdrop-blur-sm p-6 rounded-2xl border
                                        transition-all duration-300 group
                                        hover:-translate-y-1 hover:shadow-xl
                                        ${isLeader
                                            ? "border-yellow-500/40 shadow-lg shadow-yellow-500/10"
                                            : isVotedFor
                                                ? "border-emerald-500/40 shadow-lg shadow-emerald-500/10"
                                                : "border-gray-700/50 hover:border-gray-600"
                                        }`}
                        >
                            {/* Leader crown */}
                            {isLeader && (
                                <span className="absolute -top-3.5 right-3 text-xl select-none">👑</span>
                            )}

                            {/* Avatar */}
                            <div
                                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient}
                                            flex items-center justify-center text-white font-bold text-xl
                                            mb-4 shadow-lg`}
                            >
                                {getInitials(candidate.name)}
                            </div>

                            {/* Name */}
                            <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-300 transition-colors">
                                {candidate.name}
                            </h3>

                            {/* Vote count + percentage */}
                            <div className="flex items-baseline justify-between mb-3">
                                <span className="text-gray-400 text-sm">
                                    <span className="text-white font-mono font-semibold text-base">{votes}</span>
                                    {" "}vote{votes !== 1 ? "s" : ""}
                                </span>
                                <span className="text-gray-500 text-sm font-mono">
                                    {pct.toFixed(1)}%
                                </span>
                            </div>

                            {/* Progress bar */}
                            <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden mb-5">
                                <div
                                    className={`absolute top-0 left-0 h-full rounded-full vote-bar
                                                ${isLeader
                                                    ? "bg-gradient-to-r from-yellow-400 to-amber-500"
                                                    : "bg-gradient-to-r from-blue-500 to-violet-500"
                                                }`}
                                    style={{ width: barsVisible ? `${pct}%` : "0%" }}
                                />
                            </div>

                            {/* Vote button */}
                            <button
                                onClick={() => handleVote(candidate.id)}
                                disabled={hasVoted || votingFor !== null}
                                className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-300
                                            flex items-center justify-center gap-2
                                            ${isVotedFor
                                                ? "bg-emerald-900/50 border border-emerald-500/40 text-emerald-400 cursor-default"
                                                : hasVoted
                                                    ? "bg-gray-800/50 text-gray-600 cursor-not-allowed border border-gray-700/30"
                                                    : isVotingThis
                                                        ? "bg-blue-600/50 text-white cursor-wait border border-blue-500/30"
                                                        : `bg-gradient-to-r from-blue-600 to-violet-600
                                                           hover:from-blue-500 hover:to-violet-500
                                                           text-white shadow-md hover:shadow-blue-500/25
                                                           hover:-translate-y-0.5 active:translate-y-0
                                                           border border-transparent`
                                            }`}
                            >
                                {isVotingThis ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Confirming…
                                    </>
                                ) : isVotedFor ? (
                                    <>✓ Voted</>
                                ) : hasVoted ? (
                                    "Vote Closed"
                                ) : (
                                    "Cast Vote"
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>

            {candidates.length === 0 && !loading && (
                <p className="text-center text-gray-500 py-12">
                    No candidates found. Make sure the contract is deployed and the node is running.
                </p>
            )}
        </div>
    );
}
