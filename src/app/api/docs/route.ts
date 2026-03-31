import { NextResponse } from "next/server";

/**
 * GET /api/docs
 * Serve the OpenAPI / Swagger specification.
 * Only available when FEATURE_SWAGGER=true.
 */
export async function GET() {
  if (process.env.FEATURE_SWAGGER !== "true") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const baseUrl = process.env.PUBLIC_BASE_URL || "http://localhost:3000";

  const spec = {
    openapi: "3.0.3",
    info: {
      title: `${process.env.SITE_NAME || "Awesome QR Code"} API`,
      description:
        "Generate QR codes and optionally create tracked short links with scan analytics.",
      version: "1.0.0",
    },
    servers: [{ url: baseUrl }],
    paths: {
      "/api/qr": {
        post: {
          summary: "Generate a QR code image",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["data"],
                  properties: {
                    data: {
                      type: "string",
                      description: "Content to encode",
                    },
                    format: {
                      type: "string",
                      enum: ["png", "svg"],
                      default: "png",
                    },
                    size: { type: "integer", default: 300 },
                    errorCorrection: {
                      type: "string",
                      enum: ["L", "M", "Q", "H"],
                      default: "M",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": { description: "QR code image (PNG or SVG)" },
            "400": { description: "Invalid input" },
          },
        },
      },
      "/api/shortlink": {
        post: {
          summary: "Create a tracked short link",
          description: "Requires FEATURE_ANALYTICS=true",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["type", "content"],
                  properties: {
                    type: {
                      type: "string",
                      enum: [
                        "url",
                        "text",
                        "wifi",
                        "phone",
                        "email",
                        "sms",
                        "geo",
                        "event",
                        "vcard",
                      ],
                    },
                    content: { type: "string" },
                    styleOptions: { type: "object" },
                  },
                },
              },
            },
          },
          responses: {
            "200": { description: "Short link created" },
            "403": { description: "Analytics disabled" },
          },
        },
      },
      "/api/stats/{token}": {
        get: {
          summary: "Retrieve scan statistics",
          parameters: [
            {
              name: "token",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": { description: "Statistics overview" },
            "404": { description: "Not found" },
          },
        },
      },
      "/api/health": {
        get: {
          summary: "Health check",
          responses: {
            "200": { description: "Service status" },
          },
        },
      },
    },
  };

  return NextResponse.json(spec, {
    headers: { "Access-Control-Allow-Origin": "*" },
  });
}
