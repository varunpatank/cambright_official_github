// v0.0.01 salah
"use client";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import "react-quill/dist/quill.snow.css";

interface PreviewProps {
  value: string;
  classs?: string;
}

export const Preview = ({ value, classs }: PreviewProps) => {
  const ReactQuill = useMemo(
    () => dynamic(() => import("react-quill"), { ssr: false }),
    []
  );

  // Custom styles for better chapter notes formatting
  const customStyles = `
    .ql-editor {
      font-size: 20px;
      line-height: 1.8;
      color: #e2e8f0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
    }
    .ql-editor * {
      color: inherit;
      font-size: inherit;
      line-height: inherit;
    }
    .ql-editor h1, .ql-editor h2, .ql-editor h3, .ql-editor h4, .ql-editor h5, .ql-editor h6 {
      color: #f8fafc;
      margin-top: 2em;
      margin-bottom: 0.75em;
      font-weight: 700;
      letter-spacing: -0.025em;
    }
    .ql-editor h1 { font-size: 2.5em; }
    .ql-editor h2 { font-size: 2em; }
    .ql-editor h3 { font-size: 1.75em; }
    .ql-editor h4 { font-size: 1.5em; }
    .ql-editor h5 { font-size: 1.25em; }
    .ql-editor h6 { font-size: 1.125em; }
    .ql-editor p {
      margin-bottom: 1.25em;
      color: #cbd5e1;
      font-size: 1.1em;
    }
    .ql-editor ul, .ql-editor ol {
      padding-left: 2em;
      margin-bottom: 1.25em;
    }
    .ql-editor li {
      margin-bottom: 0.5em;
      color: #cbd5e1;
      font-size: 1.05em;
    }
    .ql-editor blockquote {
      border-left: 5px solid #6366f1;
      padding-left: 1.5em;
      margin: 1.5em 0;
      color: #94a3b8;
      font-style: italic;
      background-color: rgba(99, 102, 241, 0.05);
      padding: 1em 1.5em;
      border-radius: 0.5em;
      font-size: 1.1em;
    }
    .ql-editor code {
      background-color: #1e293b;
      color: #f1f5f9;
      padding: 0.25em 0.5em;
      border-radius: 0.375em;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 0.9em;
      font-weight: 500;
    }
    .ql-editor pre {
      background-color: #0f172a;
      border: 2px solid #334155;
      border-radius: 0.75em;
      padding: 1.5em;
      margin: 1.5em 0;
      overflow-x: auto;
      font-size: 1em;
    }
    .ql-editor pre code {
      background: none;
      padding: 0;
      color: #e2e8f0;
      font-size: 1em;
    }
    .ql-editor a {
      color: #6366f1;
      text-decoration: underline;
      font-weight: 500;
      transition: color 0.2s ease;
    }
    .ql-editor a:hover {
      color: #8b5cf6;
    }
    .ql-editor strong, .ql-editor b {
      color: #f8fafc;
      font-weight: 700;
    }
    .ql-editor em, .ql-editor i {
      color: #cbd5e1;
      font-style: italic;
    }
    .ql-editor span {
      color: #cbd5e1;
    }
    .ql-editor div {
      color: #cbd5e1;
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      <div className={`bg-transparent ${classs}`}>
        <ReactQuill
          theme="bubble"
          value={value}
          readOnly
          className="chapter-preview"
        />
      </div>
    </>
  );
};
