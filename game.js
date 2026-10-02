import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { PointerLockControls } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/PointerLockControls.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020202);
scene.fog = new THREE.FogExp2(0x050505, 0.035);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 1.7, 8);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

document.body.appendChild(renderer.domElement);

/* -------------------- TEXTURES -------------------- */

const textureLoader = new THREE.TextureLoader();

const woodTexture = textureLoader.load(
  "./assets/old-wood.jpg",
  () => console.log("Wood texture loaded"),
  undefined,
  () => console.error("Could not load assets/old-wood.jpg")
);

woodTexture.colorSpace = THREE.SRGBColorSpace;
woodTexture.wrapS = THREE.RepeatWrapping;
woodTexture.wrapT = THREE.RepeatWrapping;
woodTexture.repeat.set(4, 2);

const realisticWood = new THREE.MeshStandardMaterial({
  map: woodTexture,
  color: 0x9b7a5b,
  roughness: 0.9,
  metalness: 0
});

const darkWoodTexture = woodTexture.clone();
darkWoodTexture.wrapS = THREE.RepeatWrapping;
darkWoodTexture.wrapT = THREE.RepeatWrapping;
darkWoodTexture.repeat.set(3, 2);
darkWoodTexture.needsUpdate = true;

const realisticDarkWood = new THREE.MeshStandardMaterial({
  map: darkWoodTexture,
  color: 0x3d2921,
  roughness: 1,
  metalness: 0
});

const floorTexture = textureLoader.load(
  "./assets/old-floorboards.jpg",
  () => console.log("Floor texture loaded"),
  undefined,
  () => console.error("Could not load assets/old-floorboards.jpg")
);

floorTexture.colorSpace = THREE.SRGBColorSpace;
floorTexture.wrapS = THREE.RepeatWrapping;
floorTexture.wrapT = THREE.RepeatWrapping;
floorTexture.repeat.set(7, 7);

const realisticFloor = new THREE.MeshStandardMaterial({
  map: floorTexture,
  color: 0x8d725b,
  roughness: 0.85,
  metalness: 0
});

/* -------------------- CONTROLS / STATE -------------------- */

const controls = new PointerLockControls(camera, document.body);
scene.add(controls.getObject());

const clock = new THREE.Clock();
const keysDown = {};
const interactables = [];
const walls = [];
const flickerLights = [];

let keysCollected = 0;
let cluesCollected = 0;
let fear = 18;
let timeLeft = 600;
let monsterActive = false;
let gameOver = false;
let flashlightOn = false;

const correctCode = "742";

const message = document.getElementById("message");
const hud = document.getElementById("hud");
const timer = document.getElementById("timer");
const fearFill = document.getElementById("fearFill");
const keyDisplay = document.getElementById("keys");
const clueDisplay = document.getElementById("clues");
const objective = document.getElementById("objective");
const startScreen = document.getElementById("startScreen");
const codePanel = document.getElementById("codePanel");
const endScreen = document.getElementById("endScreen");

/* -------------------- HELPERS -------------------- */

function showMessage(text, duration = 2500) {
  message.textContent = text;

  clearTimeout(showMessage.timeout);

  showMessage.timeout = setTimeout(() => {
    message.textContent = "";
  }, duration);
}

function createMaterial(color, roughness = 1) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness: 0.05
  });
}

function addBox(name, position, size, material, collide = true) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(size.x, size.y, size.z),
    material
  );

  mesh.name = name;
  mesh.position.copy(position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  scene.add(mesh);

  if (collide) {
    walls.push(mesh);
  }

  return mesh;
}

/* -------------------- HOUSE -------------------- */

function addFloor() {
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(42, 42),
    realisticFloor
  );

  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  floor.castShadow = false;

  scene.add(floor);
}

