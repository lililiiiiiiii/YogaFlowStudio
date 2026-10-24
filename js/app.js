/**
 * Yoga Flow Studio - 雙語介面與核心邏輯
 */

const AppState = {
  activeTab: 'sequence',
  activeFilterType: 'all', // 'all' | 'yang' | 'yin'
  activeFilterCat: 'all',
  activeSearchKeyword: '',
  currentSequence: [],
  customSequences: {},
  currentSequenceTitle: '自訂練習課表 (Custom Flow)',
  
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

// 西藏頌缽合成器
function playTibetanBowlSound() {
  try {
    if (!AppState.player.audioCtx) {
      AppState.player.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = AppState.player.audioCtx;
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;
    [188, 376, 564, 755].forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);
      gain.gain.setValueAtTime(0.15 / (idx + 1), now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 3.3);
    });
  } catch (e) {
    console.warn(e);
  }
}

// 優化後的語音朗讀函式：支援精準音調與梵文專用語音引擎
function speakVoice(text, lang = 'zh') {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  if (!text) return;

  const u = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();

  if (lang === 'sa') {
    // 梵文發音：尋找最自然的印度語系或義大利/拉丁發音引擎
    const sanskritVoice = voices.find(v => 
      v.lang === 'sa-IN' || v.lang === 'hi-IN' || v.lang.startsWith('hi') || v.name.includes('India')
    );
    if (sanskritVoice) u.voice = sanskritVoice;
    u.lang = 'hi-IN';
    u.rate = 0.82; // 梵文放慢語速，讓尾音如 asana 完整發音
    u.pitch = 0.95; // 微降音高，營造沉穩、如念頌般的音色
  } else if (lang === 'en') {
    const enVoice = voices.find(v => v.lang === 'en-US' && (v.name.includes('Natural') || v.name.includes('Samantha')));
    if (enVoice) u.voice = enVoice;
    u.lang = 'en-US';
    u.rate = 0.90;
    u.pitch = 1.0;
  } else {
    const zhVoice = voices.find(v => v.lang === 'zh-TW' || v.lang.startsWith('zh'));
    if (zhVoice) u.voice = zhVoice;
    u.lang = 'zh-TW';
    u.rate = 0.92;
    u.pitch = 1.0;
  }

  window.speechSynthesis.speak(u);
}

// 播放前音節平滑處理
function sanitizeSanskritForSpeech(sanskrit) {
  if (!sanskrit) return '';
  // 將長字串進行連讀平滑微調，避免瀏覽器語音卡頓
  return sanskrit
    .replace(/ā/g, 'aa')
    .replace(/ī/g, 'ee')
    .replace(/ū/g, 'oo')
    .replace(/ṣ/g, 'sh')
    .replace(/ś/g, 'sh')
    .replace(/ṛ/g, 'ri');
}

