/* ============================================================
   胜维科技 · 官网后台 — 演示数据库（种子数据）
   镜像前台站点全部内容，结构即前台渲染所需的数据模型。
   所有增删改保存在 localStorage（key: sw_admin_db_v1），
   可一键恢复为出厂种子。
   ============================================================ */
(function () {
  "use strict";

  var SEED = {
    /* ---------- 1. 演示平台（对应 platform-data.js / 演示体验页） ---------- */
    platforms: [
      {
        id: "ag",
        name: "AG(CO官方直营)",
        short: "AG",
        type: "CO真人 · 即原AG",
        status: "live",
        member: ["www.co333.co", "www.co555.co"],
        admin: ["www.co333.net", "www.co555.net"],
        accounts: [{ user: "co111 – co999", pass: "123456" }],
        tags: ["官网直营", "可体验任意房间"],
        note: "CO真人即原AG体系，官方直营演示站。",
        sort: 1
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
        note: "DB多宝官网1:1即将推出，含DB多宝贵宾会；可控API已可接入现金网。",
        sort: 2
      },
      {
        id: "yaxin",
        name: "亚星",
        short: "亚星",
        type: "真人百家乐 · 分新版 / 旧版",
        status: "live",
        member: [
          "www.yaxin799.com(新版)",
          "www.yaxin988.com(新版)",
          "www.yaxin199.com(旧版)",
          "www.yaxin599.com(旧版)"
        ],
        admin: ["www.yaxin911.net"],
        accounts: [{ user: "c001 – c005", pass: "111222" }],
        tags: ["1:1还原", "现金网API接入"],
        note: "会员入口区分新版与旧版，登录前请确认使用对应版本。",
        sort: 3
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
        note: "",
        sort: 4
      },
      {
        id: "manli",
        name: "萬利",
        short: "萬利",
        type: "真人百家乐",
        status: "live",
        member: ["2l3168.com(电脑版)", "m.2l3168.com(手机版)"],
        admin: ["vip.2l3168.com"],
        accounts: [
          { user: "app000001", pass: "aabb0000" },
          { user: "app000002", pass: "aabb0000" }
        ],
        tags: ["可登陆官网账号", "可官网域名登陆"],
        note: "",
        sort: 5
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
        note: "",
        sort: 6
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
        note: "",
        sort: 7
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
        note: "环球360可控版本即将上线。",
        sort: 8
      },
      {
        id: "guest-club",
        name: "贵宾会(AG亚洲贵宾会)",
        short: "贵宾会",
        type: "1:1可控贵宾会",
        status: "live",
        member: ["www.agg117.vip", "www.agg118.vip"],
        admin: ["www.agg115.net", "www.agg116.net"],
        accounts: [{ user: "agag1 – agag8", pass: "aabb8899" }],
        tags: ["1:1还原", "贵宾专属玩法"],
        note: "",
        sort: 9
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
        note: "欢迎盘总接入、代理加盟：登录账号进入任意房间，连开五把庄或闲由您指定。",
        sort: 10
      },
      {
        id: "cashnet",
        name: "赢家可控现金网",
        short: "现金网",
        type: "PG电子可控 + AG/DB真人可控",
        status: "live",
        member: ["www.YJ111.VIP", "www.YJ222.VIP", "www.YJ333.VIP"],
        admin: [],
        accounts: [],
        tags: ["安卓 / 苹果APP", "代理佣金日结", "微信 / 支付宝 / U入款"],
        note: "",
        sort: 11
      }
    ],

    /* ---------- 2. 文章（对应 内容中心 articles.html） ---------- */
    articles: [
      {
        id: "art-ai-rtp",
        title: "可控真人视讯的原理：AI换牌与RTP调控",
        category: "tech",
        catLabel: "技术解析",
        date: "2026-08-12",
        featured: true,
        readMin: 5,
        lede: "在 1:1 还原官网体验的基础上，AI 图像识别换牌与 10–90 可调的 RTP，构成「体验真实、结果可控」的完整闭环。",
        body: "<p>可控真人视讯并非「另起炉灶」，而是在 1:1 高仿还原主流平台官网体验的基础上，通过自研引擎对发牌与结果进行后台调控。AG、DB、EVO、亚星、欧博、萬利、环球360、利博、开天、UG环球等主流品牌均已实现官网级还原，现金网 API 同步接入。</p><h3>AI 换牌：图像识别驱动的牌面替换</h3><p>AI 换牌依托图像识别技术，在实时视讯流中识别牌面并按后台配置完成替换，全程无感、不改变主播画面节奏。它解决的是「单局体验」——在关键时点让牌面走向符合运营预期，属于快变量。</p><h3>RTP 调控：10–90 的运营杠杆</h3><p>RTP 代表平台的理论返奖率，可在 10–90 的区间内按运营目标灵活设置：数值越高玩家返还越多，数值越低平台抽水越强。它决定的是长期收益曲线，属于慢变量。独立商户独立奖池，配置即时生效、全程可审计。</p><h3>为什么两者必须配合</h3><p>单看 RTP，平台只能控制整体水位，无法干预单局体验；单看换牌，则缺少长期收益的兜底。两者配合，构成「体验真实、结果可控」的完整闭环——玩家看到的是熟悉的真人牌局，运营方掌握的却是发牌与结果。这是胜维方案区别于标准接入的核心。</p><p>理解这一原理，是评估任何可控方案的第一步。下文将分别拆解 AI 换牌与 RTP 调控的适用边界与常见误区，帮助你在选型与联调时建立清晰的技术预期。</p>",
        sort: 1
      },
      {
        id: "art-rtp-set",
        title: "RTP值10–90：调控强度怎么设",
        category: "tech",
        catLabel: "技术解析",
        date: "2026-08-03",
        featured: false,
        readMin: 4,
        lede: "RTP 是可调的运营杠杆：引流期抬高分流、成熟期回落平衡现金流，支持按渠道与时段单独配置。",
        body: "<p>RTP 是可调的运营杠杆：数值越高，玩家整体返还越多、赢面越大；数值越低，平台抽水越强、收益越稳。</p><p>实操中建议分场景设置——新人引流期可阶段性抬高 RTP 培养习惯，成熟期回落至目标区间以平衡现金流；不同渠道、不同时段还可单独配置，实现精细化运营。</p><p>需要特别区分：RTP 是「整体返还率」，属于慢变量，决定长期收益曲线；而 AI 换牌针对的是单局牌面，属于快变量，决定关键时点的体验。两者配合使用，才是完整的调控手段。</p><p>所有 RTP 配置均在独立后台完成，独立商户独立奖池、互不干扰，调整即时生效且全程可审计。合理设定 RTP 的强度与节奏，是让「可控」长期可持续的关键。</p>",
        sort: 2
      },
      {
        id: "art-api-flow",
        title: "三日API接入流程：从鉴权到上线",
        category: "onboard",
        catLabel: "接入指南",
        date: "2026-07-25",
        featured: false,
        readMin: 6,
        lede: "鉴权→房间列表→投注控制→结果回传四步标准流程，标准化接口 + 沙盒环境，专人联调，最快三个工作日上线。",
        body: "<p>标准接入采用标准化 RESTful 接口与沙盒环境，最快三个工作日完成上线，流程分四步。</p><h3>第一步 · 鉴权</h3><p>平台分配商户专属密钥，所有请求经签名校验后进入系统；密钥与商户绑定，独立商户独立奖池，从通道层面保证数据隔离。</p><h3>第二步 · 房间列表</h3><p>拉取实时房间与主播信息：房间状态、在线人数、当前局数、最低/最高投注额，一次调用全部返回，供前端直接渲染。</p><h3>第三步 · 投注控制</h3><p>下发注单、调控 RTP 与换牌：注单实时同步至房间，RTP 与 AI 换牌按商户配置生效，玩家侧全程无感。</p><h3>第四步 · 结果回传</h3><p>开奖结果与资金流水通过回调实时回写，与投注记录逐笔对应，支持对账导出。</p><p>全程有专人跟进联调，接口文档齐全，验收通过即可灰度放量、平稳切到正式环境。标准化的接入流程，让「可控」不再依赖定制开发，而是像水电一样即插即用。</p>",
        sort: 3
      },
      {
        id: "art-private",
        title: "独立品牌私域定制：域名、后台与源码归属",
        category: "onboard",
        catLabel: "接入指南",
        date: "2026-07-15",
        featured: false,
        readMin: 4,
        lede: "Logo、后台、域名、源码全属自有，支持官网账号 / 域名登录与无限级代理，帮助运营商沉淀自有品牌资产。",
        body: "<p>私域定制让运营商真正「拥有」一套平台，而非租用：Logo、UI、名称全属自有；奖池、RTP、代理体系独立运营；支持官网账号登录、官网域名登录；源码交付，从设计、开发到部署全程自有团队，后续迭代不受外包方制约。</p><h3>域名与品牌</h3><p>会员端使用自有域名独立上线，支持官网账号体系与官网域名登录，玩家认知与品牌资产完全沉淀在自己手里。</p><h3>后台与源码</h3><p>管理后台、商户后台按品牌需求定制交付；源码完整交付，含部署文档与二次开发说明，后续版本迭代可由自有团队主导。</p><h3>代理体系</h3><p>同时支持开设无限级代理体系，每一层代理独立后台、独立报表，为渠道扩张预留完整空间。</p><p>适合希望长期沉淀自有品牌与用户资产的运营商——平台是工具，品牌才是资产。</p>",
        sort: 4
      },
      {
        id: "art-commission",
        title: "代理佣金日结与无限级代理体系",
        category: "ops",
        catLabel: "运营策略",
        date: "2026-07-02",
        featured: false,
        readMin: 3,
        lede: "代理佣金日结 + 无限级代理体系，让渠道当天回款、降低资金占用；入款打通微信、支付宝与 U，是现金网扩张的现金流底座。",
        body: "<p>现金网业务的渠道竞争力，很大程度取决于资金回笼速度与代理裂变能力。</p><p>赢家可控现金网支持代理佣金日结，配合无限级代理体系，可让每一层渠道当天回款，显著降低渠道侧资金占用、提升拓展积极性。</p><p>入款侧打通微信、支付宝与 U 入款通道，会员资金进出顺畅。合理的佣金与层级设计，是现金网规模扩张的现金流底座。</p>",
        sort: 5
      },
      {
        id: "art-multicurrency",
        title: "可控现金网的多币种结算与实时对账",
        category: "insight",
        catLabel: "行业洞察",
        date: "2026-06-20",
        featured: false,
        readMin: 3,
        lede: "支持法币与稳定币结算，实时汇率引擎自动对账、财务零手工；全量数据看板多维下钻，让运营决策有据可依。",
        body: "<p>多币种结算与对账效率，是现金网规模化运营最大的隐性成本之一。</p><p>胜维方案支持主流法币与稳定币结算，内置实时汇率引擎自动对账，财务侧基本零手工干预，跨币种流水自动归集。</p><p>配合会员行为、流水与 RTP 的全量数据看板，可按渠道 / 玩法 / 时段多维下钻，让运营决策从「凭感觉」转向「看数据」。</p>",
        sort: 6
      }
    ],

    /* ---------- 3. 新闻（对应 新闻中心 news.html） ---------- */
    news: [
      {
        id: "news-api-launch",
        title: "可控API正式上线：AG、PA真人、CHOICE全面接入",
        category: "product",
        catLabel: "产品动态",
        date: "2026-07-18",
        excerpt: "可控API演示站已开放：登录账号即可进入任意房间，连开五把庄或闲由您指定。欢迎盘总接入、代理加盟。",
        body: "<p>可控API演示站已正式上线。登录演示账号即可进入任意房间，连开五把庄或闲由您指定，完整体验「体验真实、结果可控」的核心能力。</p><p>API 覆盖原AG、PA真人、CHOICE三大玩法，标准 RESTful 接口 + 沙盒环境，最快三个工作日完成联调上线。欢迎盘总接入、代理加盟，详情通过 Telegram @kekong88 联系商务顾问。</p>",
        sort: 1
      },
      {
        id: "news-db",
        title: "DB多宝官网1:1即将推出",
        category: "product",
        catLabel: "产品动态",
        date: "2026-07-05",
        excerpt: "DB多宝真人官网1:1版本进入最后测试，含DB多宝贵宾会；可控API已可先行接入现金网系统。",
        body: "<p>DB多宝真人官网 1:1 版本已进入最后测试阶段，界面、玩法与原版完全一致，并包含 DB多宝贵宾会。</p><p>在官网版正式上线前，DB 的多宝真人可控 API 已可先行接入现金网系统，满足「先接入、后换官网」的平滑过渡需求。正式开放时间将通过 Telegram 同步。</p>",
        sort: 2
      },
      {
        id: "news-360",
        title: "环球360可控版本进入测试",
        category: "product",
        catLabel: "产品动态",
        date: "2026-06-24",
        excerpt: "环球360可控版本已完成官网还原与后台打通，支持无限级代理体系，正式开放体验前将在此公告。",
        body: "<p>环球360可控版本已完成官网级还原与商户后台打通，房间数据实时回传、RTP 与换牌按商户独立配置。</p><p>该版本支持无限级代理体系，每一层代理独立后台与报表。正式开放体验前将在新闻中心公告，并同步更新演示账号。</p>",
        sort: 3
      },
      {
        id: "news-commission",
        title: "代理佣金日结政策更新：渠道扩张的现金流逻辑",
        category: "industry",
        catLabel: "行业观察",
        date: "2026-05-16",
        excerpt: "赢家可控现金网代理佣金支持日结，配合无限级代理体系，降低渠道侧资金占用——政策要点与适用场景说明。",
        body: "<p>渠道侧资金占用一直是现金网代理体系的核心痛点。赢家可控现金网自本期起支持代理佣金日结：每一层代理的佣金按日结算、当日到账。</p><p>配合无限级代理体系，渠道当天回款，拓展积极性显著提升。入款侧同步打通微信、支付宝与 U 通道。适合处于快速扩张期、需要以现金流撬动渠道规模的盘总与现金网主。</p>",
        sort: 4
      }
    ],

    /* ---------- 4. 服务（对应 核心服务 services.html） ---------- */
    services: [
      {
        id: "svc-live",
        index: "Service 01",
        title: "可控真人视讯",
        desc: "主流真人视讯平台1:1高仿还原官网，玩家体验与原版无差异；后台接入可控内核，发牌、换牌、RTP全部可配置，稳定运行不宕机。",
        features: [
          "AG、DB、亚星、欧博、萬利、环球360、利博、UG、CO已实现官网级还原",
          "AI换牌与发牌节奏调控，规则后台化、可审计",
          "支持现金网API接入，房间数据实时回传"
        ],
        flip: false,
        note: "真人视讯演播厅 · 按占位框实际尺寸出图",
        sort: 1
      },
      {
        id: "svc-api",
        index: "Service 02",
        title: "API接入方案",
        desc: "标准化RESTful接口与沙盒环境，文档齐全、联调有专人跟进。独立商户独立后台奖池，RTP值10–90调整操作强度，最快三个工作日完成上线。",
        features: [
          "独立商户、独立后台奖池，开通即隔离",
          "RTP值10–90连续可调，分商户差异化配置",
          "AI换牌（图像识别）能力随API一并开放",
          "可接入自有现金网系统，流水数据实时对账"
        ],
        flip: true,
        flow: ["鉴权签名", "房间列表", "投注控制", "结果回传"],
        note: "API接入沙盒环境 · 按占位框实际尺寸出图",
        sort: 2
      },
      {
        id: "svc-private",
        index: "Service 03",
        title: "独立品牌 / 私域定制",
        desc: "域名、UI、后台全属自有，从设计、开发到部署全程自有团队，源码完整交付——客户拥有真正的独立品牌，而非贴牌。",
        features: [
          "可登陆官网账号、可官网域名登陆，品牌资产完全自有",
          "可开无限级代理，代理体系自主配置",
          "定制Logo、域名、UI与后台，整站源码交付"
        ],
        flip: false,
        note: "独立品牌整站 · 按占位框实际尺寸出图",
        sort: 3
      },
      {
        id: "svc-cash",
        index: "Service 04",
        title: "可控现金网",
        desc: "真金游戏大厅整体方案：PG电子可控 + AG / DB真人可控，APP、入款、佣金一体化交付，开箱即运营。",
        features: [
          "PG电子可控 + AG / DB真人可控，玩法组合自由",
          "安卓 / 苹果APP下载，入款支持微信、支付宝、U盘",
          "代理佣金支持日结，渠道扩张有现金流支撑"
        ],
        flip: true,
        note: "现金网大厅 · 按占位框实际尺寸出图",
        sort: 4
      },
      {
        id: "svc-casino",
        index: "Service 05",
        title: "赌场电投 / 现场可控",
        desc: "面向线下与混合场景的两项专项能力，覆盖电子投注与现场牌局两种形态（详细规格以定制方案确认为准）。",
        features: [
          "赌场电投可控：电子投注通道接入可控引擎，规则与线上一致",
          "赌场现场可控：现场牌局支持投手电话指挥与结果留痕",
          "两项能力均可独立采购，也可并入现金网整体方案"
        ],
        flip: false,
        note: "赌场现场 · 按占位框实际尺寸出图",
        sort: 5
      }
    ],

    /* ---------- 5. 关于（对应 about.html） ---------- */
    about: {
      introParas: [
        "胜维科技专注可控真人视讯领域十余年，是行业领先的可控视讯解决方案提供商，为行业代理、包网商、现金网主与盘总提供稳定、安全的视讯系统与API接入方案。",
        "我们的核心能力建立在自研可控内核之上：主流真人视讯平台1:1高仿还原官网，融合AI算法与图像识别实现换牌与发牌节奏调控，RTP值10–90灵活配置，独立商户独立后台奖池——规则透明、可审计、不依赖第三方黑盒。",
        "从单平台API接入到独立品牌私域整站交付，胜维以自有团队完成设计、开发、部署与长期运营支持，让客户的视讯业务真正握在自己手中。"
      ],
      mission: "让每一家客户都拥有可掌控的视讯业务——稳定运行是底线，可控规则是核心，独立品牌是终局。",
      timeline: [
        { id: "tl-2016", year: "2016", title: "公司创立", desc: "胜维科技成立，聚焦真人视讯接入服务，首批客户以行业代理为主，奠定「稳定交付」的服务基调。", sort: 1 },
        { id: "tl-2018", year: "2018", title: "首批平台1:1还原上线", desc: "完成主流真人视讯平台的官网级还原与后台打通，「所见即所得」的接入体验成为行业口碑标签。", sort: 2 },
        { id: "tl-2020", year: "2020", title: "AI换牌技术上线", desc: "自研图像识别算法投入生产环境，实现发牌过程的AI换牌与节奏调控，可控内核初具规模。", sort: 3 },
        { id: "tl-2023", year: "2023", title: "可控API体系成型", desc: "标准化RESTful接口与沙盒环境上线，独立商户独立奖池、RTP 10–90调控全部后台化，三日接入成为常态。", sort: 4 },
        { id: "tl-2025", year: "2025", title: "现金网与私域定制产品线完善", desc: "赢家可控现金网上线，独立品牌私域整站交付体系成熟，形成四大产品线的完整矩阵。", sort: 5 }
      ],
      capabilities: [
        {
          id: "cap-ai",
          tag: "AI换牌",
          eyebrow: "Capability 01",
          title: "AI算法与图像识别",
          desc: "自研图像识别引擎实时解析牌面，在真人发牌过程中完成换牌与节奏干预，画面无感、结果可控。",
          points: [
            "图像识别实时解析牌面信息，识别延迟低于发牌节奏",
            "换牌、连开五把庄/闲等规则均可后台配置",
            "识别引擎独立部署，不影响房间原有画面与延迟"
          ],
          note: "AI换牌示意 · 约1600×900",
          sort: 1
        },
        {
          id: "cap-rtp",
          tag: "RTP调控",
          eyebrow: "Capability 02",
          title: "RTP值10–90灵活调控",
          desc: "返奖率不再写死在规则里：按商户、按房间、按时段独立配置，运营侧即可调整操作强度。",
          points: [
            "10–90区间连续可调，支持分商户差异化配置",
            "调整即时生效，无需重启房间或发布版本",
            "全量流水与RTP数据进看板，决策有据可依"
          ],
          note: "RTP调控后台示意 · 约1600×900",
          sort: 2
        },
        {
          id: "cap-pool",
          tag: "奖池隔离",
          eyebrow: "Capability 03",
          title: "独立商户 · 独立后台奖池",
          desc: "每个商户拥有独立的后台与奖池，资金、规则、数据彼此隔离，互不串池，财务对账天然清晰。",
          points: [
            "商户级后台独立登录，权限与数据完全隔离",
            "奖池按商户独立核算，支持多币种结算与实时对账",
            "新商户开通即隔离，无需迁移或改造存量环境"
          ],
          note: "独立奖池架构示意 · 约1600×900",
          sort: 3
        }
      ],
      values: [
        { id: "val-stable", char: "稳", title: "稳定", desc: "视讯业务是现金流业务，稳定压倒一切。平台可用性99.9%，重大版本升级提前同步、灰度放量。", sort: 1 },
        { id: "val-safe", char: "安", title: "安全", desc: "不设登录网址、奖池隔离、数据留痕——把「可控」做成可审计的工程事实，而不是口头承诺。", sort: 2 },
        { id: "val-new", char: "新", title: "创新", desc: "AI识别、图像换牌、多币种结算引擎全部自研，规则透明可审计，不依赖第三方黑盒。", sort: 3 }
      ]
    },

    /* ---------- 6. 首页（对应 index.html） ---------- */
    home: {
      hero: {
        kicker: "真人视讯 · 游戏接入 · 平台定制",
        titleLine1: "让每一局",
        titleLine2: "都握在自己手中",
        sub: "从可控百家乐到独立品牌定制，胜维科技为运营商提供全链路真人视讯与游戏接入方案——API三日上线，专属团队全程护航。",
        ctaPrimary: "立即体验演示平台",
        ctaPrimaryHref: "cases.html",
        ctaSecondary: "预约专属演示",
        ctaSecondaryHref: "contact.html"
      },
      stats: [
        { id: "st-1", value: "11", suffix: "+", label: "可控平台", sort: 1 },
        { id: "st-2", value: "3", suffix: "天", label: "API接入周期", sort: 2 },
        { id: "st-3", value: "99.9", suffix: "%", label: "平台可用性", sort: 3 },
        { id: "st-4", value: "24", suffix: "/7", label: "专属技术支持", sort: 4 }
      ],
      products: [
        {
          id: "pr-baccarat",
          title: "可控百家乐",
          desc: "真人视讯百家乐，支持AI换牌与发牌节奏调控，RTP灵活配置，满足精细化运营需求。",
          badge: "已上线",
          badgeType: "live",
          tags: ["AI换牌", "RTP调控"],
          sort: 1
        },
        {
          id: "pr-credit",
          title: "信用网",
          desc: "会员信用额度体系，支持账期管理与风控规则配置，为运营商搭建自有资金闭环。",
          badge: "已上线",
          badgeType: "live",
          tags: ["信用额度", "风控配置"],
          sort: 2
        },
        {
          id: "pr-cash",
          title: "现金网",
          desc: "真金游戏大厅，多币种结算与实时对账，支持电投、现场可控等多种玩法组合。",
          badge: "已上线",
          badgeType: "live",
          tags: ["多币种", "实时对账"],
          sort: 3
        },
        {
          id: "pr-private",
          title: "私域定制",
          desc: "独立品牌整站交付：域名、UI、后台全属自有，从源码到部署一站式完成。",
          badge: "定制交付",
          badgeType: "soon",
          tags: ["独立品牌", "整站源码"],
          sort: 4
        }
      ],
      advantages: [
        { id: "ad-1", title: "自研可控内核", desc: "核心玩法引擎自研，换牌、RTP、发牌节奏均可后台配置，不依赖第三方黑盒，规则透明可审计。", sort: 1 },
        { id: "ad-2", title: "三日API接入", desc: "标准化RESTful接口与沙盒环境，文档齐全、联调有专人跟进，最快三个工作日完成上线。", sort: 2 },
        { id: "ad-3", title: "整站私域交付", desc: "从设计、开发到部署全程自有团队，源码完整交付，后续迭代不受外包方制约。", sort: 3 },
        { id: "ad-4", title: "24/7专属支持", desc: "每位客户配备专属技术对接人，线上问题平均响应时间小于15分钟，重大版本升级提前同步。", sort: 4 },
        { id: "ad-5", title: "多币种结算", desc: "支持主流法币与稳定币结算，实时汇率引擎自动对账，财务侧零手工干预。", sort: 5 },
        { id: "ad-6", title: "数据看板", desc: "会员行为、流水、RTP全量数据可视化，支持按渠道 / 玩法 / 时段多维下钻，运营决策有据可依。", sort: 6 }
      ],
      process: [
        { id: "ps-1", title: "需求沟通", desc: "1对1沟通业务场景与玩法需求，明确接入范围与定制点。", sort: 1 },
        { id: "ps-2", title: "方案报价", desc: "48小时内输出技术方案与报价，含接口清单、工期与验收标准。", sort: 2 },
        { id: "ps-3", title: "接入联调", desc: "沙盒环境联调，专人跟进至功能验收通过，最快3个工作日。", sort: 3 },
        { id: "ps-4", title: "正式上线", desc: "灰度放量、数据监控与运营培训同步进行，平稳过渡到正式环境。", sort: 4 }
      ],
      testimonials: [
        {
          id: "tm-1",
          quote: "接入速度超出预期，文档完整、接口稳定。上线三个月来零重大故障，RTP后台配置非常灵活。",
          name: "K先生",
          role: "某博彩平台运营总监",
          sort: 1
        },
        {
          id: "tm-2",
          quote: "私域定制项目从设计到交付只用了六周，源码完整、后台好用。后续每次迭代响应都很及时。",
          name: "L女士",
          role: "独立品牌创始人",
          sort: 2
        },
        {
          id: "tm-3",
          quote: "多币种对账是之前最大的痛点，现在财务侧基本零手工。专属技术对接人半夜也会秒回。",
          name: "T先生",
          role: "集团财务负责人",
          sort: 3
        }
      ],
      cta: {
        title: "准备好体验可控玩法了吗？",
        sub: "12组演示平台与试玩账号已开放，无需注册即可上手。",
        ctaPrimary: "查看演示平台",
        ctaPrimaryHref: "cases.html",
        ctaSecondary: "联系商务顾问",
        ctaSecondaryHref: "contact.html"
      }
    },

    /* ---------- 7. 联系与FAQ（对应 contact.html） ---------- */
    contact: {
      telegram: "@kekong88",
      telegramUrl: "https://t.me/kekong88",
      serviceHours: "工作日9:00 – 22:00（GMT+8）",
      responseTime: "24小时内响应",
      recommendedTitle: "Telegram商务直达",
      recommendedDesc: "最快的对接方式：直接向商务顾问发送需求，无需注册、无需等待排期，24小时内回复方案与报价。支持可控视讯、API接入、私域定制与现金网方案咨询。",
      faq: [
        { id: "faq-1", q: "什么是可控视讯？", a: "在1:1还原官网的基础上，通过AI图像识别与后台调控实现发牌结果可控——换牌、连开庄/闲、RTP区间均可配置，规则透明可审计。", sort: 1 },
        { id: "faq-2", q: "支持哪些平台？", a: "AG、DB、亚星、欧博、萬利、环球360、利博、UG、CO，以及贵宾会与赢家可控现金网。完整清单见「演示体验」页面。", sort: 2 },
        { id: "faq-3", q: "可以接入我自己的现金网吗？", a: "可以。提供标准RESTful API与沙盒环境，房间数据实时回传，流水自动对账；也可选择我们的整体现金网方案。", sort: 3 },
        { id: "faq-4", q: "独立品牌如何收费？", a: "按定制方案报价：含域名、UI、后台与源码交付范围，48小时内输出正式技术方案与报价单。", sort: 4 },
        { id: "faq-5", q: "多久能上线？", a: "标准API接入最快3个工作日完成联调上线；私域定制整站交付周期视范围而定，以方案确认为准。", sort: 5 },
        { id: "faq-6", q: "RTP怎么调？", a: "RTP值支持10–90区间连续调整，按商户、房间独立配置，后台操作即时生效，无需发版。", sort: 6 }
      ]
    },

    /* ---------- 8. 全局设置（导航 / 页脚 / 客服） ---------- */
    settings: {
      siteName: "胜维科技Shengwei Tech",
      siteTagline: "专注真人视讯与游戏接入，为运营商提供可控、可定制的全链路平台方案。",
      navCtaText: "预约演示",
      navCtaHref: "contact.html",
      footerNote: "演示账号与数据仅供参考，正式以合同为准",
      copyright: "胜维科技Shengwei Tech. 保留所有权利。",
      cs: {
        enabled: true,
        name: "胜维客服",
        status: "24 小时在线 · 人工即时接待",
        /* 第三方客服系统：link = 客服系统链接（外链/弹出窗口方式使用，后台全局设置可改） */
        link: "",
        /* mode: float = 页面内弹出客服浮窗（不跳转新页面）/ link = 新标签页 / popup = 弹出窗口 / embed = 注入第三方脚本 */
        mode: "float",
        /* embed 专用：第三方客服官方初始化脚本（原样注入 <head>） */
        embedScript: "",
        /* embed 专用：打开会话的调用链，如 "chatwootWidget.show" 或 "openChat" */
        openCmd: "",
        /* icon: 自定义图标 URL，留空使用内置耳麦图标 */
        icon: "",
        /* pos: right-bottom / right-center / left-bottom / left-center */
        pos: "right-bottom",
        /* size: sm / md / lg */
        size: "md"
      }
    },

    /* ---------- 9. 账号与角色（主账号 / 子账号与权限） ---------- */
    accounts: [
      {
        id: "usr-admin", name: "超级管理员", login: "admin", email: "admin@shengwei.tech",
        role: "primary", status: "active", isOwner: true,
        note: "系统主账号，持有全部权限，负责子账号的创建、授权与停用",
        perms: { overview: 1, home: 1, about: 1, services: 1, platforms: 1, articles: 1, news: 1, contact: 1, settings: 1, accounts: 1 }
      },
      {
        id: "usr-editor", name: "内容编辑", login: "editor", email: "editor@shengwei.tech",
        role: "editor", status: "active", isOwner: false,
        note: "负责内容中心与新闻中心的撰写发布，可查看关于我们内容",
        perms: { overview: 1, home: 0, about: 1, services: 0, platforms: 0, articles: 1, news: 1, contact: 0, settings: 0, accounts: 0 }
      },
      {
        id: "usr-operator", name: "运营专员", login: "operator", email: "operator@shengwei.tech",
        role: "operator", status: "locked", isOwner: false,
        note: "负责演示体验与商务对接，当前已停用",
        perms: { overview: 1, home: 0, about: 0, services: 1, platforms: 1, articles: 0, news: 1, contact: 1, settings: 0, accounts: 0 }
      }
    ],

    /* 最近变更日志（由后台操作自动写入，仅演示用） */
    activity: []
  };

  /* ---------- 加载 / 持久化 ---------- */
  var STORAGE_KEY = "sw_admin_db_v1";

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return seedClone();
      var parsed = JSON.parse(raw);
      if (!parsed || !parsed.platforms || !parsed.settings) return seedClone();
      /* 合并缺失的新增模块，保证旧版本数据也能升级 */
      Object.keys(SEED).forEach(function (k) {
        if (parsed[k] === undefined) parsed[k] = seedClone()[k];
      });
      /* 客服配置为第三方对接方式（link/mode/embed/pos/size），补齐旧版缺失字段 */
      (function () {
        var base = seedClone().settings.cs;
        var cur = parsed.settings.cs || {};
        parsed.settings.cs = cur;
        for (var k in base) {
          if (cur[k] === undefined || cur[k] === null) cur[k] = base[k];
        }
        if (cur.quickQuestions) delete cur.quickQuestions; /* 旧版自构建面板字段，已移除 */
      })();
      /* 账号与角色模块：补齐旧版数据缺失的字段（perms / isOwner / note） */
      (function () {
        if (!Array.isArray(parsed.accounts)) return;
        parsed.accounts.forEach(function (a) {
          if (!a.id) a.id = "usr-" + Math.random().toString(36).slice(2, 9);
          if (!a.perms || typeof a.perms !== "object") a.perms = { overview: 0, home: 0, about: 0, services: 0, platforms: 0, articles: 0, news: 0, contact: 0, settings: 0, accounts: 0 };
          var base = { overview: 0, home: 0, about: 0, services: 0, platforms: 0, articles: 0, news: 0, contact: 0, settings: 0, accounts: 0 };
          for (var k in base) if (a.perms[k] === undefined) a.perms[k] = 0;
          if (a.role !== "primary") { a.isOwner = false; }
          if (a.role === "primary" && a.isOwner === undefined) a.isOwner = true;
          if (!a.status) a.status = "active";
        });
      })();
      return parsed;
    } catch (e) {
      return seedClone();
    }
  }

  function save(db) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
      return true;
    } catch (e) {
      return false;
    }
  }

  function seedClone() {
    return JSON.parse(JSON.stringify(SEED));
  }

  window.ADMIN = window.ADMIN || {};
  window.ADMIN.SEED = SEED;
  window.ADMIN.load = load;
  window.ADMIN.save = save;
  window.ADMIN.resetSeed = function () {
    localStorage.removeItem(STORAGE_KEY);
    return seedClone();
  };
})();