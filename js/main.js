(function () {
  const params = new URLSearchParams(window.location.search);
  const currentId = params.get("id");

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  // Image with a grey placeholder fallback until real photos are uploaded.
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

  function renderMenu() {
    const menu = document.getElementById("project-menu");
    PROJECTS.forEach(function (project) {
      const li = el("li");
      const a = el("a", project.id === currentId ? "active" : "", project.title);
      a.href = "project.html?id=" + encodeURIComponent(project.id);
      li.appendChild(a);
      menu.appendChild(li);
    });
  }

  function renderGrid() {
    const grid = document.getElementById("project-grid");
    if (!grid) return;
    PROJECTS.forEach(function (project) {
      const card = el("a", "project-card");
      card.href = "project.html?id=" + encodeURIComponent(project.id);
      card.appendChild(projectImage(project.cover, project.title));
      const meta = el("div", "card-meta");
      meta.appendChild(el("h2", "card-title", project.title));
      if (project.summary) meta.appendChild(el("p", "card-summary", project.summary));
      card.appendChild(meta);
      grid.appendChild(card);
    });
  }

  function renderDetail() {
    const detail = document.getElementById("project-detail");
    if (!detail) return;
    const project = PROJECTS.find(function (p) { return p.id === currentId; });

    if (!project) {
      detail.appendChild(el("h1", "detail-title", "Project not found"));
      const back = el("a", "back-link", "← All projects");
      back.href = "index.html";
      detail.appendChild(back);
      return;
    }

    document.title = project.title + " — Tim Sands";

    const back = el("a", "back-link", "← All projects");
    back.href = "index.html";
    detail.appendChild(back);

    detail.appendChild(el("h1", "detail-title", project.title));

    if (project.tags && project.tags.length) {
      const tags = el("ul", "tags");
      project.tags.forEach(function (t) { tags.appendChild(el("li", "", t)); });
      detail.appendChild(tags);
    }

    const hero = projectImage(project.cover, project.title);
    hero.classList.add("detail-hero");
    detail.appendChild(hero);

    const body = el("div", "detail-body");
    (project.description || []).forEach(function (para) {
      body.appendChild(el("p", "", para));
    });
    detail.appendChild(body);

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

    if (project.gallery && project.gallery.length) {
      const gallery = el("div", "gallery");
      project.gallery.forEach(function (src, i) {
        gallery.appendChild(projectImage(src, project.title + " image " + (i + 1)));
      });
      detail.appendChild(gallery);
    }
  }

  renderMenu();
  renderGrid();
  renderDetail();
})();
