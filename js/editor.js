(function () {
  const DRAFT_KEY = "portfolio-editor-draft";
  const published = JSON.stringify(PROJECTS);
  let data;
  let currentId;

  const $ = function (id) { return document.getElementById(id); };

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function button(label, className, onClick, title) {
    const b = el("button", "ed-btn " + (className || ""), label);
    b.type = "button";
    if (title) b.title = title;
    b.addEventListener("click", onClick);
    return b;
  }

  // ---------- Draft storage (this browser only) ----------

  function readDraft() {
    try { return JSON.parse(localStorage.getItem(DRAFT_KEY)); } catch (e) { return null; }
  }

  function save() {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ base: published, data: data }));
    } catch (e) { /* storage unavailable: edits live until the tab closes */ }
    updateStatus();
  }

  function hasChanges() { return JSON.stringify(data) !== published; }

  function updateStatus() {
    $("ed-status").textContent = hasChanges()
      ? "Unpublished edits (saved in this browser)"
      : "No unpublished edits";
  }

  function load() {
    const draft = readDraft();
    data = JSON.parse(published);
    if (!draft || !Array.isArray(draft.data)) return;
    data = draft.data;
    if (draft.base !== published && JSON.stringify(draft.data) !== published) {
      const notice = $("ed-notice");
      notice.hidden = false;
      notice.textContent = "The published site has changed since you started these edits. ";
      notice.appendChild(button("Keep my edits", "", function () {
        notice.hidden = true;
        save();
      }));
      notice.appendChild(button("Start over from the published site", "", function () {
        data = JSON.parse(published);
        notice.hidden = true;
        save();
        renderAll();
      }));
    }
  }

  function project() {
    return data.find(function (p) { return p.id === currentId; }) || data[0];
  }

  // ---------- Project list ----------

  function renderProjects() {
    const list = $("ed-projects");
    list.innerHTML = "";
    data.forEach(function (p, i) {
      const li = el("li", p.id === currentId ? "active" : "");
      const name = el("button", "ed-project-name", p.title || "(untitled)");
      name.type = "button";
      name.addEventListener("click", function () { select(p.id); });
      li.appendChild(name);
      const move = el("span", "ed-move");
      move.appendChild(button("↑", "icon", function () { moveProject(i, -1); }, "Move up"));
      move.appendChild(button("↓", "icon", function () { moveProject(i, 1); }, "Move down"));
      li.appendChild(move);
      list.appendChild(li);
    });
  }

  function moveProject(i, delta) {
    const j = i + delta;
    if (j < 0 || j >= data.length) return;
    data.splice(j, 0, data.splice(i, 1)[0]);
    save();
    renderProjects();
  }

  function select(id) {
    currentId = id;
    history.replaceState(null, "", "#" + encodeURIComponent(id));
    renderAll();
    window.scrollTo(0, 0);
  }

  // ---------- Project form ----------

  function field(label, input, hint) {
    const wrap = el("label", "ed-field");
    wrap.appendChild(el("span", "ed-label", label));
    wrap.appendChild(input);
    if (hint) wrap.appendChild(el("span", "ed-hint", hint));
    return wrap;
  }

  function textInput(value, onInput, placeholder) {
    const input = el("input");
    input.type = "text";
    input.value = value || "";
    if (placeholder) input.placeholder = placeholder;
    input.addEventListener("input", function () { onInput(input.value); save(); });
    return input;
  }

  function textArea(value, onInput, rows, placeholder) {
    const ta = el("textarea");
    ta.value = value || "";
    ta.rows = rows;
    if (placeholder) ta.placeholder = placeholder;
    ta.addEventListener("input", function () { onInput(ta.value); save(); });
    return ta;
  }

  function linksToText(links) {
    return (links || []).map(function (l) { return l.label + " | " + l.url; }).join("\n");
  }

  function textToLinks(text) {
    return text.split("\n").map(function (line) {
      const parts = line.split("|");
      if (parts.length < 2) return null;
      const label = parts[0].trim();
      const url = parts.slice(1).join("|").trim();
      return label && url ? { label: label, url: url } : null;
    }).filter(Boolean);
  }

  function renderMain() {
    const p = project();
    const main = $("ed-main");
    main.innerHTML = "";
    if (!p) return;

    const details = el("section", "ed-section");
    details.appendChild(el("h2", "ed-section-title", "Project details"));
    details.appendChild(field("Title", textInput(p.title, function (v) {
      p.title = v;
      renderProjects();
    })));
    details.appendChild(field("Summary", textInput(p.summary, function (v) { p.summary = v; },
      "One line shown under the photo on the home page")));
    details.appendChild(field("Tags", textInput((p.tags || []).join(", "), function (v) {
      p.tags = v.split(",").map(function (t) { return t.trim(); }).filter(Boolean);
    }, "e.g. Welding, Suspension, Fabrication"), "Separate with commas."));
    details.appendChild(field("Introduction", textArea((p.intro || []).join("\n\n"), function (v) {
      p.intro = v.trim() ? [v] : [];
    }, 6, "What the project is and why you took it on"), "Leave a blank line between paragraphs."));
    details.appendChild(field("Links", textArea(linksToText(p.links), function (v) {
      p.links = textToLinks(v);
    }, 2, "Instagram | https://instagram.com/..."), "One per line, as: Label | https://address"));
    main.appendChild(details);

    const cover = el("section", "ed-section");
    cover.appendChild(el("h2", "ed-section-title", "Cover photo"));
    const coverRow = el("div", "ed-cover");
    const coverImg = el("img");
    coverImg.src = p.cover;
    coverImg.alt = "";
    coverRow.appendChild(coverImg);
    coverRow.appendChild(el("p", "ed-hint",
      "Shown on the home page and at the top of the project page. To change it, click “Make cover” on any photo below."));
    cover.appendChild(coverRow);
    main.appendChild(cover);

    const story = el("section", "ed-section");
    story.appendChild(el("h2", "ed-section-title", "Story"));
    story.appendChild(el("p", "ed-hint",
      "Photos and text appear on the project page in this order. Drag the ⠿ handle or use the arrows to move things. " +
      "Half-width photos sit side by side in pairs."));
    const list = el("ol", "ed-story");
    list.id = "ed-story";
    (p.story || []).forEach(function (item, i) { list.appendChild(storyRow(p, item, i)); });
    story.appendChild(list);
    story.appendChild(button("+ Add a text section at the end", "", function () {
      p.story.push({ text: "" });
      save();
      renderMain();
      focusRow(p.story.length - 1);
    }));
    main.appendChild(story);

    const unused = el("section", "ed-section");
    unused.appendChild(el("h2", "ed-section-title", "Unused photos (" + (p.unused || []).length + ")"));
    if (!(p.unused || []).length) {
      unused.appendChild(el("p", "ed-hint", "Every photo in this project's folder is in the story."));
    } else {
      unused.appendChild(el("p", "ed-hint", "These photos are in the project folder but not on the site."));
      const tray = el("div", "ed-tray");
      p.unused.forEach(function (src, i) {
        const card = el("div", "ed-tray-item");
        const img = el("img");
        img.src = src;
        img.alt = "";
        img.loading = "lazy";
        card.appendChild(img);
        const actions = el("div", "ed-tray-actions");
        actions.appendChild(button("Add to story", "small", function () {
          p.unused.splice(i, 1);
          p.story.push({ photo: src, caption: "", size: "half" });
          save();
          renderMain();
        }));
        actions.appendChild(button("Make cover", "small", function () {
          p.unused.splice(i, 1, p.cover);
          p.cover = src;
          save();
          renderMain();
        }));
        card.appendChild(actions);
        tray.appendChild(card);
      });
      unused.appendChild(tray);
    }
    main.appendChild(unused);
  }

  function focusRow(i) {
    const row = document.querySelectorAll("#ed-story > li")[i];
    if (!row) return;
    row.scrollIntoView({ block: "center" });
    const ta = row.querySelector("textarea");
    if (ta) ta.focus();
  }

  function moveItem(p, from, to) {
    if (to < 0 || to >= p.story.length || from === to) return;
    p.story.splice(to, 0, p.story.splice(from, 1)[0]);
    save();
    renderMain();
  }

  // ---------- Story rows ----------

  let dragFrom = null;

  function storyRow(p, item, i) {
    const isText = item.text !== undefined;
    const row = el("li", "ed-row" + (isText ? " is-text" : ""));

    const handle = el("span", "ed-handle", "⠿");
    handle.title = "Drag to move";
    handle.addEventListener("mousedown", function () { row.draggable = true; });
    handle.addEventListener("mouseup", function () { row.draggable = false; });
    row.appendChild(handle);

    if (isText) {
      row.appendChild(el("div", "ed-text-badge", "Text"));
    } else {
      const img = el("img", "ed-thumb");
      img.src = item.photo;
      img.alt = "";
      img.loading = "lazy";
      row.appendChild(img);
    }

    const body = el("div", "ed-row-body");
    if (isText) {
      body.appendChild(textArea(item.text, function (v) { item.text = v; }, 4,
        "Tell the next part of the story…"));
    } else {
      body.appendChild(textArea(item.caption, function (v) { item.caption = v; }, 2,
        "Caption (optional)"));
    }

    const controls = el("div", "ed-row-controls");
    if (!isText) {
      const size = el("div", "ed-toggle");
      ["half", "full"].forEach(function (s) {
        const b = button(s === "half" ? "Half width" : "Full width",
          "small" + ((item.size || "half") === s ? " on" : ""), function () {
            item.size = s;
            save();
            renderMain();
          });
        size.appendChild(b);
      });
      controls.appendChild(size);
    }
    controls.appendChild(button("↑", "small icon", function () { moveItem(p, i, i - 1); }, "Move up"));
    controls.appendChild(button("↓", "small icon", function () { moveItem(p, i, i + 1); }, "Move down"));
    controls.appendChild(button("+ Text below", "small", function () {
      p.story.splice(i + 1, 0, { text: "" });
      save();
      renderMain();
      focusRow(i + 1);
    }));
    if (!isText) {
      controls.appendChild(button("Make cover", "small", function () {
        p.story.splice(i, 1);
        p.unused.unshift(p.cover);
        p.cover = item.photo;
        save();
        renderMain();
      }, "Use as the cover photo (the current cover moves to Unused photos)"));
    }
    controls.appendChild(button(isText ? "Delete" : "Remove", "small danger", function () {
      if (isText && item.text.trim() && !confirm("Delete this text section?")) return;
      p.story.splice(i, 1);
      if (!isText) p.unused.unshift(item.photo);
      save();
      renderMain();
    }, isText ? "Delete this text section" : "Take this photo off the site (it moves to Unused photos)"));
    body.appendChild(controls);
    row.appendChild(body);

    row.addEventListener("dragstart", function (e) {
      dragFrom = i;
      row.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(i));
    });
    row.addEventListener("dragend", function () {
      row.draggable = false;
      row.classList.remove("dragging");
      clearDropMarks();
    });
    row.addEventListener("dragover", function (e) {
      if (dragFrom === null) return;
      e.preventDefault();
      const rect = row.getBoundingClientRect();
      const after = e.clientY > rect.top + rect.height / 2;
      clearDropMarks();
      row.classList.add(after ? "drop-after" : "drop-before");
    });
    row.addEventListener("drop", function (e) {
      e.preventDefault();
      if (dragFrom === null) return;
      const rect = row.getBoundingClientRect();
      const after = e.clientY > rect.top + rect.height / 2;
      let to = i + (after ? 1 : 0);
      if (dragFrom < to) to -= 1;
      const from = dragFrom;
      dragFrom = null;
      moveItem(p, from, to);
    });
    return row;
  }

  function clearDropMarks() {
    document.querySelectorAll(".drop-before, .drop-after").forEach(function (n) {
      n.classList.remove("drop-before", "drop-after");
    });
  }

  // ---------- Publishing ----------

  const HEADER = [
    "/*",
    " * Project list. The easiest way to edit this is the site editor (edit.html),",
    " * which downloads a new copy of this file for you to upload to GitHub.",
    " *",
    " * For each project:",
    " *   id       Short, URL-friendly name. Also the folder name under images/projects/.",
    " *   title    Name shown in the menu and on the card.",
    " *   summary  One line shown under the card on the home page.",
    " *   tags     Tools / skills used.",
    " *   cover    Main image on the home page and at the top of the project page.",
    " *   intro    Opening paragraphs on the project page.",
    " *   story    Photos and text in the order they appear on the project page:",
    " *              { photo: \"path\", caption: \"text\", size: \"full\" | \"half\" }",
    " *              { text: \"paragraph(s), separated by a blank line\" }",
    " *   unused   Photos in the project folder that are not shown on the site.",
    " *   links    Optional links: { label: \"GitHub\", url: \"https://...\" }",
    " */",
    ""
  ].join("\n");

  function exportText() {
    return HEADER + "const PROJECTS = " + JSON.stringify(data, null, 2) + ";\n";
  }

  function download() {
    const blob = new Blob([exportText()], { type: "text/javascript" });
    const a = el("a");
    a.href = URL.createObjectURL(blob);
    a.download = "projects.js";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }

  function copy() {
    const btn = $("ed-copy");
    const done = function () {
      btn.textContent = "Copied";
      setTimeout(function () { btn.textContent = "Copy my changes"; }, 1500);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(exportText()).then(done, fallback);
    } else {
      fallback();
    }
    function fallback() {
      const ta = el("textarea");
      ta.value = exportText();
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      done();
    }
  }

  function renderAll() {
    renderProjects();
    renderMain();
    updateStatus();
  }

  // ---------- Start ----------

  load();
  const fromHash = decodeURIComponent(location.hash.slice(1));
  currentId = data.some(function (p) { return p.id === fromHash; }) ? fromHash : data[0].id;
  renderAll();

  $("ed-preview").addEventListener("click", function () {
    save();
    window.open("project.html?id=" + encodeURIComponent(currentId) + "&preview=1", "_blank");
  });
  $("ed-publish").addEventListener("click", function () { $("ed-dialog").showModal(); });
  $("ed-close").addEventListener("click", function () { $("ed-dialog").close(); });
  $("ed-download").addEventListener("click", download);
  $("ed-copy").addEventListener("click", copy);
  $("ed-reset").addEventListener("click", function () {
    if (!confirm("Discard all your unpublished edits? This can't be undone.")) return;
    try { localStorage.removeItem(DRAFT_KEY); } catch (e) { /* ignore */ }
    data = JSON.parse(published);
    $("ed-dialog").close();
    renderAll();
  });
})();
