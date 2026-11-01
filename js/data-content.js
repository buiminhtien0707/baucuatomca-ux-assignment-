/* Quiz, FAQ, timeline content: trilingual (vn/en/zh) */
window.BC_CONTENT = (function () {
  "use strict";

  var QUIZ = [
    {
      q: { vn: "Bầu cua tôm cá gốc từ trò chơi nào?", en: "Bầu cua tôm cá originated from which game?", zh: "越南骰宝源自哪个游戏？" },
      opts: [
        { vn: "Hoo Hey How (Trung Quốc)", en: "Hoo Hey How (China)", zh: "Hoo Hey How（中国）" },
        { vn: "Sicbo(Hồng Kông)", en: "Sicbo (Hong Kong)", zh: "骰宝（香港）" },
        { vn: "Cờ cá ngựa", en: "Horse chess", zh: "赛马棋" },
        { vn: "Xổ số Tết", en: "Tết lottery", zh: "春节彩票" }
      ],
      a: 0,
      why: { vn: "Chính xác: trò đi biển vào Nam Bộ từ Hoo Hey How.", en: "Correct: it sailed south from Hoo Hey How.", zh: "正确——它从 Hoo Hey How 南传而来。" }
    },
    {
      q: { vn: "Một bộ bầu cua có mấy mặt con vật?", en: "How many animal faces does a set have?", zh: "一套骰宝有几只动物面？" },
      opts: [
        { vn: "4 mặt", en: "4 faces", zh: "4 面" },
        { vn: "6 mặt", en: "6 faces", zh: "6 面" },
        { vn: "8 mặt", en: "8 faces", zh: "8 面" },
        { vn: "12 mặt", en: "12 faces", zh: "12 面" }
      ],
      a: 1,
      why: { vn: "6 mặt: bầu, cua, tôm, cá, gà, hươu.", en: "Six: gourd, crab, prawn, fish, rooster, deer.", zh: "六面：葫芦、蟹、虾、鱼、鸡、鹿。" }
    },
    {
      q: { vn: "Mỗi ván lắc mấy viên xí ngầu?", en: "How many dice per round?", zh: "每局摇几颗骰子？" },
      opts: [
        { vn: "2 viên", en: "2 dice", zh: "2 颗" },
        { vn: "3 viên", en: "3 dice", zh: "3 颗" },
        { vn: "4 viên", en: "4 dice", zh: "4 颗" },
        { vn: "6 viên", en: "6 dice", zh: "6 颗" }
      ],
      a: 1,
      why: { vn: "3 viên trong bát: tối đa 3 con khác nhau mỗi ván.", en: "Three dice: up to three different faces per round.", zh: "盅内三颗——每局最多三种不同面。" }
    },
    {
      q: { vn: "Đặt 100 vào 1 ô, 2 viên trùng ô đó: ăn bao nhiêu?", en: "Bet 100 on one cell, 2 dice match: what do you get?", zh: "押 100 到一格，两颗命中——拿多少？" },
      opts: [
        { vn: "200 xu", en: "200 xu", zh: "200 金币" },
        { vn: "300 xu", en: "300 xu", zh: "300 金币" },
        { vn: "400 xu", en: "400 xu", zh: "400 金币" },
        { vn: "500 xu", en: "500 xu", zh: "500 金币" }
      ],
      a: 1,
      why: { vn: "Stake 100 + thưởng 2× = 300.", en: "Stake 100 + 2× prize = 300.", zh: "本金 100 + 2× 奖金 = 300。" }
    },
    {
      q: { vn: "Con nào thay mặt “đồng tiền” của bản Trung?", en: "Which face replaced the Chinese “coin”?", zh: "哪个面替换了中国版的“铜钱”？" },
      opts: [
        { vn: "Cá", en: "Fish", zh: "鱼" },
        { vn: "Gà", en: "Rooster", zh: "鸡" },
        { vn: "Hươu", en: "Deer", zh: "鹿" },
        { vn: "Tôm", en: "Prawn", zh: "虾" }
      ],
      a: 2,
      why: { vn: "Hươu: gần âm “lộc” nên được chọn.", en: "Deer: chosen for its pun on “fortune”.", zh: "鹿——谐音“禄”，故被选用。" }
    },
    {
      q: { vn: "“Lì xì” trên site là gì?", en: "What is “lì xì” here?", zh: "这里的“利是”是什么？" },
      opts: [
        { vn: "Thưởng xu ảo mỗi ngày", en: "A daily virtual-coin bonus", zh: "每日虚拟金币奖励" },
        { vn: "Nạp tiền thật", en: "A real-money deposit", zh: "真实充值" },
        { vn: "Vé số", en: "A lottery ticket", zh: "彩票" },
        { vn: "Thẻ quà tặng", en: "A gift card", zh: "礼品卡" }
      ],
      a: 0,
      why: { vn: "Lì xì = +500 xu ảo mỗi ngày, không tiền thật.", en: "Lì xì = +500 virtual xu daily, never real money.", zh: "利是 = 每日 +500 虚拟金币，绝非真钱。" }
    },
    {
      q: { vn: "Về dài hạn, người cầm bát thắng thế nào?", en: "In the long run, why does the bowl-keeper win?", zh: "长期来看，庄家为何总是赢？" },
      opts: [
        { vn: "Xí ngầu bị làm WEIGHT", en: "The dice are rigged", zh: "骰子被动了手脚" },
        { vn: "Luật chia đều cho cả bàn", en: "Rules split evenly across the table", zh: "规则平均分给全场" },
        { vn: "Luật trả thưởng thấp hơn xác suất thật", en: "Payouts are below true odds", zh: "赔率低于真实概率" },
        { vn: "Vì may mắn", en: "Pure luck", zh: "纯运气" }
      ],
      a: 2,
      why: { vn: "Đúng: EV ≈ −7,9%/xu cược là ở chính luật trả thưởng.", en: "Right: EV ≈ −7.9% per xu is baked into the payout table.", zh: "对——期望 ≈ −7.9% 就藏在赔率表里。" }
    },
    {
      q: { vn: "Con Cá mang ý nghĩa gì?", en: "What does the fish symbolize?", zh: "鱼象征什么？" },
      opts: [
        { vn: "Sự khởi đầu", en: "Fresh starts", zh: "新的开始" },
        { vn: "Sung túc, dư dả", en: "Abundance", zh: "富足有余" },
        { vn: "Sự nhanh nhẹn", en: "Quickness", zh: "敏捷" },
        { vn: "Tình bạn", en: "Friendship", zh: "友谊" }
      ],
      a: 1,
      why: { vn: "Cá = dư dả, như câu chúc “năm dư tháng đủ”.", en: "Fish = abundance, as in the wish “plenty year-round”.", zh: "鱼 = 年年有余。" }
    }
  ];

  var FAQ = [
    { q: { vn: "Bầu cua là gì?", en: "What is bầu cua?", zh: "什么是越南骰宝？" },
      a: { vn: "Trò chơi dân gian chơi ngày Tết: đặt cược lên 6 ô con vật, lắc 3 viên xí ngầu trong bát, ăn theo số con khớp.", en: "A Tết folk game: bet on six animal cells, shake three dice in a bowl, and win by how many dice match your cells.", zh: "春节民间游戏：押六格动物，摇三颗骰子，按命中数赢奖。" } },
    { q: { vn: "Trò này có ăn tiền thật không?", en: "Does this game use real money?", zh: "这个游戏用真钱吗？" },
      a: { vn: "Không. Toàn bộ xu trên site là xu ảo: không nạp, không rút.", en: "No. All coins here are virtual: no deposits, no withdrawals.", zh: "不。这里所有金币都是虚拟的——不可充值、不可提现。" } },
    { q: { vn: "Lì xì là gì?", en: "What is lì xì?", zh: "什么是“利是”？", },
      a: { vn: "Túi may mắn ngày Tết. Ở đây: +500 xu ảo mỗi ngày để bạn không bao giờ bị chặn khỏi trò chơi.", en: "A Tết lucky pouch. Here: +500 virtual xu daily so you're never locked out of play.", zh: "春节红包。这里是每日 +500 虚拟金币，绝不让您被挡在游戏之外。" } },
    { q: { vn: "Vì sao nhà cầm bát luôn lãi?", en: "Why does the bowl-keeper profit?", zh: "为什么庄家总赚钱？" },
      a: { vn: "Luật trả thưởng thấp hơn xác suất thật: chênh ≈ 7,9%. Xem Lab để tự chạy 1.000 ván.", en: "Payouts sit below true odds: a gap of about 7.9%. Run 1,000 rounds in the Lab to see it.", zh: "赔率低于真实概率——差距约 7.9%。去实验室跑 1000 局看看。" } },
    { q: { vn: "Chơi trên điện thoại được không?", en: "Can I play on my phone?", zh: "可以用手机玩吗？" },
      a: { vn: "Được chứ — cả trang thiết kế cho một tay cầm điện thoại: ô cược to, chip to, chạm là chơi. Và vì dùng xu ảo nên thua cũng không mất gì.", en: "Absolutely: the whole page is built for one-handed phone play with big cells and big chips. And since coins are virtual, losing costs nothing.", zh: "可以——为单手设计，格子大、筹码大。" } },
    { q: { vn: "Có cần đăng ký tài khoản không?", en: "Do I need an account?", zh: "需要注册账号吗？" },
      a: { vn: "Không cần. Không đăng ký, không thu thập dữ liệu.", en: "No account, no data collection.", zh: "无需注册，不收集数据。" } }
  ];

  var TIMELINE = [
    { t: { vn: "30 Tết: gói bánh, gói quà", en: "Dec 30 (lunar): wrapping cakes and gifts", zh: "腊月三十——包粽子、备礼" },
      d: { vn: "Cả nhà quây quần gói bánh chưng, nhà nhà dọn bàn bầu cua ra góc phòng khách.", en: "The family wraps bánh chưng while someone dusts off the bầu cua set in the living-room corner.", zh: "全家包粽子，有人把骰宝套装擦净摆到客厅一角。" } },
    { t: { vn: "Mùng 1 trưa: mâm cỗ", en: "Day 1 noon: the feast", zh: "初一午——年夜饭" },
      d: { vn: "Cỗ xong, bánh in và trà ra bàn; bát bầu cua úp xuống giữa chiếu.", en: "After the feast, sweets and tea hit the table and the bowl lands face-down on the mat.", zh: "宴罢，糕点清茶上桌，骰盅扣在席中央。" } },
    { t: { vn: "Chiều mùng 1: họ hàng tụ bàn", en: "Day 1 afternoon: family gathers", zh: "初一午後——亲邻聚桌" },
      d: { vn: "Chị Hai câu bài, anh Tư dạy luật, thằng bé nhặt xí ngầu rơi dưới chiếu.", en: "Auntie heckles, uncle teaches the rules, the kid retrieves dice from under the mat.", zh: "二姨起哄，三舅教规则，小孩捡滚到席下的骰子。" } },
    { t: { vn: "Ván đầu tiên: khai xuân", en: "The first round: opening luck", zh: "第一局——开春" },
      d: { vn: "Ai cũng đặt một cược nhỏ để “xông đất”: thua vẫn cười.", en: "Everyone tosses a small bet to “break ground luck”: losing still earns a laugh.", zh: "人人下一小注“踩地开运”——输了也笑。" } },
    { t: { vn: "Trẻ con được lì xì", en: "Kids get their lì xì", zh: "孩子们领利是" },
      d: { vn: "Phong bì đỏ chia tay, vài em mang số tiền mới có vào bàn: và học thua rất ngầu.", en: "Red envelopes go around; a few kids bring their new fortune to the table: and learn to lose with style.", zh: "红包发完，几个孩子带着新钱上桌——学会潇洒地输。" } },
    { t: { vn: "Khóa ván: cùng ăn mứt", en: "Closing the game: sweets and tea", zh: "收盅——茶点收尾" },
      d: { vn: "Người thắng mời mứt, người thua được an ủi bằng trà. Không ai nhớ chính xác ai thắng.", en: "Winners buy the sweets, losers get tea and sympathy. Nobody remembers who actually won.", zh: "赢家请糖，输家得茶与安慰。没人记得究竟谁赢了。" } }
  ];

  return { QUIZ: QUIZ, FAQ: FAQ, TIMELINE: TIMELINE };
})();
