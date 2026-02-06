import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const q = searchParams.get('q');
    const status = searchParams.get('status');
    const skip = (page - 1) * limit;

    const where: any = {};
    if (q) {
      where.fileName = { contains: q };
    }
    if (status && status !== 'all') {
      where.status = status;
    }

    // Get total count
    const total = await prisma.fileHistory.count({ where });

    // Get paginated data
    const history = await prisma.fileHistory.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });
    
    return NextResponse.json({
      data: history,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching history:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
