/**
 * Popup script to manage extension settings.
 */

const toggle = document.getElementById('toggleEnabled');

// Load current state
chrome.storage.local.get(['isEnabled'], (result) => {
  // Default to true if not set
  toggle.checked = result.isEnabled !== false;
});

// Save state when toggled
toggle.addEventListener('change', () => {
  chrome.storage.local.set({ isEnabled: toggle.checked }, () => {
    console.log('Settings saved:', toggle.checked);
  });
});
