'use strict';

browser = browser || chrome;

const unredirect = document.getElementById('unredirect');
const modeW = document.getElementById('modeW');
const modeS = document.getElementById('modeS');
const customUrl = document.getElementById('customUrl');
const openOptions = document.getElementById('openOptions');
const status = document.getElementById('status');
const isPopup = window.location.search === '?v=popup';

// on-click handling

openOptions.addEventListener('click', () => {
  browser.runtime.openOptionsPage();
});


// DOM manipulation

document.querySelectorAll('.no-pop').forEach((el) => {
  el.hidden = isPopup;
});
document.querySelectorAll('.pop-only').forEach((el) => {
  el.hidden = !isPopup;
});


// settings updated by user

async function saveSettings() {
  await browser.storage.local.set({
   modeW: modeW.value,
   modeS: modeS.value,
   customUrl: customUrl.value,
 });

  // visual feedback
  status.textContent = 'Saved.';
  setTimeout(() => {
   status.textContent = '';
 }, 1000);
}

[modeW, modeS, customUrl].forEach((el) => {
  if (el) el.addEventListener('change', saveSettings);
});


// settings updated in the background (or initial call)

function settingsUpdated(conf) {
  modeW.value = conf.modeW;
  modeS.value = conf.modeS;
  customUrl.value = conf.customUrl;
}

loadSettings().then((conf) => {
  settingsUpdated(conf);
  autoUpdateSettings(conf, settingsUpdated);
});