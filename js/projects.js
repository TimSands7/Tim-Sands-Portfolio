/*
 * Project list — edit this file to add, remove, or reorder projects.
 *
 * For each project:
 *   id          Short, URL-friendly name. Also the folder name under images/projects/.
 *   title       Name shown in the menu and on the card.
 *   summary     One line shown under the card on the home page.
 *   description Paragraphs shown on the project's detail page.
 *   tags        Optional list of tools / skills used.
 *   cover       Main image shown on the home page and at the top of the detail page.
 *   gallery     Optional extra images shown on the detail page.
 *   links       Optional links (GitHub, live demo, video, etc.).
 *
 * Missing images show a grey placeholder, so the site works before photos are added.
 */
const PROJECTS = [
  {
    id: "project-one",
    title: "Project One",
    summary: "A short one-line summary of the project.",
    description: [
      "Describe what the project is, why you built it, and the problem it solves.",
      "Talk about the approach you took, the tools you used, and anything you learned or would do differently."
    ],
    tags: ["Tool A", "Tool B", "Skill C"],
    cover: "images/projects/project-one/cover.jpg",
    gallery: [
      "images/projects/project-one/1.jpg",
      "images/projects/project-one/2.jpg"
    ],
    links: [{ label: "GitHub", url: "#" }]
  },
  {
    id: "project-two",
    title: "Project Two",
    summary: "A short one-line summary of the project.",
    description: [
      "Describe what the project is, why you built it, and the problem it solves."
    ],
    tags: ["Tool A", "Tool D"],
    cover: "images/projects/project-two/cover.jpg",
    gallery: [],
    links: []
  },
  {
    id: "project-three",
    title: "Project Three",
    summary: "A short one-line summary of the project.",
    description: [
      "Describe what the project is, why you built it, and the problem it solves."
    ],
    tags: ["Skill E"],
    cover: "images/projects/project-three/cover.jpg",
    gallery: [],
    links: []
  },
  {
    id: "project-four",
    title: "Project Four",
    summary: "A short one-line summary of the project.",
    description: [
      "Describe what the project is, why you built it, and the problem it solves."
    ],
    tags: [],
    cover: "images/projects/project-four/cover.jpg",
    gallery: [],
    links: []
  }
];
