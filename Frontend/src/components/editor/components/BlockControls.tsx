import type { Editor } from "@tiptap/react";

export interface SlashCommand {
  title: string;
  description: string;
  searchTerms: string[];
  command: (editor: Editor) => void;
}

export const slashCommands: SlashCommand[] = [
  {
    title: "Text",
    description: "Start writing with plain text.",
    searchTerms: ["paragraph", "text"],
    command: (editor) => {
      editor.chain().focus().setParagraph().run();
    },
  },
  {
    title: "Heading 1",
    description: "Large heading",
    searchTerms: ["h1", "heading"],
    command: (editor) => {
      editor.chain().focus().toggleHeading({ level: 1 }).run();
    },
  },
  {
    title: "Heading 2",
    description: "Medium heading",
    searchTerms: ["h2", "heading"],
    command: (editor) => {
      editor.chain().focus().toggleHeading({ level: 2 }).run();
    },
  },
  {
    title: "Bullet List",
    description: "Create a bullet list",
    searchTerms: ["list", "bullet"],
    command: (editor) => {
      editor.chain().focus().toggleBulletList().run();
    },
  },
  {
    title: "Numbered List",
    description: "Create a numbered list",
    searchTerms: ["ordered", "number"],
    command: (editor) => {
      editor.chain().focus().toggleOrderedList().run();
    },
  },
  {
    title: "Quote",
    description: "Insert quote",
    searchTerms: ["quote"],
    command: (editor) => {
      editor.chain().focus().toggleBlockquote().run();
    },
  },
  {
    title: "Code Block",
    description: "Insert code block",
    searchTerms: ["code"],
    command: (editor) => {
      editor.chain().focus().toggleCodeBlock().run();
    },
  },
];