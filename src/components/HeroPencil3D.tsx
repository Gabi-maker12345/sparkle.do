"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { clamp01, createPencilRig, measureBody, seg, smoother } from "../../pencil-rig.js";

const CAMERA_DISTANCE = 10;
const VIEW_HEIGHT_MIN = 6.6;
const VIEW_WIDTH_FIT = 5.5;

function makePencil(): {
  group: THREE.Group;
  body: THREE.Mesh;
  band: THREE.Mesh;
  meshes: THREE.Mesh[];
} {
  const group = new THREE.Group();

  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0xedc3b7,
    roughness: 0.62,
    metalness: 0.02,
    flatShading: true,
  });
  const capMaterial = new THREE.MeshStandardMaterial({
    color: 0xf1d0c5,
    roughness: 0.66,
    flatShading: true,
  });
  const wineMaterial = new THREE.MeshStandardMaterial({
    color: 0x4e1e2a,
    roughness: 0.52,
    flatShading: true,
  });
  const woodMaterial = new THREE.MeshStandardMaterial({
    color: 0xe7c1aa,
    roughness: 0.8,
    flatShading: true,
  });
  const graphiteMaterial = new THREE.MeshStandardMaterial({
    color: 0x2a1119,
    roughness: 0.4,
    flatShading: true,
  });

  const radius = 0.3;
  const bodyLength = 4.6;

  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, bodyLength, 6, 1, false),
    bodyMaterial,
  );
  body.name = "pencil-body";
  group.add(body);

  const band = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 1.02, radius * 1.02, 0.26, 6, 1, false),
    wineMaterial,
  );
  band.name = "pencil-band";
  band.position.y = 1.9;
  group.add(band);

  const ferrule = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 1.04, radius * 1.04, 0.18, 6, 1, false),
    wineMaterial,
  );
  ferrule.name = "pencil-ferrule";
  ferrule.position.y = bodyLength / 2 + 0.09;
  group.add(ferrule);

  const eraser = new THREE.Mesh(
    new THREE.SphereGeometry(radius * 0.94, 18, 12),
    capMaterial,
  );
  eraser.name = "pencil-eraser";
  eraser.scale.y = 0.55;
  eraser.position.y = bodyLength / 2 + 0.3;
  group.add(eraser);

  const wood = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, 0.1, 0.7, 6, 1, false),
    woodMaterial,
  );
  wood.name = "pencil-wood";
  wood.position.y = -bodyLength / 2 - 0.35;
  group.add(wood);

  const graphite = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.001, 0.2, 6, 1, false),
    graphiteMaterial,
  );
  graphite.name = "pencil-graphite";
  graphite.position.y = -bodyLength / 2 - 0.7 - 0.1;
  group.add(graphite);

  const meshes = group.children.filter(
    (child): child is THREE.Mesh => child instanceof THREE.Mesh,
  );
  return { group, body, band, meshes };
}

