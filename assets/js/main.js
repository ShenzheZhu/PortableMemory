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
