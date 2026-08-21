import { BubbleMenu } from "@tiptap/react/menus";
import type { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Highlighter,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Code2,
} from "lucide-react";

interface Props {
  editor: Editor;
}

interface BubbleButtonProps {
  onClick: () => void;
  active: boolean;
  children: React.ReactNode;
}

function BubbleButton({ onClick, active, children }: BubbleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`bubble-btn ${active ? "active" : ""}`}
    >
      {children}
    </button>
  );
}

export default function BubbleToolbar({ editor }: Props) {
  return (
    <BubbleMenu editor={editor} className="bubble-toolbar">
      <BubbleButton
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold size={15} />
      </BubbleButton>

      <BubbleButton
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic size={15} />
      </BubbleButton>

      <BubbleButton
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <Underline size={15} />
      </BubbleButton>

      <BubbleButton
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough size={15} />
      </BubbleButton>

      <BubbleButton
        active={editor.isActive("highlight")}
        onClick={() => editor.chain().focus().toggleHighlight().run()}
      >
        <Highlighter size={15} />
      </BubbleButton>

      <div className="bubble-divider" />

      <BubbleButton
        active={editor.isActive("heading", { level: 1 })}
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 1 }).run()
        }
      >
        <Heading1 size={15} />
      </BubbleButton>

      <BubbleButton
        active={editor.isActive("heading", { level: 2 })}
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
      >
        <Heading2 size={15} />
      </BubbleButton>

      <div className="bubble-divider" />

      <BubbleButton
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List size={15} />
      </BubbleButton>

      <BubbleButton
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered size={15} />
      </BubbleButton>

      <BubbleButton
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote size={15} />
      </BubbleButton>

      <BubbleButton
        active={editor.isActive("codeBlock")}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        <Code2 size={15} />
      </BubbleButton>
    </BubbleMenu>
  );
}