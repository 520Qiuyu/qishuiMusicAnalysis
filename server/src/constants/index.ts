// 东北雨姐表情包图片列表
export const IMAGES = [
  "https://pics1.baidu.com/feed/eaf81a4c510fd9f9cd809b07a301673a2934a482.jpeg@f_auto?token=d5c4885692c1d12a100c56d840456355",
  "https://pics4.baidu.com/feed/574e9258d109b3de275107655e14ef8e810a4c08.jpeg@f_auto?token=d7fd03a8f967c0499c5dd8411c488b92",
  "https://ww1.sinaimg.cn/mw690/49898109gy1hu4qw04nexj20j60pkmyi.jpg",
  "https://pics3.baidu.com/feed/377adab44aed2e73e602d9cf012d129b86d6fa23.jpeg@f_auto?token=780279ea6096ec39000da36ea31207e3",
  "https://pics1.baidu.com/feed/14ce36d3d539b600a2d5b274617c863ac75cb793.jpeg@f_auto?token=ac514c57bbfa441e57ecc43e63cf73f8",
  "https://pics1.baidu.com/feed/95eef01f3a292df5510e348f3a1def7035a8731c.jpeg@f_auto?token=19822ad730dfedc21eeec5259784afaa",
  "https://pics4.baidu.com/feed/279759ee3d6d55fb6fc22b275a1ff64420a4dd73.jpeg@f_auto?token=4b34e6a070a0aa9fe650aef72be847fd",
  "https://pics3.baidu.com/feed/0d338744ebf81a4cdbd95eb05f06d349242da699.jpeg@f_auto?token=7b670150292a124d8f899bf848a48c7a",
  "https://minio.hezebin.com/blog/preview/a053dd1ae41ddadb56981d1c1f758ddf.jpeg",
  "https://pic.rmb.bdstatic.com/bjh/251114/beautify/8ebc17bcfe5fc9771fc5df644a6e1528.jpeg?for=bg",
  "https://pics5.baidu.com/feed/8b82b9014a90f603c1f4b1a5b13e000bb151ed4d.jpeg@f_auto?token=d992950993d4de58ef7cea2a10e48c5f",
  "https://pics6.baidu.com/feed/11385343fbf2b2118e87bd9c4dacd6280dd78e77.jpeg@f_auto?token=f6e055cba522c328b7595ce2baadab9f",
  "https://q4.itc.cn/images01/20241024/d81fb2c3549d447691f70587fbb834a4.jpeg",
  "https://img1.baidu.com/it/u=4113379835,1864726408&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=710",
  "https://pics1.baidu.com/feed/aa18972bd40735fadf2613c30c8aa0bd0d2408db.jpeg@f_auto?token=c546f3f2d050b088392997b48396a6b5",
  "https://pics1.baidu.com/feed/9825bc315c6034a843f6cebd423ffa44092376b6.png@f_auto?token=43871f18206926bc47b32abea68ddf94",
  "https://pics3.baidu.com/feed/42a98226cffc1e17098dfb0ec3bc4513738de998.png@f_auto?token=226008bf8e4ba9437bb69e4719a2e3f0",
  "https://q0.itc.cn/q_70/images03/20241012/da1b0092eda041efae1cce94bac3fbef.jpeg",
  "https://q9.itc.cn/images01/20250812/4e16bc80f9a64610b639709d132b3294.jpeg",
  "https://nimg.ws.126.net/?url=http%3A%2F%2Fdingyue.ws.126.net%2F2024%2F1006%2Fb67efaadj00skxif9003yd000xq00tym.jpg&thumbnail=660x2147483647&quality=80&type=jpg",
  "https://q5.itc.cn/images01/20250822/546ea5f4aca4495a86744db51949b424.png",
  "https://pics6.baidu.com/feed/1b4c510fd9f9d72a329ee6b253069b24359bbb60.jpeg@f_auto?token=28cd0158d752e0e41a9b78f9b74d9670",
  "https://pics6.baidu.com/feed/11385343fbf2b2118e87bd9c4dacd6280dd78e77.jpeg@f_auto?token=f6e055cba522c328b7595ce2baadab9f",
  "https://pics2.baidu.com/feed/3812b31bb051f8194992ca37f3665dff2f73e779.jpeg@f_auto?token=ebbdc0d5242565fb4c72c4df01a8eff3",
];