function buildHouse() {
  addFloor();

  const wood = realisticWood;
  const darkWood = realisticDarkWood;

  addBox(
    "north wall",
    new THREE.Vector3(0, 2.5, -12),
    new THREE.Vector3(26, 5, 0.5),
    wood
  );

  addBox(
    "south wall",
    new THREE.Vector3(0, 2.5, 12),
    new THREE.Vector3(26, 5, 0.5),
    wood
  );

  addBox(
    "west wall",
    new THREE.Vector3(-13, 2.5, 0),
    new THREE.Vector3(0.5, 5, 24),
    wood
  );

  addBox(
    "east wall",
    new THREE.Vector3(13, 2.5, 0),
    new THREE.Vector3(0.5, 5, 24),
    wood
  );

  addBox(
    "hall wall A",
    new THREE.Vector3(-5, 2.2, -7),
    new THREE.Vector3(12, 4.5, 0.35),
    darkWood
  );

  addBox(
    "hall wall B",
    new THREE.Vector3(5, 2.2, 1),
    new THREE.Vector3(10, 4.5, 0.35),
    darkWood
  );

  addBox(
    "side wall A",
    new THREE.Vector3(-7, 2.2, 4),
    new THREE.Vector3(0.35, 4.5, 8),
    darkWood
  );

  addBox(
    "side wall B",
    new THREE.Vector3(7, 2.2, -4),
    new THREE.Vector3(0.35, 4.5, 8),
    darkWood
  );

  for (let z = -10; z <= 10; z += 2) {
    addBox(
      "floorboard",
      new THREE.Vector3(0, 0.025, z),
      new THREE.Vector3(25, 0.04, 0.05),
      realisticDarkWood,
      false
    );
  }

  addFurniture(
    new THREE.Vector3(-9, 0.7, -9),
    new THREE.Vector3(2.5, 1.4, 1)
  );

  addFurniture(
    new THREE.Vector3(9, 0.7, 7),
    new THREE.Vector3(2.5, 1.4, 1)
  );

  addFurniture(
    new THREE.Vector3(9, 0.7, -9),
    new THREE.Vector3(1.5, 1.4, 2)
  );

  createFinalDoor(new THREE.Vector3(0, 2.2, -11.7));
}

function addFurniture(position, size) {
  const furniture = addBox(
    "furniture",
    position,
    size,
    realisticDarkWood
  );

  addBox(
    "furniture top",
    new THREE.Vector3(
      position.x,
      position.y + size.y / 2 + 0.08,
      position.z
    ),
    new THREE.Vector3(size.x + 0.15, 0.12, size.z + 0.15),
    realisticWood,
    false
  );

  return furniture;
}

/* -------------------- LIGHTING -------------------- */

function addHauntedLamp(position, color = 0xffa14a, intensity = 2) {
  const light = new THREE.PointLight(color, intensity, 8, 2);

  light.position.copy(position);
  light.castShadow = true;
  light.shadow.mapSize.set(512, 512);
  light.shadow.camera.near = 0.1;
  light.shadow.camera.far = 10;

  scene.add(light);

  flickerLights.push({
    light,
    baseIntensity: intensity
  });

  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 16, 16),
    new THREE.MeshBasicMaterial({ color })
  );

  bulb.position.copy(position);
  scene.add(bulb);
}

function setupLights() {
  const ambient = new THREE.HemisphereLight(
    0x29384a,
    0x080302,
    0.18
  );

  scene.add(ambient);

  addHauntedLamp(
    new THREE.Vector3(-9, 3.2, -8),
    0xff7a24,
    2.4
  );

  addHauntedLamp(
    new THREE.Vector3(8, 3.2, 7),
    0xff6b20,
    2
  );

  addHauntedLamp(
    new THREE.Vector3(0, 3.5, -5),
    0xff9c4b,
    1.7
  );

  addHauntedLamp(
    new THREE.Vector3(-2.5, 3, -10.8),
    0xb10d0d,
    1.2
  );

  addHauntedLamp(
    new THREE.Vector3(2.5, 3, -10.8),
    0xb10d0d,
    1.2
  );
}

function createFlashlight() {
  const flashlight = new THREE.SpotLight(
    0xe8f0ff,
    0,
    19,
    Math.PI / 7,
    0.48,
    1.5
  );

  flashlight.position.set(0, -0.15, -0.25);
  flashlight.castShadow = true;
  flashlight.shadow.mapSize.set(1024, 1024);
  flashlight.shadow.camera.near = 0.1;
  flashlight.shadow.camera.far = 20;
  flashlight.shadow.bias = -0.0005;

  const flashlightTarget = new THREE.Object3D();
  flashlightTarget.position.set(0, -0.1, -10);

  camera.add(flashlight);
  camera.add(flashlightTarget);

  flashlight.target = flashlightTarget;

  return flashlight;
}

/* -------------------- DOOR / ITEMS -------------------- */

function createFinalDoor(position) {
  const door = addBox(
    "final door",
    position,
    new THREE.Vector3(3.2, 4.2, 0.35),
    realisticDarkWood,
    false
  );

  door.userData.type = "door";
  interactables.push(door);
}

function createKey(position, id) {
  const group = new THREE.Group();

  const keyMaterial = new THREE.MeshStandardMaterial({
    color: 0xc69a22,
    metalness: 0.9,
    roughness: 0.25
  });

  const shaft = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.12, 0.8),
    keyMaterial
  );

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.18, 0.055, 10, 24),
    keyMaterial
  );

  shaft.rotation.x = Math.PI / 2;
  ring.rotation.x = Math.PI / 2;
  ring.position.z = -0.37;

  shaft.castShadow = true;
  ring.castShadow = true;

  group.add(shaft, ring);

  group.position.copy(position);
  group.position.y = 0.4;

  group.userData.type = "key";
  group.userData.id = id;

  scene.add(group);
  interactables.push(group);
}

