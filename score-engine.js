/* 5Cs score engine. Shared scoring for the scorecard family; each brand supplies its own config.
   Fixed here, not per brand: the order of the five Cs, equal weights, the three bands and the result structure.
   Scoring: 15 Yes/No questions, 3 per C. Per C = good answers / 3 (0, 33, 67 or 100).
   Total = good answers / 15 x 100, rounded to the nearest whole number (steps of about 6.67).
   Bands: Fragile 0-39, Exposed 40-69, Resilient 70-100. Reachable band changes: 33 -> 40 and 67 -> 73. */
(function (root) {
  var ENGINE_VERSION = '1.0.0';
  var ORDER = ['contain', 'command', 'close', 'confirm', 'control'];
  var BANDS = [
    { key: 'fragile', name: 'Fragile', min: 0, max: 39 },
    { key: 'exposed', name: 'Exposed', min: 40, max: 69 },
    { key: 'resilient', name: 'Resilient', min: 70, max: 100 }
  ];

  function bandFor(total) {
    for (var i = 0; i < BANDS.length; i++) if (total >= BANDS[i].min && total <= BANDS[i].max) return BANDS[i];
    return BANDS[0];
  }

  // Checks a brand config before use, so a broken config fails loudly instead of scoring wrongly.
  function validate(config) {
    var errors = [];
    if (!config || !config.questions) return ['No questions'];
    if (config.questions.length !== 15) errors.push('Expected 15 scored questions, found ' + config.questions.length);
    ORDER.forEach(function (c) {
      var n = config.questions.filter(function (q) { return q.c === c; }).length;
      if (n !== 3) errors.push(c + ' has ' + n + ' questions, expected 3');
    });
    (config.levelMap || []).forEach(function (l) {
      if (bandFor(l.min).key !== l.band || bandFor(l.max).key !== l.band) errors.push('Level ' + l.name + ' crosses a band');
    });
    return errors;
  }

  // answers: { questionId: true | false } where true means the good answer was given.
  function score(config, answers) {
    var perC = {}, good = 0, total, lowestFirst;
    ORDER.forEach(function (c) {
      var qs = config.questions.filter(function (q) { return q.c === c; });
      var g = qs.filter(function (q) { return answers[q.id] === q.goodAnswer; }).length;
      good += g;
      perC[c] = Math.round(g / qs.length * 100);
    });
    total = Math.round(good / config.questions.length * 100);
    // Ranked weakest first; a tie goes to the earlier C in the fixed order.
    lowestFirst = ORDER.slice().sort(function (a, b) { return perC[a] - perC[b] || ORDER.indexOf(a) - ORDER.indexOf(b); });
    var top = Math.max.apply(null, ORDER.map(function (c) { return perC[c]; }));
    var level = null;
    (config.levelMap || []).forEach(function (l) { if (total >= l.min && total <= l.max) level = l; });
    return {
      total: total,
      good: good,
      band: bandFor(total),
      perC: perC,
      weakest: lowestFirst[0],
      ranked: lowestFirst,
      strongest: ORDER.filter(function (c) { return perC[c] === top; }),
      level: level,
      versions: {
        brand: config.brand,
        engine_version: ENGINE_VERSION,
        config_version: config.configVersion,
        score_version: config.scoreVersion,
        assessmentObject: config.assessmentObject
      }
    };
  }

  root.FiveCs = { ENGINE_VERSION: ENGINE_VERSION, ORDER: ORDER, BANDS: BANDS, bandFor: bandFor, validate: validate, score: score };
})(typeof window !== 'undefined' ? window : globalThis);
