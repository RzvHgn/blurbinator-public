import React, { useState, useEffect } from "react";
import "./App.css";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";

function fallbackCopyTextToClipboard(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;

  // Avoid scrolling to bottom
  textArea.style.position = "fixed";
  textArea.style.top = 0;
  textArea.style.left = 0;
  textArea.style.width = "2em";
  textArea.style.height = "2em";
  textArea.style.padding = 0;
  textArea.style.border = "none";
  textArea.style.outline = "none";
  textArea.style.boxShadow = "none";
  textArea.style.background = "transparent";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    document.execCommand("copy");
    console.log("Fallback copy was successful!");
  } catch (err) {
    console.error("Fallback: Unable to copy", err);
  }

  document.body.removeChild(textArea);
}

const loadBlurbs = async (folder) => {
  const result = {};
  const files = {
    DRBlurbs: ["JewelleryDR.json", "ToysDR.json"],
    SABlurbs: ["JewellerySA.json", "NTJewellerySA.json", "ToysSA.json"],
  };

  if (!files[folder]) return result;

  for (const file of files[folder]) {
    const filePath = `/blurbs/${folder}/${file}`;
    try {
      const response = await fetch(filePath);
      const data = await response.json();
      result[file.replace(".json", "")] = data;
    } catch (err) {
      console.error(`Error loading ${filePath}:`, err);
    }
  }

  return result;
};

function App() {
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [blurbs, setBlurbs] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBlurb, setSelectedBlurb] = useState(null);
  const [currentLanguages, setCurrentLanguages] = useState({});
  const [blurbText, setBlurbText] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [page, setPage] = useState("home");
  const [searchTerm, setSearchTerm] = useState("");
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (selectedFolder) {
      loadBlurbs(selectedFolder).then((data) => {
        setBlurbs(data);
        setSelectedCategory(null);
        setSelectedBlurb(null);
        setBlurbText("");
        setCurrentLanguages({});
        setPage("home");
      });
    }
  }, [selectedFolder]);

  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode === "true") {
      setIsDarkMode(true);
      document.body.classList.add("dark-mode");
    }
  }, []);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    const langs = {};
    for (const blurbTitle in blurbs[category]) {
      langs[blurbTitle] = Object.keys(blurbs[category][blurbTitle])[0];
    }
    setCurrentLanguages(langs);
    setPage("category");
    setSearchTerm(""); // Clear search box
  };

  const handleBlurbSelect = (blurbTitle) => {
    setSelectedBlurb(blurbTitle);
    const language = currentLanguages[blurbTitle];
    setBlurbText(blurbs[selectedCategory][blurbTitle][language]);
    setPage("blurb");
  };

  const handleLanguageChange = (blurbTitle, lang) => {
    const updated = { ...currentLanguages, [blurbTitle]: lang };
    setCurrentLanguages(updated);
    setBlurbText(blurbs[selectedCategory][blurbTitle][lang]);
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.body.classList.toggle("dark-mode", newMode);
    localStorage.setItem("darkMode", newMode);
  };

  return (
    <div className="App">
      <div className="resizable-container">
        <ResizableBox
          width={200}
          height={window.innerHeight}
          axis="x"
          minConstraints={[200, 100]}
          maxConstraints={[200, 1000]}
          resizeHandles={[]}
        >
          <div className="sidebar">
            <h2>Blurb Files</h2>
            <button
              onClick={() => setSelectedFolder("DRBlurbs")}
              className={selectedFolder === "DRBlurbs" ? "active-button" : ""}
            >
              DR Blurbs
            </button>
            <button
              onClick={() => setSelectedFolder("SABlurbs")}
              className={selectedFolder === "SABlurbs" ? "active-button" : ""}
            >
              SA Blurbs
            </button>

            {Object.keys(blurbs).length > 0 && (
              <>
                <h3 style={{ marginTop: "20px" }}>Categories</h3>
                {Object.keys(blurbs).map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategorySelect(category)}
                    className={
                      selectedCategory === category ? "active-button" : ""
                    }
                  >
                    {category}
                  </button>
                ))}
              </>
            )}

            <div
              style={{
                marginTop: "auto",
                textAlign: "center",
                paddingTop: "10px",
              }}
            >
              <button
                onClick={toggleDarkMode}
                title="Toggle Dark Mode"
                style={{
                  fontSize: "20px",
                  padding: "5px 10px",
                  borderRadius: "50%",
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: isDarkMode ? "#ffd700" : "#222",
                }}
              >
                {isDarkMode ? "🌞 Light" : "🌙 Dark"}
              </button>
            </div>
          </div>
        </ResizableBox>

        <div className="main-content">
          {page === "home" && (
            <div className="home-page">
              <h2>Welcome to the Blurbinator!</h2>
              <p>Select a blurb set to get started.</p>
            </div>
          )}
          {showToast && <div className="toast">Copied!</div>}
          {page === "category" && selectedCategory && (
            <div className="blurb-section">
              <h2>Blurbs - {selectedCategory}</h2>

              <input
                type="text"
                placeholder="Search blurbs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-box"
              />

              {Object.keys(blurbs[selectedCategory])
                .filter((blurbTitle) =>
                  blurbTitle.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((blurbTitle) => (
                  <div key={blurbTitle} className="blurb-item">
                    <button onClick={() => handleBlurbSelect(blurbTitle)}>
                      {blurbTitle}
                    </button>
                  </div>
                ))}

              <button onClick={() => setSelectedCategory(null)}>
                Back to File
              </button>
            </div>
          )}

          {page === "blurb" && selectedBlurb && (
            <div className="blurb-display">
              <h2>{selectedBlurb}</h2>
              <textarea
                value={blurbText}
                readOnly
                style={{
                  width: "100%",
                  height: "calc(100vh - 300px)", // adjust this if you want even better fitting
                  resize: "vertical",
                  padding: "15px",
                  fontSize: "15px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  backgroundColor: isDarkMode ? "#444" : "#fff",
                  color: isDarkMode ? "#fff" : "#000",
                  boxSizing: "border-box",
                  marginBottom: "15px",
                  overflowY: "auto",
                }}
              />
              <div
                style={{ display: "flex", gap: "10px", marginBottom: "10px" }}
              >
                <select
                  onChange={(e) =>
                    handleLanguageChange(selectedBlurb, e.target.value)
                  }
                  value={currentLanguages[selectedBlurb]}
                >
                  {Object.keys(blurbs[selectedCategory][selectedBlurb]).map(
                    (lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    )
                  )}
                </select>
                <button
                  onClick={() => {
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                      navigator.clipboard
                        .writeText(blurbText)
                        .then(() => {
                          setShowToast(true);
                          setTimeout(() => setShowToast(false), 2000);
                        })
                        .catch((err) => {
                          console.error("Clipboard API error:", err);
                          fallbackCopyTextToClipboard(blurbText);
                          setShowToast(true);
                          setTimeout(() => setShowToast(false), 2000);
                        });
                    } else {
                      fallbackCopyTextToClipboard(blurbText);
                      setShowToast(true);
                      setTimeout(() => setShowToast(false), 2000);
                    }
                  }}
                >
                  Copy
                </button>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => setPage("category")}>
                  Back to Categories
                </button>
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setPage("home");
                  }}
                >
                  Return Home
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer>
        <p>© razhug</p>
      </footer>
    </div>
  );
}

export default App;
