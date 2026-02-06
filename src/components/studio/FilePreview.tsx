"use client";

import { useState, useEffect, useRef } from "react";
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  RotateCcw, 
  Move,
  Maximize2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FilePreviewProps {
  file?: File | null;
  url?: string | null;
  fileType?: string | null; // e.g. "application/pdf", "image/png"
}

export function FilePreview({ file, url, fileType }: FilePreviewProps) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [isImage, setIsImage] = useState(false);
  const [isPdf, setIsPdf] = useState(false);

  useEffect(() => {
    if (file) {
      const createdUrl = URL.createObjectURL(file);
      setObjectUrl(createdUrl);
      setIsImage(file.type.startsWith("image/"));
      setIsPdf(file.type === "application/pdf");
      
      // Reset transform
      setScale(1);
      setRotation(0);

      return () => URL.revokeObjectURL(createdUrl);
    } else if (url) {
      setObjectUrl(url);
      
      // Determine type from fileType prop or url extension
      let type = fileType || "";
      if (!type && url) {
         if (url.toLowerCase().endsWith(".pdf")) type = "application/pdf";
         else if (url.match(/\.(png|jpg|jpeg)$/i)) type = "image/jpeg";
      }

      setIsImage(type.startsWith("image/") || (url ? /\.(png|jpg|jpeg)$/i.test(url) : false));
      setIsPdf(type === "application/pdf" || (url ? /\.pdf$/i.test(url) : false));
      
      setScale(1);
      setRotation(0);
    } else {
      setObjectUrl(null);
      setIsImage(false);
      setIsPdf(false);
    }
  }, [file, url, fileType]);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));
  const handleRotateCw = () => setRotation(prev => prev + 90);
  const handleRotateCcw = () => setRotation(prev => prev - 90);

  if (!objectUrl) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground/40 p-8 border-2 border-dashed border-border/50 rounded-xl m-4 bg-muted/10">
        <p className="text-sm">暂无预览</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-muted/20 relative group">
      {/* Toolbar - Only for images for now as PDF has native controls */}
      {isImage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 p-1.5 rounded-full bg-background/80 backdrop-blur border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={handleZoomOut} title="缩小">
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-xs font-mono w-12 text-center">{Math.round(scale * 100)}%</span>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={handleZoomIn} title="放大">
            <ZoomIn className="w-4 h-4" />
          </Button>
          <div className="w-px h-4 bg-border mx-1"></div>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={handleRotateCcw} title="向左旋转">
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={handleRotateCw} title="向右旋转">
            <RotateCw className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-4">
        {isImage && (
          <div 
            className="transition-transform duration-200 ease-out origin-center"
            style={{ 
              transform: `scale(${scale}) rotate(${rotation}deg)` 
            }}
          >
            <img 
              src={objectUrl} 
              alt="Preview" 
              className="max-w-full max-h-[80vh] object-contain shadow-lg rounded-sm" 
            />
          </div>
        )}

        {isPdf && (
          <iframe 
            src={`${objectUrl}#toolbar=0&navpanes=0`} 
            className="w-full h-full rounded-md shadow-sm bg-white"
            title="PDF Preview"
          />
        )}
      </div>
    </div>
  );
}
