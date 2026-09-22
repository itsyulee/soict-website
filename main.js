const menuButton = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
const searchPanel = document.querySelector('.search-panel');

menuButton.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
});

document.querySelectorAll('.main-nav a').forEach(link => {
  link.addEventListener('click', () => {
    if (link.parentElement.classList.contains('nav-item')) return;

    mainNav.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  });
});

searchPanel.addEventListener('submit', event => {
  event.preventDefault();

  const keyword = document.querySelector('#site-search').value.trim();

  if (keyword) alert(`Bạn đang tìm kiếm: ${keyword}`);
});

const slides = [...document.querySelectorAll('.hero-slide')];
const dotsContainer = document.querySelector('.hero-dots');

let currentSlide = 0;
let autoPlay;

slides.forEach((_, index) => {
  const dot = document.createElement('button');

  dot.className = `hero-dot${index === 0 ? ' active' : ''}`;
  dot.type = 'button';
  dot.setAttribute('aria-label', `Hiển thị banner ${index + 1}`);
  dot.addEventListener('click', () => showSlide(index));

  dotsContainer.appendChild(dot);
});

function showSlide(index) {
  currentSlide = (index + slides.length) % slides.length;

  slides.forEach((slide, i) => {
    slide.classList.toggle('active', i === currentSlide);
  });

  [...dotsContainer.children].forEach((dot, i) => {
    dot.classList.toggle('active', i === currentSlide);
  });

  restartAutoPlay();
}

function restartAutoPlay() {
  clearInterval(autoPlay);
  autoPlay = setInterval(() => showSlide(currentSlide + 1), 6000);
}

document.querySelector('.hero-arrow.prev').addEventListener('click', () => {
  showSlide(currentSlide - 1);
});

document.querySelector('.hero-arrow.next').addEventListener('click', () => {
  showSlide(currentSlide + 1);
});

restartAutoPlay();

const stats = document.querySelector('.stats');

let counted = false;

const countObserver = new IntersectionObserver(entries => {
  if (!entries[0].isIntersecting || counted) return;

  counted = true;

  document.querySelectorAll('[data-count]').forEach(element => {
    const target = Number(element.dataset.count);
    const suffix = element.dataset.suffix || '';
    const duration = 1400;
    const start = performance.now();

    const update = now => {
      const progress = Math.min((now - start) / duration, 1);
      const value = Math.floor(target * (1 - Math.pow(1 - progress, 3)));

      element.textContent = value.toLocaleString('vi-VN') + suffix;

      if (progress < 1) requestAnimationFrame(update);
    };

    requestAnimationFrame(update);
  });
}, { threshold: 0.35 });

countObserver.observe(stats);

const header = document.querySelector('.site-header');

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 160);
}, { passive: true });

(() => {
  const track = document.getElementById('event-track');

  if (!track) return;

  const carousel = track.closest('.event-carousel');
  const prev = carousel.querySelector('.event-prev');
  const next = carousel.querySelector('.event-next');

  let animation = null;
  let finish = null;

  function alignArrows() {
    const image = track.querySelector('.event-photo img');

    if (image) {
      carousel.style.setProperty(
        '--event-arrow-top',
        image.getBoundingClientRect().height / 2 + 'px'
      );
    }
  }

  alignArrows();

  track.querySelectorAll('img').forEach(image => {
    image.addEventListener('load', alignArrows);
  });

  if ('ResizeObserver' in window) {
    new ResizeObserver(alignArrows).observe(carousel);
  }

  function move(direction) {
    if (animation || track.children.length < 2) return;

    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    const step = track.firstElementChild.getBoundingClientRect().width + gap;

    let copy = null;

    if (direction > 0) {
      copy = track.firstElementChild.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');

      copy.querySelectorAll('a, button').forEach(link => {
        link.tabIndex = -1;
      });

      track.append(copy);
    } else {
      track.prepend(track.lastElementChild);
    }

    animation = track.animate([
      {
        transform: `translateX(${direction > 0 ? 0 : -step}px)`
      },
      {
        transform: `translateX(${direction > 0 ? -step : 0}px)`
      }
    ], {
      duration: 600,
      easing: 'cubic-bezier(.22,.61,.36,1)',
      fill: 'both'
    });

    finish = () => {
      if (!animation) return;

      if (direction > 0) {
        track.append(track.firstElementChild);
        copy.remove();
      }

      animation.cancel();
      animation = null;
      finish = null;
    };

    animation.onfinish = finish;
  }

  prev.addEventListener('click', () => {
    move(-1);
  });

  next.addEventListener('click', () => {
    move(1);
  });

  window.addEventListener('resize', () => {
    if (finish) finish();

    alignArrows();
  });
})();

