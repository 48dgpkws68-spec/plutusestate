/* PLUTUS ESTATE · Investor Suite calculators */
(function () {
  'use strict';

  var MIN_P = 150000, MAX_P = 10000000;

  function fmt(n) {
    return '€' + Math.round(n).toLocaleString('en-US');
  }
  function fmtShort(n) {
    if (Math.abs(n) >= 1000000) return '€' + (n / 1000000).toFixed(2).replace(/\.?0+$/, '') + 'M';
    if (Math.abs(n) >= 1000) return '€' + Math.round(n / 1000) + 'K';
    return fmt(n);
  }
  function pct(n, d) {
    return n.toFixed(d === undefined ? 1 : d) + '%';
  }
  /* log-scaled price slider: t in [0,100] -> € */
  function priceFromT(t) {
    var p = MIN_P * Math.pow(MAX_P / MIN_P, t / 100);
    var step = p < 1000000 ? 10000 : 50000;
    return Math.round(p / step) * step;
  }
  function tFromPrice(p) {
    return 100 * Math.log(p / MIN_P) / Math.log(MAX_P / MIN_P);
  }
  function $(id) { return document.getElementById(id); }
  function setRange(el, val) {
    el.value = val;
    if (window.paintRange) window.paintRange(el);
  }
  function on(el, fn) { el.addEventListener('input', fn); }

  /* =================== FLIP =================== */
  var fMarket = 'dubai';
  var F_COSTS = {
    dubai: { buy: 0.065, sell: 0.02, note: 'Cost lines applied · Dubai: 6.5% purchase costs (4% DLD, agency, admin), 2% selling costs. All-cash model.' },
    marbella: { buy: 0.115, sell: 0.055, note: 'Cost lines applied · Marbella: 11.5% purchase costs (ITP or VAT, notary, legal), 5.5% selling costs incl. agency and plusvalía. All-cash model.' }
  };

  function calcFlip() {
    var P = priceFromT(parseFloat($('fPrice').value));
    var disc = parseFloat($('fDisc').value) / 100;
    var renoPct = parseFloat($('fReno').value) / 100;
    var uplift = parseFloat($('fUplift').value) / 100;
    var months = parseInt($('fMonths').value, 10);
    var c = F_COSTS[fMarket];

    var marketValue = P / (1 - disc);
    var reno = P * renoPct;
    var afterReno = marketValue * (1 + uplift);
    var buyCosts = P * c.buy;
    var sellCosts = afterReno * c.sell;
    var invested = P + reno + buyCosts;
    var netProfit = afterReno - sellCosts - invested;
    var equity = marketValue - P - buyCosts;
    var roi = netProfit / invested;
    var annualized = Math.pow(1 + Math.max(roi, -0.99), 12 / months) - 1;

    $('fPriceVal').textContent = fmt(P);
    $('fDiscVal').textContent = pct(disc * 100, disc * 100 % 1 ? 1 : 0);
    $('fRenoVal').textContent = pct(renoPct * 100, 0);
    $('fUpliftVal').textContent = pct(uplift * 100, 0);
    $('fMonthsVal').textContent = months;
    $('fCostNote').textContent = c.note;

    var profitEl = $('fProfit');
    profitEl.textContent = fmt(netProfit);
    profitEl.classList.toggle('pos', netProfit >= 0);
    profitEl.classList.toggle('neg', netProfit < 0);
    $('fProfitSub').textContent = 'Projected in ' + months + ' months · exit at ' + fmtShort(afterReno);
    $('fEquity').textContent = fmt(equity);
    $('fInvested').textContent = fmtShort(invested);
    $('fResale').textContent = fmtShort(afterReno);
    $('fRoi').textContent = pct(roi * 100);
    $('fAnnual').textContent = pct(annualized * 100);
    $('fPerMonth').textContent = fmt(netProfit / months);

    var exitNet = afterReno - sellCosts;
    var maxBar = Math.max(invested, exitNet);
    $('fBarIn').style.width = (invested / maxBar * 100) + '%';
    $('fBarOut').style.width = (exitNet / maxBar * 100) + '%';
    $('fBarInVal').textContent = fmtShort(invested);
    $('fBarOutVal').textContent = fmtShort(exitNet);

    var verdict;
    if (netProfit <= 0) verdict = 'Thin or negative. We would walk, or renegotiate the entry price hard.';
    else if (annualized >= 0.35) verdict = 'Exceptional territory. Deals like this exist, but they are found off-market, not on portals.';
    else if (annualized >= 0.20) verdict = 'Strong flip. This is the band our distressed and off-market files usually land in.';
    else if (annualized >= 0.10) verdict = 'Workable, but the discount at entry decides everything. Push harder on price.';
    else verdict = 'Better than a savings account, but your capital can work harder. Ask us where.';
    $('fVerdict').textContent = verdict;
  }

  var FLIP_PRESETS = {
    marina: { price: 620000, disc: 20, reno: 6, uplift: 18, months: 9, market: 'dubai' },
    palm: { price: 5900000, disc: 18, reno: 10, uplift: 15, months: 12, market: 'dubai' },
    marbella: { price: 1200000, disc: 8, reno: 25, uplift: 32, months: 14, market: 'marbella' }
  };

  function setFlipMarket(m) {
    fMarket = m;
    $('fMktDubai').classList.toggle('active', m === 'dubai');
    $('fMktMarbella').classList.toggle('active', m === 'marbella');
    calcFlip();
  }

  ['fPrice', 'fDisc', 'fReno', 'fUplift', 'fMonths'].forEach(function (id) { on($(id), calcFlip); });
  $('fMktDubai').addEventListener('click', function () { setFlipMarket('dubai'); });
  $('fMktMarbella').addEventListener('click', function () { setFlipMarket('marbella'); });
  document.querySelectorAll('#flipPresets .preset').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('#flipPresets .preset').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var p = FLIP_PRESETS[btn.getAttribute('data-preset')];
      setRange($('fPrice'), tFromPrice(p.price));
      setRange($('fDisc'), p.disc);
      setRange($('fReno'), p.reno);
      setRange($('fUplift'), p.uplift);
      setRange($('fMonths'), p.months);
      setFlipMarket(p.market);
    });
  });

  /* =================== LONG-TERM RENTAL =================== */
  function calcRent() {
    var P = priceFromT(parseFloat($('rPrice').value));
    var gy = parseFloat($('rYield').value) / 100;
    var costs = parseFloat($('rCosts').value) / 100;
    var occ = parseFloat($('rOcc').value) / 100;
    var app = parseFloat($('rApp').value) / 100;
    var years = parseInt($('rYears').value, 10);

    var gross = P * gy;
    var net = gross * occ * (1 - costs);
    var netYield = net / P;

    $('rPriceVal').textContent = fmt(P);
    $('rYieldVal').textContent = pct(gy * 100);
    $('rCostsVal').textContent = pct(costs * 100, 0);
    $('rOccVal').textContent = pct(occ * 100, 0);
    $('rAppVal').textContent = pct(app * 100, app * 100 % 1 ? 1 : 0);
    $('rYearsVal').textContent = years + ' years';
    $('rYrsLabel1').textContent = years;
    $('rYrsLabel2').textContent = years;

    $('rNet').textContent = fmt(net);
    $('rNetSub').textContent = 'From ' + fmtShort(gross) + ' gross rent at ' + pct(occ * 100, 0) + ' occupancy';
    $('rMonthly').textContent = fmt(net / 12);
    $('rNetYield').textContent = pct(netYield * 100);

    var cumRent = 0, wealth = [];
    for (var y = 0; y <= years; y++) {
      var value = P * Math.pow(1 + app, y);
      if (y > 0) cumRent += net * Math.pow(1 + app, y - 1);
      wealth.push(value + cumRent);
    }
    var futureVal = P * Math.pow(1 + app, years);
    $('rFutureVal').textContent = fmtShort(futureVal);
    $('rCumRent').textContent = fmtShort(cumRent);

    /* sparkline */
    var W = 600, H = 150, pad = 6;
    var max = wealth[wealth.length - 1], min = wealth[0];
    var pts = wealth.map(function (v, i) {
      var x = pad + (W - 2 * pad) * i / years;
      var yv = H - pad - (H - 2 * pad) * (v - min * 0.92) / (max - min * 0.92);
      return x.toFixed(1) + ',' + yv.toFixed(1);
    });
    $('rLine').setAttribute('points', pts.join(' '));
    $('rArea').setAttribute('points', pad + ',' + (H - pad) + ' ' + pts.join(' ') + ' ' + (W - pad) + ',' + (H - pad));

    var totalWealth = futureVal + cumRent;
    var multiple = totalWealth / P;
    $('rVerdict').textContent = 'Your ' + fmtShort(P) + ' is projected to reach about ' + fmtShort(totalWealth) + ' in ' + years + ' years: value plus collected rent, a ' + multiple.toFixed(1) + 'x indicative multiple before financing.';
  }

  var RENT_PRESETS = {
    jvc: { price: 160000, y: 9.5, costs: 24, occ: 95, app: 6 },
    marina: { price: 620000, y: 7, costs: 22, occ: 97, app: 6 },
    downtown: { price: 480000, y: 6.2, costs: 22, occ: 97, app: 5.5 },
    goldenmile: { price: 850000, y: 4.5, costs: 20, occ: 95, app: 7 },
    andalucia: { price: 1600000, y: 4, costs: 20, occ: 92, app: 7 }
  };
  ['rPrice', 'rYield', 'rCosts', 'rOcc', 'rApp', 'rYears'].forEach(function (id) { on($(id), function () { calcRent(); calcStr(); }); });
  document.querySelectorAll('#rentPresets .preset').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('#rentPresets .preset').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var p = RENT_PRESETS[btn.getAttribute('data-preset')];
      setRange($('rPrice'), tFromPrice(p.price));
      setRange($('rYield'), p.y);
      setRange($('rCosts'), p.costs);
      setRange($('rOcc'), p.occ);
      setRange($('rApp'), p.app);
      calcRent();
      calcStr();
    });
  });

  /* =================== SHORT-TERM RENTAL =================== */
  function calcStr() {
    var P = priceFromT(parseFloat($('sPrice').value));
    var adr = parseFloat($('sAdr').value);
    var occ = parseFloat($('sOcc').value) / 100;
    var costs = parseFloat($('sCosts').value) / 100;

    var nights = Math.round(365 * occ);
    var revenue = adr * nights;
    var net = revenue * (1 - costs);
    var yieldOnPrice = net / P;

    $('sPriceVal').textContent = fmt(P);
    $('sAdrVal').textContent = '€' + adr;
    $('sOccVal').textContent = pct(occ * 100, 0);
    $('sCostsVal').textContent = pct(costs * 100, 0);

    $('sNet').textContent = fmt(net);
    $('sNetSub').textContent = nights + ' booked nights at €' + adr + ' average';
    $('sRevenue').textContent = fmtShort(revenue);
    $('sNights').textContent = nights;
    $('sYield').textContent = pct(yieldOnPrice * 100);
    $('sMonthly').textContent = fmt(net / 12);

    /* long-term comparison: use calculator 02 settings applied to THIS price */
    var gy = parseFloat($('rYield').value) / 100;
    var rCosts = parseFloat($('rCosts').value) / 100;
    var rOcc = parseFloat($('rOcc').value) / 100;
    var ltNet = P * gy * rOcc * (1 - rCosts);

    var maxBar = Math.max(net, ltNet, 1);
    $('sBarStr').style.width = (net / maxBar * 100) + '%';
    $('sBarLt').style.width = (ltNet / maxBar * 100) + '%';
    $('sBarStrVal').textContent = fmtShort(net);
    $('sBarLtVal').textContent = fmtShort(ltNet);

    var diff = ltNet > 0 ? (net - ltNet) / ltNet : 0;
    var verdict;
    if (diff > 0.25) verdict = 'Short-term wins clearly here: about ' + Math.round(diff * 100) + '% more net income for more operational work. We can run it for you.';
    else if (diff > 0) verdict = 'Short-term edges it by ' + Math.round(diff * 100) + '%. With professional management the gap usually widens.';
    else verdict = 'Long-term wins at these settings: ' + Math.round(-diff * 100) + '% more net with far less operational work. Simplicity pays here.';
    $('sVerdict').textContent = verdict;
  }

  var STR_PRESETS = {
    jvc: { price: 160000, adr: 120, occ: 78, costs: 30 },
    marina: { price: 620000, adr: 210, occ: 82, costs: 28 },
    palm: { price: 5900000, adr: 1100, occ: 70, costs: 30 },
    goldenmile: { price: 850000, adr: 320, occ: 62, costs: 30 },
    andalucia: { price: 1600000, adr: 650, occ: 58, costs: 32 }
  };
  ['sPrice', 'sAdr', 'sOcc', 'sCosts'].forEach(function (id) { on($(id), calcStr); });
  document.querySelectorAll('#strPresets .preset').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('#strPresets .preset').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var p = STR_PRESETS[btn.getAttribute('data-preset')];
      setRange($('sPrice'), tFromPrice(p.price));
      setRange($('sAdr'), p.adr);
      setRange($('sOcc'), p.occ);
      setRange($('sCosts'), p.costs);
      calcStr();
    });
  });

  /* =================== OFF-PLAN =================== */
  var oDldPromo = false;

  function calcOffplan() {
    var P = priceFromT(parseFloat($('oPrice').value));
    var paid = parseFloat($('oPaid').value) / 100;
    var months = parseInt($('oMonths').value, 10);
    var uplift = parseFloat($('oUplift').value) / 100;
    var dldCost = oDldPromo ? P * 0.005 : P * 0.042;

    var deployed = P * paid + dldCost;
    var value = P * (1 + uplift);
    var proceeds = value * 0.98 - (1 - paid) * P;
    var profit = proceeds - deployed;
    var roi = profit / deployed;
    var annualized = Math.pow(1 + Math.max(roi, -0.99), 12 / months) - 1;
    var leverage = P / deployed;

    $('oPriceVal').textContent = fmt(P);
    $('oPaidVal').textContent = pct(paid * 100, 0);
    $('oMonthsVal').textContent = months;
    $('oUpliftVal').textContent = pct(uplift * 100, 0);

    var profitEl = $('oProfit');
    profitEl.textContent = fmt(profit);
    profitEl.classList.toggle('pos', profit >= 0);
    profitEl.classList.toggle('neg', profit < 0);
    $('oProfitSub').textContent = 'Resale at ' + fmtShort(value) + ' with ' + pct((1 - paid) * 100, 0) + ' of instalments assigned to your buyer';
    $('oMonthly').textContent = fmt(P * paid / months);
    $('oDeployed').textContent = fmtShort(deployed);
    $('oValue').textContent = fmtShort(value);
    $('oLeverage').textContent = '€' + leverage.toFixed(2);
    $('oRoi').textContent = pct(roi * 100);
    $('oAnnual').textContent = pct(annualized * 100);

    var maxBar = Math.max(deployed, proceeds, 1);
    $('oBarIn').style.width = (deployed / maxBar * 100) + '%';
    $('oBarOut').style.width = (Math.max(proceeds, 0) / maxBar * 100) + '%';
    $('oBarInVal').textContent = fmtShort(deployed);
    $('oBarOutVal').textContent = fmtShort(proceeds);

    var verdict;
    if (profit <= 0) verdict = 'Below breakeven at these settings. Either the entry price, the uplift or the DLD terms must improve. That is a negotiation, and it is ours.';
    else if (annualized >= 0.15) verdict = 'The staged plan let you capture the uplift on the full ' + fmtShort(P) + ' while deploying only ' + fmtShort(deployed) + '. That is the off-plan leverage effect at its best.';
    else if (annualized >= 0.08) verdict = 'Solid. Allocation quality decides everything here: the pre-launch price we secure is usually the entire margin.';
    else verdict = 'Workable but thin. A better launch price or a developer DLD promo changes this picture fast. Ask us what is opening this quarter.';
    $('oVerdict').textContent = verdict;
  }

  var OFFPLAN_PRESETS = {
    creek: { price: 390000, paid: 40, months: 18, uplift: 12, promo: false },
    jvc: { price: 160000, paid: 70, months: 18, uplift: 8, promo: true },
    marina: { price: 620000, paid: 60, months: 30, uplift: 12, promo: false }
  };

  function setOffplanDld(promo) {
    oDldPromo = promo;
    $('oDldPay').classList.toggle('active', !promo);
    $('oDldPromo').classList.toggle('active', promo);
    calcOffplan();
  }

  ['oPrice', 'oPaid', 'oMonths', 'oUplift'].forEach(function (id) { on($(id), calcOffplan); });
  $('oDldPay').addEventListener('click', function () { setOffplanDld(false); });
  $('oDldPromo').addEventListener('click', function () { setOffplanDld(true); });
  document.querySelectorAll('#offplanPresets .preset').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('#offplanPresets .preset').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var p = OFFPLAN_PRESETS[btn.getAttribute('data-preset')];
      setRange($('oPrice'), tFromPrice(p.price));
      setRange($('oPaid'), p.paid);
      setRange($('oMonths'), p.months);
      setRange($('oUplift'), p.uplift);
      setOffplanDld(p.promo);
    });
  });

  /* =================== TABS =================== */
  var tabs = document.querySelectorAll('.calc-tab');
  function activate(name, updateHash) {
    tabs.forEach(function (t) { t.classList.toggle('active', t.getAttribute('data-calc') === name); });
    document.querySelectorAll('.calc-page').forEach(function (p) {
      p.classList.toggle('active', p.id === 'calc-' + name);
    });
    if (updateHash && history.replaceState) history.replaceState(null, '', '#' + name);
  }
  tabs.forEach(function (t) {
    t.addEventListener('click', function () { activate(t.getAttribute('data-calc'), true); });
  });
  function goToHash(scroll) {
    var h = (location.hash || '').replace('#', '');
    if (h === 'rent' || h === 'str' || h === 'flip' || h === 'offplan') {
      activate(h, false);
      if (scroll) {
        var bar = document.querySelector('.calc-tabs');
        if (bar) bar.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }
  window.addEventListener('hashchange', function () { goToHash(true); });
  goToHash(location.hash !== '');

  /* init */
  setRange($('fPrice'), tFromPrice(620000));
  setRange($('rPrice'), tFromPrice(620000));
  setRange($('sPrice'), tFromPrice(620000));
  setRange($('oPrice'), tFromPrice(390000));
  calcFlip();
  calcRent();
  calcStr();
  calcOffplan();
})();
