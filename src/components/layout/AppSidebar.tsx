"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home, 
  ListTodo, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  ScanText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const menuItems = [
  { path: "/", label: "新解析", icon: Home },
  { path: "/tasks", label: "任务管理", icon: ListTodo },
  { path: "/settings", label: "系统设置", icon: Settings },
];

export function AppSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <motion.div 
      className="h-screen bg-card border-r border-border flex flex-col relative z-20"
      initial={{ width: 240 }}
      animate={{ width: isCollapsed ? 64 : 240 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {/* Header / Logo */}
      <div className="h-14 flex items-center justify-center border-b border-border overflow-hidden">
        <div className="flex items-center gap-2">
            <ScanText className="w-6 h-6 text-primary shrink-0" />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span 
                  className="font-bold text-lg whitespace-nowrap"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  GLM OCR
                </motion.span>
              )}
            </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link key={item.path} href={item.path} passHref>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer group relative",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon className={cn("w-5 h-5 shrink-0", isActive && "text-primary")} />
                
                {!isCollapsed && (
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-sm font-medium whitespace-nowrap"
                    >
                        {item.label}
                    </motion.span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-2 border-t border-border flex justify-end">
        <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 ml-auto"
        >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>
    </motion.div>
  );
}
