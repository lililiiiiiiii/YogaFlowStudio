/**
 * Yoga Flow Studio - 主要應用程式核心邏輯
 */

// 全局狀態管理
const AppState = {
  activeTab: 'sequence',
  activeFilterCat: 'all',
  activeSearchKeyword: '',
  currentSequence: [], // 當前正在編輯的課表體位列表
  customSequences: {}, // 保存在 LocalStorage 中的自訂課表集
  currentSequenceTitle: '自訂練習課表',
  
  // 播放器狀態
  player: {
    isOpen: false,
    index: 0,
    secondsLeft: 0,
    totalSeconds: 0,
    isPaused: false,
    timerId: null,
    audioCtx: null
  }
};

// 工具函式：西藏頌缽音效合成
function playTibetanBowlSound() {
  try {
    if (!AppState.player.audioCtx) {
      AppState.player.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = AppState.player.audioCtx;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const now = ctx.currentTime;
    const frequencies = [188, 376, 564, 755];
    frequencies.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);
      
      const initialVol = 0.16 / (idx + 1);
      gain.gain.setValueAtTime(initialVol, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 3.3);
    });
  } catch (e) {
    console.warn("音訊播報限制或不支援 Web Audio:", e);
  }
}

// 工具函式：Web Speech 語音朗讀
function speakVoice(text, lang = 'zh') {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  if (!text) return;

  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.92;
  u.pitch = 1.0;

  if (lang === 'en') {
    u.lang = 'en-US';
  } else if (lang === 'sa') {
    u.lang = 'hi-IN';
  } else {
    u.lang = 'zh-TW';
  }
  window.speechSynthesis.speak(u);
}

function triggerPoseSpeech(item) {
  const langChoice = document.getElementById('voice-lang-select')?.value || 'zh';
  const enableSanskrit = document.getElementById('voice-sanskrit-toggle')?.checked ?? true;

  if (enableSanskrit && item.sanskrit) {
    speakVoice(item.sanskrit, 'sa');
  }

  setTimeout(() => {
    let sideZh = '';
    let sideEn = '';
    if (item.selectedSide === 'left') { sideZh = '，左側'; sideEn = ', Left side'; }
    if (item.selectedSide === 'right') { sideZh = '，右側'; sideEn = ', Right side'; }

    if (langChoice === 'en') {
      speakVoice(`${item.en}${sideEn}. ${item.cuesEn || item.cues}`, 'en');
    } else if (langChoice === 'dual') {
      speakVoice(`${item.zh}${sideZh}。${item.en}。${item.cues}`, 'zh');
    } else {
      speakVoice(`${item.zh}${sideZh}。${item.cues}`, 'zh');
    }
  }, enableSanskrit ? 1400 : 100);
}

// 介面 Tab 切換
function switchTab(targetTab) {
  AppState.activeTab = targetTab;
  const libView = document.getElementById('view-library');
  const seqView = document.getElementById('view-sequence');
  const btnLib = document.getElementById('tab-library');
  const btnSeq = document.getElementById('tab-sequence');

  if (targetTab === 'library') {
    libView.classList.remove('hidden');
    seqView.classList.add('hidden');
    btnLib.className = 'tab-btn flex flex-col items-center gap-1 text-amber-700 font-bold text-[11px]';
    btnSeq.className = 'tab-btn flex flex-col items-center gap-1 text-stone-400 font-medium text-[11px] relative';
  } else {
    libView.classList.add('hidden');
    seqView.classList.remove('hidden');
    btnSeq.className = 'tab-btn flex flex-col items-center gap-1 text-amber-700 font-bold text-[11px] relative';
    btnLib.className = 'tab-btn flex flex-col items-center gap-1 text-stone-400 font-medium text-[11px]';
  }
}

