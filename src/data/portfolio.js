// Single source of truth for portfolio content. NPCs reference an entry by id;
// dialogue and (later) project detail panels render from here. Editing your
// portfolio = editing this file, no scene code touched.

export const PROFILE = {
  name: 'Philippe Luo',
  tagline: 'Software Engineer',
  // Shown in the mirror's "About Me" modal. Drop your photo at
  // public/assets/me.jpg (falls back to your initials until it exists).
  photo: 'assets/me.jpg',
  about: [
    'Hi, I’m Philippe — a software engineer who likes building things end to end.',
    'This little world is my portfolio: wander out to the shops to meet the work, or brave the dungeon for the flagship project.',
    'TODO: replace this with a few real sentences about yourself.',
  ],
  // links shown on the title/about NPC
  links: {
    github: 'https://github.com/',
    email: 'luophilipe@gmail.com',
  },
};

// Each NPC maps to a domain. `lines` is the dialogue shown on interact;
// `projects` are the specific works that NPC "sells" / talks about.
export const NPCS = {
  blacksmith: {
    role: 'Systems & Backend',
    lines: [
      'Ah, a traveler. I forge the things that hold weight.',
      'Servers, pipelines, the stuff that must not break.',
    ],
    projects: [
      { name: 'TODO: systems project', blurb: 'One-line description.' },
    ],
  },
  alchemist: {
    role: 'Machine Learning & Data',
    lines: [
      'Mind the fumes. I turn raw data into something potent.',
      'Models, experiments, the occasional explosion.',
    ],
    projects: [
      { name: 'TODO: ML project', blurb: 'One-line description.' },
    ],
  },
  merchant: {
    role: 'Web & Frontend',
    lines: [
      'Step right up! Interfaces people actually enjoy using.',
      'Fast, polished, shipped.',
    ],
    projects: [
      { name: 'TODO: web project', blurb: 'One-line description.' },
    ],
  },
};

// The dungeon boss = capstone / flagship project.
export const DUNGEON_BOSS = {
  name: 'TODO: Capstone Project',
  blurb: 'The big one. Describe the flagship project here.',
};
