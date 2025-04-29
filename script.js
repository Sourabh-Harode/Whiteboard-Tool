// Setup Canvas
const canvas = document.getElementById('whiteboard');
const ctx = canvas.getContext('2d');









// Create Eraser Button
const eraserBtn = document.createElement('button');
eraserBtn.id = 'eraserBtn';
eraserBtn.textContent = '🧽 Eraser';
eraserBtn.className = 'tool-btn';
document.getElementById('toolbar').appendChild(eraserBtn);

// Eraser Logic: sets brushColor to canvas background
eraserBtn.addEventListener('click', () => {
  currentMode = 'draw'; // keep in draw mode
  const canvasBg = getComputedStyle(canvas).getPropertyValue('background-color') || '#ffffff';
  brushColor = canvasBg.trim();
});

















// Adjust canvas size
function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Drawing state
let painting = false;
let currentMode = 'draw'; // draw or text
let undoStack = [];
let redoStack = [];

// Settings
let brushColor = '#000000';
let brushWidth = 5;
ctx.lineCap = 'round';
ctx.lineJoin = 'round';

// Save canvas state for Undo
function saveState() {
    undoStack.push(canvas.toDataURL());
    if (undoStack.length > 20) undoStack.shift(); // Limit history
    redoStack = []; // Clear redo stack on new action
}

// Start Drawing or Text
function startPosition(e) {
    if (currentMode === 'text') {
        saveState();
        addText(e);
    } else {
        painting = true;
        saveState();
        draw(e);
    }
}

// End Drawing
function endPosition() {
    painting = false;
    ctx.beginPath();
}

















  

document.getElementById('drawBtn').onclick = () => {
    currentMode = 'draw';
    brushColor = document.getElementById('colorPicker').value;
  };
  


// Draw (Pen Mode)
function draw(e) {
    if (!painting) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineWidth = brushWidth;
    ctx.strokeStyle = brushColor;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}














// Add Text Function
function addText(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const text = prompt("Enter text:");
    if (text) {
        ctx.fillStyle = brushColor;
        ctx.font = `${brushWidth * 4}px Arial`;
        ctx.fillText(text, x, y);
    }
}

// Event Listeners
canvas.addEventListener('mousedown', startPosition);
canvas.addEventListener('mouseup', endPosition);
canvas.addEventListener('mousemove', draw);

// Toolbar Buttons
document.getElementById('drawBtn').onclick = () => currentMode = 'draw';
document.getElementById('textBtn').onclick = () => currentMode = 'text';

document.getElementById('colorPicker').addEventListener('input', (e) => {
    brushColor = e.target.value;
});

document.getElementById('brushSize').addEventListener('input', (e) => {
    brushWidth = e.target.value;
});

