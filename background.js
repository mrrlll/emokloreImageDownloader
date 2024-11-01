function getExtensionFromMimeType(mimeType) {
    const mimeToExt = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'image/svg+xml': '.svg'
    };
    return mimeToExt[mimeType] || '.png';
  }

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "downloadImage") {
      fetch(request.url)
        .then(response => {
          const contentType = response.headers.get('content-type');
          const extension = getExtensionFromMimeType(contentType);

          const filename = `${request.filename}${extension}`;

          return chrome.downloads.download({
            url: request.url,
            filename: filename
          });
        })
        .then(downloadId => {
          sendResponse({ success: true, downloadId: downloadId });
        })
        .catch(error => {
          console.error('Download error:', error);
          sendResponse({ success: false, error: error.message });
        });

      return true;
    }
  });