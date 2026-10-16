/* ClearPath contact brief. Builds a reviewable email draft in the browser
   and hands it to the visitor's own email app through a mailto: link.
   There is no server, no fetch, no storage. Nothing is sent by this site.
   The pure functions are exported for Node tests; the DOM wiring only runs
   when a document with the contact form exists. */
(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module && module.exports) {
    module.exports = api;
  } else {
    root.ClearPathContact = api;
  }
  if (typeof document !== 'undefined' && document.getElementById('brief-form')) {
    api.init(document);
  }
}(this, function () {
  'use strict';

  var EMAIL = 'JWhalen@ClearPathWV.com';
  var MIN_NEED = 20;
  var MAX_NEED = 1500;

  var TOPICS = {
    website: {
      label: 'A website quote',
      subject: 'Website quote request',
      opening: 'I would like a quote for a website.'
    },
    tools: {
      label: 'A tool, portal or automation',
      subject: 'Tools and automation inquiry',
      opening: 'I have a workflow that needs a better tool or automation.'
    },
    clarity: {
      label: 'A Clarity Session',
      subject: 'Clarity Session inquiry',
      opening: 'I am interested in a Clarity Session to work out the right first step.'
    },
    support: {
      label: 'Ongoing support for what I already use',
      subject: 'Ongoing support inquiry',
      opening: 'I would like to discuss ongoing support for systems I already use.'
    },
    unsure: {
      label: 'Not sure yet',
      subject: 'Something needs to work better',
      opening: 'I am not sure which path fits yet. Here is what is going on.'
    }
  };

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function clean(value) {
    return String(value == null ? '' : value).replace(/\s+/g, ' ').trim();
  }

  function cleanBlock(value) {
    return String(value == null ? '' : value).replace(/\r\n?/g, '\n')
      .replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  }

  function validate(fields) {
    var f = {
      name: clean(fields.name),
      email: clean(fields.email),
      topic: clean(fields.topic),
      need: cleanBlock(fields.need),
      current: clean(fields.current)
    };
    var errors = {};
    if (!f.name) { errors.name = 'Add your name so I know who I am replying to.'; }
    else if (f.name.length > 80) { errors.name = 'Keep your name under 80 characters.'; }
    if (!f.email) { errors.email = 'Add the email address you want the reply sent to.'; }
    else if (!EMAIL_RE.test(f.email) || f.email.length > 120) {
      errors.email = 'That does not look like a complete email address, for example name@example.com.';
    }
    if (!TOPICS[f.topic]) { errors.topic = 'Pick the closest starting point. "Not sure yet" is fine.'; }
    if (!f.need) { errors.need = 'Describe what needs to work better. A few sentences is plenty.'; }
    else if (f.need.length < MIN_NEED) {
      errors.need = 'Add a little more detail, at least ' + MIN_NEED + ' characters, so the reply can be useful.';
    } else if (f.need.length > MAX_NEED) {
      errors.need = 'Please keep this under ' + MAX_NEED + ' characters. Details can follow by email.';
    }
    if (f.current.length > 200) { errors.current = 'Keep this to a short line, under 200 characters.'; }
    return { ok: Object.keys(errors).length === 0, errors: errors, fields: f };
  }

  function buildDraft(fields) {
    var f = validate(fields).fields;
    var topic = TOPICS[f.topic] || TOPICS.unsure;
    var lines = [
      'Hi Justin,',
      '',
      topic.opening,
      '',
      'What needs to work better:',
      f.need,
      ''
    ];
    if (f.current) {
      lines.push('Current website or system: ' + f.current, '');
    }
    lines.push('Best reply address: ' + f.email, '', f.name);
    return {
      to: EMAIL,
      subject: topic.subject + ' from ' + f.name,
      body: lines.join('\n')
    };
  }

  function buildMailto(draft) {
    return 'mailto:' + draft.to +
      '?subject=' + encodeURIComponent(draft.subject) +
      '&body=' + encodeURIComponent(draft.body);
  }

  function topicFromQuery(search) {
    var match = /[?&]topic=([a-z]+)/.exec(search || '');
    return match && TOPICS[match[1]] ? match[1] : '';
  }

  function init(doc) {
    var form = doc.getElementById('brief-form');
    var reviewButton = doc.getElementById('review-draft');
    var briefPanel = doc.getElementById('brief-panel');
    var draftPanel = doc.getElementById('draft-panel');
    var resultPanel = doc.getElementById('result-panel');
    var summary = doc.getElementById('error-summary');
    var summaryList = doc.getElementById('error-list');
    var subjectOut = doc.getElementById('draft-subject');
    var bodyOut = doc.getElementById('draft-body');
    var mailLink = doc.getElementById('open-mail');
    var copyButton = doc.getElementById('copy-draft');
    var editButton = doc.getElementById('edit-brief');
    var copyNote = doc.getElementById('copy-note');
    var count = doc.getElementById('need-count');
    var inputs = {
      name: doc.getElementById('f-name'),
      email: doc.getElementById('f-email'),
      topic: doc.getElementById('f-topic'),
      need: doc.getElementById('f-need'),
      current: doc.getElementById('f-current')
    };
    if (!form || !reviewButton || !briefPanel || !draftPanel || !resultPanel ||
        !summary || !summaryList || !subjectOut || !bodyOut || !mailLink ||
        !editButton || !inputs.name || !inputs.email || !inputs.topic || !inputs.need) {
      return false;
    }

    var preset = topicFromQuery(doc.location ? doc.location.search : '');
    if (preset) { inputs.topic.value = preset; }

    function read() {
      return {
        name: inputs.name.value,
        email: inputs.email.value,
        topic: inputs.topic.value,
        need: inputs.need.value,
        current: inputs.current ? inputs.current.value : ''
      };
    }

    function errorNode(key) {
      return doc.getElementById('err-' + key);
    }

    function showErrors(errors) {
      var keys = ['name', 'email', 'topic', 'need', 'current'];
      while (summaryList.firstChild) { summaryList.removeChild(summaryList.firstChild); }
      var any = false;
      for (var k = 0; k < keys.length; k += 1) {
        var key = keys[k];
        var node = errorNode(key);
        var input = inputs[key];
        var message = errors[key] || '';
        if (node) { node.textContent = message; }
        if (input) {
          if (message) { input.setAttribute('aria-invalid', 'true'); }
          else { input.removeAttribute('aria-invalid'); }
        }
        if (message) {
          any = true;
          var li = doc.createElement('li');
          var a = doc.createElement('a');
          a.setAttribute('href', '#' + (input ? input.id : ''));
          a.textContent = message;
          li.appendChild(a);
          summaryList.appendChild(li);
        }
      }
      summary.hidden = !any;
      if (any) { summary.focus(); }
    }

    function showPanel(which) {
      briefPanel.hidden = which !== 'brief';
      draftPanel.hidden = which !== 'draft';
      resultPanel.hidden = which !== 'result';
      form.setAttribute('data-state', which);
    }

    function updateCount() {
      if (!count) { return; }
      count.textContent = inputs.need.value.length + ' / ' + MAX_NEED;
    }

    form.addEventListener('submit', function (event) {
      /* Always first: no GET, nothing typed ever reaches the URL. */
      event.preventDefault();
      reviewButton.disabled = true;
      reviewButton.textContent = 'Preparing your draft';
      var result = validate(read());
      showErrors(result.errors);
      reviewButton.disabled = false;
      reviewButton.textContent = 'Review email draft';
      if (!result.ok) { return; }
      var draft = buildDraft(result.fields);
      subjectOut.textContent = draft.subject;
      bodyOut.textContent = draft.body;
      mailLink.setAttribute('href', buildMailto(draft));
      if (copyNote) { copyNote.textContent = ''; }
      showPanel('draft');
      var heading = draftPanel.querySelector('h2');
      if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus(); }
    });

    inputs.need.addEventListener('input', updateCount);
    updateCount();

    var keys = ['name', 'email', 'topic', 'need', 'current'];
    for (var k = 0; k < keys.length; k += 1) {
      (function (key) {
        var input = inputs[key];
        if (!input) { return; }
        input.addEventListener('input', function () {
          if (input.getAttribute('aria-invalid') === 'true') {
            var check = validate(read());
            var node = errorNode(key);
            if (!check.errors[key]) {
              input.removeAttribute('aria-invalid');
              if (node) { node.textContent = ''; }
            }
          }
        });
      }(keys[k]));
    }

    editButton.addEventListener('click', function () {
      showPanel('brief');
      inputs.need.focus();
    });

    var backButton = doc.getElementById('back-to-draft');
    if (backButton) {
      backButton.addEventListener('click', function () {
        showPanel('draft');
        mailLink.focus();
      });
    }

    mailLink.addEventListener('click', function () {
      /* The browser hands the draft to the visitor's email app. The page
         only reports that a draft exists; it cannot know whether it was
         sent, and it never claims that it was. */
      showPanel('result');
      var heading = resultPanel.querySelector('h2');
      if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus(); }
    });

    if (copyButton) {
      copyButton.addEventListener('click', function () {
        var text = 'To: ' + EMAIL + '\nSubject: ' + subjectOut.textContent + '\n\n' + bodyOut.textContent;
        var done = function () { if (copyNote) { copyNote.textContent = 'Copied. Paste it into any email to ' + EMAIL + '.'; } };
        var fail = function () { if (copyNote) { copyNote.textContent = 'Could not copy automatically. Select the draft text and copy it by hand.'; } };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done, fail);
        } else { fail(); }
      });
    }

    /* Last on purpose: the button ships disabled and is enabled only after
       every handler above is bound, so a script failure can never submit. */
    reviewButton.disabled = false;
    form.setAttribute('data-ready', '1');
    return true;
  }

  return {
    EMAIL: EMAIL,
    TOPICS: TOPICS,
    MIN_NEED: MIN_NEED,
    MAX_NEED: MAX_NEED,
    validate: validate,
    buildDraft: buildDraft,
    buildMailto: buildMailto,
    topicFromQuery: topicFromQuery,
    init: init
  };
}));
