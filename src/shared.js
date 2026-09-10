'use strict';

browser = browser || chrome;

// Track changes to settings

async function loadSettings() {
  return browser.storage.local.get({
    modeW: 'yt-em',
    modeS: 'same',
    customUrl: '',
  });
}

function autoUpdateSettings(conf, callback) {
  browser.storage.onChanged.addListener((changes, area) => {
    if (area === 'local') {
      if (changes.modeW) conf.modeW = changes.modeW.newValue;
      if (changes.modeS) conf.modeS = changes.modeS.newValue;
      if (changes.customUrl) conf.customUrl = changes.customUrl.newValue;
      if (callback) callback(conf);
    }
  });
}
