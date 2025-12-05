import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

// Mock data for items
const items = [
  { id: 1, name: "Widget A", price: 29.99 },
  { id: 2, name: "Widget B", price: 39.99 },
  { id: 3, name: "Widget C", price: 49.99 },
  { id: 4, name: "Widget D", price: 59.99 },
  { id: 5, name: "Widget E", price: 69.99 },
  { id: 6, name: "Widget F", price: 79.99 },
  { id: 7, name: "Widget G", price: 89.99 },
  { id: 8, name: "Widget H", price: 99.99 },
  { id: 9, name: "Widget I", price: 109.99 },
  { id: 10, name: "Widget J", price: 119.99 },
];

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  return Sentry.startSpan(
    {
      name: `GET /api/item/${id}`,
      op: "http.server",
    },
    async (span) => {
      // Simulate database delay
      await new Promise((resolve) => setTimeout(resolve, 100));

      const itemId = parseInt(id, 10);
      const item = items.find((i) => i.id === itemId);

      span.setAttribute("item.id", itemId);
      span.setAttribute("item.found", !!item);

      if (!item) {
        return NextResponse.json({ error: "Item not found" }, { status: 404 });
      }

      return NextResponse.json(item);
    }
  );
}
