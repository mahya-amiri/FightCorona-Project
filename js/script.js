// Global variables
var scene, camera, renderer, clock;
var ambientLight, directionalLight;
var box;
var objects = [];
var objects_ = [];
var meshList = [];
var collisionResults = [];
var collisionResults_ = [];
var bullets = [];
var boxs = [];

var gotAHit = new Audio("./asset/sound/got_a_hit.mp3");
var catch_ = new Audio("./asset/sound/catch.wav");

var ambulance = new THREE.Mesh();

var height = 220;
var offset = 0.5;
var speed = 15;
var run = 0;
var game = { count: 0, energy: 100, ratioSpeedEnergy: 5, status: "playing" };
var canShoot = 0;

var keyboard = new THREEx.KeyboardState();

var startButton = document.getElementById("startButton");
startButton.addEventListener("click", init);

var energyBar = document.getElementById("energyBar");

var fieldCount = document.getElementById("countValue");
var countCircle = document.getElementById("countCircleStroke");

// Function init
function init() {
  var container = document.getElementById("container");
  container.remove();

  var input = document.createElement("div");
  document.body.appendChild(input);

  // Create scene & clock
  scene = new THREE.Scene();
  clock = new THREE.Clock();

  // Create a camera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    150000
  );
  camera.position.x = 7500;
  camera.position.y = 110;
  camera.position.z = -30;
  camera.lookAt(ambulance.position);

  // Create a render
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  document.body.appendChild(renderer.domElement);

  // ********Lights*********
  // ambientLight
  ambientLight = new THREE.AmbientLight(0xdfebff, 1);
  scene.add(ambientLight);

  // directionalLight
  directionalLight = new THREE.DirectionalLight(0xffffff);

  directionalLight.position.set(0, 1, 0);

  directionalLight.shadow.camera.near = 1;
  directionalLight.shadow.camera.far = 1000;
  directionalLight.shadow.camera.right = 550;
  directionalLight.shadow.camera.left = -550;
  directionalLight.shadow.camera.top = 550;
  directionalLight.shadow.camera.bottom = -550;
  directionalLight.shadow.mapSize.width = 3048;
  directionalLight.shadow.mapSize.height = 3048;

  directionalLight.castShadow = true;

  // Game background music
  var listener = new THREE.AudioListener();
  camera.add(listener);

  var sound = new THREE.PositionalAudio(listener);
  var audioLoader = new THREE.AudioLoader();

  audioLoader.load("./asset/sound/game.mp3", function (buffer) {
    sound.setBuffer(buffer);
    sound.setRefDistance(2000);
    sound.play();
  });
  scene.add(sound);

  // City
  var city = THREE.ImageUtils.loadTexture("./asset/picture/city.png");
  city.format = THREE.RGBFormat;
  scene.background = city;

  // Floor
  var road = THREE.ImageUtils.loadTexture("./asset/picture/road.jpg");

  var floorGeometry = new THREE.PlaneGeometry(77000, 700);
  var floorMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    map: road,
  });
  var floor = new THREE.Mesh(floorGeometry, floorMaterial);

  floor.position.x = 100;
  floor.position.y = 0;
  floor.position.z = -40;
  floor.rotateX(Math.PI / 2);

  floor.receiveShadow = true;
  scene.add(floor);

  // ******Objects******
  // Ambulance
  var objectLoader = new THREE.ObjectLoader();
  objectLoader.load("./asset/model/ambulance/ambulance.json", function (obj) {
    ambulance = obj;

    ambulance.position.x = 7250;
    ambulance.position.y = 30;
    ambulance.position.z = -30;
    ambulance.rotateY(Math.PI / 2);

    ambulance.scale.set(22, 22, 22);
    ambulance.add(directionalLight);
    ambulance.castShadow = true;
    ambulance.receiveShadow = true;

    scene.add(ambulance);
  });

  // Spray Gun
  var objectLoader = new THREE.ObjectLoader();
  objectLoader.load("./asset/model/spraygun/spraygun.json", function (obj) {
    spraygun = obj;

    spraygun.position.x = 7250;
    spraygun.position.y = 98;
    spraygun.position.z = -30;

    spraygun.scale.set(1, 1, 1);
    spraygun.add(directionalLight);
    spraygun.castShadow = true;
    spraygun.receiveShadow = true;

    scene.add(spraygun);
  });

  // CubeBox for Ambulance
  var cubeGeometry = new THREE.CubeGeometry(140, 70, 70);
  var wireMaterial = new THREE.MeshBasicMaterial({
    wireframe: true,
    invisibility: true,
  });
  box = new THREE.Mesh(cubeGeometry, wireMaterial);

  box.visible = false;
  box.position.set(7250, 70, -30);

  scene.add(box);

  // Covid
  var count = 5000;
  var virus = THREE.ImageUtils.loadTexture("./asset/picture/covid.png");

  var covidGeometry = new THREE.CircleGeometry(30, 30);
  var covidMaterial = new THREE.MeshLambertMaterial({
    side: THREE.DoubleSide,
    map: virus,
    shading: THREE.SmoothShading,
  });

  for (var i = 0; i < count; i++) {
    var covid = new THREE.Mesh(covidGeometry, covidMaterial);

    covid.position.x = i * 200 - 10000;
    covid.position.y = 40;
    covid.position.z = Math.random() * 800 - 450;
    covid.rotateY(Math.PI / 2);

    covid.castShadow = true;
    covid.userData.down = false;

    covid.add(directionalLight);

    scene.add(covid);
    objects.push(covid);
    meshList.push(covid);
  }

  window.addEventListener("resize", onWindowResize, false);

  animate();
}

