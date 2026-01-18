export const initImageBlocker = () => {
  // Inject styles for hidden images with reveal buttons
  const style = document.createElement("style");
  style.id = "a11yson-image-blocker";
  style.textContent = `
      .a11yson-censored {
        filter: blur(40px) brightness(0.2) !important;
        transition: all 0.3s ease !important;
        pointer-events: none !important;
      }
      .a11yson-revealed {
        filter: none !important;
        pointer-events: auto !important;
      }
      .a11yson-reveal-button {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: transparent;
        color: white;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 32px;
        z-index: 2147483646;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
      }
      .a11yson-reveal-button:hover {
        transform: translate(-50%, -50%) scale(1.2);
        opacity: 0.8;
      }
      .a11yson-image-wrapper {
        position: relative !important;
        display: inline-block !important;
        vertical-align: middle !important;
        overflow: hidden !important;
        border-radius: 4px;
      }
    `;
  document.head.appendChild(style);

  const wrapAndCensorImage = (img: Element) => {
    if ((img as HTMLElement).dataset.a11ysonProcessed) return;
    (img as HTMLElement).dataset.a11ysonProcessed = "true";

    // Only hide images that are 2x larger than the magnifying glass (32px * 2 = 64px)
    const threshold = 64;
    if ((img as HTMLElement).offsetWidth > 0 &&
      ((img as HTMLElement).offsetWidth < threshold || (img as HTMLElement).offsetHeight < threshold)) {
      return;
    }

    const wrapper = document.createElement("div");
    wrapper.className = "a11yson-image-wrapper";

    // Attempt to match the original display/flow
    const computed = window.getComputedStyle(img);
    wrapper.style.display = computed.display === "block" ? "block" : "inline-block";
    wrapper.style.margin = computed.margin;
    wrapper.style.float = computed.float;
    wrapper.style.position = computed.position === "static" ? "relative" : computed.position;

    const button = document.createElement("button");
    button.className = "a11yson-reveal-button";
    button.innerHTML = "🔍";
    button.setAttribute("type", "button");

    img.classList.add("a11yson-censored");

    button.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (img.classList.contains("a11yson-censored")) {
        img.classList.remove("a11yson-censored");
        img.classList.add("a11yson-revealed");
        button.style.display = "none";
      }
    };

    if (img.parentNode) {
      img.parentNode.insertBefore(wrapper, img);
      wrapper.appendChild(img);
      wrapper.appendChild(button);
    }
  };

  const selector = "img, video, canvas, picture, svg, embed, object";
  document.querySelectorAll(selector).forEach(wrapAndCensorImage);

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType === 1) {
          const el = node as HTMLElement;
          if (el.matches(selector)) wrapAndCensorImage(el);
          el.querySelectorAll(selector).forEach(wrapAndCensorImage);
        }
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  return () => {
    style.remove();
    observer.disconnect();
    document.querySelectorAll("[data-a11yson-processed]").forEach((img) => {
      delete (img as HTMLElement).dataset.a11ysonProcessed;
      img.classList.remove("a11yson-censored", "a11yson-revealed");
      const wrapper = img.parentElement;
      if (wrapper?.classList.contains("a11yson-image-wrapper")) {
        wrapper.parentNode?.insertBefore(img, wrapper);
        wrapper.remove();
      }
    });
  };
};
