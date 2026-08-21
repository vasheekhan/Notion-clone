import type { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline,
  Highlighter,
} from "lucide-react";

import ToolbarButton from "./ToolbarButton";

interface ToolbarProps {
  editor: Editor;
}

function Toolbar({ editor }: ToolbarProps) {
  if (!editor) return null;

  return (
    <div className="sticky top-4 z-10 mb-6 flex items-center gap-2 rounded-xl border border-neutral-200 bg-white p-2 shadow-sm">

      {/* Bold */}
      <ToolbarButton
        icon={<Bold size={18} />}
        isActive={editor.isActive("bold")}
        onClick={() =>
          editor.chain().focus().toggleBold().run()
        }
      />

      {/* Italic */}
      <ToolbarButton
        icon={<Italic size={18} />}
        isActive={editor.isActive("italic")}
        onClick={() =>
          editor.chain().focus().toggleItalic().run()
        }
      />

      {/* Underline */}
      <ToolbarButton
        icon={<Underline size={18} />}
        isActive={editor.isActive("underline")}
        onClick={() =>
          editor.chain().focus().toggleUnderline().run()
        }
      />

      {/* Highlight */}
      <ToolbarButton
        icon={<Highlighter size={18} />}
        isActive={editor.isActive("highlight")}
        onClick={() =>
          editor.chain().focus().toggleHighlight().run()
        }
      />

    </div>
  );
}

export default Toolbar;