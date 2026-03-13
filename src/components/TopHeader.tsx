import { Search, Moon, Bell, Zap, Command, Menu } from "lucide-react";

export default function TopHeader() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-border-subtle bg-background/60 backdrop-blur-xl shrink-0 h-16">
            <div className="flex items-center justify-between h-full px-8 max-w-[1400px] mx-auto">

                {/* Brand & Left Navigation */}
                <div className="flex items-center gap-8">
                    <div className="text-neon font-bold text-xl tracking-tight cursor-pointer">
                        NXSURGE
                    </div>

                    {/* Integrated Search Command */}
                    <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-xl bg-panel/30 border border-border-subtle/50 group hover:border-neon/40 hover:bg-panel/50 transition-all cursor-text w-80 backdrop-blur-md">
                        <Search className="h-4 w-4 text-text-muted group-hover:text-neon transition-colors" />
                        <span className="text-xs text-text-muted flex-1">Quick Search Leads...</span>
                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-background/50 border border-border-subtle/50 text-[10px] text-text-muted group-hover:text-text-main transition-colors">
                            <Command className="h-2.5 w-2.5" />
                            <span>K</span>
                        </div>
                    </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2">
                    {/* Pro Badge - Now in Header */}
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neon-dim border border-neon/20 text-[10px] font-bold text-neon uppercase tracking-wider mr-2">
                        <Zap className="h-3 w-3 fill-neon" />
                        Pro Plan
                    </div>

                    <div className="flex items-center gap-1 p-1 rounded-xl bg-panel/30 border border-border-subtle">
                        <button className="p-2 text-text-muted hover:text-text-main hover:bg-white/5 rounded-lg transition-all">
                            <Moon className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-text-muted hover:text-text-main hover:bg-white/5 rounded-lg transition-all relative">
                            <Bell className="h-4 w-4" />
                            <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-neon shadow-[0_0_8px_rgba(204,255,0,0.8)]" />
                        </button>
                    </div>

                    <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center border border-border-subtle cursor-pointer hover:border-neon transition-all ml-2">
                        <span className="text-[10px] font-bold text-white">JD</span>
                    </div>

                    {/* Mobile Menu Toggle (Useful if you add mobile navigation later) */}
                    <button className="md:hidden p-2 text-text-muted ml-2">
                        <Menu className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </header>
    );
}