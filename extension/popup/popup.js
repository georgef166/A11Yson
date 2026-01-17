document.addEventListener('DOMContentLoaded', () => {
    const imageToggle = document.getElementById('imageToggle');
    const ttsToggle = document.getElementById('ttsToggle');
    const themeToggle = document.getElementById('themeToggle');
    const statusMsg = document.getElementById('statusMsg');

    // Load saved settings
    chrome.storage.local.get(['a11yson_settings'], (result) => {
        if (result.a11yson_settings) {
            imageToggle.checked = result.a11yson_settings.images === 'blocked';
            // ttsToggle.checked = ...
        }
    });

    // Save settings on change
    imageToggle.addEventListener('change', () => {
        const val = imageToggle.checked ? 'blocked' : 'allowed';
        updateSetting('images', val);
        
        // Notify content script
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: "toggle_images",
                    value: imageToggle.checked
                });
            }
        });
    });

    function updateSetting(key, value) {
        chrome.storage.local.get(['a11yson_settings'], (result) => {
            const settings = result.a11yson_settings || {};
            settings[key] = value;
            chrome.storage.local.set({a11yson_settings: settings}, () => {
                statusMsg.textContent = "Settings saved!";
                setTimeout(() => statusMsg.textContent = "", 2000);
            });
        });
    }
});
