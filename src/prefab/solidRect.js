// An invisible, exactly-sized static collider centred on (cx, cy), added to the
// given `solids` static group. Backed by a real 1×1 texture and sized via
// setDisplaySize + refreshBody: sizing a textureless static body with setSize()
// is clobbered by updateFromGameObject (it resamples the object's display size),
// which left earlier colliders tiny so the player walked through.
export function solidRect(scene, solids, cx, cy, w, h) {
  if (!scene.textures.exists('px')) {
    const g = scene.make.graphics({ x: 0, y: 0 }, false);
    g.fillStyle(0xffffff, 1).fillRect(0, 0, 1, 1);
    g.generateTexture('px', 1, 1);
    g.destroy();
  }
  const body = solids.create(cx, cy, 'px').setVisible(false);
  body.setDisplaySize(w, h).refreshBody();
  return body;
}
