/* Business Brain demo engine. No AI model runs here: simple deterministic
   rules match a question to owner-approved source lines shown on the page,
   and every quoted line is read from that displayed DOM at answer time, so
   the demo cannot answer from anything the visitor cannot see.
   Browser-local only: no network calls, no storage, nothing ever sends.
   Visitor text is rendered with textContent only. */
(function () {
  'use strict';

  /* Each rule cites one displayed source card and quotes its data-fact
     lines. Keys are matched against normalized typed questions; more
     specific rules sit higher. */
  var RULES = [
    { id: 'giftcards', src: 'bb-src-staff', facts: ['staff-giftcards'],
      keys: ['gift card', 'giftcard', 'gift certificate'],
      lead: 'Gift cards, straight from the staff sheet:' },
    { id: 'dogs', src: 'bb-src-policies', facts: ['policy-dogs'],
      keys: ['dog', 'pet ', ' pets', 'puppy', 'service animal'],
      lead: 'House policy on dogs:' },
    { id: 'parties', src: 'bb-src-policies',
      facts: ['policy-large-parties', 'policy-reservations'],
      keys: ['reservation', 'reserve', 'party of', 'table for', 'group of',
             'big group', 'large group'],
      lead: 'Reservations and larger tables:' },
    { id: 'parking', src: 'bb-src-staff', facts: ['staff-parking'],
      keys: ['park', 'parking', 'lot '],
      lead: 'Parking, from the staff sheet:' },
    { id: 'glutenfree', src: 'bb-src-kitchen', facts: ['kitchen-glutenfree'],
      keys: ['gluten'],
      lead: 'From the kitchen notes:' },
    { id: 'espresso', src: 'bb-src-kitchen', facts: ['kitchen-espresso'],
      keys: ['espresso', 'latte', 'cappuccino'],
      lead: 'One espresso note worth knowing:' },
    { id: 'soup', src: 'bb-src-kitchen', facts: ['kitchen-soup'],
      keys: ['soup'],
      lead: 'From the kitchen notes:' },
    { id: 'lostfound', src: 'bb-src-staff', facts: ['staff-lostfound'],
      keys: ['lost', 'found', 'left my', 'forgot'],
      lead: 'Lost and found, from the staff sheet:' },
    { id: 'holidays', src: 'bb-src-hours', facts: ['hours-holidays'],
      keys: ['holiday', 'thanksgiving', 'christmas'],
      lead: 'Holiday hours from the approved sheet:' },
    { id: 'sunday', src: 'bb-src-hours', facts: ['hours-sunday'],
      keys: ['sunday'],
      lead: 'Yes on Sunday mornings. The approved hours sheet says:' },
    { id: 'weekend', src: 'bb-src-hours', facts: ['hours-weekend'],
      keys: ['friday', 'saturday', 'weekend', 'dinner'],
      lead: 'Later hours at the end of the week:' },
    { id: 'weekday', src: 'bb-src-hours', facts: ['hours-weekday'],
      keys: ['monday', 'tuesday', 'wednesday', 'thursday', 'weekday'],
      lead: 'Weekday hours from the approved sheet:' },
    { id: 'hours', src: 'bb-src-hours',
      facts: ['hours-weekday', 'hours-weekend', 'hours-sunday'],
      keys: ['hour', 'open', 'close', 'closing', 'opening', 'when '],
      lead: 'The full approved hours sheet:' }
  ];

  var PRESETS = {
    'q-sunday': 'sunday',
    'q-dog': 'dogs',
    'q-party': 'parties',
    'q-parking': 'parking',
    'q-oatmilk': null
  };

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) { node.className = className; }
    if (text) { node.textContent = text; }
    return node;
  }

  function normalize(text) {
    return (' ' + text.toLowerCase().replace(/[^a-z0-9]+/g, ' ') + ' ');
  }

  function matchRule(question) {
    var haystack = normalize(question);
    for (var r = 0; r < RULES.length; r += 1) {
      var keys = RULES[r].keys;
      for (var k = 0; k < keys.length; k += 1) {
        var needle = keys[k];
        if (needle.indexOf(' ') === -1) { needle = ' ' + needle; }
        if (haystack.indexOf(needle) !== -1) { return RULES[r]; }
      }
    }
    return null;
  }

  function initMount(mount) {
    var presetButtons = mount.querySelectorAll('[data-question]');
    var askForm = mount.querySelector('form.ask-form');
    var askInput = mount.querySelector('[data-role="ask-input"]');
    var answerBox = mount.querySelector('[data-role="answer"]');
    var approveButton = mount.querySelector('[data-role="approve"]');
    var resetButton = mount.querySelector('[data-role="reset"]');
    var statusLine = mount.querySelector('[data-role="status"]');
    var stateChip = mount.querySelector('[data-role="state-chip"]');
    var approveChip = mount.querySelector('[data-role="approve-chip"]');
    if (!answerBox || !approveButton || !resetButton || !statusLine ||
        !stateChip || !approveChip) {
      return false;
    }

    function factText(factId) {
      var line = mount.querySelector('[data-fact="' + factId + '"]');
      return line ? line.textContent : '';
    }

    function sourceName(srcId) {
      var card = mount.querySelector('#' + srcId + ' .src-name');
      return card ? card.textContent : srcId;
    }

    function setChip(chip, stateClass, label) {
      chip.className = 'chip ' + stateClass;
      chip.textContent = label;
    }

    function setStatus(text) {
      statusLine.textContent = text;
    }

    function clearAnswer() {
      while (answerBox.firstChild) {
        answerBox.removeChild(answerBox.firstChild);
      }
    }

    function clearCitedHighlight() {
      var cited = mount.querySelectorAll('.src.is-cited');
      for (var c = 0; c < cited.length; c += 1) {
        cited[c].classList.remove('is-cited');
      }
    }

    function pressOnly(button) {
      for (var b = 0; b < presetButtons.length; b += 1) {
        presetButtons[b].setAttribute('aria-pressed', 'false');
      }
      if (button) { button.setAttribute('aria-pressed', 'true'); }
    }

    function answerWithRule(question, rule) {
      clearAnswer();
      clearCitedHighlight();
      var card = el('div', 'answer-card');
      card.appendChild(el('p', 'answer-q', 'Question: ' + question));
      card.appendChild(el('p', 'answer-a', rule.lead));
      var quoted = [];
      for (var f = 0; f < rule.facts.length; f += 1) {
        var text = factText(rule.facts[f]);
        if (text) {
          quoted.push(text);
          card.appendChild(el('p', 'quote-line', text));
        }
      }
      var citeRow = el('div', 'cite-row');
      citeRow.appendChild(el('span', 'mgr-label', 'Cited:'));
      var cite = el('a', 'cite', sourceName(rule.src));
      cite.setAttribute('href', '#' + rule.src);
      citeRow.appendChild(cite);
      card.appendChild(citeRow);
      card.appendChild(el('p', 'mgr-label', 'Draft reply, held for approval'));
      card.appendChild(el('div', 'draft-card',
        'Thanks for asking. ' + quoted.join(' ') +
        ' Anything else, just reply here.'));
      answerBox.appendChild(card);
      var sourceCard = mount.querySelector('#' + rule.src);
      if (sourceCard) { sourceCard.classList.add('is-cited'); }
      approveButton.disabled = false;
      setChip(stateChip, 'is-draft', 'Draft ready');
      setChip(approveChip, 'is-approval', 'Approval required');
      setStatus('Answer drafted from the approved sources. It waits for owner approval.');
    }

    function answerUnknown(question) {
      clearAnswer();
      clearCitedHighlight();
      var card = el('div', 'cannot-card');
      card.appendChild(el('p', 'answer-q', 'Question: ' + question));
      card.appendChild(el('span', 'chip is-unknown', 'Cannot confirm'));
      card.appendChild(el('p', 'answer-a',
        'The approved sources do not cover this, so this demo cannot confirm an answer and will not guess.'));
      card.appendChild(el('p', 'stage-note',
        'In a real setup this question goes to the owner with a note, and the library only grows when the owner approves a new answer.'));
      answerBox.appendChild(card);
      approveButton.disabled = true;
      setChip(stateChip, 'is-unknown', 'Cannot confirm');
      setChip(approveChip, 'is-ready', 'Waiting for a draft');
      setStatus('No approved source covers that. Flagged for the owner instead of guessing. Nothing was sent.');
    }

    function ask(question, presetRuleId, button) {
      pressOnly(button || null);
      var rule = null;
      if (presetRuleId) {
        for (var r = 0; r < RULES.length; r += 1) {
          if (RULES[r].id === presetRuleId) { rule = RULES[r]; }
        }
      } else {
        rule = matchRule(question);
      }
      if (rule) {
        answerWithRule(question, rule);
      } else {
        answerUnknown(question);
      }
    }

    function resetBrain() {
      clearAnswer();
      clearCitedHighlight();
      pressOnly(null);
      if (askInput) { askInput.value = ''; }
      approveButton.disabled = true;
      setChip(stateChip, 'is-ready', 'Ready');
      setChip(approveChip, 'is-ready', 'Waiting for a draft');
      setStatus('Pick a question or type your own to begin.');
    }

    function approveForDemo() {
      approveButton.disabled = true;
      var note = el('p', 'pub-note',
        'Approved for demo by you, just now. In a real setup the reply could now go out.');
      answerBox.appendChild(note);
      setChip(stateChip, 'is-approved', 'Approved for demo');
      setChip(approveChip, 'is-approved', 'Approved for demo');
      setStatus('Approved for demo. Nothing was sent.');
      resetButton.focus({ preventScroll: true });
    }

    for (var p = 0; p < presetButtons.length; p += 1) {
      (function (button) {
        var key = button.getAttribute('data-question');
        button.addEventListener('click', function () {
          ask(button.textContent, PRESETS[key] || null, button);
        });
      }(presetButtons[p]));
    }
    if (askForm && askInput) {
      askForm.addEventListener('submit', function (event) {
        event.preventDefault();
        var question = askInput.value.replace(/\s+/g, ' ').trim();
        if (!question) {
          setStatus('Type a question first, or pick one of the presets.');
          askInput.focus();
          return;
        }
        ask(question, null, null);
      });
    }
    approveButton.addEventListener('click', approveForDemo);
    resetButton.addEventListener('click', resetBrain);

    mount.setAttribute('data-ready', '1');
    return true;
  }

  var mounts = document.querySelectorAll('[data-demo="business-brain"]');
  var allWired = mounts.length > 0;
  for (var m = 0; m < mounts.length; m += 1) {
    if (!initMount(mounts[m])) { allWired = false; }
  }

  /* Reveal last, and only when every mount wired: a script failure leaves
     the honest no-JS fallback visible instead of a dead demo. */
  var shell = document.getElementById('demo-shell');
  var fallback = document.getElementById('demo-fallback');
  if (shell && fallback && allWired) {
    shell.hidden = false;
    fallback.hidden = true;
  }
}());
