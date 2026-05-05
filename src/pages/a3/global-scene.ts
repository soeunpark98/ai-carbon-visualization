import * as THREE from "three";

export function initGlobalScene(container: HTMLElement, annualKm: number): () => void {
  const W = container.clientWidth || 860;
  const H = 340;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 800);
  camera.position.set(0, 3, 24);
  camera.lookAt(0, 0, 0);

  // ── Stars ──────────────────────────────────────────────────────────
  const starPos = new Float32Array(2500 * 3);
  for (let i = 0; i < starPos.length; i++) starPos[i] = (Math.random() - 0.5) * 250;
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.14, sizeAttenuation: true })));

  // ── Layout ─────────────────────────────────────────────────────────
  // Full path = annualKm. Earth at left, endpoint at right.
  // Sun sits at proportional position along the path.
  const EARTH_SUN_KM = 149_600_000;
  const PATH_X0 = -11;  // Earth x
  const PATH_X1 =  11;  // layout right bound
  const sunT    = 0.65;   // fixed: Sun at 65% across for visual spacing
  const SUN_X   = PATH_X0 + (PATH_X1 - PATH_X0) * sunT;
  const arcH    = 1.2;  // arc bow height

  function pathPoint(t: number): THREE.Vector3 {
    return new THREE.Vector3(
      PATH_X0 + (PATH_X1 - PATH_X0) * t,
      Math.sin(t * Math.PI) * arcH,
      0,
    );
  }

  // ── Dashed path ────────────────────────────────────────────────────
  // Earth → Sun (main path, brighter)
  const mainPts: THREE.Vector3[] = [];
  for (let i = 0; i <= 80; i++) mainPts.push(pathPoint(i / 80 * sunT));
  const mainLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(mainPts),
    new THREE.LineDashedMaterial({ color: 0x556677, dashSize: 0.22, gapSize: 0.15 }),
  );
  (mainLine as any).computeLineDistances();
  scene.add(mainLine);


  // ── Sun ────────────────────────────────────────────────────────────
  const SUN_POS = new THREE.Vector3(SUN_X, 0, 0);
  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(1.4, 48, 48),
    new THREE.MeshBasicMaterial({ color: 0xffcc22 }),
  );
  sun.position.copy(SUN_POS);
  scene.add(sun);

  // Sun glow sprite
  function makeGlow(innerColor: string, outerColor: string, size: number) {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0,   innerColor);
    g.addColorStop(0.4, outerColor);
    g.addColorStop(1,   "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), blending: THREE.AdditiveBlending, depthWrite: false }),
    );
    sprite.scale.set(size, size, 1);
    return sprite;
  }
  const sunGlow = makeGlow("rgba(255,220,80,0.95)", "rgba(255,140,20,0.3)", 8);
  sunGlow.position.copy(SUN_POS);
  scene.add(sunGlow);

  // ── Earth ──────────────────────────────────────────────────────────
  const EARTH_POS = new THREE.Vector3(PATH_X0, 0, 0);
  const earthGroup = new THREE.Group();
  earthGroup.position.copy(EARTH_POS);
  scene.add(earthGroup);

  const earth = new THREE.Mesh(
    new THREE.SphereGeometry(1.0, 48, 48),
    new THREE.MeshPhongMaterial({ color: 0x1a66cc, emissive: 0x08122a, specular: 0x66aaff, shininess: 80 }),
  );
  earthGroup.add(earth);

  const atmosGlow = makeGlow("rgba(40,100,255,0)", "rgba(60,130,255,0.18)", 3.0);
  earthGroup.add(atmosGlow);


  // ── Travelling dot ──────────────────────────────────────────────────
  const TOTAL_TRIPS = annualKm / EARTH_SUN_KM; // ≈ 3.25

  const traveller = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xff6b9d }),
  );
  scene.add(traveller);
  const travGlow = makeGlow("rgba(255,107,157,1)", "rgba(255,107,157,0)", 1.4);
  scene.add(travGlow);

  // Comet tail (trail behind traveller)
  const TAIL_LEN = 12;
  const tailPositions = new Float32Array(TAIL_LEN * 3);
  const tailGeo = new THREE.BufferGeometry();
  tailGeo.setAttribute("position", new THREE.BufferAttribute(tailPositions, 3));
  const tailColors = new Float32Array(TAIL_LEN * 3);
  tailGeo.setAttribute("color", new THREE.BufferAttribute(tailColors, 3));
  const tailLine = new THREE.Line(
    tailGeo,
    new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.7 }),
  );
  scene.add(tailLine);

  // ── Lights ─────────────────────────────────────────────────────────
  const sunLight = new THREE.PointLight(0xfffae0, 2.5, 60);
  sunLight.position.copy(SUN_POS);
  scene.add(sunLight);
  scene.add(new THREE.AmbientLight(0x111133, 1.5));

  // ── Mouse drag (orbit) ─────────────────────────────────────────────
  let isDragging = false;
  let prevX = 0, prevY = 0;
  let rotY = 0, rotX = 0;

  const onDown = (e: MouseEvent) => { isDragging = true; prevX = e.clientX; prevY = e.clientY; (renderer.domElement as HTMLElement).style.cursor = "grabbing"; };
  const onUp   = () => { isDragging = false; (renderer.domElement as HTMLElement).style.cursor = "grab"; };
  const onMove = (e: MouseEvent) => {
    if (!isDragging) return;
    rotY += (e.clientX - prevX) * 0.008;
    rotX += (e.clientY - prevY) * 0.005;
    rotX  = Math.max(-0.5, Math.min(0.5, rotX));
    prevX = e.clientX; prevY = e.clientY;
  };
  renderer.domElement.addEventListener("mousedown", onDown);
  window.addEventListener("mouseup",   onUp);
  window.addEventListener("mousemove", onMove);
  (renderer.domElement as HTMLElement).style.cursor = "grab";

  // ── Tail history ───────────────────────────────────────────────────
  const tailHistory: THREE.Vector3[] = Array.from({ length: TAIL_LEN }, () => new THREE.Vector3());

  // ── Animation ──────────────────────────────────────────────────────
  const clock = new THREE.Clock();
  let rafId: number;
  const PERIOD = 5.0; // seconds per full traversal

  function animate() {
    rafId = requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    // traveller: 3.25 one-way trips between Earth and Sun
    const raw = (elapsed % PERIOD) / PERIOD;
    const tripProgress = raw * TOTAL_TRIPS;
    const tripIndex    = Math.floor(tripProgress);
    const withinTrip   = tripProgress - tripIndex;
    const goingToSun   = tripIndex % 2 === 0;
    const lerpT        = goingToSun ? withinTrip : 1 - withinTrip;
    const tPos = new THREE.Vector3(
      EARTH_POS.x + (SUN_POS.x - EARTH_POS.x) * lerpT,
      Math.sin(withinTrip * Math.PI) * arcH,
      0,
    );

    traveller.position.copy(tPos);
    travGlow.position.copy(tPos);

    // shift tail
    for (let i = TAIL_LEN - 1; i > 0; i--) tailHistory[i].copy(tailHistory[i - 1]);
    tailHistory[0].copy(tPos);

    // write tail geometry
    const pos = tailGeo.attributes.position as THREE.BufferAttribute;
    const col = tailGeo.attributes.color as THREE.BufferAttribute;
    for (let i = 0; i < TAIL_LEN; i++) {
      pos.setXYZ(i, tailHistory[i].x, tailHistory[i].y, tailHistory[i].z);
      const alpha = (TAIL_LEN - i) / TAIL_LEN;
      col.setXYZ(i, 1.0 * alpha, 0.42 * alpha, 0.62 * alpha);
    }
    pos.needsUpdate = true;
    col.needsUpdate = true;

    // rotations
    earthGroup.rotation.y += 0.005;
    sun.rotation.y       += 0.001;
    sunGlow.material.opacity  = 0.7 + Math.sin(elapsed * 1.8) * 0.12;
    travGlow.material.opacity = 0.6 + Math.sin(elapsed * 6) * 0.2;

    scene.rotation.y = rotY;
    scene.rotation.x = rotX;

    renderer.render(scene, camera);
  }
  animate();

  return () => {
    cancelAnimationFrame(rafId);
    renderer.domElement.removeEventListener("mousedown", onDown);
    window.removeEventListener("mouseup", onUp);
    window.removeEventListener("mousemove", onMove);
    renderer.dispose();
  };
}
