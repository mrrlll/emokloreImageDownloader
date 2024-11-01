const downloadIcon = `
<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
</svg>
`;

function sanitizeFileName(name) {
    return name
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/\.+$/, '')
    .trim();
}

function getPageTitle() {
  const titleElement = document.querySelector('title');
  if (titleElement) {
    return sanitizeFileName(titleElement.textContent);
  }

  return 'emoklore_character';
}

function addDownloadButtons() {
  const images = document.getElementsByClassName('v-image__image v-image__image--contain');

  Array.from(images).forEach((element) => {
    if (element.parentElement.querySelector('.image-download-btn')) {
      return;
    }

    if (!element.style.backgroundImage) {
      return;
    }

    const parentStyle = window.getComputedStyle(element.parentElement);
    if (parentStyle.position === 'static') {
      element.parentElement.style.position = 'relative';
    }

    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'image-download-btn';
    downloadBtn.innerHTML = `${downloadIcon}Download`;

    downloadBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      try {
        const backgroundImage = element.style.backgroundImage;
        const url = backgroundImage.match(/url\("(.+)"\)/)[1];
        const pageTitle = getPageTitle();

        chrome.runtime.sendMessage({
          action: "downloadImage",
          url: url,
          filename: pageTitle
        }, (response) => {
          if (response.success) {
            downloadBtn.classList.add('download-success');
            downloadBtn.textContent = 'Downloaded!';
            setTimeout(() => {
              downloadBtn.classList.remove('download-success');
              downloadBtn.innerHTML = `${downloadIcon}Download`;
            }, 2000);
          } else {
            console.error('Download failed:', response.error);
            downloadBtn.textContent = 'Error';
            setTimeout(() => {
              downloadBtn.innerHTML = `${downloadIcon}Download`;
            }, 2000);
          }
        });

      } catch (error) {
        console.error('Error processing download:', error);
        downloadBtn.textContent = 'Error';
        setTimeout(() => {
          downloadBtn.innerHTML = `${downloadIcon}Download`;
        }, 2000);
      }
    });

    element.parentElement.appendChild(downloadBtn);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', addDownloadButtons);
} else {
  addDownloadButtons();
}

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length) {
      addDownloadButtons();
    }
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});