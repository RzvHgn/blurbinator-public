/* global chrome */

// Create the floating bubble
const bubble = document.createElement("img");
bubble.id = "blurbinator-bubble";
bubble.src = chrome.runtime.getURL("BlurbinatorLogo.png");
bubble.alt = "Open Blurbinator";
document.body.appendChild(bubble);

// Create the floating window
const floatingContainer = document.createElement("div");
floatingContainer.id = "floating-blurb-viewer";
floatingContainer.style.display = "none"; // Start hidden
document.body.appendChild(floatingContainer);

// Create an iframe for the app
const iframe = document.createElement("iframe");
iframe.src = chrome.runtime.getURL("index.html");
iframe.id = "blurbinator-iframe";
floatingContainer.appendChild(iframe);

// Create the minimize button
const minimizeButton = document.createElement("button");
minimizeButton.innerText = "−";
minimizeButton.className = "minimize-button";
floatingContainer.appendChild(minimizeButton);

// Function to show/hide the floating window
function toggleFloatingWindow() {
  if (floatingContainer.style.display === "none") {
    floatingContainer.style.display = "block";
    bubble.style.display = "none"; // Hide bubble when open
  } else {
    floatingContainer.style.display = "none";
    bubble.style.display = "block"; // Show bubble when minimized
  }
}

// Toggle on click
minimizeButton.addEventListener("click", toggleFloatingWindow);

// --- Make Bubble Draggable ---
let isDragging = false;
let dragStartX, dragStartY;

bubble.addEventListener("mousedown", (e) => {
  isDragging = false;
  dragStartX = e.clientX;
  dragStartY = e.clientY;

  const onMouseMove = (e) => {
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      isDragging = true;
      bubble.style.left = `${bubble.offsetLeft + dx}px`;
      bubble.style.top = `${bubble.offsetTop + dy}px`;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
    }
  };

  const onMouseUp = () => {
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);

    if (!isDragging) {
      toggleFloatingWindow(); // Only open the app if it was a true click
    }
  };

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
});

// --- Make Floating Window Resizable ---
const resizeHandle = document.createElement("div");
resizeHandle.className = "resize-handle";
floatingContainer.appendChild(resizeHandle);

let isResizing = false;
let initialWidth, initialHeight, initialX, initialY;

resizeHandle.addEventListener("mousedown", (e) => {
  e.preventDefault();
  isResizing = true;
  initialWidth = floatingContainer.offsetWidth;
  initialHeight = floatingContainer.offsetHeight;
  initialX = e.clientX;
  initialY = e.clientY;
  document.body.style.cursor = "nwse-resize";
});

document.addEventListener("mousemove", (e) => {
  if (isResizing) {
    const newWidth = initialWidth + (e.clientX - initialX);
    const newHeight = initialHeight - (e.clientY - initialY);
    if (newWidth >= 250 && newWidth <= 600)
      floatingContainer.style.width = `${newWidth}px`;
    if (newHeight >= 350 && newHeight <= 800)
      floatingContainer.style.height = `${newHeight}px`;

    // Ensure iframe resizes properly
    iframe.style.width = "100%";
    iframe.style.height = "100%";
  }
});

document.addEventListener("mouseup", () => {
  isResizing = false;
  document.body.style.cursor = "default";
});

// Add a click event listener to the floating bubble
document
  .getElementById("blurbinator-bubble")
  .addEventListener("click", function () {
    // Stop the animation by directly modifying the animation property
    this.style.animation = "none";

    // Optional: To reset the style after a while (if you want to allow restarting the animation)
    // setTimeout(() => {
    //   this.style.animation = 'pulse 2s infinite';
    // }, 1000);  // Reset after 1 second
  });
