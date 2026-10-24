/**
 * Yoga Flow Studio - 核心邏輯 (支援自訂動作卡片新增與儲存)
 */

const AppState = {
  activeTab: 'sequence',
  activeFilterType: 'all', // 'all' | 'yang' | 'yin' | 'custom'
  activeSearchKeyword: '',
  currentSequence: [],
  customSequences: {},
  customPoses: [], // 使用者自訂動作卡片庫
  currentSequenceTitle: '自訂練習課表',
  
  editingItemUniqueId: null,

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

// 頌缽音效
function playTibetanBowlSound() {
  try {
    if (!AppState.player.audioCtx) {
      AppState.player.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = AppState.player.audioCtx;
    if (ctx && ctx.state === 'suspended') ctx.resume();
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
    console.warn("Audio error:", e);
  }
}

// 梵文音素平滑化
function getPhoneticSanskrit(text) {
  if (!text) return '';
  return text
    .replace(/ā/g, 'aa')
    .replace(/ī/g, 'ee')
    .replace(/ū/g, 'oo')
    .replace(/ṛ/g, 'ri')
    .replace(/ś/g, 'sh')
    .replace(/ṣ/g, 'sh')
    .replace(/c/g, 'ch')
    .replace(/asana/gi, ' aasana')
    .replace(/svana/gi, 'shvana')
    .replace(/mukha/gi, 'mookha')
    .replace(/adho/gi, 'ud-ho')
    .replace(/baddha/gi, 'bud-dha')
    .replace(/virabhadra/gi, 'veera-bhadra')
    .trim();
}

// 帶超時保護的非阻塞語音
function speakAsync(text, lang = 'zh', timeoutMs = 6000) {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window) || !text) {
      resolve();
      return;
    }

    let isDone = false;
    const safeResolve = () => {
      if (!isDone) {
        isDone = true;
        resolve();
      }
    };

    const timer = setTimeout(safeResolve, timeoutMs);

    try {
      const u = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();

      if (lang === 'sa') {
        const sanskritVoice = voices.find(v => 
          v.lang === 'sa-IN' || v.lang === 'hi-IN' || v.lang.startsWith('hi') || v.lang === 'it-IT'
        );
        if (sanskritVoice) u.voice = sanskritVoice;
        u.lang = 'hi-IN';
        u.rate = 0.80;
        u.pitch = 0.92;
      } else if (lang === 'en') {
        const enVoice = voices.find(v => v.lang === 'en-US' && (v.name.includes('Natural') || v.name.includes('Samantha')));
        if (enVoice) u.voice = enVoice;
        u.lang = 'en-US';
        u.rate = 0.90;
      } else {
        const zhVoice = voices.find(v => v.lang === 'zh-TW' || v.lang.startsWith('zh'));
        if (zhVoice) u.voice = zhVoice;
        u.lang = 'zh-TW';
        u.rate = 0.92;
      }

      u.onend = () => { clearTimeout(timer); safeResolve(); };
      u.onerror = () => { clearTimeout(timer); safeResolve(); };

      window.speechSynthesis.speak(u);
    } catch (err) {
      clearTimeout(timer);
      safeResolve();
    }
  });
}

// 體位語音流程
async function triggerPoseSpeech(item) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();

  const langChoice = document.getElementById('voice-lang-select')?.value || 'dual';
  const enableSanskrit = document.getElementById('voice-sanskrit-toggle')?.checked ?? true;

  if (enableSanskrit && item.sanskrit) {
    const phonetic = getPhoneticSanskrit(item.sanskrit);
    await speakAsync(phonetic, 'sa', 3500);
    await new Promise(r => setTimeout(r, 200));
  }

  let sideZh = '';
  let sideEn = '';
  if (item.selectedSide === 'left') { sideZh = '，左側'; sideEn = ', Left side'; }
  if (item.selectedSide === 'right') { sideZh = '，右側'; sideEn = ', Right side'; }

  if (langChoice === 'en') {
    const enText = item.cuesEn || item.cues;
    await speakAsync(`${item.en || item.zh}${sideEn}. ${enText}`, 'en', 7000);
  } else if (langChoice === 'dual') {
    await speakAsync(`${item.zh}${sideZh}。${item.en || ''}。${item.cues}`, 'zh', 8000);
  } else {
    await speakAsync(`${item.zh}${sideZh}。${item.cues}`, 'zh', 7000);
  }
}

