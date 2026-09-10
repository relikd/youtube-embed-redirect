'use strict';

browser = browser || chrome;

let conf = {};
loadSettings().then((c) => {
  conf = c;
  autoUpdateSettings(conf);
});

// main code / match url and redirect to new url

function process(sourceUrl) {
  let videoId, mode;
  const url = new URL(sourceUrl);
  // dont redirect twice if initiated by this plugin (or manually)
  if (url.hash === '#stay') {
    return null;
  }
  // extract video id and mode
  if (url.pathname === '/watch') {
    videoId = url.searchParams.get('v');
    mode = conf.modeW;
  } else if (url.pathname.startsWith('/shorts/')) {
    videoId = url.pathname.split('/')[2];
    mode = conf.modeS;
    if (mode === 'same') {
      mode = conf.modeW;
    }
  } else {
    return null;
  }
  if (!videoId || mode === 'off') {
    return null;
  }

  const start = url.searchParams.get('t');
  const playlist = url.searchParams.get('list');
  const rv = generateURL(mode, videoId, playlist, start);
  return rv;
}

function generateURL(mode, videoid, playlist, start) {
  if (mode === 'ytnc-em' || mode === 'yt-em') {
    const domain = (mode === 'ytnc-em') ? 'youtube-nocookie' : 'youtube';
    const rv = new URL('https://www.' + domain + '.com/embed/' + encodeURIComponent(videoid));
    if (start) rv.searchParams.set('start', start);
    if (playlist) rv.searchParams.set('list', playlist);
    return rv.toString();
  }
  if (mode === 'yt-w') {
    const rv = new URL('https://www.youtube.com/watch');
    rv.searchParams.set('v', videoid);
    rv.hash = '#stay';
    if (start) rv.searchParams.set('t', start);
    if (playlist) rv.searchParams.set('list', playlist);
    return rv.toString();
  }
  if (mode === 'custom' && conf.customUrl) {
    return conf.customUrl
    .replace('{vid}', encodeURIComponent(videoid))
    .replace('{t}', encodeURIComponent(start || ''))
    .replace('{list}', encodeURIComponent(playlist || ''));
  }
  return null;
}


// register url redirect listeners

browser.webRequest.onBeforeRequest.addListener((details) => {
  const url = process(details.url);
  return url ? { redirectUrl: url } : {};
},
{
  urls: [
    'https://www.youtube.com/*'
  ],
  types: ['main_frame'],
},
['blocking']
);

browser.webNavigation.onHistoryStateUpdated.addListener((details) => {
  if (details.frameId !== 0) {
    return;
  }
  const url = process(details.url);
  if (url) {
    browser.tabs.update(details.tabId, { url: url });
  }
},
{
  url: [{ hostSuffix: 'youtube.com' }]
}
);


// Inject Referer or else YouTube returns error 152/153 (Sec-Fetch-Site: none).

browser.webRequest.onBeforeSendHeaders.addListener((details) => {
  if (conf.mode === 'off') return {};
  const headers = (details.requestHeaders || []).filter(
    (h) => h.name.toLowerCase() !== 'referer'
    );
  headers.push({ name: 'Referer', value: 'https://example.com' });
  return { requestHeaders: headers };
},
{
  urls: [
    'https://www.youtube-nocookie.com/embed/*',
    'https://www.youtube.com/embed/*',
  ],
  types: ['main_frame'],
},
['blocking', 'requestHeaders']
);
