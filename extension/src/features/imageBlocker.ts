export const initImageBlocker = () => {
    // Inject a style tag to blur all images initially
    const style = document.createElement('style');
    style.id = 'a11yson-image-blocker';
    style.textContent = `
      img, video, canvas {
        filter: blur(20px) !important;
        transition: filter 0.3s ease !important;
        cursor: pointer !important;
      }
      img.a11yson-revealed, video.a11yson-revealed, canvas.a11yson-revealed {
        filter: none !important;
      }
      .a11yson-image-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.5);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: sans-serif;
          font-weight: bold;
          pointer-events: none;
          z-index: 10;
      }
    `;
    document.head.appendChild(style);
  
    const revealElement = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (['IMG', 'VIDEO', 'CANVAS'].includes(target.tagName)) {
        target.classList.toggle('a11yson-revealed');
        e.preventDefault();
        e.stopPropagation();
      }
    };
  
    document.addEventListener('click', revealElement, { capture: true });
  
    return () => {
      style.remove();
      document.removeEventListener('click', revealElement, { capture: true });
    };
  };
