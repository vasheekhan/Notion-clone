import type { Editor } from "@tiptap/react";
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code2,
  Type,
  Image as ImageIcon,
  Minus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface SlashCommand {
  title: string;
  description: string;
  searchTerms: string[];
  icon?: LucideIcon;
  command: (editor: Editor) => void;
}

export const slashCommands: SlashCommand[] = [
  {
    title: "Text",
    description: "Plain paragraph text",
    searchTerms: ["text", "paragraph", "plain", "p"],
    icon: Type,
    command: (editor) => {
      editor.chain().focus().setParagraph().run();
    },
  },
  {
    title: "Heading 1",
    description: "Big section heading",
    searchTerms: ["heading", "h1", "title", "large"],
    icon: Heading1,
    command: (editor) => {
      editor.chain().focus().toggleHeading({ level: 1 }).run();
    },
  },
  {
    title: "Heading 2",
    description: "Medium section heading",
    searchTerms: ["heading", "h2", "subtitle", "medium"],
    icon: Heading2,
    command: (editor) => {
      editor.chain().focus().toggleHeading({ level: 2 }).run();
    },
  },
  {
    title: "Heading 3",
    description: "Small section heading",
    searchTerms: ["heading", "h3", "small"],
    icon: Heading3,
    command: (editor) => {
      editor.chain().focus().toggleHeading({ level: 3 }).run();
    },
  },
  {
    title: "Bullet List",
    description: "Simple bulleted list",
    searchTerms: ["bullet", "list", "unordered", "ul"],
    icon: List,
    command: (editor) => {
      editor.chain().focus().toggleBulletList().run();
    },
  },
  {
    title: "Numbered List",
    description: "Numbered ordered list",
    searchTerms: ["number", "numbered", "ordered", "ol"],
    icon: ListOrdered,
    command: (editor) => {
      editor.chain().focus().toggleOrderedList().run();
    },
  },
  {
    title: "Quote",
    description: "Capture a quote",
    searchTerms: ["quote", "blockquote", "citation"],
    icon: Quote,
    command: (editor) => {
      editor.chain().focus().toggleBlockquote().run();
    },
  },
  {
    title: "Code Block",
    description: "Insert a code snippet",
    searchTerms: ["code", "codeblock", "snippet", "pre"],
    icon: Code2,
    command: (editor) => {
      editor.chain().focus().toggleCodeBlock().run();
    },
  },
  {
    title: "Divider",
    description: "Horizontal separator line",
    searchTerms: ["divider", "hr", "line", "separator", "rule"],
    icon: Minus,
    command: (editor) => {
      editor.chain().focus().setHorizontalRule().run();
    },
  },
  {
    title: "Image",
    description: "Upload an image",
    searchTerms: ["image", "picture", "photo", "img", "upload"],
    icon: ImageIcon,
    command: () => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";

      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        const dt = new DataTransfer();
        dt.items.add(file);

        const pasteEvent = new ClipboardEvent("paste", {
          clipboardData: dt,
          bubbles: true,
        });

        document.querySelector(".ProseMirror")?.dispatchEvent(pasteEvent);
      };

      input.click();
    },
  },
];