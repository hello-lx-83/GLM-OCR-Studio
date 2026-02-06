"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface SettingsContextType {
  apiKey: string;
  setApiKey: (key: string) => void;
  apiUrl: string;
  setApiUrl: (url: string) => void;
  mode: string;
  setMode: (mode: string) => void;
  format: string;
  setFormat: (format: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [apiKey, setApiKey] = useState("");
  const [apiUrl, setApiUrl] = useState("https://open.bigmodel.cn/api/paas/v4/layout_parsing");
  const [mode, setMode] = useState("standard");
  const [format, setFormat] = useState("markdown");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem("glm-ocr-apiKey");
    const savedApiUrl = localStorage.getItem("glm-ocr-apiUrl");
    const savedMode = localStorage.getItem("glm-ocr-mode");
    const savedFormat = localStorage.getItem("glm-ocr-format");

    if (savedApiKey) setApiKey(savedApiKey);
    if (savedApiUrl) setApiUrl(savedApiUrl);
    if (savedMode) setMode(savedMode);
    if (savedFormat) setFormat(savedFormat);
    setIsLoaded(true);
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    if (isLoaded) localStorage.setItem("glm-ocr-apiKey", apiKey);
  }, [apiKey, isLoaded]);

  useEffect(() => {
    if (isLoaded) localStorage.setItem("glm-ocr-apiUrl", apiUrl);
  }, [apiUrl, isLoaded]);

  useEffect(() => {
    if (isLoaded) localStorage.setItem("glm-ocr-mode", mode);
  }, [mode, isLoaded]);

  useEffect(() => {
    if (isLoaded) localStorage.setItem("glm-ocr-format", format);
  }, [format, isLoaded]);

  return (
    <SettingsContext.Provider
      value={{
        apiKey,
        setApiKey,
        apiUrl,
        setApiUrl,
        mode,
        setMode,
        format,
        setFormat,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
