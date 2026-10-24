/**
 * Yoga Flow Studio - 動作圖示向量繪製模組 (Pose SVG Icons)
 * 仿手繪簡約風格向量圖形，無須依賴外部圖床，載入零延遲且離線支援
 */

window.getPoseSVG = function(poseId, category = 'warmup') {
  // 依據常見動作特徵提供辨識度極高的簡約瑜珈姿態向量圖
  const color = "#92400E"; // amber-800
  const stroke = "#B45309"; // amber-700
  const lightFill = "#FEF3C7"; // amber-100

  // 1: 貓牛式
  if (poseId === 1) {
    return `<svg viewBox="0 0 100 80" class="w-full h-full" fill="none" stroke="${stroke}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="28" cy="38" r="6" fill="${color}" stroke="none"/>
      <path d="M28 44 C 40 55, 60 55, 75 42" />
      <path d="M28 44 L 28 68" />
      <path d="M75 42 L 75 68" />
      <path d="M75 68 L 84 68" />
    </svg>`;
  }

  // 13: 山式
  if (poseId === 13) {
    return `<svg viewBox="0 0 100 80" class="w-full h-full" fill="none" stroke="${stroke}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="50" cy="18" r="6" fill="${color}" stroke="none"/>
      <line x1="50" y1="24" x2="50" y2="52" />
      <line x1="50" y1="32" x2="36" y2="46" />
      <line x1="50" y1="32" x2="64" y2="46" />
      <line x1="50" y1="52" x2="44" y2="72" />
      <line x1="50" y1="52" x2="56" y2="72" />
    </svg>`;
  }

  // 14: 站姿前彎
  if (poseId === 14) {
    return `<svg viewBox="0 0 100 80" class="w-full h-full" fill="none" stroke="${stroke}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="42" cy="52" r="6" fill="${color}" stroke="none"/>
      <path d="M54 72 L 54 36 L 42 46" />
      <path d="M48 38 L 40 68" />
    </svg>`;
  }

  // 15: 幻椅式
  if (poseId === 15) {
    return `<svg viewBox="0 0 100 80" class="w-full h-full" fill="none" stroke="${stroke}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="42" cy="18" r="6" fill="${color}" stroke="none"/>
      <line x1="42" y1="24" x2="48" y2="42" />
      <line x1="48" y1="42" x2="35" y2="54" />
      <line x1="35" y1="54" x2="35" y2="72" />
      <line x1="44" y1="28" x2="62" y2="14" />
    </svg>`;
  }

  // 17, 19, 62: 弓步式 / 勇士一式
  if ([17, 19, 62].includes(poseId)) {
    return `<svg viewBox="0 0 100 80" class="w-full h-full" fill="none" stroke="${stroke}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="48" cy="16" r="6" fill="${color}" stroke="none"/>
      <line x1="48" y1="22" x2="48" y2="44" />
      <line x1="48" y1="28" x2="48" y2="8" />
      <line x1="48" y1="44" x2="30" y2="52" />
      <line x1="30" y1="52" x2="30" y2="72" />
      <line x1="48" y1="44" x2="72" y2="60" />
      <line x1="72" y1="60" x2="76" y2="72" />
    </svg>`;
  }

  // 18: 三角式
  if (poseId === 18) {
    return `<svg viewBox="0 0 100 80" class="w-full h-full" fill="none" stroke="${stroke}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="38" cy="30" r="6" fill="${color}" stroke="none"/>
      <line x1="50" y1="46" x2="30" y2="72" />
      <line x1="50" y1="46" x2="70" y2="72" />
      <line x1="50" y1="46" x2="38" y2="34" />
      <line x1="38" y1="34" x2="30" y2="62" />
      <line x1="38" y1="34" x2="52" y2="12" />
    </svg>`;
  }

  // 20: 勇士二式
  if (poseId === 20) {
    return `<svg viewBox="0 0 100 80" class="w-full h-full" fill="none" stroke="${stroke}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="50" cy="18" r="6" fill="${color}" stroke="none"/>
      <line x1="50" y1="24" x2="50" y2="46" />
      <line x1="22" y1="30" x2="78" y2="30" />
      <line x1="50" y1="46" x2="30" y2="54" />
      <line x1="30" y1="54" x2="30" y2="72" />
      <line x1="50" y1="46" x2="72" y2="72" />
    </svg>`;
  }

  // 30: 樹式
  if (poseId === 30) {
    return `<svg viewBox="0 0 100 80" class="w-full h-full" fill="none" stroke="${stroke}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="50" cy="16" r="6" fill="${color}" stroke="none"/>
      <line x1="50" y1="22" x2="50" y2="48" />
      <path d="M40 28 L 50 20 L 60 28" />
      <line x1="50" y1="48" x2="50" y2="72" />
      <path d="M50 48 L 64 56 L 50 62" />
    </svg>`;
  }

  // 32: 勇士三式
  if (poseId === 32) {
    return `<svg viewBox="0 0 100 80" class="w-full h-full" fill="none" stroke="${stroke}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="28" cy="36" r="6" fill="${color}" stroke="none"/>
      <line x1="28" y1="36" x2="76" y2="36" />
      <line x1="52" y1="36" x2="52" y2="72" />
      <line x1="24" y1="36" x2="12" y2="36" />
    </svg>`;
  }

  // 34, 35: 眼鏡蛇式 / 上犬式
  if ([34, 35].includes(poseId)) {
    return `<svg viewBox="0 0 100 80" class="w-full h-full" fill="none" stroke="${stroke}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="34" cy="22" r="6" fill="${color}" stroke="none"/>
      <path d="M34 28 C 34 50, 48 62, 82 65" />
      <line x1="38" y1="44" x2="38" y2="65" />
    </svg>`;
  }

  // 38: 橋式
  if (poseId === 38) {
    return `<svg viewBox="0 0 100 80" class="w-full h-full" fill="none" stroke="${stroke}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="24" cy="62" r="6" fill="${color}" stroke="none"/>
      <path d="M26 62 Q 50 36 72 65" />
      <line x1="72" y1="65" x2="80" y2="65" />
      <line x1="28" y1="62" x2="55" y2="64" />
    </svg>`;
  }

  // 39: 輪式
  if (poseId === 39) {
    return `<svg viewBox="0 0 100 80" class="w-full h-full" fill="none" stroke="${stroke}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="30" cy="54" r="6" fill="${color}" stroke="none"/>
      <path d="M28 65 Q 50 18 76 65" />
    </svg>`;
  }

  // 40: 駱駝式
  if (poseId === 40) {
    return `<svg viewBox="0 0 100 80" class="w-full h-full" fill="none" stroke="${stroke}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="62" cy="26" r="6" fill="${color}" stroke="none"/>
      <path d="M46 68 L 46 48 Q 54 30 62 30" />
      <line x1="60" y1="38" x2="46" y2="64" />
    </svg>`;
  }

  // 44, 45: 肩立式 / 犁式
  if ([44, 45].includes(poseId)) {
    return `<svg viewBox="0 0 100 80" class="w-full h-full" fill="none" stroke="${stroke}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="36" cy="64" r="6" fill="${color}" stroke="none"/>
      <line x1="42" y1="64" x2="42" y2="20" />
      <line x1="42" y1="46" x2="34" y2="64" />
    </svg>`;
  }

  // 46, 47: 頭倒立
  if ([46, 47, 71, 72].includes(poseId)) {
    return `<svg viewBox="0 0 100 80" class="w-full h-full" fill="none" stroke="${stroke}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="50" cy="66" r="6" fill="${color}" stroke="none"/>
      <line x1="50" y1="62" x2="50" y2="16" />
      <path d="M40 68 L 50 64 L 60 68" />
    </svg>`;
  }

  // 48: 下犬式
  if (poseId === 48) {
    return `<svg viewBox="0 0 100 80" class="w-full h-full" fill="none" stroke="${stroke}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="34" cy="56" r="6" fill="${color}" stroke="none"/>
      <path d="M26 68 L 50 32 L 76 68" />
      <line x1="32" y1="52" x2="26" y2="68" />
    </svg>`;
  }

  // 51: 棒式
  if (poseId === 51) {
    return `<svg viewBox="0 0 100 80" class="w-full h-full" fill="none" stroke="${stroke}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="32" cy="40" r="6" fill="${color}" stroke="none"/>
      <line x1="32" y1="46" x2="80" y2="58" />
      <line x1="36" y1="47" x2="36" y2="68" />
    </svg>`;
  }

  // 54: 烏鴉式
  if ([54, 55, 57].includes(poseId)) {
    return `<svg viewBox="0 0 100 80" class="w-full h-full" fill="none" stroke="${stroke}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="36" cy="38" r="6" fill="${color}" stroke="none"/>
      <path d="M38 42 Q 52 40 58 48 Q 50 56 46 64" />
      <line x1="46" y1="64" x2="46" y2="70" />
      <line x1="48" y1="46" x2="68" y2="44" />
    </svg>`;
  }

  // 59: 嬰兒式
  if (poseId === 59) {
    return `<svg viewBox="0 0 100 80" class="w-full h-full" fill="none" stroke="${stroke}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="32" cy="58" r="6" fill="${color}" stroke="none"/>
      <path d="M32 58 Q 50 45 68 52 Q 74 62 68 68 L 32 68" />
      <line x1="36" y1="62" x2="20" y2="68" />
    </svg>`;
  }

  // 60, 64, 66: 坐姿前彎
  if ([60, 64, 66].includes(poseId)) {
    return `<svg viewBox="0 0 100 80" class="w-full h-full" fill="none" stroke="${stroke}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="48" cy="46" r="6" fill="${color}" stroke="none"/>
      <path d="M34 68 L 52 50 L 76 68" />
      <line x1="34" y1="68" x2="76" y2="68" />
    </svg>`;
  }

  // 65: 船式
  if (poseId === 65) {
    return `<svg viewBox="0 0 100 80" class="w-full h-full" fill="none" stroke="${stroke}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="34" cy="34" r="6" fill="${color}" stroke="none"/>
      <path d="M34 38 L 48 58 L 74 34" />
      <line x1="48" y1="54" x2="66" y2="48" />
    </svg>`;
  }

  // 75: 臥姿扭轉
  if (poseId === 75) {
    return `<svg viewBox="0 0 100 80" class="w-full h-full" fill="none" stroke="${stroke}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="28" cy="62" r="6" fill="${color}" stroke="none"/>
      <path d="M28 62 L 56 62 Q 68 54 62 46" />
      <line x1="42" y1="62" x2="42" y2="44" />
    </svg>`;
  }

  // 78: 抱膝壓腿
  if (poseId === 78) {
    return `<svg viewBox="0 0 100 80" class="w-full h-full" fill="none" stroke="${stroke}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="26" cy="64" r="6" fill="${color}" stroke="none"/>
      <line x1="28" y1="64" x2="58" y2="64" />
      <path d="M58 64 Q 68 44 54 44 L 54 58" />
    </svg>`;
  }

  // 80: 大休息 (Savasana)
  if (poseId === 80) {
    return `<svg viewBox="0 0 100 80" class="w-full h-full" fill="none" stroke="${stroke}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="28" cy="56" r="6" fill="${color}" stroke="none"/>
      <line x1="34" y1="60" x2="80" y2="60" />
      <line x1="44" y1="60" x2="60" y2="66" />
    </svg>`;
  }

  // 82: 合十禮 (Namaste)
  if (poseId === 82) {
    return `<svg viewBox="0 0 100 80" class="w-full h-full" fill="none" stroke="${stroke}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="50" cy="24" r="6" fill="${color}" stroke="none"/>
      <line x1="50" y1="30" x2="50" y2="56" />
      <path d="M38 46 L 50 38 L 62 46" />
      <path d="M34 66 Q 50 54 66 66" />
    </svg>`;
  }

  // 預設通用姿態依類別呈現
  if (category === 'standing' || category === 'balance') {
    return `<svg viewBox="0 0 100 80" class="w-full h-full" fill="none" stroke="${stroke}" stroke-width="3" stroke-linecap="round">
      <circle cx="50" cy="18" r="6" fill="${color}" stroke="none"/>
      <line x1="50" y1="24" x2="50" y2="50"/>
      <line x1="30" y1="34" x2="70" y2="34"/>
      <line x1="50" y1="50" x2="38" y2="72"/>
      <line x1="50" y1="50" x2="62" y2="72"/>
    </svg>`;
  }

  if (category === 'backbend') {
    return `<svg viewBox="0 0 100 80" class="w-full h-full" fill="none" stroke="${stroke}" stroke-width="3" stroke-linecap="round">
      <circle cx="66" cy="30" r="6" fill="${color}" stroke="none"/>
      <path d="M32 68 Q 50 20 66 36"/>
      <line x1="60" y1="42" x2="48" y2="68"/>
    </svg>`;
  }

  // 預設打坐姿勢
  return `<svg viewBox="0 0 100 80" class="w-full h-full" fill="none" stroke="${stroke}" stroke-width="3" stroke-linecap="round">
    <circle cx="50" cy="24" r="6" fill="${color}" stroke="none"/>
    <line x1="50" y1="30" x2="50" y2="54"/>
    <path d="M38 42 L 50 34 L 62 42"/>
    <path d="M32 66 Q 50 56 68 66"/>
  </svg>`;
};
