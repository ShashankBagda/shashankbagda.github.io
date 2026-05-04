/**
 * Vastoma Scroll Reveal
 * IntersectionObserver-based reveal for .reveal elements.
 * Adds .is-visible when element enters the viewport.
 */

(function () {
  'use strict';

  // Bail out immediately for users who prefer reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Make all reveal elements visible without animation
    document.addEventListener('DOMContentLoaded', function () {
      document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale')
        .forEach(function (el) {
          el.classList.add('is-visible');
        });
    });
    return;
  }

  function applyStaggerDelays(entry) {
    const el     = entry.target;
    const parent = el.parentElement;
    if (!parent) return;

    // Find all reveal siblings within the same parent
    const siblings = Array.from(
      parent.querySelectorAll(':scope > .reveal, :scope > .reveal-left, :scope > .reveal-right, :scope > .reveal-scale')
    );

    const index = siblings.indexOf(el);
    if (index > 0 && index <= 6) {
      // Add stagger class only if not already present
      const delayClass = 'reveal-delay-' + index;
      if (!el.classList.contains(delayClass)) {
        el.classList.add(delayClass);
      }
    }
  }

  function initReveal() {
    // Collect all reveal elements
    const targets = Array.from(
      document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale')
    );

    if (!targets.length) return;

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;

          applyStaggerDelays(entry);
          entry.target.classList.add('is-visible');

          // Stop observing once revealed — keeps things performant
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    targets.forEach(function (el) {
      observer.observe(el);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReveal);
  } else {
    initReveal();
  }
})();
