// Light or dark, stored so it survives a reload and defaulting to whatever the
// machine already prefers. Bootstrap reads data-bs-theme, so setting that one
// attribute switches every component along with our own tokens.

const KEY = 'todo-theme';

const systemPrefers = () =>
  window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';

const getTheme = () => localStorage.getItem(KEY) || systemPrefers();

// Applied before React renders, otherwise the light theme paints first and
// flashes on a dark machine
const applyTheme = mode =>
  document.documentElement.setAttribute('data-bs-theme', mode);

const setTheme = mode => {
  localStorage.setItem(KEY, mode);

  // Everything with a transition would animate between two whole palettes and
  // read as a flash, so transitions are switched off for the swap itself
  document.documentElement.classList.add('theme-switching');
  applyTheme(mode);
  window.setTimeout(
    () => document.documentElement.classList.remove('theme-switching'),
    120,
  );
};

export { getTheme, setTheme, applyTheme };
