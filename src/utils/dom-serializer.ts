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

  // 1.5. Inlining images to ensure visual parity in headless browsers.
  // We convert visible images to data URLs to ensure they render in remote environments.
  const originalImages = root.querySelectorAll('img');
  const clonedImages = clone.querySelectorAll('img');
  originalImages.forEach((img, index) => {
    try {
      const clonedImg = clonedImages[index] as HTMLImageElement;
      if (!clonedImg) return;

      // Only attempt to inline images that are already loaded
      if (img instanceof HTMLImageElement && img.complete && img.naturalWidth > 0) {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          clonedImg.src = canvas.toDataURL();
          // Remove srcset to force the data URL
          clonedImg.removeAttribute('srcset');
        }
      }
    } catch (e) {
      // CORS might block this, which is fine, we fallback to the original src
      console.warn('Could not inline image', e);
    }
  });

  // 1.6. Inlining background images from inline styles
  const allElements = root.querySelectorAll('*');
  const allCloned = clone.querySelectorAll('*');
  allElements.forEach((el, index) => {
    const style = (el as HTMLElement).style;
    if (style && style.backgroundImage && style.backgroundImage.includes('url(')) {
      const clonedEl = allCloned[index] as HTMLElement;
      if (clonedEl) {
        // Simple regex to extract URL
        const match = style.backgroundImage.match(/url\(["']?([^"']+)["']?\)/);
        if (match && match[1] && !match[1].startsWith('data:')) {
          // In a real scenario, we'd fetch and convert to data URL here.
          // For now, ensure it's at least absolute if we can't inline.
          const origin = window.location.origin;
          if (match[1].startsWith('/')) {
            clonedEl.style.backgroundImage = `url("${origin}${match[1]}")`;
          }
        }
      }
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

export async function getFullPageHTML(themeOverride?: "light" | "dark"): Promise<string> {
  // Ensure fonts and images are loaded before serialization
  try {
    await document.fonts.ready;
    const images = Array.from(document.images);
    await Promise.all(images.map(img => img.complete ? Promise.resolve() : new Promise(r => {
      img.onload = r;
      img.onerror = r;
    })));
  } catch (e) {
    console.warn('Wait for assets failed:', e);
  }

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
  if (body && document.body) {
    // Preserve body attributes (classes, etc.) which are often used by Tailwind/Next.js
    Array.from(document.body.attributes).forEach(attr => {
      body.setAttribute(attr.name, attr.value);
    });
    // Correctly replace inner content
    body.innerHTML = serializeDOM(document.body);
  }

  // 1. Capture and resolve all readable CSS rules to ensure visually perfect rendering
  // in headless browsers that may not have access to local assets.
  let inlineStyles = '';
  try {
    const origin = window.location.origin;
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        if (!sheet.cssRules) continue;
        // Limit total inline size to stay within Vercel limits
        if (inlineStyles.length > 1500000) break;

        for (const rule of Array.from(sheet.cssRules)) {
          let cssText = rule.cssText;
          // Resolve relative URLs in CSS (fonts, background-images) to absolute
          cssText = cssText.replace(/url\(['"]?(\/[^'"]+)['"]?\)/g, (match, path) => {
            if (path.startsWith('/') && !path.startsWith('//')) {
              return `url("${origin}${path}")`;
            }
            return match;
          });
          inlineStyles += cssText + '\n';
        }
      } catch (e) {
        console.warn('Could not read cssRules from stylesheet', sheet.href, e);
      }
    }
  } catch (e) {
    console.error('Error reading stylesheets', e);
  }


  const head = doc.querySelector('head');
  if (head) {
    // Inject the inlined and resolved styles
    const styleTag = document.createElement('style');
    styleTag.textContent = inlineStyles;
    head.appendChild(styleTag);

    // Convert all relative links to absolute to ensure resolution in headless browser
    const origin = window.location.origin;
    doc.querySelectorAll('link[href], script[src], img[src], source[src], source[srcset]').forEach(el => {
      if (el.hasAttribute('href')) {
        const href = el.getAttribute('href')!;
        if (href.startsWith('/') && !href.startsWith('//')) {
          el.setAttribute('href', origin + href);
        }
      }
      if (el.hasAttribute('src')) {
        const src = el.getAttribute('src')!;
        if (src.startsWith('/') && !src.startsWith('//')) {
          el.setAttribute('src', origin + src);
        }
      }
      if (el.hasAttribute('srcset')) {
        const srcset = el.getAttribute('srcset')!;
        const absoluteSrcset = srcset.split(',').map(part => {
          const [url, size] = part.trim().split(/\s+/);
          if (url.startsWith('/') && !url.startsWith('//')) {
            return (origin + url) + (size ? ' ' + size : '');
          }
          return part;
        }).join(', ');
        el.setAttribute('srcset', absoluteSrcset);
      }
    });

    const base = document.createElement('base');
    base.href = origin + '/';
    head.insertBefore(base, head.firstChild);

    doc.setAttribute('data-scroll-x', window.scrollX.toString());
    doc.setAttribute('data-scroll-y', window.scrollY.toString());
  }

  // 5. Cleanup: Remove scripts and other non-visual elements to reduce payload size
  const scripts = doc.querySelectorAll('script, noscript, template, iframe');
  scripts.forEach(s => s.remove());

  // Hide the switcher and overlay
  const itemsToHide = doc.querySelectorAll('[data-html2canvas-ignore]');
  itemsToHide.forEach(el => (el as HTMLElement).style.display = 'none');

  const htmlAttrs = Array.from(doc.attributes).map(a => `${a.name}="${a.value}"`).join(' ');
  return `<!DOCTYPE html><html ${htmlAttrs}>${doc.innerHTML}</html>`;
}
