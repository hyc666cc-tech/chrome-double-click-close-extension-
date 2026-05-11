/**
 * Content script to listen for double-click events with optimized filtering.
 */

let isEnabled = true;
let requiredClicks = 2; // Default 2 clicks

// Initial sync with storage
chrome.storage.local.get(['isEnabled', 'clickCount'], (result) => {
  if (result.isEnabled !== undefined) {
    isEnabled = result.isEnabled;
  }
  if (result.clickCount !== undefined) {
    requiredClicks = result.clickCount;
  }
});

// Listen for settings change
chrome.storage.onChanged.addListener((changes) => {
  if (changes.isEnabled) {
    isEnabled = changes.isEnabled.newValue;
  }
  if (changes.clickCount) {
    requiredClicks = changes.clickCount.newValue;
  }
});

document.addEventListener('click', (event) => {
  if (!isEnabled) return;

  // Use the native event.detail which tracks consecutive clicks perfectly
  if (event.detail === requiredClicks) {
    // Evaluate if valid target
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
      // 延迟 50ms 检查点击导致划词选中时的情况
      setTimeout(() => {
        const selection = window.getSelection();
        if (selection && selection.toString().trim().length > 0) {
          return; // 用户选中了文本，不触发关闭
        }
        try {
          chrome.runtime.sendMessage({ action: 'closeTab' });
        } catch (e) {
          console.warn("Click Close Error. Try refreshing this page:", e);
        }
      }, 50);
    }
  }
}, true); // Use capturing phase to prevent elements from stopping propagation