function triggerPoseSpeech(item) {
  const langChoice = document.getElementById('voice-lang-select')?.value || 'zh';
  const enableSanskrit = document.getElementById('voice-sanskrit-toggle')?.checked ?? true;

  if (enableSanskrit && item.sanskrit) {
    // 使用平滑音標念梵文
    const smoothSanskrit = sanitizeSanskritForSpeech(item.sanskrit);
    speakVoice(smoothSanskrit, 'sa');
  }

  setTimeout(() => {
    let sideZh = '';
    let sideEn = '';
    if (item.selectedSide === 'left') { sideZh = '，左側'; sideEn = ', Left side'; }
    if (item.selectedSide === 'right') { sideZh = '，右側'; sideEn = ', Right side'; }

    if (langChoice === 'en') {
      const enText = item.cuesEn || item.cues;
      speakVoice(`${item.en}${sideEn}. ${enText}`, 'en');
    } else if (langChoice === 'dual') {
      speakVoice(`${item.zh}${sideZh}。${item.en}。${item.cues}`, 'zh');
    } else {
      speakVoice(`${item.zh}${sideZh}。${item.cues}`, 'zh');
    }
  }, enableSanskrit ? 1600 : 100);
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

// 渲染動作庫 (中英文並列排版)
function renderPoseGrid() {
  const container = document.getElementById('pose-grid');
  if (!container || !window.YOGA_ASANAS) return;
  container.innerHTML = '';

  const filtered = window.YOGA_ASANAS.filter(p => {
    const matchType = (AppState.activeFilterType === 'all') || (p.type === AppState.activeFilterType);
    const search = AppState.activeSearchKeyword.toLowerCase().trim();
    const matchSearch = !search ||
      p.zh.toLowerCase().includes(search) ||
      p.en.toLowerCase().includes(search) ||
      (p.sanskrit && p.sanskrit.toLowerCase().includes(search)) ||
      (p.chakras && p.chakras.toLowerCase().includes(search)) ||
      (p.meridians && p.meridians.toLowerCase().includes(search)) ||
      p.cues.toLowerCase().includes(search);
    return matchType && matchSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = '<div class="col-span-full py-16 text-center text-xs text-stone-400">查無相符體位 (No Poses Found)</div>';
    return;
  }

  filtered.forEach(p => {
    const card = document.createElement('div');
    card.className = 'p-3 bg-white border border-stone-200/90 rounded-2xl flex items-center justify-between gap-3 shadow-sm hover:border-amber-600/50 transition';

    const isYin = p.type === 'yin';
    const tagBg = isYin ? 'bg-teal-50 text-teal-800 border-teal-200/60' : 'bg-amber-50 text-amber-800 border-amber-200/60';
    const typeLabel = isYin ? 'Yin 陰' : 'Yang 陽';

    card.innerHTML = `
      <div class="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer btn-open-detail">
        <div class="w-10 h-10 rounded-xl flex flex-col items-center justify-center font-bold text-[10px] shrink-0 border ${tagBg}">
          <span>${isYin ? 'YIN' : 'PPB'}</span>
          <span class="text-[9px] font-mono">${String(p.id % 100).padStart(2, '0')}</span>
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-1.5 mb-0.5">
            <span class="text-[9px] px-1.5 py-0.2 rounded font-semibold ${tagBg}">${typeLabel}</span>
            ${p.chakras ? `<span class="text-[9px] text-stone-400 truncate max-w-[120px]">${p.chakras}</span>` : ''}
          </div>
          <!-- 中英文並列顯示 -->
          <h4 class="font-bold text-xs text-stone-800 truncate">
            ${p.zh} <span class="text-stone-500 font-medium font-sans">/ ${p.en}</span>
          </h4>
          <p class="text-[9px] text-amber-800/80 italic font-serif truncate mt-0.5">${p.sanskrit || ''}</p>
        </div>
      </div>

      <div class="flex items-center gap-1.5 shrink-0">
        <button class="btn-open-detail p-2 text-stone-400 hover:text-stone-700 bg-stone-50 rounded-xl" title="Detail">
          <i class="ph ph-info text-base"></i>
        </button>
        <button class="btn-add-pose px-3 py-2 bg-amber-50 hover:bg-amber-600 text-amber-800 hover:text-white rounded-xl text-xs font-semibold transition flex items-center gap-1 shadow-sm active:scale-95">
          <i class="ph ph-plus text-sm"></i>
          <span>加入</span>
        </button>
      </div>
    `;

    card.querySelectorAll('.btn-open-detail').forEach(el => el.addEventListener('click', () => openPoseModal(p.id)));
    card.querySelector('.btn-add-pose').addEventListener('click', () => {
      addPoseToCurrentSequence(p.id);
      showToast(`已加入: ${p.zh} (${p.en})`);
    });

    container.appendChild(card);
  });
}

// 加入體位至序列
function addPoseToCurrentSequence(poseId, side = 'both', duration = null) {
  const p = window.YOGA_ASANAS.find(x => x.id === poseId);
  if (!p) return;

  AppState.currentSequence.push({
    uniqueId: 'pose_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    poseId: p.id,
    type: p.type || 'yang',
    zh: p.zh,
    en: p.en,
    sanskrit: p.sanskrit || '',
    cues: p.cues,
    cuesEn: p.cuesEn || p.cues,
    duration: duration || p.duration || 30,
    selectedSide: side,
    hasSideOption: !!p.sideMode
  });

  renderSequenceList();
}

// 渲染序列清單 (中英並列)
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

    const isYin = item.type === 'yin';
    const tagBg = isYin ? 'bg-teal-50 text-teal-800' : 'bg-amber-50 text-amber-800';

    card.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2.5 min-w-0">
          <span class="w-5 h-5 rounded-md bg-stone-100 flex items-center justify-center font-bold text-[10px] text-stone-600 shrink-0">
            ${index + 1}
          </span>
          <div class="min-w-0">
            <div class="flex items-center gap-1.5">
              <span class="text-[9px] px-1 rounded font-semibold ${tagBg}">${isYin ? 'Yin' : 'Yang'}</span>
              <h4 class="font-bold text-xs text-stone-800 truncate">${item.zh} <span class="font-normal text-stone-500">/ ${item.en}</span></h4>
            </div>
            <p class="text-[10px] text-amber-800/80 italic font-serif truncate">${item.sanskrit}</p>
          </div>
        </div>

        <div class="flex items-center gap-1.5 shrink-0">
          <div class="flex items-center bg-stone-50 border border-stone-200 rounded-lg px-1.5 py-0.5">
            <input type="number" min="5" max="900" step="10" class="duration-input w-12 text-center text-xs font-semibold bg-transparent text-stone-700" value="${item.duration}">
            <span class="text-[10px] text-stone-400">s (秒)</span>
          </div>
          <button class="btn-delete p-1.5 text-stone-400 hover:text-rose-600 rounded-lg" title="Delete">
            <i class="ph ph-trash text-base"></i>
          </button>
        </div>
      </div>

      <div class="flex items-center justify-between pt-1 border-t border-stone-100 text-xs">
        <div class="flex items-center gap-2">
          ${item.hasSideOption ? `
            <select class="side-selector text-[11px] bg-amber-50 border border-amber-200 text-amber-800 rounded px-1.5 py-0.5">
              <option value="both" ${item.selectedSide === 'both' ? 'selected' : ''}>雙側 (Both)</option>
              <option value="left" ${item.selectedSide === 'left' ? 'selected' : ''}>左側 (Left)</option>
              <option value="right" ${item.selectedSide === 'right' ? 'selected' : ''}>右側 (Right)</option>
            </select>
          ` : '<span class="text-[10px] text-stone-400">對稱體位 (Both Sides)</span>'}
        </div>

        <div class="flex items-center gap-2 text-stone-400">
          <button class="btn-move-up p-1 hover:text-stone-700 ${index === 0 ? 'opacity-25 pointer-events-none' : ''}" title="Move Up">
            <i class="ph ph-arrow-up text-sm"></i>
          </button>
          <button class="btn-move-down p-1 hover:text-stone-700 ${index === AppState.currentSequence.length - 1 ? 'opacity-25 pointer-events-none' : ''}" title="Move Down">
            <i class="ph ph-arrow-down text-sm"></i>
          </button>
          <button class="btn-dup p-1 hover:text-amber-700" title="Duplicate & Switch Side">
            <i class="ph ph-copy text-sm"></i>
          </button>
        </div>
      </div>
    `;

    if (item.hasSideOption) {
      card.querySelector('.side-selector')?.addEventListener('change', (e) => { item.selectedSide = e.target.value; });
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

function updateSequenceStats() {
  const countEl = document.getElementById('seq-pose-count');
  const timeEl = document.getElementById('seq-total-time');
  const badgeEl = document.getElementById('tab-badge');

  const count = AppState.currentSequence.length;
  if (countEl) countEl.innerText = `${count} Poses (體位)`;
  if (badgeEl) {
    badgeEl.innerText = count;
    if (count > 0) badgeEl.classList.remove('hidden');
    else badgeEl.classList.add('hidden');
  }

  const totalSec = AppState.currentSequence.reduce((acc, cur) => acc + (parseInt(cur.duration) || 0), 0);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  if (timeEl) timeEl.innerText = `${min}m ${sec}s (${min}分${sec}秒)`;
}

// 核心操作：新建空白序列
function createNewBlankSequence() {
  const name = prompt("請輸入新課表名稱 (Sequence Name)：", "自訂瑜珈課表 (Custom Flow)");
  if (name === null) return;
  AppState.currentSequenceTitle = name.trim() || "未命名課表";
  const titleInput = document.getElementById('sequence-title-input');
  if (titleInput) titleInput.value = AppState.currentSequenceTitle;

  AppState.currentSequence = [];
  const select = document.getElementById('preset-sequence-select');
  if (select) select.value = "";

  renderSequenceList();
  showToast(`已建立空白序列 (Created): ${AppState.currentSequenceTitle}`);
}

// 核心操作：清空當前序列
function clearCurrentSequence() {
  if (AppState.currentSequence.length === 0) {
    showToast("目前序列是空的 (Already Empty)！");
    return;
  }
  if (confirm(`確定清空「${AppState.currentSequenceTitle}」的所有動作？(Clear all poses?)`)) {
    AppState.currentSequence = [];
    renderSequenceList();
    showToast("已清空序列 (Cleared)！");
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
  found.poses.forEach(id => addPoseToCurrentSequence(id));
  renderSequenceList();
  showToast(`已載入 (Loaded): ${found.name}`);
}

// 初始化 30 套官方課表分組下拉選單
function refreshPresetDropdown() {
  const select = document.getElementById('preset-sequence-select');
  if (!select || !window.PRESET_SEQUENCES) return;
  select.innerHTML = '<option value="">-- 載入官方課表 / 自訂庫 (Load Presets - 30 Flows) --</option>';

  const topicMap = {};
  window.PRESET_SEQUENCES.forEach(ps => {
    const t = ps.topic || '官方推薦課表';
    if (!topicMap[t]) topicMap[t] = [];
    topicMap[t].push(ps);
  });

  Object.keys(topicMap).forEach(topic => {
    const group = document.createElement('optgroup');
    group.label = `── ${topic} ──`;
    topicMap[topic].forEach(ps => {
      const opt = document.createElement('option');
      opt.value = 'preset_' + ps.id;
      opt.innerText = `${ps.name} (${ps.duration})`;
      group.appendChild(opt);
    });
    select.appendChild(group);
  });

  const savedKeys = Object.keys(AppState.customSequences);
  if (savedKeys.length > 0) {
    const customGroup = document.createElement('optgroup');
    customGroup.label = '── ⭐ 我的自訂課表 (My Custom Flows) ──';
    savedKeys.forEach(k => {
      const opt = document.createElement('option');
      opt.value = 'custom_' + k;
      opt.innerText = `⭐ ${k} (${AppState.customSequences[k].length} Poses)`;
      customGroup.appendChild(opt);
    });
    select.appendChild(customGroup);
  }
}

function saveCurrentCustomSequence() {
  if (AppState.currentSequence.length === 0) {
    alert("目前序列中沒有體位動作，請先挑選加入！");
    return;
  }
  const currentTitle = document.getElementById('sequence-title-input')?.value.trim() || AppState.currentSequenceTitle || '自訂課表';
  const newTitle = prompt("請輸入此套課表名稱 (Sequence Name)：", currentTitle);
  if (!newTitle) return;

  AppState.customSequences[newTitle] = JSON.parse(JSON.stringify(AppState.currentSequence));
  AppState.currentSequenceTitle = newTitle;
  const titleInput = document.getElementById('sequence-title-input');
  if (titleInput) titleInput.value = newTitle;

  localStorage.setItem('yoga_flow_custom_db', JSON.stringify(AppState.customSequences));
  refreshPresetDropdown();
  showToast(`已成功儲存自訂課表「${newTitle}」！`);
}

function loadCustomSequence(title) {
  if (!AppState.customSequences[title]) return;
  AppState.currentSequenceTitle = title;
  const titleInput = document.getElementById('sequence-title-input');
  if (titleInput) titleInput.value = title;
  AppState.currentSequence = JSON.parse(JSON.stringify(AppState.customSequences[title]));
  renderSequenceList();
  showToast(`已載入自訂課表: ${title}`);
}

// 動作詳情 Modal (雙語呈現)
let activeModalPoseId = null;
function openPoseModal(poseId) {
  const p = window.YOGA_ASANAS.find(x => x.id === poseId);
  if (!p) return;
  activeModalPoseId = p.id;

  document.getElementById('modal-card-id').innerText = `#${p.code || p.id}`;
  document.getElementById('modal-title').innerText = `${p.zh} • ${p.en}`;
  document.getElementById('modal-sanskrit-name').innerText = p.sanskrit || '';
  document.getElementById('modal-benefits').innerText = p.benefits || (p.meridians ? `經絡 (Meridians)：${p.meridians}。脈輪 (Chakras)：${p.chakras}` : '活化身心能量，舒展全身筋膜。');
  document.getElementById('modal-cues-zh').innerText = p.cues;
  document.getElementById('modal-cues-en').innerText = p.cuesEn || p.cues;
  document.getElementById('modal-details').innerText = p.details || '保持呼吸綿密深長，沉浸在體位停留的放鬆感受中。';
  document.getElementById('modal-precautions').innerText = p.precautions || '如有急性疼痛或身體不適，請隨時退出體位。';

  document.getElementById('pose-detail-modal')?.classList.remove('hidden');
}

function closePoseModal() {
  document.getElementById('pose-detail-modal')?.classList.add('hidden');
}

// 播放器邏輯 (中英文雙語同步呈現)
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
    alert("🎉 練習結束！Namaste！(Practice Complete)");
    closeFlowPlayer();
    return;
  }

  const currentItem = AppState.currentSequence[pState.index];
  pState.secondsLeft = parseInt(currentItem.duration) || 30;
  pState.totalSeconds = pState.secondsLeft;

  document.getElementById('player-seq-name').innerText = AppState.currentSequenceTitle;
  document.getElementById('player-pose-index').innerText = `體位 ${pState.index + 1} / ${AppState.currentSequence.length} (Pose)`;
  document.getElementById('player-sanskrit-tag').innerText = currentItem.sanskrit || '';
  
  // 主標題中文、副標題英文
  document.getElementById('player-pose-title-zh').innerText = currentItem.zh;

  let sideStr = "雙側 (Both Sides)";
  if (currentItem.selectedSide === 'left') sideStr = "左側 (Left Side)";
  if (currentItem.selectedSide === 'right') sideStr = "右側 (Right Side)";
  document.getElementById('player-pose-title-en').innerText = `${currentItem.en} • ${sideStr}`;

  // 雙語口令展示
  document.getElementById('player-cues-zh').innerHTML = `<strong class="text-amber-400 mr-1">【中】</strong>${currentItem.cues}`;
  document.getElementById('player-cues-en').innerHTML = `<strong class="text-amber-500 mr-1 not-italic font-sans">【EN】</strong>${currentItem.cuesEn || currentItem.cues}`;

  const nextItem = AppState.currentSequence[pState.index + 1];
  document.getElementById('player-next-pose-name').innerText = nextItem ? `${nextItem.zh} / ${nextItem.en}` : "全序列完成 (Namaste)";

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

