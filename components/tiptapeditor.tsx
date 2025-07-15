"use client";

import { useMemo, useEffect, useRef } from "react";
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";

interface EditorProps {
  onChange: (value: string) => void;
  value: string;
}

export const TiptapEditor = ({ onChange, value }: EditorProps) => {
  const editorRef = useRef<Editor | null>(null);

  useEffect(() => {
    const editorElement = document.querySelector("#tiptap-editor");

    if (editorElement) {
      // Initialize the Tiptap editor if the element exists
      editorRef.current = new Editor({
        element: editorElement,
        extensions: [StarterKit],
        content: value,
        onUpdate: ({ editor }) => {
          onChange(editor.getHTML()); // Send the updated HTML content to the parent component
        },
      });
    }

    // Cleanup the editor on component unmount
    return () => {
      editorRef.current?.destroy();
    };
  }, [onChange, value]);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.commands.setContent(value); // Update content if editor is initialized
    }
  }, [value]);

  return (
    <div className="bg-[#020218] outline-n-8 border-n-8">
      <div id="tiptap-editor" />
    </div>
  );
};
