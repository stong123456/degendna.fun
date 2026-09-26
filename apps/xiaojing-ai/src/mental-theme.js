export const THEMES = [['garden', '暖光疗愈'], ['prism', '晶体实验室'], ['night', '夜航诊所']];
export function readMentalTheme() {
  let saved; try { saved = localStorage.getItem('degendna-mental-lab-theme'); } catch {}
  const requested = new URLSearchParams(location.search).get('theme') || saved;
  return THEMES.some(([id]) => id === requested) ? requested : 'garden';
}
export function applyMentalTheme(theme) {
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem('degendna-mental-lab-theme', theme); } catch {}
  const url = new URL(location.href); url.searchParams.set('theme', theme); history.replaceState(null, '', url);
}
export function mentalLink(page = '', theme = readMentalTheme()) {
  return `/?theme=${theme}${page ? `&page=${page}` : ''}`;
}
