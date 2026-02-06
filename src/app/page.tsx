"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, FileText, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function UploadPage() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const handleUpload = async (file: File) => {
    // Validation
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    // Check extension as fallback
    const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';
    const isImage = /\.(jpg|jpeg|png)$/i.test(file.name) || file.type.startsWith('image/');
    
    if (!validTypes.includes(file.type) && !isPdf && !isImage) {
      setError("不支持的文件格式。请上传 PDF, JPG 或 PNG 文件。");
      return;
    }

    // Size validation based on type
    if (isImage && file.size > 10 * 1024 * 1024) {
      setError("图片文件大小不能超过 10MB。");
      return;
    }

    if (isPdf && file.size > 50 * 1024 * 1024) {
      setError("PDF 文件大小不能超过 50MB。");
      return;
    }

    // General fallback check
    if (file.size > 50 * 1024 * 1024) {
        setError("文件大小不能超过 50MB。");
        return;
    }

    setError(null);
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const data = await res.json();
      
      // Redirect to preview page
      router.push(`/files/${data.id}`);
      
    } catch (err) {
      console.error(err);
      setError("上传失败，请重试。");
      setIsUploading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-full">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            GLM OCR Studio
          </h1>
          <p className="text-muted-foreground text-lg">
            上传文档，体验强大的多模态文档解析能力
          </p>
        </div>

        <Card 
          className={cn(
            "relative overflow-hidden transition-all duration-300 border-2 border-dashed min-h-[320px] flex flex-col items-center justify-center p-8 cursor-pointer group",
            isDragging ? "border-primary bg-primary/5 scale-[1.02]" : "border-border hover:border-primary/50 hover:bg-muted/50",
            isUploading ? "pointer-events-none opacity-50" : ""
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileSelect}
          />

          {isUploading ? (
            <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-primary/20 animate-spin border-t-primary"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <UploadCloud className="w-6 h-6 text-primary animate-pulse" />
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-medium">正在上传...</h3>
                <p className="text-sm text-muted-foreground">请稍候，马上为您准备预览</p>
              </div>
            </div>
          ) : (
              <div className="flex flex-col items-center gap-4 transition-transform group-hover:scale-105 duration-300">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-2 group-hover:bg-primary/20 transition-colors">
                  <UploadCloud className="w-10 h-10 text-primary" />
                </div>
                
                <div className="text-center space-y-1.5">
                  <h3 className="text-lg font-semibold">
                    点击或拖拽上传文档
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    支持 PDF (≤50MB), JPG/PNG (≤10MB)
                  </p>
                </div>

                <div className="flex gap-3 mt-4">
                   <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/50 text-xs text-muted-foreground">
                      <FileText className="w-3 h-3" />
                      <span>智能版面分析</span>
                   </div>
                   <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/50 text-xs text-muted-foreground">
                      <FileText className="w-3 h-3" />
                      <span>Markdown 输出</span>
                   </div>
                </div>
              </div>
          )}

          {error && (
            <div className="absolute bottom-6 left-0 right-0 flex justify-center animate-in slide-in-from-bottom-2">
              <div className="bg-destructive/10 text-destructive text-sm px-4 py-2 rounded-full flex items-center gap-2 border border-destructive/20">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

