import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

// Generate a large payload (~1MB) to trigger Sentry's large HTTP payload detection
const generateLargePayload = () => {
  const items = [];
  for (let i = 0; i < 10000; i++) {
    items.push({
      id: i,
      name: `Item ${i}`,
      description: `This is a detailed description for item ${i}. `.repeat(10),
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ["tag1", "tag2", "tag3", "tag4", "tag5"],
        attributes: {
          color: "blue",
          size: "large",
          weight: Math.random() * 100,
          dimensions: { width: 10, height: 20, depth: 30 },
        },
      },
    });
  }
  return items;
};

export async function GET() {
  return Sentry.startSpan(
    {
      name: "GET /api/large-payload",
      op: "http.server",
    },
    async (span) => {
      const payload = generateLargePayload();
      const jsonString = JSON.stringify(payload);

      span.setAttribute("payload.items", payload.length);
      span.setAttribute("payload.size_bytes", jsonString.length);

      return NextResponse.json(payload);
    }
  );
}
