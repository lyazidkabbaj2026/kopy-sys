"use client";

import { useState, useMemo } from "react";
import {
    Download, Trash2, Globe, Phone,
    Search, Filter, ArrowUpDown, FileSpreadsheet,
    MapPin, Star, Users, Sparkles, Loader2,
    Zap, Copy, Check, X, Trash, Archive
} from "lucide-react";
import { Lead } from "@prisma/client";
import AIPersonalizerModal from "./AIPersonalizerModal";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition, useEffect } from "react";
import {
    deleteLeadAction,
    bulkDeleteLeadsAction,
    auditLeadAction,
    personalizeLeadAction,
    exportLeadsAction
} from "@/app/actions/leads";

interface LeadsTableProps {
    leads: Lead[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
}

export default function LeadsTable({ leads, totalCount, currentPage, totalPages }: LeadsTableProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    // 1. CRM State Management (URL-Driven & Derived)
    const [inputValue, setInputValue] = useState(searchParams.get("q") || "");
    const statusFilter = searchParams.get("status") || "all";
    const ratingFilter = searchParams.get("rating") || "all";
    const categoryFilter = searchParams.get("category") || "all";

    // Implement Search Debounce
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (inputValue !== (searchParams.get("q") || "")) {
                updateQuery({ q: inputValue });
            }
        }, 500);
        return () => clearTimeout(timeout);
    }, [inputValue, searchParams]);

    // Helper to update URL params
    const updateQuery = (updates: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString());
        
        // Auto-reset pagination if changing filters/sort
        if (!updates.page) {
            params.set("page", "1");
        }

        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === "all" || value === "") {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        });
        const query = params.toString();
        router.push(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
    };


    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [auditingId, setAuditingId] = useState<string | null>(null);
    const [personalizingId, setPersonalizingId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [copySuccess, setCopySuccess] = useState<string | null>(null);

    // 2. Dynamic Data Extraction
    const categories = useMemo(() => {
        const unique = new Set(leads.map(l => l.category).filter(Boolean));
        return Array.from(unique) as string[];
    }, [leads]);

    // 3. Selection & Actions (Simplified to use leads prop directly)
    const isAllVisibleSelected = leads.length > 0 && leads.every(l => selectedIds.includes(l.id));

    const toggleSelectAll = () => {
        if (isAllVisibleSelected) {
            const visibleIds = leads.map(l => l.id);
            setSelectedIds(prev => prev.filter(id => !visibleIds.includes(id)));
        } else {
            const newIds = leads.map(l => l.id).filter(id => !selectedIds.includes(id));
            setSelectedIds(prev => [...prev, ...newIds]);
        }
    };


    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSort = (key: keyof Lead) => {
        const currentDir = searchParams.get("sortDir") === "asc" ? "asc" : "desc";
        const currentKey = searchParams.get("sortBy") || "createdAt";
        
        let direction: 'asc' | 'desc' = 'desc';
        if (currentKey === key && currentDir === 'desc') {
            direction = 'asc';
        }
        
        updateQuery({ sortBy: key, sortDir: direction });
    };

    const handleCopyInfo = (lead: Lead) => {
        const info = `${lead.businessName}\n${lead.phone || ""}\n${lead.website || ""}`;
        navigator.clipboard.writeText(info.trim());
        setCopySuccess(lead.id);
        setTimeout(() => setCopySuccess(null), 2000);
    };

    const handleDelete = (id: string) => {
        if (!confirm("Are you sure you want to delete this lead?")) return;
        setDeletingId(id);
        startTransition(async () => {
            const result = await deleteLeadAction(id);
            if (result.success) {
                // Patch state memory leak: remove from selection if it was selected
                setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
            } else {
                alert(`Delete error: ${result.error}`);
            }
            setDeletingId(null);
        });
    };

    const handleBulkDelete = () => {
        if (!confirm(`Delete ${selectedIds.length} leads?`)) return;
        startTransition(async () => {
            const result = await bulkDeleteLeadsAction(selectedIds);
            if (result.success) {
                setSelectedIds([]);
            } else {
                alert(`Bulk delete error: ${result.error}`);
            }
        });
    };

    // Server-Side CSV Export Logic
    const handleDownloadCSV = (csvContent: string, filename: string) => {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportAll = async () => {
        startTransition(async () => {
            const currentFilters = Object.fromEntries(searchParams.entries());
            const result = await exportLeadsAction(currentFilters);
            if (result.success && result.data) {
                handleDownloadCSV(result.data, `leads-master-${new Date().toISOString().split('T')[0]}.csv`);
            }
        });
    };

    const handleBulkExport = async () => {
        if (selectedIds.length === 0) return;
        startTransition(async () => {
            const result = await exportLeadsAction(undefined, selectedIds);
            if (result.success && result.data) {
                handleDownloadCSV(result.data, `leads-export-${selectedIds.length}.csv`);
            }
        });
    };

    const handleAudit = (leadId: string) => {
        setAuditingId(leadId);
        startTransition(async () => {
            const result = await auditLeadAction(leadId);
            if (result.success) {
                // revalidatePath handles the UI sync
            } else {
                alert(`Audit failed: ${result.error}`);
            }
            setAuditingId(null);
        });
    };

    const handlePersonalize = (leadId: string) => {
        setPersonalizingId(leadId);
        startTransition(async () => {
            const result = await personalizeLeadAction(leadId);
            if (result.success) {
                // Fetch the updated lead from the list or we'd need to fetch it separately
                // Since router.refresh() is async, we might want the action to return the lead
                const updatedLead = leads.find(l => l.id === leadId);
                if (updatedLead) {
                    setSelectedLead({ ...updatedLead, aiMessageDraft: result.data as string });
                    setIsModalOpen(true);
                }
            } else {
                alert(`AI Personalization failed: ${result.error}`);
            }
            setPersonalizingId(null);
        });
    };

    const handleSaveAISuccess = (newMessage: string) => {
        setIsModalOpen(false);
    };

    const resetFilters = () => {
        setInputValue("");
        router.push(pathname, { scroll: false });
    };

    return (
        <div className="w-full space-y-4">
            {/* Header / Filter Row */}
            <div className="bg-panel/40 p-4 rounded-xl border border-border-subtle backdrop-blur-md">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Enter to search..."
                            className="w-full bg-background/50 border border-border-subtle rounded-lg pl-10 pr-4 py-2.5 text-xs text-text-main focus:border-neon outline-none transition-all"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2">
                        <select
                            className="flex-1 bg-background/50 border border-border-subtle rounded-lg px-3 py-2.5 text-xs text-text-muted outline-none focus:border-neon"
                            value={statusFilter}
                            onChange={(e) => updateQuery({ status: e.target.value })}
                        >
                            <option value="all">Every Status</option>
                            <option value="SCRAPED">Completed</option>
                            <option value="PENDING">Processing</option>
                            <option value="AUDITED">Audited</option>
                            <option value="MESSAGED">Messaged</option>
                        </select>

                        <select
                            className="flex-1 bg-background/50 border border-border-subtle rounded-lg px-3 py-2.5 text-xs text-text-muted outline-none focus:border-neon"
                            value={ratingFilter}
                            onChange={(e) => updateQuery({ rating: e.target.value })}
                        >
                            <option value="all">Any Rating</option>
                            <option value="high">★★★★+ (High)</option>
                            <option value="mid">★★★ (Medium)</option>
                            <option value="low">Under ★★★</option>
                        </select>
                    </div>

                    <select
                        className="bg-background/50 border border-border-subtle rounded-lg px-3 py-2.5 text-xs text-text-muted outline-none focus:border-neon"
                        value={categoryFilter}
                        onChange={(e) => updateQuery({ category: e.target.value })}
                    >
                        <option value="all">All Niches</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>

                    <button
                        onClick={handleExportAll}
                        className="flex items-center justify-center gap-2 bg-panel border border-border-subtle hover:border-neon hover:text-neon text-text-main px-4 py-2 rounded-lg text-xs font-semibold transition-all group"
                    >
                        <FileSpreadsheet className="h-4 w-4 transform group-hover:scale-110 transition-transform" />
                        Master CSV
                    </button>
                </div>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto rounded-xl border border-border-subtle shadow-2xl shadow-neon/5">
                <table className="w-full text-left border-separate border-spacing-0">
                    <thead>
                        <tr className="bg-panel/20 text-[10px] uppercase text-text-muted font-bold tracking-widest border-b border-border-subtle">
                            <th className="p-4 border-b border-border-subtle w-12 text-center">
                                <input
                                    type="checkbox"
                                    className="rounded border-border-subtle bg-background text-neon focus:ring-neon accent-neon h-4 w-4 cursor-pointer"
                                    checked={isAllVisibleSelected}
                                    onChange={toggleSelectAll}
                                />
                            </th>
                            <th
                                className="p-4 border-b border-border-subtle cursor-pointer hover:text-neon transition-colors"
                                onClick={() => handleSort('businessName')}
                            >
                                <div className="flex items-center gap-2">BUSINESS NAME <ArrowUpDown className="h-3.5 w-3.5" /></div>
                            </th>
                            <th className="p-4 border-b border-border-subtle px-4">REPUTATION</th>
                            <th
                                className="p-4 border-b border-border-subtle px-4 cursor-pointer hover:text-neon transition-colors"
                                onClick={() => handleSort('reviewsCount')}
                            >
                                <div className="flex items-center gap-2">REVIEWS <ArrowUpDown className="h-3.5 w-3.5" /></div>
                            </th>
                            <th className="p-4 border-b border-border-subtle px-4">LOCATION</th>
                            <th className="p-4 border-b border-border-subtle px-4">STATUS</th>
                            <th className="p-4 border-b border-border-subtle px-4">CONTACT</th>
                            <th className="p-4 border-b border-border-subtle px-4">SCRAPE DATE</th>
                            <th className="p-4 border-b border-border-subtle text-right pr-6">ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody className="text-xs">
                        {leads.length > 0 ? (
                            leads.map((lead) => (
                                <tr key={lead.id} className={`group hover:bg-neon/5 transition-all duration-200 border-b border-border-subtle/30 ${selectedIds.includes(lead.id) ? 'bg-neon/10' : ''}`}>
                                    <td className="p-4 border-b border-border-subtle/10 text-center">
                                        <input
                                            type="checkbox"
                                            className="rounded border-border-subtle bg-background text-neon focus:ring-neon accent-neon h-4 w-4 cursor-pointer"
                                            checked={selectedIds.includes(lead.id)}
                                            onChange={() => toggleSelect(lead.id)}
                                        />
                                    </td>
                                    <td className="p-4 border-b border-border-subtle/10">
                                        <div className="flex flex-col max-w-[200px]">
                                            <span className="text-text-main font-bold truncate text-[13px]" title={lead.businessName}>{lead.businessName}</span>
                                            <span className="text-[10px] text-text-muted mt-0.5">{lead.category || "General"}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 border-b border-border-subtle/10">
                                        <div className="flex flex-col gap-1.5 w-32">
                                            <div className="flex items-center gap-1.5">
                                                <div className="flex items-center">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`h-3 w-3 ${i < Math.floor(lead.rating || 0) ? 'text-neon fill-neon' : 'text-text-muted/30'}`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-[11px] font-bold text-white">
                                                    {lead.rating ? `${lead.rating.toFixed(1)}/5` : "N/A"}
                                                </span>
                                            </div>
                                            {lead.rating ? (
                                                <div className="w-full bg-background rounded-full h-1 border border-border-subtle overflow-hidden">
                                                    <div className="bg-neon h-full transition-all" style={{ width: `${lead.rating * 20}%` }} />
                                                </div>
                                            ) : (
                                                <span className="text-[9px] text-text-muted/50 italic font-medium px-2 py-0.5 bg-panel/30 rounded inline-block">No rating</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 border-b border-border-subtle/10">
                                        <div className="flex items-center gap-2 group/rev">
                                            <div className="p-1.5 rounded-md bg-panel/50 border border-border-subtle group-hover/rev:border-neon transition-colors">
                                                <Users className="h-3.5 w-3.5 text-text-muted" />
                                            </div>
                                            <span className="font-mono text-white text-[12px]">
                                                {lead.reviewsCount?.toLocaleString() || "0"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4 border-b border-border-subtle/10">
                                        <div className="flex items-center gap-2 text-text-muted">
                                            <MapPin className="h-3.5 w-3.5 text-neon/60" />
                                            <span className="text-[11px] font-medium">{lead.city || "Marrakech"}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 border-b border-border-subtle/10">
                                        <div className={`px-2.5 py-1 rounded-full text-[9px] font-black tracking-widest inline-flex items-center gap-1.5 border border-white/5
                                            ${lead.status === 'MESSAGED' ? 'bg-blue-500/10 text-blue-400' :
                                                lead.status === 'AUDITED' ? 'bg-purple-500/10 text-purple-400' :
                                                    lead.status === 'SCRAPED' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                                            <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                                            {lead.status}
                                        </div>
                                    </td>
                                    <td className="p-4 border-b border-border-subtle/10">
                                        <div className="flex items-center gap-2">
                                            {lead.website ? (
                                                <a href={lead.website} target="_blank" className="p-1.5 bg-background border border-border-subtle rounded-md text-text-muted hover:text-neon hover:border-neon transition-all" title="Open Link">
                                                    <Globe className="h-3.5 w-3.5" />
                                                </a>
                                            ) : (
                                                <div className="p-1.5 bg-panel/20 opacity-30 cursor-not-allowed">
                                                    <Globe className="h-3.5 w-3.5" />
                                                </div>
                                            )}
                                            {lead.phone ? (
                                                <a href={`tel:${lead.phone}`} className="p-1.5 bg-background border border-border-subtle rounded-md text-text-muted hover:text-neon hover:border-neon transition-all" title={lead.phone}>
                                                    <Phone className="h-3.5 w-3.5" />
                                                </a>
                                            ) : (
                                                <div className="p-1.5 bg-panel/20 opacity-30 cursor-not-allowed">
                                                    <Phone className="h-3.5 w-3.5" />
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 border-b border-border-subtle/10 whitespace-nowrap">
                                        <span className="text-[10px] text-text-muted font-mono">{new Date(lead.createdAt).toISOString().split('T')[0]}</span>
                                    </td>
                                    <td className="p-4 border-b border-border-subtle/10 text-right pr-6">
                                        <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleAudit(lead.id)}
                                                disabled={auditingId === lead.id}
                                                className="p-1.5 hover:bg-white/5 text-text-muted hover:text-white transition-all rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="AI Audit Site"
                                            >
                                                {auditingId === lead.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
                                            </button>
                                            <button
                                                onClick={() => handlePersonalize(lead.id)}
                                                disabled={personalizingId === lead.id}
                                                className="p-1.5 hover:bg-neon/10 text-text-muted hover:text-neon transition-all rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="Generate Message"
                                            >
                                                {personalizingId === lead.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                                            </button>
                                            <button
                                                onClick={() => handleCopyInfo(lead)}
                                                className="p-1.5 hover:bg-white/5 text-text-muted hover:text-white transition-all rounded-md"
                                                title="Copy Info"
                                            >
                                                {copySuccess === lead.id ? <Check className="h-3.5 w-3.5 text-neon" /> : <Copy className="h-3.5 w-3.5" />}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(lead.id)}
                                                disabled={deletingId === lead.id}
                                                className="p-1.5 hover:bg-red-500/10 text-text-muted hover:text-red-500 transition-all rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="Remove"
                                            >
                                                {deletingId === lead.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash className="h-3.5 w-3.5" />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={9} className="py-32 text-center">
                                    <div className="flex flex-col items-center gap-4 max-w-sm mx-auto">
                                        <div className="p-6 rounded-full bg-background border border-border-subtle text-text-muted opacity-20 relative">
                                            <Archive className="h-12 w-12" />
                                            <div className="absolute -inset-1 border border-neon/30 rounded-full blur-md" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-sm font-bold text-white uppercase tracking-widest">No matching leads</h3>
                                            <p className="text-xs text-text-muted font-medium">Your current filters returned zero results.</p>
                                        </div>
                                        <button
                                            onClick={resetFilters}
                                            className="px-6 py-2 bg-panel border border-border-subtle text-xs font-bold text-white hover:border-neon hover:text-neon transition-all rounded-lg"
                                        >
                                            Clear All Filters
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Floating Bulk Actions Bar */}
            {selectedIds.length > 0 && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 px-8 py-4 bg-[#0a0a0a]/95 border border-neon/40 rounded-2xl shadow-[0_0_50px_-12px_rgba(0,255,153,0.3)] backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-500 z-[90]">
                    <div className="flex items-center gap-3">
                        <div className="h-7 w-7 rounded-full bg-neon flex items-center justify-center text-[11px] font-black text-black">
                            {selectedIds.length}
                        </div>
                        <span className="text-xs font-bold text-white uppercase tracking-widest">Leads Selected</span>
                    </div>

                    <div className="h-6 w-px bg-white/10" />

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleBulkExport}
                            disabled={isPending}
                            className="flex items-center gap-2 px-4 py-2 bg-panel border border-border-subtle hover:border-white transition-all rounded-lg text-xs font-bold group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Download className="h-4 w-4 transform group-hover:-translate-y-0.5 transition-transform" />
                            Direct Export
                        </button>
                        <button
                            onClick={handleBulkDelete}
                            disabled={isPending}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all rounded-lg text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete Permanent
                        </button>
                        <button
                            onClick={() => setSelectedIds([])}
                            className="p-2 hover:bg-white/5 rounded-lg text-text-muted transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* 6. High-Performance Server-Side Pagination */}
            <div className="p-4 border-t border-border-subtle/10 flex items-center justify-between">
                <p className="text-[10px] text-text-muted">
                    Showing <span className="text-white font-medium">{leads.length}</span> of <span className="text-white font-medium">{totalCount}</span> results
                </p>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => updateQuery({ page: (currentPage - 1).toString() })}
                        disabled={currentPage <= 1 || isPending}
                        className="px-3 py-1.5 rounded-md border border-border-subtle text-[10px] text-text-muted hover:text-white hover:border-neon transition-all disabled:opacity-30 disabled:hover:border-border-subtle"
                    >
                        Previous
                    </button>
                    <div className="flex items-center gap-1.5 px-2">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            // Simple pagination window logic
                            let pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                            if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                            if (pageNum <= 0) return null;
                            
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => updateQuery({ page: pageNum.toString() })}
                                    className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] transition-all ${
                                        currentPage === pageNum 
                                        ? 'bg-neon/10 border border-neon text-neon' 
                                        : 'text-text-muted hover:text-white hover:border-border-subtle border border-transparent'
                                    }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                    </div>
                    <button
                        onClick={() => updateQuery({ page: (currentPage + 1).toString() })}
                        disabled={currentPage >= totalPages || isPending}
                        className="px-3 py-1.5 rounded-md border border-border-subtle text-[10px] text-text-muted hover:text-white hover:border-neon transition-all disabled:opacity-30 disabled:hover:border-border-subtle"
                    >
                        Next
                    </button>
                </div>
            </div>

            {selectedLead && (
                <AIPersonalizerModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedLead(null);
                    }}
                    businessName={selectedLead.businessName}
                    draftMessage={selectedLead.aiMessageDraft || ""}
                    onSave={handleSaveAISuccess}
                />
            )}
        </div>
    );
}