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

  /* ----- video figure: explicit play, honest missing-file state ----- */
  var figures = document.querySelectorAll('[data-video-figure]');
  for (i = 0; i < figures.length; i += 1) {
    (function (figure) {
      var video = figure.querySelector('video');
      var still = figure.querySelector('.video-still');
      var playButton = figure.querySelector('[data-role="play"]');
      var status = figure.querySelector('[data-role="video-status"]');
      if (!video || !still || !playButton) { return; }

      function say(text) {
        if (!status) { return; }
        status.textContent = text;
        status.hidden = !text;
      }

      function showStill() {
        still.classList.remove('is-hidden');
        still.removeAttribute('aria-hidden');
      }

      function hideStill() {
        still.classList.add('is-hidden');
        still.setAttribute('aria-hidden', 'true');
      }

      playButton.addEventListener('click', function () {
        say('');
        var attempt = video.play();
        if (attempt && typeof attempt.then === 'function') {
          attempt.then(function () {
            hideStill();
            video.focus({ preventScroll: true });
          }, function () {
            showStill();
            say('The video file is not available in this build. The written version below covers every step.');
          });
        } else {
          hideStill();
        }
      });
      video.addEventListener('play', hideStill);
      video.addEventListener('ended', function () {
        showStill();
        playButton.textContent = 'Play it again';
      });
      video.addEventListener('error', function () {
        showStill();
        say('The video file is not available in this build. The written version below covers every step.');
      });
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
