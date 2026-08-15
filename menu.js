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

  // ===== PINCH-TO-ZOOM & DOUBLE-TAP ZOOM =====
  let currentScale = 1;
  let initialDistance = 0;
  let initialScale = 1;
  let isPinching = false;
  let lastTapTime = 0;
  let panX = 0, panY = 0;
  let startPanX = 0, startPanY = 0;
  let initialPanX = 0, initialPanY = 0;

  function resetZoom() {
    currentScale = 1;
    panX = 0;
    panY = 0;
    lbImg.style.transform = 'scale(1)';
    lbImg.classList.remove('zoomed');
  }

  function applyZoom() {
    lbImg.style.transform = 'translate(' + panX + 'px, ' + panY + 'px) scale(' + currentScale + ')';
    if (currentScale > 1) {
      lbImg.classList.add('zoomed');
    } else {
      lbImg.classList.remove('zoomed');
    }
  }

  function getDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function getCenter(touches) {
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2
    };
  }

  // Double-tap to zoom
  lbImg.addEventListener('click', (e) => {
    const now = Date.now();
    if (now - lastTapTime < 300) {
      // Double tap
      e.preventDefault();
      if (currentScale > 1) {
        resetZoom();
      } else {
        currentScale = 2.5;
        // Center zoom on tap point
        const rect = lbImg.getBoundingClientRect();
        const offsetX = e.clientX - rect.left - rect.width / 2;
        const offsetY = e.clientY - rect.top - rect.height / 2;
        panX = -offsetX * (currentScale - 1);
        panY = -offsetY * (currentScale - 1);
        applyZoom();
      }
    }
    lastTapTime = now;
  });

  // Pinch zoom
  lbImg.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      isPinching = true;
      initialDistance = getDistance(e.touches);
      initialScale = currentScale;
      initialPanX = panX;
      initialPanY = panY;
      e.preventDefault();
    } else if (e.touches.length === 1 && currentScale > 1) {
      startPanX = e.touches[0].clientX;
      startPanY = e.touches[0].clientY;
      initialPanX = panX;
      initialPanY = panY;
    }
  }, { passive: false });

  lbImg.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2 && isPinching) {
      e.preventDefault();
      const distance = getDistance(e.touches);
      const scaleChange = distance / initialDistance;
      currentScale = Math.min(Math.max(initialScale * scaleChange, 1), 4);
      applyZoom();
    } else if (e.touches.length === 1 && currentScale > 1) {
      e.preventDefault();
      const dx = e.touches[0].clientX - startPanX;
      const dy = e.touches[0].clientY - startPanY;
      panX = initialPanX + dx;
      panY = initialPanY + dy;
      applyZoom();
    }
  }, { passive: false });

  lbImg.addEventListener('touchend', (e) => {
    if (e.touches.length < 2) {
      isPinching = false;
    }
    // Snap back if zoomed out too much
    if (currentScale < 1.1) {
      resetZoom();
    }
  });

  // Reset zoom on image change or close
  const originalOpen = open;
  open = function(i) {
    resetZoom();
    originalOpen(i);
  };

  const originalClose = close;
  close = function() {
    resetZoom();
    originalClose();
  };

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
