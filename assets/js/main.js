(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- preloader ---------------- */
  const preloader = document.getElementById('preloader');
  document.body.classList.add('is-loading');
  window.addEventListener('load', () => {
    const delay = reducedMotion ? 0 : 1200;
    setTimeout(() => {
      preloader.classList.add('is-done');
      document.body.classList.remove('is-loading');
    }, delay);
  });

  /* ---------------- marquee infinite fill ---------------- */
  const marqueeTrack = document.querySelector('.marquee-track');
  if (marqueeTrack) {
    const buildMarquee = () => {
      const sets = Array.from(marqueeTrack.querySelectorAll('.marquee-set'));
      if (!sets.length) return;
      const original = sets[0];
      sets.slice(1).forEach((el) => el.remove());
      const setWidth = original.getBoundingClientRect().width;
      if (!setWidth) return;
      const fillCount = Math.max(1, Math.ceil(window.innerWidth / setWidth));
      for (let i = 1; i < fillCount; i++) {
        marqueeTrack.appendChild(original.cloneNode(true));
      }
      Array.from(marqueeTrack.querySelectorAll('.marquee-set')).forEach((set) => {
        marqueeTrack.appendChild(set.cloneNode(true));
      });
    };
    buildMarquee();
    let marqueeResizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(marqueeResizeTimer);
      marqueeResizeTimer = setTimeout(buildMarquee, 200);
    });
  }

  /* ---------------- header state on scroll ---------------- */
  const header = document.getElementById('site-header');
  const onScroll = () => {
    const h = document.documentElement;
    const scrolled = h.scrollTop;
    header.classList.toggle('is-scrolled', scrolled > 10);
  };
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------------- mobile nav ---------------- */
  const burger = document.getElementById('burger');
  const navlinks = document.getElementById('navlinks');
  burger.addEventListener('click', () => {
    const open = navlinks.classList.toggle('is-open');
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
  });
  navlinks.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
    navlinks.classList.remove('is-open');
    burger.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
  }));

  /* ---------------- active nav link on scroll ---------------- */
  const navA = document.querySelectorAll('[data-nav]');
  const sections = [...navA].map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if (sections.length) {
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const link = document.querySelector(`[data-nav][href="#${entry.target.id}"]`);
        if (!link) return;
        if (entry.isIntersecting) {
          navA.forEach((a) => a.classList.remove('is-active'));
          link.classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => navObserver.observe(s));
  }

  /* ---------------- reveal on scroll ---------------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach((el) => revealObserver.observe(el));

  /* ---------------- animated counters ---------------- */
  const formatNumber = (num, el, isDecimal) => {
    const money = el.hasAttribute('data-money');
    const prefix = el.getAttribute('data-prefix') || (money ? 'R$ ' : '');
    const suffix = el.getAttribute('data-suffix') || '';
    let numStr;
    if (money) {
      numStr = num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else if (isDecimal) {
      numStr = num.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    } else {
      numStr = Math.round(num).toLocaleString('pt-BR');
    }
    return `${prefix}${numStr}${suffix}`;
  };
  const countUp = (el) => {
    const target = parseFloat(el.getAttribute('data-count'));
    if (Number.isNaN(target)) return;
    const isDecimal = !el.hasAttribute('data-money') && (target % 1 !== 0);
    if (reducedMotion) { el.textContent = formatNumber(target, el, isDecimal); return; }
    const duration = 1600;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const current = target * eased;
      if (p < 1) {
        el.textContent = formatNumber(current, el, isDecimal);
        requestAnimationFrame(step);
      } else {
        el.textContent = formatNumber(target, el, isDecimal);
      }
    };
    requestAnimationFrame(step);
  };
  const counters = document.querySelectorAll('[data-count]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        countUp(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  counters.forEach((el) => counterObserver.observe(el));

  /* ---------------- chart tooltip ---------------- */
  const chartCard = document.querySelector('.chart-card');
  const chartTooltip = document.getElementById('chart-tooltip');
  if (chartCard && chartTooltip) {
    document.querySelectorAll('.chart-dot').forEach((dot) => {
      const show = () => {
        const month = dot.getAttribute('data-month');
        const value = dot.getAttribute('data-value');
        const delta = dot.getAttribute('data-delta');
        chartTooltip.innerHTML = `<b>${month} · ${value}</b>${delta ? `<small>${delta}</small>` : ''}`;
        const dotRect = dot.getBoundingClientRect();
        const cardRect = chartCard.getBoundingClientRect();
        chartTooltip.style.left = `${dotRect.left - cardRect.left + dotRect.width / 2}px`;
        chartTooltip.style.top = `${dotRect.top - cardRect.top}px`;
        chartTooltip.classList.add('is-visible');
      };
      const hide = () => chartTooltip.classList.remove('is-visible');
      dot.addEventListener('mouseenter', show);
      dot.addEventListener('mouseleave', hide);
    });
  }

  /* ---------------- cost bars + chart bars fill ---------------- */
  const bars = document.querySelectorAll('.cost-bar, .bars-chart');
  const barObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        barObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  bars.forEach((el) => barObserver.observe(el));

  /* ---------------- hero scroll parallax (floaters) ---------------- */
  const heroSection = document.getElementById('hero');
  const floaters = document.querySelector('.floaters');
  if (heroSection && floaters && !reducedMotion) {
    const onHeroScroll = () => {
      const rect = heroSection.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      floaters.style.transform = `translateY(${window.scrollY * 0.15}px)`;
    };
    document.addEventListener('scroll', onHeroScroll, { passive: true });
    onHeroScroll();
  }

  /* ---------------- hero title text scramble ---------------- */
  const scrambleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const scrambleText = (el) => {
    const final = el.textContent;
    const duration = 700;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const revealCount = Math.floor(p * final.length);
      let out = '';
      for (let i = 0; i < final.length; i++) {
        out += i < revealCount ? final[i] : scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
      }
      el.textContent = out;
      if (p < 1) requestAnimationFrame(step); else el.textContent = final;
    };
    requestAnimationFrame(step);
  };
  const gradEls = document.querySelectorAll('.hero-title .grad-text');
  if (gradEls.length && !reducedMotion) {
    gradEls.forEach((el) => setTimeout(() => scrambleText(el), 1300));
  }

  /* ---------------- button ripple ---------------- */
  document.querySelectorAll('.btn').forEach((btn) => {
    btn.addEventListener('click', function (e) {
      const r = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(r.width, r.height) * 1.4;
      ripple.className = 'ripple';
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - r.left - size / 2}px`;
      ripple.style.top = `${e.clientY - r.top - size / 2}px`;
      this.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });

  /* ---------------- tabs (serviços) ---------------- */
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabIndicator = document.querySelector('.tab-indicator');
  const tabsNav = document.querySelector('.tabs-nav');
  const moveIndicator = (btn) => {
    if (!tabIndicator || !tabsNav) return;
    const navRect = tabsNav.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    tabIndicator.style.width = `${btnRect.width}px`;
    tabIndicator.style.transform = `translateX(${btnRect.left - navRect.left}px)`;
  };
  if (tabBtns.length) {
    moveIndicator(document.querySelector('.tab-btn.is-active'));
    tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        tabBtns.forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        moveIndicator(btn);
        const target = btn.getAttribute('data-tab');
        document.querySelectorAll('.tab-panel').forEach((p) => {
          p.classList.toggle('is-active', p.getAttribute('data-panel') === target);
        });
      });
    });
    window.addEventListener('resize', () => moveIndicator(document.querySelector('.tab-btn.is-active')));
  }

  /* ---------------- accordion (faq) ---------------- */
  document.querySelectorAll('.acc-head').forEach((head) => {
    head.addEventListener('click', () => {
      const item = head.closest('.acc-item');
      const wasOpen = item.classList.contains('is-open');
      item.parentElement.querySelectorAll('.acc-item').forEach((i) => i.classList.remove('is-open'));
      if (!wasOpen) item.classList.add('is-open');
    });
  });

  /* ---------------- timeline scroll fill ---------------- */
  const timelineFill = document.getElementById('timeline-fill');
  const timelineSection = document.getElementById('timeline');
  if (timelineFill && timelineSection) {
    const updateFill = () => {
      const r = timelineSection.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = r.height + vh * 0.6;
      const progressed = vh * 0.8 - r.top;
      const pct = Math.min(Math.max(progressed / total, 0), 1) * 100;
      timelineFill.style.width = `${pct}%`;
    };
    document.addEventListener('scroll', updateFill, { passive: true });
    updateFill();
  }

  /* ---------------- lead form ---------------- */
  const form = document.getElementById('lead-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('.btn-primary');
      const label = btn.querySelector('.btn-label');
      label.textContent = 'Recebemos seu contato';
      btn.style.pointerEvents = 'none';
      btn.style.opacity = '0.75';
    });
  }

  /* ---------------- footer year ---------------- */
  const footYear = document.getElementById('foot-year');
  if (footYear) {
    footYear.textContent = `© ${new Date().getFullYear()} Boss Finance`;
  }
})();
