/* Website and Operations Manager demo engine. Draft, preview, approval and
   publish are separate browser-local states over sample data for a fictional
   cafe. Publish only rewrites the preview on this page.
   No network calls, no storage, nothing ever sends.
   Visitor-typed drafts are rendered with textContent only. */
(function () {
  'use strict';

  var BASELINE = {
    hours: 'Sunday: 8:00 am to 2:00 pm',
    event: 'Friday: live acoustic set, 6 to 8 pm',
    note: 'Patio open, weather permitting'
  };

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) { node.className = className; }
    if (text) { node.textContent = text; }
    return node;
  }

  function initMount(mount) {
    var itemButtons = mount.querySelectorAll('[data-item]');
    var publishedBox = mount.querySelector('[data-role="published"]');
    var draftInput = mount.querySelector('[data-role="draft-input"]');
    var summaryBox = mount.querySelector('[data-role="summary"]');
    var preview = mount.querySelector('[data-role="preview"]');
    var pubBadge = mount.querySelector('[data-role="pub-badge"]');
    var pubNote = mount.querySelector('[data-role="pub-note"]');
    var approveButton = mount.querySelector('[data-role="approve"]');
    var publishButton = mount.querySelector('[data-role="publish"]');
    var resetButton = mount.querySelector('[data-role="reset"]');
    var statusLine = mount.querySelector('[data-role="status"]');
    var stateChip = mount.querySelector('[data-role="state-chip"]');
    var approveChip = mount.querySelector('[data-role="approve-chip"]');
    if (!publishedBox || !draftInput || !summaryBox || !preview ||
        !approveButton || !publishButton || !resetButton || !statusLine ||
        !stateChip || !approveChip) {
      return false;
    }

    var published = {};
    var selected = null;
    var approved = false;

    function setChip(chip, stateClass, label) {
      chip.className = 'chip ' + stateClass;
      chip.textContent = label;
    }

    function setStatus(text) {
      statusLine.textContent = text;
    }

    function setText(node, text) {
      node.textContent = text;
    }

    function previewLine(key) {
      return preview.querySelector('[data-line="' + key + '"]');
    }

    function renderPreview(draftValue) {
      for (var key in BASELINE) {
        if (Object.prototype.hasOwnProperty.call(BASELINE, key)) {
          var line = previewLine(key);
          if (!line) { continue; }
          if (selected === key && typeof draftValue === 'string') {
            setText(line, draftValue);
          } else {
            setText(line, published[key]);
          }
        }
      }
    }

    function renderSummary(before, after) {
      while (summaryBox.firstChild) {
        summaryBox.removeChild(summaryBox.firstChild);
      }
      summaryBox.appendChild(el('span', 'mgr-label', 'Was: ' + before));
      summaryBox.appendChild(document.createElement('br'));
      summaryBox.appendChild(el('span', '', 'Now: ' + after));
    }

    function currentDraft() {
      return draftInput.value.replace(/\s+/g, ' ').trim();
    }

    function selectItem(key, button) {
      selected = key;
      approved = false;
      for (var b = 0; b < itemButtons.length; b += 1) {
        itemButtons[b].setAttribute('aria-pressed',
          itemButtons[b] === button ? 'true' : 'false');
      }
      setText(publishedBox, published[key]);
      draftInput.disabled = false;
      draftInput.value = published[key];
      setText(summaryBox, 'No change yet.');
      approveButton.disabled = true;
      publishButton.disabled = true;
      if (pubNote) { pubNote.hidden = true; }
      if (pubBadge) { setText(pubBadge, 'Preview'); }
      renderPreview(null);
      setChip(stateChip, 'is-ready', 'Published value loaded');
      setChip(approveChip, 'is-ready', 'Waiting for a draft');
      setStatus('Published value loaded. Edit the draft to make a change.');
      draftInput.focus({ preventScroll: true });
    }

    function onDraftInput() {
      if (!selected) { return; }
      approved = false;
      publishButton.disabled = true;
      var draft = currentDraft();
      renderPreview(draftInput.value);
      if (!draft) {
        approveButton.disabled = true;
        setText(summaryBox, 'The draft is empty. Type the new value.');
        setChip(stateChip, 'is-draft', 'Draft in progress');
        setStatus('The draft is empty, so there is nothing to approve yet.');
        return;
      }
      if (draft === published[selected]) {
        approveButton.disabled = true;
        setText(summaryBox, 'No change yet.');
        setChip(stateChip, 'is-ready', 'Published value loaded');
        setChip(approveChip, 'is-ready', 'Waiting for a draft');
        setStatus('The draft matches the published value. Edit it to make a change.');
        return;
      }
      approveButton.disabled = false;
      renderSummary(published[selected], draft);
      setChip(stateChip, 'is-draft', 'Draft in progress');
      setChip(approveChip, 'is-approval', 'Approval required');
      setStatus('Draft differs from the published value. The preview shows the draft. Owner approval comes next.');
    }

    function approveForDemo() {
      if (!selected) { return; }
      var draft = currentDraft();
      if (!draft || draft === published[selected]) { return; }
      approved = true;
      approveButton.disabled = true;
      publishButton.disabled = false;
      setChip(stateChip, 'is-approved', 'Approved for demo');
      setChip(approveChip, 'is-approved', 'Approved for demo');
      setStatus('Change approved for demo. Publish when ready. Nothing leaves this page.');
      publishButton.focus({ preventScroll: true });
    }

    function publishDemo() {
      if (!selected || !approved) { return; }
      var draft = currentDraft();
      var before = published[selected];
      published[selected] = draft;
      renderPreview(null);
      setText(publishedBox, published[selected]);
      renderSummary(before, draft);
      summaryBox.appendChild(document.createElement('br'));
      summaryBox.appendChild(el('span', 'mgr-label', 'Published (demo) just now'));
      publishButton.disabled = true;
      if (pubBadge) { setText(pubBadge, 'Published (demo)'); }
      if (pubNote) { pubNote.hidden = false; }
      setChip(stateChip, 'is-published', 'Published (demo)');
      setChip(approveChip, 'is-published', 'Published (demo)');
      setStatus('Published (demo). The preview in your browser updated. No real website changed.');
      resetButton.focus({ preventScroll: true });
    }

    function resetManager() {
      for (var key in BASELINE) {
        if (Object.prototype.hasOwnProperty.call(BASELINE, key)) {
          published[key] = BASELINE[key];
        }
      }
      selected = null;
      approved = false;
      for (var b = 0; b < itemButtons.length; b += 1) {
        itemButtons[b].setAttribute('aria-pressed', 'false');
      }
      setText(publishedBox, 'Pick an item to load its published value.');
      draftInput.value = '';
      draftInput.disabled = true;
      setText(summaryBox, 'No change yet.');
      approveButton.disabled = true;
      publishButton.disabled = true;
      if (pubBadge) { setText(pubBadge, 'Preview'); }
      if (pubNote) { pubNote.hidden = true; }
      selected = null;
      renderPreview(null);
      setChip(stateChip, 'is-ready', 'Ready');
      setChip(approveChip, 'is-ready', 'Waiting for a draft');
      setStatus('Pick something on the sample site to edit.');
    }

    for (var i = 0; i < itemButtons.length; i += 1) {
      (function (button) {
        var key = button.getAttribute('data-item');
        button.addEventListener('click', function () {
          selectItem(key, button);
        });
      }(itemButtons[i]));
    }
    draftInput.addEventListener('input', onDraftInput);
    approveButton.addEventListener('click', approveForDemo);
    publishButton.addEventListener('click', publishDemo);
    resetButton.addEventListener('click', resetManager);

    resetManager();
    mount.setAttribute('data-ready', '1');
    return true;
  }

  var mounts = document.querySelectorAll('[data-demo="website-manager"]');
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
