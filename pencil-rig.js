import * as THREE from 'three';

const DEG = Math.PI / 180;
export const clamp01 = (x) => Math.min(1, Math.max(0, x));
export const seg = (p, a, b) => clamp01((p - a) / (b - a));
export const smoother = (x) => x * x * x * (x * (x * 6 - 15) + 10); // smootherstep: 0→1, derivadas 0 nas pontas

const AX_X = new THREE.Vector3(1, 0, 0);
const AX_Y = new THREE.Vector3(0, 1, 0);
const AX_Z = new THREE.Vector3(0, 0, 1);

/* ------------------------------------------------------------------ *
 * PASSO 1 — medir o prisma do corpo em vez de assumir.
 * `root` = grupo do lápis com o eixo longitudinal em +Y; `bodyMesh` = SÓ o prisma poligonal.
 * ------------------------------------------------------------------ */
export function measureBody(root, bodyMesh) {
  root.updateWorldMatrix(true, true);
  const toRoot = new THREE.Matrix4().copy(root.matrixWorld).invert().multiply(bodyMesh.matrixWorld);
  const g = bodyMesh.geometry.index ? bodyMesh.geometry.toNonIndexed() : bodyMesh.geometry;
  const P = g.attributes.position;
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  const e1 = new THREE.Vector3(), e2 = new THREE.Vector3(), n = new THREE.Vector3();
  const angles = [];
  let R = 0, yMin = Infinity, yMax = -Infinity;

  for (let i = 0; i + 2 < P.count; i += 3) {
    a.fromBufferAttribute(P, i).applyMatrix4(toRoot);
    b.fromBufferAttribute(P, i + 1).applyMatrix4(toRoot);
    c.fromBufferAttribute(P, i + 2).applyMatrix4(toRoot);
    for (const v of [a, b, c]) R = Math.max(R, Math.hypot(v.x, v.z));
    n.copy(e1.subVectors(b, a)).cross(e2.subVectors(c, a)).normalize();
    if (Math.abs(n.y) > 0.02) continue;                       // ignora tampas
    const cx = (a.x + b.x + c.x) / 3, cz = (a.z + b.z + c.z) / 3;
    if (n.x * cx + n.z * cz < 0) n.negate();                  // normal virada para fora
    angles.push(Math.atan2(n.x, n.z));                        // ângulo θ com n = (sinθ, 0, cosθ)
    yMin = Math.min(yMin, a.y, b.y, c.y);
    yMax = Math.max(yMax, a.y, b.y, c.y);
  }

  const TWO_PI = 2 * Math.PI;
  const uniq = [];
  for (const t of angles.map((t) => ((t % TWO_PI) + TWO_PI) % TWO_PI).sort((x, y) => x - y)) {
    if (!uniq.length || t - uniq[uniq.length - 1] > 1e-3) uniq.push(t);
  }
  if (uniq.length > 1 && TWO_PI - uniq[uniq.length - 1] + uniq[0] < 1e-3) uniq.pop(); // 0 ≡ 2π
  const nSides = uniq.length;
  const SIDE = TWO_PI / nSides;
  const faceTheta = ((uniq[0] % SIDE) + SIDE) % SIDE;
  return { nSides, R, faceTheta, yMin, yMax, faceAngles: uniq };
}

/* ------------------------------------------------------------------ *
 * PASSO 2 — o rig. `m` = { nSides, R, faceTheta, yFaceMid, faceLen, heroScale, heroPos }
 * ------------------------------------------------------------------ */