function createClue(position, text, id) {
  const paper = new THREE.Mesh(
    new THREE.PlaneGeometry(1.25, 0.75),
    new THREE.MeshStandardMaterial({
      color: 0xc4b38c,
      roughness: 0.9,
      side: THREE.DoubleSide
    })
  );

  paper.position.copy(position);
  paper.position.y = 0.8;
  paper.rotation.x = -Math.PI / 2;

  paper.castShadow = true;
  paper.receiveShadow = true;

  paper.userData.type = "clue";
  paper.userData.text = text;
  paper.userData.id = id;

  scene.add(paper);
  interactables.push(paper);
}

/* -------------------- MONSTER -------------------- */

function createMonster() {
  const monster = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.65, 1.3, 8, 16),
    new THREE.MeshStandardMaterial({
      color: 0x171010,
      roughness: 1
    })
  );

  body.position.y = 1.25;

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.48, 16, 16),
    new THREE.MeshStandardMaterial({
      color: 0x74645a,
      roughness: 1
    })
  );

  head.position.y = 2.35;

  const eyeMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000
  });

  const eye1 = new THREE.Mesh(
    new THREE.SphereGeometry(0.06, 8, 8),
    eyeMaterial
  );

  const eye2 = eye1.clone();

  eye1.position.set(-0.16, 2.4, -0.39);
  eye2.position.set(0.16, 2.4, -0.39);

  body.castShadow = true;
  body.receiveShadow = true;
  head.castShadow = true;
  head.receiveShadow = true;

  monster.add(body, head, eye1, eye2);

  monster.position.set(10, 0, -5);
  monster.visible = false;

  scene.add(monster);

  return monster;
}

/* -------------------- GAME START -------------------- */

const flashlight = createFlashlight();
const monster = createMonster();

function setupWorld() {
  buildHouse();
  setupLights();

  createKey(new THREE.Vector3(-9, 1, -9), 1);
  createKey(new THREE.Vector3(9, 1, 7), 2);

  createClue(
    new THREE.Vector3(-8, 0, 5),
    "The first number is 7",
    1
  );

  createClue(
    new THREE.Vector3(8, 0, -7),
    "The last two numbers are 42",
    2
  );
}

/* -------------------- HUD -------------------- */

