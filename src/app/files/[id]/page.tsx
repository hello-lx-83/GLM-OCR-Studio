"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ResizablePanel as Panel, ResizablePanelGroup as PanelGroup, ResizableHandle as PanelResizeHandle } from "@/components/ui/resizable";
import { FilePreview } from "@/components/studio/FilePreview";
import { ResultPanel } from "@/components/studio/ResultPanel";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCw, RefreshCw } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";

interface FileHistory {
  id: number;
  fileName: string;
  fileSize: number;
  fileType: string;
  status: 'pending' | 'processing' | 'success' | 'failed';
  result?: string;
}

export default function FilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { apiKey, apiUrl, mode, format } = useSettings();
  
  const [file, setFile] = useState<FileHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchFile = async () => {
    try {
      const res = await fetch(`/api/history/${id}`);
      if (!res.ok) {
        if (res.status === 404) router.push('/');
        return;
      }
      const data = await res.json();
      setFile(data);
      
      // If status is processing, start polling
      if (data.status === 'processing') {
        startPolling();
      } else if (data.status === 'pending') {
        // Auto start processing if pending
        triggerProcess(data);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching file:", error);
      setLoading(false);
    }
  };

  const startPolling = () => {
    if (pollTimerRef.current) return;
    
    pollTimerRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/history/${id}`);
        if (res.ok) {
          const data = await res.json();
          setFile(data);
          if (data.status !== 'processing') {
            stopPolling();
            setProcessing(false);
          }
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 2000);
  };

  const stopPolling = () => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  };

  const triggerProcess = async (fileData: FileHistory) => {
    if (!apiKey) return; // Wait for API key if missing? Or show error?
    
    setProcessing(true);
    // Update local state to processing immediately for better UI
    setFile(prev => prev ? { ...prev, status: 'processing' } : null);
    
    try {
      const res = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: fileData.id,
          apiKey,
          apiUrl,
          mode,
          format
        })
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to start processing: ${res.status}`);
      }
      
      startPolling();
    } catch (error) {
      console.error("Process error:", error);
      setProcessing(false);
      setFile(prev => prev ? { ...prev, status: 'failed' } : null);
    }
  };

  useEffect(() => {
    fetchFile();
    return () => stopPolling();
  }, [id]);

  // Re-trigger if API key becomes available and file is pending
  useEffect(() => {
    if (apiKey && file?.status === 'pending') {
        triggerProcess(file);
    }
  }, [apiKey, file?.status]);

  if (loading || !file) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const fileUrl = `/api/uploads/${file.id}-${encodeURIComponent(file.fileName)}`;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b shrink-0 bg-card">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold truncate max-w-md">{file.fileName}</h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{(file.fileSize / 1024).toFixed(1)} KB</span>
              <span>•</span>
              <span className="uppercase">{file.status}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
            {!apiKey && file.status === 'pending' && (
                <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 px-3 py-1.5 rounded-md text-sm mr-2">
                    <span>需要配置 API Key 才能开始识别</span>
                    <Button variant="link" size="sm" className="h-auto p-0 text-yellow-700 underline" onClick={() => router.push('/settings')}>
                        去配置
                    </Button>
                </div>
            )}
            {(file.status === 'failed' || file.status === 'success') && (
                <Button variant="outline" size="sm" onClick={() => triggerProcess(file)} disabled={processing}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${processing ? 'animate-spin' : ''}`} />
                    重新识别
                </Button>
            )}
        </div>
      </div>

      {/* Main Content - Split View */}
      <div className="flex-1 overflow-hidden px-6 pb-6 pt-2">
        <PanelGroup direction="horizontal" className="rounded-xl border shadow-sm bg-background">
          <Panel defaultSize={50} minSize={30}>
            <div className="h-full relative">
                <FilePreview url={fileUrl} fileType={file.fileType} />
            </div>
          </Panel>
          
          <PanelResizeHandle className="w-1 bg-border hover:bg-primary/50 transition-colors cursor-col-resize" />
          
          <Panel defaultSize={50} minSize={30}>
            <div className="h-full overflow-hidden">
              <ResultPanel 
                result={file.result || null} 
                status={file.status === 'processing' ? 'processing' : file.status === 'success' ? 'success' : file.status === 'failed' ? 'error' : 'idle'} 
                fileName={file.fileName}
              />
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}
