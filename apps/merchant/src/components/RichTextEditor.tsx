"use client";

import { useCallback, useRef } from "react";
import type { ReactElement } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import { Extension } from "@tiptap/core";
import type { Editor } from "@tiptap/react";
import {
  UndoIcon,
  RedoIcon,
  TextBoldIcon,
  TextItalicIcon,
  TextUnderlineIcon,
} from "@shopify/polaris-icons";
import { Icon } from "@shopify/polaris";
import styles from "./RichTextEditor.module.css";

const DEFAULT_CONTENT = `<div style="text-align:center"><h1>Thank You, {{customer.first_name}}! 🎉</h1><p>Your order <strong>{{order.number}}</strong> is confirmed.</p><div style="border:1px solid #e1e3e5;border-radius:8px;padding:16px;margin:16px auto;max-width:400px;text-align:center"><p><strong>🛍️ Order Summary</strong></p><p>{{order.products}}</p><p><strong>Total: {{order.total}}</strong></p></div></div>`;

const FONT_SIZES = [
  "12px",
  "14px",
  "16px",
  "18px",
  "20px",
  "24px",
  "28px",
  "32px",
  "36px",
  "48px",
];

const FontSize = Extension.create({
  name: "fontSize",
  addOptions() {
    return { types: ["textStyle"] };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types as string[],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (el: HTMLElement) =>
              el.style.fontSize.replace(/['"]+/g, "") || null,
            renderHTML: (attrs: Record<string, unknown>) => {
              if (!attrs["fontSize"]) return {};
              return { style: `font-size: ${attrs["fontSize"]}` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize:
        (fontSize: string) =>
        ({ chain }: { chain: () => ReturnType<Editor["chain"]> }) =>
          chain().setMark("textStyle", { fontSize }).run(),
      unsetFontSize:
        () =>
        ({ chain }: { chain: () => ReturnType<Editor["chain"]> }) =>
          chain()
            .setMark("textStyle", { fontSize: null })
            .removeEmptyTextStyle()
            .run(),
    };
  },
});

type ToolbarBtnProps = {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
};

function ToolbarBtn({
  onClick,
  active,
  title,
  children,
}: ToolbarBtnProps): ReactElement {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`${styles.toolbarBtn} ${active ? styles.toolbarBtnActive : ""}`}
    >
      {children}
    </button>
  );
}

type RichTextEditorProps = {
  initialContent?: string;
  onChange?: (html: string) => void;
};

export function RichTextEditor({
  initialContent = DEFAULT_CONTENT,
  onChange,
}: RichTextEditorProps): ReactElement {
  const textColorRef = useRef<HTMLInputElement>(null);
  const highlightColorRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextStyle,
      FontSize,
      Color,
      Highlight.configure({ multicolor: true }),
      Placeholder.configure({
        placeholder: "Write your thank you message here…",
      }),
    ],
    content: initialContent,
    onUpdate: ({ editor: e }) => {
      onChange?.(e.getHTML());
    },
    editorProps: {
      attributes: {
        spellcheck: "true",
      },
    },
  });

  const getCurrentFontSize = useCallback((): string => {
    if (!editor) return "16px";
    const attrs = editor.getAttributes("textStyle") as {
      fontSize?: string;
    };
    return attrs.fontSize ?? "16px";
  }, [editor]);

  const applyFontSize = useCallback(
    (size: string): void => {
      if (!editor) return;
      if (size) {
        (
          editor.chain().focus() as unknown as {
            setFontSize: (s: string) => { run: () => void };
          }
        )
          .setFontSize(size)
          .run();
      } else {
        (
          editor.chain().focus() as unknown as {
            unsetFontSize: () => { run: () => void };
          }
        )
          .unsetFontSize()
          .run();
      }
    },
    [editor]
  );

  if (!editor) return <></>;

  return (
    <div className={styles.wrapper}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        {/* Undo / Redo */}
        <ToolbarBtn
          title="Undo"
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Icon source={UndoIcon} />
        </ToolbarBtn>
        <ToolbarBtn
          title="Redo"
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Icon source={RedoIcon} />
        </ToolbarBtn>

        <div className={styles.toolbarDivider} />

        {/* Font size */}
        <select
          className={styles.toolbarSelect}
          value={getCurrentFontSize()}
          onChange={(e) => applyFontSize(e.target.value)}
          title="Font size"
        >
          {FONT_SIZES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <div className={styles.toolbarDivider} />

        {/* Text color */}
        <div className={styles.colorPickerWrapper} title="Text color">
          <button
            type="button"
            className={styles.toolbarBtn}
            onClick={() => textColorRef.current?.click()}
          >
            <span className={styles.textColorIndicator}>
              <span>A</span>
              <span
                className={styles.textColorBar}
                style={{
                  backgroundColor:
                    editor.getAttributes("textStyle").color ?? "#d82c0d",
                }}
              />
            </span>
          </button>
          <input
            ref={textColorRef}
            type="color"
            className={styles.colorInput}
            defaultValue="#d82c0d"
            onChange={(e) =>
              editor.chain().focus().setColor(e.target.value).run()
            }
          />
        </div>

        {/* Highlight color */}
        <div className={styles.colorPickerWrapper} title="Highlight color">
          <button
            type="button"
            className={styles.toolbarBtn}
            onClick={() => highlightColorRef.current?.click()}
          >
            <span className={styles.highlightIndicator}>
              <span>A</span>
              <span
                className={styles.highlightBar}
                style={{ backgroundColor: "#ffff00" }}
              />
            </span>
          </button>
          <input
            ref={highlightColorRef}
            type="color"
            className={styles.colorInput}
            defaultValue="#ffff00"
            onChange={(e) =>
              editor
                .chain()
                .focus()
                .setHighlight({ color: e.target.value })
                .run()
            }
          />
        </div>

        <div className={styles.toolbarDivider} />

        {/* Bold */}
        <ToolbarBtn
          title="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Icon source={TextBoldIcon} />
        </ToolbarBtn>

        {/* Italic */}
        <ToolbarBtn
          title="Italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Icon source={TextItalicIcon} />
        </ToolbarBtn>

        {/* Underline */}
        <ToolbarBtn
          title="Underline"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <Icon source={TextUnderlineIcon} />
        </ToolbarBtn>

        {/* Strikethrough */}
        <ToolbarBtn
          title="Strikethrough"
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <span className={styles.strikeIcon}>S</span>
        </ToolbarBtn>

        <div className={styles.toolbarDivider} />

        {/* Headings */}
        <ToolbarBtn
          title="Heading 1"
          active={editor.isActive("heading", { level: 1 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
        >
          <span style={{ fontSize: 11, fontWeight: 700 }}>H1</span>
        </ToolbarBtn>
        <ToolbarBtn
          title="Heading 2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <span style={{ fontSize: 11, fontWeight: 700 }}>H2</span>
        </ToolbarBtn>
        <ToolbarBtn
          title="Heading 3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          <span style={{ fontSize: 11, fontWeight: 700 }}>H3</span>
        </ToolbarBtn>

        <div className={styles.toolbarDivider} />

        {/* Lists */}
        <ToolbarBtn
          title="Bullet list"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <span style={{ fontSize: 16 }}>≡</span>
        </ToolbarBtn>
        <ToolbarBtn
          title="Numbered list"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <span style={{ fontSize: 13 }}>1.</span>
        </ToolbarBtn>

        <div className={styles.toolbarDivider} />

        {/* Alignment via paragraph CSS — using inline marks */}
        <ToolbarBtn
          title="Align left"
          onClick={() => editor.chain().focus().run()}
        >
          <span style={{ fontSize: 13 }}>⬛</span>
        </ToolbarBtn>

        {/* Clear formatting */}
        <ToolbarBtn
          title="Clear formatting"
          onClick={() =>
            editor.chain().focus().clearNodes().unsetAllMarks().run()
          }
        >
          <span style={{ fontSize: 12, textDecoration: "line-through" }}>A</span>
        </ToolbarBtn>
      </div>

      {/* Editor area */}
      <div
        className={styles.editorContent}
        onClick={() => editor.commands.focus()}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
