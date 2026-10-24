# Yoga Flow Studio

專為瑜珈老師與自主練習者打造的序列編排與教學播放器 (Mobile-First 繁體中文版)。

## 專案結構
```text
YogaFlowStudio/
├── index.html          # 主頁面 (已拆分，簡潔易讀)
├── data/
│   ├── asanas.js       # 82 個完整體位動作資料庫 (中/英/梵文/解剖部位/口令/禁忌)
│   └── presets.js      # 官方 10 套經典課表庫 (開髖、肩頸、開胸、冥想、新月/滿月等)
└── js/
    └── app.js          # 應用程式主要邏輯 (序列管理、自訂儲存、多語音朗讀、頌缽音效)
```

## 功能亮點
1. **體位與課表資料庫獨立**：動作數據與預設課表分開維護，隨時自由擴充。
2. **多語音朗讀模式**：支援中文、英文口令，以及換動作時標準梵文體位名稱發音。
3. **自訂課表隨心存**：直接在瀏覽器儲存無限組個人課表，支援 JSON 匯出備份。
4. **手機行動端優化**：底部 Navigation Tab，支援單手操作、快速換側 (左/右/雙側) 與秒數微調。
5. **西藏頌缽引導播放器**：內建 Web Audio 合成頌缽頻率，大螢幕倒數環與口令顯示。

## GitHub Pages 部署指南
1. 將本資料夾內的所有檔案推送到您的 GitHub 儲存庫：
   ```bash
   git add .
   git commit -m "Refactor: separate data and js files, fix sequence actions"
   git push origin main
   ```
2. 至 GitHub 儲存庫的 **Settings > Pages**。
3. 在 **Branch** 選擇 `main`，路徑選擇 `/ (root)`，點擊 **Save**。
4. 約 1 分鐘後即可開啟您的 GitHub Pages 專屬網址！
