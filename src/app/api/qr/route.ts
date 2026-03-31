import { NextResponse } from "next/server";
import QRCode from "qrcode";

/**
 * POST /api/qr
 * Server-side QR code generation (for the public API / Swagger).
 * Client-side generation uses qr-code-styling directly.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { data, format = "png", size = 300, errorCorrection = "M" } = body;

    if (!data || typeof data !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'data' field" },
        { status: 400 }
      );
    }

    if (data.length > 4296) {
      return NextResponse.json(
        { error: "Data exceeds maximum QR code capacity" },
        { status: 400 }
      );
    }

    const ecLevel = ["L", "M", "Q", "H"].includes(errorCorrection)
      ? errorCorrection
      : "M";

    if (format === "svg") {
      const svg = await QRCode.toString(data, {
        type: "svg",
        width: size,
        errorCorrectionLevel: ecLevel,
      });
      return new Response(svg, {
        headers: { "Content-Type": "image/svg+xml" },
      });
    }

    // Default: PNG buffer
    const pngBuffer = await QRCode.toBuffer(data, {
      width: size,
      errorCorrectionLevel: ecLevel,
    });

    return new Response(new Uint8Array(pngBuffer), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
