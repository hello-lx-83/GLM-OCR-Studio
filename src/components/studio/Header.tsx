import { FileText } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";

export function Header() {
  return (
    <header className="h-[60px] bg-card border-b border-border flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-md bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white">
          <FileText className="w-5 h-5" />
        </div>
        <h1 className="font-semibold text-lg tracking-tight">
          GLM-OCR <span className="text-muted-foreground font-normal">STUDIO</span>
        </h1>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center px-2 py-1 gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-500 text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,1)]"></span>
            系统就绪
        </div>
        <div className="h-4 w-px bg-border"></div>
        <ModeToggle />
      </div>
    </header>
  );
}
