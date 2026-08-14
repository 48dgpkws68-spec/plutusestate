/* PLUTUS ESTATE · compare page · 30-second profile quiz */
(function () {
  'use strict';

  var quiz = document.getElementById('quiz');
  var verdict = document.getElementById('quizVerdict');
  if (!quiz || !verdict) return;

  var verdictText = verdict.querySelector('.v');
  var chips = quiz.querySelectorAll('.preset[data-q]');

  var COPY = {
    incomplete: 'Answer the five questions above and your verdict appears here.',
    dubai: 'Profile: Dubai first. Start with a high-yield apartment, keep Marbella for the legacy phase. Book the consultation below and your shortlist follows within 72 hours.',
    marbella: 'Profile: Marbella first. Anchor the capital on the coast, add Dubai yield when income becomes the priority. Book the consultation below and we bring the right files.',
    both: 'Profile: a two-market portfolio. Let Dubai pay the income while Marbella compounds the legacy. Book the consultation below and we map the order.'
  };

  function score() {
    var dubai = 0, marbella = 0, answered = 0;
    var seen = {};
    quiz.querySelectorAll('.preset.active[data-q]').forEach(function (chip) {
      var q = chip.getAttribute('data-q');
      if (seen[q]) return;
      seen[q] = true;
      answered++;
      var side = chip.getAttribute('data-side');
      if (side === 'dubai' || side === 'both') dubai++;
      if (side === 'marbella' || side === 'both') marbella++;
    });
    if (answered < 5) {
      verdictText.textContent = COPY.incomplete;
      return;
    }
    if (dubai > marbella) verdictText.textContent = COPY.dubai;
    else if (marbella > dubai) verdictText.textContent = COPY.marbella;
    else verdictText.textContent = COPY.both;
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var q = chip.getAttribute('data-q');
      var wasActive = chip.classList.contains('active');
      quiz.querySelectorAll('.preset[data-q="' + q + '"]').forEach(function (c) {
        c.classList.remove('active');
      });
      if (!wasActive) chip.classList.add('active');
      score();
    });
  });

  score();
})();
