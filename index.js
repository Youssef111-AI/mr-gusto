(function() {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Intro Screen
  const introOverlay = document.getElementById('introOverlay');
  const introSkip = document.getElementById('introSkip');

  function hideIntro() {
    introOverlay.classList.add('hidden');
    document.body.style.overflow = '';
  }

  introSkip.addEventListener('click', hideIntro);

  const rootStyles = getComputedStyle(document.documentElement);
  const autoHideDelay = parseInt(rootStyles.getPropertyValue('--intro-autohide-delay')) || 2000;

  setTimeout(() => {
    if (!introOverlay.classList.contains('hidden')) {
      hideIntro();
    }
  }, autoHideDelay);

  // Particles
  if (!reduced) {
    const particlesContainer = document.getElementById('particles');
    for (let i = 0; i < 20; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.animationDuration = (8 + Math.random() * 12) + 's';
      p.style.animationDelay = Math.random() * 10 + 's';
      p.style.width = p.style.height = (2 + Math.random() * 4) + 'px';
      particlesContainer.appendChild(p);
    }
  }

  // Social Modal
  const socialBtn = document.getElementById('socialBtn');
  const socialModal = document.getElementById('socialModal');
  const socialModalClose = document.getElementById('socialModalClose');

  socialBtn.addEventListener('click', () => {
    socialModal.classList.add('active');
    socialModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  });

  function closeSocialModal() {
    socialModal.classList.remove('active');
    socialModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  socialModalClose.addEventListener('click', closeSocialModal);
  socialModal.addEventListener('click', (e) => {
    if (e.target === socialModal) closeSocialModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && socialModal.classList.contains('active')) {
      closeSocialModal();
    }
  });

  // Ripple effect on buttons
  document.querySelectorAll('.square-btn, .google-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });

  // Touch feedback
  const isTouch = window.matchMedia('(pointer: coarse)').matches;
  if (isTouch) {
    document.querySelectorAll('.square-btn, .google-btn, .social-icon').forEach(btn => {
      btn.addEventListener('touchstart', function() { this.style.transform = 'scale(0.96)'; }, { passive: true });
      btn.addEventListener('touchend', function() { this.style.transform = ''; }, { passive: true });
    });
  }
})();
