import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  
  // Resolve path to the volume-mounted uploads directory
  const filePath = join(process.cwd(), "public", "uploads", filename);

  try {
    const fileBuffer = await readFile(filePath);
    
    // Inferred content type based on extension
    const ext = filename.split(".").pop()?.toLowerCase();
    const contentType = ext === "png" ? "image/png" : 
                        ext === "webp" ? "image/webp" : 
                        ext === "gif" ? "image/gif" : 
                        ext === "mp4" ? "video/mp4" : "image/jpeg";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (e) {
    console.error(`[IMAGE_SERVER_ERROR] Could not find file: ${filePath}`);
    return new NextResponse("Not Found", { status: 404 });
  }
}
