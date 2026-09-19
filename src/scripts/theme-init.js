// Applies the colour theme before the page first paints. Loaded synchronously in <head>
// (see src/layouts/Base.astro) so there is no flash of the wrong theme, and kept as an
// external file so the CSP in public/_headers can stay `script-src 'self'`.
//
//   1. A choice saved by the header toggle ("light" / "dark" in localStorage) wins.
//   2. Otherwise follow the OS setting (prefers-color-scheme).
//
// The toggle itself lives in src/components/Header.astro; the palettes in src/styles/global.css.
(function () {
  var theme = null;
  try {
    theme = localStorage.getItem('theme');
  } catch (e) {
    /* storage blocked (private mode etc.): fall through to the OS preference */
  }
  if (theme !== 'light' && theme !== 'dark') {
    theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.documentElement.setAttribute('data-theme', theme);
})();
