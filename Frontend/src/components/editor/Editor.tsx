import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { EditorContent, useEditor } from "@tiptap/react";

import { starterKit } from "./extensions/starter-kit";
import { placeholder } from "./extensions/placeholder";
import { underline } from "./extensions/underline";
import { highlight } from "./extensions/highlight";
import { image } from "./extensions/image";
import { codeBlock } from "./extensions/code-block";

import BubbleToolbar from "./components/BubbleToolbar";
import SlashMenu from "./components/SlashMenu";
import { slashCommands } from "./commands/slashCommands";

import type { Page } from "../../types";
import { useWorkspace } from "../../context/WorkspaceContext";
import {
  getPageContent,
  updatePageContent,
} from "../../services/page.service";
import { uploadImage } from "../../services/upload.service";

import "./editor.css";

interface EditorProps {
  page: Page;
  onEditorReady?: (editor: any) => void;
}

export default function Editor({ page, onEditorReady }: EditorProps) {
  const { renamePage } = useWorkspace();

  const [title, setTitle] = useState(page.title);
  const [isSlashOpen, setIsSlashOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  // Refs to avoid stale state in editor callbacks
  const isSlashOpenRef = useRef(false);
  const selectedIndexRef = useRef(0);
  const filteredCommandsRef = useRef<typeof slashCommands>([]);

  const editorContainerRef = useRef<HTMLDivElement>(null);

  // Keep refs in sync
  useEffect(() => {
    isSlashOpenRef.current = isSlashOpen;
  }, [isSlashOpen]);

  useEffect(() => {
    selectedIndexRef.current = selectedIndex;
  }, [selectedIndex]);

  const editor = useEditor({
    extensions: [
      starterKit,
      placeholder,
      underline,
      highlight,
      image,
      codeBlock,
    ],
    content: "",
    immediatelyRender: false,

    editorProps: {
      handleKeyDown(view, event) {
        // ─── Check if inside code block ───
        const editorInstance = (view as any)._editor;
        const inCodeBlock =
          editorInstance?.isActive("codeBlock") ||
          editorInstance?.isActive("code");

        // Open slash menu
        if (event.key === "/") {
          if (inCodeBlock) return false;
          setTimeout(() => positionMenu(), 0);
          setIsSlashOpen(true);
          setQuery("");
          setSelectedIndex(0);
          return false;
        }

        if (event.key === "Escape") {
          if (isSlashOpenRef.current) {
            setIsSlashOpen(false);
            return true;
          }
          return false;
        }

        if (!isSlashOpenRef.current) return false;

        if (event.key === "ArrowDown") {
          event.preventDefault();
          setSelectedIndex((prev) =>
            Math.min(prev + 1, filteredCommandsRef.current.length - 1)
          );
          return true;
        }

        if (event.key === "ArrowUp") {
          event.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          return true;
        }

        if (event.key === "Enter") {
          event.preventDefault();
          executeCommandRef.current(selectedIndexRef.current);
          return true;
        }

        return false;
      },

      handlePaste(_view, event) {
        const items = event.clipboardData?.items;
        if (!items) return false;

        for (const item of items) {
          if (item.type.startsWith("image/")) {
            event.preventDefault();
            const file = item.getAsFile();
            if (file) handleImageUpload(file);
            return true;
          }
        }
        return false;
      },

      handleDrop(_view, event) {
        const files = event.dataTransfer?.files;
        if (!files || files.length === 0) return false;

        const imageFiles = Array.from(files).filter((f) =>
          f.type.startsWith("image/")
        );

        if (imageFiles.length === 0) return false;

        event.preventDefault();
        imageFiles.forEach((file) => handleImageUpload(file));
        return true;
      },
    },
  });

  
  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  
  function positionMenu() {
    if (!editor || !editorContainerRef.current) return;

    const { from } = editor.state.selection;
    const coords = editor.view.coordsAtPos(from);
    const containerRect = editorContainerRef.current.getBoundingClientRect();

    const MENU_WIDTH = 320;
    const MENU_HEIGHT = 380;
    const GAP = 8;
    const VIEWPORT_PADDING = 16;

    const spaceBelow = window.innerHeight - coords.bottom;
    const spaceAbove = coords.top;

    let top: number;

    if (
      spaceBelow < MENU_HEIGHT + VIEWPORT_PADDING &&
      spaceAbove > spaceBelow
    ) {
      top = coords.top - containerRect.top - MENU_HEIGHT - GAP;
    } else {
      top = coords.bottom - containerRect.top + GAP;
    }

    let left = coords.left - containerRect.left;
    if (left + MENU_WIDTH > containerRect.width) {
      left = containerRect.width - MENU_WIDTH - VIEWPORT_PADDING;
    }
    if (left < 0) left = 0;

    setMenuPos({ top, left });
  }


  useEffect(() => {
    if (!editor) return;

    (async () => {
      try {
        const res = await getPageContent(page.id);
        if (res.content) {
          editor.commands.setContent(res.content);
        } else {
          editor.commands.setContent("");
        }
      } catch (err) {
        console.error("Failed to load content:", err);
      }
    })();

    setTitle(page.title);
  }, [page.id, editor]);


  useEffect(() => {
    if (!editor) return;

    let timeout: any;

    const handleUpdate = () => {
      clearTimeout(timeout);
      timeout = setTimeout(async () => {
        setSaving(true);
        try {
          await updatePageContent(page.id, editor.getJSON());
        } catch (err) {
          console.error("Save failed:", err);
        } finally {
          setSaving(false);
        }
      }, 800);
    };

    editor.on("update", handleUpdate);
    return () => {
      editor.off("update", handleUpdate);
      clearTimeout(timeout);
    };
  }, [editor, page.id]);


  useEffect(() => {
    if (title === page.title) return;
    const timeout = setTimeout(() => {
      renamePage(page.id, title);
    }, 600);
    return () => clearTimeout(timeout);
  }, [title]);

  const filteredCommands = useMemo(() => {
    const filtered = slashCommands.filter((item) => {
      const search = query.toLowerCase();
      return (
        item.title.toLowerCase().includes(search) ||
        item.description.toLowerCase().includes(search) ||
        item.searchTerms.some((term) => term.toLowerCase().includes(search))
      );
    });
    filteredCommandsRef.current = filtered;
    return filtered;
  }, [query]);

  const executeCommand = useCallback(
    (index: number) => {
      if (!editor) return;

      const cmd = filteredCommandsRef.current[index];
      if (!cmd) return;

      const { from } = editor.state.selection;
      const textBefore = editor.state.doc.textBetween(
        Math.max(0, from - 100),
        from,
        "\n"
      );

      const match = textBefore.match(/\/\w*$/);

      if (match) {
        editor
          .chain()
          .focus()
          .deleteRange({ from: from - match[0].length, to: from })
          .run();
      }

      cmd.command(editor);

      setIsSlashOpen(false);
      setQuery("");
      setSelectedIndex(0);
    },
    [editor]
  );

  const executeCommandRef = useRef(executeCommand);
  useEffect(() => {
    executeCommandRef.current = executeCommand;
  }, [executeCommand]);


  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      if (!isSlashOpenRef.current) return;

      if (editor.isActive("codeBlock") || editor.isActive("code")) {
        setIsSlashOpen(false);
        return;
      }

      const { from } = editor.state.selection;
      const textBefore = editor.state.doc.textBetween(
        Math.max(0, from - 50),
        from,
        "\n"
      );

      const match = textBefore.match(/\/(\w*)$/);
      if (match) {
        setQuery(match[1]);
        setSelectedIndex(0);
        positionMenu();
      } else {
        setIsSlashOpen(false);
        setQuery("");
      }
    };

    editor.on("selectionUpdate", handleUpdate);
    editor.on("update", handleUpdate);

    return () => {
      editor.off("selectionUpdate", handleUpdate);
      editor.off("update", handleUpdate);
    };
  }, [editor]);


  async function handleImageUpload(file: File) {
    if (!editor) return;

    const blobUrl = URL.createObjectURL(file);
    editor
      .chain()
      .focus()
      .setImage({ src: blobUrl, alt: "Uploading..." })
      .run();

    try {
      const url = await uploadImage(file, `pages/${page.id}`);
      const { doc } = editor.state;
      let replaced = false;

      doc.descendants((node, pos) => {
        if (replaced) return false;
        if (node.type.name === "image" && node.attrs.src === blobUrl) {
          editor
            .chain()
            .setNodeSelection(pos)
            .updateAttributes("image", { src: url, alt: "Image" })
            .run();
          replaced = true;
          return false;
        }
      });

      URL.revokeObjectURL(blobUrl);
    } catch (err: any) {
      console.error("Image upload failed:", err);
      alert(err.response?.data?.message || "Failed to upload image");
      URL.revokeObjectURL(blobUrl);
    }
  }

  if (!editor) return null;

  return (
    <div className="editor-wrapper">
      <div className="editor-container" ref={editorContainerRef}>
        {saving && <div className="editor-saving">Saving...</div>}

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled"
          className="page-title"
          autoFocus={title === "Untitled"}
          onFocus={(e) => {
            if (title === "Untitled") e.target.select();
          }}
        />

        <div className="editor-body">
          <BubbleToolbar editor={editor} />

          {isSlashOpen && (
            <div
              className="slash-menu-wrapper"
              style={{
                top: `${menuPos.top}px`,
                left: `${menuPos.left}px`,
              }}
            >
              <SlashMenu
                commands={filteredCommands}
                selectedIndex={selectedIndex}
                onSelect={executeCommand}
                query={query}
              />
            </div>
          )}

          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}