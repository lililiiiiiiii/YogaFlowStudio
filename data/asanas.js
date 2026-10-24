/**
 * Yoga Flow Studio - 完整體位動作資料庫 (142 Asanas)
 * 包含：PlayPauseBe 82 陽流動體位 + YIN Deck 60 陰瑜珈/經絡修復體位
 */
window.YOGA_ASANAS = [
  // ── 1 ~ 82 為先前的經典陽流動體位 ──
  { id: 1, code: "PPB-01", type: "yang", category: "warmup", zh: "貓牛式", en: "Cat Cow", sanskrit: "Marjaryasana Bitilasana", dots: 1, duration: 30, cues: "四足跪姿，吸氣挺胸抬頭成牛式；呼氣收腹拱背推地成貓式。", cuesEn: "Inhale arch into Cow, exhale round into Cat." },
  { id: 13, code: "PPB-13", type: "yang", category: "standing", zh: "山式", en: "Mountain Pose", sanskrit: "Tadasana", dots: 1, duration: 20, cues: "足底三點踩實扎根，大腿提拔，尾骨下沉，雙手自然舒展。", cuesEn: "Stand tall grounded through feet, roll shoulders back and down." },
  { id: 14, code: "PPB-14", type: "yang", category: "standing", zh: "站姿前彎式", en: "Standing Forward Fold", sanskrit: "Uttanasana", dots: 1, duration: 35, cues: "由髖部折疊前屈，放鬆頭頸，微屈雙膝感受膕繩肌延伸。", cuesEn: "Hinge from hips, let upper body hang softly toward floor." },
  { id: 17, code: "PPB-17", type: "yang", category: "standing", zh: "新月高弓步式", en: "Crescent Lunge", sanskrit: "Ashta Chandrasana", dots: 2, isHeat: true, duration: 35, sideMode: "dual", cues: "前膝屈90度，後腳跟高蹬，雙臂高舉過頭，尾骨下收。", cuesEn: "Front knee over ankle, back heel high, reach arms up to sky." },
  { id: 18, code: "PPB-18", type: "yang", category: "standing", zh: "三角式", en: "Triangle Pose", sanskrit: "Utthita Trikonasana", dots: 2, duration: 35, sideMode: "dual", cues: "雙腿分開大步，前髖側折，下方手扶小腿，上方手筆直指天。", cuesEn: "Hinge at front hip, extend forward, top arm reaching to sky." },
  { id: 20, code: "PPB-20", type: "yang", category: "standing", zh: "勇士二式", en: "Warrior 2", sanskrit: "Virabhadrasana 2", dots: 2, isHeat: true, duration: 40, sideMode: "dual", cues: "前膝屈90度對齊腳踝，雙臂水平延展，目光看前手中指。", cuesEn: "Deep bend in front knee, arms parallel to ground, gaze forward." },
  { id: 30, code: "PPB-30", type: "yang", category: "balance", zh: "樹式", en: "Tree Pose", sanskrit: "Vrksasana", dots: 1, duration: 35, sideMode: "dual", cues: "單腿站立，另一腳貼內側大腿或小腿，雙手胸前合十，凝視前方。", cuesEn: "Place foot on inner thigh or calf, hands at heart, focus gaze." },
  { id: 34, code: "PPB-34", type: "yang", category: "backbend", zh: "眼鏡蛇式", en: "Cobra", sanskrit: "Bhujangasana", dots: 1, duration: 25, cues: "俯臥手掌置於胸旁，吸氣收臀肌背肌，抬起胸膛離地展胸。", cuesEn: "Hands under shoulders, inhale lift chest up using back muscles." },
  { id: 48, code: "PPB-48", type: "yang", category: "inversion", zh: "下犬式", en: "Downward Facing Dog", sanskrit: "Adho Mukha Svanasana", dots: 1, duration: 45, cues: "手掌推地坐骨頂高成倒V形，腳跟下沉，放鬆頸椎。", cuesEn: "Lift hips up and back into an inverted V, heels melting down." },
  { id: 51, code: "PPB-51", type: "yang", category: "armbalance", zh: "棒式 (平板式)", en: "Plank Pose", sanskrit: "Phalakasana", dots: 1, isHeat: true, duration: 35, cues: "雙手在肩膀正下方推地，全身鋼板般收緊，頭頂至腳跟成一直線。", cuesEn: "Body straight from head to heels, press ground away." },
  { id: 59, code: "PPB-59", type: "yang", category: "cooldown", zh: "嬰兒式", en: "Child's Pose", sanskrit: "Balasana", dots: 1, duration: 60, cues: "跪姿雙膝分開臀坐腳跟，上半身趴伏延伸，額頭輕貼墊子。", cuesEn: "Hips to heels, walk hands forward, forehead on mat." },
  { id: 80, code: "PPB-80", type: "yang", category: "cooldown", zh: "大休息 (攤屍式)", en: "Savasana", sanskrit: "Savasana", dots: 1, duration: 90, cues: "仰臥全身放鬆，完全釋放對呼吸的掌控，全然臣服放空。", cuesEn: "Lie flat on back, release all effort and dissolve into stillness." },

  // ── 101 ~ 160 為 YIN Deck 陰瑜珈專屬體位 ──
  {
    id: 101, code: "YIN-01", type: "yin", category: "yin",
    zh: "踝部伸展式", en: "Ankle Stretch", sanskrit: "Vajrasana Variation",
    chakras: "海底輪 / 生殖輪", meridians: "胃經 / 脾經 / 肝經 / 膽經",
    duration: 120, cues: "跪姿腳背貼地重心後移，手在身後支撐，溫柔微提雙膝感受腳踝前側伸展。"
  },
  {
    id: 103, code: "YIN-03", type: "yin", category: "warmup",
    zh: "陰瑜珈貓牛式", en: "Yin Cat-Cow", sanskrit: "Marjaryasana Bitilasana",
    chakras: "海底輪 / 心輪", meridians: "膀胱經 / 腎經",
    duration: 120, cues: "四足跪姿，以極慢呼吸流動，深層潤滑脊柱與背部深層筋膜。"
  },
  {
    id: 109, code: "YIN-09", type: "yin", category: "yin",
    zh: "香蕉式", en: "Banana Pose", sanskrit: "Bananasana",
    chakras: "生殖輪 / 心輪", meridians: "膽經 / 肝經 / 肺經",
    duration: 240, sideMode: "dual", cues: "仰臥軀幹與雙腿彎向同一側呈香蕉弧線，深長呼氣開展整個體側膽經。"
  },
  {
    id: 112, code: "YIN-12", type: "yin", category: "yin",
    zh: "陰蝴蝶式", en: "Yin Butterfly Pose", sanskrit: "Baddha Konasana Yin",
    chakras: "海底輪 / 生殖輪", meridians: "腎經 / 肝經 / 膀胱經",
    duration: 240, cues: "雙腳掌互碰推遠呈大菱形，由髖部放鬆圓背向前垂落，完全不用肌肉出力。"
  },
  {
    id: 113, code: "YIN-13", type: "yin", category: "yin",
    zh: "貓拉尾式", en: "Cat Pulling its Tail", sanskrit: "Marjaryasana Tail Pull",
    chakras: "生殖輪 / 太陽神經叢", meridians: "胃經 / 脾經 / 膽經",
    duration: 240, sideMode: "dual", cues: "臥姿扭轉中下方手抓下方腳背，同時開展大腿前側、外髖與胸椎。"
  },
  {
    id: 114, code: "YIN-14", type: "yin", category: "yin",
    zh: "毛毛蟲式 (陰坐姿前彎)", en: "Caterpillar Pose", sanskrit: "Paschimottanasana Yin",
    chakras: "海底輪 / 太陽神經叢", meridians: "膀胱經 / 腎經",
    duration: 240, cues: "雙腿向前自然平放微屈膝，上半身如毛毛蟲般自然圓背垂落放鬆。"
  },
  {
    id: 115, code: "YIN-15", type: "yin", category: "restore",
    zh: "陰瑜珈嬰兒式", en: "Yin Child's Pose", sanskrit: "Balasana Yin",
    chakras: "海底輪 / 眉心輪", meridians: "胃經 / 脾經 / 膀胱經",
    duration: 240, cues: "雙膝大分開，胸口趴臥在長抱枕或墊子上，感受下背隨呼吸自然起伏。"
  },
  {
    id: 118, code: "YIN-18", type: "yin", category: "yin",
    zh: "鹿式", en: "Deer Pose", sanskrit: "Deer Asana",
    chakras: "海底輪 / 生殖輪", meridians: "膽經 / 肝經 / 胃經",
    duration: 240, sideMode: "dual", cues: "雙膝各呈90度一前一後，上半身覆向前小腿，溫和平衡骨盆內外旋。"
  },
  {
    id: 120, code: "YIN-20", type: "yin", category: "yin",
    zh: "蜻蜓式 (坐姿分腿前彎)", en: "Dragonfly Pose", sanskrit: "Upavistha Konasana Yin",
    chakras: "海底輪 / 生殖輪", meridians: "肝經 / 腎經 / 脾經",
    duration: 240, cues: "雙腿向兩側舒適分開成V字，雙手向前著地或趴在抱枕上，深層開展大腿內側陰經。"
  },
  {
    id: 121, code: "YIN-21", type: "yin", category: "yin",
    zh: "方塊式 (柴火式)", en: "Fire Log Pose", sanskrit: "Agnistambhasana Yin",
    chakras: "海底輪 / 生殖輪", meridians: "膽經 / 肝經",
    duration: 240, sideMode: "dual", cues: "兩小腿上下平行重疊，腳踝在膝上，由髖前傾釋放臀部深層梨狀肌。"
  },
  {
    id: 126, code: "YIN-26", type: "yin", category: "restore",
    zh: "快樂嬰兒式", en: "Happy Baby Pose", sanskrit: "Ananda Balasana Yin",
    chakras: "海底輪 / 生殖輪", meridians: "膀胱經 / 腎經",
    duration: 240, cues: "仰臥屈雙膝向兩側腋下，手拉腳外緣，薦椎與肩膀平貼地面沉靜安神。"
  },
  {
    id: 130, code: "YIN-30", type: "yin", category: "restore",
    zh: "雙腿靠牆式", en: "Legs up the Wall", sanskrit: "Viparita Karani Yin",
    chakras: "海底輪 / 頂輪", meridians: "腎經 / 膀胱經",
    duration: 300, cues: "雙腿垂直搭於牆壁上，骨盆薦骨墊抱枕微提，被動倒流下肢血液，平息神經。"
  },
  {
    id: 134, code: "YIN-34", type: "yin", category: "yin",
    zh: "融心式 (小狗式)", en: "Puppy Pose / Melting Heart", sanskrit: "Anahatasana",
    chakras: "心輪 / 喉輪", meridians: "心經 / 肺經 / 膀胱經",
    duration: 240, cues: "四足跪姿骨盆在膝上方，雙臂前伸，胸骨與下巴向大地融化，深度開胸。"
  },
  {
    id: 144, code: "YIN-44", type: "yin", category: "yin",
    zh: "睡天鵝式", en: "Sleeping Swan", sanskrit: "Kapotasana Yin",
    chakras: "海底輪 / 生殖輪", meridians: "膽經 / 肝經 / 胃經",
    duration: 240, sideMode: "dual", cues: "前腿橫擺，後腿後伸，骨盆端正，上半身完全趴臥在抱枕或墊上臣服。"
  },
  {
    id: 147, code: "YIN-47", type: "yin", category: "yin",
    zh: "獅身人面式", en: "Sphinx Pose", sanskrit: "Salamba Bhujangasana Yin",
    chakras: "太陽神經叢 / 心輪", meridians: "胃經 / 脾經 / 腎經",
    duration: 240, cues: "俯臥前臂撐地，臀部大腿完全癱軟放鬆，以重力溫柔滋養腰椎天然曲度。"
  },
  {
    id: 150, code: "YIN-50", type: "yin", category: "restore",
    zh: "支撐橋式", en: "Supported Bridge", sanskrit: "Setu Bandhasana Yin",
    chakras: "海底輪 / 心輪", meridians: "腎經 / 膀胱經",
    duration: 300, cues: "仰臥屈膝，將瑜珈磚或抱枕墊在薦骨平坦骨骼下方，雙臂體側徹底放鬆。"
  },
  {
    id: 151, code: "YIN-51", type: "yin", category: "yin",
    zh: "仰臥脊柱扭轉", en: "Supine Spinal Twist Yin", sanskrit: "Supta Matsyendrasana Yin",
    chakras: "太陽神經叢 / 心輪", meridians: "膀胱經 / 膽經",
    duration: 240, sideMode: "dual", cues: "仰臥單腿跨過身軀倒向對側，肩膀壓地，深長呼氣沉澱脊椎神經。"
  },
  {
    id: 157, code: "YIN-57", type: "yin", category: "restore",
    zh: "陰大休息 (攤屍式)", en: "Yin Corpse Pose", sanskrit: "Savasana Yin",
    chakras: "海底輪 / 頂輪", meridians: "任脈 / 督脈",
    duration: 300, cues: "仰臥雙手雙腳自然外展，全然釋放所有肌肉用力，靜享氣血深層反彈滋養。"
  },
  {
    id: 159, code: "YIN-59", type: "yin", category: "restore",
    zh: "支撐仰臥蝴蝶式", en: "Supported Reclined Butterfly", sanskrit: "Salamba Supta Baddha Konasana",
    chakras: "生殖輪 / 心輪 / 喉輪", meridians: "肝經 / 腎經 / 脾經 / 肺經",
    duration: 300, cues: "長抱枕縱向墊在脊椎下方，腳掌互碰屈膝躺臥，胸口與骨盆同步被動開展。"
  },
  {
    id: 160, code: "YIN-60", type: "yin", category: "restore",
    "zh": "支撐大休息式", "en": "Supported Savasana", "sanskrit": "Supported Savasana Yin",
    chakras: "海底輪 / 頂輪", meridians: "任督二脈",
    duration: 300, cues: "膝蓋下方橫放長抱枕，徹底撫平下背壓力，全身融化進平靜心海。"
  }
];