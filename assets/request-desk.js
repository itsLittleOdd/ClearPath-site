/* Request Desk demo engine. Deterministic sample data for a fictional cafe.
   Browser-local only: no network calls, no storage, nothing ever sends.
   Visitor-facing text is written with textContent only. */
(function () {
  'use strict';

  var SAMPLES = {
    'catering-email': {
      meta: 'Email from morgan@example.com, Tuesday 9:41 am',
      request: 'Hi, hoping to get lunch catered for our office on Friday the 14th, around 30 people. Do you do drop off? Rough idea on sandwiches and salads? Thanks, Morgan',
      facts: [
        'Catering request for an office lunch',
        'Friday the 14th',
        'About 30 people',
        'Drop off preferred',
        'Interested in sandwiches and salads'
      ],
      missing: [
        'Delivery address',
        'Time window for the drop off',
        'Dietary needs, if any'
      ],
      action: 'Reply with drop off options and ask for the address, time window, and dietary needs. Assigned to: front counter.',
      draft: 'Hi Morgan, thanks for thinking of The Juniper Table. We do drop off catering, and Friday the 14th looks workable. To pull together options for 30 people, could you share the delivery address, the time window, and any dietary needs? Exact pricing follows once the owner signs off.',
      record: [
        'Catering inquiry, Morgan, office lunch',
        'Friday the 14th, about 30 people, drop off',
        'Waiting on: address, time window, dietary needs'
      ]
    },
    'phone-note': {
      meta: 'Paper note from the counter, around 2:15 pm',
      request: 'Pat called, wants the back room for a birthday?? maybe Friday. Call back after 4. No number written down.',
      facts: [
        'Back room requested',
        'Occasion is a birthday',
        'Possibly Friday',
        'Caller asked for a callback after 4 pm'
      ],
      missing: [
        'Last name and phone number',
        'Which Friday, and what time',
        'How many people'
      ],
      action: 'Pull the 2:15 pm number from the phone log, then call Pat back after 4 pm with the back room details. Assigned to: manager on shift.',
      draft: 'Call script: Hi Pat, returning your call about the back room for a birthday. It seats up to 20. Which Friday were you thinking, what time, and about how many people? I can pencil it in while we talk.',
      record: [
        'Back room inquiry, Pat, birthday',
        'Number to confirm from the 2:15 pm phone log',
        'Callback promised after 4 pm today'
      ]
    },
    'web-form': {
      meta: 'Website contact form, submitted 8:03 pm',
      request: 'Name: Sam T. / Email: sam@example.com / Message: Do you sell gift cards online? I need one by Saturday for my mom.',
      facts: [
        'Gift card question',
        'Needed by Saturday',
        'It is a gift for a family member',
        'Reply address: sam@example.com'
      ],
      missing: [
        'Amount wanted',
        'Pickup in person or arranged another way'
      ],
      action: 'Reply tonight with how gift cards work and offer to set one aside for Saturday pickup. Assigned to: front counter, first thing tomorrow.',
      draft: 'Hi Sam, thanks for reaching out. Gift cards are sold at the register in any amount, and we would be glad to set one aside so it is ready for a quick Saturday pickup. Reply with the amount you want and the name to hold it under, and we will have it waiting.',
      record: [
        'Gift card inquiry, Sam T., needed Saturday',
        'Offer made: hold one at the register',
        'Waiting on: amount and pickup name'
      ]
    }
  };

  var STEP_ORDER = ['facts', 'missing', 'action', 'draft'];
  var reduceMotion = false;
  if (window.matchMedia) {
    reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  var STEP_DELAY = reduceMotion ? 0 : 430;

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) { node.className = className; }
    if (text) { node.textContent = text; }
    return node;
  }

  function bulletList(items, className) {
    var listNode = el('ul', className);
    for (var i = 0; i < items.length; i += 1) {
      listNode.appendChild(el('li', '', items[i]));
    }
    return listNode;
  }

  function initMount(mount) {
    var sampleButtons = mount.querySelectorAll('[data-sample]');
    var runButton = mount.querySelector('[data-role="run"]');
    var approveButton = mount.querySelector('[data-role="approve"]');
    var resetButton = mount.querySelector('[data-role="reset"]');
    var statusLine = mount.querySelector('[data-role="status"]');
    var stateChip = mount.querySelector('[data-role="state-chip"]');
    var approveChip = mount.querySelector('[data-role="approve-chip"]');
    var stages = {};
    var slots = {};
    var stageNodes = mount.querySelectorAll('[data-stage]');
    var i;
    for (i = 0; i < stageNodes.length; i += 1) {
      stages[stageNodes[i].getAttribute('data-stage')] = stageNodes[i];
    }
    var slotNodes = mount.querySelectorAll('[data-slot]');
    for (i = 0; i < slotNodes.length; i += 1) {
      slots[slotNodes[i].getAttribute('data-slot')] = slotNodes[i];
    }
    if (!runButton || !approveButton || !resetButton || !statusLine ||
        !stateChip || !approveChip || !stages.request || !slots.record) {
      return false;
    }

    var current = null;
    var timers = [];

    function clearTimers() {
      while (timers.length) { window.clearTimeout(timers.pop()); }
    }

    function later(fn, step) {
      timers.push(window.setTimeout(fn, STEP_DELAY * step));
    }

    function setChip(chip, stateClass, label) {
      chip.className = 'chip ' + stateClass;
      chip.textContent = label;
    }

    function setStatus(text) {
      statusLine.textContent = text;
    }

    function clearStage(name) {
      stages[name].classList.remove('is-active');
      stages[name].classList.remove('is-done');
      while (slots[name].firstChild) {
        slots[name].removeChild(slots[name].firstChild);
      }
    }

    function fillStage(name, builder) {
      stages[name].classList.remove('is-active');
      stages[name].classList.add('is-done');
      slots[name].appendChild(builder());
    }

    function markActive(name) {
      stages[name].classList.add('is-active');
    }

    function resetDesk() {
      clearTimers();
      current = null;
      var names = ['request', 'facts', 'missing', 'action', 'draft',
                   'approval', 'record'];
      for (var n = 0; n < names.length; n += 1) { clearStage(names[n]); }
      for (var b = 0; b < sampleButtons.length; b += 1) {
        sampleButtons[b].setAttribute('aria-pressed', 'false');
      }
      runButton.disabled = true;
      approveButton.disabled = true;
      setChip(stateChip, 'is-ready', 'Ready');
      setChip(approveChip, 'is-ready', 'Waiting for a draft');
      setStatus('Pick a sample request to begin.');
    }

    function loadSample(key, button) {
      clearTimers();
      resetDesk();
      current = key;
      button.setAttribute('aria-pressed', 'true');
      var data = SAMPLES[key];
      fillStage('request', function () {
        var card = el('div', 'msg');
        card.appendChild(el('span', 'msg-meta', data.meta));
        card.appendChild(el('p', '', data.request));
        return card;
      });
      runButton.disabled = false;
      setChip(stateChip, 'is-ready', 'Sample loaded');
      setStatus('Sample loaded. Run the desk to watch each step.');
    }

    function builderFor(name, data) {
      if (name === 'facts') {
        return function () { return bulletList(data.facts, 'fact-list'); };
      }
      if (name === 'missing') {
        return function () { return bulletList(data.missing, 'gap-list'); };
      }
      if (name === 'action') {
        return function () { return el('p', 'stage-note', data.action); };
      }
      return function () { return el('div', 'draft-card', data.draft); };
    }

    function runDesk() {
      if (!current) { return; }
      var data = SAMPLES[current];
      clearTimers();
      runButton.disabled = true;
      setChip(stateChip, 'is-processing', 'Running');
      setStatus('Working through the steps a person would otherwise do by hand.');
      var step;
      for (step = 0; step < STEP_ORDER.length; step += 1) {
        (function (name, index) {
          later(function () { markActive(name); }, index);
          later(function () {
            fillStage(name, builderFor(name, data));
          }, index + 1);
        }(STEP_ORDER[step], step));
      }
      later(function () {
        markActive('approval');
        fillStage('approval', function () {
          return el('p', 'stage-note',
            'The draft reply is ready but held. It waits for the owner below.');
        });
        stages.approval.classList.remove('is-done');
        stages.approval.classList.add('is-active');
        approveButton.disabled = false;
        setChip(stateChip, 'is-approval', 'Approval required');
        setChip(approveChip, 'is-approval', 'Approval required');
        setStatus('Draft ready. The desk stops here until the owner approves.');
        approveButton.focus({ preventScroll: true });
      }, STEP_ORDER.length + 1);
    }

    function approveForDemo() {
      if (!current) { return; }
      var data = SAMPLES[current];
      approveButton.disabled = true;
      stages.approval.classList.remove('is-active');
      stages.approval.classList.add('is-done');
      while (slots.approval.firstChild) {
        slots.approval.removeChild(slots.approval.firstChild);
      }
      slots.approval.appendChild(el('p', 'stage-note',
        'Approved for demo by you, just now. In a real setup this is the moment the reply could go out.'));
      fillStage('record', function () {
        var card = el('div', 'record-card');
        card.appendChild(el('strong', '', 'Follow-up record'));
        for (var r = 0; r < data.record.length; r += 1) {
          card.appendChild(el('span', 'rec-line', data.record[r]));
        }
        card.appendChild(el('span', 'rec-line', 'Status: approved for demo'));
        return card;
      });
      setChip(stateChip, 'is-approved', 'Approved for demo');
      setChip(approveChip, 'is-approved', 'Approved for demo');
      setStatus('Approved for demo. The follow-up record is ready. Nothing was sent.');
      resetButton.focus({ preventScroll: true });
    }

    for (i = 0; i < sampleButtons.length; i += 1) {
      (function (button) {
        var key = button.getAttribute('data-sample');
        button.addEventListener('click', function () {
          loadSample(key, button);
        });
      }(sampleButtons[i]));
    }
    runButton.addEventListener('click', runDesk);
    approveButton.addEventListener('click', approveForDemo);
    resetButton.addEventListener('click', resetDesk);

    mount.setAttribute('data-ready', '1');
    return true;
  }

  var mounts = document.querySelectorAll('[data-demo="request-desk"]');
  var allWired = mounts.length > 0;
  for (var m = 0; m < mounts.length; m += 1) {
    if (!initMount(mounts[m])) { allWired = false; }
  }

  /* Reveal last, and only when every mount wired. If anything above failed,
     the honest no-JS fallback stays visible instead of a dead demo. */
  var shell = document.getElementById('demo-shell');
  var fallback = document.getElementById('demo-fallback');
  if (shell && fallback && allWired) {
    shell.hidden = false;
    fallback.hidden = true;
  }
}());
