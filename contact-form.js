/* Standard contact form (scorecard family v3.5). Enhances every form[data-contact-form]:
   - shows only the contact field for the chosen method (WhatsApp by default) and requires it
   - fills the hidden plan field from ?plan= and the Delivery Score context from this browser session
   - sends to Netlify Forms and shows success only after Netlify accepts it; blocks double sending
   Without JavaScript the form still posts to Netlify and lands on thanks.html. */
(function () {
  var METHOD_FIELDS = { whatsapp: 'whatsapp', phone: 'phone', linkedin: 'linkedin', email: null };
  var CONTEXT_KEY = 'cks_delivery_score';

  function readContext() {
    try { return JSON.parse(sessionStorage.getItem(CONTEXT_KEY) || 'null'); } catch (e) { return null; }
  }

  function setup(form) {
    var status = form.querySelector('[data-form-status]');
    var button = form.querySelector('button[type="submit"]');
    var buttonText = button ? button.textContent : '';
    var sending = false;

    function showMethod() {
      var chosen = (form.querySelector('input[name="contact_method"]:checked') || {}).value || 'whatsapp';
      Object.keys(METHOD_FIELDS).forEach(function (m) {
        var name = METHOD_FIELDS[m];
        if (!name) return;
        var wrap = form.querySelector('[data-method-field="' + m + '"]'), input = form.elements[name];
        if (!wrap || !input) return;
        var on = m === chosen;
        wrap.hidden = !on;
        input.required = on;
        input.disabled = !on;
      });
    }
    [].forEach.call(form.querySelectorAll('input[name="contact_method"]'), function (r) { r.addEventListener('change', showMethod); });
    showMethod();

    var plan = new URLSearchParams(location.search).get('plan');
    if (plan && form.elements.plan) form.elements.plan.value = plan.replace(/[^a-z0-9-]/gi, '').slice(0, 40);

    // Context comes from the score taken in this browser session, never from the address.
    window.fillContactContext = function (ctx) {
      ctx = ctx || readContext();
      var label = form.querySelector('[data-message-label]');
      if (!ctx) { if (label) label.innerHTML = label.getAttribute('data-no-score'); return; }
      Object.keys(ctx).forEach(function (k) { if (form.elements[k] && form.elements[k].type === 'hidden') form.elements[k].value = ctx[k]; });
      if (form.elements.source) form.elements.source.value = 'Delivery Score';
      if (label) label.innerHTML = label.getAttribute('data-with-score');
    };
    window.fillContactContext();

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (sending) return;
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var tel = ['whatsapp', 'phone'].map(function (n) { return form.elements[n]; }).filter(function (el) { return el && !el.disabled; })[0];
      if (tel && (!/^[+0-9 ().\-]+$/.test(tel.value) || tel.value.replace(/\D/g, '').length < 7)) {
        tel.setCustomValidity('Please enter a number with its country code, e.g. +44 7700 900123');
        form.reportValidity();
        tel.setCustomValidity('');
        return;
      }
      if (form.elements.linkedin && !form.elements.linkedin.disabled && !/linkedin\.com\//i.test(form.elements.linkedin.value)) {
        form.elements.linkedin.setCustomValidity('Please enter your LinkedIn profile address, e.g. linkedin.com/in/yourname');
        form.reportValidity();
        form.elements.linkedin.setCustomValidity('');
        return;
      }
      sending = true;
      if (button) { button.disabled = true; button.textContent = 'Sending…'; }
      if (status) { status.className = 'form-status'; status.textContent = ''; }
      var body = new URLSearchParams(new FormData(form)).toString();
      fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body })
        .then(function (res) {
          if (!res.ok) throw new Error('Status ' + res.status);
          form.classList.add('is-sent');
          if (status) { status.className = 'form-status ok'; status.textContent = form.getAttribute('data-success'); }
          [].forEach.call(form.querySelectorAll('input,textarea,button,select'), function (el) { el.disabled = true; });
          if (window.cksTrack) cksTrack('call_booked', window.cksScoreProps ? cksScoreProps() : undefined);
        })
        .catch(function () {
          sending = false;
          if (button) { button.disabled = false; button.textContent = buttonText; }
          if (status) { status.className = 'form-status err'; status.textContent = 'Your message didn’t reach us. Please check your connection and press the button again, or email hello@contracks.global.'; }
        });
    });

    // Keeps the counter honest on the two free-text limits.
    [].forEach.call(form.querySelectorAll('textarea[maxlength],input[maxlength][data-count]'), function (el) {
      var out = form.querySelector('[data-count-for="' + el.name + '"]');
      if (!out) return;
      var update = function () { out.textContent = el.value.length + ' / ' + el.maxLength; };
      el.addEventListener('input', update); update();
    });
  }

  function ready() { [].forEach.call(document.querySelectorAll('form[data-contact-form]'), setup); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready); else ready();
})();
