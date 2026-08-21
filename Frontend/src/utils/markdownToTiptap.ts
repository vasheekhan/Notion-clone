interface TiptapNode {
  type: string;
  attrs?: any;
  content?: any[];
  text?: string;
  marks?: any[];
}

export function markdownToTiptapNodes(markdown: string): TiptapNode[] {
  const lines = markdown.split("\n");
  const nodes: TiptapNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      nodes.push({
        type: "codeBlock",
        attrs: { language: lang || null },
        content: codeLines.length
          ? [{ type: "text", text: codeLines.join("\n") }]
          : [],
      });
      i++;
      continue;
    }

    
    if (line.startsWith("### ")) {
      nodes.push({
        type: "heading",
        attrs: { level: 3 },
        content: parseInline(line.slice(4)),
      });
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      nodes.push({
        type: "heading",
        attrs: { level: 2 },
        content: parseInline(line.slice(3)),
      });
      i++;
      continue;
    }
    if (line.startsWith("# ")) {
      nodes.push({
        type: "heading",
        attrs: { level: 1 },
        content: parseInline(line.slice(2)),
      });
      i++;
      continue;
    }

    
    if (line.startsWith("- ") || line.startsWith("* ")) {
      const items: TiptapNode[] = [];
      while (
        i < lines.length &&
        (lines[i].startsWith("- ") || lines[i].startsWith("* "))
      ) {
        
        const content = lines[i].startsWith("- [ ] ")
          ? lines[i].slice(6)
          : lines[i].startsWith("- [x] ")
          ? "✓ " + lines[i].slice(6)
          : lines[i].slice(2);

        items.push({
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: parseInline(content),
            },
          ],
        });
        i++;
      }
      nodes.push({ type: "bulletList", content: items });
      continue;
    }

    // Numbered list
    if (/^\d+\.\s/.test(line)) {
      const items: TiptapNode[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        const match = lines[i].match(/^\d+\.\s(.+)/);
        if (match) {
          items.push({
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: parseInline(match[1]),
              },
            ],
          });
        }
        i++;
      }
      nodes.push({ type: "orderedList", content: items });
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      nodes.push({
        type: "blockquote",
        content: [
          {
            type: "paragraph",
            content: parseInline(line.slice(2)),
          },
        ],
      });
      i++;
      continue;
    }

    // Empty line
    if (!line.trim()) {
      i++;
      continue;
    }

    // Regular paragraph
    nodes.push({
      type: "paragraph",
      content: parseInline(line),
    });
    i++;
  }

  return nodes;
}


function parseInline(text: string): TiptapNode[] {
  if (!text.trim()) return [];

  const nodes: TiptapNode[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    const codeMatch = remaining.match(/`(.+?)`/);
    const italicMatch = remaining.match(
      /(?<!\*)\*(?!\*)([^*]+?)(?<!\*)\*(?!\*)/
    );

    const candidates = [
      boldMatch && {
        match: boldMatch,
        type: "bold" as const,
        idx: boldMatch.index!,
      },
      codeMatch && {
        match: codeMatch,
        type: "code" as const,
        idx: codeMatch.index!,
      },
      italicMatch && {
        match: italicMatch,
        type: "italic" as const,
        idx: italicMatch.index!,
      },
    ].filter(Boolean) as Array<{
      match: RegExpMatchArray;
      type: "bold" | "code" | "italic";
      idx: number;
    }>;

    if (candidates.length === 0) {
      nodes.push({ type: "text", text: remaining });
      break;
    }

    candidates.sort((a, b) => a.idx - b.idx);
    const first = candidates[0];

    // Text before the match
    if (first.idx > 0) {
      nodes.push({ type: "text", text: remaining.slice(0, first.idx) });
    }

    // Formatted text
    const markType =
      first.type === "bold"
        ? "bold"
        : first.type === "italic"
        ? "italic"
        : "code";

    nodes.push({
      type: "text",
      text: first.match[1],
      marks: [{ type: markType }],
    });

    remaining = remaining.slice(first.idx + first.match[0].length);
  }

  return nodes;
}