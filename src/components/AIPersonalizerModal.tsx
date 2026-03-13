"use client";

import { X, Copy, Check, Send } from "lucide-react";
import { useState } from "react";

interface AIPersonalizerModalProps {
    isOpen: boolean;
    onClose: () => void;
    businessName: string;
    draftMessage: string;
    onSave: (newMessage: string) => void;
}

export default function AIPersonalizerModal({
    isOpen,
    onClose,
    businessName,
    draftMessage,
    onSave
}: AIPersonalizerModalProps) {
    const [message, setMessage] = useState(draftMessage);
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(message);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-panel border border-border-subtle rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-panel/50">
                    <div>
                        <h3 className="text-sm font-semibold text-white">AI Personalizer</h3>
                        <p className="text-[10px] text-text-muted">Personalized outreach for <span className="text-neon">{businessName}</span></p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                        <X className="h-4 w-4 text-text-muted" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full h-64 bg-background border border-border-subtle rounded-xl p-4 text-xs text-text-main focus:border-neon outline-none transition-all resize-none leading-relaxed font-sans"
                        placeholder="AI generating message..."
                    />

                    <div className="flex items-center justify-between gap-3">
                        <p className="text-[10px] text-text-muted italic">
                            Tip: You can manually edit the AI's draft before sending.
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleCopy}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-panel border border-border-subtle text-xs font-medium text-text-main hover:border-white transition-all"
                            >
                                {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                                {copied ? "Copied" : "Copy Draft"}
                            </button>
                            <button
                                onClick={() => onSave(message)}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neon text-background text-xs font-bold hover:bg-neon/90 transition-all"
                            >
                                <Send className="h-3.5 w-3.5" />
                                Save & Send
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
