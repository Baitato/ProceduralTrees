// Import Three.js and required libraries
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { createNoise2D } from "simplex-noise";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import * as dat from "dat.gui";

import { makeHex, hexagonGeometries } from "./terra";
import PRESETS from "./presets";

const gui = new dat.GUI();
const options = {
  selectedPreset: "tree",
};

// Initialize Three.js
const scene = new THREE.Scene();
scene.background = new THREE.Color("#FFEECC");

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  100000
);
camera.position.set(0, 0, 100);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false;

// const axesHelper = new THREE.AxesHelper(50);
// scene.add(axesHelper);

let branchLine = null;
let leavesLine = null;

function generate(selectedPreset = PRESETS["savanna"]) {
  scene.remove(branchLine);
  scene.remove(leavesLine);

  let { axiom, rules, iterations, angle, distance, minAngle, maxAngle } =
    selectedPreset;

  // Generate the plant string
  let plantString = axiom;
  for (let i = 0; i < iterations; i++) {
    plantString = plantString.replace(/./g, (char) => {
      if (rules[char]) {
        if (Array.isArray(rules[char])) {
          const ruleSet = rules[char];
          const randomIndex = Math.floor(Math.random() * ruleSet.length);
          return ruleSet[randomIndex].value;
        } else {
          return rules[char];
        }
      }
      return char;
    });
  }

  // Create a material for the plant
  const leavesMat = new THREE.LineBasicMaterial({
    color: 0x92f91b,
  });
  const branchMat = new THREE.LineBasicMaterial({ color: 0x964b00 });

  // Interpret the plant string and create a 3D plant
  const positions = [];
  const leafPositions = [];
  const stack = [];
  let currentPosition = new THREE.Vector3(0, 6, 0);
  let nextPosition;
  let currentDirection = new THREE.Vector3(0, 1, 0);
  const quaternion = new THREE.Quaternion();

  let leaf = false;

  // Make seeder
  function seededRandom(seed) {
    let x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  for (let i = 0; i < plantString.length; i++) {
    const char = plantString[i];

    if (!angle)
      angle = seededRandom(seededRandom(i)) * (maxAngle - minAngle) + minAngle;

    if (char === "F") {
      nextPosition = currentPosition
        .clone()
        .add(currentDirection.clone().multiplyScalar(distance));

      positions.push(currentPosition.x, currentPosition.y, currentPosition.z);
      positions.push(nextPosition.x, nextPosition.y, nextPosition.z);

      currentPosition = nextPosition;
    } else if (char === "+") {
      const axis = new THREE.Vector3(0, 0, 1);
      const angleInRadians = THREE.MathUtils.degToRad(angle);
      quaternion.setFromAxisAngle(axis, angleInRadians);
      currentDirection.applyQuaternion(quaternion);
    } else if (char === "-") {
      const axis = new THREE.Vector3(0, 0, 1);
      const angleInRadians = THREE.MathUtils.degToRad(-angle);
      quaternion.setFromAxisAngle(axis, angleInRadians);
      currentDirection.applyQuaternion(quaternion);
    } else if (char === "/") {
      const axis = currentDirection.clone();
      const angleInRadians = THREE.MathUtils.degToRad(angle);
      quaternion.setFromAxisAngle(axis, angleInRadians);
      currentDirection.applyQuaternion(quaternion);
    } else if (char === "\\") {
      const axis = currentDirection.clone();
      const angleInRadians = THREE.MathUtils.degToRad(-angle);
      quaternion.setFromAxisAngle(axis, angleInRadians);
      currentDirection.applyQuaternion(quaternion);
    } else if (char === "*") {
      const axis = new THREE.Vector3(1, 0, 0);
      const angleInRadians = THREE.MathUtils.degToRad(angle);
      quaternion.setFromAxisAngle(axis, angleInRadians);
      currentDirection.applyQuaternion(quaternion);
    } else if (char === "^") {
      const axis = new THREE.Vector3(1, 0, 0);
      const angleInRadians = THREE.MathUtils.degToRad(-angle);
      quaternion.setFromAxisAngle(axis, angleInRadians);
      currentDirection.applyQuaternion(quaternion);
    } else if (char === "[") {
      stack.push({
        position: currentPosition.clone(),
        direction: currentDirection.clone(),
      });

      leaf = false;
    } else if (char === "]") {
      const { position, direction } = stack.pop();
      currentPosition = position;
      currentDirection = direction;

      if (!leaf) {
        for (let i = 0; i < 6; i++) positions.pop();

        leafPositions.push(
          currentPosition.x,
          currentPosition.y,
          currentPosition.z
        );
        leafPositions.push(nextPosition.x, nextPosition.y, nextPosition.z);

        leaf = true;
      }
    }
  }

  const leavesGeo = new THREE.BufferGeometry();
  leavesGeo.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(leafPositions, 3)
  );

  const branchGeo = new THREE.BufferGeometry();
  branchGeo.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );

  leavesMat.linewidth = 12;
  branchLine = new THREE.LineSegments(branchGeo, branchMat);
  leavesLine = new THREE.LineSegments(leavesGeo, leavesMat);

  scene.add(branchLine);
  scene.add(leavesLine);
}

// generate();
gui
  .add(options, "selectedPreset")
  .onFinishChange((value) => generate(PRESETS[value]));

// Set environment map
let envmap;

(async function () {
  let pmrem = new THREE.PMREMGenerator(renderer);
  let envmapTexture = await new RGBELoader()
    .setDataType(THREE.FloatType)
    .loadAsync("/assets/sunset.hdr");
  envmap = pmrem.fromEquirectangular(envmapTexture).texture;

  // Load textures
  let textures = {
    dirt: await new THREE.TextureLoader().loadAsync("/assets/dirt.png"),
    grass: await new THREE.TextureLoader().loadAsync("/assets/grass.jpg"),
    sand: await new THREE.TextureLoader().loadAsync("/assets/sand.jpg"),
    stone: await new THREE.TextureLoader().loadAsync("/assets/stone.png"),
  };

  const MAX_HEIGHT = 10;

  for (let i = -10; i <= 10; i++) {
    for (let j = -10; j <= 10; j++) {
      let position = tileToPosition(i, j);

      const noise2D = createNoise2D();
      let noise = (noise2D(i * 0.005, j * 0.005) + 1) * 0.5;
      noise = Math.pow(noise, 1);

      makeHex(noise * MAX_HEIGHT, position);
    }
  }

  let hexagonMesh = new THREE.Mesh(
    hexagonGeometries,
    new THREE.MeshStandardMaterial({
      envMap: envmap,
      flatShading: true,
      map: textures.grass,
    })
  );
  scene.add(hexagonMesh);

  function tileToPosition(tileX, tileY) {
    return new THREE.Vector2(
      1.75 * tileX + (tileY % 2) * 0.5 * 1.77,
      tileY * 1.535
    );
  }
})();

// Render the scene
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();
