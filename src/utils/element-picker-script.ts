/**
 * Element picker script injected into sandbox iframes.
 * Allows users to hover over and click elements to select them for visual editing.
 * Communicates with the parent window via postMessage.
 */
export const ELEMENT_PICKER_SCRIPT = `
(function() {
  var isActive = false;
  var currentHighlight = null;
  var currentLabel = null;
  var selectedOverlay = null;
  var selectedLabel = null;

  window.addEventListener('message', function(event) {
    if (!event.data || !event.data.type) return;
    if (event.data.type === 'pixie-enable-picker') {
      enablePicker();
    } else if (event.data.type === 'pixie-disable-picker') {
      disablePicker();
    }
  });

  function enablePicker() {
    isActive = true;
    document.body.style.cursor = 'crosshair';
    document.addEventListener('mouseover', handleMouseOver, true);
    document.addEventListener('mouseout', handleMouseOut, true);
    document.addEventListener('click', handleClick, true);
    window.parent.postMessage({ type: 'pixie-picker-enabled' }, '*');
  }

  function disablePicker() {
    isActive = false;
    document.body.style.cursor = '';
    document.removeEventListener('mouseover', handleMouseOver, true);
    document.removeEventListener('mouseout', handleMouseOut, true);
    document.removeEventListener('click', handleClick, true);
    removeHighlight();
    removeSelected();
    window.parent.postMessage({ type: 'pixie-picker-disabled' }, '*');
  }

  function handleMouseOver(e) {
    if (!isActive) return;
    e.stopPropagation();
    highlightElement(e.target);
  }

  function handleMouseOut(e) {
    if (!isActive) return;
    e.stopPropagation();
    removeHighlight();
  }

  function handleClick(e) {
    if (!isActive) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    var el = e.target;
    removeHighlight();
    showSelected(el);

    var rect = el.getBoundingClientRect();
    var elementInfo = {
      tagName: el.tagName.toLowerCase(),
      textContent: (el.textContent || '').substring(0, 120).trim(),
      className: typeof el.className === 'string' ? el.className : '',
      id: el.id || '',
      selector: getSelector(el),
      outerHTML: el.outerHTML.substring(0, 300),
      rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
    };

    window.parent.postMessage({
      type: 'pixie-element-selected',
      data: elementInfo
    }, '*');
  }

  function highlightElement(el) {
    removeHighlight();
    if (!el || el === document.body || el === document.documentElement) return;
    if (el.id && el.id.startsWith('__pixie')) return;

    var rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return;

    currentHighlight = document.createElement('div');
    currentHighlight.id = '__pixie-highlight';
    currentHighlight.style.cssText =
      'position:fixed;top:' + rect.top + 'px;left:' + rect.left + 'px;width:' + rect.width +
      'px;height:' + rect.height + 'px;border:2px dashed #3b82f6;background:rgba(59,130,246,0.08);' +
      'pointer-events:none;z-index:99998;transition:all 0.05s ease;box-sizing:border-box;';
    document.body.appendChild(currentHighlight);

    currentLabel = document.createElement('div');
    currentLabel.id = '__pixie-label';
    currentLabel.textContent = el.tagName.toLowerCase();
    var labelTop = Math.max(0, rect.top - 26);
    currentLabel.style.cssText =
      'position:fixed;top:' + labelTop + 'px;left:' + rect.left + 'px;background:#3b82f6;' +
      'color:#fff;padding:2px 8px;font-size:11px;font-family:ui-monospace,monospace;' +
      'border-radius:4px;pointer-events:none;z-index:99999;font-weight:600;line-height:18px;';
    document.body.appendChild(currentLabel);
  }

  function removeHighlight() {
    if (currentHighlight) { currentHighlight.remove(); currentHighlight = null; }
    if (currentLabel) { currentLabel.remove(); currentLabel = null; }
  }

  function showSelected(el) {
    removeSelected();
    if (!el || el === document.body || el === document.documentElement) return;

    var rect = el.getBoundingClientRect();
    selectedOverlay = document.createElement('div');
    selectedOverlay.id = '__pixie-selected';
    selectedOverlay.style.cssText =
      'position:fixed;top:' + rect.top + 'px;left:' + rect.left + 'px;width:' + rect.width +
      'px;height:' + rect.height + 'px;border:2px solid #22c55e;background:rgba(34,197,94,0.08);' +
      'pointer-events:none;z-index:99997;box-sizing:border-box;border-radius:4px;';
    document.body.appendChild(selectedOverlay);

    selectedLabel = document.createElement('div');
    selectedLabel.id = '__pixie-selected-label';
    selectedLabel.textContent = el.tagName.toLowerCase();
    var labelTop = Math.max(0, rect.top - 26);
    selectedLabel.style.cssText =
      'position:fixed;top:' + labelTop + 'px;left:' + rect.left + 'px;background:#22c55e;' +
      'color:#fff;padding:2px 8px;font-size:11px;font-family:ui-monospace,monospace;' +
      'border-radius:4px;pointer-events:none;z-index:99999;font-weight:600;line-height:18px;';
    document.body.appendChild(selectedLabel);
  }

  function removeSelected() {
    if (selectedOverlay) { selectedOverlay.remove(); selectedOverlay = null; }
    if (selectedLabel) { selectedLabel.remove(); selectedLabel = null; }
  }

  function getSelector(el) {
    if (el.id) return '#' + el.id;
    var path = [];
    var current = el;
    while (current && current !== document.body && current !== document.documentElement) {
      var tag = current.tagName.toLowerCase();
      if (current.id) {
        path.unshift('#' + current.id);
        break;
      }
      var classes = typeof current.className === 'string'
        ? current.className.trim().split(/\\s+/).filter(function(c) { return c && !c.startsWith('__pixie'); }).slice(0, 2)
        : [];
      if (classes.length > 0) tag += '.' + classes.join('.');
      path.unshift(tag);
      current = current.parentElement;
    }
    return path.join(' > ');
  }

  window.parent.postMessage({ type: 'pixie-picker-ready' }, '*');
})();
`;
