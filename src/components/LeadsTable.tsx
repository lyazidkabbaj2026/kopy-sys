"use client";

import { useState, useMemo } from "react";
import {
    Download, Edit2, Trash2, Globe, Phone,
    Search, Filter, ArrowUpDown, FileSpreadsheet,
    MapPin, Star, Users, LayoutDashboard, Sparkles, Loader2,
    Zap, Copy, Check, X, MoreHorizontal, Trash, ChevronDown, Archive
} from "lucide-react";
import { Lead } from "@prisma/client";
import AIPersonalizerModal from "./AIPersonalizerModal";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";

export default function LeadsTable({ leads }: { leads: Lead[] }) {
    const router = useRouter();
    
    // 1. CRM State Management
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [ratingFilter, setRatingFilter] = useState<string>("all");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");
    const [sortConfig, setSortConfig] = useState<{ key: keyof Lead, direction: 'asc' | 'desc' } | null>({ key: 'createdAt', direction: 'desc' });
    
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [auditingId, setAuditingId] = useState<string | null>(null);
    const [personalizingId, setPersonalizingId] = useState<string | null>(null);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [copySuccess, setCopySuccess] = useState<string | null>(null);

    // 2. Dynamic Data Extraction
    const categories = useMemo(() => {
        const unique = new Set(leads.map(l => l.category).filter(Boolean));
        return Array.from(unique) as string[];
    }, [leads]);

    // 3. Advanced Filtering & Search Logic
    const filteredLeads = useMemo(() => {
        let result = [...leads];

        // Global Search (Name, Category, City)
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            result = result.filter(l =>
                l.businessName.toLowerCase().includes(search) ||
                l.category?.toLowerCase().includes(search) ||
                l.city?.toLowerCase().includes(search)
            );
        }

        // Status Filter
        if (statusFilter !== "all") {
            result = result.filter(l => l.status === statusFilter);
        }

        // Rating Filter
        if (ratingFilter !== "all") {
            result = result.filter(l => {
                if (!l.rating) return false;
                if (ratingFilter === "low") return l.rating < 3;
                if (ratingFilter === "mid") return l.rating >= 3 && l.rating < 4;
                if (ratingFilter === "high") return l.rating >= 4;
                return true;
            });
        }

        // Category/Niche Filter
        if (categoryFilter !== "all") {
            result = result.filter(l => l.category === categoryFilter);
        }

        // Sorting
        if (sortConfig) {
            result.sort((a, b) => {
                const aValue = a[sortConfig.key] ?? "";
                const bValue = b[sortConfig.key] ?? "";
                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [leads, searchTerm, statusFilter, ratingFilter, categoryFilter, sortConfig]);

    // 4. Action Handlers
    const toggleSelectAll = () => {
        if (selectedIds.length === filteredLeads.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredLeads.map(l => l.id));
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSort = (key: keyof Lead) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleCopyInfo = (lead: Lead) => {
        const info = `${lead.businessName}\n${lead.phone || ""}\n${lead.website || ""}`;
        navigator.clipboard.writeText(info.trim());
        setCopySuccess(lead.id);
        setTimeout(() => setCopySuccess(null), 2000);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this lead?")) return;
        try {
            await apiClient.delete(`/api/leads/${id}`);
            router.refresh();
        } catch (err: any) {
            alert(`Delete error: ${err.message}`);
        }
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Delete ${selectedIds.length} leads?`)) return;
        try {
            await apiClient.post("/api/leads/bulk-delete", { ids: selectedIds });
            setSelectedIds([]);
            router.refresh();
        } catch (err: any) {
            alert(`Bulk delete error: ${err.message}`);
        }
    };

    const exportToCSV = () => {
        const headers = ["Business Name", "Category", "Rating", "Review Count", "City", "Status", "Website", "Phone", "Scraped Date"];
        const rows = filteredLeads.map(l => [
            l.businessName, 
            l.category, 
            l.rating || "N/A", 
            l.reviewsCount || 0,
            l.city,
            l.status, 
            l.website, 
            l.phone, 
            l.createdAt
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", `nxsurge_leads_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleBulkExport = () => {
        const selected = leads.filter(l => selectedIds.includes(l.id));
        const headers = ["Business Name", "Category", "Rating", "Reviews", "City", "Website", "Phone"];
        const rows = selected.map(l => [l.businessName, l.category, l.rating, l.reviewsCount, l.city, l.website, l.phone]);
        const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `exported_leads_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const handleAudit = async (leadId: string) => {
        setAuditingId(leadId);
        try {
            await apiClient.post("/api/audit", { leadId });
            router.refresh();
        } catch (err: any) {
            alert(`Audit failed: ${err.message}`);
        } finally {
            setAuditingId(null);
        }
    };

    const handlePersonalize = async (leadId: string) => {
        setPersonalizingId(leadId);
        try {
            const data = await apiClient.post<Lead>("/api/personalize", { leadId });
            setSelectedLead(data);
            setIsModalOpen(true);
        } catch (err: any) {
            alert(`AI Personalization failed: ${err.message}`);
        } finally {
            setPersonalizingId(null);
        }
    };

    const handleSaveAISuccess = (newMessage: string) => {
        setIsModalOpen(false);
        router.refresh();
    };

    const resetFilters = () => {
        setSearchTerm("");
        setStatusFilter("all");
        setRatingFilter("all");
        setCategoryFilter("all");
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
                            placeholder="Search name, category, city..."
                            className="w-full bg-background/50 border border-border-subtle rounded-lg pl-10 pr-4 py-2.5 text-xs text-text-main focus:border-neon outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex gap-2">
                        <select
                            className="flex-1 bg-background/50 border border-border-subtle rounded-lg px-3 py-2.5 text-xs text-text-muted outline-none focus:border-neon"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
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
                            onChange={(e) => setRatingFilter(e.target.value)}
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
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="all">All Niches</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>

                    <button
                        onClick={exportToCSV}
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
                                    checked={filteredLeads.length > 0 && selectedIds.length === filteredLeads.length}
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
                        {filteredLeads.length > 0 ? (
                            filteredLeads.map((lead) => (
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
                                        <span className="text-[10px] text-text-muted font-mono">{new Date(lead.createdAt).toLocaleDateString()}</span>
                                    </td>
                                    <td className="p-4 border-b border-border-subtle/10 text-right pr-6">
                                        <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => handleAudit(lead.id)}
                                                className="p-1.5 hover:bg-white/5 text-text-muted hover:text-white transition-all rounded-md"
                                                title="AI Audit Site"
                                            >
                                                {auditingId === lead.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
                                            </button>
                                            <button 
                                                onClick={() => handlePersonalize(lead.id)}
                                                className="p-1.5 hover:bg-neon/10 text-text-muted hover:text-neon transition-all rounded-md"
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
                                                className="p-1.5 hover:bg-red-500/10 text-text-muted hover:text-red-500 transition-all rounded-md"
                                                title="Remove"
                                            >
                                                <Trash className="h-3.5 w-3.5" />
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
                            className="flex items-center gap-2 px-4 py-2 bg-panel border border-border-subtle hover:border-white transition-all rounded-lg text-xs font-bold group"
                        >
                            <Download className="h-4 w-4 transform group-hover:-translate-y-0.5 transition-transform" />
                            Direct Export
                        </button>
                        <button 
                            onClick={handleBulkDelete}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all rounded-lg text-xs font-bold"
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