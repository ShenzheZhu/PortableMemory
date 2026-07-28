/* ============================================================
   Portable Memory — site behaviour
   ============================================================ */

/* ------------------------------------------------------------
   SUBSCRIBE — Google Form wiring
   ------------------------------------------------------------
   To connect a Google Form, fill in the two values below.

   1. Open your form → "Send" → link icon → copy the /viewform URL.
      Replace "/viewform" with "/formResponse" and paste it as
      `formAction`.
        e.g. https://docs.google.com/forms/d/e/1FAIpQLSf.../formResponse

   2. On the live form, right-click the email question → Inspect,
      and find the input's name attribute: "entry.1234567890".
      Paste that as `emailEntryId`.

   Leave them empty and the form will politely say it isn't
   connected yet instead of silently dropping addresses.
   ------------------------------------------------------------ */
const SUBSCRIBE_CONFIG = {
  formAction: 'https://docs.google.com/forms/d/e/1FAIpQLSc86HnS20fqfteOI_mKdVztr7mg7niPPCMpzz9NByyM9cjXyg/formResponse',
  emailEntryId: 'entry.138413439'
};

(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Header: hairline appears once the page has moved ───── */
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => header.classList.toggle('is-stuck', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ── Quiet reveal on first view ───────────────────────────
     Opt-in: the hiding rule only applies once this script has
     added `.has-reveal`, so the page is fully legible without
     JavaScript. A hard timeout guarantees nothing stays hidden.
     ------------------------------------------------------- */
  if (!reduceMotion) {
    const pending = Array.prototype.slice.call(document.querySelectorAll(
      '.hero .eyebrow, .hero__title, .hero__lede, .hero__links, .diagram, ' +
      '.principle, .origin__inner, .projects .eyebrow, .card, .subscribe__inner'
    ));

    document.documentElement.classList.add('has-reveal');

    pending.forEach((el) => {
      const siblings = el.parentElement ? el.parentElement.children : [el];
      const index = Array.prototype.indexOf.call(siblings, el);
      el.setAttribute('data-reveal', '');
      el.style.transitionDelay = (Math.min(index, 3) * 70) + 'ms';
    });

    const revealAll = () => {
      while (pending.length) pending.pop().classList.add('is-in');
      window.removeEventListener('scroll', onScrollReveal);
      window.removeEventListener('resize', onScrollReveal);
    };

    const sweep = () => {
      const limit = window.innerHeight * 0.92;
      for (let i = pending.length - 1; i >= 0; i--) {
        if (pending[i].getBoundingClientRect().top < limit) {
          pending.splice(i, 1)[0].classList.add('is-in');
        }
      }
      if (!pending.length) revealAll();
    };

    let queued = false;
    function onScrollReveal() {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(() => { queued = false; sweep(); });
    }

    sweep();
    window.addEventListener('scroll', onScrollReveal, { passive: true });
    window.addEventListener('resize', onScrollReveal);
    window.addEventListener('load', sweep);
    window.setTimeout(revealAll, 4000);
  }

  /* ── Marquee: clone enough groups to cover the viewport ───
     One group is narrower than a wide screen, so shifting by a single
     group width would leave the right-hand side empty until the loop
     restarted. Clone until the track still covers the viewport after
     the shift, then drive the shift and duration from the measured
     width so the speed is the same at every size.
     ------------------------------------------------------- */
  const marquee = document.querySelector('[data-marquee]');
  const track = marquee && marquee.querySelector('.marquee__track');

  if (track && !reduceMotion) {
    const PIXELS_PER_SECOND = 34;

    const imagesReady = () =>
      Array.prototype.every.call(
        track.querySelectorAll('img'),
        (img) => img.complete && img.naturalWidth > 0
      );

    const fitMarquee = () => {
      const first = track.firstElementChild;
      if (!first) return;

      while (track.children.length > 1) track.lastElementChild.remove();

      const groupWidth = first.getBoundingClientRect().width;
      if (groupWidth < 1) return;

      /* after shifting one group, the remainder must still fill the screen */
      const needed = Math.max(2, Math.ceil(window.innerWidth / groupWidth) + 1);

      const fragment = document.createDocumentFragment();
      for (let i = 1; i < needed; i++) {
        const clone = first.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        Array.prototype.forEach.call(
          clone.querySelectorAll('img'),
          (img) => img.setAttribute('alt', '')
        );
        /* duplicates stay clickable but out of the tab order */
        Array.prototype.forEach.call(
          clone.querySelectorAll('a'),
          (link) => link.setAttribute('tabindex', '-1')
        );
        fragment.appendChild(clone);
      }
      track.appendChild(fragment);

      track.style.setProperty('--marquee-shift', groupWidth + 'px');
      track.style.setProperty(
        '--marquee-duration',
        (groupWidth / PIXELS_PER_SECOND).toFixed(2) + 's'
      );
    };

    let attempts = 0;
    const runWhenReady = () => {
      if (imagesReady() || attempts++ > 60) fitMarquee();
      else window.setTimeout(runWhenReady, 120);
    };

    runWhenReady();
    window.addEventListener('load', fitMarquee);

    let resizeTimer;
    let lastWidth = window.innerWidth;
    window.addEventListener('resize', () => {
      if (window.innerWidth === lastWidth) return; /* ignore mobile URL-bar resizes */
      lastWidth = window.innerWidth;
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(fitMarquee, 180);
    });
  }

  /* ── Subscribe form ──────────────────────────────────────── */
  const form   = document.getElementById('sub-form');
  const input  = document.getElementById('sub-email');
  const button = form && form.querySelector('.sub-form__button');
  const status = document.getElementById('sub-status');

  if (!form || !input || !status) return;

  const isConnected = Boolean(SUBSCRIBE_CONFIG.formAction && SUBSCRIBE_CONFIG.emailEntryId);

  if (isConnected) {
    form.setAttribute('action', SUBSCRIBE_CONFIG.formAction);
    input.setAttribute('name', SUBSCRIBE_CONFIG.emailEntryId);
  }

  const say = (message, isError) => {
    status.textContent = message;
    status.classList.toggle('is-error', Boolean(isError));
  };

  const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

  form.addEventListener('submit', (event) => {
    const value = input.value.trim();

    if (!isEmail(value)) {
      event.preventDefault();
      say('Please enter a valid email address.', true);
      input.focus();
      return;
    }

    if (!isConnected) {
      event.preventDefault();
      say('The subscribe form is not connected yet.', true);
      return;
    }

    /* The POST goes to the hidden iframe; Google's response is
       cross-origin and unreadable, so confirm optimistically. */
    if (button) button.disabled = true;
    say('Sending…');

    window.setTimeout(() => {
      form.reset();
      if (button) button.disabled = false;
      say('Thank you — you are on the list.');
    }, 700);
  });

  input.addEventListener('input', () => {
    if (status.classList.contains('is-error')) say('');
  });
})();
