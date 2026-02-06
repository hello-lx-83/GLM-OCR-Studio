import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Missing file" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create uploads directory if not exists
    const uploadDir = join(process.cwd(), "uploads");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Determine file type
    let mimeType = file.type;
    if (!mimeType) {
        if (file.name.endsWith('.pdf')) mimeType = 'application/pdf';
        else if (file.name.endsWith('.png')) mimeType = 'image/png';
        else if (file.name.endsWith('.jpg') || file.name.endsWith('.jpeg')) mimeType = 'image/jpeg';
    }

    // Create DB record first to get ID
    const record = await prisma.fileHistory.create({
      data: {
        fileName: file.name,
        fileSize: file.size,
        fileType: mimeType || 'unknown',
        status: 'pending'
      }
    });

    // Save file with ID prefix to avoid collisions
    const fileName = `${record.id}-${file.name}`;
    const filePath = join(uploadDir, fileName);
    
    await writeFile(filePath, buffer);

    return NextResponse.json({
      id: record.id,
      fileName: record.fileName,
      status: record.status,
      message: "Upload successful"
    });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