function updateHUD() {
  keyDisplay.textContent = `${keysCollected} / 2`;
  clueDisplay.textContent = `${cluesCollected} / 2`;

  fearFill.style.width = `${fear}%`;

  if (fear > 70) {
    fearFill.style.background = "#d21c1c";
  } else if (fear > 40) {
    fearFill.style.background = "#d28b1c";
  } else {
    fearFill.style.background = "#19952d";
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = Math.floor(timeLeft % 60);

  timer.textContent =
    `${String(minutes).padStart(2, "0")}:` +
    `${String(seconds).padStart(2, "0")}`;

  if (keysCollected === 2 && cluesCollected === 2) {
    objective.textContent = "Go to the final door and enter code 742";
  } else {
    objective.textContent =
      `Find ${2 - keysCollected} keys and ` +
      `${2 - cluesCollected} clues`;
  }
}

/* -------------------- INTERACTION -------------------- */

function nearestInteractable() {
  const player = controls.getObject().position;

  let nearest = null;
  let bestDistance = 2.2;

  for (const object of interactables) {
    if (!object.visible) continue;

    const distance = player.distanceTo(object.position);

    if (distance < bestDistance) {
      nearest = object;
      bestDistance = distance;
    }
  }

  return nearest;
}

function interact() {
  const object = nearestInteractable();

  if (!object) {
    showMessage("Nothing useful nearby.");
    return;
  }

  if (object.userData.type === "key") {
    keysCollected++;
    object.visible = false;

    showMessage(`Key collected. ${keysCollected} / 2`);
  }

  if (object.userData.type === "clue") {
    cluesCollected++;
    object.visible = false;

    showMessage(object.userData.text);
  }

  if (object.userData.type === "door") {
    if (keysCollected < 2 || cluesCollected < 2) {
      showMessage("The door is locked. Find everything first.");
    } else {
      controls.unlock();
      codePanel.classList.remove("hidden");
      document.getElementById("codeInput").focus();
    }
  }

  updateHUD();
}

/* -------------------- PLAYER / MONSTER -------------------- */

function movePlayer(delta) {
  const speed = 3.1;
  const direction = new THREE.Vector3();

  if (keysDown.KeyW) direction.z -= 1;
  if (keysDown.KeyS) direction.z += 1;
  if (keysDown.KeyA) direction.x -= 1;
  if (keysDown.KeyD) direction.x += 1;

  if (direction.length() === 0) return;

  direction.normalize();

  const oldPosition = controls.getObject().position.clone();

  controls.moveRight(direction.x * speed * delta);
  controls.moveForward(-direction.z * speed * delta);

  const position = controls.getObject().position;

  position.x = THREE.MathUtils.clamp(position.x, -11.5, 11.5);
  position.z = THREE.MathUtils.clamp(position.z, -10.8, 10.8);

  for (const wall of walls) {
    const box = new THREE.Box3().setFromObject(wall);

    const playerBox = new THREE.Box3().setFromCenterAndSize(
      position,
      new THREE.Vector3(0.55, 1.7, 0.55)
    );

    if (box.intersectsBox(playerBox)) {
      position.copy(oldPosition);
      break;
    }
  }
}

function updateMonster(delta) {
  if (!monsterActive) return;

  monster.visible = true;

  const playerPosition = controls.getObject().position;
  const distance = monster.position.distanceTo(playerPosition);

  const direction = new THREE.Vector3()
    .subVectors(playerPosition, monster.position)
    .normalize();

  monster.position.add(direction.multiplyScalar(delta * 0.95));

  monster.lookAt(
    playerPosition.x,
    1.5,
    playerPosition.z
  );

  if (distance < 9) {
    fear += delta * 10;
  } else {
    fear -= delta * 3;
  }

  fear = THREE.MathUtils.clamp(fear, 0, 100);

  if (distance < 1.2 || fear >= 100) {
    endGame(false);
  }
}

/* -------------------- END / START -------------------- */

function endGame(won) {
  if (gameOver) return;

  gameOver = true;
  controls.unlock();

  hud.style.display = "none";
  endScreen.classList.remove("hidden");

  document.getElementById("endTitle").textContent =
    won ? "YOU ESCAPED!" : "THE MONSTER FOUND YOU";

  document.getElementById("endText").textContent =
    won
      ? "The house falls silent behind you."
      : "Your fear reached its limit.";
}

function startGame() {
  startScreen.style.display = "none";
  hud.style.display = "block";

  controls.lock();
  updateHUD();
}

/* -------------------- INPUT -------------------- */

document.getElementById("startButton").addEventListener(
  "click",
  startGame
);

document.addEventListener("keydown", (event) => {
  keysDown[event.code] = true;

  if (
    event.code === "Space" &&
    startScreen.style.display !== "none"
  ) {
    startGame();
  }

  if (event.code === "KeyF") {
    flashlightOn = !flashlightOn;

    flashlight.intensity = flashlightOn ? 8 : 0;

    showMessage(
      flashlightOn ? "Flashlight ON" : "Flashlight OFF",
      1000
    );
  }

  if (event.code === "KeyE") {
    interact();
  }

  if (event.code === "Escape" && !gameOver) {
    showMessage("Paused. Click to continue.", 1500);
  }
});

document.addEventListener("keyup", (event) => {
  keysDown[event.code] = false;
});

document.getElementById("submitCode").addEventListener(
  "click",
  () => {
    const enteredCode = document.getElementById("codeInput").value;

    if (enteredCode === correctCode) {
      codePanel.classList.add("hidden");
      endGame(true);
    } else {
      showMessage("Wrong code. Something heard you...");
      fear = Math.min(100, fear + 18);

      document.getElementById("codeInput").value = "";
    }
  }
);

document.addEventListener("click", () => {
  const canLockMouse =
    startScreen.style.display === "none" &&
    !gameOver &&
    codePanel.classList.contains("hidden");

  if (canLockMouse) {
    controls.lock();
  }
});

/* -------------------- GAME LOOP -------------------- */

setupWorld();

function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.05);
  const elapsed = clock.getElapsedTime();

  if (controls.isLocked && !gameOver) {
    timeLeft -= delta;

    if (timeLeft <= 0) {
      endGame(false);
    }

    if (timeLeft < 500 && !monsterActive) {
      monsterActive = true;
      showMessage("Something is moving in the house...");
    }

    movePlayer(delta);
    updateMonster(delta);
    updateHUD();

    for (let i = 0; i < flickerLights.length; i++) {
      const lamp = flickerLights[i];

      lamp.light.intensity =
        lamp.baseIntensity *
        (0.84 + Math.sin(elapsed * 8 + i * 3) * 0.13);
    }

    const nearby = nearestInteractable();

    if (nearby && nearby.userData.type === "door") {
      message.textContent = "Press E to interact with the final door";
    } else if (nearby && !message.textContent) {
      message.textContent = "Press E to interact";
    }
  }

  renderer.render(scene, camera);
}

animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
});