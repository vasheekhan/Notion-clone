import { FloatingMenu } from "@tiptap/react/menus";
import type { Editor } from "@tiptap/react";
import { Plus } from "lucide-react";

interface Props {
  editor: Editor;
}

function FloatingToolbar({ editor }: Props) {
  return (
    <FloatingMenu
      editor={editor}
      className="rounded-xl border border-neutral-200 bg-white p-1 shadow-lg"
    >
      <button
        className="flex h-9 w-9 items-center justify-center rounded-md transition hover:bg-neutral-100"
      >
        <Plus size={18} />
      </button>
    </FloatingMenu>
  );
}

export default FloatingToolbar;