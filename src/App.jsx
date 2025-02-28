import { useState, useEffect } from "react";
import Editor from "./Editor";
import { v4 as uuidv4 } from "uuid";

export default function App() {
  const [pages, setPages] = useState([]);
  const [currentPageId, setCurrentPageId] = useState(null);

  useEffect(() => {
    const savedPages = JSON.parse(localStorage.getItem("pages")) || [];
    setPages(savedPages);
    if (savedPages.length > 0) {
      setCurrentPageId(savedPages[0].id);
    }
  }, []);

  useEffect(() => {
    if (pages.length > 0) {
      localStorage.setItem("pages", JSON.stringify(pages));
    } else {
      localStorage.removeItem("pages");
    }
  }, [pages]);

  const currentPage = pages.find((page) => page.id === currentPageId) || null;

  const addPage = () => {
    const newPage = { id: uuidv4(), title: "Untitled", content: "" };
    setPages((prevPages) => {
      const updatedPages = [...prevPages, newPage];
      localStorage.setItem("pages", JSON.stringify(updatedPages));
      return updatedPages;
    });
    setCurrentPageId(newPage.id);
  };

  const deletePage = (id) => {
    setPages((prevPages) => {
      const updatedPages = prevPages.filter((page) => page.id !== id);
      localStorage.setItem("pages", JSON.stringify(updatedPages));
      return updatedPages;
    });

    if (currentPageId === id) {
      setCurrentPageId(pages.length > 1 ? pages[0].id : null);
    }
  };

  const updatePageContent = (newContent) => {
    setPages((prevPages) => {
      const updatedPages = prevPages.map((page) =>
        page.id === currentPageId ? { ...page, content: newContent } : page
      );
      localStorage.setItem("pages", JSON.stringify(updatedPages));
      return updatedPages;
    });
  };

  const renamePageTitle = (newTitle) => {
    setPages((prevPages) => {
      const updatedPages = prevPages.map((page) =>
        page.id === currentPageId ? { ...page, title: newTitle } : page
      );
      localStorage.setItem("pages", JSON.stringify(updatedPages));
      return updatedPages;
    });
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <h2>Pages</h2>
        <button onClick={addPage} className="add-page">➕ New Page</button>
        <ul>
          {pages.map((page) => (
            <li
              key={page.id}
              className={currentPageId === page.id ? "active" : ""}
              onClick={() => setCurrentPageId(page.id)}
            >
              <span className="page-title">{page.title}</span>
              <button
                className="delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  deletePage(page.id);
                }}
              >
                ✖
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="editor-wrapper">
        {currentPage ? (
          <Editor
            key={currentPage.id} 
            content={currentPage.content}
            onUpdateContent={updatePageContent}
            title={currentPage.title}
            onRenameTitle={renamePageTitle}
          />
        ) : (
          <p className="empty-state">No page selected. Create a new one! 😊</p>
        )}
      </div>
    </div>
  );
}
