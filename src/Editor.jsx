import { useState, useEffect } from "react";

const Editor = ({ content, onUpdateContent, title, onRenameTitle }) => {
  const [editorContent, setEditorContent] = useState(content);
  const [titleValue, setTitleValue] = useState(title);

  useEffect(() => {
    setEditorContent(content);
    setTitleValue(title);
  }, [content, title]);

  const handleContentChange = (e) => {
    setEditorContent(e.target.value);
    onUpdateContent(e.target.value);
  };

  const handleTitleChange = (e) => {
    setTitleValue(e.target.value);
  };

  const handleTitleBlur = () => {
    const newTitle = titleValue.trim() === "" ? "Untitled" : titleValue;
    setTitleValue(newTitle);
    onRenameTitle(newTitle);
  };

  return (
    <div className="editor-wrapper">
      <input
        type="text"
        value={titleValue === "Untitled" ? "" : titleValue} // Clears placeholder on focus
        onChange={handleTitleChange}
        onBlur={handleTitleBlur}
        className="page-title-input"
        placeholder="Untitled"
      />
      <textarea
        className="editor-textarea"
        value={editorContent}
        onChange={handleContentChange}
        placeholder="Start typing here..."
      />
    </div>
  );
};

export default Editor;