export function createPencilRig(root, camera, m) {
  const SIDE = (2 * Math.PI) / m.nSides;
  const S_FACE = 2 * m.R * Math.sin(Math.PI / m.nSides);   // largura da face (=R no hexágono)
  const APO = m.R * Math.cos(Math.PI / m.nSides);          // eixo → plano da face
  const FACE0 = m.faceTheta;

  const TILT_HERO = -50 * DEG;      // eixo do lápis a 40° da horizontal (ponta em baixo-esquerda)
  const TILT_END = -90 * DEG;       // eixo horizontal: ponta à esquerda, borracha à direita
  const PITCH_HERO = 0 * DEG;       // >0 só se o hero actual tiver inclinação para a câmara; no fim é SEMPRE 0
  const IDLE_OMEGA = 40 * DEG;      // rad/s — giro da hero (9 s por volta)
  const MIN_SPIN = 540 * DEG;       // giro mínimo durante o scroll (1,5 voltas)
  const MARGIN = 1.15;              // sobre-cobertura do ecrã no fim
  const EPS = 1e-4;

  // fases em função de p (0..1)
  const PH = { rollTilt: [0.0, 0.60], expand: [0.38, 0.92], panel: [0.88, 0.98], decor: [0.0, 0.25] };

  let roll = 0, latched = false, rollStart = 0, rollTarget = 0;

  // escala final: a LARGURA da face tem de cobrir a ALTURA visível no plano da face (z = 0)
  const kEnd = () => {
    if (camera.isOrthographicCamera) return (MARGIN * (camera.top - camera.bottom) / camera.zoom) / S_FACE;
    const T = Math.tan((camera.fov * DEG) / 2);                 // fov vertical
    return (MARGIN * 2 * camera.position.z * T) / S_FACE;       // altura visível em z=0 → 2·D·T
  };
  const targetFor = (rs) => Math.ceil((rs + MIN_SPIN + FACE0) / SIDE) * SIDE - FACE0;

  // função PURA: não toca na cena
  function pose(p, rs, rt) {
    const eA = smoother(seg(p, ...PH.rollTilt));
    const eB = smoother(seg(p, ...PH.expand));
    const psi = rs + (rt - rs) * eA;                              // roll no eixo do lápis
    const tau = TILT_HERO + (TILT_END - TILT_HERO) * eA;          // rotação no plano do ecrã
    const pitch = PITCH_HERO * (1 - eA);
    const q = new THREE.Quaternion()
      .setFromAxisAngle(AX_X, pitch)
      .multiply(new THREE.Quaternion().setFromAxisAngle(AX_Z, tau))
      .multiply(new THREE.Quaternion().setFromAxisAngle(AX_Y, psi));   // roll aplicado primeiro
    const kE = kEnd();
    const k = m.heroScale * Math.pow(kE / m.heroScale, eB);       // zoom exponencial
    const th = -rt;                                               // ângulo local da face que acaba de frente
    const fc = new THREE.Vector3(APO * Math.sin(th), m.yFaceMid, APO * Math.cos(th))
      .applyQuaternion(q).multiplyScalar(k);                      // centro da face, relativo à origem do grupo
    const pos = m.heroPos.clone().multiplyScalar(1 - eB).addScaledVector(fc, -eB);
    return { q, k, pos, psi, tau, eA, eB, th, fc };
  }

  function tick(p, dt, reduceMotion = false) {
    if (p <= EPS) {
      latched = false;
      roll += (reduceMotion ? 0 : IDLE_OMEGA) * dt;
    } else if (!latched) {
      latched = true;
      rollStart = roll;
      rollTarget = targetFor(rollStart);
    }
    const s = latched ? pose(p, rollStart, rollTarget) : pose(0, roll, roll);
    root.quaternion.copy(s.q);
    root.scale.setScalar(s.k);
    root.position.copy(s.pos);
    return s;
  }

  // ---- verificação numérica (PASSO 4) ----
  function verifyEnd(rs = 0.3) {
    const rt = targetFor(rs);
    const s = pose(1, rs, rt);
    const n = new THREE.Vector3(Math.sin(s.th), 0, Math.cos(s.th)).applyQuaternion(s.q);
    const centre = new THREE.Vector3(APO * Math.sin(s.th), m.yFaceMid, APO * Math.cos(s.th))
      .applyQuaternion(s.q).multiplyScalar(s.k).add(s.pos);
    const tdir = new THREE.Vector3(Math.cos(s.th), 0, -Math.sin(s.th));
    const c0 = new THREE.Vector3(APO * Math.sin(s.th), m.yFaceMid, APO * Math.cos(s.th));
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
      const v = c0.clone().addScaledVector(tdir, (sx * S_FACE) / 2).addScaledVector(AX_Y, (sy * m.faceLen) / 2)
        .applyQuaternion(s.q).multiplyScalar(s.k).add(s.pos).project(camera);
      minX = Math.min(minX, v.x); maxX = Math.max(maxX, v.x);
      minY = Math.min(minY, v.y); maxY = Math.max(maxY, v.y);
    }
    const out = {
      normalDotZ: n.dot(AX_Z),                                   // tem de ser ≈ 1
      faceCentreWorld: [centre.x, centre.y, centre.z],           // tem de ser ≈ [0,0,0]
      ndc: { minX, maxX, minY, maxY },                           // tem de conter [-1,1]x[-1,1]
      kEnd: kEnd(),
    };
    out.ok = out.normalDotZ > 0.9999 && Math.hypot(...out.faceCentreWorld) < 1e-6 * Math.max(1, s.k)
      && minX <= -1 && maxX >= 1 && minY <= -1 && maxY >= 1;
    return out;
  }

  function sweep(rs = 0.3, steps = 1000) {
    const rt = targetFor(rs);
    let prev = null, maxDPsi = 0, maxKRatio = 1, monotonic = true, maxDPos = 0;
    for (let i = 0; i <= steps; i++) {
      const s = pose(i / steps, rs, rt);
      if (prev) {
        maxDPsi = Math.max(maxDPsi, Math.abs(s.psi - prev.psi));
        maxKRatio = Math.max(maxKRatio, s.k / prev.k);
        maxDPos = Math.max(maxDPos, s.pos.clone().sub(prev.pos).length());
        if (s.k < prev.k - 1e-12 || s.psi < prev.psi - 1e-12) monotonic = false;
      }
      prev = s;
    }
    return { totalSpinDeg: (rt - rs) / DEG, maxDPsiPerStepDeg: maxDPsi / DEG, maxKRatioPerStep: maxKRatio, maxDPosPerStep: maxDPos, monotonic };
  }

  return { tick, pose, verifyEnd, sweep, PH, S_FACE, APO, kEnd };
}
