import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readFile, readdir, access } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export const maxDuration = 60; // 60 seconds

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let { id, apiKey, apiUrl, mode, format } = body;
    
    // Fallback to environment variable if apiKey is missing
    if (!apiKey && process.env.GLM_OCR_API_KEY) {
        apiKey = process.env.GLM_OCR_API_KEY;
    }

    if (!id || !apiKey) {
      return NextResponse.json(
        { error: "Missing id or API key" },
        { status: 400 }
      );
    }

    // Find record
    const record = await prisma.fileHistory.findUnique({
      where: { id: Number(id) }
    });

    if (!record) {
      return NextResponse.json({ error: "File record not found" }, { status: 404 });
    }

    // Find file on disk
    // We stored it as `${id}-${fileName}`
    const uploadDir = join(process.cwd(), "uploads");
    const targetFileName = `${record.id}-${record.fileName}`;
    const filePath = join(uploadDir, targetFileName);

    if (!existsSync(filePath)) {
        console.error(`File not found at: ${filePath}`);
        return NextResponse.json({ error: `File not found on server: ${targetFileName}` }, { status: 404 });
    }

    // Read file
    const fileBuffer = await readFile(filePath);
    const base64Content = fileBuffer.toString("base64");
    
    // Update status to processing
    await prisma.fileHistory.update({
      where: { id: Number(id) },
      data: { status: 'processing' }
    });

    const mimeType = record.fileType;
    const dataUri = `data:${mimeType};base64,${base64Content}`;

    // Always use Data URI to ensure Mime Type is conveyed
    const payloadFile = dataUri;

    console.log(`Sending request to GLM-OCR for file: ${record.fileName} (${mimeType})`);
    console.log(`Payload preview: ${payloadFile.substring(0, 100)}...`);

    // Call Zhipu AI API
    // Use standard file key
    const response = await fetch(apiUrl || "https://open.bigmodel.cn/api/paas/v4/layout_parsing", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "glm-ocr",
        file: payloadFile
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API Error:", response.status, JSON.stringify(errorData));
      
      await prisma.fileHistory.update({
        where: { id: Number(id) },
        data: { status: 'failed' }
      });

      return NextResponse.json(
        { error: errorData.error?.message || `API request failed with status ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Extract markdown results
    let mdContent = "";
    
    if (data.md_results) {
        mdContent = data.md_results;
    } else if (data.data && data.data.md_results) {
        mdContent = data.data.md_results;
    } else if (data.layout_parsing_result) {
         mdContent = JSON.stringify(data.layout_parsing_result, null, 2);
    } else {
        await prisma.fileHistory.update({
            where: { id: Number(id) },
            data: { status: 'failed' }
        });
        return NextResponse.json({ error: "Unexpected response format", raw: data }, { status: 500 });
    }
    
    // Normalize newlines
    const result = mdContent.replace(/\r\n/g, '\n');

    // Update DB
    await prisma.fileHistory.update({
      where: { id: Number(id) },
      data: { 
        status: 'success',
        result: result
      }
    });

    return NextResponse.json({
      success: true,
      result: result
    });

  } catch (error: any) {
    console.error("Processing error:", error);
    // Attempt to mark as failed in DB if possible
    try {
        if (req.body) {
             // We can't easily access ID here without parsing body again or moving scope
             // But we can just return the error
        }
    } catch {}
    
    return NextResponse.json(
      { error: error.message || "Processing failed" },
      { status: 500 }
    );
  }
}