// Function declaration

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  if (game.status == "playing") {
    render();

    requestAnimationFrame(animate);

    run++;

    camera.position.x -= 2 + Math.pow(run, 1.24) / 6000;

    ambulance.position.x -= 2 + Math.pow(run, 1.25) / 6000;

    spraygun.position.x -= 2 + Math.pow(run, 1.25) / 6000;

    box.position.x -= 2 + Math.pow(run, 1.25) / 6000;
    for (var i = 0; i < objects_.length; i++) {
      objects_[i].rotation.y += speed / 10;
    }

    bounce();

    update();
  } else window.open("game_over.html", "_self");
}

function render() {
  camera.updateMatrixWorld();
  renderer.render(scene, camera);
}

function bounce() {
  var time = clock.getElapsedTime();

  for (var i = 0; i < objects.length; i++) {
    var covid = objects[i];

    var previousHeight = covid.position.y;
    covid.position.y = Math.abs(
      Math.sin(i * offset + (time * speed) / 2) * height
    );

    if (covid.position.y < previousHeight) covid.userData.down = true;
    else if (covid.userData.down === true) covid.userData.down = false; // covid changed direction from down to up
  }
}

function update() {
  // Bullets
  for (var i = 0; i < bullets.length; i++) {
    if (bullets[i] === undefined) continue;
    if (bullets[i].alive == false) {
      bullets.splice(i, 1);
      continue;
    }

    bullets[i].position.add(bullets[i].velocity);
  }
  // CubeBoxs
  for (var i = 0; i < boxs.length; i++) {
    if (boxs[i] === undefined) continue;
    if (boxs[i].alive == false) {
      boxs.splice(i, 1);
      continue;
    }

    boxs[i].position.add(boxs[i].velocity);
  }

  if (keyboard.pressed("left")) {
    ambulance.position.z += 2;
    spraygun.position.z += 2;
    box.position.z += 2;
  }

  if (keyboard.pressed("right")) {
    ambulance.position.z -= 2;
    spraygun.position.z -= 2;
    box.position.z -= 2;
  }

  if (keyboard.pressed("space") && canShoot <= 0) {
    // Bullet
    var bullet = new THREE.Mesh(
      new THREE.SphereGeometry(4, 8, 8),
      new THREE.MeshBasicMaterial({
        color: 0xcc3300,
      })
    );

    bullet.position.set(
      ambulance.position.x - 50,
      ambulance.position.y + 80,
      ambulance.position.z
    );

    bullet.velocity = new THREE.Vector3(
      -Math.sin(camera.rotation.y),
      4,
      Math.cos(camera.rotation.y)
    );

    bullet.alive = true;
    setTimeout(function () {
      bullet.alive = false;
      scene.remove(bullet);
    }, 200);

    bullets.push(bullet);
    scene.add(bullet);
    canShoot = 20;

    // CubBox for Bullet
    var box_ = new THREE.Mesh(
      new THREE.CubeGeometry(4, 8, 8),
      new THREE.MeshBasicMaterial({
        wireframe: true,
        invisibility: true,
      })
    );
    box_.visible = false;
    box_.position.set(
      ambulance.position.x - 50,
      ambulance.position.y + 80,
      ambulance.position.z
    );

    box_.velocity = new THREE.Vector3(
      -Math.sin(camera.rotation.y),
      4,
      Math.cos(camera.rotation.y)
    );

    box_.alive = true;
    setTimeout(function () {
      box_.alive = false;
      scene.remove(box_);
    }, 200);

    boxs.push(box_);
    scene.add(box_);
    canShoot = 20;
  }

  if (canShoot > 0) canShoot -= 1;

  var originPoint = box.position.clone();

  for (var i = 0; i < box.geometry.vertices.length; i++) {
    var localVertex = box.geometry.vertices[i].clone();
    var globalVertex = localVertex.applyMatrix4(box.matrix);
    var directionVector = globalVertex.sub(box.position);
    var ray = new THREE.Raycaster(
      originPoint,
      directionVector.clone().normalize()
    );
    collisionResults = ray.intersectObjects(meshList);

    if (
      collisionResults.length > 0 &&
      collisionResults[0].distance < directionVector.length()
    ) {
      gotAHit.currentTime = 0;
      gotAHit.play();
      reduceEnergy();
    }
  }
  var originPoint = box_.position.clone();

  for (var i = 0; i < box_.geometry.vertices.length; i++) {
    var localVertex = box_.geometry.vertices[i].clone();
    var globalVertex = localVertex.applyMatrix4(box_.matrix);
    var directionVector = globalVertex.sub(box_.position);
    var ray = new THREE.Raycaster(
      originPoint,
      directionVector.clone().normalize()
    );
    collisionResults_ = ray.intersectObjects(meshList);

    if (
      collisionResults_.length > 0 &&
      collisionResults_[0].distance < directionVector.length()
    ) {
      var selected = collisionResults_[0].object;
      selected.visible = false;
      if (selected.visible == false) {
        catch_.currentTime = 0;
        catch_.play();
        game.count++;
        fieldCount.innerHTML = Math.floor(game.count);
      }
    }
  }
}

function reduceEnergy() {
  game.energy -= game.ratioSpeedEnergy;
  game.energy = Math.max(0, game.energy);
  energyBar.style.right = 100 - game.energy + "%";
  energyBar.style.backgroundColor = game.energy < 50 ? "#993333" : "#267340";

  if (game.energy < 30) energyBar.style.animationName = "blinking";
  else energyBar.style.animationName = "none";

  if (game.energy < 1) game.status = "gameover";
}
