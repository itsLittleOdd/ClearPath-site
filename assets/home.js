/* Homepage behavior: gated scroll reveals, demo-surface tabs, and the
   fail-closed reveal of the compact demo surface.
   Browser-local only: no network calls, no storage. */
(function () {
  'use strict';

  /* Hide-then-reveal styling only applies while this script is alive, so a
     missing or failed script can never hide page content. */
  document.documentElement.classList.add('js-anim');

  var reduceMotion = false;
  if (window.matchMedia) {
    reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /* ----- scroll reveals ----- */
  var reveals = document.querySelectorAll('.reveal');
  var staggers = document.querySelectorAll('[data-stagger]');
  var i;
  for (i = 0; i < staggers.length; i += 1) {
    var children = staggers[i].children;
    for (var c = 0; c < children.length; c += 1) {
      children[c].style.setProperty('--sd', (c * 90) + 'ms');
    }
  }
  function showAll() {
    for (var r = 0; r < reveals.length; r += 1) {
      reveals[r].classList.add('in');
    }
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
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    for (i = 0; i < reveals.length; i += 1) { io.observe(reveals[i]); }
  }

  /* ----- demo surface tabs ----- */
  function initTablist(tablist) {
    var tabs = tablist.querySelectorAll('[role="tab"]');
    if (!tabs.length) { return false; }
    var panels = [];
    var t;
    for (t = 0; t < tabs.length; t += 1) {
      var panel = document.getElementById(
        tabs[t].getAttribute('aria-controls'));
      if (!panel) { return false; }
      panels.push(panel);
    }

    function indexOfTab(tab) {
      for (var k = 0; k < tabs.length; k += 1) {
        if (tabs[k] === tab) { return k; }
      }
      return 0;
    }

    function select(index, focusTab) {
      for (var k = 0; k < tabs.length; k += 1) {
        var on = k === index;
        tabs[k].setAttribute('aria-selected', on ? 'true' : 'false');
        tabs[k].setAttribute('tabindex', on ? '0' : '-1');
        panels[k].hidden = !on;
      }
      if (focusTab) { tabs[index].focus(); }
    }

    for (t = 0; t < tabs.length; t += 1) {
      (function (tab) {
        tab.addEventListener('click', function () {
          select(indexOfTab(tab), false);
        });
        tab.addEventListener('keydown', function (event) {
          var current = indexOfTab(tab);
          var next = -1;
          if (event.key === 'ArrowRight') {
            next = (current + 1) % tabs.length;
          } else if (event.key === 'ArrowLeft') {
            next = (current - 1 + tabs.length) % tabs.length;
          } else if (event.key === 'Home') {
            next = 0;
          } else if (event.key === 'End') {
            next = tabs.length - 1;
          }
          if (next !== -1) {
            event.preventDefault();
            select(next, true);
          }
        });
      }(tabs[t]));
    }

    var start = 0;
    for (t = 0; t < tabs.length; t += 1) {
      if (tabs[t].getAttribute('aria-selected') === 'true') { start = t; }
    }
    select(start, false);
    return true;
  }

  /* ----- guided pricing picker ----- */
  var pricingPicker = document.querySelector('[data-pricing-picker]');
  if (pricingPicker) {
    var pricingTabs = pricingPicker.querySelector('[data-pricing-tabs]');
    if (pricingTabs && initTablist(pricingTabs)) {
      pricingPicker.classList.add('pricing-ready');
    }
  }

  /* ----- fail-closed surface reveal ----- */
  var shell = document.getElementById('see-shell');
  var fallback = document.getElementById('see-fallback');
  var surfaceReady = false;
  if (shell && fallback) {
    var tablists = shell.querySelectorAll('[role="tablist"]');
    var tabsOk = tablists.length > 0;
    for (i = 0; i < tablists.length; i += 1) {
      if (!initTablist(tablists[i])) { tabsOk = false; }
    }
    var mounts = shell.querySelectorAll('[data-demo]');
    var mountsOk = mounts.length > 0;
    for (i = 0; i < mounts.length; i += 1) {
      if (mounts[i].getAttribute('data-ready') !== '1') { mountsOk = false; }
    }
    surfaceReady = tabsOk && mountsOk;
  }
  /* Reveal last: if the engines above failed to wire any compact demo, the
     honest fallback with links to the full demo pages stays visible. */
  if (surfaceReady) {
    shell.hidden = false;
    fallback.hidden = true;
  }
}());