(() => {
  const hero = document.querySelector('.reference-hero');

  if (!hero) return;

  const colors = [
    '#ee1717',
    '#00abc8',
    '#8dc900',
    '#a000d1',
    '#ff9500',
    '#007fc4'
  ];

  const count = window.innerWidth < 650 ? 35 : 85;

  hero.querySelectorAll('.hero-slide').forEach(slide => {
    const layer = document.createElement('div');

    layer.className = 'confetti-layer';
    layer.setAttribute('aria-hidden', 'true');

    for (let i = 0; i < count; i++) {
      const piece = document.createElement('i');

      piece.className = 'confetti-piece';

      const vars = {
        '--x': Math.random() * 100 + '%',
        '--size': 6 + Math.random() * 7 + 'px',
        '--color': colors[i % colors.length],
        '--duration': 6 + Math.random() * 7 + 's',
        '--delay': -Math.random() * 15 + 's',
        '--drift': -70 + Math.random() * 140 + 'px',
        '--spin': (Math.random() > .5 ? 1 : -1) * (360 + Math.random() * 720) + 'deg'
      };

      Object.entries(vars).forEach(([key, value]) => {
        piece.style.setProperty(key, value);
      });

      layer.append(piece);
    }

    slide.append(layer);
  });

  const updateHeight = () => {
    hero.style.setProperty('--fall-distance', hero.clientHeight + 60 + 'px');
  };

  updateHeight();

  if ('ResizeObserver' in window) {
    new ResizeObserver(updateHeight).observe(hero);
  } else {
    window.addEventListener('resize', updateHeight);
  }

  const toggle = document.createElement('button');

  hero.append(toggle);

  let visible = true;

  const pause = () => {
    hero.classList.toggle('effects-paused', !visible || document.hidden);
  };

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      pause();
    }).observe(hero);
  }

  document.addEventListener('visibilitychange', pause);

  pause();
})();

const alumniTrack = document.querySelector('.reference-alumni-track');

if (alumniTrack) {
  function moveAlumni(direction) {
    const card = alumniTrack.querySelector('.reference-alumni-card');
    const step = card.getBoundingClientRect().width + 36;
    const end = alumniTrack.scrollWidth - alumniTrack.clientWidth;

    if (end < 2) {
      if (direction > 0) alumniTrack.append(alumniTrack.firstElementChild);
      else alumniTrack.prepend(alumniTrack.lastElementChild);

      return;
    }

    let target = alumniTrack.scrollLeft + direction * step;

    if (direction > 0 && alumniTrack.scrollLeft >= end - 2) target = 0;
    if (direction < 0 && alumniTrack.scrollLeft <= 2) target = end;

    alumniTrack.scrollTo({
      left: target,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth'
    });
  }

  document.querySelector('.alumni-prev').addEventListener('click', () => {
    moveAlumni(-1);
  });

  document.querySelector('.alumni-next').addEventListener('click', () => {
    moveAlumni(1);
  });
}

function getVideoId(value) {
  const link = value.trim();

  if (/^[a-zA-Z0-9_-]{11}$/.test(link)) return link;

  try {
    const url = new URL(
      /^https?:\/\//i.test(link) ? link : `https://${link}`
    );

    const host = url.hostname.toLowerCase();
    const parts = url.pathname.split('/').filter(Boolean);

    let id = '';

    if (host === 'youtu.be') {
      id = parts[0] || '';
    } else if ([
      'youtube.com',
      'www.youtube.com',
      'm.youtube.com',
      'youtube-nocookie.com',
      'www.youtube-nocookie.com'
    ].includes(host)) {
      if (url.pathname === '/watch') {
        id = url.searchParams.get('v') || '';
      } else if (['embed', 'shorts', 'live'].includes(parts[0])) {
        id = parts[1] || '';
      }
    }

    return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : '';
  } catch {
    return '';
  }
}

document.querySelectorAll('.video-cover').forEach(cover => {
  const button = cover.querySelector('button');

  if (!button) return;

  button.addEventListener('click', () => {
    const link = cover.dataset.video || '';
    const id = getVideoId(link);

    if (!id) {
      alert(
        link.trim()
          ? 'Link YouTube chưa hợp lệ.'
          : 'Bạn chưa thêm link YouTube cho video này.'
      );

      return;
    }

    const iframe = document.createElement('iframe');
    const image = cover.querySelector('img');

    iframe.src = `https://www.youtube.com/embed/${id}?autoplay=1&playsinline=1`;
    iframe.title = image ? image.alt : 'Video YouTube';
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';

    cover.classList.add('playing');
    cover.replaceChildren(iframe);

    iframe.focus();
  });
});

(() => {
  const section = document.querySelector('.testimonial-section');

  if (!section) return;

  const slides = [...section.querySelectorAll('.testimonial-slide')];
  const dots = section.querySelector('.testimonial-dots');

  if (!dots || !slides.length) return;

  dots.replaceChildren();

  function show(index) {
    slides.forEach((slide, i) => {
      slide.hidden = i !== index;
    });

    [...dots.children].forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
      dot.setAttribute('aria-pressed', String(i === index));
    });
  }

  slides.forEach((_, index) => {
    const dot = document.createElement('button');

    dot.type = 'button';
    dot.setAttribute('aria-label', `Xem nhận xét ${index + 1}`);

    dot.addEventListener('click', () => {
      show(index);
    });

    dots.appendChild(dot);
  });

  show(0);
})();