// 分頁切換
function switchTab(targetTab) {
  AppState.activeTab = targetTab;
  const libView = document.getElementById('view-library');
  const seqView = document.getElementById('view-sequence');
  const btnLib = document.getElementById('tab-library');
  const btnSeq = document.getElementById('tab-sequence');

  if (targetTab === 'library') {
    if (libView) libView.classList.remove('hidden');
    if (seqView) seqView.classList.add('hidden');
    if (btnLib) btnLib.className = 'tab-btn flex flex-col items-center gap-1 text-amber-700 font-bold text-[11px]';
    if (btnSeq) btnSeq.className = 'tab-btn flex flex-col items-center gap-1 text-stone-400 font-medium text-[11px] relative';
  } else {
    if (libView) libView.classList.add('hidden');
    if (seqView) seqView.classList.remove('hidden');
    if (btnSeq) btnSeq.className = 'tab-btn flex flex-col items-center gap-1 text-amber-700 font-bold text-[11px] relative';
    if (btnLib) btnLib.className = 'tab-btn flex flex-col items-center gap-1 text-stone-400 font-medium text-[11px]';
  }
}

// 取得全部體位（官方 142 + 使用者自訂）
function getAllPoses() {
  const official = window.YOGA_ASANAS || [];
  return [...AppState.customPoses, ...official];
}

