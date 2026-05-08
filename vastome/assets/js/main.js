/**
 * Vastome — Main Entry Point
 * Initializes all interactive UI modules.
 */

(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Utilities ── */

  function $(sel, ctx)  { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

  function easeOutQuad(t) { return t * (2 - t); }

  /* ════════════════════════════════════════
     NUMBER COUNTER ANIMATION
     ════════════════════════════════════════ */

  function animateCounter(el) {
    var target   = parseFloat(el.dataset.target);
    var suffix   = el.dataset.suffix || '';
    var prefix   = el.dataset.prefix || '';
    var decimals = (el.dataset.decimals | 0) || 0;
    var duration = reducedMotion ? 0 : 1600;
    var start    = null;

    function step(ts) {
      if (!start) start = ts;
      var progress  = Math.min((ts - start) / duration, 1);
      var eased     = easeOutQuad(progress);
      var current   = target * eased;
      el.textContent = prefix + current.toFixed(decimals) + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = prefix + target.toFixed(decimals) + suffix;
      }
    }

    if (reducedMotion) {
      el.textContent = prefix + target.toFixed(decimals) + suffix;
    } else {
      requestAnimationFrame(step);
    }
  }

  function initCounters() {
    var targets = $$('.stat-number[data-target]');
    if (!targets.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.5 });

    targets.forEach(function (el) { observer.observe(el); });
  }

  /* ════════════════════════════════════════
     ACCORDION
     ════════════════════════════════════════ */

  function initAccordions() {
    $$('.accordion').forEach(function (accordion) {
      accordion.addEventListener('click', function (e) {
        var trigger = e.target.closest('.accordion-trigger');
        if (!trigger) return;

        var item    = trigger.closest('.accordion-item');
        var content = item && item.querySelector('.accordion-content');
        if (!item || !content) return;

        var isOpen = item.classList.contains('is-open');

        // Optionally close siblings (single-open behaviour)
        if (accordion.dataset.exclusive !== 'false') {
          $$('.accordion-item.is-open', accordion).forEach(function (openItem) {
            if (openItem !== item) {
              openItem.classList.remove('is-open');
              openItem.querySelector('.accordion-trigger').setAttribute('aria-expanded', 'false');
              var c = openItem.querySelector('.accordion-content');
              if (c) c.style.maxHeight = null;
            }
          });
        }

        if (isOpen) {
          item.classList.remove('is-open');
          trigger.setAttribute('aria-expanded', 'false');
          content.style.maxHeight = null;
        } else {
          item.classList.add('is-open');
          trigger.setAttribute('aria-expanded', 'true');
          // Use scrollHeight for smooth height transition
          content.style.maxHeight = content.scrollHeight + 'px';
        }
      });

      // Set initial ARIA
      $$('.accordion-trigger', accordion).forEach(function (t) {
        if (!t.hasAttribute('aria-expanded')) {
          t.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  /* ════════════════════════════════════════
     TABS
     ════════════════════════════════════════ */

  function initTabs() {
    $$('.tabs').forEach(function (tabs) {
      var buttons = $$('.tab-button', tabs);
      var panels  = $$('.tabs-panel', tabs);

      function activate(btn) {
        var tabId = btn.dataset.tab;

        buttons.forEach(function (b) {
          var active = b === btn;
          b.classList.toggle('is-active', active);
          b.setAttribute('aria-selected', active ? 'true' : 'false');
          b.setAttribute('tabindex', active ? '0' : '-1');
        });

        panels.forEach(function (p) {
          var active = p.dataset.tab === tabId;
          p.classList.toggle('is-active', active);
          p.setAttribute('aria-hidden', active ? 'false' : 'true');
        });
      }

      buttons.forEach(function (btn) {
        btn.setAttribute('role', 'tab');
        btn.setAttribute('tabindex', btn.classList.contains('is-active') ? '0' : '-1');

        btn.addEventListener('click', function () { activate(btn); });

        // Arrow key navigation
        btn.addEventListener('keydown', function (e) {
          var idx  = buttons.indexOf(btn);
          var next = null;

          if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            next = buttons[(idx + 1) % buttons.length];
          } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            next = buttons[(idx - 1 + buttons.length) % buttons.length];
          } else if (e.key === 'Home') {
            next = buttons[0];
          } else if (e.key === 'End') {
            next = buttons[buttons.length - 1];
          }

          if (next) {
            e.preventDefault();
            activate(next);
            next.focus();
          }
        });
      });
    });
  }

  /* ════════════════════════════════════════
     MODAL
     ════════════════════════════════════════ */

  var FOCUSABLE_SELECTOR = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(',');

  function trapModalFocus(modal, e) {
    var focusable = $$(FOCUSABLE_SELECTOR, modal).filter(function (el) {
      return el.offsetParent !== null;
    });
    if (!focusable.length) return;
    var first = focusable[0];
    var last  = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function openModal(overlay) {
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    var firstFocus = $(FOCUSABLE_SELECTOR, overlay);
    if (firstFocus) requestAnimationFrame(function () { firstFocus.focus(); });

    function onKeydown(e) {
      if (e.key === 'Escape') { closeModal(overlay); }
      if (e.key === 'Tab')    { trapModalFocus(overlay, e); }
    }

    overlay._keydownHandler = onKeydown;
    document.addEventListener('keydown', onKeydown);
  }

  function closeModal(overlay) {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    if (overlay._keydownHandler) {
      document.removeEventListener('keydown', overlay._keydownHandler);
      overlay._keydownHandler = null;
    }

    if (overlay._triggerEl) {
      overlay._triggerEl.focus();
      overlay._triggerEl = null;
    }
  }

  function initModals() {
    // Open via data-modal trigger
    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('[data-modal]');
      if (trigger) {
        var id      = trigger.dataset.modal;
        var overlay = document.getElementById('modal-' + id);
        if (overlay) {
          overlay._triggerEl = trigger;
          openModal(overlay);
        }
        return;
      }

      // Close via .modal-close button or backdrop click
      var closeBtn = e.target.closest('.modal-close');
      if (closeBtn) {
        var overlay = closeBtn.closest('.modal-overlay');
        if (overlay) closeModal(overlay);
        return;
      }

      // Click on overlay backdrop (outside .modal)
      if (e.target.classList.contains('modal-overlay')) {
        closeModal(e.target);
      }
    });
  }

  /* ════════════════════════════════════════
     CAROUSEL
     ════════════════════════════════════════ */

  function initCarousels() {
    $$('.carousel').forEach(function (carousel) {
      var track     = $('.carousel-track', carousel);
      var slides    = $$('.carousel-slide', carousel);
      var prevBtn   = $('.carousel-btn[data-dir="prev"]', carousel);
      var nextBtn   = $('.carousel-btn[data-dir="next"]', carousel);
      var dotsWrap  = $('.carousel-dots', carousel);
      var autoPlay  = carousel.dataset.autoplay !== 'false';
      var interval  = parseInt(carousel.dataset.interval, 10) || 4000;

      if (!track || slides.length < 2) return;

      var current  = 0;
      var total    = slides.length;
      var timer    = null;
      var dots     = [];

      // Build dots
      if (dotsWrap) {
        slides.forEach(function (_, i) {
          var dot = document.createElement('button');
          dot.className   = 'carousel-dot' + (i === 0 ? ' is-active' : '');
          dot.type        = 'button';
          dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
          dot.addEventListener('click', function () { goTo(i); });
          dotsWrap.appendChild(dot);
          dots.push(dot);
        });
      }

      function updateDots() {
        dots.forEach(function (d, i) {
          d.classList.toggle('is-active', i === current);
        });
      }

      function goTo(index) {
        current = (index + total) % total;
        track.style.transform = 'translateX(-' + (current * 100) + '%)';
        updateDots();
      }

      function next() { goTo(current + 1); }
      function prev() { goTo(current - 1); }

      if (nextBtn) nextBtn.addEventListener('click', function () { resetTimer(); next(); });
      if (prevBtn) prevBtn.addEventListener('click', function () { resetTimer(); prev(); });

      // Touch / drag
      var touchStartX = 0;
      track.addEventListener('touchstart', function (e) {
        touchStartX = e.touches[0].clientX;
      }, { passive: true });

      track.addEventListener('touchend', function (e) {
        var diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) {
          resetTimer();
          diff > 0 ? next() : prev();
        }
      });

      function startTimer() {
        if (!autoPlay || reducedMotion) return;
        timer = setInterval(next, interval);
      }

      function resetTimer() {
        clearInterval(timer);
        startTimer();
      }

      // Pause on hover
      carousel.addEventListener('mouseenter', function () { clearInterval(timer); });
      carousel.addEventListener('mouseleave', startTimer);
      carousel.addEventListener('focusin',    function () { clearInterval(timer); });
      carousel.addEventListener('focusout',   startTimer);

      startTimer();
    });
  }

  /* ════════════════════════════════════════
     FORM VALIDATION
     ════════════════════════════════════════ */

  function validateField(input) {
    var error   = '';
    var value   = input.value.trim();
    var type    = input.type;
    var required = input.required;

    if (required && !value) {
      error = input.dataset.errorRequired || 'This field is required.';
    } else if (type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      error = input.dataset.errorEmail || 'Please enter a valid email address.';
    } else if (type === 'tel' && value && !/^\+?[\d\s\-()]{7,}$/.test(value)) {
      error = input.dataset.errorTel || 'Please enter a valid phone number.';
    } else if (input.minLength > 0 && value && value.length < input.minLength) {
      error = input.dataset.errorMinlength || 'Minimum ' + input.minLength + ' characters required.';
    }

    var group = input.closest('.form-group');
    var errorEl = group && group.querySelector('.form-error');

    if (error) {
      input.classList.add('is-error');
      input.classList.remove('is-success');
      input.setAttribute('aria-invalid', 'true');
      if (errorEl) errorEl.textContent = error;
    } else if (value) {
      input.classList.remove('is-error');
      input.classList.add('is-success');
      input.removeAttribute('aria-invalid');
      if (errorEl) errorEl.textContent = '';
    } else {
      input.classList.remove('is-error', 'is-success');
      input.removeAttribute('aria-invalid');
      if (errorEl) errorEl.textContent = '';
    }

    return !error;
  }

  function initForms() {
    // Real-time validation on blur
    document.addEventListener('blur', function (e) {
      var field = e.target;
      if (field.matches('.form-input, .form-select, .form-textarea')) {
        validateField(field);
      }
    }, true);

    // Submit validation
    document.addEventListener('submit', function (e) {
      var form = e.target;
      if (!form.dataset.validate) return;

      var fields  = $$('.form-input, .form-select, .form-textarea', form);
      var valid   = fields.map(validateField).every(Boolean);

      if (!valid) {
        e.preventDefault();
        var firstError = form.querySelector('.is-error');
        if (firstError) firstError.focus();
      }
    });
  }

  /* ════════════════════════════════════════
     MAGNETIC BUTTON EFFECT
     ════════════════════════════════════════ */

  function initMagneticButtons() {
    if (reducedMotion) return;

    $$('.btn-accent').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var rect = btn.getBoundingClientRect();
        var cx   = rect.left + rect.width  / 2;
        var cy   = rect.top  + rect.height / 2;
        var dx   = (e.clientX - cx) * 0.15;
        var dy   = (e.clientY - cy) * 0.15;
        // Clamp to ±6px
        dx = Math.max(-6, Math.min(6, dx));
        dy = Math.max(-6, Math.min(6, dy));
        btn.style.transform = 'translate(' + dx + 'px, ' + dy + 'px) translateY(-1px)';
      });

      btn.addEventListener('mouseleave', function () {
        btn.style.transform = '';
      });
    });
  }

  /* ════════════════════════════════════════
     PRICING TOGGLE (monthly / annual)
     ════════════════════════════════════════ */

  function initPricingToggle() {
    var toggle = $('[data-pricing-toggle]');
    if (!toggle) return;

    toggle.addEventListener('change', function () {
      var isAnnual = toggle.checked;

      $$('[data-monthly], [data-annual]').forEach(function (el) {
        if (isAnnual) {
          el.textContent = el.dataset.annual || el.textContent;
        } else {
          el.textContent = el.dataset.monthly || el.textContent;
        }
      });

      $$('.pricing-period').forEach(function (el) {
        el.textContent = isAnnual ? '/ year' : '/ month';
      });
    });
  }

  /* ════════════════════════════════════════
     CASE STUDY FILTER (work.html)
     ════════════════════════════════════════ */

  function initWorkFilter() {
    var filterBar = $('[data-filter-group="work"]');
    if (!filterBar) return;

    filterBar.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-filter]');
      if (!btn) return;

      var filter = btn.dataset.filter;

      $$('[data-filter]', filterBar).forEach(function (b) {
        b.classList.toggle('is-active', b === btn);
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
      });

      $$('[data-category]').forEach(function (card) {
        var show = filter === 'all' || card.dataset.category === filter;
        card.style.display = show ? '' : 'none';
      });
    });
  }

  /* ════════════════════════════════════════
     INDUSTRY FILTER (solutions.html)
     ════════════════════════════════════════ */

  function initIndustryFilter() {
    var filterBar = $('[data-filter-group="industry"]');
    if (!filterBar) return;

    filterBar.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-filter]');
      if (!btn) return;

      var filter = btn.dataset.filter;

      $$('[data-filter]', filterBar).forEach(function (b) {
        b.classList.toggle('is-active', b === btn);
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
      });

      $$('[data-industry]').forEach(function (card) {
        var show = filter === 'all' || card.dataset.industry === filter;
        card.style.display = show ? '' : 'none';
      });
    });
  }

  /* ════════════════════════════════════════
     TOAST NOTIFICATIONS
     ════════════════════════════════════════ */

  var toastContainer = null;

  function getToastContainer() {
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container';
      toastContainer.setAttribute('role', 'region');
      toastContainer.setAttribute('aria-live', 'polite');
      toastContainer.setAttribute('aria-label', 'Notifications');
      document.body.appendChild(toastContainer);
    }
    return toastContainer;
  }

  function showToast(options) {
    var title   = options.title   || '';
    var message = options.message || '';
    var type    = options.type    || 'info';     // success | error | warning | info
    var duration = options.duration !== undefined ? options.duration : 5000;

    var container = getToastContainer();
    var toast = document.createElement('div');
    toast.className = 'toast toast--' + type;
    toast.setAttribute('role', 'alert');

    toast.innerHTML =
      '<div class="toast-content">' +
        (title   ? '<div class="toast-title">'   + title   + '</div>' : '') +
        (message ? '<div class="toast-message">' + message + '</div>' : '') +
      '</div>' +
      '<button class="toast-close" aria-label="Dismiss notification">&#x2715;</button>';

    container.appendChild(toast);

    var closeBtn = toast.querySelector('.toast-close');
    function dismiss() {
      toast.classList.add('is-dismissing');
      toast.addEventListener('animationend', function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      });
    }

    closeBtn.addEventListener('click', dismiss);

    if (duration > 0) {
      setTimeout(dismiss, duration);
    }

    return { dismiss: dismiss };
  }

  // Expose globally so other scripts can call Vastome.toast(...)
  window.Vastome = window.Vastome || {};
  window.Vastome.toast = showToast;

  /* ════════════════════════════════════════
     PAGE TRANSITION FADE
     ════════════════════════════════════════ */

  function initPageTransition() {
    if (reducedMotion) return;

    document.body.classList.add('page-enter');

    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href]');
      if (!link) return;

      var href = link.getAttribute('href');
      // Only intercept same-origin, non-hash, non-external links
      if (
        !href ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        link.target === '_blank' ||
        link.hasAttribute('download')
      ) return;

      try {
        var url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return;

        e.preventDefault();
        document.body.classList.add('page-exit');
        document.body.classList.remove('page-enter');

        setTimeout(function () {
          window.location.href = href;
        }, 150);
      } catch (_) { /* ignore */ }
    });
  }

  /* ════════════════════════════════════════
     PROCESS TIMELINE CONNECTOR FILL
     ════════════════════════════════════════ */

  function initTimelineFill() {
    var steps = $$('.process-step');
    if (!steps.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var step = entry.target;
        step.classList.add('is-done');
        var fill = step.querySelector('.process-connector-fill');
        if (fill) fill.style.width = '100%';
        observer.unobserve(step);
      });
    }, { threshold: 0.5 });

    steps.forEach(function (step) { observer.observe(step); });
  }

  /* ════════════════════════════════════════
     INIT ALL
     ════════════════════════════════════════ */

  function init() {
    initCounters();
    initAccordions();
    initTabs();
    initModals();
    initCarousels();
    initForms();
    initMagneticButtons();
    initPricingToggle();
    initWorkFilter();
    initIndustryFilter();
    initPageTransition();
    initTimelineFill();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