window.addEventListener('DOMContentLoaded', () => {
  try {
    const raw = localStorage.getItem('yoga_flow_custom_db');
    if (raw) AppState.customSequences = JSON.parse(raw);
  } catch (e) {}

  refreshPresetDropdown();
  renderPoseGrid();
  loadPresetSequence('hips_l1');

  document.getElementById('preset-sequence-select')?.addEventListener('change', (e) => {
    const val = e.target.value;
    if (!val) return;
    if (val.startsWith('preset_')) loadPresetSequence(val.replace('preset_', ''));
    else if (val.startsWith('custom_')) loadCustomSequence(val.replace('custom_', ''));
  });

  document.getElementById('btn-quick-new')?.addEventListener('click', createNewBlankSequence);
  document.getElementById('btn-quick-clear')?.addEventListener('click', clearCurrentSequence);
  document.getElementById('btn-quick-save')?.addEventListener('click', saveCurrentCustomSequence);
  document.getElementById('btn-empty-goto-lib')?.addEventListener('click', () => switchTab('library'));

  document.querySelectorAll('.type-filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.type-filter-btn').forEach(b => {
        b.className = 'type-filter-btn px-3 py-1 rounded-lg font-medium whitespace-nowrap bg-stone-100 text-stone-600';
      });
      e.target.className = 'type-filter-btn px-3 py-1 rounded-lg font-medium whitespace-nowrap bg-amber-800 text-white';
      AppState.activeFilterType = e.target.getAttribute('data-type');
      renderPoseGrid();
    });
  });

  document.getElementById('search-input')?.addEventListener('input', (e) => {
    AppState.activeSearchKeyword = e.target.value;
    renderPoseGrid();
  });

  document.getElementById('tab-library')?.addEventListener('click', () => switchTab('library'));
  document.getElementById('tab-sequence')?.addEventListener('click', () => switchTab('sequence'));
  document.getElementById('modal-close-btn')?.addEventListener('click', closePoseModal);
  document.getElementById('modal-add-btn')?.addEventListener('click', () => {
    if (activeModalPoseId) {
      addPoseToCurrentSequence(activeModalPoseId);
      closePoseModal();
      showToast("已加入課表 (Added)！");
    }
  });

  document.getElementById('tab-play')?.addEventListener('click', startFlowPlayer);
  document.getElementById('player-close-btn')?.addEventListener('click', closeFlowPlayer);
  document.getElementById('player-sound-test')?.addEventListener('click', playTibetanBowlSound);
  document.getElementById('player-toggle-btn')?.addEventListener('click', () => {
    AppState.player.isPaused = !AppState.player.isPaused;
    const icon = document.getElementById('player-toggle-icon');
    if (icon) icon.className = AppState.player.isPaused ? 'ph-fill ph-play text-2xl' : 'ph-fill ph-pause text-2xl';
  });
  document.getElementById('player-prev-btn')?.addEventListener('click', () => {
    if (AppState.player.index > 0) { AppState.player.index--; loadPlayerStep(); }
  });
  document.getElementById('player-next-btn')?.addEventListener('click', () => {
    AppState.player.index++;
    loadPlayerStep();
  });
});