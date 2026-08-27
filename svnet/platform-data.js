/* ============================================================
   胜维科技 · 演示平台数据（SPA /cases 路由共用）
   —— 客户后期更换域名、账号只需修改本文件，无需动页面代码 ——
   status: live(已上线) / soon(即将上线)
   ============================================================ */
window.PLATFORMS = [
  {
    id: "ag",
    name: "AG（CO官方直营）",
    short: "AG",
    type: "CO真人 · 即原AG",
    status: "live",
    member: ["www.co333.co", "www.co555.co"],
    admin: ["www.co333.net", "www.co555.net"],
    accounts: [{ user: "co111 – co999", pass: "123456" }],
    tags: ["官网直营", "可体验任意房间"],
    note: "CO真人即原AG体系，官方直营演示站。"
  },
  {
    id: "db",
    name: "DB多宝真人",
    short: "DB",
    type: "多宝真人 · 含多宝贵宾会",
    status: "soon",
    member: [],
    admin: [],
    accounts: [],
    tags: ["官网1:1", "可控API", "可接入现金网"],
    note: "DB多宝官网1:1即将推出，含DB多宝贵宾会；可控API已可接入现金网。"
  },
  {
    id: "evo",
    name: "EVO真人",
    short: "EVO",
    type: "可控API",
    status: "live",
    member: ["YJ111.VIP"],
    admin: [],
    accounts: [{ user: "evo88", pass: "aabb1122" }],
    tags: ["独立商户独立奖池", "RTP 10–90可调", "AI换牌"],
    note: "独立商户、独立后台奖池；RTP值10–90调整操作强度；支持AI换牌（图像识别）。"
  },
  {
    id: "yaxin",
    name: "亚星",
    short: "亚星",
    type: "真人百家乐 · 分新版 / 旧版",
    status: "live",
    member: [
      "www.yaxin799.com（新版）",
      "www.yaxin988.com（新版）",
      "www.yaxin199.com（旧版）",
      "www.yaxin599.com（旧版）"
    ],
    admin: ["www.yaxin911.net"],
    accounts: [{ user: "c001 – c005", pass: "111222" }],
    tags: ["1:1还原", "现金网API接入"],
    note: "会员入口区分新版与旧版，登录前请确认使用对应版本。"
  },
  {
    id: "aobbo",
    name: "欧博",
    short: "欧博",
    type: "真人百家乐",
    status: "live",
    member: ["www.aabbgg118.com", "www.aabbgg228.com"],
    admin: ["ams.aabbgg118.com", "ams.aabbgg228.com"],
    accounts: [{ user: "bb01 – bb05", pass: "123456" }],
    tags: ["1:1还原", "代理体系完整"],
    note: ""
  },
  {
    id: "manli",
    name: "萬利",
    short: "萬利",
    type: "真人百家乐",
    status: "live",
    member: ["2l3168.com（电脑版）", "m.2l3168.com（手机版）"],
    admin: ["vip.2l3168.com"],
    accounts: [
      { user: "app000001", pass: "aabb0000" },
      { user: "app000002", pass: "aabb0000" }
    ],
    tags: ["可登陆官网账号", "可官网域名登陆"],
    note: ""
  },
  {
    id: "libo",
    name: "利博",
    short: "利博",
    type: "真人百家乐 · 最新版",
    status: "live",
    member: ["www.557274978.com", "www.371853817.com"],
    admin: ["agen.557274978.com", "agen.371853817.com"],
    accounts: [{ user: "bb01 – bb08", pass: "123456" }],
    tags: ["可登陆官网账号", "可官网域名登陆", "可开无限级代理"],
    note: ""
  },
  {
    id: "ug",
    name: "UG环球",
    short: "UG",
    type: "真人百家乐",
    status: "live",
    member: ["www.hqg68.com", "www.hgq98.com", "www.hqg1886.com"],
    admin: ["agent.hqg68.com"],
    accounts: [{ user: "c001 – c007", pass: "111222" }],
    tags: ["可登陆官网账号", "可官网域名登陆"],
    note: ""
  },
  {
    id: "360",
    name: "环球360",
    short: "360",
    type: "真人百家乐",
    status: "soon",
    member: ["325628256.com", "984154372.com"],
    admin: ["agen.325628256.com", "agen.984154372.com"],
    accounts: [{ user: "hq01 – hq08", pass: "123456" }],
    tags: ["可登陆官网账号", "可官网域名登陆", "可开无限级代理"],
    note: "环球360可控版本即将上线。"
  },
  {
    id: "guest-club",
    name: "贵宾会（AG亚洲贵宾会）",
    short: "贵宾会",
    type: "1:1可控贵宾会",
    status: "live",
    member: ["www.agg117.vip", "www.agg118.vip"],
    admin: ["www.agg115.net", "www.agg116.net"],
    accounts: [{ user: "agag1 – agag8", pass: "aabb8899" }],
    tags: ["1:1还原", "贵宾专属玩法"],
    note: ""
  },
  {
    id: "api-demo",
    name: "可控API演示站",
    short: "API",
    type: "原AG、PA真人、CHOICE可控API",
    status: "live",
    member: ["www.co888.co"],
    admin: [],
    accounts: [{ user: "co111 – co888", pass: "123456" }],
    tags: ["登录任意房间", "连开五把庄/闲可指定"],
    note: "欢迎盘总接入、代理加盟：登录账号进入任意房间，连开五把庄或闲由您指定。"
  },
  {
    id: "cashnet",
    name: "可控现金网「赢家」",
    short: "现金网",
    type: "PG电子可控 + EVO/AG/DB真人可控",
    status: "live",
    member: ["www.YJ111.VIP", "www.YJ222.VIP", "www.YJ333.VIP"],
    admin: [],
    accounts: [],
    tags: ["安卓 / 苹果APP", "代理佣金日结", "微信 / 支付宝 / U入款"],
    note: ""
  }
];

/* 电话投注流程（cases.html独立小节） */
window.PHONE_BET_STEPS = [
  { title: "不设登入网址", desc: "无需向玩家公开登录入口，从源头降低域名泄露与追踪风险。" },
  { title: "投手配置", desc: "客户可自行派遣投手，或由我们在现场配置专业投手团队。" },
  { title: "电话指挥投注", desc: "投手通过电话实时指挥投注，流程闭环、响应迅速。" }
];

/* 平台名称徽章（首页矩阵顶部） */
window.PLATFORM_BADGES = ["AG", "DB", "EVO", "亚星", "欧博", "萬利", "环球360", "利博", "UG", "CO"];
