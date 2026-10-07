// API route for generating multi-mode word cloud analytics
import { NextResponse } from "next/server";
import { getOrgMemories } from "@/lib/neocore-client";

export const dynamic = "force-dynamic";

interface WordItem {
  text: string;
  count: number;
  category?: string;
}

const STOP_WORDS = new Set([
  "the", "and", "to", "of", "a", "in", "is", "that", "for", "on", "with", "as", "by", "at", "an", "be",
  "this", "which", "or", "from", "but", "not", "are", "was", "were", "it", "have", "has", "had", "they",
  "you", "we", "i", "me", "my", "our", "their", "what", "so", "up", "out", "if", "about", "who", "into",
  "than", "them", "some", "could", "would", "should", "can", "do", "did", "will", "just", "all", "more",
  "when", "there", "been", "one", "also", "other", "how", "see", "like", "its", "no", "yes", "na", "ki",
  "ka", "ke", "ko", "hai", "mein", "se", "aur", "kya", "to", "bhi", "kar", "ho", "raha", "rahi", "hain",
  "tha", "thi", "the", "jo", "par", "ne", "ek", "kisi", "usko", "unka", "unhe", "kuch", "discussion",
  "conversation", "recorded", "meeting", "notes", "discussed", "appears", "brief"
]);

// Handles GET requests for aggregate word cloud datasets
export async function GET() {
  try {
    const memoriesRes = await getOrgMemories({ limit: 100 });
    const items = memoriesRes.items || [];

    const entitiesMap = new Map<string, number>();
    const tagsMap = new Map<string, number>();
    const productsMap = new Map<string, number>();
    const competitorsMap = new Map<string, number>();
    const keywordsMap = new Map<string, number>();

    for (const item of items) {
      // Entities and participants
      (item.mentioned_entities || []).forEach((e) => {
        if (e && e.trim()) entitiesMap.set(e.trim(), (entitiesMap.get(e.trim()) || 0) + 1);
      });
      (item.participants || []).forEach((p) => {
        if (p && p.trim()) entitiesMap.set(p.trim(), (entitiesMap.get(p.trim()) || 0) + 1);
      });

      // Classification tags
      (item.tags || []).forEach((t) => {
        if (t && t.trim()) tagsMap.set(t.trim(), (tagsMap.get(t.trim()) || 0) + 1);
      });

      // Products & SKUs
      (item.product || []).forEach((p) => {
        const prodName = typeof p === "string" ? p.trim() : JSON.stringify(p);
        if (prodName) productsMap.set(prodName, (productsMap.get(prodName) || 0) + 1);
      });

      // Competitors
      (item.competitors_mentioned || []).forEach((c) => {
        if (c && c.trim()) competitorsMap.set(c.trim(), (competitorsMap.get(c.trim()) || 0) + 1);
      });

      // Keywords from summary and MoM
      const textToExtract = `${item.summary || ""} ${item.title || ""}`;
      const words = textToExtract.toLowerCase().replace(/[^a-zA-Z0-9\s]/g, "").split(/\s+/);
      words.forEach((w) => {
        if (w.length > 3 && !STOP_WORDS.has(w)) {
          keywordsMap.set(w, (keywordsMap.get(w) || 0) + 1);
        }
      });
    }

    const formatList = (map: Map<string, number>): WordItem[] =>
      Array.from(map.entries())
        .map(([text, count]) => ({ text, count }))
        .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      totalSampled: items.length,
      entities: formatList(entitiesMap).slice(0, 40),
      tags: formatList(tagsMap).slice(0, 40),
      products: formatList(productsMap).slice(0, 30),
      competitors: formatList(competitorsMap).slice(0, 20),
      keywords: formatList(keywordsMap).slice(0, 50),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate word cloud";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
