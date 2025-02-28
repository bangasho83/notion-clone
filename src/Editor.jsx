import React, { useState, useEffect, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { SlashCommand } from "./SlashCommand";

// 1) If you're on Tiptap v2 or v3, you can rely on editor.isEmpty.
//    Alternatively, you can do: editor.getText().trim() === ""
//    to check emptiness.

const Editor = ({ content, onUpdateContent, title, onRenameTitle }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [titleValue, setTitleValue] = useState(title);

  useEffect(() => {
    setTitleValue(title);
  }, [title]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Start typing here...",
        showOnlyWhenEditable: false,
      }),
      SlashCommand,
    ],
    content,
    onUpdate: ({ editor }) => {
      onUpdateContent(editor.getHTML());

      const text = editor.getText();
      const selection = editor.state.selection;

      if (text.endsWith("/") && selection.from === selection.to) {
        // Show slash menu
        const pos = editor.view.coordsAtPos(selection.from);
        setMenuPosition({ top: pos.top + 25, left: pos.left });
        setShowMenu(true);
        setSelectedIndex(0);
      } else {
        setShowMenu(false);
      }
    },
  });

  //
  // 2) Move cursor to the start if the editor is empty on focus.
  //
  useEffect(() => {
    if (!editor) return;

    const handleFocus = () => {
      // If the editor is empty, move caret to doc start
      if (editor.isEmpty) {
        // Tiptap provides focus("start") to move the cursor to position 1
        editor.commands.focus("start");
      }
    };

    editor.on("focus", handleFocus);
    return () => {
      editor.off("focus", handleFocus);
    };
  }, [editor]);

  //
  // 3) Slash command items
  //
  const commands = [
    { name: "Heading 1", action: () => editor.chain().focus().toggleHeading({ level: 1 }).run() },
    { name: "Heading 2", action: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
    { name: "Bold", action: () => editor.chain().focus().toggleBold().run() },
    { name: "Italic", action: () => editor.chain().focus().toggleItalic().run() },
    { name: "Bullet List", action: () => editor.chain().focus().toggleBulletList().run() },
    { name: "Numbered List", action: () => editor.chain().focus().toggleOrderedList().run() },
  ];

  const handleCommandSelect = useCallback(
    (index) => {
      commands[index].action();
      setShowMenu(false);

      // Remove the "/" after selecting an option
      editor.commands.deleteRange({
        from: editor.state.selection.from - 1,
        to: editor.state.selection.from,
      });

      editor.commands.focus();
    },
    [commands, editor]
  );

  const handleKeyDown = (event) => {
    if (!showMenu) return;

    if (event.key === "ArrowDown") {
      setSelectedIndex((prev) => (prev + 1) % commands.length);
      event.preventDefault();
    } else if (event.key === "ArrowUp") {
      setSelectedIndex((prev) => (prev - 1 + commands.length) % commands.length);
      event.preventDefault();
    } else if (event.key === "Enter") {
      event.preventDefault();
      handleCommandSelect(selectedIndex);
    } else if (event.key === "Escape") {
      setShowMenu(false);
      event.preventDefault();
    }
  };

  return (
    <div className="editor-container" onKeyDown={handleKeyDown}>
      <input
        type="text"
        value={titleValue === "Untitled" ? "" : titleValue}
        onChange={(e) => setTitleValue(e.target.value)}
        onBlur={() => onRenameTitle(titleValue.trim() === "" ? "Untitled" : titleValue)}
        className="page-title-input"
        placeholder="Untitled"
      />
      <EditorContent editor={editor} />

      {showMenu && (
        <div
          className="slash-menu show"
          style={{ top: `${menuPosition.top}px`, left: `${menuPosition.left}px` }}
        >
          {commands.map((command, index) => (
            <div
              key={index}
              className={`menu-item ${index === selectedIndex ? "active" : ""}`}
              onMouseEnter={() => setSelectedIndex(index)}
              onClick={() => handleCommandSelect(index)}
            >
              {command.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Editor;
