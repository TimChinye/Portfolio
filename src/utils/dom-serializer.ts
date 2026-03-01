/**
 * Serializes the current DOM while preserving transient states.
 */

export function serializeDOM(root: HTMLElement): string {
  const clone = root.cloneNode(true) as HTMLElement;

  // 1. Replicate <canvas> content
  const originalCanvases = root.querySelectorAll('canvas');
  const clonedCanvases = clone.querySelectorAll('canvas');

  originalCanvases.forEach((canvas, index) => {
    try {
      const dataUrl = (canvas as HTMLCanvasElement).toDataURL();
      const img = document.createElement('img');
      img.src = dataUrl;
      img.style.cssText = canvas.style.cssText;
      img.className = canvas.className;

      const clonedCanvas = clonedCanvases[index];
      if (clonedCanvas && clonedCanvas.parentNode) {
        clonedCanvas.parentNode.replaceChild(img, clonedCanvas);
      }
    } catch (e) {
      console.warn('Could not serialize canvas', e);
    }
  });

  // 2. Form values
  const inputs = root.querySelectorAll('input, textarea, select');
  const clonedInputs = clone.querySelectorAll('input, textarea, select');

  inputs.forEach((input, index) => {
    const value = (input as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value;
    const clonedInput = clonedInputs[index] as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    if (clonedInput) {
      if (input.tagName === 'SELECT') {
        const selectedIndex = (input as HTMLSelectElement).selectedIndex;
        (clonedInput as HTMLSelectElement).selectedIndex = selectedIndex;
      } else {
        clonedInput.setAttribute('value', value);
      }
    }
  });

  // 3. Replicate Hover State
  const hoveredElements = root.querySelectorAll(':hover');
  if (hoveredElements.length > 0) {
    const deepestHovered = hoveredElements[hoveredElements.length - 1] as HTMLElement;
    const allOriginal = Array.from(root.querySelectorAll('*'));
    const index = allOriginal.indexOf(deepestHovered);
    const allCloned = clone.querySelectorAll('*');
    const clonedEquivalent = allCloned[index] as HTMLElement;

    if (clonedEquivalent) {
      const style = window.getComputedStyle(deepestHovered);
      clonedEquivalent.style.backgroundColor = style.backgroundColor;
      clonedEquivalent.style.color = style.color;
      clonedEquivalent.style.borderColor = style.borderColor;
      clonedEquivalent.style.opacity = style.opacity;
      clonedEquivalent.style.transform = style.transform;
    }
  }

  // 4. Replicate Text Selection
  const selection = window.getSelection();
  if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
    const range = selection.getRangeAt(0);
    const selectionRects = range.getClientRects();

    const selectionOverlay = document.createElement('div');
    selectionOverlay.style.position = 'absolute';
    selectionOverlay.style.pointerEvents = 'none';
    selectionOverlay.style.zIndex = '999999';
    selectionOverlay.style.top = '0';
    selectionOverlay.style.left = '0';

    Array.from(selectionRects).forEach(rect => {
      const span = document.createElement('div');
      span.style.position = 'absolute';
      span.style.left = `${rect.left + window.scrollX}px`;
      span.style.top = `${rect.top + window.scrollY}px`;
      span.style.width = `${rect.width}px`;
      span.style.height = `${rect.height}px`;
      span.style.backgroundColor = 'rgba(0, 123, 255, 0.3)';
      selectionOverlay.appendChild(span);
    });

    clone.appendChild(selectionOverlay);
  }

  return clone.innerHTML; // Return innerHTML to avoid nested body
}

export function getFullPageHTML(themeOverride?: "light" | "dark"): string {
  const originalHtml = document.documentElement;
  const doc = originalHtml.cloneNode(true) as HTMLElement;

  // Preserve <html> attributes
  Array.from(originalHtml.attributes).forEach(attr => {
    doc.setAttribute(attr.name, attr.value);
  });

  if (themeOverride) {
    // next-themes typically uses class="dark" or class="light" on html
    if (themeOverride === "dark") {
      doc.classList.add("dark");
      doc.classList.remove("light");
    } else {
      doc.classList.add("light");
      doc.classList.remove("dark");
    }
    // Also handle data-theme if present
    doc.setAttribute("data-theme", themeOverride);
  }

  const body = doc.querySelector('body');
  if (body) {
    // Correctly replace inner content
    body.innerHTML = serializeDOM(document.body);
  }

  const head = doc.querySelector('head');
  if (head) {
    const base = document.createElement('base');
    base.href = window.location.origin;
    head.insertBefore(base, head.firstChild);

    doc.setAttribute('data-scroll-x', window.scrollX.toString());
    doc.setAttribute('data-scroll-y', window.scrollY.toString());
  }

  // Hide the switcher and overlay
  const itemsToHide = doc.querySelectorAll('[data-html2canvas-ignore]');
  itemsToHide.forEach(el => (el as HTMLElement).style.display = 'none');

  // Inline CSS to ensure snapshots have styles even if the remote browser can't fetch them
  let allCss = "";
  const baseUrl = window.location.origin;

  try {
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        const rules = Array.from(sheet.cssRules);
        for (const rule of rules) {
          // Resolve relative URLs in CSS (fonts, images) to absolute URLs
          let cssText = rule.cssText;
          cssText = cssText.replace(/url\(['"]?([^'"()]+)['"]?\)/g, (match, p1) => {
            if (!p1.startsWith('http') && !p1.startsWith('data:')) {
              try {
                return `url("${new URL(p1, baseUrl).href}")`;
              } catch (e) {
                return match;
              }
            }
            return match;
          });
          allCss += cssText + "\n";
        }
      } catch (e) {
        // Fallback for cross-origin sheets (though most in Next.js are local)
        console.warn("Could not read stylesheet rules", e);
      }
    }
  } catch (e) {
    console.error("Inlining CSS failed", e);
  }

  const styleTag = doc.ownerDocument?.createElement("style") || document.createElement("style");
  styleTag.textContent = allCss;
  doc.querySelector("head")?.appendChild(styleTag);

  // Ensure all relative links are converted to absolute URLs based on current location
  // This helps Puppeteer resolve fonts/images even when set via setContent

  doc.querySelectorAll('link[href], img[src], script[src]').forEach(el => {
    const attr = el.tagName === 'LINK' ? 'href' : 'src';
    const val = el.getAttribute(attr);
    if (val && !val.startsWith('http') && !val.startsWith('data:')) {
      try {
        el.setAttribute(attr, new URL(val, baseUrl).href);
      } catch (e) {}
    }
  });

  return `<!DOCTYPE html><html ${Array.from(doc.attributes).map(a => `${a.name}="${a.value}"`).join(' ')}>${doc.innerHTML}</html>`;
}
