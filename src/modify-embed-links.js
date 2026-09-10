'use strict';

// add fragment link to all watch-URLs
for (const link of document.querySelectorAll('a[href]')) {
  try {
    const url = new URL(link.href);
    if (url.pathname === '/watch') {
      url.hash = '#stay';
      link.href = url.href;
    }
  } catch {
    // Ignore malformed URLs
  }
}

// prohibit on-click events which will modify the final URL
// this prevents youtube.com/embed from adding tracking params to the URL
document.addEventListener('click', (event) => {
  if (event.target.closest('a')) {
    event.stopImmediatePropagation();
  }
}, true);
