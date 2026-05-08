/**
 * Vastome Theme Manager
 * Handles light/dark mode toggle, localStorage persistence, system preference.
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'Vastome-theme';
  const DARK  = 'dark';
  const LIGHT = 'light';

  function getPreferred() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? DARK : LIGHT;
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);

    // Update all toggle buttons
    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.setAttribute('aria-checked', theme === DARK ? 'true' : 'false');
      btn.setAttribute(
        'aria-label',
        theme === DARK ? 'Switch to light mode' : 'Switch to dark mode'
      );
    });

    // Update theme-color meta tag to reflect the active background
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.content = theme === DARK ? '#0B1120' : '#FFFFFF';
    }
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || LIGHT;
    applyTheme(current === DARK ? LIGHT : DARK);
  }

  // Apply immediately to prevent flash of wrong theme
  applyTheme(getPreferred());

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.addEventListener('click', toggleTheme);

      // Support keyboard: Space / Enter already trigger click on buttons,
      // but also handle role="switch" pattern
      btn.addEventListener('keydown', function (e) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          toggleTheme();
        }
      });
    });

    // Respond to OS-level theme changes only when no explicit user choice stored
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
      if (!localStorage.getItem(STORAGE_KEY)) {
        applyTheme(e.matches ? DARK : LIGHT);
      }
    });
  });
})();
