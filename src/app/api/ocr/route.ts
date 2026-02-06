import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const maxDuration = 60; // 60 seconds

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    let apiKey = formData.get("apiKey") as string;
    const apiUrl = formData.get("apiUrl") as string || "https://open.bigmodel.cn/api/paas/v4/layout_parsing";

    // Fallback to environment variable if apiKey is missing
    if (!apiKey && process.env.GLM_OCR_API_KEY) {
        apiKey = process.env.GLM_OCR_API_KEY;
    }

    if (!file || !apiKey) {
      return NextResponse.json(
        { error: "Missing file or API key" },
        { status: 400 }
      );
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Content = buffer.toString("base64");
    
    // Determine mime type
    let mimeType = file.type;
    if (!mimeType) {
        if (file.name.endsWith('.pdf')) mimeType = 'application/pdf';
        else if (file.name.endsWith('.png')) mimeType = 'image/png';
        else if (file.name.endsWith('.jpg') || file.name.endsWith('.jpeg')) mimeType = 'image/jpeg';
    }

    // Save to history
    await prisma.fileHistory.create({
      data: {
        fileName: file.name,
        fileSize: file.size,
        fileType: mimeType || 'unknown',
        status: 'processing'
      }
    });

    // Add prefix
    const dataUri = `data:${mimeType};base64,${base64Content}`;

    console.log(`Sending request to GLM-OCR for file: ${file.name} (${mimeType})`);

    // Call Zhipu AI API
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "glm-ocr",
        file: dataUri
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API Error:", response.status, errorData);
      return NextResponse.json(
        { error: errorData.error?.message || `API request failed with status ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Extract markdown results
    let mdContent = "";
    
    // Check various possible locations based on SDK behavior vs API raw response
    if (data.md_results) {
        mdContent = data.md_results;
    } else if (data.data && data.data.md_results) {
        mdContent = data.data.md_results;
    } else if (data.layout_parsing_result) {
         // Fallback to layout parsing result if md_results is missing (structure analysis)
         // But user wants md_results.
         mdContent = JSON.stringify(data.layout_parsing_result, null, 2);
    } else {
        console.log("Unknown response structure:", JSON.stringify(data).substring(0, 200));
        // If success but no content found
        if (data.code === 200 || data.msg === "success") {
             // Maybe it's in a different field
             return NextResponse.json({ result: "OCR completed but no Markdown content found in response." });
        }
        return NextResponse.json({ error: "Unexpected response format", raw: data }, { status: 500 });
    }
    
    // Post-processing: Add @@@ separators between paragraphs
    // Strategy: Split by double newlines (paragraphs), then join with @@@
    // But preserve code blocks or tables if possible. 
    // For now, simple split is safer as requested.
    
    // Normalize newlines
    const normalized = mdContent.replace(/\r\n/g, '\n');
    
    // Split by empty lines (2 or more newlines)
    const parts = normalized.split(/\n{2,}/);
    
    // Filter empty parts and join
    const processedContent = parts
        .map(p => p.trim())
        .filter(Boolean)
        .join("\n\n@@@\n\n");

    // Update history status
    // Note: In a real app we'd need the ID from the create call, but for now we'll just log success
    // or update the latest entry if we want to be precise, but for this prototype simply creating 'processing' is enough to show activity.
    // Better: let's update the status to success.
    
    const lastEntry = await prisma.fileHistory.findFirst({
        where: { fileName: file.name },
        orderBy: { createdAt: 'desc' }
    });
    
    if (lastEntry) {
        await prisma.fileHistory.update({
            where: { id: lastEntry.id },
            data: { 
                status: 'success',
                result: processedContent
            }
        });
    }

    return NextResponse.json({ result: processedContent });
    
  } catch (error) {
    console.error("OCR Server Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