export default function HeroPencil3D() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const hero = mount.closest<HTMLElement>("[data-hero-pencil]") ?? document.querySelector<HTMLElement>("[data-hero-pencil]");
    const panel = hero?.querySelector<HTMLElement>(".hero-story") ?? null;
    const panelBg = hero?.querySelector<HTMLElement>(".hero-panel-bg") ?? null;
    const panelDecor = hero?.querySelector<HTMLElement>(".hero-panel-decor") ?? null;
    const blocks = Array.from(hero?.querySelectorAll<HTMLElement>("[data-story-block]") ?? []);
    const decorNodes = [
      hero?.querySelector<HTMLElement>(".hero-float"),
      hero?.querySelector<HTMLElement>(".hero-emojis"),
      hero?.querySelector<HTMLElement>(".hero-kicker"),
      hero?.querySelector<HTMLElement>(".hero-cue"),
      hero?.querySelector<HTMLElement>(".pencil-shadow"),
    ].filter((node): node is HTMLElement => Boolean(node));

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.05, 500);
    camera.position.set(0, 0, CAMERA_DISTANCE);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.AmbientLight(0xfff6ef, 1.35));
    const key = new THREE.DirectionalLight(0xffffff, 2.15);
    key.position.set(3.5, 6, 7);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xf0c8bb, 0.95);
    fill.position.set(-5, 1.5, 3);
    scene.add(fill);

    const pencil = makePencil();
    const pencilRig = new THREE.Group();
    pencilRig.add(pencil.group);
    scene.add(pencilRig);

    pencil.group.traverse((object) => {
      if (object instanceof THREE.Mesh) object.frustumCulled = false;
    });

    pencil.group.updateWorldMatrix(true, true);
    const measured = measureBody(pencil.group, pencil.body);
    const bandGeometry = pencil.band.geometry as THREE.CylinderGeometry;
    const bandHeight = Number(bandGeometry.parameters?.height ?? 0.26);
    const smoothTop = pencil.band.position.y - bandHeight / 2;
    const smoothBottom = measured.yMin;
    const faceLen = Math.max(0.1, smoothTop - smoothBottom);
    const yFaceMid = (smoothTop + smoothBottom) / 2;

    const m = {
      nSides: measured.nSides,
      R: measured.R,
      faceTheta: measured.faceTheta,
      yFaceMid,
      faceLen,
      heroScale: 1,
      heroPos: new THREE.Vector3(0, 0, 0),
    };
    const rig = createPencilRig(pencilRig, camera, m);

    let width = 1;
    let height = 1;
    let viewHeight = VIEW_HEIGHT_MIN;
    let heroTop = 0;
    let animationSpan = 1;
    let chapterSpan = 1;
    let ps = 0;
    let forcedP: number | null = null;
    let faceColor: string | null = null;
    let raf = 0;
    let last = performance.now();
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");

    const rawP = () => {
      if (!hero) return 0;
      return clamp01((window.scrollY - heroTop) / animationSpan);
    };

    const rawChapter = () => {
      if (!hero) return 0;
      return clamp01((window.scrollY - heroTop - animationSpan) / chapterSpan);
    };

    const measure = () => {
      const rect = mount.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      renderer.setSize(width, height, false);

      if (hero) {
        heroTop = hero.getBoundingClientRect().top + window.scrollY;
        const baseVH = window.innerWidth <= 520 ? 380 : window.innerWidth <= 860 ? 390 : 420;
        animationSpan = Math.max(1, ((baseVH - 100) * window.innerHeight) / 100);
        chapterSpan = Math.max(
          1,
          hero.offsetHeight - window.innerHeight - animationSpan,
        );
      }

      const aspect = width / height;
      viewHeight = Math.max(VIEW_HEIGHT_MIN, VIEW_WIDTH_FIT / Math.max(0.1, aspect));
      camera.left = (-viewHeight * aspect) / 2;
      camera.right = (viewHeight * aspect) / 2;
      camera.top = viewHeight / 2;
      camera.bottom = -viewHeight / 2;
      camera.updateProjectionMatrix();

      faceColor = null;
      if (forcedP === null) ps = rawP();
    };

    const faceColorFromCanvas = () => {
      const gl = renderer.getContext();
      const px = new Uint8Array(4);
      gl.readPixels(
        gl.drawingBufferWidth >> 1,
        gl.drawingBufferHeight >> 1,
        1,
        1,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        px,
      );
      return `rgb(${px[0]}, ${px[1]}, ${px[2]})`;
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
      last = now;

      const target = forcedP ?? rawP();
      if (forcedP !== null) {
        ps = forcedP;
      } else {
        ps += (target - ps) * (1 - Math.exp(-dt * 10));
        if (Math.abs(target - ps) < 1e-4) ps = target;
      }

      rig.tick(ps, dt, reduce.matches);

      const eD = 1 - seg(ps, 0, 0.25);
      for (const node of decorNodes) node.style.opacity = String(eD);

      const eC = smoother(seg(ps, 0.88, 0.98));
      const chapters = eC > 0.0001;
      const chapter = rawChapter();
      const step = chapter < 1 / 3 ? 0 : chapter < 2 / 3 ? 1 : 2;
      if (panel) {
        panel.style.transition = "none";
        panel.style.opacity = String(eC);
        panel.style.visibility = chapters ? "visible" : "hidden";
        panel.style.pointerEvents = eC >= 0.99 ? "auto" : "none";
      }
      if (panelBg) panelBg.style.opacity = String(eC);
      if (panelDecor) {
        panelDecor.style.transition = "none";
        panelDecor.style.opacity = String(eC);
      }
      if (hero) {
        hero.classList.toggle("is-chapters", chapters);
        hero.classList.toggle("is-step-1", chapters && step === 0);
        hero.classList.toggle("is-step-2", chapters && step === 1);
        hero.classList.toggle("is-step-3", chapters && step === 2);
      }
      blocks.forEach((block, index) => {
        block.classList.toggle("is-active", chapters && index === step);
      });

      const hidden = ps >= 0.995;
      if (!hidden || (eC > 0.2 && !faceColor)) {
        renderer.render(scene, camera);
      }
      if (eC > 0.2 && !faceColor) {
        faceColor = faceColorFromCanvas();
        if (panelBg) {
          panelBg.style.backgroundImage = "none";
          panelBg.style.backgroundColor = faceColor;
        }
      }
      renderer.domElement.style.visibility = hidden ? "hidden" : "visible";

      mount.dataset.p = ps.toFixed(4);
      mount.dataset.view = viewHeight.toFixed(2);
    };

    const onResize = () => measure();
    const observer = new ResizeObserver(onResize);
    observer.observe(mount);
    window.addEventListener("resize", onResize);

    measure();
    rig.tick(ps, 0, reduce.matches);
    raf = requestAnimationFrame(loop);

    const api = {
      setP: (value: number) => {
        forcedP = clamp01(value);
        ps = forcedP;
      },
      release: () => {
        forcedP = null;
      },
      verifyEnd: () => rig.verifyEnd(),
      sweep: () => rig.sweep(),
      measure: measured,
      m,
      pose: (p: number, rs = 0.3) => rig.pose(p, rs, Math.ceil((rs + Math.PI * 3 + measured.faceTheta) / ((Math.PI * 2) / measured.nSides)) * ((Math.PI * 2) / measured.nSides) - measured.faceTheta),
      getP: () => ps,
      getChapter: () => rawChapter(),
      getFaceColor: () => faceColor,
      meshCount: pencil.meshes.length,
    };
    (window as unknown as { __pencil: typeof api }).__pencil = api;

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      observer.disconnect();
      const current = (window as unknown as { __pencil?: typeof api }).__pencil;
      if (current === api) delete (window as unknown as { __pencil?: typeof api }).__pencil;
      renderer.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      renderer.domElement.remove();
    };
  }, []);

  return <div className="hero-3d" ref={mountRef} aria-hidden="true" />;
}
