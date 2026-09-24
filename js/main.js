(function () {
  const params = new URLSearchParams(window.location.search);
  const currentId = params.get("id");
  const isPreview = params.get("preview") === "1";
  const DRAFT_KEY = "portfolio-editor-draft";

  // In preview mode (opened from the editor), show the unsaved draft instead.
  function loadProjects() {
    if (isPreview) {
      try {
        const draft = JSON.parse(localStorage.getItem(DRAFT_KEY));
        if (draft && Array.isArray(draft.data)) return draft.data;
      } catch (e) { /* fall through to published data */ }
    }
    return PROJECTS;
  }
  const projects = loadProjects();

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function pageLink(id) {
    return "project.html?id=" + encodeURIComponent(id) + (isPreview ? "&preview=1" : "");
  }

  // Image with a grey placeholder fallback if the file is missing.
  function projectImage(src, alt) {
    const frame = el("div", "image-frame");
    const img = document.createElement("img");
    img.src = src;
    img.alt = alt;
    img.loading = "lazy";
    img.addEventListener("error", function () {
      img.remove();
      frame.classList.add("is-placeholder");
      frame.appendChild(el("span", "placeholder-label", alt));
    });
    frame.appendChild(img);
    return frame;
  }

  // Split text on blank lines into <p> elements.
  function appendParagraphs(parent, text) {
    String(text || "").split(/\n\s*\n/).forEach(function (para) {
      if (para.trim()) parent.appendChild(el("p", "", para.trim()));
    });
  }

  function renderPreviewBanner() {
    if (!isPreview) return;
    const banner = el("div", "preview-banner", "Preview of your unpublished edits");
    const back = el("a", "", "Back to editor");
    back.href = "edit.html" + (currentId ? "#" + encodeURIComponent(currentId) : "");
    banner.appendChild(back);
    document.body.prepend(banner);
  }

  function renderMenu() {
    const menu = document.getElementById("project-menu");
    const home = document.querySelector(".site-name");
    if (home && isPreview) home.href = "index.html?preview=1";
    projects.forEach(function (project) {
      const li = el("li");
      const a = el("a", project.id === currentId ? "active" : "", project.title);
      a.href = pageLink(project.id);
      li.appendChild(a);
      menu.appendChild(li);
    });
  }

  function renderGrid() {
    const grid = document.getElementById("project-grid");
    if (!grid) return;
    projects.forEach(function (project) {
      const card = el("a", "project-card");
      card.href = pageLink(project.id);
      card.appendChild(projectImage(project.cover, project.title));
      const meta = el("div", "card-meta");
      meta.appendChild(el("h2", "card-title", project.title));
      if (project.summary) meta.appendChild(el("p", "card-summary", project.summary));
      card.appendChild(meta);
      grid.appendChild(card);
    });
  }

  // ---------- Lightbox ----------

  let lightboxPhotos = [];
  let lightboxIndex = 0;
  let lightbox;

  function buildLightbox() {
    lightbox = el("div", "lightbox");
    lightbox.innerHTML =
      '<button class="lb-close" aria-label="Close">×</button>' +
      '<button class="lb-prev" aria-label="Previous">‹</button>' +
      '<figure><img alt=""><figcaption></figcaption></figure>' +
      '<button class="lb-next" aria-label="Next">›</button>';
    lightbox.addEventListener("click", function (e) {
      if (e.target.closest(".lb-prev")) return step(-1);
      if (e.target.closest(".lb-next")) return step(1);
      if (e.target.tagName !== "IMG") closeLightbox();
    });
    document.addEventListener("keydown", function (e) {
      if (!lightbox.classList.contains("open")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    });
    document.body.appendChild(lightbox);
  }

  function showLightbox(i) {
    lightboxIndex = i;
    const item = lightboxPhotos[i];
    lightbox.querySelector("img").src = item.photo;
    lightbox.querySelector("figcaption").textContent = item.caption || "";
    lightbox.classList.toggle("single", lightboxPhotos.length < 2);
    lightbox.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function step(delta) {
    const n = lightboxPhotos.length;
    showLightbox((lightboxIndex + delta + n) % n);
  }

  function closeLightbox() {
    lightbox.classList.remove("open");
    document.body.style.overflow = "";
  }

  // ---------- Project page ----------

  function renderDetail() {
    const detail = document.getElementById("project-detail");
    if (!detail) return;
    const project = projects.find(function (p) { return p.id === currentId; });

    const back = el("a", "back-link", "← All projects");
    back.href = isPreview ? "index.html?preview=1" : "index.html";
    detail.appendChild(back);

    if (!project) {
      detail.appendChild(el("h1", "detail-title", "Project not found"));
      return;
    }

    document.title = project.title + " — Tim Sands";
    detail.appendChild(el("h1", "detail-title", project.title));

    if (project.tags && project.tags.length) {
      const tags = el("ul", "tags");
      project.tags.forEach(function (t) { tags.appendChild(el("li", "", t)); });
      detail.appendChild(tags);
    }

    const hero = projectImage(project.cover, project.title);
    hero.classList.add("detail-hero");
    detail.appendChild(hero);

    const intro = el("div", "detail-body");
    (project.intro || []).forEach(function (para) { appendParagraphs(intro, para); });
    detail.appendChild(intro);

    if (project.links && project.links.length) {
      const links = el("div", "detail-links");
      project.links.forEach(function (link) {
        const a = el("a", "", link.label + " →");
        a.href = link.url;
        a.target = "_blank";
        a.rel = "noopener";
        links.appendChild(a);
      });
      detail.appendChild(links);
    }

    const story = el("div", "story");
    lightboxPhotos = (project.story || []).filter(function (item) { return item.photo; });
    (project.story || []).forEach(function (item) {
      if (item.text !== undefined) {
        const text = el("div", "story-text");
        appendParagraphs(text, item.text);
        story.appendChild(text);
        return;
      }
      const fig = el("figure", "story-photo" + (item.size === "full" ? " full" : ""));
      const img = document.createElement("img");
      img.src = item.photo;
      img.alt = item.caption || project.title;
      img.loading = "lazy";
      const index = lightboxPhotos.indexOf(item);
      img.addEventListener("click", function () { showLightbox(index); });
      fig.appendChild(img);
      if (item.caption) fig.appendChild(el("figcaption", "", item.caption));
      story.appendChild(fig);
    });
    detail.appendChild(story);
    if (lightboxPhotos.length) buildLightbox();
  }

  renderPreviewBanner();
  renderMenu();
  renderGrid();
  renderDetail();
})();
