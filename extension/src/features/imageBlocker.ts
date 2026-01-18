export const initImageBlocker = () => {
  // Inject styles for blurred images with reveal buttons
  const style = document.createElement("style");
  style.id = "a11yson-image-blocker";
  style.textContent = `
      img.a11yson-censored, video.a11yson-censored, canvas.a11yson-censored {
        filter: blur(20px) !important;
        transition: filter 0.3s ease !important;
        position: relative !important;
      }
      img.a11yson-revealed, video.a11yson-revealed, canvas.a11yson-revealed {
        filter: none !important;
      }
      .a11yson-reveal-button {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.7);
        color: white;
        border: 2px solid white;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 24px;
        font-weight: bold;
        z-index: 100;
        transition: all 0.2s ease;
        user-select: none;
        -webkit-user-select: none;
        pointer-events: auto;
      }
      .a11yson-reveal-button:hover {
        background: rgba(0, 0, 0, 0.9);
        transform: translate(-50%, -50%) scale(1.1);
      }
      .a11yson-image-wrapper {
        position: relative;
        display: inline-block;
      }
    `;
  document.head.appendChild(style);

  const wrapAndCensorImage = (img: Element | HTMLElement) => {
    if ((img as HTMLElement).classList.contains("a11yson-censored")) return; // Already processed

    (img as HTMLElement).classList.add("a11yson-censored");

    // Create wrapper
    const wrapper = document.createElement("div");
    wrapper.className = "a11yson-image-wrapper";
    wrapper.style.position = "relative";
    wrapper.style.display = "inline-block";
    wrapper.style.width = (img as HTMLElement).offsetWidth
      ? (img as HTMLElement).offsetWidth + "px"
      : "100%";
    wrapper.style.height = (img as HTMLElement).offsetHeight
      ? (img as HTMLElement).offsetHeight + "px"
      : "auto";

    // Create button
    const button = document.createElement("button");
    button.className = "a11yson-reveal-button";
    button.innerHTML = "👁️‍🗨️"; // Eye with slash icon (Unicode)
    button.setAttribute("aria-label", "Toggle image visibility");
    button.setAttribute("type", "button");

    let isRevealed = false;

    button.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      isRevealed = !isRevealed;
      if (isRevealed) {
        img.classList.add("a11yson-revealed");
        img.classList.remove("a11yson-censored");
        button.innerHTML = "👁️"; // Eye icon when revealed
        button.style.opacity = "0.5";
      } else {
        img.classList.remove("a11yson-revealed");
        img.classList.add("a11yson-censored");
        button.innerHTML = "👁️‍🗨️"; // Eye with slash when hidden
        button.style.opacity = "1";
      }
    });

    img.parentNode?.insertBefore(wrapper, img);
    wrapper.appendChild(img as HTMLElement);
    wrapper.appendChild(button);
  };

  // Censor all initial images
  document.querySelectorAll("img, video, canvas").forEach(wrapAndCensorImage);

  // Watch for new images added to the page
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) {
          // Element node
          const el = node as HTMLElement;
          if (["IMG", "VIDEO", "CANVAS"].includes(el.tagName)) {
            wrapAndCensorImage(el);
          }
          // Also check for images within the added node
          el.querySelectorAll("img, video, canvas").forEach(wrapAndCensorImage);
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  return () => {
    style.remove();
    observer.disconnect();
  };
};
