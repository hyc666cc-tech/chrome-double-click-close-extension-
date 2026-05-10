/**
 * Content script to listen for double-click events with optimized filtering.
 */

let isEnabled = true;

// Initial sync with storage
chrome.storage.local.get(['isEnabled'], (result) => {
  if (result.isEnabled !== undefined) {
    isEnabled = result.isEnabled;
  }
});

// Listen for settings change
chrome.storage.onChanged.addListener((changes) => {
  if (changes.isEnabled) {
    isEnabled = changes.isEnabled.newValue;
  }
});

document.addEventListener('dblclick', (event) => {
  if (!isEnabled) return;

  const path = event.composedPath ? event.composedPath() : [event.target];
  let isBlocked = false;
  
  for (const element of path) {
    if (!element || !element.tagName) continue;
    
    const tag = element.tagName.toUpperCase();
    
    // Shield inputs, editable areas, buttons, and links
    if (['INPUT', 'TEXTAREA', 'SELECT', 'OPTION', 'VIDEO', 'AUDIO', 'IFRAME', 'BUTTON', 'A'].includes(tag) || element.isContentEditable) {
      isBlocked = true;
      break;
    }
  }

  if (!isBlocked) {
    // 延迟 50ms 检查双击是否导致了文本被选中（划词），如果是，则不关闭页面
    setTimeout(() => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        return; // 用户选中了文本（如双击词语），不触发关闭
      }
      try {
        chrome.runtime.sendMessage({ action: 'closeTab' });
      } catch (e) {
        console.warn("Double-Click Close Error. Try refreshing this page:", e);
      }
    }, 50);
  }
}, true); // Use capturing phase to prevent elements from stopping propagation