/**
 * 从 IMAGES 中随机取一张封面图。
 *
 * @example
 * const cover = getRandomImage();
 */
export const getRandomImage = () => {
  const index = Math.floor(Math.random() * IMAGES.length);
  return IMAGES[index] ?? IMAGES[0];
};

// 歌曲文件列表
export const SONGS = [
  "https://hezebin.com/static/media/%E6%98%AF%E4%BD%A0-TFBOYS.deba2ffbcf889aca5b45.mp3",
  "https://hezebin.com/static/media/%E5%91%A8%E6%9D%B0%E4%BC%A6-%E7%A8%BB%E9%A6%99.46ddd8b452d7a726598d.mp3",
  "https://hezebin.com/static/media/%E8%AE%B8%E5%B5%A9-%E6%9C%89%E4%BD%95%E4%B8%8D%E5%8F%AF.dcaacecc849c1cdb12c2.mp3",
  "https://hezebin.com/static/media/%E5%91%A8%E6%9D%B0%E4%BC%A6-%E5%90%AC%E5%A6%88%E5%A6%88%E7%9A%84%E8%AF%9D.f64b52bd3085042effa6.mp3",
  "https://hezebin.com/static/media/%E7%A8%BB%E9%A6%99-Hope%E7%BB%84%E5%90%88.ef2c17f6d0b23f7751a5.mp3",
  "https://hezebin.com/static/media/%E8%89%BE%E8%BE%B0-%E6%81%8B%E7%88%B1%E5%95%A6.36e51ba0dcc46aced682.mp3",
  "https://hezebin.com/static/media/%E8%AE%B8%E5%B5%A9,%E8%8E%AB%E8%AF%97%E6%97%8E-%E4%BD%A0%E8%8B%A5%E6%88%90%E9%A3%8E.f8ef516e7f91ce37acb9.mp3",
  "https://hezebin.com/static/media/%E5%8B%87%E6%B0%94%E5%A4%A7%E7%88%86%E5%8F%91-%E5%9C%9F%E8%B1%86%E7%8E%8B%E5%9B%BD%E5%B0%8F%E4%B9%90%E9%98%9F.6e910d517fe6ecc7b4b0.mp3",
  "https://hezebin.com/static/media/You%20(=I)-%EB%B3%BC%EB%B9%A8%EA%B0%84%EC%82%AC%EC%B6%98%EA%B8%B0.21945ecd3380cc6aa8a9.mp3",
  "https://hezebin.com/static/media/%E6%88%91%E6%83%B3-%E8%91%A3%E6%98%B1%E6%98%86.25335cdcd33a5728b0cd.mp3",
  "https://cdn.truefilesize.com/test/test-100mb.bin",
  "https://cdn.truefilesize.com/test/test-500mb.bin",
  "https://cdn.truefilesize.com/test/test-1gb.bin",
];

/**
 * 从 SONGS 中随机取一首歌曲。
 *
 * @example
 * const url = getRandomSong();
 */
export const getRandomSong = () => {
  const index = Math.floor(Math.random() * SONGS.length);
  return SONGS[index] ?? SONGS[0];
};

