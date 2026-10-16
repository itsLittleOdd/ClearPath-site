/* Shared page behavior: header shadow, phone menu, gated scroll reveals,
   the explicit-play video figure, and the pricing page's parked sticky CTA.
   Browser-local only: no network calls, no storage, no timers that loop. */
(function () {
  'use strict';

  document.documentElement.classList.add('js-anim');

  var reduceMotion = false;
  if (window.matchMedia) {
    reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /* ----- header shadow once scrolled ----- */
  var head = document.querySelector('header.site-head');
  if (head) {
    var onScroll = function () {
      if (window.scrollY > 4) { head.classList.add('is-scrolled'); }
      else { head.classList.remove('is-scrolled'); }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ----- phone menu: works without this script; this only closes it ----- */
  var menu = document.querySelector('details.menu');
  if (menu) {
    var summary = menu.querySelector('summary');
    var closeMenu = function (refocus) {
      if (!menu.hasAttribute('open')) { return; }
      menu.removeAttribute('open');
      if (refocus && summary) { summary.focus(); }
    };
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') { closeMenu(true); }
    });
    document.addEventListener('click', function (event) {
      if (!menu.contains(event.target)) { closeMenu(false); }
    });
    var menuLinks = menu.querySelectorAll('a');
    for (var l = 0; l < menuLinks.length; l += 1) {
      menuLinks[l].addEventListener('click', function () { closeMenu(false); });
    }
  }

  /* ----- scroll reveals (finite, one pass) ----- */
  var reveals = document.querySelectorAll('.reveal');
  var staggers = document.querySelectorAll('[data-stagger]');
  var i;
  for (i = 0; i < staggers.length; i += 1) {
    var children = staggers[i].children;
    for (var c = 0; c < children.length; c += 1) {
      children[c].style.setProperty('--sd', Math.min(c * 60, 600) + 'ms');
    }
  }
  function showAll() {
    for (var r = 0; r < reveals.length; r += 1) { reveals[r].classList.add('in'); }
  }
  if (!('IntersectionObserver' in window) || reduceMotion) {
    showAll();
  } else {
    var io = new IntersectionObserver(function (entries) {
      for (var e = 0; e < entries.length; e += 1) {
        if (entries[e].isIntersecting) {
          entries[e].target.classList.add('in');
          io.unobserve(entries[e].target);
        }
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
    for (i = 0; i < reveals.length; i += 1) { io.observe(reveals[i]); }
  }

  /* ----- video figure: one clean picture, one external control, a state
     model derived from the media element itself. States: initial, loading,
     playing, paused, ended, unavailable. The control is never hidden or
     moved while states change, so focus stays where the visitor put it.
     Native controls on the video remain available at all times. ----- */
  var figures = document.querySelectorAll('[data-video-figure]');
  for (i = 0; i < figures.length; i += 1) {
    (function (figure) {
      var video = figure.querySelector('video');
      var button = figure.querySelector('[data-role="play"]');
      var controlsRow = figure.querySelector('.video-controls');
      var stateLine = figure.querySelector('[data-role="video-state"]');
      var status = figure.querySelector('[data-role="video-status"]');
      if (!video || !button) { return; }
      var NETWORK_NO_SOURCE = 3;
      var LABELS = { initial: 'Play video', loading: 'Loading', playing: 'Pause', paused: 'Play', ended: 'Play again', unavailable: 'Try again' };
      /* Each accessible name starts with the exact visible label so
         speech-input users can say what they see (label-in-name). */
      var ARIA = {
        initial: 'Play video: 20-second silent demonstration', loading: 'Loading the demonstration video',
        playing: 'Pause the demonstration video', paused: 'Play: resume the demonstration video',
        ended: 'Play again: replay the demonstration video', unavailable: 'Try again: retry loading the demonstration video'
      };
      var LINES = {
        initial: '20 seconds, silent, made-up data.', loading: 'Loading the video.',
        playing: 'Playing. Silent, made-up data.', paused: 'Paused.',
        ended: 'Finished. Nothing was sent. Play again or read the written version below.',
        unavailable: 'Video unavailable right now. The written version below covers every step.'
      };
      var unavailable = false;
      var pendingPlay = false;
      var sequence = 0;

      function say(text) {
        if (!status) { return; }
        status.textContent = text;
        status.hidden = !text;
      }
      function setState(name) {
        figure.setAttribute('data-video-state', name);
        button.textContent = LABELS[name];
        button.setAttribute('aria-label', ARIA[name]);
        if (stateLine) { stateLine.textContent = LINES[name]; }
        /* Idle and unavailable posters stay clean: native controls are
           suppressed only there and restored for every playback state. The
           HTML keeps the controls attribute for script-less visitors. */
        video.controls = !(name === 'initial' || name === 'unavailable');
      }
      function broken() {
        return unavailable || !!video.error || video.networkState === NETWORK_NO_SOURCE;
      }
      function derive() {
        if (unavailable) { setState('unavailable'); return; }
        if (video.ended) { setState('ended'); return; }
        if (video.paused) { setState(video.currentTime > 0 ? 'paused' : 'initial'); return; }
        if (pendingPlay || video.readyState < 3) { setState('loading'); return; }
        setState('playing');
      }
      function markUnavailable() {
        unavailable = true;
        pendingPlay = false;
        derive();
        say('The video file is not available right now. The written version below covers every step.');
      }

      button.addEventListener('click', function () {
        var retry = broken();
        /* Errored media can report paused=false; a broken player must retry,
           never fall into the ordinary pause branch. */
        if (!retry && !video.paused && !video.ended) { video.pause(); return; }
        var token = ++sequence;
        unavailable = false;
        say('');
        if (retry) { video.load(); }
        pendingPlay = true;
        setState('loading');
        var attempt = video.play();
        if (attempt && typeof attempt.then === 'function') {
          attempt.then(function () {
            if (token !== sequence) { return; }
            pendingPlay = false;
            derive();
          }, function (err) {
            if (token !== sequence) { return; }
            pendingPlay = false;
            /* A deliberate pause while play was still pending rejects the
               promise with AbortError. That is a visitor choice, not a
               missing file. Only real media failures are reported. */
            if (err && err.name === 'AbortError') { derive(); return; }
            markUnavailable();
          });
        } else { pendingPlay = false; }
      });
      var events = ['play', 'playing', 'pause', 'ended', 'waiting', 'canplay', 'seeked', 'emptied'];
      for (var ev = 0; ev < events.length; ev += 1) { video.addEventListener(events[ev], derive); }
      video.addEventListener('error', markUnavailable);
      var sources = video.querySelectorAll('source');
      if (sources.length) { sources[sources.length - 1].addEventListener('error', markUnavailable); }
      derive();
      /* Reveal the custom control only now that every handler is bound. */
      if (controlsRow) { controlsRow.hidden = false; }
      figure.setAttribute('data-video-ready', '1');
    }(figures[i]));
  }

  /* ----- pricing page: sticky quote bar that parks when the footer or a
     section CTA is on screen, so it never covers what it points at ----- */
  var sticky = document.querySelector('[data-sticky-cta]');
  if (sticky) {
    document.body.classList.add('has-sticky-cta');
    var parkers = document.querySelectorAll('[data-sticky-park]');
    var onScreen = [];
    var fieldFocused = false;
    var wantParked = false;

    /* A parked bar is slid out, hidden from assistive tech and made inert
       so Tab and Shift+Tab can never land on an off-screen action. If the
       bar currently owns focus, parking is deferred until focus leaves it,
       so a focused control is never moved under the keyboard or off screen. */
    function applyPark() {
      var shouldPark = wantParked || fieldFocused;
      if (shouldPark && sticky.contains(document.activeElement)) { return; }
      sticky.classList.toggle('is-parked', shouldPark);
      if (shouldPark) {
        sticky.setAttribute('inert', '');
        sticky.setAttribute('aria-hidden', 'true');
      } else {
        sticky.removeAttribute('inert');
        sticky.removeAttribute('aria-hidden');
      }
    }

    if ('IntersectionObserver' in window && parkers.length) {
      var parkObserver = new IntersectionObserver(function (entries) {
        for (var p = 0; p < entries.length; p += 1) {
          var idx = onScreen.indexOf(entries[p].target);
          if (entries[p].isIntersecting && idx === -1) { onScreen.push(entries[p].target); }
          if (!entries[p].isIntersecting && idx !== -1) { onScreen.splice(idx, 1); }
        }
        wantParked = onScreen.length > 0;
        applyPark();
      }, { threshold: 0.05 });
      for (i = 0; i < parkers.length; i += 1) { parkObserver.observe(parkers[i]); }
    }
    document.addEventListener('focusin', function (event) {
      var tag = (event.target && event.target.tagName) || '';
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) { fieldFocused = true; }
      applyPark();
    });
    document.addEventListener('focusout', function (event) {
      var tag = (event.target && event.target.tagName) || '';
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) { fieldFocused = false; }
      /* Focus leaving the bar is the moment a deferred park may apply. */
      window.setTimeout(applyPark, 0);
    });
  }

  /* ----- dormant analytics event contract (no provider, no transport) -----
     Pages may call window.clearpathEvent(name) in the future. Until an
     analytics decision is approved, events are counted in memory only and
     never leave the page. */
  var events = [];
  window.clearpathEvent = function (name) {
    if (typeof name !== 'string' || events.length > 100) { return false; }
    events.push(name);
    return true;
  };
}());