// 渲染動作庫列表
function renderPoseGrid() {
  const container = document.getElementById('pose-grid');
  if (!container) return;

  const allPoses = getAllPoses();
  container.innerHTML = '';

  const filtered = allPoses.filter(p => {
    let matchType = true;
    if (AppState.activeFilterType === 'custom') {
      matchType = !!p.isCustom;
    } else if (AppState.activeFilterType !== 'all') {
      matchType = (p.type === AppState.activeFilterType);
    }

    const search = AppState.activeSearchKeyword.toLowerCase().trim();
    const matchSearch = !search ||
      (p.zh && p.zh.toLowerCase().includes(search)) ||
      (p.en && p.en.toLowerCase().includes(search)) ||
      (p.sanskrit && p.sanskrit.toLowerCase().includes(search)) ||
      (p.chakras && p.chakras.toLowerCase().includes(search)) ||
      (p.meridians && p.meridians.toLowerCase().includes(search)) ||
      (p.cues && p.cues.toLowerCase().includes(search));
    return matchType && matchSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = '<div class="col-span-full py-16 text-center text-xs text-stone-400">查無相符體位</div>';
    return;
  }

  filtered.forEach(p => {
    const card = document.createElement('div');
    card.className = 'p-3 bg-white border border-stone-200/90 rounded-2xl flex items-center justify-between gap-3 shadow-sm hover:border-amber-600/50 transition';

    const isCustom = !!p.isCustom;
    const isYin = p.type === 'yin';
    let tagBg = isYin ? 'bg-teal-50 text-teal-800 border-teal-200/60' : 'bg-amber-50 text-amber-800 border-amber-200/60';
    if (isCustom) tagBg = 'bg-rose-50 text-rose-800 border-rose-200/60';

    let prefix = isYin ? 'YIN' : 'PPB';
    if (isCustom) prefix = '自訂';

    card.innerHTML = `
      <div class="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer btn-open-detail">
        <div class="w-10 h-10 rounded-xl flex flex-col items-center justify-center font-bold text-[10px] shrink-0 border ${tagBg}">
          <span>${prefix}</span>
          <span class="text-[9px] font-mono">${String(p.id % 100).padStart(2, '0')}</span>
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-1.5 mb-0.5">
            <span class="text-[9px] px-1.5 py-0.2 rounded font-semibold ${tagBg}">
              ${isCustom ? '自訂體位' : (isYin ? '陰瑜珈' : '陽流動')}
            </span>
            ${p.chakras ? `<span class="text-[9px] text-stone-400 truncate max-w-[110px]">${p.chakras}</span>` : ''}
          </div>
          <h4 class="font-bold text-sm text-stone-800 truncate">${p.zh}</h4>
          <p class="text-[11px] text-stone-500 font-medium truncate">${p.en || ''}</p>
          <p class="text-[9px] text-amber-800/80 italic font-serif truncate mt-0.5">${p.sanskrit || ''}</p>
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

    card.querySelectorAll('.btn-open-detail').forEach(el => el.addEventListener('click', () => openPoseModal(p.id)));
    card.querySelector('.btn-add-pose').addEventListener('click', () => {
      addPoseToCurrentSequence(p.id);
      showToast(`已加入: ${p.zh}`);
    });

    container.appendChild(card);
  });
}

// 加入體位至序列
function addPoseToCurrentSequence(poseId, side = 'both', duration = null) {
  const allPoses = getAllPoses();
  const p = allPoses.find(x => x.id === poseId);
  if (!p) return;

  AppState.currentSequence.push({
    uniqueId: 'pose_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    poseId: p.id,
    type: p.type || 'yang',
    zh: p.zh,
    en: p.en || '',
    sanskrit: p.sanskrit || '',
    cues: p.cues,
    cuesEn: p.cuesEn || p.cues,
    duration: duration || p.duration || 30,
    selectedSide: side,
    hasSideOption: !!p.sideMode
  });

  renderSequenceList();
}

// 渲染序列列表
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
    card.className = 'bg-white p-3 rounded-2xl border border-stone-200/90 shadow-sm space-y-2.5';

    const isYin = item.type === 'yin';
    const tagBg = isYin ? 'bg-teal-50 text-teal-800' : 'bg-amber-50 text-amber-800';

    card.innerHTML = `
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2.5 min-w-0 flex-1">
          <span class="w-5 h-5 rounded-md bg-stone-100 flex items-center justify-center font-bold text-[10px] text-stone-600 shrink-0">
            ${index + 1}
          </span>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-1.5">
              <span class="text-[9px] px-1 rounded font-semibold ${tagBg}">${isYin ? '陰' : '陽'}</span>
              <h4 class="font-bold text-xs text-stone-800 truncate">${item.zh}</h4>
            </div>
            <p class="text-[10px] text-stone-400 truncate">${item.en} • <span class="italic font-serif">${item.sanskrit}</span></p>
          </div>
        </div>

        <div class="flex items-center gap-1.5 shrink-0">
          <div class="flex items-center bg-stone-50 border border-stone-200 rounded-lg px-2 py-0.5 text-xs">
            <strong class="text-amber-800 font-semibold">${item.duration}</strong>
            <span class="text-[10px] text-stone-400 ml-0.5">秒</span>
          </div>
          <button class="btn-edit p-1.5 text-stone-500 hover:text-amber-700 hover:bg-stone-50 rounded-lg transition" title="編輯卡片內容">
            <i class="ph ph-pencil-simple text-base"></i>
          </button>
          <button class="btn-delete p-1.5 text-stone-400 hover:text-rose-600 rounded-lg transition" title="刪除">
            <i class="ph ph-trash text-base"></i>
          </button>
        </div>
      </div>

      <div class="flex items-center justify-between pt-1 border-t border-stone-100 text-xs">
        <div class="flex items-center gap-1.5 text-stone-500">
          <span class="text-[10px] text-stone-400">側別:</span>
          ${item.hasSideOption ? `
            <select class="side-selector text-[11px] bg-amber-50 border border-amber-200 text-amber-800 rounded px-1.5 py-0.5 focus:ring-0">
              <option value="both" ${item.selectedSide === 'both' ? 'selected' : ''}>雙側對稱</option>
              <option value="left" ${item.selectedSide === 'left' ? 'selected' : ''}>左側 (Left)</option>
              <option value="right" ${item.selectedSide === 'right' ? 'selected' : ''}>右側 (Right)</option>
            </select>
          ` : '<span class="text-[10px] text-stone-500 font-medium">雙側對稱</span>'}
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

    card.querySelector('.btn-edit')?.addEventListener('click', () => openEditPoseModal(item.uniqueId));
    if (item.hasSideOption) {
      card.querySelector('.side-selector')?.addEventListener('change', (e) => { item.selectedSide = e.target.value; });
    }
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
  if (countEl) countEl.innerText = `${count} 體位`;
  if (badgeEl) {
    badgeEl.innerText = count;
    if (count > 0) badgeEl.classList.remove('hidden');
    else badgeEl.classList.add('hidden');
  }

  const totalSec = AppState.currentSequence.reduce((acc, cur) => acc + (parseInt(cur.duration) || 0), 0);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  if (timeEl) timeEl.innerText = `${min} 分 ${sec} 秒`;
}

// 【自訂動作新增功能】
function openCreatePoseModal() {
  document.getElementById('create-input-zh').value = '';
  document.getElementById('create-input-en').value = '';
  document.getElementById('create-input-sanskrit').value = '';
  document.getElementById('create-input-duration').value = '60';
  document.getElementById('create-input-benefits').value = '';
  document.getElementById('create-input-cues-zh').value = '';
  document.getElementById('create-input-cues-en').value = '';
  document.getElementById('create-input-precautions').value = '';

  document.getElementById('pose-create-modal')?.classList.remove('hidden');
}

function closeCreatePoseModal() {
  document.getElementById('pose-create-modal')?.classList.add('hidden');
}

function saveNewCustomPose() {
  const zh = document.getElementById('create-input-zh')?.value.trim();
  const cuesZh = document.getElementById('create-input-cues-zh')?.value.trim();

  if (!zh) {
    alert("請至少輸入中文名稱！");
    return;
  }
  if (!cuesZh) {
    alert("請至少輸入中文引導口令！");
    return;
  }

  const newPose = {
    id: 500 + AppState.customPoses.length + 1,
    code: `CUS-${String(AppState.customPoses.length + 1).padStart(2, '0')}`,
    isCustom: true,
    type: document.getElementById('create-input-type')?.value || 'yang',
    category: document.getElementById('create-input-category')?.value || 'warmup',
    zh: zh,
    en: document.getElementById('create-input-en')?.value.trim() || zh,
    sanskrit: document.getElementById('create-input-sanskrit')?.value.trim() || '',
    duration: parseInt(document.getElementById('create-input-duration')?.value) || 60,
    sideMode: document.getElementById('create-input-side')?.value === 'dual' ? 'dual' : null,
    benefits: document.getElementById('create-input-benefits')?.value.trim() || '自訂體位效益',
    cues: cuesZh,
    cuesEn: document.getElementById('create-input-cues-en')?.value.trim() || cuesZh,
    details: '自訂動作，專注呼吸與自我感知。',
    precautions: document.getElementById('create-input-precautions')?.value.trim() || '注意身體極限，請隨時安全退出。'
  };

  AppState.customPoses.unshift(newPose);
  localStorage.setItem('yoga_flow_custom_poses', JSON.stringify(AppState.customPoses));

  closeCreatePoseModal();
  renderPoseGrid();
  showToast(`已成功新增自訂動作「${zh}」！`);
}

// 序列中單一卡片內容編輯
function openEditPoseModal(uniqueId) {
  const item = AppState.currentSequence.find(x => x.uniqueId === uniqueId);
  if (!item) return;

  AppState.editingItemUniqueId = uniqueId;

  document.getElementById('edit-input-zh').value = item.zh || '';
  document.getElementById('edit-input-en').value = item.en || '';
  document.getElementById('edit-input-duration').value = item.duration || 30;
  document.getElementById('edit-input-side').value = item.selectedSide || 'both';
  document.getElementById('edit-input-cues-zh').value = item.cues || '';
  document.getElementById('edit-input-cues-en').value = item.cuesEn || '';

  document.getElementById('pose-edit-modal')?.classList.remove('hidden');
}

function closeEditPoseModal() {
  AppState.editingItemUniqueId = null;
  document.getElementById('pose-edit-modal')?.classList.add('hidden');
}

function saveEditedPoseContent() {
  if (!AppState.editingItemUniqueId) return;
  const item = AppState.currentSequence.find(x => x.uniqueId === AppState.editingItemUniqueId);
  if (!item) return;

  item.zh = document.getElementById('edit-input-zh')?.value.trim() || item.zh;
  item.en = document.getElementById('edit-input-en')?.value.trim() || item.en;
  item.duration = parseInt(document.getElementById('edit-input-duration')?.value) || 30;
  item.selectedSide = document.getElementById('edit-input-side')?.value || 'both';
  item.cues = document.getElementById('edit-input-cues-zh')?.value.trim() || item.cues;
  item.cuesEn = document.getElementById('edit-input-cues-en')?.value.trim() || item.cuesEn;

  closeEditPoseModal();
  renderSequenceList();
  showToast("已成功更新動作卡片！");
}

// 新建空白序列
function createNewBlankSequence() {
  const name = prompt("請輸入新課表名稱：", "我的自訂瑜珈課表");
  if (name === null) return;
  AppState.currentSequenceTitle = name.trim() || "未命名課表";
  const titleInput = document.getElementById('sequence-title-input');
  if (titleInput) titleInput.value = AppState.currentSequenceTitle;

  AppState.currentSequence = [];
  const select = document.getElementById('preset-sequence-select');
  if (select) select.value = "";

  renderSequenceList();
  showToast(`已建立空白序列: ${AppState.currentSequenceTitle}`);
}

// 清空序列
function clearCurrentSequence() {
  if (AppState.currentSequence.length === 0) {
    showToast("目前序列是空的唷！");
    return;
  }
  if (confirm(`確定清空「${AppState.currentSequenceTitle}」的所有動作？`)) {
    AppState.currentSequence = [];
    renderSequenceList();
    showToast("已清空序列！");
  }
}

// 載入預設課表
function loadPresetSequence(presetId) {
  const presetList = window.PRESET_SEQUENCES || [];
  const found = presetList.find(p => p.id === presetId);
  if (!found) return;

  AppState.currentSequenceTitle = found.name;
  const titleInput = document.getElementById('sequence-title-input');
  if (titleInput) titleInput.value = found.name;

  AppState.currentSequence = [];
  if (Array.isArray(found.poses)) {
    found.poses.forEach(id => addPoseToCurrentSequence(id));
  }
  renderSequenceList();
  showToast(`已載入: ${found.name}`);
}

// 下拉選單渲染
function refreshPresetDropdown() {
  const select = document.getElementById('preset-sequence-select');
  if (!select) return;

  const presetList = window.PRESET_SEQUENCES || [];
  select.innerHTML = '<option value="">-- 載入官方推薦 / 自訂課表 (30 套) --</option>';

  const topicMap = {};
  presetList.forEach(ps => {
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
    customGroup.label = '── ⭐ 我的自訂課表 ──';
    savedKeys.forEach(k => {
      const opt = document.createElement('option');
      opt.value = 'custom_' + k;
      opt.innerText = `⭐ ${k} (${AppState.customSequences[k].length} 體位)`;
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

function loadCustomSequence(title) {
  if (!AppState.customSequences[title]) return;
  AppState.currentSequenceTitle = title;
  const titleInput = document.getElementById('sequence-title-input');
  if (titleInput) titleInput.value = title;
  AppState.currentSequence = JSON.parse(JSON.stringify(AppState.customSequences[title]));
  renderSequenceList();
  showToast(`已載入自訂課表: ${title}`);
}

// 動作詳情 Modal
let activeModalPoseId = null;
function openPoseModal(poseId) {
  const allPoses = getAllPoses();
  const p = allPoses.find(x => x.id === poseId);
  if (!p) return;
  activeModalPoseId = p.id;

  const cardIdEl = document.getElementById('modal-card-id');
  if (cardIdEl) cardIdEl.innerText = `#${p.code || p.id}`;
  
  const titleZhEl = document.getElementById('modal-title-zh');
  if (titleZhEl) titleZhEl.innerText = p.zh;

  const titleEnEl = document.getElementById('modal-title-en');
  if (titleEnEl) titleEnEl.innerText = p.en || '';
  
  const sanskritEl = document.getElementById('modal-sanskrit-name');
  if (sanskritEl) sanskritEl.innerText = p.sanskrit || '';
  
  const benefitsEl = document.getElementById('modal-benefits');
  if (benefitsEl) benefitsEl.innerText = p.benefits || (p.meridians ? `經絡：${p.meridians}。脈輪：${p.chakras}` : '活化身心能量，舒展全身筋膜。');
  
  const cuesZhEl = document.getElementById('modal-cues-zh');
  if (cuesZhEl) cuesZhEl.innerText = p.cues;
  
  const cuesEnEl = document.getElementById('modal-cues-en');
  if (cuesEnEl) cuesEnEl.innerText = p.cuesEn || p.cues;
  
  const detailsEl = document.getElementById('modal-details');
  if (detailsEl) detailsEl.innerText = p.details || '保持呼吸綿密深長，沉浸在體位停留的放鬆感受中。';
  
  const precautionsEl = document.getElementById('modal-precautions');
  if (precautionsEl) precautionsEl.innerText = p.precautions || '如有急性疼痛或身體不適，請隨時退出體位。';

  document.getElementById('pose-detail-modal')?.classList.remove('hidden');
}

function closePoseModal() {
  document.getElementById('pose-detail-modal')?.classList.add('hidden');
}

// 播放器核心
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
  if (AppState.player.timerId) {
    clearInterval(AppState.player.timerId);
    AppState.player.timerId = null;
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  document.getElementById('flow-player-modal')?.classList.add('hidden');
}

function loadPlayerStep() {
  if (AppState.player.timerId) {
    clearInterval(AppState.player.timerId);
    AppState.player.timerId = null;
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }

  const pState = AppState.player;

  if (pState.index >= AppState.currentSequence.length) {
    playTibetanBowlSound();
    speakVoice("恭喜完成今日課表練習。Namaste。", "zh");
    alert("🎉 練習結束！Namaste！");
    closeFlowPlayer();
    return;
  }

  const currentItem = AppState.currentSequence[pState.index];
  pState.secondsLeft = parseInt(currentItem.duration) || 30;
  pState.totalSeconds = pState.secondsLeft;

  const seqNameEl = document.getElementById('player-seq-name');
  if (seqNameEl) seqNameEl.innerText = AppState.currentSequenceTitle;

  const poseIndexEl = document.getElementById('player-pose-index');
  if (poseIndexEl) poseIndexEl.innerText = `體位 ${pState.index + 1} / ${AppState.currentSequence.length}`;

  const sanskritTagEl = document.getElementById('player-sanskrit-tag');
  if (sanskritTagEl) sanskritTagEl.innerText = currentItem.sanskrit || '';
  
  const titleZhEl = document.getElementById('player-pose-title-zh');
  if (titleZhEl) titleZhEl.innerText = currentItem.zh;

  let sideStr = "雙側對稱";
  if (currentItem.selectedSide === 'left') sideStr = "左側 (Left)";
  if (currentItem.selectedSide === 'right') sideStr = "右側 (Right)";
  
  const titleEnEl = document.getElementById('player-pose-title-en');
  if (titleEnEl) titleEnEl.innerText = `${currentItem.en} • ${sideStr}`;

  const cuesZhEl = document.getElementById('player-cues-zh');
  if (cuesZhEl) cuesZhEl.innerHTML = `<strong class="text-amber-400 mr-1">【中】</strong>${currentItem.cues}`;

  const cuesEnEl = document.getElementById('player-cues-en');
  if (cuesEnEl) cuesEnEl.innerHTML = `<strong class="text-amber-500 mr-1 not-italic font-sans">【EN】</strong>${currentItem.cuesEn || currentItem.cues}`;

  const nextItem = AppState.currentSequence[pState.index + 1];
  const nextPoseEl = document.getElementById('player-next-pose-name');
  if (nextPoseEl) nextPoseEl.innerText = nextItem ? `${nextItem.zh} / ${nextItem.en}` : "全序列完成 (Namaste)";

  playTibetanBowlSound();
  triggerPoseSpeech(currentItem);
  updatePlayerProgress();

  pState.timerId = setInterval(() => {
    if (!pState.isPaused) {
      pState.secondsLeft--;
      updatePlayerProgress();

      if (pState.secondsLeft <= 0) {
        clearInterval(pState.timerId);
        pState.timerId = null;
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

// 頁面初始化
window.addEventListener('DOMContentLoaded', () => {
  // 讀取自訂課表與自訂動作
  try {
    const rawSeq = localStorage.getItem('yoga_flow_custom_db');
    if (rawSeq) AppState.customSequences = JSON.parse(rawSeq);
    const rawPoses = localStorage.getItem('yoga_flow_custom_poses');
    if (rawPoses) AppState.customPoses = JSON.parse(rawPoses);
  } catch (e) {}

  refreshPresetDropdown();
  renderPoseGrid();

  if (window.PRESET_SEQUENCES && window.PRESET_SEQUENCES.length > 0) {
    loadPresetSequence('hips_l1');
  }

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

  // 【新增動作按鈕監聽】
  document.getElementById('btn-create-pose')?.addEventListener('click', openCreatePoseModal);
  document.getElementById('create-modal-close')?.addEventListener('click', closeCreatePoseModal);
  document.getElementById('create-modal-cancel')?.addEventListener('click', closeCreatePoseModal);
  document.getElementById('create-modal-save')?.addEventListener('click', saveNewCustomPose);

  // 編輯動作卡片監聽
  document.getElementById('edit-modal-close')?.addEventListener('click', closeEditPoseModal);
  document.getElementById('edit-modal-cancel')?.addEventListener('click', closeEditPoseModal);
  document.getElementById('edit-modal-save')?.addEventListener('click', saveEditedPoseContent);

  // 篩選按鈕
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

  const tabLib = document.getElementById('tab-library');
  const tabSeq = document.getElementById('tab-sequence');
  if (tabLib) tabLib.onclick = () => switchTab('library');
  if (tabSeq) tabSeq.onclick = () => switchTab('sequence');

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
      const allPoses = getAllPoses();
      const p = allPoses.find(x => x.id === activeModalPoseId);
      if (p) triggerPoseSpeech(p);
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
    if (AppState.player.index > 0) {
      AppState.player.index--;
      loadPlayerStep();
    }
  });

  document.getElementById('player-next-btn')?.addEventListener('click', () => {
    AppState.player.index++;
    loadPlayerStep();
  });
});