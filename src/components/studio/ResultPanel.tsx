import { Copy, Download, FileText, Check, Code, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { cn } from "@/lib/utils";

interface ResultPanelProps {
  result: string | null;
  status: 'idle' | 'processing' | 'success' | 'error';
  fileName?: string;
}

export function ResultPanel({ result, status, fileName }: ResultPanelProps) {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'code' | 'preview'>('preview');

  const handleCopy = async () => {
    if (result) {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (result) {
      const blob = new Blob([result], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = (fileName ? fileName.split('.')[0] : "ocr-result") + ".md";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const lineCount = result ? result.split('\n').length : 0;

  return (
    <section className="w-full h-full bg-card flex flex-col shrink-0">
      <div className="h-[60px] border-b border-border flex items-center justify-between px-4 shrink-0 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium text-sm text-muted-foreground uppercase tracking-wider">识别结果</span>
        </div>
        <div className="flex items-center gap-2">
            {status === 'success' && (
                <>
                    <div className="flex items-center bg-muted/50 rounded-lg p-0.5 mr-2 border border-border/50">
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                                "h-7 px-3 text-xs font-medium rounded-md transition-all",
                                viewMode === 'code' && "bg-background shadow-sm text-primary"
                            )}
                            onClick={() => setViewMode('code')}
                        >
                            <Code className="w-3.5 h-3.5 mr-1.5" />
                            源码
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                                "h-7 px-3 text-xs font-medium rounded-md transition-all",
                                viewMode === 'preview' && "bg-background shadow-sm text-primary"
                            )}
                            onClick={() => setViewMode('preview')}
                        >
                            <Eye className="w-3.5 h-3.5 mr-1.5" />
                            预览
                        </Button>
                    </div>

                    <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-foreground" 
                        title="复制到剪贴板"
                        onClick={handleCopy}
                    >
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                    <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-foreground" 
                        title="下载 Markdown"
                        onClick={handleDownload}
                    >
                        <Download className="w-4 h-4" />
                    </Button>
                </>
            )}
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden relative bg-dot-pattern">
        {status === 'idle' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground p-8 text-center bg-background/50 backdrop-blur-[2px]">
                <div className="w-16 h-16 rounded-full bg-background border border-dashed border-border flex items-center justify-center mb-4 opacity-50">
                    <FileText className="w-8 h-8 opacity-50" />
                </div>
                <p className="text-sm">识别结果将显示在这里</p>
            </div>
        )}
        
        {status === 'processing' && (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground bg-background/50 backdrop-blur-[2px]">
                <div className="w-2 h-2 bg-primary rounded-full animate-ping mb-4"></div>
                <p className="text-sm font-mono">正在生成结果...</p>
            </div>
        )}
        
        {status === 'success' && result && (
            <ScrollArea className="h-full w-full">
                {viewMode === 'code' ? (
                    <div className="flex min-h-full font-mono text-sm">
                        <div className="w-12 flex-shrink-0 border-r border-border bg-card/30 flex flex-col items-end py-4 pr-3 select-none text-muted-foreground/40 text-[11px] leading-6">
                            {Array.from({ length: lineCount }).map((_, i) => (
                                <div key={i}>{i + 1}</div>
                            ))}
                        </div>
                        <div className="flex-1 p-4 bg-background/30">
                            <pre className="whitespace-pre-wrap text-foreground/80 font-normal leading-6 break-all">
                                {result}
                            </pre>
                        </div>
                    </div>
                ) : (
                    <div className="p-8 max-w-none prose prose-sm dark:prose-invert prose-slate bg-background/30 min-h-full">
                        <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw]}
                            components={{
                                table: ({node, ...props}) => (
                                    <div className="my-4 w-full overflow-y-auto rounded-lg border border-border">
                                        <table className="w-full text-sm table-auto border-collapse" {...props} />
                                    </div>
                                ),
                                thead: ({node, ...props}) => <thead className="bg-muted/50 border-b border-border" {...props} />,
                                tbody: ({node, ...props}) => <tbody className="[&_tr:last-child]:border-0" {...props} />,
                                tr: ({node, ...props}) => <tr className="border-b border-border/50 hover:bg-muted/50 transition-colors" {...props} />,
                                th: ({node, ...props}) => <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]" {...props} />,
                                td: ({node, ...props}) => <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]" {...props} />,
                                h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-8 mb-4 tracking-tight" {...props} />,
                                h2: ({node, ...props}) => <h2 className="text-xl font-semibold mt-6 mb-3 tracking-tight border-b pb-2" {...props} />,
                                h3: ({node, ...props}) => <h3 className="text-lg font-semibold mt-4 mb-2" {...props} />,
                                p: ({node, ...props}) => <p className="leading-7 mb-4" {...props} />,
                                ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 space-y-1" {...props} />,
                                ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4 space-y-1" {...props} />,
                                blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-primary/30 pl-4 italic text-muted-foreground my-4" {...props} />,
                                code: ({node, className, children, ...props}: any) => {
                                    const match = /language-(\w+)/.exec(className || '')
                                    const isInline = !match && !String(children).includes('\n')
                                    return isInline ? (
                                        <code className="bg-muted px-1.5 py-0.5 rounded text-[0.9em] font-mono text-foreground" {...props}>
                                            {children}
                                        </code>
                                    ) : (
                                        <code className={cn("block bg-muted p-4 rounded-lg overflow-x-auto font-mono text-sm my-4", className)} {...props}>
                                            {children}
                                        </code>
                                    )
                                }
                            }}
                        >
                            {result}
                        </ReactMarkdown>
                    </div>
                )}
            </ScrollArea>
        )}
      </div>
    </section>
  );
}
