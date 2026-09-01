/* ============================================================
   胜维科技 · 官网 — 全局交互脚本
   鼠标动画 / 导航 / FAQ / 复制 / 新闻筛选 / 表单校验
   ============================================================ */
(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isTouch = window.matchMedia("(hover: none)").matches;

  /* ---------- 1. Header滚动状态 ---------- */
  var header = document.querySelector(".site-header");
  function onScrollHeader() {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 24);
  }
  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------- 2. 移动端汉堡菜单 ---------- */
  var burger = document.querySelector(".nav-burger");
  var navLinks = document.querySelector(".nav-links");
  if (burger && navLinks) {
    burger.addEventListener("click", function () {
      var open = navLinks.classList.toggle("open");
      burger.setAttribute("aria-expanded", String(open));
      document.body.classList.toggle("nav-open", open);
    });
    navLinks.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        navLinks.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
        document.body.classList.remove("nav-open");
      });
    });
  }

  /* ---------- 3. 鼠标光晕跟随 ---------- */
  var glow = document.getElementById("cursor-glow");
  if (glow && !reducedMotion && !isTouch) {
    var gx = window.innerWidth / 2, gy = -400;
    var tx = gx, ty = gy;
    window.addEventListener("mousemove", function (e) {
      tx = e.clientX; ty = e.clientY;
      glow.classList.add("on");
    }, { passive: true });
    document.addEventListener("mouseleave", function () { glow.classList.remove("on"); });
    (function loop() {
      gx += (tx - gx) * 0.12;
      gy += (ty - gy) * 0.12;
      glow.style.transform = "translate3d(" + gx + "px," + gy + "px,0)";
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- 4. Hero背景视差 ---------- */
  var heroBg = document.querySelector(".hero-bg");
  if (heroBg && !reducedMotion) {
    window.addEventListener("scroll", function () {
      var y = window.scrollY;
      if (y < window.innerHeight * 1.2) {
        heroBg.style.transform = "translate3d(0," + y * 0.18 + "px,0)";
      }
    }, { passive: true });
  }

  /* ---------- 4b. Hero滚动提示：右侧固定，延迟入场 + 下滚半屏后淡出 ---------- */
  var heroScroll = document.querySelector(".hero-scroll");
  if (heroScroll) {
    // 延迟入场（与hero文案节奏一致）；reduced-motion用户直接显示
    if (reducedMotion) {
      heroScroll.classList.add("is-visible");
    } else {
      setTimeout(function () { heroScroll.classList.add("is-visible"); }, 1800);
    }
    window.addEventListener("scroll", function () {
      heroScroll.classList.toggle("is-hidden", window.scrollY > window.innerHeight * 0.5);
    }, { passive: true });
  }

  /* ---------- 5. Hero标题逐字入场 ---------- */
  var heroTitle = document.querySelector(".hero-title");
  if (heroTitle && !reducedMotion) {
    var nodes = Array.prototype.slice.call(heroTitle.childNodes);
    heroTitle.innerHTML = "";
    var line2 = null;
    // 支持 .gold-line子节点：按DOM结构逐字包裹
    nodes.forEach(function (node, li) {
      if (node.nodeType === 3) {
        if (!node.textContent.trim()) return;
        wrapChars(node.textContent, null, li);
      } else if (node.nodeType === 1 && node.tagName === "BR") {
        heroTitle.appendChild(node);
      } else if (node.nodeType === 1 && node.classList.contains("gold-line")) {
        line2 = node;
        wrapChars(node.textContent, node, li + 0.5);
        heroTitle.appendChild(node);
      }
    });
    function wrapChars(str, target, baseDelay) {
      var frag = document.createDocumentFragment();
      for (var i = 0; i < str.length; i++) {
        var span = document.createElement("span");
        span.className = "ch";
        span.textContent = str[i] === " " ? "\u00A0" : str[i];
        span.style.animationDelay = (baseDelay * 0.12 + i * 0.045).toFixed(3) + "s";
        frag.appendChild(span);
      }
      if (target) { target.textContent = ""; target.appendChild(frag); }
      else { heroTitle.insertBefore(frag, line2 ? line2 : null); }
    }
  }

  /* ---------- 6. 滚动入场reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reducedMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("visible");
          io.unobserve(en.target);
          // 入场结束后移除错峰延迟类，hover/离开过渡不再携带 0.1–0.3s 延迟
          setTimeout(function () {
            en.target.classList.remove("reveal-delay-1", "reveal-delay-2", "reveal-delay-3");
          }, 1200);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  }

  /* ---------- 7. 卡片3D倾斜 + 磁性按钮 ---------- */
  if (!reducedMotion && !isTouch) {
    document.querySelectorAll(".tilt").forEach(function (card) {
      var maxTilt = 5; // deg
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform =
          "perspective(900px) rotateX(" + (-py * maxTilt).toFixed(2) + "deg) rotateY(" + (px * maxTilt).toFixed(2) + "deg) translateY(-4px)";
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform = "";
      });
    });

    // 磁性主按钮：靠近时轻微吸附
    document.querySelectorAll(".btn-primary").forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var r = btn.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) * 0.18;
        var dy = (e.clientY - (r.top + r.height / 2)) * 0.3;
        btn.style.transform = "translate(" + dx.toFixed(1) + "px," + (dy - 2).toFixed(1) + "px)";
      });
      btn.addEventListener("mouseleave", function () { btn.style.transform = ""; });
    });
  }

  /* ---------- 8. 一键复制（事件委托） ---------- */
  function flashCopied(btn) {
    var iconOnly = btn.classList.contains("copy-icon-btn");
    var orig = btn.innerHTML;
    btn.classList.add("copied");
    btn.innerHTML = iconOnly
      ? '<svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>'
      : '<svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>已复制';
    setTimeout(function () {
      btn.classList.remove("copied");
      btn.innerHTML = orig;
    }, 1600);
  }
  function doCopy(text, btn) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { flashCopied(btn); }, function () { fallbackCopy(text, btn); });
    } else {
      fallbackCopy(text, btn);
    }
  }
  function fallbackCopy(text, btn) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); flashCopied(btn); } catch (e) {}
    document.body.removeChild(ta);
  }
  var COPY_ICON = '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-copy]");
    if (btn) { doCopy(btn.getAttribute("data-copy"), btn); return; }
    var toggle = e.target.closest("[data-pass-toggle]");
    if (toggle) {
      var passEl = document.getElementById(toggle.getAttribute("data-pass-toggle"));
      if (!passEl) return;
      var revealed = passEl.classList.toggle("revealed");
      passEl.textContent = revealed ? passEl.getAttribute("data-real") : "••••••";
      toggle.setAttribute("aria-pressed", String(revealed));
      var label = toggle.querySelector(".pt-label");
      if (label) label.textContent = revealed ? "隐藏" : "显示";
    }
  });

  /* ---------- 9. FAQ折叠 ---------- */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var q = item.querySelector(".faq-q");
    var a = item.querySelector(".faq-a");
    if (!q || !a) return;
    q.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");
      // 手风琴：关闭其他
      item.parentElement.querySelectorAll(".faq-item.open").forEach(function (other) {
        other.classList.remove("open");
        other.querySelector(".faq-a").style.maxHeight = "0px";
        other.querySelector(".faq-q").setAttribute("aria-expanded", "false");
      });
      if (!isOpen) {
        item.classList.add("open");
        a.style.maxHeight = a.scrollHeight + "px";
        q.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ---------- 10. News筛选 + 模态 ---------- */
  var filterBtns = document.querySelectorAll(".filter-btn");
  var newsCards = document.querySelectorAll(".news-card");
  if (filterBtns.length) {
    filterBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        filterBtns.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        var cat = btn.getAttribute("data-filter");
        newsCards.forEach(function (card) {
          card.style.display = (cat === "all" || card.getAttribute("data-cat") === cat) ? "" : "none";
        });
      });
    });
  }
  /* 经典小弹窗仅用于无 .reader 的模态框（新闻中心）；
     内容中心的 .reader 全屏阅读在下方 10b 处理 */
  var overlay = document.getElementById("news-modal");
  if (overlay && !overlay.classList.contains("reader")) {
    var mTitle = overlay.querySelector(".modal h3");
    var mMeta = overlay.querySelector(".modal-meta");
    var mBody = overlay.querySelector(".modal-body");
    newsCards.forEach(function (card) {
      card.addEventListener("click", function () {
        mTitle.textContent = card.getAttribute("data-title") || "";
        mMeta.textContent = card.getAttribute("data-date") + " · " + (card.getAttribute("data-catlabel") || "");
        var ex = card.querySelector(".excerpt");
        mBody.innerHTML = "<p>" + (ex ? ex.textContent : "") + "</p><p>完整正文待发布后更新，欢迎通过Telegram @kekong88获取详情。</p>";
        overlay.classList.add("open");
        document.body.style.overflow = "hidden";
      });
    });
    function closeModal() {
      overlay.classList.remove("open");
      document.body.style.overflow = "";
    }
    overlay.querySelector(".modal-close").addEventListener("click", closeModal);
    overlay.addEventListener("click", function (e) { if (e.target === overlay) closeModal(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeModal(); });
  }

  /* ---------- 10b. 内容中心：下划线分栏筛选 + 头条/目录 + 全屏长文阅读 ---------- */
  var artTabs = document.querySelectorAll(".art-tab");
  var tocRows = document.querySelectorAll(".toc-row");
  if (artTabs.length) {
    artTabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        artTabs.forEach(function (t) { t.classList.remove("active"); });
        tab.classList.add("active");
        var cat = tab.getAttribute("data-filter");
        tocRows.forEach(function (row) {
          row.style.display = (cat === "all" || row.getAttribute("data-cat") === cat) ? "" : "none";
        });
        var lead = document.querySelector(".art-lead");
        if (lead) lead.style.display = (cat === "all") ? "" : "none";
        var visible = cat === "all" ? tocRows.length :
          document.querySelectorAll('.toc-row[data-cat="' + cat + '"]').length;
        var countEl = document.querySelector(".art-toc-head span");
        if (countEl) countEl.textContent = "共 " + visible + " 篇";
      });
    });
  }

  /* 全屏长文阅读：.modal-overlay.reader */
  var reader = document.getElementById("news-modal");
  if (reader && reader.classList.contains("reader")) {
    var rDoc = reader.querySelector(".reader-doc");
    var rTitle = rDoc.querySelector("h2");
    var rCat = rDoc.querySelector(".rk-cat");
    var rDate = rDoc.querySelector(".rk-date");
    var rLede = rDoc.querySelector(".reader-lede");
    var rBody = rDoc.querySelector(".reader-body");
    var rScroll = reader.querySelector(".modal");
    var rProg = reader.querySelector(".reader-progress");
    var rCloseBtn = reader.querySelector(".reader-close");
    var lastTrigger = null; /* 记录触发源，关闭后归还焦点 */
    var triggerMap = {};    /* [data-od-id] → 触发元素 */

    function rClose() {
      reader.classList.remove("open");
      reader.setAttribute("aria-hidden", "true");
      /* 解锁页面视口滚动（html+body 双锁，消除残留的第二条滚动条） */
      document.body.style.overflow = "";
      document.documentElement.classList.remove("reader-lock");
      document.body.classList.remove("reader-lock");
      if (rScroll) rScroll.scrollTop = 0;
      if (rProg) rProg.style.width = "0%";
      if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus({ preventScroll: true });
      if (rCloseBtn && document.activeElement === rCloseBtn) lastTrigger = null;
    }
    function rOpen(item, trigger, fromHash) {
      rTitle.textContent = item.getAttribute("data-title") || "";
      rCat.textContent = item.getAttribute("data-catlabel") || "";
      rDate.textContent = item.getAttribute("data-date") || "";
      rLede.textContent = item.getAttribute("data-lede") || "";
      rBody.innerHTML = item.getAttribute("data-body") || "";
      lastTrigger = trigger || null;
      reader.classList.add("open");
      reader.setAttribute("aria-hidden", "false");
      /* 锁定页面视口滚动：html+body 双锁。
         基类 overflow-x:hidden/clip 使视口滚动落在 <html> 上，
         仅锁 body 会残留第二条（页面）滚动条，与阅读面板滚动条并存。 */
      document.body.style.overflow = "hidden";
      document.documentElement.classList.add("reader-lock");
      document.body.classList.add("reader-lock");
      /* 定位到顶部：先立即归零，再在内容布局稳定后（双 rAF）二次校正，
         避免新文章排版完成前 scrollTop 被旧尺寸钳制而停在中间 */
      if (rScroll) {
        rScroll.scrollTop = 0;
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            if (reader.classList.contains("open")) rScroll.scrollTop = 0;
          });
        });
      }
      rProgUpdate();
      if (!fromHash) rCloseBtn.focus({ preventScroll: true });
    }
    function rProgUpdate() {
      if (!rProg || !rScroll) return;
      var max = rScroll.scrollHeight - rScroll.clientHeight;
      rProg.style.width = (max > 0 ? (rScroll.scrollTop / max) * 100 : 0) + "%";
    }
    if (rScroll) rScroll.addEventListener("scroll", function () {
      if (reader.classList.contains("open")) rProgUpdate();
    }, { passive: true });
    /* 收集所有可阅读入口（头条 + 目录行），建立 hash 索引 */
    var readEls = Array.prototype.slice.call(document.querySelectorAll("[data-read]"));
    readEls.forEach(function (el) {
      var id = el.getAttribute("data-od-id") || "";
      if (id) triggerMap[id] = el;
      el.addEventListener("click", function () {
        rOpen(el, el);
        if (id) history.replaceState(null, "", "#" + id);
      });
      /* 目录行为 role=button 的 div：支持 Enter / 空格 */
      if (el.getAttribute("role") === "button") {
        el.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
            e.preventDefault();
            rOpen(el, el);
            if (id) history.replaceState(null, "", "#" + id);
          }
        });
      }
    });
    /* 点击头条卡片空白区域（非按钮）同样打开阅读 */
    var lead = document.querySelector(".art-lead");
    if (lead) {
      lead.addEventListener("click", function (e) {
        if (e.target.closest(".art-lead-action")) return; /* 按钮自身已绑定 */
        rOpen(lead, lead);
      });
    }
    rCloseBtn.addEventListener("click", rClose);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && reader.classList.contains("open")) rClose();
    });
    /* hash 深链：#article-xxx 直达对应文章 */
    function openFromHash() {
      var id = (location.hash || "").slice(1);
      if (!id) return;
      var item = triggerMap[id] || (document.getElementById(id) && document.querySelector('[data-od-id="' + id + '"]'));
      if (item && item.hasAttribute("data-read")) {
        rOpen(item, item, true);
      }
    }
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
  }

  /* ---------- 11. cases.html锚点导航 ----------
     规则（刻意保持简单，避免多套逻辑互相打架）：
     每张卡片的切换锚点 = 它顶部的标题位置。
     1. 点击导航 → 立即高亮所选品牌 + 平滑滚动到该卡片；
        滚动过程中锁定，停止后按标题位置做一次校正。
     2. 手动滚动页面（未点击导航）→ 谁的顶部标题到达画面中间，就选中谁：
        - 下滚：下一张卡的标题越过中线 → 前进（快速滚动可一次跨多张）；
        - 上滚：上一张卡的标题落到中线 → 退回。
        相邻两条标题线之间，选中项锁定，小幅来回滚动不跳变。 */
  var caseNavLinks = document.querySelectorAll(".case-nav a");
  if (caseNavLinks.length) {
    var caseTargets = [];
    caseNavLinks.forEach(function (a) {
      var el = document.getElementById(a.getAttribute("href").slice(1));
      if (el) {
        /* 切换锚点取卡片顶部的标题元素（.case-name / h2），没有则用卡片本身 */
        var titleEl = el.querySelector(".case-name") || el.querySelector("h2") || el;
        caseTargets.push({ link: a, el: el, title: titleEl });
      }
    });

    function setActive(id) {
      caseTargets.forEach(function (t) {
        t.link.classList.toggle("active", t.el.id === id);
      });
    }

    /* 第i张卡片标题的页面坐标（随滚动实时计算） */
    function titleY(i) {
      return caseTargets[i].title.getBoundingClientRect().top + window.scrollY;
    }

    var curIdx = 0; /* 当前选中项在caseTargets中的下标 */
    var lastC = -1; /* 上次检测时的画面中线页面坐标，用于判断滚动方向 */
    /* 切换时机 = 「某张卡的顶部标题正好位于画面中间」：
       - 下滚（中线向下移动）：下一张卡的标题滑过中线 → 前进到它
         （快速滚动可一次跨过多张）；
       - 上滚（中线向上移动）：上一张卡的标题落到画面中间 → 退回它。
       两个方向都严格以「目标卡的标题到达画面中间」为切换点，
       因此任何时刻导航选中项的标题都在画面中间或刚刚经过中间，
       不会再出现「选中项的标题还停在画面顶部」的错位。 */
    function updateNav() {
      var C = window.scrollY + window.innerHeight * 0.5;
      var dir = C > lastC ? 1 : (C < lastC ? -1 : 0);
      lastC = C;
      if (dir >= 1) {
        var i = curIdx;
        while (i < caseTargets.length - 1 && titleY(i + 1) <= C) i++;
        if (i !== curIdx) { curIdx = i; setActive(caseTargets[i].el.id); }
      } else if (dir === -1) {
        var j = curIdx;
        while (j > 0 && C <= titleY(j - 1)) j--;
        if (j !== curIdx) { curIdx = j; setActive(caseTargets[j].el.id); }
      }
    }

    /* 全量校正（不依赖方向）：直接按「标题已越过中线的最新一张」重算。
       用于初始加载 / hash深链 / 点击导航滚动停止后的最终校正，
       避免锁定期内用户手动来回滚动造成的方向误判。 */
    function recompute() {
      var C = window.scrollY + window.innerHeight * 0.5;
      var idx = 0;
      for (var i = 0; i < caseTargets.length; i++) {
        if (titleY(i) <= C) idx = i; else break;
      }
      curIdx = idx;
      lastC = C;
      setActive(caseTargets[idx].el.id);
    }

    var locked = false;
    var settleTimer = null;

    caseNavLinks.forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href").slice(1);
        if (!document.getElementById(id)) return;
        e.preventDefault();
        var ti = -1;
        caseTargets.forEach(function (t, i) { if (t.el.id === id) ti = i; });
        if (ti >= 0) curIdx = ti;
        setActive(id);
        locked = true; /* 点击后锁定：平滑滚动经过其他卡片时不切换选中 */
        document.getElementById(id).scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
        history.replaceState(null, "", "#" + id);
      });
    });

    window.addEventListener("scroll", function () {
      if (locked) {
        /* 滚动停止200ms后解锁，并按标题位置做一次校正 */
        clearTimeout(settleTimer);
        settleTimer = setTimeout(function () {
          locked = false;
          recompute();
        }, 200);
        return;
      }
      updateNav();
    }, { passive: true });

    recompute(); /* 初始校正（含hash深链打开页面的情况） */
  }

  /* ---------- 12. 数字滚动（数据条） ---------- */
  var nums = document.querySelectorAll("[data-count]");
  if (nums.length && "IntersectionObserver" in window && !reducedMotion) {
    var nio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        nio.unobserve(en.target);
        animateCount(en.target);
      });
    }, { threshold: 0.4 });
    nums.forEach(function (n) { nio.observe(n); });
  }
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    var dur = 1400;
    var start = null;
    function frame(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = target % 1 !== 0 ? (target * eased).toFixed(1) : Math.round(target * eased);
      el.textContent = val + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ---------- 13. 表单校验（contact.html） ---------- */
  var form = document.getElementById("consult-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ok = true;
      form.querySelectorAll("[data-req]").forEach(function (field) {
        var wrap = field.closest(".form-field");
        var val = field.value.trim();
        var valid = val.length > 0;
        if (valid && field.type === "email") valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
        if (wrap) wrap.classList.toggle("invalid", !valid);
        if (!valid) ok = false;
      });
      if (ok) {
        var success = form.querySelector(".form-success");
        if (success) success.classList.add("show");
        form.reset();
        setTimeout(function () { if (success) success.classList.remove("show"); }, 6000);
      }
    });
  }

  /* ---------- 14. 页脚年份 ---------- */
  var yr = document.querySelector("[data-year]");
  if (yr) yr.textContent = new Date().getFullYear();
})();
