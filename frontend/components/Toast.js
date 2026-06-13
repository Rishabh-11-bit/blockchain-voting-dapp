"use client";
import { useEffect, useCallback } from "react";

const TOAST_CONFIG = {
    success: {
        bg:   "bg-emerald-950/95 border-emerald-500/40",
        text: "text-emerald-300",
        icon: "✓",
    },
    error: {
        bg:   "bg-red-950/95 border-red-500/40",
        text: "text-red-300",
        icon: "✕",
    },
    info: {
        bg:   "bg-blue-950/95 border-blue-500/40",
        text: "text-blue-300",
        icon: "ℹ",
    },
    pending: {
        bg:   "bg-amber-950/95 border-amber-500/40",
        text: "text-amber-300",
        icon: "⏳",
    },
};

function ToastItem({ toast, onRemove }) {
    const remove = useCallback(() => onRemove(toast.id), [toast.id, onRemove]);

    useEffect(() => {
        const timer = setTimeout(remove, toast.type === "pending" ? 6000 : 4500);
        return () => clearTimeout(timer);
    }, [remove, toast.type]);

    const cfg = TOAST_CONFIG[toast.type] ?? TOAST_CONFIG.info;

    return (
        <div
            className={`flex items-start gap-3 pl-4 pr-3 py-3 rounded-xl border
                        backdrop-blur-xl shadow-2xl animate-slide-in max-w-xs w-full
                        ${cfg.bg}`}
        >
            <span className={`text-sm font-bold mt-0.5 shrink-0 ${cfg.text}`}>
                {cfg.icon}
            </span>
            <div className="flex-1 min-w-0">
                {toast.title && (
                    <p className={`text-xs font-bold uppercase tracking-wider mb-0.5 ${cfg.text}`}>
                        {toast.title}
                    </p>
                )}
                <p className="text-sm text-gray-200 leading-snug">{toast.message}</p>
            </div>
            <button
                onClick={remove}
                className="text-gray-500 hover:text-gray-300 transition-colors shrink-0 mt-0.5 text-lg leading-none"
            >
                ×
            </button>
        </div>
    );
}

export default function ToastContainer({ toasts, removeToast }) {
    if (!toasts.length) return null;
    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
            {toasts.map((t) => (
                <div key={t.id} className="pointer-events-auto">
                    <ToastItem toast={t} onRemove={removeToast} />
                </div>
            ))}
        </div>
    );
}
