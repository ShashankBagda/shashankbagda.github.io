/**
 * Vastome Navigation
 * Mobile hamburger, active link detection, scroll shrink, focus trap, smooth scroll.
 */

(function () {
  'use strict';

  /* ── Helpers ── */

  function $(sel, ctx) {
    return (ctx || document).querySelector(sel);
  }

  function $$(sel, ctx) {
    return Array.from((ctx || document).querySelectorAll(sel));
  }

  /* ── Header shrink on scroll ── */

  function initScrollShrink() {
    const header = $('.nav-header');
    if (!header) return;

    let ticking = false;

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          if (window.scrollY > 80) {
            header.classList.add('nav-header--scrolled');
          } else {
            header.classList.remove('nav-header--scrolled');
          }
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    // Run once on load
    onScroll();
  }

  /* ── Active link detection ── */

  function initActiveLinks() {
    const currentPath = window.location.pathname;

    $$('.nav-link, .nav-drawer-link').forEach(function (link) {
      const href = link.getAttribute('href');
      if (!href) return;

      try {
        const linkPath = new URL(href, window.location.href).pathname;

        // Exact match, or the current path starts with the link path (sub-pages)
        // but don't mark '/' as active on every page
        const isActive =
          linkPath === currentPath ||
          (linkPath !== '/' && currentPath.startsWith(linkPath));

        if (isActive) {
          link.classList.add('is-active');
          link.setAttribute('aria-current', 'page');
        }
      } catch (_) {
        // Relative hrefs without full URL context — skip
      }
    });
  }

  /* ── Focus trap helpers ── */

  const FOCUSABLE = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(',');

  function trapFocus(container, e) {
    const focusable = $$(FOCUSABLE, container).filter(function (el) {
      return el.offsetParent !== null; // visible elements only
    });
    if (!focusable.length) return;

    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  /* ── Mobile drawer ── */

  function initDrawer() {
    const toggle  = $('.nav-toggle');
    const drawer  = $('.nav-drawer');
    const panel   = drawer && $('.nav-drawer-panel', drawer);
    const backdrop = drawer && $('.nav-drawer-backdrop', drawer);

    if (!toggle || !drawer) return;

    let previouslyFocused = null;

    function openDrawer() {
      drawer.classList.add('is-open');
      toggle.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      drawer.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      previouslyFocused = document.activeElement;

      // Move focus to first focusable item in panel
      const first = panel && $(FOCUSABLE, panel);
      if (first) {
        requestAnimationFrame(function () { first.focus(); });
      }

      drawer.addEventListener('keydown', handleDrawerKeydown);
    }

    function closeDrawer() {
      drawer.classList.remove('is-open');
      toggle.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      drawer.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';

      drawer.removeEventListener('keydown', handleDrawerKeydown);

      if (previouslyFocused) {
        previouslyFocused.focus();
        previouslyFocused = null;
      }
    }

    function handleDrawerKeydown(e) {
      if (e.key === 'Escape') {
        closeDrawer();
        return;
      }
      if (e.key === 'Tab' && panel) {
        trapFocus(panel, e);
      }
    }

    toggle.addEventListener('click', function () {
      const isOpen = drawer.classList.contains('is-open');
      isOpen ? closeDrawer() : openDrawer();
    });

    // Close on backdrop click
    if (backdrop) {
      backdrop.addEventListener('click', closeDrawer);
    }

    // Close when a drawer link is clicked
    $$('.nav-drawer-link', drawer).forEach(function (link) {
      link.addEventListener('click', closeDrawer);
    });

    // Set initial ARIA state
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', drawer.id || 'nav-drawer');
    drawer.setAttribute('aria-hidden', 'true');
  }

  /* ── Smooth scroll for anchor links ── */

  function initSmoothScroll() {
    document.addEventListener('click', function (e) {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;

      const id = link.getAttribute('href').slice(1);
      if (!id) return;

      const target = document.getElementById(id);
      if (!target) return;

      e.preventDefault();

      // Close mobile drawer if open
      const drawer = $('.nav-drawer');
      if (drawer && drawer.classList.contains('is-open')) {
        drawer.classList.remove('is-open');
        document.body.style.overflow = '';
      }

      const headerH = ($('.nav-header') || { offsetHeight: 0 }).offsetHeight;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH - 16;

      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });

      // Update URL without jumping
      history.pushState(null, '', '#' + id);

      // Move focus to target for accessibility
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  }

  /* ── Init ── */

  function init() {
    initScrollShrink();
    initActiveLinks();
    initDrawer();
    initSmoothScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
