/* =========================================================================
   today.js ─ 「今日の東軽井沢」
   その日の街から届く、小さな挨拶。
   --------------------------------------------------------------------------
   ・時間帯であいさつを変える（朝／昼／夕／夜）
   ・ブラウザの日付を曜日つきで表示
   ・季節に応じた自然な気温（APIなし・1日のなかでゆるやかに推移）
   ・data/today.json から、その日のおすすめ文を選ぶ
   --------------------------------------------------------------------------
   将来の拡張について：
   ライブカメラ / ニュース / イベント / 天気 / 市報 などのパネルは、
   index.html の #today セクション内 <!-- 将来のパネル --> 位置へカードを
   追加し、ここに HKToday.modules.xxx として描画関数を足すだけで拡張できます。
   下記の純粋関数（greeting / formatDate / temperature / pickMessage）は
   そのまま再利用できます。
   ========================================================================= */
(function () {
  "use strict";

  /* ---- 設定 ---------------------------------------------------------- */
  // 季節ごとの気温レンジ（℃）
  var TEMP_RANGE = {
    spring: [16, 23],
    summer: [26, 34],
    autumn: [15, 25],
    winter: [-2, 9]
  };
  var WEEKDAY = ["日", "月", "火", "水", "木", "金", "土"];

  // data/today.json が読めない環境（file:// 直開きなど）のための控えのおすすめ文
  var FALLBACK = {
    spring: ["今日は千石川グリーンウェイの桜並木を歩きたくなる一日です。"],
    summer: ["川沿いの木陰が心地よい、高原の夏の一日になりそうです。"],
    autumn: ["澄んだ秋の空気のなか、緑道の散策がおすすめです。"],
    winter: ["温泉郷でゆったり過ごす、雪見の休日はいかがでしょう。"]
  };

  // 時間帯に応じたあいさつ脇の小さな点の色（ごく控えめなアクセント）
  var DOT = {
    morning: "#E3B07F",
    afternoon: "#E8C25A",
    evening: "#CE8A6A",
    night: "#8E88B6"
  };

  /* ---- 純粋関数（再利用可能） ---------------------------------------- */
  function dayOfYear(d) {
    var start = new Date(d.getFullYear(), 0, 0);
    return Math.floor((d - start) / 86400000);
  }

  // その日ごとに安定した擬似乱数（同じ日付なら毎回同じ値）
  function seededRand(seed) {
    var x = Math.sin(seed * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  }

  function season(d) {
    var m = d.getMonth() + 1;
    if (m >= 3 && m <= 5) return "spring";
    if (m >= 6 && m <= 8) return "summer";
    if (m >= 9 && m <= 11) return "autumn";
    return "winter";
  }

  function greeting(d) {
    var h = d.getHours();
    if (h >= 5 && h <= 10) return { text: "Good Morning.", period: "morning" };
    if (h >= 11 && h <= 16) return { text: "Good Afternoon.", period: "afternoon" };
    if (h >= 17 && h <= 20) return { text: "Good Evening.", period: "evening" };
    return { text: "Good Night.", period: "night" };
  }

  // 2026年7月12日（土）
  function formatDate(d) {
    return d.getFullYear() + "年" + (d.getMonth() + 1) + "月" + d.getDate() +
      "日（" + WEEKDAY[d.getDay()] + "）";
  }

  // 7:12（時は0埋めなし・分は0埋め）
  function formatTime(d) {
    var m = d.getMinutes();
    return d.getHours() + ":" + (m < 10 ? "0" + m : m);
  }

  // 季節レンジ内で、その日に固定された平均気温を中心に、
  // 1日のなかを日周変化（昼に高く・未明に低く）でゆるやかに推移させる。
  // 同じ日・同じ時刻なら何度更新しても同じ値になる。
  function temperature(d) {
    var range = TEMP_RANGE[season(d)];
    var lo = range[0], hi = range[1];
    var amp = (hi - lo) * 0.28;                       // 日内の振れ幅
    var seed = d.getFullYear() * 1000 + dayOfYear(d);
    var mean = lo + amp + seededRand(seed + 3) * ((hi - lo) - 2 * amp);
    var hour = d.getHours() + d.getMinutes() / 60;
    var diurnal = Math.cos(((hour - 14) / 24) * Math.PI * 2); // 14時で最高
    return Math.round(mean + amp * diurnal);
  }

  // その日のおすすめ文（季節配列から、日ごとに安定して選ぶ）
  function pickMessage(d, data) {
    var arr = (data && data[season(d)]) || FALLBACK[season(d)] || [];
    if (!arr.length) return "";
    var seed = d.getFullYear() * 1000 + dayOfYear(d);
    return arr[Math.floor(seededRand(seed + 7) * arr.length)];
  }

  /* ---- データ読み込み ------------------------------------------------ */
  function loadData() {
    return fetch("data/today.json", { cache: "no-cache" })
      .then(function (r) { if (!r.ok) throw new Error("status " + r.status); return r.json(); })
      .catch(function () { return FALLBACK; }); // file:// 等では控えの文を使う
  }

  /* ---- 描画 ---------------------------------------------------------- */
  function set(id, value) {
    var el = document.getElementById(id);
    if (el && el.textContent !== value) el.textContent = value;
  }

  function render(data) {
    var now = new Date();
    var g = greeting(now);
    set("hk-greeting", g.text);
    set("hk-date", formatDate(now));
    set("hk-time", formatTime(now));
    set("hk-temp", temperature(now) + "℃");
    set("hk-message", pickMessage(now, data));
    var dot = document.querySelector("[data-today-dot]");
    if (dot) dot.style.background = DOT[g.period] || "var(--accent)";
  }

  // 0.8秒のふんわりフェードイン（スクロールで自然に表示）
  function setupReveal() {
    var card = document.querySelector("[data-today-card]");
    if (!card) return;
    var reduced = window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) {
      card.style.opacity = "1";
      card.style.transform = "none";
      return;
    }
    card.style.opacity = "0";
    card.style.transform = "translateY(24px)";
    card.style.willChange = "opacity, transform";
    card.style.transition =
      "opacity .8s cubic-bezier(.16,.84,.34,1), transform .8s cubic-bezier(.16,.84,.34,1)";
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.style.opacity = "1";
          en.target.style.transform = "none";
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.2, rootMargin: "0px 0px -8% 0px" });
    io.observe(card);
  }

  /* ---- 公開API ------------------------------------------------------- */
  var HKToday = {
    // 再利用できる純粋関数
    season: season,
    greeting: greeting,
    formatDate: formatDate,
    formatTime: formatTime,
    temperature: temperature,
    pickMessage: pickMessage,
    // 将来のパネル（ライブカメラ/ニュース/天気/市報…）はここに追加
    modules: {},

    _inited: false,
    _data: null,
    init: function () {
      if (this._inited) return;
      if (!document.querySelector("[data-today-card]")) return; // まだ描画前
      this._inited = true;
      setupReveal();
      var self = this;
      loadData().then(function (data) {
        self._data = data;
        render(data);
        // 時刻・あいさつをゆるやかに更新（派手な動きはなし）
        setInterval(function () { render(self._data); }, 1000);
      });
    }
  };

  window.HKToday = HKToday;

  // DC描画後に Component から init() が呼ばれるが、
  // 単体表示でも動くよう DOM 準備後にも一度試みる。
  if (document.readyState !== "loading") {
    setTimeout(function () { HKToday.init(); }, 0);
  } else {
    document.addEventListener("DOMContentLoaded", function () { HKToday.init(); });
  }
})();
