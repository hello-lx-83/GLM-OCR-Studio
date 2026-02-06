"use client";

import { useSettings } from "@/contexts/SettingsContext";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Key, Link, Sliders, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  const { 
    apiKey, setApiKey, 
    apiUrl, setApiUrl,
    mode, setMode,
    format, setFormat
  } = useSettings();

  return (
    <div className="flex-1 p-4 flex flex-col h-full overflow-hidden">
      <div className="flex flex-col h-full space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">系统设置</h1>
          <p className="text-muted-foreground mt-2">
            配置 GLM OCR 服务的连接参数和默认选项。
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            <Card className="flex flex-col h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  API 配置
                </CardTitle>
                <CardDescription>
                  设置访问 GLM 服务的凭证和地址。
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 flex-1">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input 
                    id="apiKey"
                    type="password"
                    placeholder="请输入 GLM API Key" 
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    您的 API Key 将仅保存在本地浏览器中，不会上传到其他服务器。
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apiUrl">API Address</Label>
                  <Input 
                    id="apiUrl"
                    type="text"
                    placeholder="https://open.bigmodel.cn..." 
                    className="font-mono text-sm"
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="flex flex-col h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sliders className="w-5 h-5" />
                  默认参数
                </CardTitle>
                <CardDescription>
                  设置文档解析的默认行为。
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 flex-1">
                <div className="space-y-2">
                  <Label>识别模式 (Mode)</Label>
                  <Select value={mode} onValueChange={setMode}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择模式" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard (标准)</SelectItem>
                      <SelectItem value="layout">Layout (版面分析)</SelectItem>
                      <SelectItem value="table">Table (表格增强)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>输出格式</Label>
                  <div className="flex gap-4">
                    <div 
                      className={cn(
                        "flex-1 border rounded-lg p-4 text-center cursor-pointer transition-all",
                        format === 'markdown' 
                          ? "border-primary bg-primary/5 ring-1 ring-primary" 
                          : "border-border hover:bg-accent/50"
                      )}
                      onClick={() => setFormat('markdown')}
                    >
                        <div className="font-medium mb-1">Markdown</div>
                        <div className="text-xs text-muted-foreground">适合文本编辑和阅读</div>
                    </div>
                    <div 
                      className={cn(
                        "flex-1 border rounded-lg p-4 text-center cursor-pointer transition-all",
                        format === 'json' 
                          ? "border-primary bg-primary/5 ring-1 ring-primary" 
                          : "border-border hover:bg-accent/50"
                      )}
                      onClick={() => setFormat('json')}
                    >
                        <div className="font-medium mb-1">JSON</div>
                        <div className="text-xs text-muted-foreground">适合程序处理和集成</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