// Undo
document.getElementById('undoBtn').onclick = () => {
    if (undoStack.length > 0) {
        redoStack.push(canvas.toDataURL());
        const imgData = undoStack.pop();
        const img = new Image();
        img.src = imgData;
        img.onload = function () {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
    }
};

// Redo
document.getElementById('redoBtn').onclick = () => {
    if (redoStack.length > 0) {
        undoStack.push(canvas.toDataURL());
        const imgData = redoStack.pop();
        const img = new Image();
        img.src = imgData;
        img.onload = function () {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
    }
};

// Clear
document.getElementById('clearBtn').onclick = () => {
    saveState();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
};

// Download as PNG
document.getElementById('downloadBtn').onclick = () => {
    const link = document.createElement('a');
    link.download = 'whiteboard_drawing.png';
    link.href = canvas.toDataURL();
    link.click();
};

// Shareable Link
document.getElementById('shareBtn').onclick = () => {
    const dataURL = canvas.toDataURL();
    const win = window.open();
    win.document.write('<iframe src="' + dataURL + '" frameborder="0" style="border:0; top:0; left:0; bottom:0; right:0; width:100%; height:100%;" allowfullscreen></iframe>');
};



// Dark Mode Toggle Slider with Sun and Moon
const toggleContainer = document.createElement('label');
toggleContainer.className = 'toggle-switch';
toggleContainer.title = 'Toggle Dark Mode';

const toggleInput = document.createElement('input');
toggleInput.type = 'checkbox';

const toggleSlider = document.createElement('span');
toggleSlider.className = 'slider';

// Append elements
toggleContainer.appendChild(toggleInput);
toggleContainer.appendChild(toggleSlider);
document.getElementById('toolbar').appendChild(toggleContainer);

// Toggle event
toggleInput.addEventListener('change', () => {
  document.body.classList.toggle('dark-mode');
});







document.getElementById('bgColorInput').addEventListener('input', (e) => {
    const color = e.target.value;
    document.documentElement.style.setProperty('--canvas-bg', color);
    canvas.style.backgroundColor = color;
  });
  









  // Highlight Mode
document.getElementById('highlightBtn').addEventListener('click', () => {
    currentMode = 'highlight';
    brushColor = document.getElementById('colorPicker').value;
    brushWidth = 10 ; // Set a thicker line width for highlighting
  });
  
  // Highlight Drawing Function
  function draw(e) {
      if (!painting) return;
  
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
  
      ctx.lineWidth = brushWidth ;
      ctx.strokeStyle = brushColor;
      ctx.globalAlpha = currentMode === 'highlight' ? 0.1 : 1; // Transparent for highlighter mode
  
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
  }

  




// Zoom Controls
const zoomInBtn = document.getElementById('zoomIn');
const zoomOutBtn = document.getElementById('zoomOut');
const zoomLevelText = document.getElementById('zoomLevel');
const zoomSlider = document.getElementById('zoomSlider');

const MAX_ZOOM = 2; // Maximum zoom level
const MIN_ZOOM = 0.1; // Minimum zoom level
let scale = 1; // Default scale
const zoomFactor = 0.1;

// Apply zoom level
function applyZoom() {
  canvas.style.transform = `scale(${scale})`;
  canvas.style.transformOrigin = 'center center';
  zoomLevelText.textContent = `${Math.round(scale * 100)}%`;
  zoomSlider.value = scale * 100; // Update slider position

  // Ensure canvas doesn't overflow the viewport
  checkCanvasOverflow();
}

// Zoom In and Out buttons
zoomInBtn.addEventListener('click', () => {
  if (scale < MAX_ZOOM) {
    scale += zoomFactor;
    applyZoom();
  }
});

zoomOutBtn.addEventListener('click', () => {
  if (scale > MIN_ZOOM) {
    scale -= zoomFactor;
    applyZoom();
  }
});

// Zoom Slider
zoomSlider.addEventListener('input', (e) => {
  scale = e.target.value / 100; // Convert percentage to scale factor
  applyZoom();
});

// Prevent canvas from overflowing the viewport
function checkCanvasOverflow() {
  const canvasRect = canvas.getBoundingClientRect();
  const bodyRect = document.body.getBoundingClientRect();

  // Prevent the canvas from being larger than the viewport (minus toolbar space)
  if (canvasRect.width > bodyRect.width) {
    canvas.style.width = `${bodyRect.width}px`;
  }

  if (canvasRect.height > bodyRect.height - document.getElementById('toolbar').offsetHeight) {
    canvas.style.height = `${bodyRect.height - document.getElementById('toolbar').offsetHeight}px`;
  }
}

// Optional: Reset zoom on resize
window.addEventListener('resize', () => {
  if (scale !== 1) {
    scale = 1;
    applyZoom();
  }
});


canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (e.deltaY < 0 && scale < MAX_ZOOM) {
      scale += zoomFactor;
    } else if (e.deltaY > 0 && scale > MIN_ZOOM) {
      scale -= zoomFactor;
    }
    applyZoom();
  });
  

// Initial zoom application
applyZoom();







