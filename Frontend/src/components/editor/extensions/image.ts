import Image from "@tiptap/extension-image";

export const image = Image.configure({
  inline: false,
  allowBase64: false,
  HTMLAttributes: {
    class: "editor-image",
  },
});