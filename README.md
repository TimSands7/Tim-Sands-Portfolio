# Tim Sands — Portfolio

A simple static portfolio site. No build step — open `index.html` in a browser, or host it with GitHub Pages.

## Structure

```
index.html            Home page: name + project menu on the left, project grid on the right
project.html          Project detail page (project.html?id=<project-id>)
css/style.css         All styling (colours are defined at the top)
js/projects.js        Project list — edit this to add or change projects
js/main.js            Renders the menu, grid and detail pages
images/projects/<id>/ One folder per project for its photos
```

## Adding photos

Put images in the project's folder, e.g. `images/projects/project-one/`:

- `cover.jpg` — the main picture shown on the home page and at the top of the detail page
- `1.jpg`, `2.jpg`, ... — extra pictures for the detail page gallery (list them under `gallery` in `js/projects.js`)

Until an image exists, a grey placeholder is shown in its place.

## Adding a project

1. Copy one of the entries in `js/projects.js` and give it a new `id`, `title`, `summary` and `description`.
2. Create `images/projects/<id>/` and add a `cover.jpg`.

## Hosting on GitHub Pages

Repo **Settings → Pages → Deploy from a branch**, choose the branch and `/ (root)`.
