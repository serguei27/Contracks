/* Delivery Score page: runs the quiz, shows the free result, unlocks the detailed report after Netlify
   confirms the email form, and passes the score to the call form. Answers stay in this browser tab and
   never go in the address. Uses score-engine.js (FiveCs) and contracks.config.js. */
(function () {
  var cfg = window.DELIVERY_SCORE_CONFIG, E = window.FiveCs;
  var problems = E.validate(cfg);
  if (problems.length) { console.error('Delivery Score config:', problems); return; }

  var $ = function (id) { return document.getElementById(id); };
  var copy = cfg.resultCopy, C = cfg.cLabels, ORDER = E.ORDER;
  var STORE = 'cks_delivery_score', ANSWERS = 'cks_delivery_answers';
  var steps = [], cur = 0, result = null, situation = null, ctx = null;
  var track = function (ev) { if (window.cksTrack) cksTrack(ev, window.cksScoreProps ? cksScoreProps() : undefined); };
  window.cksScoreProps = function () {
    return result ? { brand: cfg.brand, band: result.band.name, weakest_c: C[result.weakest].name,
      engine_version: E.ENGINE_VERSION, config_version: cfg.configVersion } : { brand: cfg.brand };
  };

  function el(tag, attrs, html) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (html !== undefined) n.innerHTML = html;
    return n;
  }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  // ---- Build the steps: one per C, then "About your situation" ----
  var stepsBox = $('steps');
  ORDER.forEach(function (c, i) {
    var s = el('div', { class: 'step', 'data-kind': 'c' });
    s.appendChild(el('span', { class: 'ck' }, (i + 1) + ' of 5 &middot; ' + C[c].name + ' &middot; ' + C[c].short));
    s.appendChild(el('h2', {}, esc(C[c].title)));
    s.appendChild(el('p', { class: 'hint' }, 'Answer Yes only if you could show it today.'));
    cfg.questions.filter(function (q) { return q.c === c; }).forEach(function (q) {
      var b = el('div', { class: 'yn', 'data-q': q.id, role: 'radiogroup', 'aria-label': q.text });
      b.appendChild(el('p', {}, esc(q.text)));
      b.appendChild(el('div', { class: 'opts' },
        '<label><input type="radio" name="' + q.id + '" value="yes"> Yes</label><label><input type="radio" name="' + q.id + '" value="no"> No</label>'));
      s.appendChild(b);
    });
    stepsBox.appendChild(s);
  });
  (function () {
    var s = el('div', { class: 'step', 'data-kind': 'situation' });
    s.appendChild(el('span', { class: 'ck' }, 'About your situation'));
    s.appendChild(el('h2', {}, 'Five quick questions'));
    s.appendChild(el('p', { class: 'hint' }, 'Not scored. They help us read your result in context.'));
    cfg.situationQuestions.forEach(function (q) {
      var f = el('fieldset', { class: 'choice', 'data-q': q.id });
      f.appendChild(el('legend', {}, esc(q.text) + (q.type === 'pick2' ? ' <span class="opt">(Pick two)</span>' : '')));
      var type = q.type === 'pick2' ? 'checkbox' : 'radio';
      f.appendChild(el('div', { class: 'opts' }, q.options.map(function (o) {
        return '<label><input type="' + type + '" name="' + q.id + '" value="' + esc(o) + '"> ' + esc(o) + '</label>';
      }).join('')));
      if (q.other) f.appendChild(el('div', { class: 'field', hidden: '', 'data-other-for': q.id },
        '<label for="' + q.id + 'o">Please say what <span class="opt">(Optional)</span></label><input id="' + q.id + 'o" name="' + q.id + '_other" maxlength="200">'));
      s.appendChild(f);
    });
    var oq = cfg.openQuestion;
    s.appendChild(el('div', { class: 'field', style: 'margin-top:14px' },
      '<label for="' + oq.id + '">' + esc(oq.text) + ' <span class="opt">(Optional)</span></label><textarea id="' + oq.id + '" name="' + oq.id + '" maxlength="' + oq.max + '"></textarea>'));
    stepsBox.appendChild(s);
  })();
  steps = [].slice.call(stepsBox.querySelectorAll('.step'));
  var form = $('quizForm');

  // Q17: exactly two; Q18: show the text box for Other.
  form.addEventListener('change', function (e) {
    if (e.target.name === 'q17') {
      var on = form.querySelectorAll('input[name="q17"]:checked');
      if (on.length > 2) e.target.checked = false;
    }
    if (e.target.name === 'q18') {
      var box = form.querySelector('[data-other-for="q18"]');
      if (box) box.hidden = e.target.value !== 'Other';
    }
    saveAnswers();
    updateProgress();
  });

  function saveAnswers() {
    var a = {};
    [].forEach.call(form.elements, function (f) {
      if (!f.name) return;
      if ((f.type === 'radio' || f.type === 'checkbox')) { if (f.checked) a[f.name] = (a[f.name] ? a[f.name] + '|' : '') + f.value; }
      else a[f.name] = f.value;
    });
    try { sessionStorage.setItem(ANSWERS, JSON.stringify(a)); } catch (e) {}
  }

  // ---- Progress and navigation ----
  var prog = $('prog');
  steps.forEach(function () { prog.appendChild(el('span')); });
  function answeredCount() { return cfg.questions.filter(function (q) { return form.querySelector('input[name="' + q.id + '"]:checked'); }).length; }
  function updateProgress() {
    [].forEach.call(prog.children, function (s, i) { s.classList.toggle('on', i <= cur); });
    $('progLabel').textContent = cur < 5 ? 'Step ' + (cur + 1) + ' of 6' : 'Step 6 of 6';
    $('progCount').textContent = cur < 5 ? answeredCount() + ' of 15 answered' : 'All 15 answered';
  }
  function render() {
    steps.forEach(function (s, i) { s.classList.toggle('active', i === cur); });
    $('backBtn').style.visibility = cur === 0 ? 'hidden' : 'visible';
    $('nextBtn').innerHTML = cur === steps.length - 1 ? 'See my Delivery Score &rarr;' : 'Continue &rarr;';
    $('quizErr').textContent = '';
    updateProgress();
  }
  function missing(step) {
    var miss = [];
    [].forEach.call(step.querySelectorAll('.yn'), function (b) {
      var ok = b.querySelector('input:checked'); b.classList.toggle('miss', !ok); if (!ok) miss.push(b);
    });
    [].forEach.call(step.querySelectorAll('.choice'), function (f) {
      var n = f.querySelectorAll('input:checked').length, need = f.getAttribute('data-q') === 'q17' ? 2 : 1;
      var bad = n !== need; f.classList.toggle('miss', bad); if (bad) miss.push(f);
    });
    return miss;
  }
  function start() {
    $('intro').hidden = true; $('quiz').hidden = false; cur = 0; render();
    $('quiz').scrollIntoView({ behavior: 'smooth' });
    track('score_started');
  }
  $('startBtn').addEventListener('click', start);
  $('startBtn2').addEventListener('click', start);
  $('backBtn').addEventListener('click', function () { if (cur > 0) { cur--; render(); $('quiz').scrollIntoView({ behavior: 'smooth' }); } });
  $('nextBtn').addEventListener('click', function () {
    var miss = missing(steps[cur]);
    if (miss.length) {
      var q17 = miss.some(function (m) { return m.getAttribute('data-q') === 'q17'; });
      $('quizErr').textContent = q17 && miss.length === 1 ? 'Please pick exactly two challenges.' :
        'Please answer ' + (miss.length > 1 ? 'the ' + miss.length + ' highlighted questions.' : 'the highlighted question.');
      miss[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (cur < steps.length - 1) { cur++; render(); $('quiz').scrollIntoView({ behavior: 'smooth' }); } else finish();
  });

  // ---- Score ----
  function val(name) { var f = form.querySelector('input[name="' + name + '"]:checked'); return f ? f.value : ''; }
  function finish() {
    var answers = {};
    cfg.questions.forEach(function (q) { answers[q.id] = val(q.id) === 'yes'; });
    result = E.score(cfg, answers);
    situation = {
      q16: val('q16'),
      q17: [].map.call(form.querySelectorAll('input[name="q17"]:checked'), function (f) { return f.value; }).join(' | '),
      q18: val('q18'),
      q18_other: val('q18') === 'Other' ? form.elements.q18_other.value.trim() : '',
      q19: val('q19'),
      q20: form.elements.q20.value.trim()
    };
    var r = cfg.routing;
    var fit = r.bestFitValues.indexOf(situation.q16) > -1 && situation.q19 === r.bestFitSolution;
    var flags = [];
    if (r.urgentChallenges.some(function (u) { return situation.q17.indexOf(u) > -1; })) flags.push('Urgent challenge');
    if (situation.q20) flags.push('Open box answered');
    var tags = (fit ? '[BEST FIT] ' : '') + (flags.length ? '[REVIEW] ' : '');
    ctx = {
      brand: cfg.brand, score_name: cfg.scoreName, score: result.total, band: result.band.name,
      level: 'Level ' + result.level.n + ' ' + result.level.name,
      contain: result.perC.contain, command: result.perC.command, close: result.perC.close, confirm: result.perC.confirm, control: result.perC.control,
      weakest_c: C[result.weakest].name,
      q16: situation.q16, q17: situation.q17, q18: situation.q18, q18_other: situation.q18_other, q19: situation.q19, q20: situation.q20,
      fit: fit ? 'BEST FIT' : 'standard', review_flag: flags.length ? flags.join('; ') : 'none',
      engine_version: E.ENGINE_VERSION, config_version: cfg.configVersion, score_version: cfg.scoreVersion,
      subject: tags + 'Contracks Global: call request after Delivery Score ' + result.total + ' (' + result.band.name + ')'
    };
    try { sessionStorage.setItem(STORE, JSON.stringify(ctx)); } catch (e) {}

    var uf = $('unlockForm');
    Object.keys(ctx).forEach(function (k) { if (uf.elements[k] && k !== 'subject') uf.elements[k].value = ctx[k]; });
    uf.elements.assessment_object.value = cfg.assessmentObject;
    uf.elements.answers.value = cfg.questions.map(function (q) { return q.id + ': ' + (answers[q.id] ? 'Yes' : 'No'); }).join('; ');
    uf.elements.subject.value = tags + 'Contracks Global: Delivery Score report, ' + result.total + ' (' + result.band.name + ')';
    if (window.fillContactContext) window.fillContactContext(ctx);

    showResults();
    track('score_completed');
  }

  // ---- Free result ----
  function railHTML() {
    return ORDER.map(function (c) {
      return '<div class="' + (c === result.weakest ? 'weak' : '') + '"><div class="col"><i style="height:' + result.perC[c] + '%"></i></div><b>' + C[c].name + '</b><span>' + result.perC[c] + '%</span></div>';
    }).join('');
  }
  function showResults() {
    var b = result.band.key;
    $('rTotal').textContent = result.total;
    $('rBand').textContent = result.band.name;
    $('rLevel').textContent = 'Level ' + result.level.n + ' · ' + result.level.name + ' on The Delivery Control Ladder™';
    $('rMark').style.left = result.total + '%';
    [].forEach.call(document.querySelectorAll('.bandscale .names span'), function (s) { s.classList.toggle('on', s.getAttribute('data-band') === b); });
    $('rRail').innerHTML = railHTML();
    $('rWeak').innerHTML = '<b>Weakest control: ' + C[result.weakest].name + ' (' + esc(C[result.weakest].short.toLowerCase()) + ').</b> ' + esc(copy.consequence[result.weakest]);
    $('rInterp').textContent = copy.interpretation[b] + ' ' + result.level.meaning;
    $('rCtaLine').textContent = copy.cta[b];
    $('quiz').hidden = true; $('results').hidden = false; $('unlock').hidden = false;
    $('results').scrollIntoView({ behavior: 'smooth' });
    track('results_viewed');
  }

  // ---- Unlock: only after Netlify confirms ----
  var sendingUnlock = false;
  $('unlockForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target, st = $('unlockStatus'), btn = $('unlockBtn');
    if (sendingUnlock) return;
    if (!f.checkValidity()) { f.reportValidity(); return; }
    sendingUnlock = true; btn.disabled = true; btn.textContent = 'Unlocking…'; st.className = 'form-status'; st.textContent = '';
    fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(new FormData(f)).toString() })
      .then(function (res) {
        if (!res.ok) throw new Error('Status ' + res.status);
        track('email_submitted');
        st.className = 'form-status ok'; st.textContent = 'Thank you. Your report is below.';
        [].forEach.call(f.querySelectorAll('input,button'), function (x) { x.disabled = true; });
        btn.textContent = 'Report unlocked';
        showReport(f.elements.name.value.trim());
      })
      .catch(function () {
        sendingUnlock = false; btn.disabled = false; btn.innerHTML = 'Try again &rarr;';
        st.className = 'form-status err';
        st.textContent = 'We couldn’t unlock your report: your details didn’t reach us. Your answers are kept, so please press Try again.';
        track('email_submit_failed');
      });
  });

  // ---- Detailed report ----
  function firstNoAction(c) {
    var q = cfg.questions.filter(function (q) { return q.c === c && !(val(q.id) === 'yes'); })[0];
    return q ? copy.actions[q.id] : copy.keepAction[c];
  }
  function cReading(c) {
    var v = result.perC[c];
    if (v === 100) return 'Holding: all three answers were Yes.';
    if (v >= 67) return 'Mostly in place. ' + copy.exposure[c];
    return copy.exposure[c] + ' ' + copy.consequence[c];
  }
  function showReport(name) {
    var b = result.band.key, d = new Date();
    var date = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    $('pMeta').textContent = (name ? 'Prepared for ' + name + ' · ' : '') + cfg.brand + ' · ' + cfg.scoreName +
      ' · Assessed: your programme’s delivery controls · ' + date +
      ' · Engine ' + E.ENGINE_VERSION + ', config ' + cfg.configVersion + ', score ' + cfg.scoreVersion;
    $('pTotal').textContent = result.total;
    $('pBand').textContent = result.band.name;
    $('pLevel').textContent = 'Level ' + result.level.n + ' · ' + result.level.name;
    $('pLevelMeaning').textContent = result.level.meaning;
    $('pCs').innerHTML = ORDER.map(function (c) {
      return '<div class="cline"><div><b>' + C[c].name + '</b><br><span class="opt">' + esc(C[c].short) + ' · ' + result.perC[c] + '%</span><div class="bar"><i style="width:' + result.perC[c] + '%"></i></div></div><p>' + esc(cReading(c)) + '</p></div>';
    }).join('');
    var lowest = Math.min.apply(null, ORDER.map(function (c) { return result.perC[c]; }));
    var weakList = ORDER.filter(function (c) { return result.perC[c] === lowest; });
    $('pSW').innerHTML = '<b>Strongest:</b> ' + result.strongest.map(function (c) { return C[c].name; }).join(', ') +
      ' (' + result.perC[result.strongest[0]] + '%). <b>Weakest:</b> ' + weakList.map(function (c) { return C[c].name; }).join(', ') + ' (' + lowest + '%).';
    $('pExposure').textContent = copy.exposure[result.weakest];
    $('pConsequence').textContent = copy.consequence[result.weakest];
    $('pActions').innerHTML = result.ranked.slice(0, 3).map(function (c) { return '<li><b>' + C[c].name + ':</b> ' + esc(firstNoAction(c)) + '</li>'; }).join('');
    $('pChecklist').innerHTML = ORDER.map(function (c) { return '<li><b>' + C[c].name + ':</b> ' + esc(copy.checklist[c]) + '</li>'; }).join('');
    var self = '<div><b>Improve it yourself (free)</b><p>' + esc(copy.selfHelp) + '</p><a href="/quiz" class="btn btn-line no-print">Retake the Delivery Score</a></div>';
    var support = '<div class="' + (ctx.fit === 'BEST FIT' ? 'lead-opt' : '') + '"><b>Expert support</b><p>' + esc(copy.cta[b]) + '</p><a href="#call" class="btn btn-gold no-print" data-open-call>' + esc(cfg.cta.label) + '</a><p class="opt" style="margin-top:8px">' + esc(cfg.cta.subline) + '</p></div>';
    $('pOptions').innerHTML = ctx.fit === 'BEST FIT' ? support + self : self + support;
    $('pPaid').innerHTML = esc(copy.paidFirstStep) + ' <a href="reset.html">About the Reset</a>';
    $('report').hidden = false;
    $('report').scrollIntoView({ behavior: 'smooth' });
    track('report_unlocked');
  }
  $('pdfBtn').addEventListener('click', function () { track('report_downloaded'); window.print(); });

  // ---- Call: the standard contact form on this page ----
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-open-call]');
    if (!a) return;
    e.preventDefault();
    $('call').hidden = false;
    $('call').scrollIntoView({ behavior: 'smooth' });
    var first = $('call').querySelector('input:not([type=hidden])'); if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, 400);
    track('cta_clicked');
  });

  render();
})();
