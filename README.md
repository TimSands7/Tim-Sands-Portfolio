# Timothy Sands — Portfolio

A simple static portfolio site. No build step: host it with GitHub Pages or open `index.html` in a browser.

## Editing the site

Open **`edit.html`** on your live site (e.g. `https://timsands7.github.io/Tim-Sands-Portfolio/edit.html`).

In the editor you can:
- write each project's title, summary, tags and introduction
- add a caption to any photo, and add text sections between photos to tell the story
- drag photos and text into any order (or use the arrows)
- make a photo full width or half width (half-width photos sit side by side)
- pick the cover photo, remove photos, or add ones from "Unused photos"
- reorder the projects on the home page

Edits save in your browser as you go. Click **Preview** to see the real page with your edits.

To publish, click **Publish…** → **Copy my changes** → **Open projects.js on GitHub**, then select all the text in the
file, paste, and click **Commit changes**. The site updates within a couple of minutes.

## Structure

```
index.html            Home page: name + project menu on the left, project grid on the right
project.html          Project story page (project.html?id=<project-id>)
edit.html             Site editor (not linked from the site)
js/projects.js        All project text, captions and photo order (written by the editor)
js/main.js            Renders the public pages
js/editor.js          The editor
css/style.css         Site styling (colours are defined at the top)
css/editor.css        Editor styling
images/projects/<id>/ One folder per project for its photos
```

## Adding new photos

Photos need to be converted and resized for the web (iPhone `.HEIC` photos don't show in most browsers,
and GitHub's website rejects files over 25 MB). Upload the originals to a GitHub release and ask Claude
to add them. They'll appear under "Unused photos" in the editor, ready to place.

## Hosting on GitHub Pages

Repo **Settings → Pages → Deploy from a branch**, choose `main` and `/ (root)`.
