(() => {
  const root = document.documentElement;
  const toggle = document.querySelector('[data-theme-toggle]');
  const savedTheme = localStorage.getItem('vj-theme');
  const preferredLight = window.matchMedia('(prefers-color-scheme: light)').matches;

  const applyTheme = (theme) => {
    root.dataset.theme = theme;
    if (toggle) {
      toggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
      toggle.setAttribute('aria-pressed', theme === 'light');
      toggle.querySelector('span').textContent = theme === 'dark' ? '☀' : '☾';
    }
  };

  applyTheme(savedTheme || (preferredLight ? 'light' : 'dark'));
  toggle?.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('vj-theme', next);
  });

  const menuButton = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-nav]');
  const closeMenu = () => {
    nav?.classList.remove('is-open');
    menuButton?.setAttribute('aria-expanded', 'false');
  };
  menuButton?.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
  });
  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));

  const header = document.querySelector('.site-header');
  const topButton = document.querySelector('[data-back-top]');
  const onScroll = () => {
    header?.classList.toggle('is-scrolled', scrollY > 20);
    topButton?.classList.toggle('is-visible', scrollY > 600);
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  topButton?.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: .12 });
  document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

  const sectionLinks = [...document.querySelectorAll('.nav-link[href^="#"]')];
  const sections = sectionLinks.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  if (sections.length) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        sectionLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
      });
    }, { rootMargin: '-35% 0px -55%', threshold: 0 });
    sections.forEach(section => sectionObserver.observe(section));
  }

  const filterButtons = document.querySelectorAll('[data-filter]');
  const projectCards = document.querySelectorAll('[data-category]');
  filterButtons.forEach(button => button.addEventListener('click', () => {
    filterButtons.forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    const filter = button.dataset.filter;
    projectCards.forEach(card => {
      const visible = filter === 'all' || card.dataset.category.includes(filter);
      card.hidden = !visible;
    });
  }));

  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

  const contactForm = document.querySelector('[data-contact-form]');
  contactForm?.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(contactForm);
    const subject = encodeURIComponent(data.get('subject') || 'Portfolio inquiry');
    const body = encodeURIComponent(`Name: ${data.get('name')}\nEmail: ${data.get('email')}\n\n${data.get('message')}`);
    window.location.href = `mailto:your.email@example.com?subject=${subject}&body=${body}`;
  });
})();
