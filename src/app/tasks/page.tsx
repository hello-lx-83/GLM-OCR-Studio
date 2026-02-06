"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Table, 
  Trash2, 
  Search, 
  Eye, 
  Download, 
  FileText, 
  MoreHorizontal,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface HistoryItem {
  id: number;
  fileName: string;
  fileSize: number;
  fileType: string;
  createdAt: string;
  status: string;
  result?: string;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function TasksPage() {
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  });

  const [previewItem, setPreviewItem] = useState<HistoryItem | null>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchQuery, statusFilter]);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (debouncedSearchQuery) queryParams.set('q', debouncedSearchQuery);
      if (statusFilter && statusFilter !== 'all') queryParams.set('status', statusFilter);

      const res = await fetch(`/api/history?${queryParams.toString()}`);
      if (res.ok) {
        const responseData = await res.json();
        if (Array.isArray(responseData)) {
            setHistory(responseData);
        } else {
            setHistory(responseData.data);
            setPagination(responseData.pagination);
        }
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, limit, debouncedSearchQuery, statusFilter]);

  const handleDelete = async (id: number) => {
    if (!confirm("确定要删除这条记录吗？")) return;
    
    try {
      const res = await fetch(`/api/history/${id}`, { method: "DELETE" });
      if (res.ok) {
        setHistory(history.filter(item => item.id !== id));
        // Refresh to get correct pagination if needed
        fetchHistory();
      }
    } catch (error) {
      console.error("Failed to delete item:", error);
    }
  };

  const handleDownload = (item: HistoryItem) => {
    if (!item.result) return;
    const blob = new Blob([item.result], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (item.fileName ? item.fileName.split('.')[0] : "ocr-result") + ".md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePreview = (item: HistoryItem) => {
    router.push(`/files/${item.id}`);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
        setPage(newPage);
    }
  };

  return (
    <div className="flex-1 p-4 flex flex-col h-full overflow-hidden">
      <div className="flex flex-col h-full space-y-4">
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">任务管理</h1>
            <p className="text-muted-foreground mt-2">
              查看和管理历史解析任务文件。
            </p>
          </div>
          <Button onClick={() => fetchHistory()} variant="outline" size="sm" className="gap-2">
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            刷新列表
          </Button>
        </div>

        <Card className="flex-1 flex flex-col min-h-0 border-border/50 shadow-sm">
          <CardHeader className="pb-3 shrink-0">
            <div className="flex items-center justify-between">
                <CardTitle>文件列表</CardTitle>
                <div className="flex items-center gap-2">
                    <div className="relative w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="搜索文件名..." 
                            className="pl-9 h-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[130px] h-9">
                            <SelectValue placeholder="状态筛选" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">全部状态</SelectItem>
                            <SelectItem value="success">解析成功</SelectItem>
                            <SelectItem value="processing">处理中</SelectItem>
                            <SelectItem value="failed">失败</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden flex flex-col p-0">
            <div className="flex-1 overflow-auto">
                <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-border bg-muted/50 text-xs font-medium text-muted-foreground uppercase tracking-wider sticky top-0 z-10 backdrop-blur-sm">
                    <div className="col-span-5">文件名</div>
                    <div className="col-span-2">大小</div>
                    <div className="col-span-2">状态</div>
                    <div className="col-span-2">上传时间</div>
                    <div className="col-span-1 text-right">操作</div>
                </div>
                <div className="divide-y divide-border">
                    {history.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm">
                            {isLoading ? "加载中..." : "暂无符合条件的记录"}
                        </div>
                    ) : (
                        history.map((item) => (
                            <div key={item.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center text-sm hover:bg-muted/30 transition-colors">
                                <div className="col-span-5 flex items-center gap-3 overflow-hidden">
                                    <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                        <FileText className="w-4 h-4" />
                                    </div>
                                    <span className="truncate font-medium" title={item.fileName}>
                                        {item.fileName}
                                    </span>
                                </div>
                                <div className="col-span-2 text-muted-foreground font-mono text-xs">
                                    {formatSize(item.fileSize)}
                                </div>
                                <div className="col-span-2">
                                    <Badge 
                                        variant={item.status === 'success' ? 'default' : item.status === 'processing' ? 'secondary' : 'destructive'}
                                        className="capitalize"
                                    >
                                        {item.status === 'success' ? 'Completed' : item.status}
                                    </Badge>
                                </div>
                                <div className="col-span-2 text-muted-foreground text-xs">
                                    {new Date(item.createdAt).toLocaleString()}
                                </div>
                                <div className="col-span-1 flex items-center justify-end gap-1">
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                        onClick={() => handlePreview(item)}
                                        title="查看详情"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                        onClick={() => handleDownload(item)}
                                        disabled={!item.result}
                                        title="下载结果"
                                    >
                                        <Download className="w-4 h-4" />
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                        onClick={() => handleDelete(item.id)}
                                        title="删除"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Pagination Footer */}
            <div className="p-4 border-t border-border flex items-center justify-between bg-card shrink-0">
                <div className="text-sm text-muted-foreground">
                    共 {pagination.total} 条记录，当前第 {pagination.page} / {pagination.totalPages} 页
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 mr-4">
                        <span className="text-sm text-muted-foreground">每页显示</span>
                        <Select 
                            value={limit.toString()} 
                            onValueChange={(val) => {
                                setLimit(Number(val));
                                setPage(1); // Reset to first page on limit change
                            }}
                        >
                            <SelectTrigger className="w-[70px] h-8">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page <= 1 || isLoading}
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        上一页
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page >= pagination.totalPages || isLoading}
                    >
                        下一页
                        <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <Card className="w-full max-w-4xl max-h-[85vh] flex flex-col shadow-lg border-border">
                <CardHeader className="flex flex-row items-center justify-between py-3 border-b border-border">
                    <CardTitle className="text-base font-medium truncate pr-4">
                        {previewItem.fileName} - 解析结果
                    </CardTitle>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPreviewItem(null)}>
                        <span className="sr-only">Close</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </Button>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto p-0">
                    <div className="p-4 bg-muted/10 min-h-full">
                        <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-foreground/80 break-all">
                            {previewItem.result}
                        </pre>
                    </div>
                </CardContent>
                <div className="p-2 border-t border-border flex justify-end gap-2 bg-muted/20">
                    <Button variant="outline" size="sm" onClick={() => setPreviewItem(null)}>
                        关闭
                    </Button>
                    <Button size="sm" onClick={() => handleDownload(previewItem)}>
                        <Download className="w-4 h-4 mr-2" />
                        下载 Markdown
                    </Button>
                </div>
            </Card>
        </div>
      )}
    </div>
  );
}
