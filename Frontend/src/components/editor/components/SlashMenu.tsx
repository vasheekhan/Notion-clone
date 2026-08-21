import { useEffect, useRef } from "react";
import type { SlashCommand } from "../commands/slashCommands";

interface SlashMenuProps {
  commands: SlashCommand[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  query?: string;
}

export default function SlashMenu({
  commands,
  selectedIndex,
  onSelect,
  query = "",
}: SlashMenuProps) {
  const selectedRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    selectedRef.current?.scrollIntoView({
      block: "nearest",
      behavior: "smooth",
    });
  }, [selectedIndex]);

  return (
    <div className="slash-menu">
      <div className="slash-header">
        {query ? (
          <>
            Searching for<span className="slash-query">/{query}</span>
          </>
        ) : (
          "Basic blocks"
        )}
      </div>

      <div className="slash-list">
        {commands.length === 0 ? (
          <div className="slash-empty">
            No results for <strong>/{query}</strong>
          </div>
        ) : (
          commands.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={item.title}
                ref={index === selectedIndex ? selectedRef : null}
                onClick={() => onSelect(index)}
                onMouseEnter={() => {}}
                className={`slash-item ${
                  selectedIndex === index ? "selected" : ""
                }`}
              >
                {Icon && (
                  <div className="slash-item-icon">
                    <Icon size={16} />
                  </div>
                )}

                <div className="slash-item-content">
                  <span className="slash-item-title">{item.title}</span>
                  <span className="slash-item-desc">
                    {item.description}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}