import { useState } from "react";
import type { Editor } from "@tiptap/react";
import { slashCommands } from "../commands/slashCommands";

export function useSlashCommands(editor: Editor | null) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredCommands = slashCommands.filter((command) => {
    const search = query.toLowerCase();

    return (
      command.title.toLowerCase().includes(search) ||
      command.description.toLowerCase().includes(search) ||
      command.searchTerms.some((term) =>
        term.toLowerCase().includes(search)
      )
    );
  });

  const openMenu = (search = "") => {
    setQuery(search);
    setSelectedIndex(0);
    setIsOpen(true);
  };

  const closeMenu = () => {
    setQuery("");
    setSelectedIndex(0);
    setIsOpen(false);
  };

  const executeCommand = (index: number) => {
    if (!editor) return;

    filteredCommands[index]?.command(editor);

    closeMenu();
  };

  return {
    isOpen,
    query,
    selectedIndex,
    filteredCommands,
    openMenu,
    closeMenu,
    executeCommand,
    setQuery,
    setSelectedIndex,
  };
}