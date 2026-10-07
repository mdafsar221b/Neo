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
  "conversation", "recorded", "meeting", "notes", "discussed", "appears", "brief", "around", "without"
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
    const allCombinedMap = new Map<string, { count: number; category: string }>();

    for (const item of items) {
      // Entities and participants
      (item.mentioned_entities || []).forEach((e) => {
        if (e && e.trim()) {
          const val = e.trim();
          entitiesMap.set(val, (entitiesMap.get(val) || 0) + 1);
          const curr = allCombinedMap.get(val) || { count: 0, category: "Entity" };
          allCombinedMap.set(val, { count: curr.count + 1, category: "Entity" });
        }
      });
      (item.participants || []).forEach((p) => {
        if (p && p.trim()) {
          const val = p.trim();
          entitiesMap.set(val, (entitiesMap.get(val) || 0) + 1);
          const curr = allCombinedMap.get(val) || { count: 0, category: "Participant" };
          allCombinedMap.set(val, { count: curr.count + 1, category: "Participant" });
        }
      });

      // Classification tags
      (item.tags || []).forEach((t) => {
        if (t && t.trim()) {
          const val = t.trim();
          tagsMap.set(val, (tagsMap.get(val) || 0) + 1);
          const curr = allCombinedMap.get(val) || { count: 0, category: "Tag" };
          allCombinedMap.set(val, { count: curr.count + 1, category: "Tag" });
        }
      });

      // Products & SKUs
      (item.product || []).forEach((p) => {
        const prodName = typeof p === "string" ? p.trim() : JSON.stringify(p);
        if (prodName) {
          productsMap.set(prodName, (productsMap.get(prodName) || 0) + 1);
          const curr = allCombinedMap.get(prodName) || { count: 0, category: "Product" };
          allCombinedMap.set(prodName, { count: curr.count + 1, category: "Product" });
        }
      });

      // Competitors
      (item.competitors_mentioned || []).forEach((c) => {
        if (c && c.trim()) {
          const val = c.trim();
          competitorsMap.set(val, (competitorsMap.get(val) || 0) + 1);
          const curr = allCombinedMap.get(val) || { count: 0, category: "Competitor" };
          allCombinedMap.set(val, { count: curr.count + 1, category: "Competitor" });
        }
      });

      // Keywords from summary and MoM
      const textToExtract = `${item.summary || ""} ${item.title || ""}`;
      const words = textToExtract.toLowerCase().replace(/[^a-zA-Z0-9\s]/g, "").split(/\s+/);
      words.forEach((w) => {
        if (w.length > 3 && !STOP_WORDS.has(w)) {
          keywordsMap.set(w, (keywordsMap.get(w) || 0) + 1);
          if (!allCombinedMap.has(w)) {
            const curr = allCombinedMap.get(w) || { count: 0, category: "Concept" };
            allCombinedMap.set(w, { count: curr.count + 1, category: "Concept" });
          }
        }
      });
    }

    const formatList = (map: Map<string, number>, cat?: string): WordItem[] =>
      Array.from(map.entries())
        .map(([text, count]) => ({ text, count, category: cat }))
        .sort((a, b) => b.count - a.count);

    const allList = Array.from(allCombinedMap.entries())
      .map(([text, val]) => ({ text, count: val.count, category: val.category }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      totalSampled: items.length,
      all: allList.slice(0, 65),
      entities: formatList(entitiesMap, "Entity").slice(0, 45),
      tags: formatList(tagsMap, "Tag").slice(0, 45),
      products: formatList(productsMap, "Product").slice(0, 30),
      competitors: formatList(competitorsMap, "Competitor").slice(0, 20),
      keywords: formatList(keywordsMap, "Concept").slice(0, 50),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate word cloud";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
