// A portal is an entrance/exit: an [E] interactable that fades the current scene
// out and starts a destination scene. Where it leads is just an argument — the
// `to` scene key plus the `data` payload handed to that scene — so the same
// prefab powers building doors, the dungeon mouth, and interior exits alike.
// The doorway / cave / threshold visual is drawn by the calling scene; the portal
// owns only the interaction + transition.
// `armOnLeave`: keep the portal dormant until the player first steps out of
// range — used for the side you spawn on (e.g. an interior exit) so you don't
// arrive on top of an active "leave" prompt.
export function createPortal(scene, { x, y, promptY, range = 34, label = '[E] enter', to, data, armOnLeave = false }) {
  return scene.addInteractable({
    x,
    y,
    promptY,
    range,
    label,
    armOnLeave,
    action: (s) => s.fadeTo(to, data),
  });
}
