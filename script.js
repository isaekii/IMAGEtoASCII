document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const fileInput = document.getElementById('image-upload');
    const fileName = document.getElementById('file-name');
    const previewImage = document.getElementById('preview-image');
    const convertBtn = document.getElementById('convert-btn');
    const resultSection = document.getElementById('result-section');
    const asciiArt = document.getElementById('ascii-art');
    const charSetSelect = document.getElementById('char-set');
    const widthInput = document.getElementById('width');
    const widthValue = document.getElementById('width-value');
    const invertSelect = document.getElementById('invert');
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    const zoomLevel = document.getElementById('zoom-level');
    const downloadBtn = document.getElementById('download-btn');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
  
    // Variables
    let currentImage = null;
    let currentZoom = 1;
    
    // Character sets
    const charSets = {
      standard: '@#S%?*+;:,. ',
      blocks: '█▓▒░ ',
      simple: '+−. '
    };
  
    // File input handling
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      fileName.textContent = file.name;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        currentImage = new Image();
        currentImage.onload = () => {
          previewImage.src = event.target.result;
          previewImage.style.display = 'block';
          convertBtn.disabled = false;
        };
        currentImage.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  
    // Drag and drop functionality
    const fileInputLabel = document.querySelector('.file-input-label');
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      fileInputLabel.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
      fileInputLabel.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
      fileInputLabel.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
      fileInputLabel.style.backgroundColor = 'rgba(74, 111, 165, 0.2)';
      fileInputLabel.style.borderColor = 'var(--accent)';
    }
    
    function unhighlight() {
      fileInputLabel.style.backgroundColor = 'var(--light)';
      fileInputLabel.style.borderColor = 'var(--primary)';
    }
    
    fileInputLabel.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
      const dt = e.dataTransfer;
      const file = dt.files[0];
      
      fileInput.files = dt.files;
      fileName.textContent = file.name;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        currentImage = new Image();
        currentImage.onload = () => {
          previewImage.src = event.target.result;
          previewImage.style.display = 'block';
          convertBtn.disabled = false;
        };
        currentImage.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  
    // Width slider
    widthInput.addEventListener('input', () => {
      widthValue.textContent = widthInput.value;
    });
  
    // Convert button
    convertBtn.addEventListener('click', convertToAscii);
  
    function convertToAscii() {
      if (!currentImage) return;
      
      const targetWidth = parseInt(widthInput.value);
      const aspectRatio = currentImage.height / currentImage.width;
      const targetHeight = Math.floor(targetWidth * aspectRatio * 0.5); // Compensate for character aspect ratio
      
      // Set canvas size
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      
      // Draw image on canvas
      ctx.drawImage(currentImage, 0, 0, targetWidth, targetHeight);
      
      // Get image data
      const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight);
      const pixels = imageData.data;
      
      // Get selected character set
      let chars;
      if (charSetSelect.value === 'custom') {
        chars = '@#S%?*+;:,. '; // Default to standard if custom is selected but not implemented
      } else {
        chars = charSets[charSetSelect.value];
      }
      
      // Should we invert the colors?
      const invert = invertSelect.value === 'yes';
      if (invert) {
        chars = chars.split('').reverse().join('');
      }
      
      // Generate ASCII art
      let asciiString = '';
      for (let y = 0; y < targetHeight; y++) {
        for (let x = 0; x < targetWidth; x++) {
          const pixelIndex = (y * targetWidth + x) * 4;
          const r = pixels[pixelIndex];
          const g = pixels[pixelIndex + 1];
          const b = pixels[pixelIndex + 2];
          
          // Calculate grayscale value (luminance)
          const grayscale = 0.299 * r + 0.587 * g + 0.114 * b;
          
          // Map grayscale to character
          const charIndex = Math.floor((grayscale / 255) * (chars.length - 1));
          asciiString += chars[charIndex];
        }
        asciiString += '\n';
      }
      
      // Display ASCII art
      asciiArt.textContent = asciiString;
      
      // Reset zoom
      currentZoom = 1;
      asciiArt.style.transform = `scale(${currentZoom})`;
      zoomLevel.textContent = '100%';
      
      // Show result section
      resultSection.style.display = 'flex';
      resultSection.scrollIntoView({ behavior: 'smooth' });
    }
  
    // Zoom controls
    zoomInBtn.addEventListener('click', () => {
      if (currentZoom < 5) {
        currentZoom += 0.2;
        updateZoom();
      }
    });
    
    zoomOutBtn.addEventListener('click', () => {
      if (currentZoom > 0.2) {
        currentZoom -= 0.2;
        updateZoom();
      }
    });
    
    function updateZoom() {
      asciiArt.style.transform = `scale(${currentZoom})`;
      zoomLevel.textContent = `${Math.round(currentZoom * 100)}%`;
    }
  
    // Download button
    downloadBtn.addEventListener('click', () => {
      const text = asciiArt.textContent;
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ascii-art.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  });
  