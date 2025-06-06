document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('whiteboardCanvas');
  const ctx = canvas.getContext('2d');
  const colorPicker = document.getElementById('colorPicker');
  const toolSelector = document.getElementById('toolSelector');
  const undoBtn = document.getElementById('undoBtn');
  const redoBtn = document.getElementById('redoBtn');
  const clearCanvasBtn = document.getElementById('clearCanvasBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const shareBtn = document.getElementById('shareBtn');
  const bgColorPicker = document.getElementById('bgColorPicker');
  const zoomInBtn = document.getElementById('zoomInBtn');
  const zoomOutBtn = document.getElementById('zoomOutBtn');
  const resetZoomBtn = document.getElementById('resetZoomBtn');

  let drawing = false;
  let currentTool = 'pen';
  let color = '#000000';
  let bgColor = bgColorPicker.value || '#ffffff';
  let paths = [];
  let undonePaths = [];
  let currentPath = [];

  let scale = 1;
  const scaleStep = 0.1;
  const minScale = 0.5;
  const maxScale = 3;
  const dpr = window.devicePixelRatio || 1;

  // Resize and scale canvas
  function setupCanvas() {
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
    ctx.scale(dpr * scale, dpr * scale); // Apply scale and devicePixelRatio
    applyBackgroundColor();
    redrawCanvas();
  }

  function applyBackgroundColor() {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / (scale),
      y: (e.clientY - rect.top) / (scale)
    };
  }

  function startDrawing(e) {
    drawing = true;
    currentPath = [];
    ctx.beginPath();
    const pos = getMousePos(e);
    ctx.moveTo(pos.x, pos.y);
    currentPath.push({ x: pos.x, y: pos.y, color, tool: currentTool });
  }

  function draw(e) {
    if (!drawing) return;
    const pos = getMousePos(e);

    ctx.lineTo(pos.x, pos.y);
    ctx.lineWidth = currentTool === 'marker' ? 6 : currentTool === 'eraser' ? 20 : 2;
    ctx.strokeStyle = currentTool === 'eraser' ? bgColor : color;
    ctx.globalCompositeOperation = 'source-over';
    ctx.stroke();

    currentPath.push({
      x: pos.x,
      y: pos.y,
      color: currentTool === 'eraser' ? bgColor : color,
      tool: currentTool
    });
  }

  function endDrawing() {
    if (drawing) {
      paths.push(currentPath);
      undonePaths = [];
    }
    drawing = false;
    ctx.closePath();
  }

  function redrawCanvas() {
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset before clearing
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr * scale, dpr * scale); // Reapply zoom and resolution
    applyBackgroundColor();

    for (const path of paths) {
      ctx.beginPath();
      for (let i = 0; i < path.length; i++) {
        const point = path[i];
        ctx.lineWidth = point.tool === 'marker' ? 6 : point.tool === 'eraser' ? 20 : 2;
        ctx.strokeStyle = point.tool === 'eraser' ? bgColor : point.color;
        ctx.globalCompositeOperation = 'source-over';
        if (i === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      }
      ctx.stroke();
      ctx.closePath();
    }
  }

  function undo() {
    if (paths.length > 0) {
      undonePaths.push(paths.pop());
      redrawCanvas();
    }
  }

  function redo() {
    if (undonePaths.length > 0) {
      paths.push(undonePaths.pop());
      redrawCanvas();
    }
  }

  function clearCanvas() {
    paths = [];
    undonePaths = [];
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr * scale, dpr * scale);
    applyBackgroundColor();
  }

  function downloadCanvas() {
    const link = document.createElement('a');
    link.download = 'whiteboard.png';
    link.href = canvas.toDataURL();
    link.click();
  }

  function shareCanvas() {
    canvas.toBlob(blob => {
      const file = new File([blob], 'whiteboard.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({
          files: [file],
          title: 'Whiteboard Drawing',
          text: 'Check out this drawing!',
        });
      } else {
        alert('Sharing not supported on this browser.');
      }
    });
  }

  zoomInBtn.addEventListener('click', () => {
    if (scale < maxScale) {
      scale += scaleStep;
      setupCanvas();
    }
  });

  zoomOutBtn.addEventListener('click', () => {
    if (scale > minScale) {
      scale -= scaleStep;
      setupCanvas();
    }
  });

  resetZoomBtn.addEventListener('click', () => {
    scale = 1;
    setupCanvas();
  });

  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', endDrawing);
  canvas.addEventListener('mouseout', endDrawing);

  colorPicker.addEventListener('input', (e) => {
    color = e.target.value;
  });

  toolSelector.addEventListener('change', (e) => {
    currentTool = e.target.value;
  });

  undoBtn.addEventListener('click', undo);
  redoBtn.addEventListener('click', redo);
  clearCanvasBtn.addEventListener('click', clearCanvas);
  downloadBtn.addEventListener('click', downloadCanvas);
  shareBtn.addEventListener('click', shareCanvas);

  bgColorPicker.addEventListener('input', (e) => {
    bgColor = e.target.value;
    redrawCanvas();
  });

  // Initialize high-res canvas
  setupCanvas();
  window.addEventListener('resize', setupCanvas);
});
