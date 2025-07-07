// Popup script for OpenAI Debug Helper

document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('apiKey');
  const saveBtn = document.getElementById('saveBtn');
  const statusDiv = document.getElementById('status');

  // Load saved key on popup open
  chrome.storage.sync.get(['openaiApiKey'], (result) => {
    if (result.openaiApiKey) {
      apiKeyInput.value = result.openaiApiKey;
      showStatus('Your OpenAI API key is already saved.', 'info');
    }
  });

  // Save button click handler
  saveBtn.addEventListener('click', () => {
    const key = apiKeyInput.value.trim();
    if (!key) {
      showStatus('Please enter your OpenAI API key.', 'error');
      return;
    }
    chrome.storage.sync.set({ openaiApiKey: key }, () => {
      if (chrome.runtime.lastError) {
        showStatus('Failed to save API key. Try again.', 'error');
      } else {
        showStatus('Your OpenAI API key has been saved successfully!', 'success');
      }
    });
  });

  function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.setAttribute('role', 'alert');
    statusDiv.style.display = 'block';
    statusDiv.className = 'status ' + type;
    if (type === 'success') {
      setTimeout(() => {
        statusDiv.textContent = '';
        statusDiv.style.display = 'none';
      }, 3000);
    }
  }
});
