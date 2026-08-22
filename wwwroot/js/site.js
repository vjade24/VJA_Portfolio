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
    window.location.href = `mailto:hello@vja.dev?subject=${subject}&body=${body}`;
  });

  const projectDataElement = document.querySelector('#project-data');
  const dialog = document.querySelector('[data-project-dialog]');
  if (projectDataElement && dialog) {
    const projects = JSON.parse(projectDataElement.textContent);
    const setText = (selector, value) => { const element = dialog.querySelector(selector); if (element) element.textContent = value; };
    document.querySelectorAll('[data-project]').forEach(button => button.addEventListener('click', () => {
      const project = projects.find(item => item.id === button.dataset.project);
      if (!project) return;
      setText('[data-dialog-category]', project.category);
      setText('[data-dialog-title]', project.title);
      setText('[data-dialog-description]', project.description);
      setText('[data-dialog-problem]', project.problem);
      setText('[data-dialog-solution]', project.solution);
      const features = dialog.querySelector('[data-dialog-features]');
      const technologies = dialog.querySelector('[data-dialog-tech]');
      features.replaceChildren(...project.features.split('|').map(value => Object.assign(document.createElement('li'), { textContent: value })));
      technologies.replaceChildren(...project.tech.split('|').map(value => Object.assign(document.createElement('span'), { className: 'badge', textContent: value })));
      dialog.showModal(); document.body.classList.add('dialog-open');
    }));
    const closeDialog = () => { dialog.close(); document.body.classList.remove('dialog-open'); };
    dialog.querySelector('[data-dialog-close]')?.addEventListener('click', closeDialog);
    dialog.addEventListener('click', event => { if (event.target === dialog) closeDialog(); });
  }

  const resumeLink = document.querySelector('[data-resume]');
  if (resumeLink) fetch(resumeLink.href, { method: 'HEAD' }).then(response => {
    if (!response.ok) throw new Error();
  }).catch(() => {
    resumeLink.removeAttribute('download');
    resumeLink.href = 'mailto:hello@vja.dev?subject=Resume request';
    resumeLink.title = 'Resume file is not yet available; request it by email';
  });
})();