// 渲染動作庫（包含動作向量 SVG 圖示）
function renderPoseGrid() {
  const container = document.getElementById('pose-grid');
  if (!container || !window.YOGA_ASANAS) return;
  container.innerHTML = '';

  const filtered = window.YOGA_ASANAS.filter(p => {
    const matchCat = (AppState.activeFilterCat === 'all') || (p.category === AppState.activeFilterCat);
    const search = AppState.activeSearchKeyword.toLowerCase().trim();
    const matchSearch = !search ||
      p.zh.toLowerCase().includes(search) ||
      p.en.toLowerCase().includes(search) ||
      p.sanskrit.toLowerCase().includes(search) ||
      p.cues.toLowerCase().includes(search);
    return matchCat && matchSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = '<div class="col-span-full py-16 text-center text-xs text-stone-400">查無相符體位</div>';
    return;
  }

  filtered.forEach(p => {
    const card = document.createElement('div');
    card.className = 'p-3 bg-white border border-stone-200/90 rounded-2xl flex items-center justify-between gap-3 shadow-sm hover:border-amber-600/50 transition';

    let dotsHtml = '<div class="flex items-center text-amber-600 text-[10px]">';
    for (let i = 0; i < p.dots; i++) dotsHtml += '●';
    dotsHtml += '</div>';

    // 取得對應體位的專屬 SVG 向量圖
    const svgIcon = window.getPoseSVG ? window.getPoseSVG(p.id, p.category) : '';

    card.innerHTML = `
      <div class="flex items-center gap-3 flex-1 min-w-0 cursor-pointer btn-open-detail">
        <div class="w-12 h-12 bg-amber-50/80 border border-amber-200/60 rounded-xl flex items-center justify-center p-1 shrink-0 pose-svg-box">
          ${svgIcon}
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-1.5 mb-0.5">
            <span class="text-[9px] font-bold text-stone-400">#${String(p.id).padStart(2, '0')}</span>
            ${dotsHtml}
            ${p.isHeat ? '<i class="ph-fill ph-fire text-amber-600 text-xs" title="發熱體位"></i>' : ''}
          </div>
          <h4 class="font-bold text-sm text-stone-800 truncate">${p.zh}</h4>
          <p class="text-[11px] text-stone-500 font-medium truncate">${p.en}</p>
          <p class="text-[10px] text-amber-800/80 italic font-serif truncate mt-0.5">${p.sanskrit}</p>
        </div>
      </div>

      <div class="flex items-center gap-1.5 shrink-0">
        <button class="btn-open-detail p-2 text-stone-400 hover:text-stone-700 bg-stone-50 rounded-xl" title="詳情">
          <i class="ph ph-info text-base"></i>
        </button>
        <button class="btn-add-pose px-3 py-2 bg-amber-50 hover:bg-amber-600 text-amber-800 hover:text-white rounded-xl text-xs font-semibold transition flex items-center gap-1 shadow-sm active:scale-95">
          <i class="ph ph-plus text-sm"></i>
          <span>加入</span>
        </button>
      </div>
    `;

    card.querySelectorAll('.btn-open-detail').forEach(el => {
      el.addEventListener('click', () => openPoseModal(p.id));
    });
    card.querySelector('.btn-add-pose').addEventListener('click', () => {
      addPoseToCurrentSequence(p.id);
      showToast(`已加入「${p.zh}」！`);
    });

    container.appendChild(card);
  });
}

// 將體位加入當前課表序列
function addPoseToCurrentSequence(poseId, side = 'both', duration = null) {
  const p = window.YOGA_ASANAS.find(x => x.id === poseId);
  if (!p) return;

  AppState.currentSequence.push({
    uniqueId: 'pose_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    poseId: p.id,
    zh: p.zh,
    en: p.en,
    sanskrit: p.sanskrit,
    category: p.category,
    cues: p.cues,
    cuesEn: p.cuesEn || p.cues,
    duration: duration || p.duration,
    selectedSide: side,
    hasSideOption: !!p.sideMode
  });

  renderSequenceList();
}

// 渲染當前課表序列清單
function renderSequenceList() {
  const container = document.getElementById('sequence-container');
  const emptyState = document.getElementById('sequence-empty-state');
  if (!container) return;

  if (AppState.currentSequence.length === 0) {
    if (emptyState) emptyState.classList.remove('hidden');
    container.innerHTML = '';
    if (emptyState) container.appendChild(emptyState);
    updateSequenceStats();
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');
  container.innerHTML = '';

  AppState.currentSequence.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'bg-white p-3 rounded-2xl border border-stone-200/90 shadow-sm space-y-2';

    // 卡片內動作小圖示
    const svgIcon = window.getPoseSVG ? window.getPoseSVG(item.poseId, item.category) : '';

    card.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2.5 min-w-0">
          <span class="w-5 h-5 rounded-md bg-stone-100 flex items-center justify-center font-bold text-[10px] text-stone-600 shrink-0">
            ${index + 1}
          </span>
          <div class="w-9 h-9 bg-amber-50/70 border border-amber-200/50 rounded-lg flex items-center justify-center p-0.5 shrink-0 pose-svg-box">
            ${svgIcon}
          </div>
          <div class="min-w-0">
            <h4 class="font-bold text-xs text-stone-800 truncate">${item.zh} <span class="font-normal text-stone-400">/ ${item.en}</span></h4>
            <p class="text-[10px] text-amber-800/80 italic font-serif truncate">${item.sanskrit}</p>
          </div>
        </div>

        <div class="flex items-center gap-1.5 shrink-0">
          <div class="flex items-center bg-stone-50 border border-stone-200 rounded-lg px-1.5 py-0.5">
            <input type="number" min="5" max="600" step="5" class="duration-input w-11 text-center text-xs font-semibold bg-transparent text-stone-700" value="${item.duration}">
            <span class="text-[10px] text-stone-400">秒</span>
          </div>
          <button class="btn-delete p-1.5 text-stone-400 hover:text-rose-600 rounded-lg" title="刪除">
            <i class="ph ph-trash text-base"></i>
          </button>
        </div>
      </div>

      <div class="flex items-center justify-between pt-1 border-t border-stone-100 text-xs">
        <div class="flex items-center gap-2">
          ${item.hasSideOption ? `
            <select class="side-selector text-[11px] bg-amber-50 border border-amber-200 text-amber-800 rounded px-1.5 py-0.5">
              <option value="both" ${item.selectedSide === 'both' ? 'selected' : ''}>雙側對稱</option>
              <option value="left" ${item.selectedSide === 'left' ? 'selected' : ''}>左側 (Left)</option>
              <option value="right" ${item.selectedSide === 'right' ? 'selected' : ''}>右側 (Right)</option>
            </select>
          ` : '<span class="text-[10px] text-stone-400">對稱體位</span>'}
        </div>

        <div class="flex items-center gap-2 text-stone-400">
          <button class="btn-move-up p-1 hover:text-stone-700 ${index === 0 ? 'opacity-25 pointer-events-none' : ''}" title="上移">
            <i class="ph ph-arrow-up text-sm"></i>
          </button>
          <button class="btn-move-down p-1 hover:text-stone-700 ${index === AppState.currentSequence.length - 1 ? 'opacity-25 pointer-events-none' : ''}" title="下移">
            <i class="ph ph-arrow-down text-sm"></i>
          </button>
          <button class="btn-dup p-1 hover:text-amber-700" title="複製換側">
            <i class="ph ph-copy text-sm"></i>
          </button>
        </div>
      </div>
    `;

    // 綁定卡片事件
    if (item.hasSideOption) {
      card.querySelector('.side-selector')?.addEventListener('change', (e) => {
        item.selectedSide = e.target.value;
      });
    }
    card.querySelector('.duration-input')?.addEventListener('change', (e) => {
      item.duration = parseInt(e.target.value) || 30;
      updateSequenceStats();
    });
    card.querySelector('.btn-delete')?.addEventListener('click', () => {
      AppState.currentSequence.splice(index, 1);
      renderSequenceList();
    });
    card.querySelector('.btn-move-up')?.addEventListener('click', () => {
      if (index > 0) {
        const tmp = AppState.currentSequence[index];
        AppState.currentSequence[index] = AppState.currentSequence[index - 1];
        AppState.currentSequence[index - 1] = tmp;
        renderSequenceList();
      }
    });
    card.querySelector('.btn-move-down')?.addEventListener('click', () => {
      if (index < AppState.currentSequence.length - 1) {
        const tmp = AppState.currentSequence[index];
        AppState.currentSequence[index] = AppState.currentSequence[index + 1];
        AppState.currentSequence[index + 1] = tmp;
        renderSequenceList();
      }
    });
    card.querySelector('.btn-dup')?.addEventListener('click', () => {
      AppState.currentSequence.splice(index + 1, 0, {
        ...item,
        uniqueId: 'pose_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        selectedSide: item.selectedSide === 'left' ? 'right' : (item.selectedSide === 'right' ? 'left' : 'both')
      });
      renderSequenceList();
    });

    container.appendChild(card);
  });

  updateSequenceStats();
}

// 更新統計數據與標題
function updateSequenceStats() {
  const countEl = document.getElementById('seq-pose-count');
  const timeEl = document.getElementById('seq-total-time');
  const heatEl = document.getElementById('seq-heat-indicator');
  const badgeEl = document.getElementById('tab-badge');

  const count = AppState.currentSequence.length;
  if (countEl) countEl.innerText = `${count} 個體位`;
  if (badgeEl) {
    badgeEl.innerText = count;
    if (count > 0) badgeEl.classList.remove('hidden');
    else badgeEl.classList.add('hidden');
  }

  const totalSec = AppState.currentSequence.reduce((acc, cur) => acc + (parseInt(cur.duration) || 0), 0);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  if (timeEl) timeEl.innerText = `${min} 分 ${sec} 秒`;

  const heatCount = AppState.currentSequence.filter(item => {
    const p = window.YOGA_ASANAS.find(x => x.id === item.poseId);
    return p && p.isHeat;
  }).length;

  if (heatEl) {
    if (heatCount >= 6) heatEl.innerText = '高發熱 (🔥)';
    else if (heatCount >= 2) heatEl.innerText = '中度鍛鍊';
    else heatEl.innerText = '溫和修復';
  }
}

// 核心操作：新建空白序列
function createNewBlankSequence() {
  const name = prompt("請輸入新課表名稱：", "我的新瑜珈課表");
  if (name === null) return; // 使用者按取消

  AppState.currentSequenceTitle = name.trim() || "未命名課表";
  const titleInput = document.getElementById('sequence-title-input');
  if (titleInput) titleInput.value = AppState.currentSequenceTitle;

  // 清空當前內容並重設選單
  AppState.currentSequence = [];
  const select = document.getElementById('preset-sequence-select');
  if (select) select.value = "";

  renderSequenceList();
  showToast(`已建立空白課表「${AppState.currentSequenceTitle}」！`);
}

// 核心操作：清空當前序列
function clearCurrentSequence() {
  if (AppState.currentSequence.length === 0) {
    showToast("目前序列本來就是空的唷！");
    return;
  }
  if (confirm(`確定要清空「${AppState.currentSequenceTitle}」裡的所有動作嗎？`)) {
    AppState.currentSequence = [];
    renderSequenceList();
    showToast("已清空序列中的所有動作！");
  }
}

// 載入預設課表
function loadPresetSequence(presetId) {
  const found = window.PRESET_SEQUENCES.find(p => p.id === presetId);
  if (!found) return;

  AppState.currentSequenceTitle = found.name;
  const titleInput = document.getElementById('sequence-title-input');
  if (titleInput) titleInput.value = found.name;

  AppState.currentSequence = [];
  found.poses.forEach(id => {
    addPoseToCurrentSequence(id);
  });

  renderSequenceList();
  showToast(`已成功載入課表：「${found.name}」！`);
}

// 初始化課表下拉選單（含官方預設與使用者自訂）
function refreshPresetDropdown() {
  const select = document.getElementById('preset-sequence-select');
  if (!select) return;
  select.innerHTML = '<option value="">-- 載入官方預設 / 自訂課表 --</option>';

  // 1. 官方預設
  const officialGroup = document.createElement('optgroup');
  officialGroup.label = '── 官方推薦課表 ──';
  window.PRESET_SEQUENCES.forEach(ps => {
    const opt = document.createElement('option');
    opt.value = 'preset_' + ps.id;
    opt.innerText = `${ps.name} (${ps.duration})`;
    officialGroup.appendChild(opt);
  });
  select.appendChild(officialGroup);

  // 2. 自訂課表集
  const savedKeys = Object.keys(AppState.customSequences);
  if (savedKeys.length > 0) {
    const customGroup = document.createElement('optgroup');
    customGroup.label = '── 我的自訂課表 ──';
    savedKeys.forEach(k => {
      const opt = document.createElement('option');
      opt.value = 'custom_' + k;
      opt.innerText = `⭐ ${k} (${AppState.customSequences[k].length} 體位)`;
      customGroup.appendChild(opt);
    });
    select.appendChild(customGroup);
  }
}

// 儲存當前課表至自訂庫
function saveCurrentCustomSequence() {
  if (AppState.currentSequence.length === 0) {
    alert("目前序列中沒有任何體位，無法儲存！請先挑選動作加入。");
    return;
  }
  const currentTitle = document.getElementById('sequence-title-input')?.value.trim() || AppState.currentSequenceTitle || '自訂練習課表';
  const newTitle = prompt("請輸入此套課表名稱：", currentTitle);
  if (!newTitle) return;

  AppState.customSequences[newTitle] = JSON.parse(JSON.stringify(AppState.currentSequence));
  AppState.currentSequenceTitle = newTitle;
  const titleInput = document.getElementById('sequence-title-input');
  if (titleInput) titleInput.value = newTitle;

  localStorage.setItem('yoga_flow_custom_db', JSON.stringify(AppState.customSequences));
  refreshPresetDropdown();
  showToast(`已成功儲存自訂課表「${newTitle}」！`);
}

// 載入自訂課表
function loadCustomSequence(title) {
  if (!AppState.customSequences[title]) return;
  AppState.currentSequenceTitle = title;
  const titleInput = document.getElementById('sequence-title-input');
  if (titleInput) titleInput.value = title;

  AppState.currentSequence = JSON.parse(JSON.stringify(AppState.customSequences[title]));
  renderSequenceList();
  showToast(`已載入自訂課表：「${title}」`);
}

// 動作詳情 Modal
let activeModalPoseId = null;
function openPoseModal(poseId) {
  const p = window.YOGA_ASANAS.find(x => x.id === poseId);
  if (!p) return;
  activeModalPoseId = p.id;

  const svgPreview = document.getElementById('modal-svg-preview');
  if (svgPreview) {
    svgPreview.innerHTML = window.getPoseSVG ? window.getPoseSVG(p.id, p.category) : '';
  }

  document.getElementById('modal-card-id').innerText = `#${String(p.id).padStart(2, '0')}`;
  document.getElementById('modal-zh-name').innerText = p.zh;
  document.getElementById('modal-en-name').innerText = p.en;
  document.getElementById('modal-sanskrit-name').innerText = p.sanskrit;
  document.getElementById('modal-benefits').innerText = p.benefits;
  document.getElementById('modal-cues').innerText = p.cues;
  document.getElementById('modal-details').innerText = p.details;
  document.getElementById('modal-precautions').innerText = p.precautions;

  document.getElementById('pose-detail-modal')?.classList.remove('hidden');
}

function closePoseModal() {
  document.getElementById('pose-detail-modal')?.classList.add('hidden');
}

// 引導播放器核心
function startFlowPlayer() {
  if (AppState.currentSequence.length === 0) {
    alert("課表目前沒有體位，請先加入動作！");
    return;
  }
  AppState.player.isOpen = true;
  AppState.player.index = 0;
  AppState.player.isPaused = false;
  document.getElementById('flow-player-modal')?.classList.remove('hidden');
  loadPlayerStep();
}

function closeFlowPlayer() {
  AppState.player.isOpen = false;
  clearInterval(AppState.player.timerId);
  window.speechSynthesis.cancel();
  document.getElementById('flow-player-modal')?.classList.add('hidden');
}

function loadPlayerStep() {
  clearInterval(AppState.player.timerId);
  const pState = AppState.player;

  if (pState.index >= AppState.currentSequence.length) {
    playTibetanBowlSound();
    speakVoice("恭喜完成今日課表練習。Namaste。", "zh");
    alert("🎉 課表練習完畢！Namaste！");
    closeFlowPlayer();
    return;
  }

  const currentItem = AppState.currentSequence[pState.index];
  pState.secondsLeft = parseInt(currentItem.duration) || 30;
  pState.totalSeconds = pState.secondsLeft;

  // 更新播放介面文字與動作圖示
  document.getElementById('player-seq-name').innerText = AppState.currentSequenceTitle;
  document.getElementById('player-pose-index').innerText = `體位 ${pState.index + 1} / ${AppState.currentSequence.length}`;
  document.getElementById('player-sanskrit-tag').innerText = currentItem.sanskrit;
  document.getElementById('player-pose-title').innerText = currentItem.zh;

  // 插入播放中大尺寸 SVG 圖示
  const playerSvgBox = document.getElementById('player-svg-box');
  if (playerSvgBox) {
    playerSvgBox.innerHTML = window.getPoseSVG ? window.getPoseSVG(currentItem.poseId, currentItem.category) : '';
  }

  let sideStr = "雙側對稱";
  if (currentItem.selectedSide === 'left') sideStr = "左側 (Left)";
  if (currentItem.selectedSide === 'right') sideStr = "右側 (Right)";
  document.getElementById('player-pose-sub').innerText = `${currentItem.en} • ${sideStr}`;
  document.getElementById('player-cues-text').innerText = currentItem.cues;

  const nextItem = AppState.currentSequence[pState.index + 1];
  document.getElementById('player-next-pose-name').innerText = nextItem ? `${nextItem.zh} (${nextItem.en})` : "全序列完成 (Namaste)";

  // 播放音效與語音
  playTibetanBowlSound();
  triggerPoseSpeech(currentItem);
  updatePlayerProgress();

  pState.timerId = setInterval(() => {
    if (!pState.isPaused) {
      pState.secondsLeft--;
      updatePlayerProgress();

      if (pState.secondsLeft <= 0) {
        clearInterval(pState.timerId);
        pState.index++;
        loadPlayerStep();
      }
    }
  }, 1000);
}

function updatePlayerProgress() {
  const pState = AppState.player;
  const timeEl = document.getElementById('player-time-left');
  if (timeEl) timeEl.innerText = Math.max(0, pState.secondsLeft);

  const circle = document.getElementById('player-progress-circle');
  if (circle) {
    const perimeter = 276.46;
    const ratio = Math.max(0, pState.secondsLeft) / (pState.totalSeconds || 1);
    circle.style.strokeDashoffset = perimeter * (1 - ratio);
  }
}

// 簡單 Toast 訊息提示
function showToast(msg) {
  let toast = document.getElementById('app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.className = 'fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-stone-900/90 text-white text-xs px-4 py-2 rounded-full shadow-lg transition duration-200 pointer-events-none opacity-0';
    document.body.appendChild(toast);
  }
  toast.innerText = msg;
  toast.classList.remove('opacity-0');
  setTimeout(() => toast.classList.add('opacity-0'), 1800);
}

// DOM Ready 初始化事件綁定
window.addEventListener('DOMContentLoaded', () => {
  // 1. 讀取儲存的自訂課表
  try {
    const raw = localStorage.getItem('yoga_flow_custom_db');
    if (raw) AppState.customSequences = JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }

  // 2. 初始化課表下拉選單與動作清單
  refreshPresetDropdown();
  renderPoseGrid();

  // 預設載入開髖 Level 1
  loadPresetSequence('hips_l1');

  // 3. 課表下拉選單監聽
  document.getElementById('preset-sequence-select')?.addEventListener('change', (e) => {
    const val = e.target.value;
    if (!val) return;
    if (val.startsWith('preset_')) {
      const pId = val.replace('preset_', '');
      loadPresetSequence(pId);
    } else if (val.startsWith('custom_')) {
      const cTitle = val.replace('custom_', '');
      loadCustomSequence(cTitle);
    }
  });

  // 4. 新建與清空序列按鈕（快捷按鈕與選單按鈕雙向綁定）
  document.getElementById('btn-quick-new')?.addEventListener('click', createNewBlankSequence);
  document.getElementById('btn-menu-new')?.addEventListener('click', () => {
    createNewBlankSequence();
    document.getElementById('top-menu-dropdown')?.classList.add('hidden');
  });

  document.getElementById('btn-quick-clear')?.addEventListener('click', clearCurrentSequence);
  document.getElementById('btn-clear-seq')?.addEventListener('click', () => {
    clearCurrentSequence();
    document.getElementById('top-menu-dropdown')?.classList.add('hidden');
  });

  // 5. 儲存序列按鈕
  document.getElementById('btn-quick-save')?.addEventListener('click', saveCurrentCustomSequence);
  document.getElementById('btn-save-seq')?.addEventListener('click', () => {
    saveCurrentCustomSequence();
    document.getElementById('top-menu-dropdown')?.classList.add('hidden');
  });

  // 空白狀態下的一鍵挑選動作按鈕
  document.getElementById('btn-empty-goto-lib')?.addEventListener('click', () => switchTab('library'));

  // 6. 匯出 JSON
  document.getElementById('btn-export-json')?.addEventListener('click', () => {
    const exportData = {
      title: document.getElementById('sequence-title-input')?.value || AppState.currentSequenceTitle,
      exportedAt: new Date().toISOString(),
      sequence: AppState.currentSequence
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exportData.title.replace(/\s+/g, '_')}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    document.getElementById('top-menu-dropdown')?.classList.add('hidden');
  });

  // 7. 搜尋與分類篩選
  document.getElementById('search-input')?.addEventListener('input', (e) => {
    AppState.activeSearchKeyword = e.target.value;
    renderPoseGrid();
  });

  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.cat-btn').forEach(b => {
        b.className = 'cat-btn px-2.5 py-1 rounded-lg font-medium whitespace-nowrap bg-white border border-stone-200 text-stone-600';
      });
      e.target.className = 'cat-btn px-2.5 py-1 rounded-lg font-medium whitespace-nowrap bg-stone-800 text-white';
      AppState.activeFilterCat = e.target.getAttribute('data-cat');
      renderPoseGrid();
    });
  });

  // 8. 標籤列切換
  document.getElementById('tab-library')?.addEventListener('click', () => switchTab('library'));
  document.getElementById('tab-sequence')?.addEventListener('click', () => switchTab('sequence'));

  // 9. 彈出 Modal 事件
  document.getElementById('modal-close-btn')?.addEventListener('click', closePoseModal);
  document.getElementById('modal-add-btn')?.addEventListener('click', () => {
    if (activeModalPoseId) {
      addPoseToCurrentSequence(activeModalPoseId);
      closePoseModal();
      showToast("已加入課表！");
    }
  });
  document.getElementById('modal-voice-btn')?.addEventListener('click', () => {
    if (activeModalPoseId) {
      const p = window.YOGA_ASANAS.find(x => x.id === activeModalPoseId);
      if (p) triggerPoseSpeech(p);
    }
  });

  // 10. 播放器按鈕
  document.getElementById('tab-play')?.addEventListener('click', startFlowPlayer);
  document.getElementById('player-close-btn')?.addEventListener('click', closeFlowPlayer);
  document.getElementById('player-sound-test')?.addEventListener('click', playTibetanBowlSound);
  document.getElementById('player-toggle-btn')?.addEventListener('click', () => {
    AppState.player.isPaused = !AppState.player.isPaused;
    const icon = document.getElementById('player-toggle-icon');
    if (icon) {
      icon.className = AppState.player.isPaused ? 'ph-fill ph-play text-2xl' : 'ph-fill ph-pause text-2xl';
    }
  });
  document.getElementById('player-prev-btn')?.addEventListener('click', () => {
    if (AppState.player.index > 0) {
      AppState.player.index--;
      loadPlayerStep();
    }
  });
  document.getElementById('player-next-btn')?.addEventListener('click', () => {
    AppState.player.index++;
    loadPlayerStep();
  });

  // 11. 頂部更多選單
  document.getElementById('btn-top-menu')?.addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('top-menu-dropdown')?.classList.toggle('hidden');
  });
  document.addEventListener('click', () => {
    document.getElementById('top-menu-dropdown')?.classList.add('hidden');
  });

  // 標題編輯連動
  document.getElementById('sequence-title-input')?.addEventListener('input', (e) => {
    AppState.currentSequenceTitle = e.target.value;
  });
});
