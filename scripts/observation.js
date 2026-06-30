/* =========================================================================
   observation.js ─ 定点観測（ObservationCamera）
   --------------------------------------------------------------------------
   ライブ動画ではなく、時間帯に応じて高解像度の静止画像を自動で切り替える、
   行政の定点観測カメラ風コンポーネント。
   --------------------------------------------------------------------------
   再利用について：
   HTML 側に data-observation-camera を持つ要素を置くだけで初期化されます。
   ・data-base-path … 画像フォルダ（既定 assets/images/observation/）
   ・data-schedule  … 任意。JSON でスケジュールを上書き（地点ごとに変えたい場合）
   画像ファイル名（am5.png …）を揃えれば、千石川・妙義山・宿場通りなど
   別地点も data-base-path を変えるだけで利用できます。
   ========================================================================= */
(function () {
  "use strict";

  var WEEKDAY = ["日", "月", "火", "水", "木", "金", "土"];

  /* 画像切替スケジュール（settingsオブジェクトで一元管理）
     start 時刻以降、その画像を表示する。深夜帯（先頭枠より前の時間）は
     一覧の最後の枠（pm20）が継続して表示される。 */
  var stationCameraSchedule = [
    { start: "05:00", image: "am5.png" },
    { start: "07:00", image: "am7.png" },
    { start: "09:00", image: "am9.png" },
    { start: "11:00", image: "am11.png" },
    { start: "14:00", image: "pm14.png" },
    { start: "16:00", image: "pm16.png" },
    { start: "18:30", image: "pm19.png" },
    { start: "19:30", image: "pm20.png" }
  ];

  function toMin(hhmm) {
    var p = String(hhmm).split(":");
    return (parseInt(p[0], 10) || 0) * 60 + (parseInt(p[1], 10) || 0);
  }

  // 現在時刻にあてはまる画像を選ぶ
  function pickImage(date, schedule) {
    var now = date.getHours() * 60 + date.getMinutes();
    var chosen = null, best = -1;
    for (var i = 0; i < schedule.length; i++) {
      var st = toMin(schedule[i].start);
      if (st <= now && st > best) { best = st; chosen = schedule[i]; }
    }
    // 先頭枠より前の時間（早朝）は、前夜の最終枠が継続
    if (!chosen) chosen = schedule[schedule.length - 1];
    return chosen.image;
  }

  function fmtDate(d) {
    return d.getFullYear() + "年" + (d.getMonth() + 1) + "月" + d.getDate() +
      "日（" + WEEKDAY[d.getDay()] + "）";
  }
  function fmtTime(d) {
    var h = d.getHours(), m = d.getMinutes();
    return (h < 10 ? "0" + h : h) + ":" + (m < 10 ? "0" + m : m);
  }
  // 7〜13分のランダム値（更新時刻の自然な表示用）
  function randUpdate() { return 7 + Math.floor(Math.random() * 7); }

  function ObservationCamera(root) {
    var basePath = root.getAttribute("data-base-path") || "assets/images/observation/";
    var schedule = stationCameraSchedule;
    var custom = root.getAttribute("data-schedule");
    if (custom) { try { schedule = JSON.parse(custom); } catch (e) {} }

    var img = root.querySelector("[data-cam-img]");
    var dateEl = root.querySelector("[data-cam-date]");
    var timeEl = root.querySelector("[data-cam-time]");
    var updEl = root.querySelector("[data-cam-update]");

    var current = "";
    var updateMin = randUpdate();

    function renderUpdate() {
      if (updEl) updEl.textContent = "約" + updateMin + "分前更新";
    }

    // 0.5秒のゆるやかなフェードで画像を差し替える
    function setImage(file) {
      if (file === current || !img) return;
      var url = basePath + file;
      if (!current) {
        current = file;
        img.onload = function () { img.style.opacity = "1"; };
        img.src = url;
        return;
      }
      current = file;
      img.style.opacity = "0";
      setTimeout(function () {
        img.onload = function () { img.style.opacity = "1"; };
        img.src = url;
        updateMin = randUpdate();
        renderUpdate();
      }, 500);
    }

    function tick() {
      var now = new Date();
      if (dateEl) dateEl.textContent = fmtDate(now);
      if (timeEl) timeEl.textContent = fmtTime(now);
      setImage(pickImage(now, schedule));
    }

    renderUpdate();
    tick();
    setInterval(tick, 1000);
  }

  function initAll() {
    var nodes = document.querySelectorAll("[data-observation-camera]");
    for (var i = 0; i < nodes.length; i++) {
      if (!nodes[i]._obsInit) { nodes[i]._obsInit = true; new ObservationCamera(nodes[i]); }
    }
  }

  window.ObservationCamera = ObservationCamera;
  window.initObservationCameras = initAll;
  window.stationCameraSchedule = stationCameraSchedule;

  if (document.readyState !== "loading") setTimeout(initAll, 0);
  else document.addEventListener("DOMContentLoaded", initAll);
})();
