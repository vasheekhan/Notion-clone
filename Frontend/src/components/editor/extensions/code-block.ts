import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createLowlight, common } from "lowlight";

const lowlight = createLowlight(common);

export const codeBlock = CodeBlockLowlight.configure({
  lowlight,
  defaultLanguage: "javascript",
  HTMLAttributes: {
    class: "editor-code-block hljs",
  },
});