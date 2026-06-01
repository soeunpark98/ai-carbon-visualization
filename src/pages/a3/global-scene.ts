import * as THREE from "three";

const EARTH_TEX = "https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg";
const CLOUD_TEX = "https://threejs.org/examples/textures/planets/earth_clouds_1024.png";

export function initGlobalScene(container: HTMLElement, annualKm: number): () => void {
  const W = container.clientWidth || 860;
  const H = 340;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMappingExposure = 1.0;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 800);
  camera.position.set(0, 2.5, 32);
  camera.lookAt(0, 0, 0);

  // ── Stars ──────────────────────────────────────────────────────────
  const starPos = new Float32Array(2500 * 3);
  for (let i = 0; i < starPos.length; i++) starPos[i] = (Math.random() - 0.5) * 250;
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.14, sizeAttenuation: true })));

  // ── Layout ─────────────────────────────────────────────────────────
  const EARTH_SUN_KM = 149_600_000;
  const EARTH_POS = new THREE.Vector3(-16, 0, 0);
  const SUN_POS = new THREE.Vector3(14, 0, 0);

  // ── Sun (sphere glow — stays round when the scene rotates) ─────────
  const SUN_R = 2.35;
  const sunGroup = new THREE.Group();
  sunGroup.position.copy(SUN_POS);
  scene.add(sunGroup);

  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(SUN_R, 48, 48),
    new THREE.MeshBasicMaterial({ color: 0xffcc22 }),
  );
  const sunCorona = new THREE.Mesh(
    new THREE.SphereGeometry(SUN_R * 1.28, 40, 40),
    new THREE.MeshBasicMaterial({
      color: 0xffcc44,
      transparent: true,
      opacity: 0.34,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  const sunHalo = new THREE.Mesh(
    new THREE.SphereGeometry(SUN_R * 1.55, 32, 32),
    new THREE.MeshBasicMaterial({
      color: 0xff9922,
      transparent: true,
      opacity: 0.16,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  sunGroup.add(sun, sunCorona, sunHalo);

  // ── Earth ──────────────────────────────────────────────────────────
  const EARTH_R = 1.75;
  const earthGroup = new THREE.Group();
  earthGroup.position.copy(EARTH_POS);
  scene.add(earthGroup);

  const texLoader = new THREE.TextureLoader();
  const sphereSeg = 64;

  const earthMat = new THREE.MeshPhongMaterial({
    color: 0x6ec8ff,
    emissive: 0x081828,
    specular: 0x99ccff,
    shininess: 22,
  });
  const earth = new THREE.Mesh(
    new THREE.SphereGeometry(EARTH_R, sphereSeg, sphereSeg),
    earthMat,
  );
  earthGroup.add(earth);

  const cloudsMat = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.22,
    depthWrite: false,
  });
  const clouds = new THREE.Mesh(
    new THREE.SphereGeometry(EARTH_R * 1.012, sphereSeg, sphereSeg),
    cloudsMat,
  );
  earthGroup.add(clouds);

  const atmosShell = new THREE.Mesh(
    new THREE.SphereGeometry(EARTH_R * 1.03, sphereSeg, sphereSeg),
    new THREE.MeshPhongMaterial({
      color: 0x7ec8ff,
      transparent: true,
      opacity: 0.08,
      side: THREE.BackSide,
      depthWrite: false,
    }),
  );
  earthGroup.add(atmosShell);

  texLoader.load(
    EARTH_TEX,
    (map) => {
      map.colorSpace = THREE.SRGBColorSpace;
      earthMat.map = map;
      earthMat.color.setHex(0x9fe8ff);
      earthMat.needsUpdate = true;
    },
  );
  texLoader.load(
    CLOUD_TEX,
    (cloudMap) => {
      cloudMap.colorSpace = THREE.SRGBColorSpace;
      cloudsMat.map = cloudMap;
      cloudsMat.needsUpdate = true;
    },
  );


  // ── Car traveller (Earth ↔ Sun, ~3× annual distance) ───────────────
  const TOTAL_TRIPS = Math.round(annualKm / EARTH_SUN_KM); // ≈ 3

  function makeCarSprite() {
    const c = document.createElement("canvas");
    c.width = 200;
    c.height = 100;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, 200, 100);
    ctx.translate(100, 60);
    ctx.scale(4.2, 4.2);
    ctx.translate(-12, -12);
    ctx.fillStyle = "#ffffff";
    const p = new Path2D(
      "M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z",
    );
    ctx.fill(p);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }),
    );
    sprite.scale.set(3.2, 1.6, 1);
    return sprite;
  }

  const car = makeCarSprite();
  scene.add(car);

  const laneCount = Math.ceil(TOTAL_TRIPS);
  const LANE_STEP = 0.78;
  const laneY = (leg: number) => (leg - (laneCount - 1) / 2) * LANE_STEP;

  const laneMatDim = new THREE.LineDashedMaterial({
    color: 0x4a5568,
    transparent: true,
    opacity: 0.35,
    dashSize: 0.4,
    gapSize: 0.28,
  });
  const laneProgress: THREE.Line[] = [];

  function addDashedLine(points: THREE.Vector3[], material: THREE.LineDashedMaterial) {
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material);
    line.computeLineDistances();
    scene.add(line);
    return line;
  }

  for (let i = 0; i < laneCount; i++) {
    const y = laneY(i);
    const base = [
      new THREE.Vector3(EARTH_POS.x, y, 0.15),
      new THREE.Vector3(SUN_POS.x, y, 0.15),
    ];
    addDashedLine(base, laneMatDim);

    const prog = addDashedLine(
      [base[0].clone(), base[0].clone()],
      new THREE.LineDashedMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.2,
        dashSize: 0.35,
        gapSize: 0.22,
      }),
    );
    laneProgress.push(prog);
  }

  const tripLabel = document.createElement("p");
  tripLabel.className =
    "pointer-events-none absolute inset-x-0 top-10 z-10 px-4 text-center font-sans text-lg font-medium tabular-nums leading-snug tracking-tight text-[#e8eaf0] sm:text-xl";
  tripLabel.style.fontFamily = '"Geist", system-ui, sans-serif';
  container.appendChild(tripLabel);

  // ── Lights ─────────────────────────────────────────────────────────
  const sunLight = new THREE.PointLight(0xfffae0, 2.5, 60);
  sunLight.position.copy(SUN_POS);
  scene.add(sunLight);
  scene.add(new THREE.AmbientLight(0x446688, 1.0));
  scene.add(new THREE.HemisphereLight(0xb8dcff, 0x1a2840, 0.45));
  const earthSun = new THREE.DirectionalLight(0xfff6ee, 1.1);
  earthSun.position.copy(SUN_POS);
  scene.add(earthSun);

  // ── Mouse drag (orbit) ─────────────────────────────────────────────
  let isDragging = false;
  let prevX = 0;
  let rotY = 0;

  const onDown = (e: MouseEvent) => { isDragging = true; prevX = e.clientX; (renderer.domElement as HTMLElement).style.cursor = "grabbing"; };
  const onUp   = () => { isDragging = false; (renderer.domElement as HTMLElement).style.cursor = "grab"; };
  const onMove = (e: MouseEvent) => {
    if (!isDragging) return;
    rotY += (e.clientX - prevX) * 0.008;
    prevX = e.clientX;
  };
  renderer.domElement.addEventListener("mousedown", onDown);
  window.addEventListener("mouseup",   onUp);
  window.addEventListener("mousemove", onMove);
  (renderer.domElement as HTMLElement).style.cursor = "grab";

  // ── Animation ──────────────────────────────────────────────────────
  const clock = new THREE.Clock();
  let rafId: number;
  const PERIOD = 12;

  function legEndpoints(leg: number): [THREE.Vector3, THREE.Vector3] {
    const y = laneY(leg);
    const earth = new THREE.Vector3(EARTH_POS.x, y, 0.35);
    const sun = new THREE.Vector3(SUN_POS.x, y, 0.35);
    return leg % 2 === 0 ? [earth, sun] : [sun, earth];
  }

  function animate() {
    rafId = requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    const raw = (elapsed % PERIOD) / PERIOD;
    const tripProgress = raw * TOTAL_TRIPS;
    const activeLeg = Math.min(Math.floor(tripProgress), laneCount - 1);
    const withinTrip = tripProgress - Math.floor(tripProgress);
    const eased = withinTrip * withinTrip * (3 - 2 * withinTrip);
    const goingToSun = activeLeg % 2 === 0;
    const lerpT = goingToSun ? eased : 1 - eased;

    const [legStart, legEnd] = legEndpoints(activeLeg);
    const tPos = new THREE.Vector3().lerpVectors(legStart, legEnd, lerpT);
    car.position.copy(tPos);
    const facingRight = legEnd.x > legStart.x;
    const carW = 3.2;
    const carH = 1.6;
    car.scale.set(facingRight ? carW : -carW, carH, 1);
    (car.material as THREE.SpriteMaterial).rotation = 0;

    const legNum = activeLeg + 1;
    tripLabel.textContent = `Trips from Earth to Sun ${legNum}/${TOTAL_TRIPS}`;

    const finishedLegs = Math.floor(tripProgress);
    for (let i = 0; i < laneCount; i++) {
      const [a, b] = legEndpoints(i);
      const line = laneProgress[i];
      const mat = line.material as THREE.LineDashedMaterial;
      if (i < finishedLegs) {
        line.geometry.setFromPoints([a, b]);
        mat.opacity = 0.9;
      } else if (i === finishedLegs) {
        line.geometry.setFromPoints([a, tPos]);
        mat.opacity = 0.65;
      } else {
        line.geometry.setFromPoints([a, a]);
        mat.opacity = 0.12;
      }
      line.computeLineDistances();
    }

    earthGroup.rotation.y += 0.004;
    sun.rotation.y += 0.001;
    const pulse = 0.7 + Math.sin(elapsed * 1.8) * 0.12;
    (sunCorona.material as THREE.MeshBasicMaterial).opacity = 0.34 * pulse;
    (sunHalo.material as THREE.MeshBasicMaterial).opacity = 0.16 * pulse;

    scene.rotation.y = rotY;

    renderer.render(scene, camera);
  }
  animate();

  return () => {
    cancelAnimationFrame(rafId);
    renderer.domElement.removeEventListener("mousedown", onDown);
    window.removeEventListener("mouseup", onUp);
    window.removeEventListener("mousemove", onMove);
    tripLabel.remove();
    renderer.dispose();
  };
}
