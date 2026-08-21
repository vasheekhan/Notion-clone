import { useMemo } from "react";

interface AIResponseProps {
  content: string;
}

export default function AIResponse({ content }: AIResponseProps) {
  const rendered = useMemo(() => renderMarkdown(content), [content]);
  return <div className="ai-response-rendered">{rendered}</div>;
}

function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

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
      nodes.push(
        <pre key={key++} className="ai-resp-code-block">
          {lang && <div className="ai-resp-code-lang">{lang}</div>}
          <code>{codeLines.join("\n")}</code>
        </pre>
      );
      i++;
      continue;
    }

    if (line.startsWith("### ")) {
      nodes.push(
        <h4 key={key++} className="ai-resp-h3">
          {formatInline(line.slice(4))}
        </h4>
      );
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      nodes.push(
        <h3 key={key++} className="ai-resp-h2">
          {formatInline(line.slice(3))}
        </h3>
      );
      i++;
      continue;
    }
    if (line.startsWith("# ")) {
      nodes.push(
        <h2 key={key++} className="ai-resp-h1">
          {formatInline(line.slice(2))}
        </h2>
      );
      i++;
      continue;
    }

    if (/^- \[[ x]\] /.test(line)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^- \[[ x]\] /.test(lines[i])) {
        const checked = lines[i].startsWith("- [x] ");
        items.push(
          <li key={items.length} className="ai-resp-checkbox">
            <span className={`ai-checkbox ${checked ? "checked" : ""}`} />
            <span>{formatInline(lines[i].slice(6))}</span>
          </li>
        );
        i++;
      }
      nodes.push(
        <ul key={key++} className="ai-resp-list">
          {items}
        </ul>
      );
      continue;
    }

    if (line.startsWith("- ") || line.startsWith("* ")) {
      const items: React.ReactNode[] = [];
      while (
        i < lines.length &&
        (lines[i].startsWith("- ") || lines[i].startsWith("* "))
      ) {
        items.push(
          <li key={items.length} className="ai-resp-bullet">
            {formatInline(lines[i].slice(2))}
          </li>
        );
        i++;
      }
      nodes.push(
        <ul key={key++} className="ai-resp-list">
          {items}
        </ul>
      );
      continue;
    }

    if (/^\d+\.\s/.test(line)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        const match = lines[i].match(/^\d+\.\s(.+)/);
        if (match) {
          items.push(
            <li key={items.length} className="ai-resp-numbered">
              {formatInline(match[1])}
            </li>
          );
        }
        i++;
      }
      nodes.push(
        <ol key={key++} className="ai-resp-list">
          {items}
        </ol>
      );
      continue;
    }

    if (!line.trim()) {
      nodes.push(<div key={key++} className="ai-resp-spacer" />);
      i++;
      continue;
    }

    nodes.push(
      <p key={key++} className="ai-resp-paragraph">
        {formatInline(line)}
      </p>
    );
    i++;
  }

  return nodes;
}

function formatInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

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
      parts.push(remaining);
      break;
    }

    candidates.sort((a, b) => a.idx - b.idx);
    const first = candidates[0];

    if (first.idx > 0) parts.push(remaining.slice(0, first.idx));

    if (first.type === "bold") {
      parts.push(<strong key={key++}>{first.match[1]}</strong>);
    } else if (first.type === "code") {
      parts.push(
        <code key={key++} className="ai-resp-inline-code">
          {first.match[1]}
        </code>
      );
    } else {
      parts.push(<em key={key++}>{first.match[1]}</em>);
    }

    remaining = remaining.slice(first.idx + first.match[0].length);
  }

  return <>{parts}</>;
}