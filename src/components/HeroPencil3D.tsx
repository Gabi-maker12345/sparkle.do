"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const FACE_ANGLE = -Math.PI / 6;
const ZOOM = 36;

const smooth = (value: number) => value * value * (3 - 2 * value);
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

function makePencil(): { group: THREE.Group; height: number; panelFace: THREE.Mesh } {
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
  group.add(body);

  const band = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 1.02, radius * 1.02, 0.26, 6, 1, false),
    wineMaterial,
  );
  band.position.y = 1.9;
  group.add(band);

  const ferrule = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 1.04, radius * 1.04, 0.18, 6, 1, false),
    wineMaterial,
  );
  ferrule.position.y = bodyLength / 2 + 0.09;
  group.add(ferrule);

  const eraser = new THREE.Mesh(
    new THREE.SphereGeometry(radius * 0.94, 18, 12),
    capMaterial,
  );
  eraser.scale.y = 0.55;
  eraser.position.y = bodyLength / 2 + 0.3;
  group.add(eraser);

  const wood = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, 0.1, 0.7, 6, 1, false),
    woodMaterial,
  );
  wood.position.y = -bodyLength / 2 - 0.35;
  group.add(wood);

  const graphite = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.001, 0.2, 6, 1, false),
    graphiteMaterial,
  );
  graphite.position.y = -bodyLength / 2 - 0.7 - 0.1;
  group.add(graphite);

  const panelFace = new THREE.Mesh(
    new THREE.PlaneGeometry(radius * 1.15, bodyLength),
    new THREE.MeshBasicMaterial({ color: 0xf0c8bb }),
  );
  panelFace.position.set(0, 0, radius + 0.012);
  panelFace.visible = false;
  group.add(panelFace);

  const box = new THREE.Box3().setFromObject(group);
  const height = Math.max(0.01, box.max.y - box.min.y);
  return { group, height, panelFace };
}

export default function HeroPencil3D() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 40);
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.AmbientLight(0xfff6ef, 1.35));
    const key = new THREE.DirectionalLight(0xffffff, 2.15);
    key.position.set(3.5, 6, 7);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xf0c8bb, 0.95);
    fill.position.set(-5, 1.5, 3);
    scene.add(fill);

    const { group, height: modelHeight, panelFace } = makePencil();
    scene.add(group);

    const VIEW_HEIGHT = 6.6;
    let width = 1;
    let height = 1;
    let finalX = 0;
    let finalScale = 0.5;
    let p = 0;
    let raf = 0;
    let last = 0;
    const started = performance.now();

    const measure = () => {
      const rect = mount.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      renderer.setSize(width, height, false);

      const aspect = width / height;
      camera.left = (-VIEW_HEIGHT * aspect) / 2;
      camera.right = (VIEW_HEIGHT * aspect) / 2;
      camera.top = VIEW_HEIGHT / 2;
      camera.bottom = -VIEW_HEIGHT / 2;
      camera.updateProjectionMatrix();

      const card = document.querySelector<HTMLElement>(".pencil-dock");
      if (card) {
        const cardRect = card.getBoundingClientRect();
        const centerX = cardRect.left + cardRect.width / 2 - rect.left;
        const worldPerPixel = VIEW_HEIGHT / height;
        finalX = (centerX - width / 2) * worldPerPixel;
        finalScale = Math.max(
          0.18,
          (cardRect.height * 0.78 * VIEW_HEIGHT) / (modelHeight * height),
        );
      }
    };

    const onPencil = (event: Event) => {
      const detail = (event as CustomEvent<{ p: number }>).detail;
      if (detail && typeof detail.p === "number") p = clamp(detail.p);
    };

    const resize = () => measure();

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const delta = Math.min(0.05, (now - last) / 1000 || 0.016);
      last = now;
      const time = (now - started) / 1000;

      let rz = -26;
      let ry = FACE_ANGLE + 0.7;
      let zoom = 1;
      let scale = 1;
      let x = 0;

      if (p < 0.06) {
        ry = FACE_ANGLE + 0.7 + time * 0.32;
      } else if (p < 0.14) {
        const t = smooth(clamp((p - 0.06) / 0.08));
        rz = lerp(-26, -90, t);
        ry = lerp(FACE_ANGLE + 0.7, FACE_ANGLE, t);
      } else if (p < 0.22) {
        const t = smooth(clamp((p - 0.14) / 0.08));
        rz = -90;
        ry = FACE_ANGLE;
        zoom = lerp(1, ZOOM, t);
      } else if (p < 0.78) {
        rz = -90;
        ry = FACE_ANGLE;
        zoom = ZOOM;
      } else if (p < 0.9) {
        const e = smooth(clamp((p - 0.78) / 0.12));
        rz = lerp(-90, 0, e);
        ry = lerp(FACE_ANGLE, 14, e);
        zoom = lerp(ZOOM, 1, e);
        scale = lerp(1, finalScale, e);
        x = lerp(0, finalX, e);
      } else {
        rz = 0;
        ry = 14;
        zoom = 1;
        scale = finalScale;
        x = finalX;
      }

      group.rotation.set(0, ry, rz);
      group.position.set(x, 0, 0);
      group.scale.setScalar(scale);
      panelFace.visible = p >= 0.14 && p < 0.78;
      camera.zoom = zoom;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    };

    const hero = document.querySelector<HTMLElement>("[data-hero-pencil]");
    if (hero) {
      const total = Math.max(1, hero.offsetHeight - window.innerHeight);
      p = clamp(-hero.getBoundingClientRect().top / total);
    }

    window.addEventListener("sparkle:pencil", onPencil);
    window.addEventListener("resize", resize);
    const observer = new ResizeObserver(resize);
    observer.observe(mount);

    measure();
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("sparkle:pencil", onPencil);
      window.removeEventListener("resize", resize);
      observer.disconnect();
      renderer.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div className="hero-3d" ref={mountRef} aria-hidden="true" />;
}
