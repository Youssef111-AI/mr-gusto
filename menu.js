(function() {
  'use strict';

  const items = document.querySelectorAll('.menu-item');
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lbImg');
  const lbCounter = document.getElementById('lbCounter');
  let current = 0;
  let visibleItems = Array.from(items);

  // Filter functionality
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.dataset.filter;
      items.forEach(item => {
        const cat = item.dataset.category;
        let show = false;
        if (filter === 'all') {
          show = true;
        } else if (filter === 'drinks') {
          show = (cat === 'hot' || cat === 'cold');
        } else {
          show = (cat === filter);
        }

        if (show) {
          item.classList.remove('hidden');
          item.style.animation = 'none';
          item.offsetHeight;
          item.style.animation = '';
        } else {
          item.classList.add('hidden');
        }
      });

      visibleItems = Array.from(items).filter(i => !i.classList.contains('hidden'));
    });
  });

  function open(i) {
    current = i;
    update();
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function update() {
    const img = visibleItems[current].querySelector('img');
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lbCounter.textContent = (current + 1) + ' / ' + visibleItems.length;
  }

  function next() { current = (current + 1) % visibleItems.length; update(); }
  function prev() { current = (current - 1 + visibleItems.length) % visibleItems.length; update(); }

  items.forEach((item) => {
    item.addEventListener('click', () => {
      const visibleIndex = visibleItems.indexOf(item);
      open(visibleIndex);
    });
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); }
    });
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
  });

  document.getElementById('lbClose').addEventListener('click', close);
  document.getElementById('lbNext').addEventListener('click', next);
  document.getElementById('lbPrev').addEventListener('click', prev);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
  });

  // Touch swipe
  let startX = 0;
  lightbox.addEventListener('touchstart', (e) => {
    startX = e.changedTouches[0].screenX;
  }, { passive: true });
  lightbox.addEventListener('touchend', (e) => {
    const diff = startX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
  }, { passive: true });

  // Instagram Toast Notification
  const instaToast = document.getElementById('instaToast');
  const instaToastClose = document.getElementById('instaToastClose');
  const instaToastBtn = document.getElementById('instaToastBtn');
  let toastInterval;
  let toastTimeout;

  const rootStyles = getComputedStyle(document.documentElement);
  const firstDelay = parseFloat(rootStyles.getPropertyValue('--toast-first-delay')) * 1000 || 2000;
  const interval = parseFloat(rootStyles.getPropertyValue('--toast-interval')) * 1000 || 5000;
  const displayDuration = parseFloat(rootStyles.getPropertyValue('--toast-display-duration')) * 1000 || 4000;

  function showToast() {
    instaToast.classList.add('show');
    toastTimeout = setTimeout(() => {
      instaToast.classList.remove('show');
    }, displayDuration);
  }

  function hideToast() {
    instaToast.classList.remove('show');
    clearTimeout(toastTimeout);
  }

  function startToastCycle() {
    showToast();
    toastInterval = setInterval(() => {
      showToast();
    }, interval);
  }

  setTimeout(startToastCycle, firstDelay);

  instaToastClose.addEventListener('click', hideToast);
  instaToastBtn.addEventListener('click', hideToast);
})();
