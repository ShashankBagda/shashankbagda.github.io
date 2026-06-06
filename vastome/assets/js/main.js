(() => {
  const doc = document.documentElement;
  const body = document.body;
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('navToggle');
  const navOverlay = document.getElementById('navOverlay');
  const themeToggle = document.getElementById('themeToggle');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const getCurrentPage = () => {
    const path = window.location.pathname.split('/').pop();
    return path && path.length ? path : 'index.html';
  };

  const safeStorage = {
    get(key) {
      try {
        return window.localStorage.getItem(key);
      } catch (error) {
        return null;
      }
    },
    set(key, value) {
      try {
        window.localStorage.setItem(key, value);
      } catch (error) {
        // no-op
      }
    }
  };

  const applyTheme = (theme) => {
    doc.setAttribute('data-theme', theme);
    safeStorage.set('vastome-theme', theme);

    if (themeToggle) {
      const darkMode = theme === 'dark';
      themeToggle.setAttribute('aria-pressed', String(darkMode));
      themeToggle.setAttribute('aria-label', darkMode ? 'Switch to light mode' : 'Switch to dark mode');
    }
  };

  const initTheme = () => {
    const savedTheme = safeStorage.get('vastome-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(savedTheme || (prefersDark ? 'dark' : 'light'));

    themeToggle?.addEventListener('click', () => {
      const nextTheme = doc.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
    });
  };

  const setActiveNavigation = () => {
    const currentPage = getCurrentPage();
    const links = document.querySelectorAll('.nav-link, .overlay-link');

    links.forEach((link) => {
      const isActive = link.getAttribute('href') === currentPage;
      link.classList.toggle('is-active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });

    const contactLink = document.querySelector('.nav-cta-link');
    if (contactLink) {
      contactLink.classList.toggle('is-current', currentPage === 'contact.html');
    }
  };

  const handleNavState = () => {
    if (!nav) return;

    const update = () => {
      const shouldBeScrolled = !body.classList.contains('page-home') || window.scrollY > 24;
      nav.classList.toggle('scrolled', shouldBeScrolled);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
  };

  const setNavOpen = (isOpen) => {
    body.classList.toggle('nav-open', isOpen);

    if (navToggle) {
      navToggle.setAttribute('aria-expanded', String(isOpen));
    }

    if (navOverlay) {
      navOverlay.classList.toggle('is-open', isOpen);
      navOverlay.setAttribute('aria-hidden', String(!isOpen));
    }
  };

  const initMobileNav = () => {
    if (!navToggle || !navOverlay) return;

    navToggle.addEventListener('click', () => {
      const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
      setNavOpen(!isOpen);
    });

    navOverlay.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setNavOpen(false));
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        setNavOpen(false);
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 1024) {
        setNavOpen(false);
      }
    });
  };

  const initReveal = () => {
    const revealTargets = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

    if (!revealTargets.length) return;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      revealTargets.forEach((element) => element.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.2,
      rootMargin: '0px 0px -10% 0px'
    });

    revealTargets.forEach((element) => observer.observe(element));
  };

  const initSmoothScroll = () => {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      const targetSelector = anchor.getAttribute('href');
      if (!targetSelector || targetSelector === '#') return;

      const target = document.querySelector(targetSelector);
      if (!target) return;

      anchor.addEventListener('click', (event) => {
        event.preventDefault();
        target.scrollIntoView({
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
          block: 'start'
        });
      });
    });
  };

  const initFaq = () => {
    const questions = document.querySelectorAll('.faq-question');

    questions.forEach((button) => {
      button.addEventListener('click', () => {
        const item = button.closest('.faq-item');
        if (!item) return;

        const isOpen = item.classList.contains('is-open');

        questions.forEach((otherButton) => {
          const otherItem = otherButton.closest('.faq-item');
          if (!otherItem) return;
          otherItem.classList.remove('is-open');
          otherButton.setAttribute('aria-expanded', 'false');
        });

        item.classList.toggle('is-open', !isOpen);
        button.setAttribute('aria-expanded', String(!isOpen));
      });
    });
  };

  const initContactForm = () => {
    const form = document.querySelector('[data-contact-form]');
    if (!form) return;

    const status = form.querySelector('[data-form-status]');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const fields = Array.from(form.querySelectorAll('input, select, textarea'));

    const validators = {
      name: (value) => value.trim() ? '' : 'Please enter your name.',
      company: (value) => value.trim() ? '' : 'Please enter your company.',
      email: (value) => {
        if (!value.trim()) return 'Please enter your email.';
        return emailPattern.test(value.trim()) ? '' : 'Please enter a valid email address.';
      },
      projectType: (value) => value.trim() ? '' : 'Please choose a project type.',
      budget: (value) => value.trim() ? '' : 'Please choose a budget range.',
      message: (value) => value.trim() ? '' : 'Please tell us about your project.'
    };

    const setError = (field, message) => {
      const errorElement = form.querySelector(`[data-error-for="${field.name}"]`);
      field.classList.toggle('is-invalid', Boolean(message));
      if (errorElement) {
        errorElement.textContent = message;
      }
    };

    const validateField = (field) => {
      const validator = validators[field.name];
      const message = validator ? validator(field.value) : '';
      setError(field, message);
      return !message;
    };

    fields.forEach((field) => {
      field.addEventListener('blur', () => validateField(field));
      field.addEventListener('input', () => {
        if (field.classList.contains('is-invalid')) {
          validateField(field);
        }
      });
      field.addEventListener('change', () => validateField(field));
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const isValid = fields.every((field) => validateField(field));

      if (!isValid) {
        status?.classList.remove('is-success');
        if (status) {
          status.textContent = 'Please fix the highlighted fields and try again.';
        }
        return;
      }

      const formData = new FormData(form);
      const bodyCopy = [
        `Name: ${formData.get('name') || ''}`,
        `Company: ${formData.get('company') || ''}`,
        `Email: ${formData.get('email') || ''}`,
        `Phone: ${formData.get('phone') || 'Not provided'}`,
        `Project type: ${formData.get('projectType') || ''}`,
        `Budget: ${formData.get('budget') || ''}`,
        '',
        'Project brief:',
        `${formData.get('message') || ''}`
      ].join('\n');

      const subject = `Vastome enquiry from ${formData.get('company') || formData.get('name') || 'Website visitor'}`;
      const params = new URLSearchParams({ subject, body: bodyCopy }).toString();

      if (status) {
        status.classList.add('is-success');
        status.textContent = 'Opening your email client… If nothing happens, write to hello@vastome.io.';
      }

      window.location.href = `mailto:hello@vastome.io?${params}`;
    });
  };

  document.addEventListener('DOMContentLoaded', () => {
    body.classList.add('page-ready');
    initTheme();
    setActiveNavigation();
    handleNavState();
    initMobileNav();
    initReveal();
    initSmoothScroll();
    initFaq();
    initContactForm();
  });
})();
