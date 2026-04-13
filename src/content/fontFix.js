// Fix CORS-blocked DroidKufi Arabic fonts on StudentInfo.aspx
// Injects local @font-face rules that override the Google Fonts CDN references.

(function () {
    const regularUrl = chrome.runtime.getURL('src/fonts/DroidKufi-Regular.ttf');
    const boldUrl    = chrome.runtime.getURL('src/fonts/DroidKufi-Bold.ttf');

    const style = document.createElement('style');
    style.textContent = `
        @font-face {
            font-family: 'Droid Arabic Kufi';
            font-style: normal;
            font-weight: 400;
            src: url('${regularUrl}') format('truetype');
        }
        @font-face {
            font-family: 'Droid Arabic Kufi';
            font-style: normal;
            font-weight: 700;
            src: url('${boldUrl}') format('truetype');
        }
    `;

    // Inject into <head> as early as possible so it takes priority
    (document.head || document.documentElement).appendChild(style);
})();
