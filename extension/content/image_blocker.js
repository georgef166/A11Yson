// Image Blocker Content Script

// State
let isImageBlockingEnabled = false;

// Initialize
chrome.storage.local.get(['a11yson_settings'], (result) => {
    if (result.a11yson_settings && result.a11yson_settings.images === 'blocked') {
        isImageBlockingEnabled = true;
        processImages();
    }
});

// Listen for messages from popup/background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "toggle_images") {
        isImageBlockingEnabled = request.value;
        if (isImageBlockingEnabled) {
            processImages();
        } else {
            revealAllImages();
        }
    }
});

function processImages() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        if (!img.dataset.a11ysonProcessed) {
            blockImage(img);
        }
    });
}

function blockImage(img) {
    // Save original source
    const originalSrc = img.src;
    const width = img.width || img.clientWidth || 200;
    const height = img.height || img.clientHeight || 200;

    // Check if image is too small (likely an icon) - skip
    if (width < 50 || height < 50) return;

    img.dataset.a11ysonOriginalSrc = originalSrc;
    img.dataset.a11ysonProcessed = "true";
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.style.width = width + 'px';
    overlay.style.height = height + 'px';
    overlay.style.backgroundColor = '#f0f0f0';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.cursor = 'pointer';
    overlay.style.border = '1px dashed #ccc';
    overlay.style.position = 'relative'; // Or absolute depending on layout
    
    // Replace with overlay or cover
    // Simplest approach: Hide img, insert overlay
    img.style.display = 'none';
    
    overlay.innerText = "Image Hidden. Click to View.";
    overlay.title = img.alt || "Hidden Image";
    overlay.style.color = "#555";
    overlay.style.fontSize = "12px";
    overlay.style.fontFamily = "sans-serif";

    overlay.onclick = () => {
        img.style.display = 'block'; // Or original display
        overlay.remove();
        img.dataset.a11ysonProcessed = "revealed";
    };

    img.parentNode.insertBefore(overlay, img);
}

function revealAllImages() {
    // Logic to remove overlays and show images would go here
    // For now, simpler implementation: reload page or complex DOM manipulation
    // If we want dynamic: search for our overlays and click them programmatically or remove them
}
