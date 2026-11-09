/* Animals, badges, sample leaderboard for BẦU CUA VUI.
   Faces: vector SVG tiles drawn for this project */
window.BC_DATA = (function () {
  "use strict";

  var ANIMALS = [
    {
      id: "bau", img: "assets/img/animals/bau.svg",
      name: { vn: "Bầu", en: "Gourd", zh: "葫芦" },
      line: { vn: "Mộc mạc, đủ đầy", en: "Simple and plentiful", zh: "朴实而富足" },
      fact: {
        vn: "Quả bầu quen thuộc của vườn Việt: biểu tượng lối sống giản dị.",
        en: "The humble garden gourd: a symbol of a simple way of life.",
        zh: "菜园常见的葫芦——简朴生活的象征。"
      }
    },
    {
      id: "cua", img: "assets/img/animals/cua.svg",
      name: { vn: "Cua", en: "Crab", zh: "蟹" },
      line: { vn: "Đi đường riêng", en: "Walks its own path", zh: "走自己的路" },
      fact: {
        vn: "Cua đi ngang: hay bị gọi đùa là con “khó đoán nhất” của trò chơi.",
        en: "Crabs walk sideways: the playful “hardest to guess” face of the game.",
        zh: "螃蟹横着走——游戏里公认的“最难猜”的一面。"
      }
    },
    {
      id: "tom", img: "assets/img/animals/tom.svg",
      name: { vn: "Tôm", en: "Prawn", zh: "虾" },
      line: { vn: "Lộc cong mình", en: "Curved like a bow of luck", zh: "弯身如鞠躬的运气" },
      fact: {
        vn: "Tôm cong mình như cung chào: hình ảnh chào khách ngày đầu năm.",
        en: "The prawn curls like a welcoming bow for the new year.",
        zh: "虾弯身如作揖——新年迎客的形象。"
      }
    },
    {
      id: "ca", img: "assets/img/animals/ca.svg",
      name: { vn: "Cá", en: "Fish", zh: "鱼" },
      line: { vn: "Năm dư tháng đủ", en: "Plenty all year round", zh: "年年有余" },
      fact: {
        vn: "Cá mang nghĩa “dư dả”: như câu chúc năm dư tháng đủ mỗi Tết.",
        en: "Fish means abundance: echoing the wish “plenty year-round”.",
        zh: "鱼寓意“富足有余”——正如春节的祝愿“年年有余”。"
      }
    },
    {
      id: "ga", img: "assets/img/animals/ga.svg",
      name: { vn: "Gà", en: "Rooster", zh: "鸡" },
      line: { vn: "Gáy sáng hôm mới", en: "Greets the new day", zh: "啼鸣迎新日" },
      fact: {
        vn: "Gà trống gáy gọi bình minh: biểu tượng khởi đầu mới.",
        en: "The rooster crows in the dawn: a symbol of fresh starts.",
        zh: "公鸡报晓——新开始与守时的象征。"
      }
    },
    {
      id: "huou", img: "assets/img/animals/huou.svg",
      name: { vn: "Hươu", en: "Deer", zh: "鹿" },
      line: { vn: "Con vật của “lộc”", en: "The animal of fortune", zh: "象征“禄”的动物" },
      fact: {
        vn: "Bản Trung có mặt “đồng tiền”; bản Việt thay bằng Hươu: gần âm “lộc”.",
        en: "The Chinese set has a coin face; Vietnam swapped it for the deer, a pun on “fortune”.",
        zh: "中国版有“铜钱”一面；越南版换成鹿——谐音“禄”，寓意福气。"
      }
    }
  ];

  var BADGES = [
    { id: "khai_xuan", icon: "🧧", name: { vn: "Khai Xuân", en: "First Blessing", zh: "开春" },
      desc: { vn: "Nhận lì xì đầu tiên", en: "Claim your first lì xì", zh: "领取第一个利是" } },
    { id: "lac_lu", icon: "🎲", name: { vn: "Lắc Lư", en: "First Shake", zh: "初次摇盅" },
      desc: { vn: "Hoàn thành ván đầu tiên", en: "Finish your first round", zh: "完成第一局" } },
    { id: "thua_vui", icon: "😅", name: { vn: "Thua Vui Vẻ", en: "Good Sport", zh: "输得开心" },
      desc: { vn: "Thua ván đầu: vui là chính!", en: "Lose your first round: fun first!", zh: "输掉第一局——开心就好！" } },
    { id: "het_y", icon: "🔥", name: { vn: "Hết Ý", en: "On Fire", zh: "连庄" },
      desc: { vn: "Thắng 3 ván liên tiếp", en: "Win 3 rounds in a row", zh: "连胜三局" } },
    { id: "hoc_ba", icon: "🎓", name: { vn: "Học Bá", en: "Top Student", zh: "学霸" },
      desc: { vn: "Điểm tuyệt đối quiz", en: "Perfect quiz score", zh: "测验满分" } },
    { id: "sau_mat", icon: "🐮", name: { vn: "Sáu Mặt Tươi", en: "All Six Faces", zh: "六面全开" },
      desc: { vn: "Xem chi tiết cả 6 con vật", en: "View all six animals", zh: "查看全部六只动物" } },
    { id: "nha_toan", icon: "📐", name: { vn: "Nhà Toán Học", en: "Mathematician", zh: "数学家" },
      desc: { vn: "Chạy mô phỏng ở Lab", en: "Run a Lab simulation", zh: "运行实验室模拟" } },
    { id: "khach_quen", icon: "🔁", name: { vn: "Khách Quên", en: "Regular", zh: "常客" },
      desc: { vn: "Quay lại vào ngày hôm sau", en: "Come back the next day", zh: "次日再来" } }
  ];

  var LEADER_SAMPLE = [
    { rank: 1, name: "Chú Tễu", xu: 2450 },
    { rank: 2, name: "Cô Hoang", xu: 1980 },
    { rank: 3, name: "Bác Ba", xu: 1610 },
    { rank: 4, name: "Minh Sú", xu: 1240 },
    { rank: 5, name: "Na Di", xu: 990 }
  ];

  var VIDEO_ID = ''; /* paste a YouTube video ID here to show the Tết page video */

  return { ANIMALS: ANIMALS, BADGES: BADGES, LEADER_SAMPLE: LEADER_SAMPLE, VIDEO_ID: VIDEO_ID };
})();
