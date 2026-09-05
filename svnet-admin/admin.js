/* ============================================================
   胜维科技 · 官网后台 — 应用逻辑
   状态管理 · 路由 · 通用表单/弹窗 · 各模块增删改 · 持久化
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- 状态 ---------------- */
  var db = window.ADMIN.load();
  var current = "overview";
  var activeModal = null;      // {opts}
  var activeFields = {};       // 当前弹窗字段元数据
  var modalStack = [];

  /* ---------------- DOM ---------------- */
  var view = document.getElementById("view");
  var overlay = document.getElementById("modal-overlay");
  var modalBox = document.getElementById("modal-box");
  var modalBody = document.getElementById("modal-body");
  var modalFoot = document.getElementById("modal-foot");
  var modalTitle = document.getElementById("modal-title");
  var modalSub = document.getElementById("modal-sub");
  var toastStack = document.getElementById("toast-stack");
  var sidebar = document.getElementById("sidebar");
  var scrim = document.getElementById("mobile-scrim");

  /* ---------------- 工具 ---------------- */
  function esc(s) {
    if (s === null || s === undefined) return "";
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function uid() { return "id-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7); }
  function today() { var d = new Date(); function p(n){return (n<10?"0":"")+n;} return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate()); }
  function nowTime() { var d = new Date(); function p(n){return (n<10?"0":"")+n;} return p(d.getHours())+":"+p(d.getMinutes()); }
  function persist() { return window.ADMIN.save(db); }
  function sorted(list, key) { (list || []).sort(function (a, b) { return (a.sort || 0) - (b.sort || 0); }); return list; }
  function byId(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; }
  function nextSort(list) { var m = 0; (list || []).forEach(function (x) { if ((x.sort || 0) > m) m = x.sort || 0; }); return m + 1; }
  // 模块键 → 其所在的顶层数据键（用于定位嵌套子列表，如 db.about.timeline / db.contact.faq / db.home.stats）
  var SUB_LIST_TOP = {
    timeline: "about", capabilities: "about", values: "about",
    faq: "contact",
    stats: "home", products: "home", advantages: "home", process: "home", testimonials: "home"
  };
  function subList(mod) {
    if (db[mod]) return db[mod];
    var top = SUB_LIST_TOP[mod];
    if (top && db[top] && db[top][mod]) return db[top][mod];
    return null;
  }
  function setSubList(mod, list) {
    if (db[mod]) { db[mod] = list; return; }
    var top = SUB_LIST_TOP[mod];
    if (top && db[top]) db[top][mod] = list;
  }

  function log(type, module, label) {
    var entry = { id: uid(), type: type, module: module, label: label || module, time: nowTime(), date: today() };
    db.activity.unshift(entry);
    if (db.activity.length > 30) db.activity.length = 30;
  }

  function toast(msg, type) {
    type = type || "success";
    var icons = {
      success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
      error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
      info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16.5v.01"/></svg>'
    };
    var el = document.createElement("div");
    el.className = "toast " + type;
    el.innerHTML = '<span class="toast-ico">' + (icons[type] || icons.info) + "</span><span>" + esc(msg) + "</span>";
    toastStack.appendChild(el);
    setTimeout(function () {
      el.classList.add("leaving");
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 300);
    }, 3000);
  }

  /* ---------------- 图标 ---------------- */
  var IC = {
    up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 15l-6-6-6 6"/></svg>',
    down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>',
    edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>',
    grip: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.4"/><circle cx="9" cy="12" r="1.4"/><circle cx="9" cy="18" r="1.4"/><circle cx="15" cy="6" r="1.4"/><circle cx="15" cy="12" r="1.4"/><circle cx="15" cy="18" r="1.4"/></svg>',
    box: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/></svg>',
    doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>',
    press: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0V9"/><path d="M11 8h6M11 12h6M11 16h4"/></svg>',
    tool: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94z"/></svg>',
    building: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6"/></svg>',
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.69-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8.3 8.3z"/></svg>',
    gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1.51 1.41 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
    unlock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.5-1.9"/></svg>',
    users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
        ul: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1.1" fill="currentColor" stroke="none"/><circle cx="4.5" cy="12" r="1.1" fill="currentColor" stroke="none"/><circle cx="4.5" cy="18" r="1.1" fill="currentColor" stroke="none"/></svg>',
        ol: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M10 6h10M10 12h10M10 18h10"/><text x="2.5" y="8" font-size="6.5" fill="currentColor" stroke="none" font-family="monospace">1</text><text x="2.5" y="14" font-size="6.5" fill="currentColor" stroke="none" font-family="monospace">2</text><text x="2.5" y="20" font-size="6.5" fill="currentColor" stroke="none" font-family="monospace">3</text></svg>',
        quote: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7.5 6C5 6 3 8 3 10.5c0 2.3 1.7 4.2 3.9 4.9-.4 1.6-1.4 2.8-3 3.6l1 1.5c3-1.3 5-3.9 5-7.5C10 8.6 9.1 6 7.5 6zm10 0C15 6 13 8 13 10.5c0 2.3 1.7 4.2 3.9 4.9-.4 1.6-1.4 2.8-3 3.6l1 1.5c3-1.3 5-3.9 5-7.5C21.5 8.6 20.6 6 17.5 6z"/></svg>',
        link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10.5 13.5a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1.5 1.5"/><path d="M13.5 10.5a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1.5-1.5"/></svg>',
        clean: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7V5a1 1 0 0 1 1-1h5.5M12 4h7a1 1 0 0 1 1 1v3M9.5 13.5 18 22M4 13l3.5 3.5M13 9l8 8"/></svg>',
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    bounce: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 17 13.5 8.5 8.5 13.5 2 7"/><path d="M16 17h6v-6"/></svg>'
      };

  /* ---------------- 通用表单构建 ---------------- */
  function fieldHTML(f) {
    var req = f.required ? '<span class="req">*</span>' : "";
    if (f.type === "text" || f.type === "number" || f.type === "url") {
      var inp = f.type === "number" ? 'type="number"' : 'type="' + (f.typeInput || "text") + '"';
      return '<div class="field ' + (f.span2 ? "span-2 " : "") + (f.cls || "") + '">' +
        "<label>" + esc(f.label) + req + "</label>" +
        '<input class="input" data-field="' + f.name + '" id="f-' + f.name + '" ' + inp +
        ' value="' + esc(f.value !== undefined ? f.value : "") + '" placeholder="' + esc(f.placeholder || "") + '" ' +
        (f.required ? "required" : "") + (f.readonly ? "readonly" : "") + ">" +
        (f.hint ? '<div class="field-hint">' + esc(f.hint) + "</div>" : "") +
        '<div class="field-error">此项为必填，不能为空</div></div>';
    }
    if (f.type === "textarea") {
      return '<div class="field ' + (f.span2 ? "span-2 " : "") + (f.cls || "") + '">' +
        "<label>" + esc(f.label) + req + "</label>" +
        '<textarea class="textarea" data-field="' + f.name + '" id="f-' + f.name + '" rows="' + (f.rows || 4) + '" placeholder="' + esc(f.placeholder || "") + '">' + esc(f.value || "") + "</textarea>" +
        (f.hint ? '<div class="field-hint">' + esc(f.hint) + "</div>" : "") +
        '<div class="field-error">此项为必填，不能为空</div></div>';
    }
    if (f.type === "rich") {
      var rteTools =
        '<button type="button" class="rte-btn" data-cmd="bold" title="加粗 (Ctrl+B)"><b>B</b></button>' +
        '<button type="button" class="rte-btn" data-cmd="italic" title="斜体 (Ctrl+I)"><i>I</i></button>' +
        '<button type="button" class="rte-btn" data-cmd="underline" title="下划线 (Ctrl+U)">U</button>' +
        '<span class="rte-sep"></span>' +
        '<button type="button" class="rte-btn" data-cmd="formatBlock" data-val="h2" title="大标题">H2</button>' +
        '<button type="button" class="rte-btn" data-cmd="formatBlock" data-val="h3" title="小节标题">H3</button>' +
        '<button type="button" class="rte-btn" data-cmd="formatBlock" data-val="p" title="正文段落">¶</button>' +
        '<span class="rte-sep"></span>' +
        '<button type="button" class="rte-btn" data-cmd="insertUnorderedList" title="项目符号列表">' + IC.ul + "</button>" +
        '<button type="button" class="rte-btn" data-cmd="insertOrderedList" title="编号列表">' + IC.ol + "</button>" +
        '<button type="button" class="rte-btn" data-cmd="formatBlock" data-val="blockquote" title="引用">' + IC.quote + "</button>" +
        '<span class="rte-sep"></span>' +
        '<button type="button" class="rte-btn rte-link" data-link="' + f.name + '" title="插入链接">' + IC.link + "</button>" +
        '<button type="button" class="rte-btn" data-cmd="removeFormat" title="清除格式">' + IC.clean + "</button>" +
        '<span class="rte-char-count" data-count="' + f.name + '"></span>';
      return '<div class="field span-2">' +
        "<label>" + esc(f.label) + req + "</label>" +
        '<div class="rte" data-rte="' + f.name + '">' +
          '<div class="rte-toolbar">' + rteTools +
            '<input class="rte-link-input" type="text" placeholder="https:// 链接地址，回车确认" hidden>' +
          "</div>" +
          '<div class="rte-editor" data-field="' + f.name + '" id="f-' + f.name + '" contenteditable="true" aria-label="' + esc(f.label) + '"></div>' +
        "</div>" +
        '<div class="field-hint">所见即所得编辑，内容按 HTML 保存、前台阅读器直接渲染。支持加粗 / 斜体 / 标题 / 列表 / 引用 / 链接，正文开头首个字自动成为装饰首字。</div>' +
        '<div class="field-error">此项为必填，不能为空</div></div>';
    }
    if (f.type === "select") {
      var opts = (f.options || []).map(function (o) {
        var v = typeof o === "string" ? o : o.v;
        var l = typeof o === "string" ? o : o.l;
        return { v: String(v), l: l };
      });
      var cur = f.value !== undefined && f.value !== null ? String(f.value) : "";
      var curLabel = "";
      opts.forEach(function (o) { if (o.v === cur) curLabel = o.l; });
      if (!curLabel) curLabel = cur !== "" ? cur : "请选择…";
      var menuItems = opts.map(function (o) {
        return '<li class="cselect-opt" role="option" data-val="' + esc(o.v) + '"' + (o.v === cur ? ' aria-selected="true"' : ' aria-selected="false"') + ">" + esc(o.l) + "</li>";
      }).join("");
      return '<div class="field ' + (f.span2 ? "span-2 " : "") + (f.cls || "") + '">' +
        "<label>" + esc(f.label) + req + "</label>" +
        '<div class="cselect" data-field="' + f.name + '" id="f-' + f.name + '" role="combobox" tabindex="0" aria-haspopup="listbox" aria-expanded="false" aria-label="' + esc(f.label) + '">' +
          '<span class="cselect-value">' + esc(curLabel) + '</span>' +
          '<span class="cselect-caret" aria-hidden="true">' + IC.down + '</span>' +
          '<div class="cselect-menu" role="listbox" aria-orientation="vertical">' + menuItems + '</div>' +
        "</div>" +
        (f.hint ? '<div class="field-hint">' + esc(f.hint) + "</div>" : "") +
        '<div class="field-error">请选择</div></div>';
    }
    if (f.type === "lines") {
      var rows = (f.value || []).map(function (v, i) { return lineRowHTML(i + 1, v, f.itemPlaceholder); }).join("");
      return '<div class="field ' + (f.span2 ? "span-2 " : "") + '">' +
        "<label>" + esc(f.label) + req + "</label>" +
        '<div class="line-list" data-list="' + f.name + '">' + rows + "</div>" +
        '<button type="button" class="add-line-btn" data-add-line="' + f.name + '" style="margin-top:8px">' + IC.plus + " 添加一行</button>" +
        (f.hint ? '<div class="field-hint" style="margin-top:6px">' + esc(f.hint) + "</div>" : "") +
        '<div class="field-error">至少保留一行有效内容</div></div>';
    }
    if (f.type === "kv") {
      var krows = (f.value || []).map(function (o) { return kvRowHTML(o, f.keys); }).join("");
      return '<div class="field ' + (f.span2 ? "span-2 " : "") + '">' +
        "<label>" + esc(f.label) + req + "</label>" +
        '<div class="kv-list" data-kv="' + f.name + '" data-keys="' + f.keys.join(",") + '">' + krows + "</div>" +
        '<button type="button" class="add-line-btn" data-add-kv="' + f.name + '" style="margin-top:8px">' + IC.plus + " 添加一组</button>" +
        (f.hint ? '<div class="field-hint" style="margin-top:6px">' + esc(f.hint) + "</div>" : "") +
        '<div class="field-error">至少保留一组有效内容</div></div>';
    }
    if (f.type === "perms") {
      var allOn = f.value === "all";
      var cur = (typeof f.value === "object" && f.value) ? f.value : {};
      var cols = f.columns || [];
      var cells = cols.map(function (c) {
        var on = allOn ? "1" : (cur[c.key] ? "1" : "0");
        return '<label class="perm-cell"><input type="checkbox" data-perm="' + c.key + '"' +
          (on === "1" ? " checked" : "") + (allOn ? " disabled" : "") + '>' +
          '<span class="perm-check" aria-hidden="true"></span><span class="perm-name">' + esc(c.l) + '</span></label>';
      }).join("");
      return '<div class="field span-2">' +
        '<label>功能权限' + (allOn ? '<span class="req"> 主账号（全部功能）</span>' : " <span class=\"req\">*</span>") + '</label>' +
        '<div class="perm-grid" data-perms="' + f.name + '"' + (allOn ? ' data-all="1" disabled' : "") + '>' + cells + '</div>' +
        (f.hint ? '<div class="field-hint">' + esc(f.hint) + '</div>' : "") +
        '<div class="field-error">请至少勾选一项功能权限</div></div>';
    }
    if (f.type === "toggle") {
      return '<div class="field ' + (f.span2 ? "span-2 " : "") + ' toggle-field">' +
        '<label class="switch"><input type="checkbox" data-field="' + f.name + '" id="f-' + f.name + '"' + (f.value ? " checked" : "") + "><span class=\"track\"></span>" +
        "<span class=\"switch-label\">" + esc(f.label) + (f.desc ? ' <span class="switch-desc">' + esc(f.desc) + "</span>" : "") + "</span></label></div>";
    }
    return "";
  }

  function lineRowHTML(idx, val, ph) {
    return '<div class="line-item"><span class="line-index">' + idx + "</span>" +
      '<input class="input line-input" value="' + esc(val || "") + '" placeholder="' + esc(ph || "") + '">' +
      '<button type="button" class="icon-btn danger" data-del-line aria-label="删除此行的内容">' + IC.trash + "</button></div>";
  }
  function kvRowHTML(o, keys) {
    var cells = keys.map(function (k, i) {
      return '<input class="input" data-k="' + k + '" value="' + esc((o && o[k]) || "") + '" placeholder="' + esc(keys.length === 2 ? (i === 0 ? "账号" : "密码") : k) + '">';
    }).join("");
    return '<div class="kv-row">' + cells + '<span class="kv-del"><button type="button" class="icon-btn danger" data-del-kv aria-label="删除此组">' + IC.trash + "</button></span></div>";
  }

  function buildForm(fields, grid) {
    return '<div class="form-grid ' + (grid || "") + '">' + fields.map(fieldHTML).join("") + "</div>";
  }

  function collectForm(root) {
    var out = {};
    $all("[data-field]", root).forEach(function (el) {
      var name = el.getAttribute("data-field");
      if (el.type === "checkbox") out[name] = el.checked;
      else if (el.type === "number") out[name] = el.value === "" ? "" : (parseFloat(el.value) || 0);
      else if (el.getAttribute("contenteditable") === "true") out[name] = el.innerHTML;
      else if (el.classList.contains("cselect")) {
        if (el.hasAttribute("data-value")) out[name] = el.getAttribute("data-value");
      }
      else out[name] = el.value;
    });
    $all("[data-list]", root).forEach(function (box) {
      var name = box.getAttribute("data-list"), items = [];
      $all(".line-item", box).forEach(function (row) {
        var v = row.querySelector(".line-input");
        if (v && v.value.trim() !== "") items.push(v.value.trim());
      });
      out[name] = items;
    });
    $all("[data-kv]", root).forEach(function (box) {
      var name = box.getAttribute("data-kv");
      var keys = box.getAttribute("data-keys").split(",");
      var items = [];
      $all(".kv-row", box).forEach(function (row) {
        var o = {};
        $all("input[data-k]", row).forEach(function (inp) { o[inp.getAttribute("data-k")] = inp.value; });
        if (keys.some(function (k) { return o[k] && o[k].trim() !== ""; })) items.push(o);
      });
      out[name] = items;
    });
    $all("[data-perms]", root).forEach(function (box) {
      var name = box.getAttribute("data-perms"), perms = {};
      if (box.hasAttribute("data-all")) { perms.__all = true; out[name] = perms; return; }
      $all("input[data-perm]", box).forEach(function (inp) { perms[inp.getAttribute("data-perm")] = inp.checked ? 1 : 0; });
      out[name] = perms;
    });
    return out;
  }

  function validateForm(fields, root) {
    var bad = [];
    fields.forEach(function (f) {
      if (!f.required) return;
      var el = root.querySelector("#f-" + f.name);
      var val = el
        ? (el.type === "checkbox" ? el.checked
          : (el.classList.contains("cselect") ? (el.hasAttribute("data-value") ? el.getAttribute("data-value") : "")
          : (el.getAttribute("contenteditable") === "true" ? (el.textContent || "").trim() : (el.value || "").trim())))
        : null;
      if (f.type === "lines" || f.type === "kv") {
        var box = root.querySelector(f.type === "lines" ? '[data-list="' + f.name + '"]' : '[data-kv="' + f.name + '"]');
        val = collectForm(box ? box.parentNode : root)[f.name].length > 0;
      }
      if (f.type === "perms") {
        var pbox = root.querySelector('[data-perms="' + f.name + '"]');
        val = pbox ? (pbox.hasAttribute("data-all") || $all("input[data-perm]", pbox).some(function (i) { return i.checked; })) : false;
      }
      if (!val) bad.push(f.name);
    });
    // 标记
    $all(".field", root).forEach(function (f) { f.classList.remove("has-error"); });
    bad.forEach(function (name) {
      var el = root.querySelector("#f-" + name);
      var box = root.querySelector('[data-list="' + name + '"],[data-kv="' + name + '"]');
      var target = el || box;
      if (target) {
        var fieldWrap = target.closest(".field");
        if (fieldWrap) fieldWrap.classList.add("has-error");
      }
    });
    return bad;
  }

  /* ---------------- 弹窗 ---------------- */
  function openModal(opts) {
    activeModal = opts;
    activeFields = opts.fieldMeta || {};
    modalTitle.textContent = opts.title || "";
    modalSub.textContent = opts.sub || "";
    modalSub.style.display = opts.sub ? "" : "none";
    modalBox.className = "modal" + (opts.wide ? " wide" : "") + (opts.confirm ? " confirm" : "");
    modalBody.innerHTML = opts.body || "";
    if (opts.foot) { modalFoot.hidden = false; modalFoot.innerHTML = opts.foot; }
    else { modalFoot.hidden = true; modalFoot.innerHTML = ""; }
    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
    $all(".rte", modalBody).forEach(function (rte) { rteInit(rte.getAttribute("data-rte")); });
    var fi = modalBody.querySelector("input:not([type=checkbox]):not([class*=rte-link-input]),textarea,.cselect,[contenteditable]");
    if (fi) setTimeout(function () { fi.focus(); }, 60);
  }
  function closeModal() {
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
    activeModal = null;
    activeFields = {};
    modalBody.innerHTML = "";
    modalFoot.innerHTML = "";
    modalFoot.hidden = true;
  }
  function confirmDialog(title, bodyHTML, onYes, label) {
    openModal({
      title: title, confirm: true, body: bodyHTML,
      foot: '<div class="foot-actions"><button type="button" class="btn btn-outline" data-foot="cancel">取消</button><button type="button" class="btn btn-danger-solid" data-foot="confirm">' + esc(label || "确认") + "</button></div>"
    });
    activeModal.onConfirm = onYes;
  }

  function submitModal() {
    if (!activeModal || !activeModal.onsubmit) return;
    var fields = activeModal.fields || [];
    var bad = validateForm(fields, modalBody);
    if (bad.length) { toast("请完善必填项后再保存", "error"); return; }
    var data = collectForm(modalBody);
    activeModal.onsubmit(data);
    closeModal();
    render();
  }

  function addLine(name) {
    var f = activeFields[name];
    var box = modalBody.querySelector('[data-list="' + name + '"]');
    if (!box || !f) return;
    var n = box.querySelectorAll(".line-item").length + 1;
    var d = document.createElement("div");
    d.innerHTML = lineRowHTML(n, "", f.itemPlaceholder);
    box.appendChild(d.firstChild);
    d.firstChild.querySelector(".line-input").focus();
  }
  function addKv(name) {
    var f = activeFields[name];
    var box = modalBody.querySelector('[data-kv="' + name + '"]');
    if (!box || !f) return;
    var d = document.createElement("div");
    d.innerHTML = kvRowHTML({}, f.keys);
    box.appendChild(d.firstChild);
  }
  function togglePreview(name) {
      var pv = document.getElementById("pv-" + name);
      var ta = modalBody.querySelector("#f-" + name);
      if (!pv || !ta) return;
      if (pv.hidden) {
        pv.innerHTML = ta.value ? ta.value : "<p style='color:var(--muted)'>（暂无内容）</p>";
        pv.hidden = false;
      } else { pv.hidden = true; }
    }

    /* ---------------- 自定义下拉（cselect） ---------------- */
    var cselScrollHost = null;
    function cselCloseAll(except) {
      $all(".cselect.open").forEach(function (w) { if (w !== except) cselSet(w, false); });
    }
    function cselSet(w, open) {
      w.classList.toggle("open", open);
      w.setAttribute("aria-expanded", open ? "true" : "false");
      if (!open) { w.removeEventListener("scroll", cselScroll, true); cselScrollHost = null; return; }
      cselScrollHost = w.closest(".modal-body") || w.closest(".modal");
      if (cselScrollHost) {
        cselScrollHost.addEventListener("scroll", cselScroll, true);
      }
      cselFlip(w);
    }
    function cselScroll() { if (cselScrollHost && overlay.classList.contains("open")) { $all(".cselect.open").forEach(function (w) { cselSet(w, false); }); } }
    function cselToggle(w) { if (!w) return; var isOpen = w.classList.contains("open"); cselCloseAll(w); cselSet(w, !isOpen); }
    function cselPick(w, li) {
      var val = li.getAttribute("data-val");
      var valEl = w.querySelector(".cselect-value");
      if (valEl) valEl.textContent = li.textContent;
      w.setAttribute("data-value", val);
      w.setAttribute("data-labeled", "1");
      $all(".cselect-opt", w).forEach(function (o) { o.setAttribute("aria-selected", o === li ? "true" : "false"); });
      cselSet(w, false);
    }
    function cselKeys(w, e) {
      if (!w) return;
      var opts = $all(".cselect-opt", w);
      var isOpen = w.classList.contains("open");
      var idx = -1;
      opts.forEach(function (o, i) { if (o.getAttribute("aria-selected") === "true") idx = i; });
      if (!isOpen) {
        if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault(); cselToggle(w);
          if (e.key === "ArrowDown" && opts.length > 0) opts[Math.max(idx, 0)].focus();
        }
        return;
      }
      if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); cselSet(w, false); w.focus(); }
      else if (e.key === "Tab") { cselSet(w, false); }
      else if (e.key === "Home") { e.preventDefault(); if (opts[0]) opts[0].focus(); }
      else if (e.key === "End") { e.preventDefault(); if (opts.length) opts[opts.length - 1].focus(); }
      else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        var cur = (document.activeElement && opts.indexOf(document.activeElement) >= 0) ? opts.indexOf(document.activeElement) : idx;
        var next = e.key === "ArrowDown" ? cur + 1 : cur - 1;
        next = Math.min(Math.max(next, 0), opts.length - 1);
        opts[next].focus();
      }
      else if (e.key === "Enter") {
        e.preventDefault();
        var li = document.activeElement;
        if (li && li.classList.contains("cselect-opt")) cselPick(w, li);
        else if (idx >= 0) cselPick(w, opts[idx]);
        w.focus();
      }
    }
    /* 滚动容器 / 视口外的菜单自动向上翻转 */
    function cselFlip(w) {
      var menu = w.querySelector(".cselect-menu");
      if (!menu) return;
      menu.style.top = ""; menu.style.bottom = "";
      var rect = menu.getBoundingClientRect();
      var host = cselScrollHost;
      var top, bottom;
      if (host) { var hr = host.getBoundingClientRect(); top = hr.top; bottom = hr.bottom; }
      else { top = 0; bottom = window.innerHeight; }
      if (rect.bottom > bottom) { menu.style.top = "auto"; menu.style.bottom = "100%"; }
      else { menu.style.top = "100%"; menu.style.bottom = "auto"; }
    }
    /* 委托：弹窗内所有自定义下拉的交互 */
    overlay.addEventListener("click", function (e) {
      var wrap = e.target.closest(".cselect");
      if (!wrap) { cselCloseAll(); return; }
      var opt = e.target.closest(".cselect-opt");
      if (opt) { e.preventDefault(); cselPick(wrap, opt); wrap.focus(); return; }
      e.preventDefault();
      var open = wrap.classList.contains("open");
      cselCloseAll(wrap);
      cselSet(wrap, !open);
      if (!open) cselFlip(wrap);
    });
    overlay.addEventListener("focusin", function (e) {
      var t = e.target;
      if (t && t.classList && t.classList.contains("cselect-opt")) {
        var w = t.closest(".cselect");
        if (w) cselFlip(w);
      }
    });
    overlay.addEventListener("keydown", function (e) { cselKeys(e.target.closest(".cselect"), e); });
    window.addEventListener("resize", function () { $all(".cselect.open").forEach(function (w) { cselFlip(w); }); });
    window.addEventListener("scroll", function () { $all(".cselect.open").forEach(function (w) { cselFlip(w); }); }, true);

    /* ---------------- 富文本编辑器（RTE） ---------------- */
    function rteEditor(name) {
      var rte = modalBody.querySelector('[data-rte="' + name + '"]');
      return rte ? rte.querySelector(".rte-editor") : null;
    }
    function rteCharCount(name) {
      var ed = rteEditor(name);
      var cnt = ed ? modalBody.querySelector('[data-count="' + name + '"]') : null;
      if (!ed || !cnt) return;
      var n = (ed.textContent || "").replace(/\s/g, "").length;
      cnt.textContent = n ? n + " 字" : "";
    }
    function rteEnsureDefaultBlock(name) {
      var ed = rteEditor(name);
      if (!ed) return;
      if ((ed.textContent || "").trim() === "" && !ed.querySelector("img,li,blockquote")) ed.innerHTML = "<p><br></p>";
    }
    function rteInit(name) {
      var ed = rteEditor(name);
      if (!ed) return;
      if (ed.__rte) return;
      ed.__rte = true;
      // 载入已有 HTML（空值则给默认空段落）
      var f = (activeFields[name] || {}).value;
      ed.innerHTML = f ? f : "";
      rteEnsureDefaultBlock(name);
      rteCharCount(name);
      // 粘贴转纯文本（保留换行）
      ed.addEventListener("paste", function (e) {
        e.preventDefault();
        var t = (e.clipboardData || window.clipboardData).getData("text/plain");
        var html = t.split(/\n{2,}/).map(function (p) { return "<p>" + esc(p.replace(/\n/g, " ")) + "</p>"; }).join("");
        document.execCommand("insertHTML", false, html);
      });
      // 快捷键
      ed.addEventListener("keydown", function (e) {
        var k = e.key, m = e.metaKey || e.ctrlKey;
        if (m && k === "b") { e.preventDefault(); document.execCommand("bold"); }
        else if (m && k === "i") { e.preventDefault(); document.execCommand("italic"); }
        else if (m && k === "u") { e.preventDefault(); document.execCommand("underline"); }
        else if (k === "Enter" && !e.shiftKey) {
          var an = ed.querySelector(":focus") || ed;
          if (an && /^UL|OL$/.test((an.tagName || "").toUpperCase())) {
            var parent = an.closest("ul,ol");
            if (parent && parent.lastElementChild === an && (!an.textContent || an.textContent.trim() === "")) {
              e.preventDefault();
              document.execCommand("insertUnorderedList", false, null);
            }
          }
        }
      });
      ed.addEventListener("input", function () { rteCharCount(name); });
      ed.addEventListener("focus", function () { rteEnsureDefaultBlock(name); });
    }
    function rteCmd(btn, name) {
      var ed = rteEditor(name);
      if (!ed) return;
      var cmd = btn.getAttribute("data-cmd");
      var val = btn.getAttribute("data-val") || null;
      ed.focus();
      if (cmd === "formatBlock") {
        // 切换：已处于该块级格式则回到普通段落
        var sel = window.getSelection();
        var cur = "p";
        if (sel && sel.rangeCount) {
          var n = sel.anchorNode;
          if (n && n.nodeType === 3) n = n.parentNode;
          var blk = n && n.closest ? n.closest("h2,h3,p,blockquote") : null;
          if (blk) cur = blk.tagName.toLowerCase();
        }
        document.execCommand("formatBlock", false, (cur === val ? "p" : "<" + val + ">"));
      } else if (cmd === "removeFormat") {
        document.execCommand("removeFormat", false, null);
        document.execCommand("formatBlock", false, "<p>");
      } else {
        document.execCommand(cmd, false, val);
      }
      if (cmd === "insertUnorderedList" && document.queryCommandState("insertUnorderedList") === false) {
        document.execCommand("insertUnorderedList", false, null);
      }
      rteCharCount(name);
    }
    function rteLinkToggle(name) {
      var ed = rteEditor(name);
      if (!ed) return;
      var box = ed.parentNode;
      var input = box.querySelector(".rte-link-input");
      if (input.hidden) {
        ed.focus();
        input.hidden = false;
        input.value = "";
        input.focus();
        input.select();
      } else {
        input.blur();
      }
    }
    function rteLinkCommit(input, name) {
      var url = input.value.trim();
      input.hidden = true;
      var ed = rteEditor(name);
      if (!ed) return;
      ed.focus();
      if (!url) return;
      if (url && !/^(https?:|mailto:|t.me)/i.test(url)) url = "https://" + url;
      var sel = window.getSelection();
      var hasSel = sel && sel.rangeCount > 0 && !sel.isCollapsed && sel.toString().trim() !== "";
      if (hasSel) {
        document.execCommand("createLink", false, url);
      } else {
        document.execCommand("insertHTML", false, '<a href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(url) + "</a>");
      }
      rteCharCount(name);
    }

  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) { closeModal(); return; }
    var pv = e.target.closest("[data-pv]");
    if (pv) { togglePreview(pv.getAttribute("data-pv")); return; }
    var tb = e.target.closest("[data-cmd]");
    if (tb) {
      var box = tb.closest(".rte");
      if (box) {
        var nm = box.getAttribute("data-rte");
        e.preventDefault();
        rteCmd(tb, nm);
      }
      return;
    }
    var lk = e.target.closest("[data-link]");
    if (lk) {
      e.preventDefault();
      rteLinkToggle(lk.getAttribute("data-link"));
      return;
    }
    if (e.target.closest("[data-add-line]")) { addLine(e.target.closest("[data-add-line]").getAttribute("data-add-line")); return; }
    if (e.target.closest("[data-add-kv]")) { addKv(e.target.closest("[data-add-kv]").getAttribute("data-add-kv")); return; }
    var dl = e.target.closest("[data-del-line]");
    if (dl) { var r = dl.closest(".line-item"); if (r && r.parentNode) r.parentNode.removeChild(r); return; }
    var dk = e.target.closest("[data-del-kv]");
    if (dk) { var rk = dk.closest(".kv-row"); if (rk && rk.parentNode) rk.parentNode.removeChild(rk); return; }
    if (e.target.closest("#modal-close")) { closeModal(); return; }
    var foot = e.target.closest("[data-foot]");
    if (foot) {
      var act = foot.getAttribute("data-foot");
      if (act === "submit") submitModal();
      else if (act === "cancel") closeModal();
      else if (act === "confirm" && activeModal && activeModal.onConfirm) { var cb = activeModal.onConfirm; closeModal(); cb(); }
    }
  });
  overlay.addEventListener("input", function (e) {
    var li = e.target.closest ? e.target.closest(".rte-link-input") : null;
    if (li) {
      var box = li.closest(".rte");
      if (box) rteCharCount(box.getAttribute("data-rte"));
    }
  });
  overlay.addEventListener("blur", function (e) {
    var li = e.target && e.target.closest ? e.target.closest(".rte-link-input") : null;
    if (li && !li.hidden) {
      var box = li.closest(".rte");
      if (box) rteLinkCommit(li, box.getAttribute("data-rte"));
    }
  }, true);
  overlay.addEventListener("keydown", function (e) {
    var li = e.target && e.target.closest ? e.target.closest(".rte-link-input") : null;
    if (!li) return;
    var box = li.closest(".rte");
    var name = box ? box.getAttribute("data-rte") : null;
    if (e.key === "Enter") { e.preventDefault(); rteLinkCommit(li, name); }
    else if (e.key === "Escape") { e.preventDefault(); li.value = ""; li.blur(); }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && overlay.classList.contains("open")) closeModal();
  });

  /* ---------------- 通用列表增删改操作（视图级委托） ---------------- */
  function actEdit(mod, id) { FORM_BUILDERS[mod].edit(id); }
  function actCreate(mod) { FORM_BUILDERS[mod].create(); }
  function actDelete(mod, id) {
    var item = byId(db[mod], id);
    var label = (item && (item.name || item.title)) || id;
    if (mod === "accounts" && item && item.role === "primary") { toast("主账号不可删除", "info"); return; }
    confirmDialog("删除确认",
      '<p class="confirm-text">确定要删除 <b>' + esc(label) + '</b> 吗？' +
      "<span class=\"confirm-sub\">删除后前台对应内容将不再展示，此操作不可撤销。</span></p>",
      function () {
        db[mod] = db[mod].filter(function (x) { return x.id !== id; });
        persist(); log("delete", mod, label); toast("已删除：" + label, "info"); render();
      }, "确认删除");
  }
  function actToggle(mod, id) {
    if (mod !== "accounts") return;
    var a = byId(db.accounts, id);
    if (!a) return;
    if (a.role === "primary") { toast("主账号不可停用", "info"); return; }
    a.status = a.status === "active" ? "locked" : "active";
    persist(); log("edit", "accounts", a.name);
    toast(a.status === "active" ? "已启用：" + a.name : "已停用：" + a.name, "info"); render();
  }
  function actMove(mod, id, dir) {
    var list = subList(mod);
    if (!list) return;
    var i = list.findIndex ? list.findIndex(function (x) { return x.id === id; }) : -1;
    if (i < 0) return;
    var j = i + dir;
    if (j < 0 || j >= list.length) { toast(dir < 0 ? "已在最前" : "已在最后", "info"); return; }
    var t = list[i]; list[i] = list[j]; list[j] = t;
    list.forEach(function (x, k) { x.sort = k + 1; });
    setSubList(mod, list);
    persist(); render();
  }

  view.addEventListener("click", function (e) {
    var add = e.target.closest("[data-add]");
    if (add) { actCreate(add.getAttribute("data-add")); return; }
    var btn = e.target.closest("[data-act]");
    if (!btn) return;
    var act = btn.getAttribute("data-act");
    var mod = btn.getAttribute("data-mod");
    var id = btn.getAttribute("data-id");
    if (act === "edit") actEdit(mod, id);
    else if (act === "create") actCreate(mod);
    else if (act === "delete") actDelete(mod, id);
    else if (act === "up") actMove(mod, id, -1);
    else if (act === "down") actMove(mod, id, 1);
    else if (act === "toggle") actToggle(mod, id);
    else if (act === "open") go(mod);
  });

  /* ---------------- 拖拽排序 ---------------- */
  var dragEl = null;
  function rowMod(row) { var b = row.querySelector("[data-mod]"); return b ? b.getAttribute("data-mod") : null; }
  function initDrag(fallbackMod) {
    var rows = $all("[data-drag]", view);
    rows.forEach(function (row) {
      var handle = row.querySelector(".drag-handle");
      if (!handle) return;
      row.setAttribute("draggable", "false");
      handle.addEventListener("mousedown", function () { row.setAttribute("draggable", "true"); dragEl = row; });
      handle.addEventListener("mouseup", function () { row.setAttribute("draggable", "false"); });
      row.addEventListener("dragstart", function (e) { dragEl = row; row.classList.add("dragging"); e.dataTransfer.effectAllowed = "move"; try { e.dataTransfer.setData("text/plain", ""); } catch (x) {} });
      row.addEventListener("dragend", function () { row.classList.remove("dragging"); $all("[data-drag]", view).forEach(function (r) { r.classList.remove("drag-over"); }); });
      row.addEventListener("dragover", function (e) { e.preventDefault(); if (row !== dragEl) row.classList.add("drag-over"); });
      row.addEventListener("dragleave", function () { row.classList.remove("drag-over"); });
      row.addEventListener("drop", function (e) {
        e.preventDefault();
        if (!dragEl || dragEl === row) return;
        // 每行按其自身 data-mod 定位所属列表（关于我们为三张表、各表 mod 不同）
        var targetMod = rowMod(row), dragMod = rowMod(dragEl) || fallbackMod;
        if (!targetMod || targetMod !== dragMod) return; // 仅允许在同一列表内拖拽
        var list = subList(targetMod);
        if (!list) return;
        var ids = $all("[data-drag]", view)
          .filter(function (r) { return rowMod(r) === targetMod; })
          .map(function (r) { return r.getAttribute("data-drag"); });
        var from = ids.indexOf(dragEl.getAttribute("data-drag"));
        var to = ids.indexOf(row.getAttribute("data-drag"));
        if (from < 0 || to < 0) return;
        var moved = null;
        for (var k = 0; k < list.length; k++) if (list[k].id === dragEl.getAttribute("data-drag")) { moved = list[k]; break; }
        if (!moved) return;
        var nl = list.filter(function (x) { return x.id !== moved.id; });
        nl.splice(to, 0, moved);
        nl.forEach(function (x, k2) { x.sort = k2 + 1; });
        setSubList(targetMod, nl);
        persist(); log("reorder", targetMod); render();
      });
    });
  }

  /* ---------------- 状态徽章 / 标签 ---------------- */
  function statusBadge(s) {
    if (s === "live") return '<span class="badge badge-live">已上线</span>';
    if (s === "soon") return '<span class="badge badge-soon">即将上线</span>';
    return '<span class="badge badge-muted">草稿</span>';
  }
  function domainCell(list, limit) {
    if (!list || !list.length) return '<span class="cell-sub" style="font-size:12px;color:var(--muted)">—</span>';
    var first = list[0];
    var more = list.length > 1 ? " +" + (list.length - 1) : "";
    return '<span class="cell-mono" title="' + esc(list.join("\n")) + '">' + esc(first) + esc(more) + "</span>";
  }

  /* ============================================================
     模块：表单构建器（create / edit）
     ============================================================ */
  var FORM_BUILDERS = {};

  /* ---------- 平台 ---------- */
  FORM_BUILDERS.platforms = {
    create: function () {
      var fields = [
        { type: "text", name: "name", label: "平台名称", required: true, placeholder: "如：环球360", span2: true },
        { type: "text", name: "short", label: "简称 / 徽章", required: true, placeholder: "如：360" },
        { type: "text", name: "type", label: "类型说明", required: true, placeholder: "如：真人百家乐", span2: true },
        { type: "select", name: "status", label: "上线状态", required: true, options: [{ v: "live", l: "已上线" }, { v: "soon", l: "即将上线" }], value: "live" },
        { type: "lines", name: "member", label: "会员入口域名", value: [], itemPlaceholder: "www.example.com（可带版本号注）" },
        { type: "lines", name: "admin", label: "管理后台域名", value: [], itemPlaceholder: "admin.example.com" },
        { type: "kv", name: "accounts", label: "试玩账号", value: [{ user: "", pass: "" }], keys: ["user", "pass"], hint: "账号与密码成对填写，用于演示登录" },
        { type: "lines", name: "tags", label: "标签（徽章）", value: [], itemPlaceholder: "如：1:1还原", span2: true, hint: "每行一个标签，前台显示为徽章" },
        { type: "textarea", name: "note", label: "备注说明", rows: 3, placeholder: "选填，前台卡片底部展示", span2: true }
      ];
      openModal({
        title: "新增平台", sub: "将加入演示平台矩阵", wide: true,
        fields: fields, fieldMeta: fields.reduce(function (m, f) { m[f.name] = f; return m; }, {}),
        body: buildForm(fields, "cols-2"),
        foot: footStandard(),
        onsubmit: function (d) {
          var item = {
            id: uid(), name: d.name.trim(), short: d.short.trim(), type: d.type.trim(),
            status: d.status, member: d.member, admin: d.admin, accounts: d.accounts,
            tags: d.tags, note: (d.note || "").trim(), sort: nextSort(db.platforms)
          };
          if (!item.name) { toast("平台名称不能为空", "error"); return; }
          db.platforms.push(item);
          persist(); log("create", "platforms", item.name);
          toast("已新增平台：" + item.name);
        }
      });
    },
    edit: function (id) {
      var p = byId(db.platforms, id);
      if (!p) return;
      var fields = [
        { type: "text", name: "name", label: "平台名称", required: true, value: p.name, span2: true },
        { type: "text", name: "short", label: "简称 / 徽章", required: true, value: p.short },
        { type: "text", name: "type", label: "类型说明", required: true, value: p.type, span2: true },
        { type: "select", name: "status", label: "上线状态", required: true, options: [{ v: "live", l: "已上线" }, { v: "soon", l: "即将上线" }], value: p.status },
        { type: "lines", name: "member", label: "会员入口域名", value: p.member, itemPlaceholder: "www.example.com" },
        { type: "lines", name: "admin", label: "管理后台域名", value: p.admin, itemPlaceholder: "admin.example.com" },
        { type: "kv", name: "accounts", label: "试玩账号", value: p.accounts.length ? p.accounts : [{ user: "", pass: "" }], keys: ["user", "pass"] },
        { type: "lines", name: "tags", label: "标签（徽章）", value: p.tags, itemPlaceholder: "如：1:1还原", span2: true },
        { type: "textarea", name: "note", label: "备注说明", rows: 3, value: p.note, span2: true }
      ];
      openModal({
        title: "编辑平台", sub: p.name, wide: true,
        fields: fields, fieldMeta: fields.reduce(function (m, f) { m[f.name] = f; return m; }, {}),
        body: buildForm(fields, "cols-2"),
        foot: footStandard(),
        onsubmit: function (d) {
          p.name = d.name.trim(); p.short = d.short.trim(); p.type = d.type.trim();
          p.status = d.status; p.member = d.member; p.admin = d.admin; p.accounts = d.accounts;
          p.tags = d.tags; p.note = (d.note || "").trim();
          persist(); log("edit", "platforms", p.name);
          toast("已保存：" + p.name);
        }
      });
    }
  };

  /* ---------- 文章 ---------- */
  FORM_BUILDERS.articles = {
    create: function () {
      var fields = [
        { type: "text", name: "title", label: "文章标题", required: true, placeholder: "如：RTP值10–90：调控强度怎么设", span2: true },
        { type: "select", name: "category", label: "内容分类", required: true, value: "tech", options: [
          { v: "tech", l: "技术解析" }, { v: "onboard", l: "接入指南" }, { v: "ops", l: "运营策略" }, { v: "insight", l: "行业洞察" }
        ] },
        { type: "text", name: "date", label: "发布日期", required: true, typeInput: "date", value: today() },
        { type: "toggle", name: "featured", label: "设为头条", desc: "头条文章将作为内容中心首屏主视觉", span2: true },
        { type: "text", name: "readMin", label: "预计阅读（分钟）", type: "number", value: 4 },
        { type: "textarea", name: "lede", label: "导语（摘要）", required: true, rows: 3, placeholder: "一句话概括本文核心观点，用于列表与阅读器开头。", span2: true },
        { type: "rich", name: "body", label: "正文（HTML）", required: true, placeholder: "<p>段落…</p><h3>小节标题</h3><p>…</p>" }
      ];
      openModal({
        title: "新增文章", sub: "将发布到内容中心", wide: true,
        fields: fields, fieldMeta: fields.reduce(function (m, f) { m[f.name] = f; return m; }, {}),
        body: buildForm(fields, "cols-2"),
        foot: footStandard(),
        onsubmit: function (d) {
          if (d.featured) db.articles.forEach(function (a) { a.featured = false; });
          var item = {
            id: uid(), title: d.title.trim(), category: d.category, catLabel: catLabel(d.category),
            date: d.date, featured: !!d.featured, readMin: parseInt(d.readMin || 4, 10) || 4,
            lede: d.lede.trim(), body: d.body, sort: nextSort(db.articles)
          };
          db.articles.push(item);
          persist(); log("create", "articles", item.title);
          toast("已发布文章：" + item.title);
        }
      });
    },
    edit: function (id) {
      var a = byId(db.articles, id);
      if (!a) return;
      var fields = [
        { type: "text", name: "title", label: "文章标题", required: true, value: a.title, span2: true },
        { type: "select", name: "category", label: "内容分类", required: true, value: a.category, options: [
          { v: "tech", l: "技术解析" }, { v: "onboard", l: "接入指南" }, { v: "ops", l: "运营策略" }, { v: "insight", l: "行业洞察" }
        ] },
        { type: "text", name: "date", label: "发布日期", required: true, typeInput: "date", value: a.date },
        { type: "toggle", name: "featured", label: "设为头条", desc: "内容中心首屏主视觉", value: a.featured, span2: true },
        { type: "text", name: "readMin", label: "预计阅读（分钟）", type: "number", value: a.readMin },
        { type: "textarea", name: "lede", label: "导语（摘要）", required: true, rows: 3, value: a.lede, span2: true },
        { type: "rich", name: "body", label: "正文（HTML）", required: true, value: a.body }
      ];
      openModal({
        title: "编辑文章", sub: a.title, wide: true,
        fields: fields, fieldMeta: fields.reduce(function (m, f) { m[f.name] = f; return m; }, {}),
        body: buildForm(fields, "cols-2"),
        foot: footStandard(),
        onsubmit: function (d) {
          if (d.featured) db.articles.forEach(function (x) { x.featured = x.id === id; });
          a.title = d.title.trim(); a.category = d.category; a.catLabel = catLabel(d.category);
          a.date = d.date; a.featured = !!d.featured; a.readMin = parseInt(d.readMin || a.readMin, 10);
          a.lede = d.lede.trim(); a.body = d.body;
          persist(); log("edit", "articles", a.title);
          toast("已保存：" + a.title);
        }
      });
    }
  };

  /* ---------- 新闻 ---------- */
  FORM_BUILDERS.news = {
    create: function () {
      var fields = [
        { type: "text", name: "title", label: "新闻标题", required: true, placeholder: "如：可控API正式上线", span2: true },
        { type: "select", name: "category", label: "新闻分类", required: true, value: "product", options: [
          { v: "product", l: "产品动态" }, { v: "industry", l: "行业观察" }
        ] },
        { type: "text", name: "date", label: "发布日期", required: true, typeInput: "date", value: today() },
        { type: "textarea", name: "excerpt", label: "摘要（列表展示）", required: true, rows: 2, span2: true },
        { type: "rich", name: "body", label: "正文（HTML）", required: true, placeholder: "<p>…</p>" }
      ];
      openModal({
        title: "新增新闻", sub: "将发布到新闻中心", wide: true,
        fields: fields, fieldMeta: fields.reduce(function (m, f) { m[f.name] = f; return m; }, {}),
        body: buildForm(fields, "cols-2"),
        foot: footStandard(),
        onsubmit: function (d) {
          var item = {
            id: uid(), title: d.title.trim(), category: d.category, catLabel: catLabel(d.category),
            date: d.date, excerpt: d.excerpt.trim(), body: d.body, sort: nextSort(db.news)
          };
          db.news.push(item);
          persist(); log("create", "news", item.title);
          toast("已发布新闻：" + item.title);
        }
      });
    },
    edit: function (id) {
      var n = byId(db.news, id);
      if (!n) return;
      var fields = [
        { type: "text", name: "title", label: "新闻标题", required: true, value: n.title, span2: true },
        { type: "select", name: "category", label: "新闻分类", required: true, value: n.category, options: [
          { v: "product", l: "产品动态" }, { v: "industry", l: "行业观察" }
        ] },
        { type: "text", name: "date", label: "发布日期", required: true, typeInput: "date", value: n.date },
        { type: "textarea", name: "excerpt", label: "摘要（列表展示）", required: true, rows: 2, value: n.excerpt, span2: true },
        { type: "rich", name: "body", label: "正文（HTML）", required: true, value: n.body }
      ];
      openModal({
        title: "编辑新闻", sub: n.title, wide: true,
        fields: fields, fieldMeta: fields.reduce(function (m, f) { m[f.name] = f; return m; }, {}),
        body: buildForm(fields, "cols-2"),
        foot: footStandard(),
        onsubmit: function (d) {
          n.title = d.title.trim(); n.category = d.category; n.catLabel = catLabel(d.category);
          n.date = d.date; n.excerpt = d.excerpt.trim(); n.body = d.body;
          persist(); log("edit", "news", n.title);
          toast("已保存：" + n.title);
        }
      });
    }
  };

  /* ---------- 服务 ---------- */
  FORM_BUILDERS.services = {
    create: function () {
      var fields = [
        { type: "text", name: "title", label: "服务标题", required: true, placeholder: "如：可控真人视讯", span2: true },
        { type: "text", name: "index", label: "序号标识", required: true, value: "Service 0" + (db.services.length + 1), span2: true, hint: "前台显示为 Service 0X" },
        { type: "textarea", name: "desc", label: "服务描述", required: true, rows: 3, span2: true },
        { type: "lines", name: "features", label: "能力要点（列表）", required: true, value: [], itemPlaceholder: "每行一条能力说明" },
        { type: "lines", name: "flow", label: "流程节点（选填）", value: [], itemPlaceholder: "如：鉴权签名 / 房间列表", hint: "仅部分服务需要，留空则不展示流程条" },
        { type: "select", name: "flip", label: "图文布局", value: "left", options: [{ v: "left", l: "图左文右" }, { v: "right", l: "图右文左（交替）" }] },
        { type: "text", name: "note", label: "配图说明", placeholder: "选填，配图尺寸与主题备注", span2: true }
      ];
      openModal({
        title: "新增服务", sub: "将加入核心服务页", wide: true,
        fields: fields, fieldMeta: fields.reduce(function (m, f) { m[f.name] = f; return m; }, {}),
        body: buildForm(fields, "cols-2"),
        foot: footStandard(),
        onsubmit: function (d) {
          var item = {
            id: uid(), index: d.index.trim(), title: d.title.trim(), desc: d.desc.trim(),
            features: d.features, flow: d.flow, flip: d.flip === "right", note: (d.note || "").trim(),
            sort: nextSort(db.services)
          };
          db.services.push(item);
          persist(); log("create", "services", item.title);
          toast("已新增服务：" + item.title);
        }
      });
    },
    edit: function (id) {
      var s = byId(db.services, id);
      if (!s) return;
      var fields = [
        { type: "text", name: "title", label: "服务标题", required: true, value: s.title, span2: true },
        { type: "text", name: "index", label: "序号标识", required: true, value: s.index, span2: true },
        { type: "textarea", name: "desc", label: "服务描述", required: true, rows: 3, value: s.desc, span2: true },
        { type: "lines", name: "features", label: "能力要点（列表）", required: true, value: s.features, itemPlaceholder: "每行一条能力说明" },
        { type: "lines", name: "flow", label: "流程节点（选填）", value: s.flow || [], itemPlaceholder: "如：鉴权签名" },
        { type: "select", name: "flip", label: "图文布局", value: s.flip ? "right" : "left", options: [{ v: "left", l: "图左文右" }, { v: "right", l: "图右文左（交替）" }] },
        { type: "text", name: "note", label: "配图说明", value: s.note, span2: true }
      ];
      openModal({
        title: "编辑服务", sub: s.title, wide: true,
        fields: fields, fieldMeta: fields.reduce(function (m, f) { m[f.name] = f; return m; }, {}),
        body: buildForm(fields, "cols-2"),
        foot: footStandard(),
        onsubmit: function (d) {
          s.title = d.title.trim(); s.index = d.index.trim(); s.desc = d.desc.trim();
          s.features = d.features; s.flow = d.flow; s.flip = d.flip === "right"; s.note = (d.note || "").trim();
          persist(); log("edit", "services", s.title);
          toast("已保存：" + s.title);
        }
      });
    }
  };

  /* ---------- 关于：子块 CRUD ---------- */
  FORM_BUILDERS.about = {
    create: function () {
      // 关于页为结构化区块，提供「编辑简介」入口
      openEditAbout();
    },
    edit: function (id) {
      openEditAbout(id);
    }
  };
  FORM_BUILDERS.timeline = {
    create: function () {
      var fields = [
        { type: "text", name: "year", label: "年份", required: true, placeholder: "如：2026" },
        { type: "text", name: "title", label: "里程碑标题", required: true, placeholder: "如：公司创立", span2: true },
        { type: "textarea", name: "desc", label: "描述", required: true, rows: 3, span2: true }
      ];
      openModal({
        title: "新增里程碑", sub: "发展历程",
        fields: fields, fieldMeta: fields.reduce(function (m, f) { m[f.name] = f; return m; }, {}),
        body: buildForm(fields, "cols-2"), foot: footStandard(),
        onsubmit: function (d) {
          db.about.timeline.push({ id: uid(), year: d.year.trim(), title: d.title.trim(), desc: d.desc.trim(), sort: nextSort(db.about.timeline) });
          persist(); log("create", "timeline"); toast("已新增里程碑：" + d.title);
        }
      });
    },
    edit: function (id) {
      var t = byId(db.about.timeline, id);
      if (!t) return;
      var fields = [
        { type: "text", name: "year", label: "年份", required: true, value: t.year },
        { type: "text", name: "title", label: "里程碑标题", required: true, value: t.title, span2: true },
        { type: "textarea", name: "desc", label: "描述", required: true, rows: 3, value: t.desc, span2: true }
      ];
      openModal({
        title: "编辑里程碑", sub: t.year + " · " + t.title,
        fields: fields, fieldMeta: fields.reduce(function (m, f) { m[f.name] = f; return m; }, {}),
        body: buildForm(fields, "cols-2"), foot: footStandard(),
        onsubmit: function (d) { t.year = d.year.trim(); t.title = d.title.trim(); t.desc = d.desc.trim(); persist(); log("edit", "timeline"); toast("已保存"); }
      });
    }
  };
  FORM_BUILDERS.capabilities = {
    create: function () {
      var fields = [
        { type: "text", name: "title", label: "能力标题", required: true, placeholder: "如：AI算法与图像识别", span2: true },
        { type: "text", name: "tag", label: "标签", required: true, placeholder: "如：AI换牌" },
        { type: "text", name: "eyebrow", label: "小标题（英文）", value: "Capability 0X", hint: "如 Capability 01" },
        { type: "textarea", name: "desc", label: "描述", required: true, rows: 3, span2: true },
        { type: "lines", name: "points", label: "要点（列表）", required: true, value: [], itemPlaceholder: "每行一条" },
        { type: "text", name: "note", label: "配图说明", placeholder: "选填", span2: true }
      ];
      openModal({
        title: "新增核心能力", sub: "关于我们", wide: true,
        fields: fields, fieldMeta: fields.reduce(function (m, f) { m[f.name] = f; return m; }, {}),
        body: buildForm(fields, "cols-2"), foot: footStandard(),
        onsubmit: function (d) {
          db.about.capabilities.push({ id: uid(), tag: d.tag.trim(), eyebrow: d.eyebrow.trim(), title: d.title.trim(), desc: d.desc.trim(), points: d.points, note: (d.note || "").trim(), sort: nextSort(db.about.capabilities) });
          persist(); log("create", "capabilities"); toast("已新增能力：" + d.title);
        }
      });
    },
    edit: function (id) {
      var c = byId(db.about.capabilities, id);
      if (!c) return;
      var fields = [
        { type: "text", name: "title", label: "能力标题", required: true, value: c.title, span2: true },
        { type: "text", name: "tag", label: "标签", required: true, value: c.tag },
        { type: "text", name: "eyebrow", label: "小标题（英文）", value: c.eyebrow },
        { type: "textarea", name: "desc", label: "描述", required: true, rows: 3, value: c.desc, span2: true },
        { type: "lines", name: "points", label: "要点（列表）", required: true, value: c.points, itemPlaceholder: "每行一条" },
        { type: "text", name: "note", label: "配图说明", value: c.note, span2: true }
      ];
      openModal({
        title: "编辑核心能力", sub: c.title, wide: true,
        fields: fields, fieldMeta: fields.reduce(function (m, f) { m[f.name] = f; return m; }, {}),
        body: buildForm(fields, "cols-2"), foot: footStandard(),
        onsubmit: function (d) { c.tag = d.tag.trim(); c.eyebrow = d.eyebrow.trim(); c.title = d.title.trim(); c.desc = d.desc.trim(); c.points = d.points; c.note = (d.note || "").trim(); persist(); log("edit", "capabilities"); toast("已保存：" + c.title); }
      });
    }
  };
  FORM_BUILDERS.values = {
    create: function () {
      var fields = [
        { type: "text", name: "char", label: "代表字", required: true, placeholder: "如：稳", hint: "单字，前台显示为金色大字" },
        { type: "text", name: "title", label: "价值观标题", required: true, placeholder: "如：稳定" },
        { type: "textarea", name: "desc", label: "描述", required: true, rows: 3, span2: true }
      ];
      openModal({
        title: "新增价值观", sub: "企业文化",
        fields: fields, fieldMeta: fields.reduce(function (m, f) { m[f.name] = f; return m; }, {}),
        body: buildForm(fields, "cols-2"), foot: footStandard(),
        onsubmit: function (d) {
          db.about.values.push({ id: uid(), char: (d.char || "").trim().slice(0, 1), title: d.title.trim(), desc: d.desc.trim(), sort: nextSort(db.about.values) });
          persist(); log("create", "values"); toast("已新增价值观：" + d.title);
        }
      });
    },
    edit: function (id) {
      var v = byId(db.about.values, id);
      if (!v) return;
      var fields = [
        { type: "text", name: "char", label: "代表字", required: true, value: v.char, hint: "单字" },
        { type: "text", name: "title", label: "价值观标题", required: true, value: v.title },
        { type: "textarea", name: "desc", label: "描述", required: true, rows: 3, value: v.desc, span2: true }
      ];
      openModal({
        title: "编辑价值观", sub: v.title,
        fields: fields, fieldMeta: fields.reduce(function (m, f) { m[f.name] = f; return m; }, {}),
        body: buildForm(fields, "cols-2"), foot: footStandard(),
        onsubmit: function (d) { v.char = (d.char || "").trim().slice(0, 1); v.title = d.title.trim(); v.desc = d.desc.trim(); persist(); log("edit", "values"); toast("已保存：" + v.title); }
      });
    }
  };
  // 关于页「编辑简介 / 使命」
  function openEditAbout(id) {
    var a = db.about;
    var fields = [
      { type: "textarea", name: "intro", label: "公司简介（多段，空行分段）", required: true, rows: 6, value: a.introParas.join("\n\n"), span2: true, hint: "段落之间用空行分隔" },
      { type: "textarea", name: "mission", label: "我们的使命", rows: 3, span2: true, value: a.mission }
    ];
    openModal({
      title: "编辑公司简介", sub: "关于我们 · 首屏简介与使命", wide: true,
      fields: fields, fieldMeta: fields.reduce(function (m, f) { m[f.name] = f; return m; }, {}),
      body: buildForm(fields, ""),
      foot: footStandard(),
      onsubmit: function (d) {
        a.introParas = d.intro.split(/\n\s*\n/).map(function (s) { return s.trim(); }).filter(Boolean);
        a.mission = (d.mission || "").trim();
        persist(); log("edit", "about", "公司简介");
        toast("已保存公司简介");
      }
    });
  }

  /* ---------- 首页：子块 ---------- */
  FORM_BUILDERS.hero = {
    create: function () { editHero(); },
    edit: function () { editHero(); }
  };
  function editHero() {
    var h = db.home.hero;
    var fields = [
      { type: "text", name: "kicker", label: "眉标（kicker）", value: h.kicker, span2: true },
      { type: "text", name: "titleLine1", label: "主标题第一行（白色）", required: true, value: h.titleLine1 },
      { type: "text", name: "titleLine2", label: "主标题第二行（白色）", required: true, value: h.titleLine2 },
      { type: "textarea", name: "sub", label: "副标题描述", rows: 3, value: h.sub, span2: true },
      { type: "text", name: "ctaPrimary", label: "主按钮文案", required: true, value: h.ctaPrimary },
      { type: "text", name: "ctaPrimaryHref", label: "主按钮链接", value: h.ctaPrimaryHref, hint: "前台页面，如 cases.html" },
      { type: "text", name: "ctaSecondary", label: "次按钮文案", value: h.ctaSecondary },
      { type: "text", name: "ctaSecondaryHref", label: "次按钮链接", value: h.ctaSecondaryHref }
    ];
    openModal({
      title: "编辑首页 Hero", sub: "首屏主视觉", wide: true,
      fields: fields, fieldMeta: fields.reduce(function (m, f) { m[f.name] = f; return m; }, {}),
      body: buildForm(fields, "cols-2"), foot: footStandard(),
      onsubmit: function (d) {
        h.kicker = d.kicker.trim(); h.titleLine1 = d.titleLine1.trim(); h.titleLine2 = d.titleLine2.trim();
        h.sub = d.sub.trim(); h.ctaPrimary = d.ctaPrimary.trim(); h.ctaPrimaryHref = d.ctaPrimaryHref.trim();
        h.ctaSecondary = d.ctaSecondary.trim(); h.ctaSecondaryHref = d.ctaSecondaryHref.trim();
        persist(); log("edit", "home", "Hero"); toast("已保存 Hero");
      }
    });
  }
  FORM_BUILDERS.stats = {
    create: function () { statModal(null); },
    edit: function (id) { statModal(byId(db.home.stats, id)); }
  };
  function statModal(it) {
    var isNew = !it;
    var fields = [
      { type: "text", name: "value", label: "数值", required: true, value: it ? it.value : "", placeholder: "如：11 / 99.9" },
      { type: "text", name: "suffix", label: "后缀", value: it ? it.suffix : "+", hint: "如：+ / 天 / % / 7" },
      { type: "text", name: "label", label: "指标名称", required: true, value: it ? it.label : "", placeholder: "如：可控平台", span2: true }
    ];
    openModal({
      title: isNew ? "新增数据指标" : "编辑数据指标", sub: "首页数据条",
      fields: fields, fieldMeta: fields.reduce(function (m, f) { m[f.name] = f; return m; }, {}),
      body: buildForm(fields, "cols-2"), foot: footStandard(),
      onsubmit: function (d) {
        var rec = { value: d.value.trim(), suffix: (d.suffix || "").trim(), label: d.label.trim() };
        if (isNew) { db.home.stats.push({ id: uid(), sort: nextSort(db.home.stats), value: rec.value, suffix: rec.suffix, label: rec.label }); toast("已新增指标：" + rec.label); }
        else { it.value = rec.value; it.suffix = rec.suffix; it.label = rec.label; toast("已保存：" + rec.label); }
        persist(); log(isNew ? "create" : "edit", "home", "数据指标");
      }
    });
  }
  FORM_BUILDERS.products = {
    create: function () { productModal(null); },
    edit: function (id) { productModal(byId(db.home.products, id)); }
  };
  function productModal(it) {
    var isNew = !it;
    var fields = [
      { type: "text", name: "title", label: "产品标题", required: true, value: it ? it.title : "", span2: true },
      { type: "textarea", name: "desc", label: "产品描述", required: true, rows: 3, value: it ? it.desc : "", span2: true },
      { type: "text", name: "badge", label: "徽章文案", value: it ? it.badge : "已上线" },
      { type: "select", name: "badgeType", label: "徽章类型", value: it ? it.badgeType : "live", options: [{ v: "live", l: "已上线（绿）" }, { v: "soon", l: "即将上线（金）" }] },
      { type: "lines", name: "tags", label: "标签（每行一个）", value: it ? it.tags : [], itemPlaceholder: "如：AI换牌", span2: true }
    ];
    openModal({
      title: isNew ? "新增产品线" : "编辑产品线", sub: "首页 · 四大产品线", wide: true,
      fields: fields, fieldMeta: fields.reduce(function (m, f) { m[f.name] = f; return m; }, {}),
      body: buildForm(fields, "cols-2"), foot: footStandard(),
      onsubmit: function (d) {
        var rec = { title: d.title.trim(), desc: d.desc.trim(), badge: d.badge.trim(), badgeType: d.badgeType, tags: d.tags };
        if (isNew) { db.home.products.push({ id: uid(), sort: nextSort(db.home.products), value: 0, title: rec.title, desc: rec.desc, badge: rec.badge, badgeType: rec.badgeType, tags: rec.tags }); toast("已新增产品线：" + rec.title); }
        else { it.title = rec.title; it.desc = rec.desc; it.badge = rec.badge; it.badgeType = rec.badgeType; it.tags = rec.tags; toast("已保存：" + rec.title); }
        persist(); log(isNew ? "create" : "edit", "home", "产品线");
      }
    });
  }
  FORM_BUILDERS.advantages = {
    create: function () { simpleModal("advantages", "核心优势", null); },
    edit: function (id) { simpleModal("advantages", "核心优势", byId(db.home.advantages, id)); }
  };
  FORM_BUILDERS.process = {
    create: function () { simpleModal("process", "合作流程", null); },
    edit: function (id) { simpleModal("process", "合作流程", byId(db.home.process, id)); }
  };
  FORM_BUILDERS.testimonials = {
    create: function () { testimonialModal(null); },
    edit: function (id) { testimonialModal(byId(db.home.testimonials, id)); }
  };
  function testimonialModal(it) {
    var isNew = !it;
    var fields = [
      { type: "textarea", name: "quote", label: "证言内容", required: true, rows: 4, value: it ? it.quote : "", span2: true },
      { type: "text", name: "name", label: "客户称呼", required: true, value: it ? it.name : "", placeholder: "如：K先生" },
      { type: "text", name: "role", label: "客户身份", value: it ? it.role : "", placeholder: "如：某博彩平台运营总监" }
    ];
    openModal({
      title: isNew ? "新增客户证言" : "编辑客户证言", sub: "首页 · 合作伙伴", wide: true,
      fields: fields, fieldMeta: fields.reduce(function (m, f) { m[f.name] = f; return m; }, {}),
      body: buildForm(fields, "cols-2"), foot: footStandard(),
      onsubmit: function (d) {
        if (isNew) { db.home.testimonials.push({ id: uid(), sort: nextSort(db.home.testimonials), quote: d.quote.trim(), name: d.name.trim(), role: (d.role || "").trim() }); toast("已新增证言：" + d.name); }
        else { it.quote = d.quote.trim(); it.name = d.name.trim(); it.role = (d.role || "").trim(); toast("已保存：" + it.name); }
        persist(); log(isNew ? "create" : "edit", "home", "客户证言");
      }
    });
  }
  function simpleModal(key, labelName, it) {
    var isNew = !it;
    var fields = [
      { type: "text", name: "title", label: "标题", required: true, value: it ? it.title : "", span2: true },
      { type: "textarea", name: "desc", label: "描述", required: true, rows: 3, value: it ? it.desc : "", span2: true }
    ];
    openModal({
      title: (isNew ? "新增" : "编辑") + labelName, sub: "首页 · " + labelName,
      fields: fields, fieldMeta: fields.reduce(function (m, f) { m[f.name] = f; return m; }, {}),
      body: buildForm(fields, ""), foot: footStandard(),
      onsubmit: function (d) {
        if (isNew) { db.home[key].push({ id: uid(), sort: nextSort(db.home[key]), title: d.title.trim(), desc: d.desc.trim() }); toast("已新增：" + d.title); }
        else { it.title = d.title.trim(); it.desc = d.desc.trim(); toast("已保存：" + it.title); }
        persist(); log(isNew ? "create" : "edit", "home", labelName);
      }
    });
  }
  FORM_BUILDERS.cta = {
    create: function () { editCta(); },
    edit: function () { editCta(); }
  };
  function editCta() {
    var c = db.home.cta;
    var fields = [
      { type: "text", name: "title", label: "标题", required: true, value: c.title, span2: true },
      { type: "textarea", name: "sub", label: "副标题", rows: 2, value: c.sub, span2: true },
      { type: "text", name: "ctaPrimary", label: "主按钮文案", value: c.ctaPrimary },
      { type: "text", name: "ctaPrimaryHref", label: "主按钮链接", value: c.ctaPrimaryHref },
      { type: "text", name: "ctaSecondary", label: "次按钮文案", value: c.ctaSecondary },
      { type: "text", name: "ctaSecondaryHref", label: "次按钮链接", value: c.ctaSecondaryHref }
    ];
    openModal({
      title: "编辑首页底部", sub: "首页底部行动号召", wide: true,
      fields: fields, fieldMeta: fields.reduce(function (m, f) { m[f.name] = f; return m; }, {}),
      body: buildForm(fields, "cols-2"), foot: footStandard(),
      onsubmit: function (d) {
        c.title = d.title.trim(); c.sub = d.sub.trim();
        c.ctaPrimary = d.ctaPrimary.trim(); c.ctaPrimaryHref = d.ctaPrimaryHref.trim();
        c.ctaSecondary = d.ctaSecondary.trim(); c.ctaSecondaryHref = d.ctaSecondaryHref.trim();
        persist(); log("edit", "home", "首页底部"); toast("已保存首页底部");
      }
    });
  }

  /* ---------- 联系：FAQ + 联系信息 ---------- */
  FORM_BUILDERS.contact = {
    create: function () { editContactInfo(); },
    edit: function (id) { if (id === "__info") editContactInfo(); else faqModal(byId(db.contact.faq, id)); }
  };
  FORM_BUILDERS.faq = {
    create: function () { faqModal(null); },
    edit: function (id) { faqModal(byId(db.contact.faq, id)); }
  };
  function faqModal(it) {
    var isNew = !it;
    var fields = [
      { type: "text", name: "q", label: "问题", required: true, value: it ? it.q : "", span2: true },
      { type: "textarea", name: "a", label: "答案", required: true, rows: 3, value: it ? it.a : "", span2: true }
    ];
    openModal({
      title: isNew ? "新增常见问题" : "编辑常见问题", sub: "联系我们 · FAQ", wide: true,
      fields: fields, fieldMeta: fields.reduce(function (m, f) { m[f.name] = f; return m; }, {}),
      body: buildForm(fields, ""), foot: footStandard(),
      onsubmit: function (d) {
        if (isNew) { db.contact.faq.push({ id: uid(), sort: nextSort(db.contact.faq), q: d.q.trim(), a: d.a.trim() }); toast("已新增问题：" + d.q); }
        else { it.q = d.q.trim(); it.a = d.a.trim(); toast("已保存：" + it.q); }
        persist(); log(isNew ? "create" : "edit", "faq");
      }
    });
  }
  function editContactInfo() {
    var c = db.contact;
    var fields = [
      { type: "text", name: "telegram", label: "Telegram 账号", required: true, value: c.telegram, hint: "如 @kekong88" },
      { type: "text", name: "telegramUrl", label: "Telegram 链接", required: true, typeInput: "url", value: c.telegramUrl, hint: "https://t.me/kekong88" },
      { type: "text", name: "serviceHours", label: "服务时段", value: c.serviceHours },
      { type: "text", name: "responseTime", label: "对接时效", value: c.responseTime },
      { type: "text", name: "recommendedTitle", label: "推荐渠道标题", value: c.recommendedTitle, span2: true },
      { type: "textarea", name: "recommendedDesc", label: "推荐渠道描述", rows: 3, value: c.recommendedDesc, span2: true }
    ];
    openModal({
      title: "编辑联系信息", sub: "联系我们 · 商务直达", wide: true,
      fields: fields, fieldMeta: fields.reduce(function (m, f) { m[f.name] = f; return m; }, {}),
      body: buildForm(fields, "cols-2"), foot: footStandard(),
      onsubmit: function (d) {
        c.telegram = d.telegram.trim(); c.telegramUrl = d.telegramUrl.trim();
        c.serviceHours = d.serviceHours.trim(); c.responseTime = d.responseTime.trim();
        c.recommendedTitle = d.recommendedTitle.trim(); c.recommendedDesc = d.recommendedDesc.trim();
        persist(); log("edit", "contact", "联系信息"); toast("已保存联系信息");
      }
    });
  }

  /* ---------- 设置 ---------- */
  FORM_BUILDERS.settings = {
    create: function () { editSettings(); },
    edit: function () { editSettings(); }
  };
  function editSettings() {
    var s = db.settings;
    var fields = [
      { type: "text", name: "siteName", label: "站点名称", required: true, value: s.siteName },
      { type: "text", name: "navCtaText", label: "导航 CTA 文案", value: s.navCtaText },
      { type: "textarea", name: "siteTagline", label: "页脚品牌描述", rows: 2, value: s.siteTagline, span2: true },
      { type: "text", name: "navCtaHref", label: "导航 CTA 链接", value: s.navCtaHref, hint: "如 contact.html" },
      { type: "text", name: "footerNote", label: "页脚备注", value: s.footerNote },
      { type: "text", name: "copyright", label: "版权文案", value: s.copyright, span2: true }
    ];
    openModal({
      title: "编辑全局设置", sub: "导航 / 页脚 / 版权", wide: true,
      fields: fields, fieldMeta: fields.reduce(function (m, f) { m[f.name] = f; return m; }, {}),
      body: buildForm(fields, "cols-2"), foot: footStandard(),
      onsubmit: function (d) {
        s.siteName = d.siteName.trim(); s.siteTagline = d.siteTagline.trim();
        s.navCtaText = d.navCtaText.trim(); s.navCtaHref = d.navCtaHref.trim();
        s.footerNote = d.footerNote.trim(); s.copyright = d.copyright.trim();
        persist(); log("edit", "settings", "全局"); toast("已保存全局设置");
      }
    });
  }
  FORM_BUILDERS.cs = {
    create: function () { editCs(); },
    edit: function () { editCs(); }
  };
  function editCs() {
    var cs = db.settings.cs;
    var fields = [
      { type: "toggle", name: "enabled", label: "启用客服悬浮按钮", desc: "关闭后前台全站不再显示右下角客服按钮", span2: true },
      { type: "select", name: "mode", label: "对接方式", value: cs.mode, options: [
        { v: "float", l: "页面内弹出客服浮窗（推荐）" },
        { v: "link", l: "新标签页打开客服系统" },
        { v: "popup", l: "弹出客服窗口" },
        { v: "embed", l: "内嵌第三方客服组件" }
      ], hint: "float 点击后在页面内弹出浮窗，不跳转新页面；link / popup 使用下方「客服系统链接」；embed 需额外填写官方脚本", span2: true },
      { type: "url", name: "link", label: "客服系统链接", value: cs.link, hint: "如 https://chat.example.com/ 或客服系统提供的会话地址", span2: true },
      { type: "textarea", name: "embedScript", label: "第三方客服脚本（embed 方式）", value: cs.embedScript, hint: "粘贴客服系统官方初始化代码，如：<script src=\"//js.xxx.com/widget.js\" data-key=\"xxx\"></script>", span2: true },
      { type: "text", name: "openCmd", label: "打开会话命令（embed 方式）", value: cs.openCmd, hint: "如 chatwootWidget.show，留空则点击后仅注入脚本", span2: true },
      { type: "text", name: "name", label: "按钮名称", value: cs.name, hint: "悬停提示标题，留空使用默认「在线客服」" },
      { type: "text", name: "status", label: "状态文案", value: cs.status, hint: "悬停提示副文案，如 24 小时在线" },
      { type: "url", name: "icon", label: "自定义图标地址", value: cs.icon, hint: "留空使用内置耳麦图标（建议 96×96 PNG/SVG）", span2: true },
      { type: "select", name: "pos", label: "按钮位置", value: cs.pos, options: [
        { v: "right-bottom", l: "右下角" },
        { v: "right-center", l: "右侧居中" },
        { v: "left-bottom", l: "左下角" },
        { v: "left-center", l: "左侧居中" }
      ] },
      { type: "select", name: "size", label: "按钮尺寸", value: cs.size, options: [
        { v: "sm", l: "小（46px）" },
        { v: "md", l: "中（56px，推荐）" },
        { v: "lg", l: "大（66px）" }
      ] }
    ];
    openModal({
      title: "客服配置", sub: "右下角 24 小时在线客服 · 第三方系统对接", wide: true,
      fields: fields, fieldMeta: fields.reduce(function (m, f) { m[f.name] = f; return m; }, {}),
      body: buildForm(fields, "cols-2"), foot: footStandard(),
      onsubmit: function (d) {
        cs.enabled = !!d.enabled; cs.name = d.name; cs.status = d.status;
        cs.mode = d.mode; cs.link = d.link; cs.embedScript = d.embedScript; cs.openCmd = d.openCmd;
        cs.icon = d.icon; cs.pos = d.pos; cs.size = d.size;
        persist(); log("edit", "settings", "客服"); toast("已保存客服配置");
      }
    });
  }

  function footStandard() {
    return '<div class="foot-actions"><button type="button" class="btn btn-outline" data-foot="cancel">取消</button><button type="button" class="btn btn-primary" data-foot="submit">保存</button></div>';
  }

  /* ---------- 账号与角色：表单 ---------- */
  var ROLE_OPTS = [
    { v: "primary", l: "主账号（全部权限，仅一个）" },
    { v: "editor", l: "内容编辑" },
    { v: "operator", l: "运营专员" },
    { v: "support", l: "技术支持" },
    { v: "other", l: "自定义角色" }
  ];
  var STATUS_OPTS = [
    { v: "active", l: "正常" },
    { v: "locked", l: "已停用" }
  ];
  var EMPTY_PERMS = function () {
    var p = {}; PERM_MODULES.forEach(function (c) { p[c.key] = 0; }); return p;
  };
  function accountFields(a, isCreate) {
    var role = a ? a.role : "editor";
    var status = a ? a.status : "active";
    return [
      { type: "text", name: "name", label: "角色 / 姓名", required: true, span2: true, value: a ? a.name : "", placeholder: "如：内容编辑 / 张三", hint: "主账号通常填「超级管理员」，子账号可填姓名或岗位" },
      { type: "text", name: "login", label: "登录账号", required: true, value: a ? a.login : "", placeholder: "用于登录后台的账号，如 editor" },
      { type: "url", name: "email", label: "联系邮箱", value: a ? a.email : "", placeholder: "name@shengwei.tech" },
      { type: "select", name: "role", label: "账号角色", required: true, value: role, options: ROLE_OPTS, hint: role === "primary" ? "主账号自动拥有全部功能权限" : "子账号权限由下方功能权限矩阵决定" },
      { type: "select", name: "status", label: "账号状态", value: status, options: STATUS_OPTS, hint: "停用后该子账号无法登录后台" },
      { type: "perms", name: "perms", label: "功能权限", value: a ? permValue(a.role, a.perms) : "custom", columns: PERM_MODULES, required: true, hint: (role === "primary" || (a && a.role === "primary")) ? "主账号固定拥有全部功能权限，不可修改" : "勾选该账号可访问的后台模块；概览为所有账号默认可见" },
      { type: "textarea", name: "note", label: "备注", rows: 2, span2: true, value: a ? a.note : "", placeholder: "如：负责内容中心与新闻中心的撰写发布" }
    ];
  }
  function collectAccount(d) {
    var role = d.role;
    var perms;
    if (role === "primary") { perms = {}; PERM_MODULES.forEach(function (c) { perms[c.key] = 1; }); }
    else {
      perms = EMPTY_PERMS();
      (d.perms && typeof d.perms === "object") ? Object.keys(d.perms).forEach(function (k) { perms[k] = d.perms[k] ? 1 : 0; }) : null;
      perms.overview = 1;
    }
    return { name: d.name, login: d.login, email: d.email, role: role, status: d.status, perms: perms, note: d.note, isOwner: role === "primary" };
  }
  FORM_BUILDERS.accounts = {
    create: function () {
      var a = { name: "", login: "", email: "", role: "editor", status: "active", note: "", perms: EMPTY_PERMS() };
      openModal({
        title: "新增账号", sub: "为主账号创建一个子账号，并分配功能权限", wide: true,
        fields: accountFields(a, true),
        fieldMeta: accountFields(a, true).reduce(function (m, f) { m[f.name] = f; return m; }, {}),
        body: buildForm(accountFields(a, true), "cols-2"), foot: footStandard(),
        onsubmit: function (d) {
          var acc = collectAccount(d);
          var dup = db.accounts.some(function (x) { return x.login && x.login.toLowerCase() === acc.login.toLowerCase(); });
          if (dup) { toast("登录账号「" + acc.login + "」已存在", "error"); return false; }
          acc.id = "usr-" + Math.random().toString(36).slice(2, 9);
          acc.sort = nextSort(db.accounts);
          db.accounts.push(acc);
          persist(); log("create", "accounts", acc.name); toast("已新增账号：" + acc.name);
        }
      });
    },
    edit: function (id) {
      var a = byId(db.accounts, id);
      if (!a) return;
      openModal({
        title: "编辑账号", sub: a.name + (a.login ? " · " + a.login : ""), wide: true,
        fields: accountFields(a, false),
        fieldMeta: accountFields(a, false).reduce(function (m, f) { m[f.name] = f; return m; }, {}),
        body: buildForm(accountFields(a, false), "cols-2"), foot: footStandard(),
        onsubmit: function (d) {
          var acc = collectAccount(d);
          var dup = db.accounts.some(function (x) { return x.id !== a.id && x.login && x.login.toLowerCase() === acc.login.toLowerCase(); });
          if (dup) { toast("登录账号「" + acc.login + "」已被其他账号使用", "error"); return false; }
          if (a.role !== "primary" && acc.role === "primary") {
            db.accounts.forEach(function (x) { if (x.id !== a.id && x.role === "primary") { x.role = "other"; x.isOwner = false; x.perms = EMPTY_PERMS(); } });
          }
          if (a.role === "primary" && acc.role !== "primary") {
            var others = db.accounts.filter(function (x) { return x.id !== a.id && x.role === "primary"; });
            toast(others.length ? "已降级，存在其他主账号" : "系统中暂时无主账号，请重新指定", others.length ? "info" : "error");
          }
          a.name = acc.name; a.login = acc.login; a.email = acc.email; a.role = acc.role;
          a.status = acc.status; a.perms = acc.perms; a.note = acc.note; a.isOwner = acc.isOwner;
          persist(); log("edit", "accounts", a.name); toast("已保存：" + a.name);
        }
      });
    }
  };

  /* ---------------- 分类标签 ---------------- */
  function catLabel(key) {
    var m = { tech: "技术解析", onboard: "接入指南", ops: "运营策略", insight: "行业洞察", product: "产品动态", industry: "行业观察" };
    return m[key] || key;
  }

  /* ============================================================
     模块视图渲染
     ============================================================ */
  var MODULES = {
    overview: { title: "概览", sub: "" },
    home: { title: "首页", sub: "首页 · Hero / 数据 / 产品线 / 优势 / 流程 / 证言" },
    about: { title: "关于我们", sub: "关于我们 · 简介 / 发展历程 / 核心能力 / 企业文化" },
    services: { title: "核心服务", sub: "核心服务 · 五大服务能力" },
    platforms: { title: "产品演示", sub: "产品演示 · 演示平台 / 会员 / 管理入口与试玩账号" },
    articles: { title: "内容中心", sub: "内容中心 · 技术解析 / 接入指南 / 运营策略 / 行业洞察" },
    news: { title: "新闻中心", sub: "新闻中心 · 产品动态 / 行业观察" },
    contact: { title: "联系我们", sub: "联系我们 · 商务信息与常见问题" },
    accounts: { title: "账号与角色", sub: "账号与角色 · 主账号 / 子账号与功能权限" },
    settings: { title: "全局设置", sub: "" }
  };

  /* 权限矩阵列（与后台导航一一对应） */
  var PERM_MODULES = [
    { key: "overview", l: "概览" },
    { key: "home", l: "首页" },
    { key: "about", l: "关于我们" },
    { key: "services", l: "核心服务" },
    { key: "platforms", l: "产品演示" },
    { key: "articles", l: "内容中心" },
    { key: "news", l: "新闻中心" },
    { key: "contact", l: "联系我们" },
    { key: "settings", l: "全局设置" },
    { key: "accounts", l: "账号与角色" }
  ];
  function permValue(role, perms) { return role === "primary" ? "all" : (perms || {}); }
  function permCount(perms) {
    var n = 0;
    (PERM_MODULES || []).forEach(function (c) { if (perms && perms[c.key]) n++; });
    return n;
  }
  function roleLabel(role) {
    return { primary: "主账号", editor: "内容编辑", operator: "运营专员", support: "技术支持", other: "自定义" }[role] || role || "自定义";
  }
  function permDots(perms, all) {
    var n = all ? PERM_MODULES.length : permCount(perms);
    var html = '<span class="perm-dots" aria-hidden="true">';
    PERM_MODULES.forEach(function (c) {
      var on = all || (perms && perms[c.key]);
      html += '<i' + (on ? ' class="on"' : "") + '></i>';
    });
    html += '</span>';
    return html + '<span class="cell-sub" style="margin-top:4px">' + (all ? "全部 " + PERM_MODULES.length + " 项" : (n + " / " + PERM_MODULES.length + " 项")) + "</span>";
  }

  function render() {
    // 高亮导航
    $all(".nav-item", sidebar).forEach(function (n) { n.classList.toggle("active", n.getAttribute("data-module") === current); });
    updateCounts();
    var html = (VIEW[current] || VIEW.overview)();
    view.innerHTML = html;
    var dragMod = { platforms: "platforms", articles: "articles", news: "news", services: "services", about: "about", home: "home", contact: "contact", accounts: "accounts" }[current];
    if (dragMod && $all("[data-drag]", view).length) initDrag(dragMod);
    bindTrendHover();
    closeMobileNav();
  }

  /* ---------------- 访问趋势：悬停十字线 + 数据提示 ---------------- */
  function bindTrendHover() {
    var chart = view.querySelector("[data-trend-chart]");
    if (!chart) return;
    var svg = chart.querySelector(".trend-svg");
    var layer = chart.querySelector(".trend-hover");
    var guide = chart.querySelector(".trend-guide");
    var tip = chart.querySelector(".trend-tip");
    var hdot = chart.querySelector(".trend-dot");
    var dot = chart.querySelector(".trend-end-dot");
    if (!svg || !layer || !guide || !tip) return;
    var pts;
    try { pts = JSON.parse(chart.getAttribute("data-points") || "[]"); } catch (e) { return; }
    if (!pts.length) return;
    var maxV = 1;
    for (var mi = 0; mi < pts.length; mi++) if (pts[mi].v > maxV) maxV = pts[mi].v;
    function fnum(s) { return String(s).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
    function showAt(clientX) {
      var r = svg.getBoundingClientRect();
      if (!r.width) return;
      var f = Math.min(Math.max((clientX - r.left) / r.width, 0), 1);
      var idx = Math.min(Math.round(f * 29), 29);
      var p = pts[idx];
      if (!p) return;
      // 吸附到最近的数据点：与 SVG 生成器同一坐标公式（viewBox 100×44）换算到像素
      var px = (1 + (idx / 29) * (100 - 2)) / 100 * r.width;
      var py = (3 + (1 - p.v / maxV) * (44 - 6)) / 44 * r.height;
      // 提示卡只显示两行：日期 / 访客数
      var html = '<span class="trend-tip-row"><i class="trend-swatch cur"></i>日期<b>' + esc(p.date) + "</b></span>" +
        '<span class="trend-tip-row"><i class="trend-swatch cur"></i>访客数<b>' + fnum(p.v) + "</b></span>";
      tip.innerHTML = html;
      guide.style.left = px + "px";
      guide.style.display = "block";
      tip.style.display = "block";
      if (hdot) { hdot.style.left = px + "px"; hdot.style.top = py + "px"; hdot.style.display = "block"; }
      // 水平：贴左侧或右侧（不溢出图表区）；垂直：始终在上半区
      var left = px + 14;
      if (left + tip.offsetWidth > r.width - 4) left = px - 14 - tip.offsetWidth;
      if (left < 4) left = 4;
      var top = 6;
      if (top + tip.offsetHeight > r.height - 4) top = r.height - tip.offsetHeight - 4;
      if (top < 4) top = 4;
      tip.style.left = left + "px";
      tip.style.top = top + "px";
    }
    function hide() {
      guide.style.display = "none";
      tip.style.display = "none";
      if (hdot) hdot.style.display = "none";
    }
    layer.addEventListener("mousemove", function (e) {
      if (dot) dot.style.display = "none";
      showAt(e.clientX);
    });
    layer.addEventListener("mouseleave", function () {
      hide();
      if (dot) dot.style.display = "";
    });
  }

  var VIEW = {};

  /* ---------- 概览 ---------- */
  VIEW.overview = function () {
    var c = {
      platforms: db.platforms.length,
      articles: db.articles.length,
      news: db.news.length,
      services: db.services.length,
      faq: db.contact.faq.length,
      timelines: db.about.timeline.length,
      products: db.home.products.length,
      advantages: db.home.advantages.length,
      stats: db.home.stats.length,
      process: db.home.process.length,
      testimonials: db.home.testimonials.length
    };
    var livePlat = db.platforms.filter(function (p) { return p.status === "live"; }).length;
    var soonPlat = db.platforms.length - livePlat;
    var featured = db.articles.filter(function (a) { return a.featured; }).length;
    /* 顶部指标卡的次级数据：全部来自真实内容库 / 演示统计，非硬编码 */
    var now = new Date();
    function dstr(offset) {
      function p(n) { return (n < 10 ? "0" : "") + n; }
      var d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
      return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
    }
    function withinDays(items, n) {
      var cut = dstr(-n);
      return items.filter(function (x) { return x.date >= cut; }).length;
    }
    var art30d = withinDays(db.articles, 30);
    var artCats = {};
    db.articles.forEach(function (a) { artCats[a.category] = (artCats[a.category] || 0) + 1; });
    var artCatNames = { tech: "技术", onboard: "入门", ops: "运营", insight: "洞察" };
    var artCatTxt = Object.keys(artCats).map(function (k) { return (artCatNames[k] || k) + " " + artCats[k]; }).join(" · ");
    var plat30d = withinDays(db.platforms, 30);
    var newsTop = {};
    db.news.forEach(function (x) { newsTop[x.category] = (newsTop[x.category] || 0) + 1; });
    var newsCatNames = { product: "产品", industry: "行业", company: "公司" };
    var newsCatTxt = Object.keys(newsTop).map(function (k) { return (newsCatNames[k] || k) + " " + newsTop[k]; }).join(" · ");
    function fmtFull(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }

    /* 顶部指标卡次级行：内容库真实计数 + 演示统计值（标注于副标题/口径说明） */

    function statCard(mod, ico, label, num, foot, subs) {
      var subHtml = "";
      if (subs && subs.length) {
        subHtml = '<div class="stat-sub">' + subs.map(function (s) {
          return '<div class="stat-cell"><span class="stat-cell-k">' + s.k + '</span><span class="stat-cell-v">' + s.v + "</span></div>";
        }).join("") + "</div>";
      }
      return '<div class="stat-card" data-act="open" data-mod="' + mod + '" role="button" tabindex="0">' +
        '<div class="stat-top"><span class="stat-label">' + esc(label) + '</span><span class="stat-ico">' + ico + "</span></div>" +
        '<div class="stat-main"><div class="stat-num">' + num + "</div>" +
        (foot ? '<div class="stat-foot">' + foot + "</div>" : "") + "</div>" +
        subHtml + "</div>";
    }

    /* —— 访客统计（演示数据，未接入真实统计服务） —— */
    var base = 2600;
    var seedN = 13734;
    function mulberry(seed) {
      return function () {
        seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
        var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }
    var ANA = (function () {
      var R = mulberry(seedN);
      function wob(v, amp, f1, f2, f3) { return Math.round(v * (1 + amp * Math.sin(f1) + amp * 0.6 * Math.sin(f2 + 1.3) + amp * 0.35 * Math.sin(f3 + 0.5))); }
      var trend = [];
      for (var i = 29; i >= 0; i--) {
        var t = (29 - i) / 29;
        trend.push({ date: dstr(-i), v: wob(base * (0.7 + 0.45 * t), 0.11, (29 - i) * 0.42, (29 - i) * 0.95, (29 - i) * 2.7) });
      }
      var last7 = 0;
      for (i = 23; i < 30; i++) last7 += trend[i].v;
      var prev7 = 0;
      for (i = 16; i < 23; i++) prev7 += trend[i].v;
      /* 访问渠道：优先读前台 script.js 第 16 节的实测埋点（同源 localStorage sw_visitor_log），
         近 7 天有实测数据时展示真实值（d 为相对昨日变化）；否则回退演示占比。
         实测口径与前台埋点一致，只统计 referrer 可判定的 4 类：
         搜索引擎 / 社交媒体 / 外站引流 / 直接访问。
         （Telegram / 微信等 App 内网页通常不带 referrer，会归入「直接访问」。） */
      var CH_META = [
        { k: "search", label: "搜索引擎", d: 0 },
        { k: "social", label: "社交媒体", d: 0 },
        { k: "external", label: "外站引流", d: 0 },
        { k: "direct", label: "直接访问", d: 0 }
      ];
      var chDemo = [
        { label: "搜索引擎", v: Math.round(last7 * 0.38), d: 8.2 },
        { label: "社交媒体", v: Math.round(last7 * 0.18), d: 12.4 },
        { label: "外站引流", v: Math.round(last7 * 0.15), d: -2.1 },
        { label: "直接访问", v: last7 - Math.round(last7 * 0.38) - Math.round(last7 * 0.18) - Math.round(last7 * 0.15), d: 3.6 }
      ];
      var d7 = chDemo;
      var channelsReal = false;
      try {
        var _vl = JSON.parse(localStorage.getItem("sw_visitor_log") || "");
        if (_vl && _vl.days) {
          function _chSum(r0, r1) {
            var agg = { search: 0, social: 0, external: 0, direct: 0 };
            for (var i = r0; i < r1; i++) {
              var rec = _vl.days[dstr(-i)];
              if (rec && rec.ch) {
                for (var k in rec.ch) { if (agg[k] !== undefined) agg[k] += rec.ch[k]; }
              }
            }
            return agg;
          }
          var cA = _chSum(0, 7), cB = _chSum(1, 8);
          var _cTotal = 0;
          for (var _ci = 0; _ci < 4; _ci++) _cTotal += cA[CH_META[_ci].k];
          if (_cTotal > 0) {
            channelsReal = true;
            d7 = CH_META.map(function (m) {
              var v = cA[m.k], y = cB[m.k];
              var d = y > 0 ? Math.round((v - y) / y * 1000) / 10 : 0;
              return { label: m.label, v: v, d: d };
            });
          }
        }
      } catch (e) { /* 无实测数据 → 保持演示占比 */ }
      var os = [
        { label: "Windows", v: Math.round(last7 * 0.33), d: 1.5 },
        { label: "macOS", v: last7 - Math.round(last7 * 0.33) - Math.round(last7 * 0.28) - Math.round(last7 * 0.27), d: -1.2 },
        { label: "Android", v: Math.round(last7 * 0.27), d: 5.6 },
        { label: "iOS", v: Math.round(last7 * 0.28), d: 4.2 }
      ];
      var pages = [
        { label: "产品演示", v: Math.round(last7 * 0.31), d: 6.1 },
        { label: "内容中心", v: Math.round(last7 * 0.24), d: 9.7 },
        { label: "首页", v: Math.round(last7 * 0.22), d: 2.3 },
        { label: "核心服务", v: Math.round(last7 * 0.13), d: 4.5 },
        { label: "新闻中心", v: Math.round(last7 * 0.09), d: -3.2 },
        { label: "联系我们", v: last7 - Math.round(last7 * 0.31) - Math.round(last7 * 0.24) - Math.round(last7 * 0.22) - Math.round(last7 * 0.13) - Math.round(last7 * 0.09), d: 1.1 }
      ];
      var regions = [
        { label: "东南亚", v: Math.round(last7 * 0.27) + Math.round(last7 * 0.15), d: 4.5 },
        { label: "欧洲", v: Math.round(last7 * 0.22), d: 5.1 },
        { label: "北美洲", v: Math.round(last7 * 0.19), d: 1.8 },
        { label: "大洋洲", v: Math.round(last7 * 0.08), d: -0.7 },
        { label: "其他区域", v: last7 - Math.round(last7 * 0.27) - Math.round(last7 * 0.15) - Math.round(last7 * 0.22) - Math.round(last7 * 0.19) - Math.round(last7 * 0.08), d: 0.5 }
      ];
      var chTotal = 0;
      for (var _ti = 0; _ti < d7.length; _ti++) chTotal += d7[_ti].v;
      return {
        trend: trend, last7: last7, prev7: prev7,
        bounce: 38.6, bounceDelta: -2.4,
        duration: 342, returnRate: 31.2, returnDelta: 1.8,
        newShare: Math.round(last7 * 0.54),
        convView: Math.round(last7 * 0.18), convBook: Math.round(last7 * 0.062), convCs: Math.round(last7 * 0.038),
        channels: d7, channelsReal: channelsReal, channelsTotal: chTotal, os: os,
        pages: pages, regions: regions
      };
    })();

    var CHART = ["var(--accent)", "oklch(72% 0.13 75)", "oklch(68% 0.12 200)", "oklch(76% 0.14 155)", "oklch(70% 0.10 320)", "oklch(64% 0.012 260)"];
    function deltaHtml(delta) {
      if (delta === undefined) return "";
      var up = delta >= 0;
      return '<i class="hb-delta ' + (up ? "up" : "down") + '">' + (up ? "+" : "") + delta + "%</i>";
    }
    /* 占比型数据 → 环形图（中心总量 + 右侧图例明细） */
    function donutChart(items, centerTop, centerSub) {
      var total = 0;
      for (var t = 0; t < items.length; t++) total += items[t].v;
      total = Math.max(total, 1);
      var C = 2 * Math.PI * 40;
      var acc = 0, seg = "", legs = "";
      for (var i = 0; i < items.length; i++) {
        var f = items[i].v / total;
        var len = f * C, off = -acc * C;
        if (f > 0.004) {
          seg += '<circle r="40" cx="50" cy="50" fill="none" stroke-width="13" style="stroke:' + items[i].c + '" stroke-dasharray="' + Math.max(len - 2.5, 1).toFixed(1) + " " + (C - len + 2.5).toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '"/>';
        }
        acc += f;
        legs += '<div class="lg-row"><span class="lg-dot" style="background:' + items[i].c + '"></span><span class="lg-label">' + items[i].label + '</span><span class="lg-nums"><b>' + fmtFull(items[i].v) + '</b><span class="lg-pct">' + (f * 100).toFixed(1) + "%</span>" + deltaHtml(items[i].d) + "</span></div>";
      }
      return '<div class="donut-wrap"><div class="donut">' +
        '<svg viewBox="0 0 100 100" role="img" aria-label="' + items.map(function (x) { return x.label; }).join(" / ") + ' 占比分布">' +
        '<circle r="40" cx="50" cy="50" fill="none" stroke-width="13" style="stroke:var(--surface-2)"/>' + seg +
        '<text x="50" y="48" text-anchor="middle" class="donut-c-num">' + centerTop + '</text><text x="50" y="59" text-anchor="middle" class="donut-c-sub">' + centerSub + "</text></svg>" +
        '</div><div class="lg-list">' + legs + "</div></div>";
    }
    /* 类目对比型数据 → 垂直柱状图（全部金色） */
    function barChart(items) {
      var maxV = Math.max.apply(null, items.map(function (x) { return x.v; }).concat([1]));
      var cols = "", labs = "", grid = "";
      for (var g = 1; g <= 3; g++) grid += '<i style="bottom:calc(18px + (100% - 38px) * ' + (g / 4) + ')"></i>';
      for (var i = 0; i < items.length; i++) {
        var h = Math.max(Math.round((items[i].v / maxV) * 100), 4);
        var valTxt = (items[i].v >= 10000 ? Math.round(items[i].v / 1000 * 10) / 10 + "k" : items[i].v);
        cols += '<div class="vbar-col"><div class="vbar-track"><div class="vbar-fill" style="height:' + h + '%"></div><span class="vbar-val" style="bottom:calc(' + h + '% + 3px)">' + valTxt + '</span></div></div>';
        labs += '<span class="vbar-lab" title="' + items[i].label + '">' + items[i].short + "</span>";
      }
      return '<div class="vbar-chart">' + grid + '<div class="vbar-cols">' + cols + '</div><div class="vbar-x">' + labs + "</div></div>";
          }
    function anaCard(ico, title, sub, body) {
          return '<div class="card ana-card" data-od-id="' + title + '"><div class="card-head"><span class="ana-ico">' + ico + '</span><h3>' + title + '</h3><span class="card-sub">' + sub + '</span></div><div class="card-pad">' + body + '</div></div>';
        }
    /* 趋势：本周（面积+实线）+ 上周（虚线），按真实日期槽位对齐 */
    var trendW = 100, trendH = 44;
    var maxV = Math.max.apply(null, ANA.trend.map(function (q) { return q.v; }));
    function tPtsAt(series, off) {
      return series.map(function (p, i) {
        var x = 1 + ((off + i) / 29) * (trendW - 2);
        var y = 3 + (1 - p.v / maxV) * (trendH - 6);
        return x.toFixed(1) + "," + y.toFixed(1);
      }).join(" ");
    }
    var pts = tPtsAt(ANA.trend, 0);
    var prevPts = tPtsAt(ANA.trend.slice(16, 23), 16);
    var lastPt = pts.split(" ").pop().split(",");
    var gridLines = [0.25, 0.5, 0.75].map(function (f) {
      var y = (3 + f * (trendH - 6)).toFixed(1);
      return '<line x1="0" y1="' + y + '" x2="' + trendW + '" y2="' + y + '" style="stroke:var(--border)" stroke-width="1" vector-effect="non-scaling-stroke" opacity="0.55"/>';
    }).join("");
    var conv = [
      { label: "进入产品演示", v: ANA.convView, d: 4.8, pct: 100 },
      { label: "发起预约演示", v: ANA.convBook, d: 6.2, pct: Math.round(ANA.convBook / ANA.convView * 100) },
      { label: "发起客服会话", v: ANA.convCs, d: 3.1, pct: Math.round(ANA.convCs / ANA.convView * 100) }
    ];
    var convHtml = conv.map(function (s) {
      return '<div class="conv-stage"><div class="conv-head"><span>' + s.label + '</span><span class="hb-nums"><b>' + fmtFull(s.v) + '</b><i class="hb-delta up">+' + s.d + "%</i></span></div>" +
        '<div class="hb-bar"><div class="hb-fill" style="width:' + s.pct + '%"></div></div><span class="conv-sub">' + s.pct + '% 的访客（较上周）</span></div>';
    }).join("");

    var actParts = {
      create: "新增", edit: "编辑", delete: "删除", reorder: "排序"
    };
    var actHtml = db.activity.slice(0, 6).map(function (a) {
      var ico = a.type === "create" ? IC.plus : (a.type === "delete" ? IC.trash : IC.edit);
      var cls = a.type;
      var modName = (MODULES[a.module] && MODULES[a.module].title) ||
        (SUB_LIST_TOP[a.module] && MODULES[SUB_LIST_TOP[a.module]] && MODULES[SUB_LIST_TOP[a.module]].title) || a.module;
      var name = actParts[a.type] || "操作";
      if (a.label && a.label !== a.module) name += " · " + a.label;
      else name += " · " + modName;
      return '<div class="activity-item"><span class="activity-ico ' + cls + '">' + ico + "</span>" +
        "<span><span class=\"activity-text\">" + esc(name) + "</span><span class=\"activity-time\">" + esc(a.date) + " " + esc(a.time) + "</span></span></div>";
    }).join("") || '<div class="activity-item"><span class="activity-text" style="color:var(--muted)">暂无操作记录。增删改内容后会在此显示。</span></div>';

    return "" +
      '<div class="stats-grid" data-od-id="ov-stats">' +
      statCard("platforms", IC.box, "演示平台", c.platforms, "<b>" + livePlat + "</b> 已上线 · " + soonPlat + " 即将上线", [
        { k: "近 30 天上线", v: String(plat30d) },
        { k: "近 7 天访客", v: fmtFull(ANA.pages.filter(function (p) { return p.label === "产品演示"; })[0].v) },
        { k: "区域覆盖", v: "东南亚 / 欧美" }
      ]) +
      statCard("articles", IC.doc, "内容文章", c.articles, featured + " 篇头条", [
        { k: "近 30 天上线", v: String(art30d) },
        { k: "最新发布", v: db.articles.length ? db.articles[0].date : "—" },
        { k: "栏目分布", v: artCatTxt || "暂无" }
      ]) +
      statCard("news", IC.press, "新闻", c.news, "产品 / 行业 / 公司动态", [
        { k: "近 30 天上线", v: String(withinDays(db.news, 30)) },
        { k: "最新发布", v: db.news.length ? db.news[0].date : "—" },
        { k: "栏目分布", v: newsCatTxt || "暂无" }
      ]) +
      "</div>" +
      '<section class="ana-sec" data-od-id="ov-ana">' +
      '<div class="ana-head"><h2>访客统计</h2><span class="card-sub">访问渠道来自前台埋点实测，其余为演示数据</span></div>' +
      '<div class="ana-grid">' +
      '<div class="card" data-od-id="ana-trend">' +
      '<div class="card-head"><h3>访问趋势</h3><span class="card-sub">近 30 天每日访客</span></div>' +
      '<div class="card-pad trend-pad">' +
      '<div class="trend-kpi"><div class="trend-kpi-num">' + fmtFull(ANA.last7) + '</div><div class="trend-kpi-label">近 7 天访客</div><span class="trend-delta up">+' + (Math.round((ANA.last7 - ANA.prev7) / ANA.prev7 * 1000) / 10).toFixed(1) + "% 较上周</span></div>" +
      '<div class="trend-chart" data-trend-chart="1" data-points="' + esc(JSON.stringify(ANA.trend)) + '">' +
      '<svg class="trend-svg" viewBox="0 0 ' + trendW + " " + trendH + '" preserveAspectRatio="none" aria-hidden="true">' +
      gridLines +
      '<polygon points="' + pts + " " + trendW + "," + trendH + " 0," + trendH + '" style="fill:var(--accent-soft)"/>' +
      '<polyline points="' + prevPts + '" fill="none" stroke-width="1" stroke-linejoin="round" vector-effect="non-scaling-stroke" stroke-dasharray="3 3" style="stroke:var(--muted)"/>' +
      '<polyline points="' + pts + '" fill="none" stroke-width="1.4" stroke-linejoin="round" vector-effect="non-scaling-stroke" style="stroke:var(--accent)"/>' +
      '<ellipse class="trend-end-dot" cx="' + lastPt[0] + '" cy="' + lastPt[1] + '" rx="0.6" ry="0.6" style="fill:var(--accent);stroke:var(--surface)" vector-effect="non-scaling-stroke" stroke-width="1"/>' +
      "</svg>" +
      '<div class="trend-hover" data-trend-hover="1"><div class="trend-guide"></div><span class="trend-dot"></span><span class="trend-tip"></span></div>' +
      '<div class="trend-x"><span>' + ANA.trend[0].date + "</span><span>近 30 天</span><span>" + ANA.trend[29].date + "</span></div>" +
      "</div></div></div>" +
      '<div class="card ov-fill" data-od-id="ov-activity"><div class="card-head"><h3>最近操作</h3><span class="card-sub">演示环境记录</span></div><div class="card-pad"><div class="activity-list">' + actHtml + "</div></div></div>" +
      '</div>' +
      '<div class="overview-grid">' +
      anaCard(IC.eye, "核心指标", "本周 vs 上周",
        '<div class="kpi-grid">' +
        '<div class="kpi"><div class="kpi-label">平均停留时长</div><div class="kpi-num">5<span class="kpi-unit">分 42秒</span></div><span class="kpi-foot trend-delta up">+0:12 较上周</span></div>' +
        '<div class="kpi"><div class="kpi-label">跳出率</div><div class="kpi-num">' + ANA.bounce.toFixed(1) + '<span class="kpi-unit">%</span></div><span class="kpi-foot trend-delta down">-' + ANA.bounceDelta.toFixed(1) + "% 较上周</span></div>" +
        '<div class="kpi"><div class="kpi-label">回访率</div><div class="kpi-num">' + ANA.returnRate.toFixed(1) + '<span class="kpi-unit">%</span></div><span class="kpi-foot trend-delta up">+' + ANA.returnDelta.toFixed(1) + "% 较上周</span></div>" +
        '<div class="kpi"><div class="kpi-label">新访客占比</div><div class="kpi-num">' + Math.round(ANA.newShare / ANA.last7 * 100) + '<span class="kpi-unit">%</span></div><span class="kpi-foot">' + fmtFull(ANA.newShare) + " 人（近 7 天）</span></div>" +
        '</div>') +
      anaCard(IC.bounce, "转化路径", "演示引导漏斗（近 7 天）", convHtml) +
      anaCard(IC.box, "热门页面", "近 7 天 · 页面访问对比", barChart(ANA.pages.map(function (x) { return { label: x.label, short: x.label.slice(0, 2), v: x.v }; }))) +
      "</div>" +
      '<div class="ana-grid ana-grid-2">' +
      anaCard(IC.eye, "访问渠道", (ANA.channelsReal ? "近 7 天 · 实测（前台埋点）" : "近 7 天 · 来源占比（演示）"), donutChart(ANA.channels.map(function (x, i) { return { label: x.label, v: x.v, d: x.d, c: CHART[i % CHART.length] }; }), fmtFull(ANA.channelsTotal), (ANA.channelsReal ? "近 7 天实测访问" : "近 7 天访客"))) +
      anaCard(IC.doc, "操作系统", "近 7 天 · 系统类别", donutChart(ANA.os.map(function (x, i) { return { label: x.label, v: x.v, d: x.d, c: CHART[i % CHART.length] }; }), fmtFull(ANA.last7), "系统访问")) +
      anaCard(IC.clock, "地域分布", "近 7 天 · 大洲占比", donutChart(ANA.regions.map(function (x, i) { return { label: x.label, v: x.v, d: x.d, c: CHART[i % CHART.length] }; }), fmtFull(ANA.last7), "覆盖访客")) +
      "</div>" +
      "</section>";
  };
  /* ---------- 平台 ---------- */
  VIEW.platforms = function () {
    var list = sorted(db.platforms.slice());
    var rows = list.map(function (p, i) {
      var acc = (p.accounts && p.accounts.length) ? p.accounts.length + " 组账号" : "—";
      return '<tr data-drag="' + p.id + '">' +
        '<td><span class="drag-handle" title="拖拽排序">' + IC.grip + "</span></td>" +
        '<td><div class="cell-main">' + esc(p.name) + '</div><div class="cell-sub">' + esc(p.type) + "</div></td>" +
        '<td>' + statusBadge(p.status) + "</td>" +
        '<td>' + domainCell(p.member) + "</td>" +
        '<td><span class="cell-sub" style="font-size:12px">' + esc(acc) + "</span></td>" +
        '<td><div style="max-width:160px;overflow:hidden">' + (p.tags || []).map(function (t) { return '<span class="tag-chip">' + esc(t) + "</span>"; }).join("") + "</div></td>" +
        '<td><div class="row-actions">' +
        '<button type="button" class="icon-btn" data-act="up" data-mod="platforms" data-id="' + p.id + '" ' + (i === 0 ? "disabled" : "") + ' aria-label="上移">' + IC.up + "</button>" +
        '<button type="button" class="icon-btn" data-act="down" data-mod="platforms" data-id="' + p.id + '" ' + (i === list.length - 1 ? "disabled" : "") + ' aria-label="下移">' + IC.down + "</button>" +
        '<button type="button" class="icon-btn" data-act="edit" data-mod="platforms" data-id="' + p.id + '" aria-label="编辑">' + IC.edit + "</button>" +
        '<button type="button" class="icon-btn danger" data-act="delete" data-mod="platforms" data-id="' + p.id + '" aria-label="删除">' + IC.trash + "</button>" +
        "</div></td></tr>";
    }).join("");
    return "" +
      '<div class="page-head"><h1>产品演示</h1><p>演示平台矩阵 · 共 ' + list.length + " 个平台，拖动把手或使用箭头调整前台展示顺序。</p></div>" +
      '<div class="page-toolbar"><button type="button" class="btn btn-primary" data-add="platforms">' + IC.plus + " 新增平台</button>" +
      '<span class="spacer"></span><span class="card-sub" style="font-size:12.5px;color:var(--muted)">已上线 ' + db.platforms.filter(function (p) { return p.status === "live"; }).length + " · 即将上线 " + db.platforms.filter(function (p) { return p.status === "soon"; }).length + "</span></div>" +
      '<div class="card" data-od-id="platforms-table"><div class="table-wrap"><table class="data"><thead><tr>' +
      "<th style='width:40px'></th><th>平台</th><th>状态</th><th>会员入口</th><th>试玩账号</th><th>标签</th><th style='width:150px;text-align:right'>操作</th>" +
      "</tr></thead><tbody>" + (rows || emptyRow(7)) + "</tbody></table></div></div>";
  };

  /* ---------- 文章 ---------- */
  VIEW.articles = function () {
    var list = sorted(db.articles.slice());
    var rows = list.map(function (a, i) {
      return '<tr data-drag="' + a.id + '">' +
        '<td><span class="drag-handle">' + IC.grip + "</span></td>" +
        '<td><div class="cell-main">' + (a.featured ? '<span class="badge badge-gold" style="margin-right:8px">头条</span>' : "") + esc(a.title) + '</div><div class="cell-sub">' + esc(a.lede) + "</div></td>" +
        '<td><span class="badge badge-muted">' + esc(a.catLabel) + "</span></td>" +
        '<td><span class="cell-mono">' + esc(a.date) + "</span></td>" +
        '<td><span class="cell-sub" style="font-size:12px">' + a.readMin + " 分钟</span></td>" +
        '<td><div class="row-actions">' +
        '<button type="button" class="icon-btn" data-act="up" data-mod="articles" data-id="' + a.id + '" ' + (i === 0 ? "disabled" : "") + ' aria-label="上移">' + IC.up + "</button>" +
        '<button type="button" class="icon-btn" data-act="down" data-mod="articles" data-id="' + a.id + '" ' + (i === list.length - 1 ? "disabled" : "") + ' aria-label="下移">' + IC.down + "</button>" +
        '<button type="button" class="icon-btn" data-act="edit" data-mod="articles" data-id="' + a.id + '" aria-label="编辑">' + IC.edit + "</button>" +
        '<button type="button" class="icon-btn danger" data-act="delete" data-mod="articles" data-id="' + a.id + '" aria-label="删除">' + IC.trash + "</button>" +
        "</div></td></tr>";
    }).join("");
    return "" +
      '<div class="page-head"><h1>内容中心</h1><p>内容中心 · 共 ' + list.length + " 篇文章。头条文章将作为首屏主视觉，其余按顺序进入目录列表。</p></div>" +
      '<div class="page-toolbar"><button type="button" class="btn btn-primary" data-add="articles">' + IC.plus + " 撰写文章</button><span class=\"spacer\"></span><span class=\"card-sub\" style=\"font-size:12.5px;color:var(--muted)\">技术解析 " + countCat("tech") + " · 接入指南 " + countCat("onboard") + " · 运营策略 " + countCat("ops") + " · 行业洞察 " + countCat("insight") + "</span></div>" +
      '<div class="card" data-od-id="articles-table"><div class="table-wrap"><table class="data"><thead><tr>' +
      "<th style='width:40px'></th><th>文章</th><th>分类</th><th>日期</th><th>阅读</th><th style='width:150px;text-align:right'>操作</th></tr></thead><tbody>" + (rows || emptyRow(6)) + "</tbody></table></div></div>";
  };
  function countCat(k) { return db.articles.filter(function (a) { return a.category === k; }).length; }

  /* ---------- 新闻 ---------- */
  VIEW.news = function () {
    var list = sorted(db.news.slice());
    var rows = list.map(function (n, i) {
      return '<tr data-drag="' + n.id + '">' +
        '<td><span class="drag-handle">' + IC.grip + "</span></td>" +
        '<td><div class="cell-main">' + esc(n.title) + '</div><div class="cell-sub">' + esc(n.excerpt) + "</div></td>" +
        '<td><span class="badge ' + (n.category === "product" ? "badge-gold" : "badge-muted") + '">' + esc(n.catLabel) + "</span></td>" +
        '<td><span class="cell-mono">' + esc(n.date) + "</span></td>" +
        '<td><div class="row-actions">' +
        '<button type="button" class="icon-btn" data-act="up" data-mod="news" data-id="' + n.id + '" ' + (i === 0 ? "disabled" : "") + ' aria-label="上移">' + IC.up + "</button>" +
        '<button type="button" class="icon-btn" data-act="down" data-mod="news" data-id="' + n.id + '" ' + (i === list.length - 1 ? "disabled" : "") + ' aria-label="下移">' + IC.down + "</button>" +
        '<button type="button" class="icon-btn" data-act="edit" data-mod="news" data-id="' + n.id + '" aria-label="编辑">' + IC.edit + "</button>" +
        '<button type="button" class="icon-btn danger" data-act="delete" data-mod="news" data-id="' + n.id + '" aria-label="删除">' + IC.trash + "</button>" +
        "</div></td></tr>";
    }).join("");
    return "" +
      '<div class="page-head"><h1>新闻中心</h1><p>新闻中心 · 共 ' + list.length + " 条动态，含产品动态与行业观察。</p></div>" +
      '<div class="page-toolbar"><button type="button" class="btn btn-primary" data-add="news">' + IC.plus + " 发布新闻</button><span class=\"spacer\"></span><span class=\"card-sub\" style=\"font-size:12.5px;color:var(--muted)\">产品动态 " + db.news.filter(function (n) { return n.category === "product"; }).length + " · 行业观察 " + db.news.filter(function (n) { return n.category === "industry"; }).length + "</span></div>" +
      '<div class="card" data-od-id="news-table"><div class="table-wrap"><table class="data"><thead><tr>' +
      "<th style='width:40px'></th><th>新闻</th><th>分类</th><th>日期</th><th style='width:150px;text-align:right'>操作</th></tr></thead><tbody>" + (rows || emptyRow(5)) + "</tbody></table></div></div>";
  };

  /* ---------- 服务 ---------- */
  VIEW.services = function () {
    var list = sorted(db.services.slice());
    var rows = list.map(function (s, i) {
      return '<tr data-drag="' + s.id + '">' +
        '<td><span class="drag-handle">' + IC.grip + "</span></td>" +
        '<td><span class="cell-mono" style="font-size:12px;color:var(--accent)">' + esc(s.index) + "</span></td>" +
        '<td><div class="cell-main">' + esc(s.title) + '</div><div class="cell-sub">' + esc(s.desc) + "</div></td>" +
        '<td><span class="cell-sub" style="font-size:12px">' + (s.features || []).length + " 项能力</span></td>" +
        '<td><span class="badge ' + (s.flip ? "badge-muted" : "badge-gold") + '">' + (s.flip ? "图右文左" : "图左文右") + "</span></td>" +
        '<td><div class="row-actions">' +
        '<button type="button" class="icon-btn" data-act="up" data-mod="services" data-id="' + s.id + '" ' + (i === 0 ? "disabled" : "") + ' aria-label="上移">' + IC.up + "</button>" +
        '<button type="button" class="icon-btn" data-act="down" data-mod="services" data-id="' + s.id + '" ' + (i === list.length - 1 ? "disabled" : "") + ' aria-label="下移">' + IC.down + "</button>" +
        '<button type="button" class="icon-btn" data-act="edit" data-mod="services" data-id="' + s.id + '" aria-label="编辑">' + IC.edit + "</button>" +
        '<button type="button" class="icon-btn danger" data-act="delete" data-mod="services" data-id="' + s.id + '" aria-label="删除">' + IC.trash + "</button>" +
        "</div></td></tr>";
    }).join("");
    return "" +
      '<div class="page-head"><h1>核心服务</h1><p>核心服务 · 共 ' + list.length + " 项能力，前台按顺序交替图文展示。</p></div>" +
      '<div class="page-toolbar"><button type="button" class="btn btn-primary" data-add="services">' + IC.plus + " 新增服务</button><span class=\"spacer\"></span></div>" +
      '<div class="card" data-od-id="services-table"><div class="table-wrap"><table class="data"><thead><tr>' +
      "<th style='width:40px'></th><th style='width:90px'>序号</th><th>服务</th><th>能力</th><th>布局</th><th style='width:150px;text-align:right'>操作</th></tr></thead><tbody>" + (rows || emptyRow(6)) + "</tbody></table></div></div>";
  };

  /* ---------- 关于 ---------- */
  VIEW.about = function () {
    var a = db.about;
    var tl = sorted(a.timeline.slice());
    var caps = sorted(a.capabilities.slice());
    var vals = sorted(a.values.slice());
    function aboutListRows(items, mod, colCount, renderCell) {
      return items.map(function (it, i) {
        return '<tr data-drag="' + it.id + '">' +
          '<td><span class="drag-handle">' + IC.grip + "</span></td>" +
          renderCell(it) +
          '<td><div class="row-actions">' +
          '<button type="button" class="icon-btn" data-act="up" data-mod="' + mod + '" data-id="' + it.id + '" ' + (i === 0 ? "disabled" : "") + ' aria-label="上移">' + IC.up + "</button>" +
          '<button type="button" class="icon-btn" data-act="down" data-mod="' + mod + '" data-id="' + it.id + '" ' + (i === items.length - 1 ? "disabled" : "") + ' aria-label="下移">' + IC.down + "</button>" +
          '<button type="button" class="icon-btn" data-act="edit" data-mod="' + mod + '" data-id="' + it.id + '" aria-label="编辑">' + IC.edit + "</button>" +
          '<button type="button" class="icon-btn danger" data-act="delete" data-mod="' + mod + '" data-id="' + it.id + '" aria-label="删除">' + IC.trash + "</button>" +
          "</div></td></tr>";
      }).join("");
    }
    function deleteFromSub(mod, id) {
      if (mod === "timeline") db.about.timeline = db.about.timeline.filter(function (x) { return x.id !== id; });
      else if (mod === "capabilities") db.about.capabilities = db.about.capabilities.filter(function (x) { return x.id !== id; });
      else if (mod === "values") db.about.values = db.about.values.filter(function (x) { return x.id !== id; });
    }
    // 覆盖子模块删除/移动
    var _actDelete = actDelete;
    actDelete = function (mod, id) {
      if (mod === "timeline" || mod === "capabilities" || mod === "values") {
        var item = byId(db.about[mod], id);
        var label = (item && item.title) || id;
        confirmDialog("删除确认", '<p class="confirm-text">确定删除 <b>' + esc(label) + "</b>？<span class=\"confirm-sub\">前台对应内容将不再展示。</span></p>", function () { deleteFromSub(mod, id); persist(); log("delete", mod, label); toast("已删除：" + label, "info"); render(); }, "确认删除");
        return;
      }
      _actDelete(mod, id);
    };

    return "" +
      '<div class="page-head"><h1>关于我们</h1><p>关于我们 · 公司简介、发展历程、核心能力与企业文化。</p></div>' +
      '<div class="page-toolbar">' +
      '<button type="button" class="btn btn-primary" data-act="edit" data-mod="about" data-id="__intro">' + IC.edit + " 编辑简介与使命</button>" +
      '<span class="spacer"></span></div>' +
      '<div class="form-grid" style="margin-bottom:22px">' +
      '<div class="card card-pad" style="grid-column:1 / -1" data-od-id="about-intro-preview">' +
      '<div class="section-block-title" style="margin-bottom:10px"><h2 style="font-size:14px">公司简介</h2></div>' +
      a.introParas.map(function (p) { return "<p style=\"margin-bottom:10px;color:var(--muted)\">" + esc(p) + "</p>"; }).join("") +
      '<div style="margin-top:14px;padding:14px 16px;background:oklch(15% 0.009 260);border:1px solid var(--border);border-left:3px solid var(--accent);border-radius:8px"><div style="font-size:12px;color:var(--accent);letter-spacing:0.1em;margin-bottom:4px">我们的使命</div><div style="font-size:14px">' + esc(a.mission) + "</div></div>" +
      "</div></div>" +
      subTable("发展历程", "timeline", tl.length,
        "<th style='width:40px'></th><th style='width:90px'>年份</th><th>里程碑</th><th style='width:150px;text-align:right'>操作</th>",
        aboutListRows(tl, "timeline", 4, function (it) { return '<td><span class="cell-mono" style="color:var(--accent);font-size:14px">' + esc(it.year) + '</span></td><td><div class="cell-main">' + esc(it.title) + '</div><div class="cell-sub">' + esc(it.desc) + "</div></td>"; }),
        "timeline", "新增里程碑") +
      subTable("核心能力", "capabilities", caps.length,
        "<th style='width:40px'></th><th>能力</th><th style='width:150px;text-align:right'>操作</th>",
        aboutListRows(caps, "capabilities", 3, function (it) { return '<td><div class="cell-main">' + esc(it.tag) + " · " + esc(it.title) + '</div><div class="cell-sub">' + esc(it.desc) + "</div></td>"; }),
        "capabilities", "新增能力") +
      subTable("企业文化", "values", vals.length,
        "<th style='width:40px'></th><th>价值观</th><th style='width:150px;text-align:right'>操作</th>",
        aboutListRows(vals, "values", 3, function (it) { return '<td><div class="cell-main"><span style="color:var(--accent);font-weight:700;margin-right:10px">' + esc(it.char) + "</span>" + esc(it.title) + '</div><div class="cell-sub">' + esc(it.desc) + "</div></td>"; }),
        "values", "新增价值观");
  };
  function subTable(title, key, count, head, body, mod, addLabel) {
    return '<div class="section-block" data-od-id="about-' + key + '">' +
      '<div class="section-block-title"><h2>' + title + '</h2><span class="section-sub">' + count + " 项</span>" +
      '<div style="margin-left:auto"><button type="button" class="btn btn-outline btn-sm" data-add="' + mod + '">' + IC.plus + " " + addLabel + "</button></div></div>" +
      '<div class="card"><div class="table-wrap"><table class="data"><thead><tr>' + head + "</tr></thead><tbody>" + body + "</tbody></table></div></div></div>";
  }

  /* ---------- 首页 ---------- */
  VIEW.home = function () {
    var h = db.home;
    var stats = sorted(h.stats.slice());
    var products = sorted(h.products.slice());
    var advs = sorted(h.advantages.slice());
    var proc = sorted(h.process.slice());
    var testis = sorted(h.testimonials.slice());
    function rowBlock(title, sub, list, mod, head, cellFn, addLabel, ico) {
      var rows = list.map(function (it, i) {
        return "<tr>" + cellFn(it, i) +
          '<td><div class="row-actions">' +
          '<button type="button" class="icon-btn" data-act="up" data-mod="' + mod + '" data-id="' + it.id + '" ' + (i === 0 ? "disabled" : "") + ' aria-label="上移">' + IC.up + "</button>" +
          '<button type="button" class="icon-btn" data-act="down" data-mod="' + mod + '" data-id="' + it.id + '" ' + (i === list.length - 1 ? "disabled" : "") + ' aria-label="下移">' + IC.down + "</button>" +
          '<button type="button" class="icon-btn" data-act="edit" data-mod="' + mod + '" data-id="' + it.id + '" aria-label="编辑">' + IC.edit + "</button>" +
          '<button type="button" class="icon-btn danger" data-act="delete" data-mod="' + mod + '" data-id="' + it.id + '" aria-label="删除">' + IC.trash + "</button>" +
          "</div></td></tr>";
      }).join("");
      return '<div class="section-block" data-od-id="home-' + mod + '">' +
        '<div class="section-block-title"><h2>' + title + "</h2>" + (sub ? '<span class=\"section-sub\">' + sub + "</span>" : "") +
        '<div style="margin-left:auto"><button type="button" class="btn btn-outline btn-sm" data-add="' + mod + '">' + IC.plus + " " + addLabel + "</button></div></div>" +
        '<div class="card"><div class="table-wrap"><table class="data"><thead><tr>' + head + "</tr></thead><tbody>" + rows + "</tbody></table></div></div></div>";
    }
    var hero = h.hero;
    return "" +
      '<div class="page-head"><h1>首页</h1><p>首页各区块内容 · Hero / 数据 / 产品线 / 优势 / 流程 / 证言 / 首页底部。</p></div>' +
      '<div class="section-block" data-od-id="home-hero">' +
            '<div class="section-block-title" style="margin-bottom:12px"><h2 style="font-size:15px">Hero 首屏</h2><div style="margin-left:auto"><button type="button" class="btn btn-outline btn-sm" data-act="edit" data-mod="hero" data-id="__hero">' + IC.edit + " 编辑</button></div></div>" +
            '<div class="card card-pad">' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:18px">' +
            '<div><div style="font-size:12px;color:var(--accent);letter-spacing:0.15em;text-transform:uppercase;margin-bottom:8px">' + esc(hero.kicker) + "</div>" +
            '<div style="font-family:var(--font-display);font-size:26px;font-weight:700;line-height:1.3"><span class="admin-hero-white">' + esc(hero.titleLine1) + '</span><br><span class="admin-hero-white">' + esc(hero.titleLine2) + "</span></div></div>" +
            '<div style="font-size:13px;color:var(--muted);display:flex;flex-direction:column;justify-content:center;gap:10px"><p style="margin-bottom:12px">' + esc(hero.sub) + "</p>" +
            '<div style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn btn-primary" href="' + esc(hero.ctaPrimaryHref) + '" target="_blank">' + esc(hero.ctaPrimary) + '</a><a class="btn btn-outline" href="' + esc(hero.ctaSecondaryHref) + '" target="_blank">' + esc(hero.ctaSecondary) + '</a></div></div>' +
            '</div>' +
            '</div>' +
            '</div>' +
      '<div class="section-block" data-od-id="home-stats">' +
      '<div class="section-block-title"><h2>数据指标</h2><span class="section-sub">' + stats.length + " 项</span>" +
      '<div style="margin-left:auto"><button type="button" class="btn btn-outline btn-sm" data-add="stats">' + IC.plus + " 新增指标</button></div></div>" +
      '<div class="card"><div class="stats-strip">' + (stats.length ? stats.map(function (it) {
        return '<div class="stat-tile" data-drag="' + it.id + '">' +
          '<div class="tile-top">' +
          '<span class="drag-handle" title="拖拽排序">' + IC.grip + '</span>' +
          '<span class="tile-actions">' +
          '<button type="button" class="icon-btn" data-act="edit" data-mod="stats" data-id="' + it.id + '" aria-label="编辑">' + IC.edit + '</button>' +
          '<button type="button" class="icon-btn danger" data-act="delete" data-mod="stats" data-id="' + it.id + '" aria-label="删除">' + IC.trash + '</button>' +
          '</span></div>' +
          '<div class="stat-tile-num">' + esc(it.value) + esc(it.suffix) + '</div>' +
          '<div class="stat-tile-label">' + esc(it.label) + '</div>' +
          '</div>';
      }).join("") : '<div class="stat-tile"><div class="empty-state"><div class="empty-ico">' + IC.box + '</div><h4>暂无内容</h4><p>点击「新增指标」开始创建</p></div></div>') +
      '</div></div></div>' +
      rowBlock("产品线", h.products.length + " 项", products, "products",
        "<th>产品</th><th>徽章</th><th>标签</th><th style='width:150px;text-align:right'>操作</th>",
        function (it, i) { return "<td><div class=\"cell-main\">" + esc(it.title) + "</div><div class=\"cell-sub\">" + esc(it.desc) + "</div></td>" + '<td><span class="badge ' + (it.badgeType === "live" ? "badge-live" : "badge-soon") + '">' + esc(it.badge) + "</span></td>" + '<td><div style="max-width:150px;overflow:hidden">' + (it.tags || []).map(function (t) { return '<span class="tag-chip">' + esc(t) + "</span>"; }).join("") + "</div></td>"; },
        "新增产品线") +
      rowBlock("核心优势", h.advantages.length + " 项", advs, "advantages",
        "<th>优势</th><th style='width:150px;text-align:right'>操作</th>",
        function (it, i) { return "<td><div class=\"cell-main\">" + esc(it.title) + "</div><div class=\"cell-sub\">" + esc(it.desc) + "</div></td>"; },
        "新增优势") +
      rowBlock("合作流程", h.process.length + " 步", proc, "process",
        "<th style='width:90px'>步骤</th><th>流程</th><th style='width:150px;text-align:right'>操作</th>",
        function (it, i) { var step = String(i + 1).padStart ? String(i + 1).padStart(2, "0") : (i + 1); return '<td><span class="cell-mono" style="color:var(--accent);font-size:14px">' + step + "</span></td>" + "<td><div class=\"cell-main\">" + esc(it.title) + "</div><div class=\"cell-sub\">" + esc(it.desc) + "</div></td>"; },
        "新增步骤") +
      rowBlock("客户证言", h.testimonials.length + " 条", testis, "testimonials",
        "<th>证言</th><th style='width:150px;text-align:right'>操作</th>",
        function (it, i) { return '<td><div class="cell-main">“' + esc(it.quote) + '”</div><div class="cell-sub">' + esc(it.name) + (it.role ? " · " + esc(it.role) : "") + '</div></td>'; },
        "新增证言") +
      '<div class="section-block" data-od-id="home-cta">' +
      '<div class="section-block-title" style="margin-bottom:12px"><h2 style="font-size:15px">首页底部</h2><div style="margin-left:auto"><button type="button" class="btn btn-outline btn-sm" data-act="edit" data-mod="cta" data-id="__cta">' + IC.edit + " 编辑</button></div></div>" +
      '<div class="card card-pad">' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:18px">' +
      '<div style="display:flex;flex-direction:column;justify-content:center"><div style="font-family:var(--font-display);font-size:26px;font-weight:700;line-height:1.3">' + esc(h.cta.title) + '</div></div>' +
      '<div style="font-size:13px;color:var(--muted);display:flex;flex-direction:column;justify-content:center;gap:10px"><p style="margin-bottom:12px">' + esc(h.cta.sub) + '</p>' +
      '<div style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn btn-primary" href="' + esc(h.cta.ctaPrimaryHref) + '" target="_blank" rel="noopener">' + esc(h.cta.ctaPrimary) + '</a><a class="btn btn-outline" href="' + esc(h.cta.ctaSecondaryHref) + '" target="_blank" rel="noopener">' + esc(h.cta.ctaSecondary) + '</a></div></div>' +
      '</div></div></div>';
  };

  /* ---------- 联系 ---------- */
  VIEW.contact = function () {
    var c = db.contact;
    var faqs = sorted(c.faq.slice());
    var rows = faqs.map(function (f, i) {
      return '<tr data-drag="' + f.id + '">' +
        '<td><span class="drag-handle">' + IC.grip + "</span></td>" +
        '<td><div class="cell-main">' + esc(f.q) + '</div><div class="cell-sub">' + esc(f.a) + "</div></td>" +
        '<td><div class="row-actions">' +
        '<button type="button" class="icon-btn" data-act="up" data-mod="faq" data-id="' + f.id + '" ' + (i === 0 ? "disabled" : "") + ' aria-label="上移">' + IC.up + "</button>" +
        '<button type="button" class="icon-btn" data-act="down" data-mod="faq" data-id="' + f.id + '" ' + (i === faqs.length - 1 ? "disabled" : "") + ' aria-label="下移">' + IC.down + "</button>" +
        '<button type="button" class="icon-btn" data-act="edit" data-mod="faq" data-id="' + f.id + '" aria-label="编辑">' + IC.edit + "</button>" +
        '<button type="button" class="icon-btn danger" data-act="delete" data-mod="faq" data-id="' + f.id + '" aria-label="删除">' + IC.trash + "</button>" +
        "</div></td></tr>";
    }).join("");
    return "" +
      '<div class="page-head"><h1>联系我们</h1><p>联系我们 · 商务直达信息与常见问题。</p></div>' +
      '<div class="page-toolbar">' +
      '<button type="button" class="btn btn-primary" data-act="edit" data-mod="contact" data-id="__info">' + IC.edit + " 编辑联系信息</button>" +
      '<span class="spacer"></span></div>' +
      '<div class="form-grid" style="margin-bottom:22px">' +
      '<div class="card card-pad" data-od-id="contact-info-preview">' +
      '<div class="section-block-title" style="margin-bottom:14px"><h2 style="font-size:15px">商务直达</h2></div>' +
      '<div style="display:grid;grid-template-columns:1.4fr 1fr;gap:24px">' +
      '<div><div style="font-size:12px;color:var(--accent);letter-spacing:0.15em;text-transform:uppercase;margin-bottom:10px">Direct Line · 推荐渠道</div>' +
      '<div style="font-family:var(--font-display);font-size:22px;font-weight:700;margin-bottom:8px">' + esc(c.recommendedTitle) + "</div>" +
      '<p style="font-size:13px;color:var(--muted)">' + esc(c.recommendedDesc) + "</p></div>" +
      '<div><div style="font-size:12px;color:var(--muted);margin-bottom:8px">商务顾问 · Telegram</div>' +
      '<div style="font-family:var(--font-mono);font-size:18px;color:var(--accent);margin-bottom:12px">' + esc(c.telegram) + "</div>" +
      '<div style="font-size:12.5px;color:var(--muted);display:flex;flex-direction:column;gap:6px"><span>服务时段：<b style="color:var(--fg)">' + esc(c.serviceHours) + "</b></span><span>对接时效：<b style=\"color:var(--fg)\">" + esc(c.responseTime) + "</b></span></div></div>" +
      "</div></div>" +
      "</div></div>" +
      '<div class="section-block" data-od-id="contact-faq">' +
      '<div class="section-block-title"><h2>常见问题</h2><span class="section-sub">' + faqs.length + " 条</span>" +
      '<div style="margin-left:auto"><button type="button" class="btn btn-outline btn-sm" data-add="faq">' + IC.plus + " 新增问题</button></div></div>" +
      '<div class="card"><div class="table-wrap"><table class="data"><thead><tr>' +
      "<th style='width:40px'></th><th>问题 / 答案</th><th style='width:150px;text-align:right'>操作</th></tr></thead><tbody>" + (rows || emptyRow(3)) + "</tbody></table></div></div></div>";
  };

  /* ---------- 全局设置区块（品牌与站点 / 页脚 / 客服 / 数据管理，渲染于概览页下方） ---------- */
  function settingsBlocks() {
    var s = db.settings;
    return "" +
      '<div class="settings-divider" data-od-id="settings-divider"><span>全局设置</span></div>' +
      '<div class="overview-grid settings-grid" data-od-id="ov-settings">' +
      '<div style="display:flex;flex-direction:column;gap:14px">' +
      '<div class="card" data-od-id="settings-brand"><div class="card-head"><h3>品牌与站点</h3><span class="card-sub">导航 / 页脚 / 版权</span><div class="card-actions"><button type="button" class="btn btn-outline btn-sm" data-act="edit" data-mod="settings" data-id="__settings">' + IC.edit + " 编辑</button></div></div>" +
      '<div class="card-pad" style="display:grid;grid-template-columns:1fr 1fr;gap:16px">' +
      settingRow("站点名称", s.siteName) + settingRow("导航 CTA", s.navCtaText + " → " + s.navCtaHref) +
      '<div style="grid-column:1/-1">' + settingRow("页脚品牌描述", s.siteTagline) + "</div>" +
      "</div></div>" +
      '<div class="card" data-od-id="settings-footer"><div class="card-head"><h3>页脚</h3></div><div class="card-pad">' +
      settingRow("页脚备注", s.footerNote) + settingRow("版权文案", s.copyright) +
      "</div></div>" +
      "</div>" +
      '<div style="display:flex;flex-direction:column;gap:14px">' +
      '<div class="card" data-od-id="settings-cs"><div class="card-head"><h3>客服悬浮按钮</h3><span class="card-sub">' + (s.cs.enabled ? "已启用" : "已关闭") + '</span><div class="card-actions"><button type="button" class="btn btn-outline btn-sm" data-act="edit" data-mod="cs" data-id="__cs">' + IC.edit + " 配置</button></div></div>" +
            '<div class="card-pad">' +
            '<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px"><span class="badge ' + (s.cs.enabled ? "badge-live" : "badge-muted") + '">' + (s.cs.enabled ? "已启用" : "已关闭") + '</span><span style="font-size:13px">' + esc(s.cs.name || "在线客服") + '</span></div>' +
            '<div style="font-size:12.5px;color:var(--muted);margin-bottom:6px">' + esc(s.cs.status || "") + '</div>' +
            '<div style="font-size:12.5px;margin-bottom:6px">对接方式：<b style="color:var(--fg)">' + ({ float: "页面内弹出客服浮窗", link: "新标签页打开", popup: "弹出客服窗口", embed: "内嵌第三方组件" }[s.cs.mode] || s.cs.mode) + '</b>' + (s.cs.link ? ' · <a href="' + esc(s.cs.link) + '" target="_blank" rel="noopener" style="color:var(--accent);text-decoration:none">' + esc(s.cs.link) + ' ↗</a>' : "") + '</div>' +
            '<div style="font-size:12px;color:var(--muted)">按钮：' + ({ "right-bottom": "右下角", "right-center": "右侧居中", "left-bottom": "左下角", "left-center": "左侧居中" }[s.cs.pos] || s.cs.pos) + ' · ' + ({ sm: "小", md: "中", lg: "大" }[s.cs.size] || s.cs.size) + (s.cs.icon ? " · 自定义图标" : "") + '</div>' +
            '</div></div>' +
      '<div class="card" data-od-id="settings-data"><div class="card-head"><h3>数据管理</h3></div><div class="card-pad">' +
      '<p style="font-size:13px;color:var(--muted);margin-bottom:14px">所有改动保存在浏览器本地。可随时导出 JSON 备份，或一键恢复为出厂种子数据。</p>' +
      '<div style="display:flex;gap:10px;flex-wrap:wrap">' +
      '<button type="button" class="btn btn-outline" id="btn-export">' + IC.box + " 导出 JSON</button>" +
      '<button type="button" class="btn btn-outline" id="btn-import">导入 JSON</button>' +
      '<button type="button" class="btn btn-danger" id="btn-reset2">恢复出厂数据</button>' +
      "</div></div></div>" +
      "</div>" +
      "</div>";
  }
  /* ---------- 账号与角色 ---------- */
  VIEW.accounts = function () {
    var list = sorted(db.accounts.slice());
    var primCount = db.accounts.filter(function (x) { return x.role === "primary"; }).length;
    var lockCount = db.accounts.filter(function (x) { return x.status === "locked"; }).length;
    var rows = list.map(function (a, i) {
      var all = a.role === "primary";
      var dot = all ? "1" : permCount(a.perms);
      return '<tr data-drag="' + a.id + '">' +
        '<td><span class="drag-handle">' + IC.grip + '</span></td>' +
        '<td><div class="cell-acct">' +
          '<span class="acct-avatar' + (all ? " owner" : "") + '" aria-hidden="true">' + esc((a.name || "?").charAt(0)) + '</span>' +
          '<div class="cell-main">' + esc(a.name) + (all ? ' <span class="badge badge-gold">主账号</span>' : '') + '</div>' +
          '<div class="cell-sub">' + esc(a.login || "—") + (a.email ? ' · ' + esc(a.email) : '') + '</div></div>' +
        '</td>' +
        '<td><span class="badge ' + (all ? "badge-gold" : "badge-muted") + '">' + esc(roleLabel(a.role)) + '</span></td>' +
        '<td><span class="acct-perms" title="' + esc(permText(a)) + '">' + permDots(a.perms, all) + '</span></td>' +
        '<td><span class="badge ' + (a.status === "active" ? "badge-live" : "badge-danger") + '">' + (a.status === "active" ? "正常" : "已停用") + '</span></td>' +
        '<td><div class="row-actions">' +
        '<button type="button" class="icon-btn" data-act="toggle" data-mod="accounts" data-id="' + a.id + '" ' + (all ? 'disabled title="主账号不可停用"' : (a.status === "active" ? 'title="停用"' : 'title="启用"')) + ' aria-label="' + (a.status === "active" ? "停用" : "启用") + '">' + (a.status === "active" ? IC.lock : IC.unlock) + '</button>' +
        '<button type="button" class="icon-btn" data-act="up" data-mod="accounts" data-id="' + a.id + '" ' + (i === 0 ? "disabled" : "") + ' aria-label="上移">' + IC.up + '</button>' +
        '<button type="button" class="icon-btn" data-act="down" data-mod="accounts" data-id="' + a.id + '" ' + (i === list.length - 1 ? "disabled" : "") + ' aria-label="下移">' + IC.down + '</button>' +
        '<button type="button" class="icon-btn" data-act="edit" data-mod="accounts" data-id="' + a.id + '" aria-label="编辑">' + IC.edit + '</button>' +
        '<button type="button" class="icon-btn danger" data-act="delete" data-mod="accounts" data-id="' + a.id + '" ' + (all ? "disabled" : "") + ' title="' + (all ? "主账号不可删除" : "删除") + '" aria-label="删除">' + IC.trash + '</button>' +
        '</div></td></tr>';
    }).join("");
    return "" +
      '<div class="page-head"><h1>账号与角色</h1><p>账号与角色 · 主账号持有全部权限，共 ' + list.length + ' 个账号' + (primCount === 1 ? "（含 1 个主账号）" : (primCount === 0 ? "，暂无主账号" : "（" + primCount + " 个主账号）")) + (lockCount ? "，" + lockCount + " 个已停用" : "") + "。</p></div>" +
      '<div class="page-toolbar"><button type="button" class="btn btn-primary" data-add="accounts">' + IC.plus + ' 新增账号</button><span class="spacer"></span><span class="card-sub" style="font-size:12.5px;color:var(--muted)">主账号 ' + primCount + ' · 子账号 ' + (list.length - primCount) + '</span></div>' +
      '<div class="card" data-od-id="accounts-table"><div class="table-wrap"><table class="data"><thead><tr>' +
      "<th style='width:40px'></th><th>账号</th><th style='width:120px'>角色</th><th style='width:200px'>功能权限</th><th style='width:100px'>状态</th><th style='width:170px;text-align:right'>操作</th></tr></thead><tbody>" + (rows || emptyRow(6)) + "</tbody></table></div></div>" +
      '<p class="acct-note">' + IC.gear + ' 子账号仅能访问被勾选的模块；概览对所有账号默认可见。主账号不可删除或停用。</p>';
  };
  function permText(a) {
    var on = PERM_MODULES.filter(function (c) { return a.role === "primary" || (a.perms && a.perms[c.key]); }).map(function (c) { return c.l; });
    return (a.role === "primary" ? "全部权限：" : "已授权：") + on.join("、");
  }

  VIEW.settings = settingsBlocks;
  function settingRow(label, val) {
    return '<div><div style="font-size:12px;color:var(--muted);margin-bottom:4px">' + label + "</div><div style=\"font-size:14px;font-weight:500\">" + esc(val || "—") + "</div></div>";
  }

  function emptyRow(cols) {
    return '<tr><td colspan="' + cols + '"><div class="empty-state"><div class="empty-ico">' + IC.box + "</div><h4>暂无内容</h4><p>点击「新增」按钮开始创建</p></div></td></tr>";
  }

  /* ---------------- 计数 ---------------- */
  function updateCounts() {
    var map = {
      platforms: db.platforms.length,
      articles: db.articles.length,
      news: db.news.length,
      services: db.services.length,
      about: 4,
      home: 7,
      contact: db.contact.faq.length,
      accounts: db.accounts.length
    };
    $all("[data-count]").forEach(function (el) {
      var k = el.getAttribute("data-count");
      if (map[k] !== undefined) el.textContent = map[k];
    });
  }

  /* ---------------- 路由 ---------------- */
  function go(mod) {
    if (!MODULES[mod]) mod = "overview";
    current = mod;
    render();
    // 记住位置
    try { localStorage.setItem("sw_admin_view", mod); } catch (e) {}
    if (window.innerWidth <= 860) closeMobileNav();
  }
  $all(".nav-item").forEach(function (n) {
    n.addEventListener("click", function () { go(n.getAttribute("data-module")); });
  });

  /* ---------------- 移动端菜单 ---------------- */
  function openMobileNav() { sidebar.classList.add("mobile-open"); scrim.classList.add("show"); }
  function closeMobileNav() { sidebar.classList.remove("mobile-open"); scrim.classList.remove("show"); }
  document.getElementById("mobile-menu-btn").addEventListener("click", function () { openMobileNav(); });
  scrim.addEventListener("click", closeMobileNav);

  /* ---------------- 重置 / 导出 / 导入 ---------------- */
  function doReset() {
    confirmDialog("恢复出厂数据",
      '<p class="confirm-text">将清除全部本地改动，恢复为出厂种子数据。<span class="confirm-sub">此操作不可撤销，建议先导出 JSON 备份。</span></p>',
      function () {
        db = window.ADMIN.resetSeed();
        persist();
        try { localStorage.removeItem("sw_admin_view"); } catch (e) {}
        toast("已恢复出厂数据", "info");
        render();
      }, "确认恢复");
  }
  document.getElementById("btn-reset").addEventListener("click", doReset);

  // 绑定设置页数据按钮（每次渲染后）
  view.addEventListener("click", function (e) {
    if (e.target.closest("#btn-reset2")) { doReset(); return; }
    if (e.target.closest("#btn-export")) {
      var blob = new Blob([JSON.stringify(db, null, 2)], { type: "application/json" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url; a.download = "shengwei-admin-data-" + today() + ".json";
      a.click();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      toast("已导出 JSON 备份");
      return;
    }
    if (e.target.closest("#btn-import")) {
      var inp = document.createElement("input");
      inp.type = "file"; inp.accept = "application/json";
      inp.onchange = function () {
        var file = inp.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function () {
          try {
            var parsed = JSON.parse(reader.result);
            if (!parsed.platforms || !parsed.settings) throw new Error("bad");
            db = parsed;
            Object.keys(window.ADMIN.SEED).forEach(function (k) { if (db[k] === undefined) db[k] = window.ADMIN.SEED[k]; });
            persist(); render(); toast("已导入数据");
          } catch (err) { toast("文件格式不正确，导入失败", "error"); }
        };
        reader.readAsText(file);
      };
      inp.click();
    }
  });

  /* ---------------- 启动 ---------------- */
  var start = "overview";
  try {
    var saved = localStorage.getItem("sw_admin_view");
    if (saved && MODULES[saved]) start = saved;
  } catch (e) {}
  go(start);
})();