/** 限流假数据用的曲目元信息（中 / 日 / 英，至少 100 条） */
export const MOCK_TRACK_METAS = [
  // —— 中文 ——
  { title: "祝我下次哭是因为幸福", artist: "庄东茹（豆芽鱼）", album: "祝我下次哭是因为幸福" },
  { title: "是你", artist: "TFBOYS", album: "是你" },
  { title: "稻香", artist: "周杰伦", album: "魔杰座" },
  { title: "有何不可", artist: "许嵩", album: "自定义" },
  { title: "听妈妈的话", artist: "周杰伦", album: "依然范特西" },
  { title: "恋爱啦", artist: "艾辰", album: "恋爱啦" },
  { title: "你若成风", artist: "许嵩,莫诗旎", album: "你若成风" },
  { title: "勇气大爆发", artist: "土豆王国小乐队", album: "勇气大爆发" },
  { title: "我想", artist: "董昱昆", album: "我想" },
  { title: "等你下课", artist: "周杰伦", album: "等你下课" },
  { title: "晴天", artist: "周杰伦", album: "叶惠美" },
  { title: "七里香", artist: "周杰伦", album: "七里香" },
  { title: "夜曲", artist: "周杰伦", album: "十一月的萧邦" },
  { title: "青花瓷", artist: "周杰伦", album: "我很忙" },
  { title: "简单爱", artist: "周杰伦", album: "范特西" },
  { title: "告白气球", artist: "周杰伦", album: "周杰伦的床边故事" },
  { title: "江南", artist: "林俊杰", album: "第二天堂" },
  { title: "修炼爱情", artist: "林俊杰", album: "因你而在" },
  { title: "那些你很冒险的梦", artist: "林俊杰", album: "学不会" },
  { title: "小幸运", artist: "田馥甄", album: "小幸运" },
  { title: "演员", artist: "薛之谦", album: "绅士" },
  { title: "丑八怪", artist: "薛之谦", album: "意外" },
  { title: "消愁", artist: "毛不易", album: "平凡的一天" },
  { title: "像我这样的人", artist: "毛不易", album: "平凡的一天" },
  { title: "起风了", artist: "买辣椒也用券", album: "起风了" },
  { title: "光年之外", artist: "G.E.M.邓紫棋", album: "光年之外" },
  { title: "泡沫", artist: "G.E.M.邓紫棋", album: "Xposed" },
  { title: "体面", artist: "于文文", album: "前任3：再见前任" },
  { title: "后来", artist: "刘若英", album: "我等你" },
  { title: "勇气", artist: "梁静茹", album: "勇气" },
  { title: "分手快乐", artist: "梁静茹", album: "美丽人生" },
  { title: "爱你", artist: "王心凌", album: "爱你" },
  { title: "第一次爱的人", artist: "王心凌", album: "爱你" },
  { title: "小宇", artist: "张震岳", album: "OK" },
  { title: "温柔", artist: "五月天", album: "温柔" },
  { title: "突然好想你", artist: "五月天", album: "后青春期的诗" },
  { title: "倔强", artist: "五月天", album: "神的孩子都在跳舞" },
  { title: "知足", artist: "五月天", album: "知足 just rock it!!!" },
  { title: "成都", artist: "赵雷", album: "无法长大" },
  { title: "理想三旬", artist: "陈鸿宇", album: "浓烟下的诗歌电台" },
  { title: "南山南", artist: "马頔", album: "孤岛" },
  { title: "董小姐", artist: "宋冬野", album: "安和桥北" },
  { title: "斑马斑马", artist: "宋冬野", album: "安和桥北" },
  { title: "平凡之路", artist: "朴树", album: "猎户星座" },
  { title: "那些花儿", artist: "朴树", album: "我去2000年" },
  { title: "生如夏花", artist: "朴树", album: "生如夏花" },
  { title: "岁月神偷", artist: "金玟岐", album: "金玟岐作品集" },
  { title: "体面到老", artist: "陈粒", album: "如也" },
  { title: "小半", artist: "陈粒", album: "小梦大半" },
  { title: "奇妙能力歌", artist: "陈粒", album: "如也" },
  { title: "理想", artist: "赵雷", album: "无法长大" },
  { title: "大鱼", artist: "周深", album: "大鱼海棠" },
  { title: "化身孤岛的鲸", artist: "不才", album: "化身孤岛的鲸" },
  { title: "海底", artist: "一只榴莲", album: "海底" },
  { title: "漠河舞厅", artist: "柳爽", album: "漠河舞厅" },
  { title: "下山", artist: "要不要买菜", album: "下山" },
  { title: "少年", artist: "梦然", album: "少年" },
  { title: "孤勇者", artist: "陈奕迅", album: "孤勇者" },
  { title: "十年", artist: "陈奕迅", album: "黑·白·灰" },
  { title: "富士山下", artist: "陈奕迅", album: "What's Going On...?" },
  { title: "爱情转移", artist: "陈奕迅", album: "认了吧" },
  { title: "好久不见", artist: "陈奕迅", album: "认了吧" },
  { title: "红玫瑰", artist: "陈奕迅", album: "认了吧" },
  { title: "夜空中最亮的星", artist: "逃跑计划", album: "世界" },
  { title: "一万次悲伤", artist: "逃跑计划", album: "世界" },
  { title: "说散就散", artist: "JC 陈咏桐", album: "前任3：再见前任" },
  { title: "可惜没如果", artist: "林俊杰", album: "新地球" },
  { title: "不为谁而作的歌", artist: "林俊杰", album: "和自己对话" },
  { title: "模特", artist: "李荣浩", album: "模特" },
  { title: "作曲家", artist: "李荣浩", album: "有理想" },
  { title: "年少有为", artist: "李荣浩", album: "耳朵" },
  { title: "麻雀", artist: "李荣浩", album: "麻雀" },
  { title: "句号", artist: "G.E.M.邓紫棋", album: "摩天动物园" },
  { title: "来自天堂的魔鬼", artist: "G.E.M.邓紫棋", album: "新的心跳" },
  { title: "追光者", artist: "岑宁儿", album: "夏至未至 影视原声带" },
  { title: "微微", artist: "傅菁", album: "微微一笑很倾城" },
  { title: "说谎", artist: "林宥嘉", album: "感官/世界" },
  { title: "成全", artist: "林宥嘉", album: "大小说家" },

  // —— 日文 ——
  { title: "夜に駆ける", artist: "YOASOBI", album: "THE BOOK" },
  { title: "アイドル", artist: "YOASOBI", album: "アイドル" },
  { title: "群青", artist: "YOASOBI", album: "THE BOOK" },
  { title: "ハルジオン", artist: "YOASOBI", album: "THE BOOK" },
  { title: "炎", artist: "LiSA", album: "炎" },
  { title: "紅蓮華", artist: "LiSA", album: "LEO-NiNE" },
  { title: "明け星", artist: "LiSA", album: "明け星" },
  { title: "Lemon", artist: "米津玄師", album: "BOOTLEG" },
  { title: "打上花火", artist: "DAOKO × 米津玄師", album: "打上花火" },
  { title: "ピースサイン", artist: "米津玄師", album: "BOOTLEG" },
  { title: "馬と鹿", artist: "米津玄師", album: "STRAY SHEEP" },
  { title: "灰色と青", artist: "米津玄師 × 菅田将暉", album: "BOOTLEG" },
  { title: "Pretender", artist: "Official髭男dism", album: "Traveler" },
  { title: "I LOVE...", artist: "Official髭男dism", album: "Editorial" },
  { title: "ミックスナッツ", artist: "Official髭男dism", album: "ミックスナッツ EP" },
  { title: "Subtitle", artist: "Official髭男dism", album: "Subtitle" },
  { title: "ドライフラワー", artist: "優里", album: "壱" },
  { title: "ベテルギウス", artist: "優里", album: "壱" },
  { title: "かくれんぼ", artist: "優里", album: "壱" },
  { title: "残響散歌", artist: "Aimer", album: "Deep down" },
  { title: "カタオモイ", artist: "Aimer", album: "daydream" },
  { title: "Ref:rain", artist: "Aimer", album: "Penny Rain" },
  { title: "水平線", artist: "back number", album: "ユーモア" },
  { title: "高嶺の花子さん", artist: "back number", album: "ラブストーリー" },
  { title: "クリスマスソング", artist: "back number", album: "シャンデリア" },
  { title: "怪獣の花唄", artist: "Vaundy", album: "strobo" },
  { title: "不可幸力", artist: "Vaundy", album: "strobo" },
  { title: "踊り子", artist: "Vaundy", album: "replica" },
  { title: "花に亡霊", artist: "ヨルシカ", album: "だから僕は音楽を辞めた" },
  { title: "ただ君に晴れ", artist: "ヨルシカ", album: "だから僕は音楽を辞めた" },
  { title: "言って", artist: "ヨルシカ", album: "だから僕は音楽を辞めた" },
  { title: "春泥棒", artist: "ヨルシカ", album: "創作" },
  { title: "白日", artist: "King Gnu", album: "Ceremony" },
  { title: "Teenager Forever", artist: "King Gnu", album: "CEREMONY" },
  { title: "三原色", artist: "YOASOBI", album: "THE BOOK 2" },
  { title: "うっせぇわ", artist: "Ado", album: "狂言" },
  { title: "新時代", artist: "Ado", album: "ウタの歌 ONE PIECE FILM RED" },
  { title: "残酷な天使のテーゼ", artist: "高橋洋子", album: "EVANGELION" },
  { title: "君の知らない物語", artist: "supercell", album: "Today Is A Beautiful Day" },
  { title: "千本桜", artist: "WhiteFlame feat. 初音ミク", album: "千本桜" },
  { title: "恋", artist: "星野源", album: "YELLOW DANCER" },
  { title: "うちで踊ろう", artist: "星野源", album: "うちで踊ろう" },
  { title: "不思議", artist: "星野源", album: "POP VIRUS" },
  { title: "First Love", artist: "宇多田ヒカル", album: "First Love" },
  { title: "Automatic", artist: "宇多田ヒカル", album: "First Love" },
  { title: "花束を君に", artist: "宇多田ヒカル", album: "Fantôme" },
  { title: "栄光の架橋", artist: "ゆず", album: "FURUSATO" },
  { title: "夏色", artist: "ゆず", album: "ゆずえん" },

  // —— 英文 ——
  { title: "Shape of You", artist: "Ed Sheeran", album: "÷ (Divide)" },
  { title: "Perfect", artist: "Ed Sheeran", album: "÷ (Divide)" },
  { title: "Blinding Lights", artist: "The Weeknd", album: "After Hours" },
  { title: "Save Your Tears", artist: "The Weeknd", album: "After Hours" },
  { title: "As It Was", artist: "Harry Styles", album: "Harry's House" },
  { title: "Watermelon Sugar", artist: "Harry Styles", album: "Fine Line" },
  { title: "drivers license", artist: "Olivia Rodrigo", album: "SOUR" },
  { title: "good 4 u", artist: "Olivia Rodrigo", album: "SOUR" },
  { title: "Levitating", artist: "Dua Lipa", album: "Future Nostalgia" },
  { title: "Don't Start Now", artist: "Dua Lipa", album: "Future Nostalgia" },
  { title: "Bad Guy", artist: "Billie Eilish", album: "WHEN WE ALL FALL ASLEEP, WHERE DO WE GO?" },
  { title: "Happier Than Ever", artist: "Billie Eilish", album: "Happier Than Ever" },
  { title: "Anti-Hero", artist: "Taylor Swift", album: "Midnights" },
  { title: "Love Story", artist: "Taylor Swift", album: "Fearless" },
  { title: "Shake It Off", artist: "Taylor Swift", album: "1989" },
  { title: "Cruel Summer", artist: "Taylor Swift", album: "Lover" },
  { title: "Someone Like You", artist: "Adele", album: "21" },
  { title: "Hello", artist: "Adele", album: "25" },
  { title: "Easy On Me", artist: "Adele", album: "30" },
  { title: "Stay", artist: "The Kid LAROI & Justin Bieber", album: "F*CK LOVE 3: OVER YOU" },
  { title: "Peaches", artist: "Justin Bieber", album: "Justice" },
  { title: "Señorita", artist: "Shawn Mendes & Camila Cabello", album: "Shawn Mendes" },
  {
    title: "Sunflower",
    artist: "Post Malone & Swae Lee",
    album: "Spider-Man: Into the Spider-Verse",
  },
  { title: "Circles", artist: "Post Malone", album: "Hollywood's Bleeding" },
  { title: "Believer", artist: "Imagine Dragons", album: "Evolve" },
  { title: "Thunder", artist: "Imagine Dragons", album: "Evolve" },
  { title: "Counting Stars", artist: "OneRepublic", album: "Native" },
  { title: "Viva La Vida", artist: "Coldplay", album: "Viva La Vida or Death and All His Friends" },
  { title: "Yellow", artist: "Coldplay", album: "Parachutes" },
  { title: "Fix You", artist: "Coldplay", album: "X&Y" },
  { title: "Bohemian Rhapsody", artist: "Queen", album: "A Night at the Opera" },
  { title: "Don't Stop Me Now", artist: "Queen", album: "Jazz" },
  { title: "Hotel California", artist: "Eagles", album: "Hotel California" },
  {
    title: "Take Me Home, Country Roads",
    artist: "John Denver",
    album: "Poems, Prayers & Promises",
  },
  { title: "Imagine", artist: "John Lennon", album: "Imagine" },
  { title: "Hey Jude", artist: "The Beatles", album: "Hey Jude" },
  { title: "Let It Be", artist: "The Beatles", album: "Let It Be" },
  { title: "Yesterday", artist: "The Beatles", album: "Help!" },
  { title: "Smells Like Teen Spirit", artist: "Nirvana", album: "Nevermind" },
  { title: "Numb", artist: "Linkin Park", album: "Meteora" },
  { title: "In the End", artist: "Linkin Park", album: "Hybrid Theory" },
  { title: "Somebody That I Used to Know", artist: "Gotye", album: "Making Mirrors" },
  { title: "Take On Me", artist: "a-ha", album: "Hunting High and Low" },
  { title: "Africa", artist: "Toto", album: "Toto IV" },
  { title: "Billie Jean", artist: "Michael Jackson", album: "Thriller" },
  { title: "Beat It", artist: "Michael Jackson", album: "Thriller" },
  { title: "Uptown Funk", artist: "Mark Ronson ft. Bruno Mars", album: "Uptown Special" },
  { title: "Just the Way You Are", artist: "Bruno Mars", album: "Doo-Wops & Hooligans" },
  { title: "Shallow", artist: "Lady Gaga & Bradley Cooper", album: "A Star Is Born" },
  { title: "Poker Face", artist: "Lady Gaga", album: "The Fame" },
  { title: "Rolling in the Deep", artist: "Adele", album: "21" },
  { title: "All of Me", artist: "John Legend", album: "Love in the Future" },
  { title: "Thinking Out Loud", artist: "Ed Sheeran", album: "x (Multiply)" },
  { title: "Photograph", artist: "Ed Sheeran", album: "x (Multiply)" },
  { title: "You (=I)", artist: "볼빨간사춘기", album: "Red Diary Page.1" },
];

/**
 * 从 MOCK_TRACK_METAS 中随机取一组 title / artist / album。
 *
 * @example
 * const { title, artist, album } = getRandomTrackMeta();
 */
export const getRandomTrackMeta = () => {
  const index = Math.floor(Math.random() * MOCK_TRACK_METAS.length);
  return MOCK_TRACK_METAS[index] ?? MOCK_TRACK_METAS[0];
};

/**
 * 生成随机 playAuth（近似真实接口的 Base64 形态）。
 *
 * @example
 * const playAuth = getRandomPlayAuth();
 */
export const getRandomPlayAuth = () => {
  const bytes = Buffer.from(Array.from({ length: 36 }, () => Math.floor(Math.random() * 256)));
  return bytes.toString("base64");
};

/**
 * 生成随机 playAuthID（32 位十六进制）。
 *
 * @example
 * const playAuthID = getRandomPlayAuthID();
 */
export const getRandomPlayAuthID = () => {
  return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
};
