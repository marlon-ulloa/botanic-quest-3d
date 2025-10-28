import * as THREE from 'three';
import { Plant } from '../lib/supabase';

interface PlantObject {
  mesh: THREE.Mesh;
  plant: Plant;
  discovered: boolean;
}

export class ExplorationMode {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private plants: PlantObject[] = [];
  private player: THREE.Mesh;
  private keys: { [key: string]: boolean } = {};
  private velocity: THREE.Vector3 = new THREE.Vector3();
  private moveSpeed = 0.15;
  private discoveredPlants: Set<string> = new Set();

  onPlantNear: ((plant: Plant) => void) | null = null;

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB);
    this.scene.fog = new THREE.Fog(0x87CEEB, 10, 50);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 2, 5);

    this.setupLights();
    this.createGround();
    this.player = this.createPlayer();

    this.setupControls();
    this.createMobileControls();
  }

  private setupLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -30;
    directionalLight.shadow.camera.right = 30;
    directionalLight.shadow.camera.top = 30;
    directionalLight.shadow.camera.bottom = -30;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);
  }

  private createGround() {
    const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x4A7C4E,
      roughness: 0.8,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    const pathGeometry = new THREE.PlaneGeometry(3, 100);
    const pathMaterial = new THREE.MeshStandardMaterial({
      color: 0xC2B280,
      roughness: 0.9,
    });
    const path = new THREE.Mesh(pathGeometry, pathMaterial);
    path.rotation.x = -Math.PI / 2;
    path.position.y = 0.01;
    path.receiveShadow = true;
    this.scene.add(path);
  }

  /*private createPlayer(): THREE.Mesh {
    const geometry = new THREE.CapsuleGeometry(0.5, 1, 4, 8);
    const material = new THREE.MeshStandardMaterial({ color: 0x4A90E2 });
    const player = new THREE.Mesh(geometry, material);
    player.position.set(0, 1, 0);
    player.castShadow = true;
    this.scene.add(player);
    return player;
  }*/


  private createPlayer(): THREE.Group {
  const player = new THREE.Group();
  
  // Materiales mejorados
  const skinMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xFFDBAC,
    roughness: 0.8,
    metalness: 0.1
  });
  
  const hairMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x2C1810,
    roughness: 0.9
  });
  
  const shirtMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x4A90E2,
    roughness: 0.7
  });
  
  const pantsMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x2C3E50,
    roughness: 0.8
  });
  
  const shoeMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x1a1a1a,
    roughness: 0.6
  });

  // ========== CABEZA Y CARA ==========
  const headGeometry = new THREE.SphereGeometry(0.35, 32, 32);
  const head = new THREE.Mesh(headGeometry, skinMaterial);
  head.position.y = 1.85;
  head.scale.set(1, 1.1, 0.95);
  head.castShadow = true;
  player.add(head);
  
  // Cuello
  const neckGeometry = new THREE.CylinderGeometry(0.15, 0.18, 0.2, 16);
  const neck = new THREE.Mesh(neckGeometry, skinMaterial);
  neck.position.y = 1.55;
  neck.castShadow = true;
  player.add(neck);
  
  // Cabello
  const hairTopGeometry = new THREE.SphereGeometry(0.36, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.6);
  const hairTop = new THREE.Mesh(hairTopGeometry, hairMaterial);
  hairTop.position.y = 2.0;
  hairTop.castShadow = true;
  player.add(hairTop);
  
  const hairBackGeometry = new THREE.SphereGeometry(0.37, 32, 32, Math.PI * 0.8, Math.PI * 0.4, Math.PI * 0.3, Math.PI * 0.7);
  const hairBack = new THREE.Mesh(hairBackGeometry, hairMaterial);
  hairBack.position.set(0, 1.85, -0.15);
  hairBack.castShadow = true;
  player.add(hairBack);
  
  // Orejas
  const earGeometry = new THREE.SphereGeometry(0.08, 16, 16);
  const leftEar = new THREE.Mesh(earGeometry, skinMaterial);
  leftEar.position.set(-0.33, 1.85, 0);
  leftEar.scale.set(0.6, 1, 0.8);
  leftEar.castShadow = true;
  player.add(leftEar);
  
  const rightEar = new THREE.Mesh(earGeometry, skinMaterial);
  rightEar.position.set(0.33, 1.85, 0);
  rightEar.scale.set(0.6, 1, 0.8);
  rightEar.castShadow = true;
  player.add(rightEar);

  // ========== TORSO ==========
  const torsoGeometry = new THREE.CylinderGeometry(0.38, 0.35, 0.6, 16);
  const torso = new THREE.Mesh(torsoGeometry, shirtMaterial);
  torso.position.y = 1.2;
  torso.castShadow = true;
  player.add(torso);
  
  const abdomenGeometry = new THREE.CylinderGeometry(0.35, 0.32, 0.3, 16);
  const abdomen = new THREE.Mesh(abdomenGeometry, shirtMaterial);
  abdomen.position.y = 0.75;
  abdomen.castShadow = true;
  player.add(abdomen);
  
  const hipsGeometry = new THREE.CylinderGeometry(0.32, 0.35, 0.2, 16);
  const hips = new THREE.Mesh(hipsGeometry, pantsMaterial);
  hips.position.y = 0.5;
  hips.castShadow = true;
  player.add(hips);

  // ========== BRAZO IZQUIERDO (JERARQUÍA) ==========
  // Grupo del brazo izquierdo (pivot en el hombro)
  const leftArmGroup = new THREE.Group();
  leftArmGroup.position.set(-0.48, 1.35, 0);
  player.add(leftArmGroup);
  
  // Hombro
  const shoulderGeometry = new THREE.SphereGeometry(0.12, 16, 16);
  const leftShoulder = new THREE.Mesh(shoulderGeometry, shirtMaterial);
  leftShoulder.castShadow = true;
  leftArmGroup.add(leftShoulder);
  
  // Brazo superior
  const upperArmGeometry = new THREE.CylinderGeometry(0.09, 0.08, 0.35, 12);
  const leftUpperArm = new THREE.Mesh(upperArmGeometry, shirtMaterial);
  leftUpperArm.position.y = -0.175;
  leftUpperArm.castShadow = true;
  leftArmGroup.add(leftUpperArm);
  
  // Grupo del antebrazo (pivot en el codo)
  const leftForearmGroup = new THREE.Group();
  leftForearmGroup.position.y = -0.35;
  leftArmGroup.add(leftForearmGroup);
  
  // Codo
  const elbowGeometry = new THREE.SphereGeometry(0.08, 12, 12);
  const leftElbow = new THREE.Mesh(elbowGeometry, skinMaterial);
  leftElbow.castShadow = true;
  leftForearmGroup.add(leftElbow);
  
  // Antebrazo
  const forearmGeometry = new THREE.CylinderGeometry(0.07, 0.06, 0.35, 12);
  const leftForearm = new THREE.Mesh(forearmGeometry, skinMaterial);
  leftForearm.position.y = -0.175;
  leftForearm.castShadow = true;
  leftForearmGroup.add(leftForearm);
  
  // Mano
  const handGeometry = new THREE.SphereGeometry(0.07, 12, 12);
  const leftHand = new THREE.Mesh(handGeometry, skinMaterial);
  leftHand.position.y = -0.35;
  leftHand.scale.set(1, 1.2, 0.7);
  leftHand.castShadow = true;
  leftForearmGroup.add(leftHand);

  // ========== BRAZO DERECHO (JERARQUÍA) ==========
  const rightArmGroup = new THREE.Group();
  rightArmGroup.position.set(0.48, 1.35, 0);
  player.add(rightArmGroup);
  
  const rightShoulder = new THREE.Mesh(shoulderGeometry, shirtMaterial);
  rightShoulder.castShadow = true;
  rightArmGroup.add(rightShoulder);
  
  const rightUpperArm = new THREE.Mesh(upperArmGeometry, shirtMaterial);
  rightUpperArm.position.y = -0.175;
  rightUpperArm.castShadow = true;
  rightArmGroup.add(rightUpperArm);
  
  const rightForearmGroup = new THREE.Group();
  rightForearmGroup.position.y = -0.35;
  rightArmGroup.add(rightForearmGroup);
  
  const rightElbow = new THREE.Mesh(elbowGeometry, skinMaterial);
  rightElbow.castShadow = true;
  rightForearmGroup.add(rightElbow);
  
  const rightForearm = new THREE.Mesh(forearmGeometry, skinMaterial);
  rightForearm.position.y = -0.175;
  rightForearm.castShadow = true;
  rightForearmGroup.add(rightForearm);
  
  const rightHand = new THREE.Mesh(handGeometry, skinMaterial);
  rightHand.position.y = -0.35;
  rightHand.scale.set(1, 1.2, 0.7);
  rightHand.castShadow = true;
  rightForearmGroup.add(rightHand);

  // ========== PIERNA IZQUIERDA (JERARQUÍA) ==========
  const leftLegGroup = new THREE.Group();
  leftLegGroup.position.set(-0.15, 0.4, 0);
  player.add(leftLegGroup);
  
  // Muslo
  const thighGeometry = new THREE.CylinderGeometry(0.12, 0.1, 0.5, 16);
  const leftThigh = new THREE.Mesh(thighGeometry, pantsMaterial);
  leftThigh.position.y = -0.25;
  leftThigh.castShadow = true;
  leftLegGroup.add(leftThigh);
  
  // Grupo de la pantorrilla (pivot en la rodilla)
  const leftCalfGroup = new THREE.Group();
  leftCalfGroup.position.y = -0.5;
  leftLegGroup.add(leftCalfGroup);
  
  // Rodilla
  const kneeGeometry = new THREE.SphereGeometry(0.09, 12, 12);
  const leftKnee = new THREE.Mesh(kneeGeometry, pantsMaterial);
  leftKnee.castShadow = true;
  leftCalfGroup.add(leftKnee);
  
  // Pantorrilla
  const calfGeometry = new THREE.CylinderGeometry(0.09, 0.07, 0.45, 16);
  const leftCalf = new THREE.Mesh(calfGeometry, pantsMaterial);
  leftCalf.position.y = -0.225;
  leftCalf.castShadow = true;
  leftCalfGroup.add(leftCalf);
  
  // Tobillo
  const ankleGeometry = new THREE.SphereGeometry(0.07, 12, 12);
  const leftAnkle = new THREE.Mesh(ankleGeometry, skinMaterial);
  leftAnkle.position.y = -0.45;
  leftAnkle.castShadow = true;
  leftCalfGroup.add(leftAnkle);
  
  // Pie
  const footGeometry = new THREE.BoxGeometry(0.15, 0.1, 0.28);
  const leftFoot = new THREE.Mesh(footGeometry, shoeMaterial);
  leftFoot.position.set(0, -0.55, 0.05);
  leftFoot.castShadow = true;
  leftCalfGroup.add(leftFoot);

  // ========== PIERNA DERECHA (JERARQUÍA) ==========
  const rightLegGroup = new THREE.Group();
  rightLegGroup.position.set(0.15, 0.4, 0);
  player.add(rightLegGroup);
  
  const rightThigh = new THREE.Mesh(thighGeometry, pantsMaterial);
  rightThigh.position.y = -0.25;
  rightThigh.castShadow = true;
  rightLegGroup.add(rightThigh);
  
  const rightCalfGroup = new THREE.Group();
  rightCalfGroup.position.y = -0.5;
  rightLegGroup.add(rightCalfGroup);
  
  const rightKnee = new THREE.Mesh(kneeGeometry, pantsMaterial);
  rightKnee.castShadow = true;
  rightCalfGroup.add(rightKnee);
  
  const rightCalf = new THREE.Mesh(calfGeometry, pantsMaterial);
  rightCalf.position.y = -0.225;
  rightCalf.castShadow = true;
  rightCalfGroup.add(rightCalf);
  
  const rightAnkle = new THREE.Mesh(ankleGeometry, skinMaterial);
  rightAnkle.position.y = -0.45;
  rightAnkle.castShadow = true;
  rightCalfGroup.add(rightAnkle);
  
  const rightFoot = new THREE.Mesh(footGeometry, shoeMaterial);
  rightFoot.position.set(0, -0.55, 0.05);
  rightFoot.castShadow = true;
  rightCalfGroup.add(rightFoot);

  // Guardar referencias a los GRUPOS (no a las partes individuales)
  (player as any).leftArmGroup = leftArmGroup;
  (player as any).leftForearmGroup = leftForearmGroup;
  (player as any).rightArmGroup = rightArmGroup;
  (player as any).rightForearmGroup = rightForearmGroup;
  
  (player as any).leftLegGroup = leftLegGroup;
  (player as any).leftCalfGroup = leftCalfGroup;
  (player as any).rightLegGroup = rightLegGroup;
  (player as any).rightCalfGroup = rightCalfGroup;
  
  (player as any).torso = torso;
  (player as any).head = head;

  // Rotar para que esté de espaldas
  player.rotation.y = Math.PI;
  
  // Posicionar
  player.position.set(0, 0.7, 5);
  this.scene.add(player);
  
  return player;
}

// Animación corregida con jerarquía
private animatePlayer(time: number): void {
  if (!this.player) return;
  
  const player = this.player as any;
  const speed = 6;
  const phase = time * speed;
  
  // BRAZOS - Ahora rotan desde el hombro y el codo correctamente
  const armSwing = 0.5;
  
  // Brazo izquierdo (rota desde el hombro)
  const leftArmAngle = Math.sin(phase) * armSwing;
  player.leftArmGroup.rotation.x = leftArmAngle;
  
  // Antebrazo izquierdo (rota desde el codo)
  const leftForearmBend = leftArmAngle < 0 ? Math.abs(leftArmAngle) * 0.4 : 0;
  player.leftForearmGroup.rotation.x = -leftForearmBend;
  
  // Brazo derecho
  const rightArmAngle = Math.sin(phase + Math.PI) * armSwing;
  player.rightArmGroup.rotation.x = rightArmAngle;
  
  const rightForearmBend = rightArmAngle < 0 ? Math.abs(rightArmAngle) * 0.4 : 0;
  player.rightForearmGroup.rotation.x = -rightForearmBend;
  
  // PIERNAS - Rotan desde la cadera y la rodilla
  const legSwing = 0.6;
  
  // Pierna izquierda (rota desde la cadera)
  const leftLegAngle = Math.sin(phase + Math.PI) * legSwing;
  player.leftLegGroup.rotation.x = leftLegAngle;
  
  // Pantorrilla izquierda (rota desde la rodilla)
  const leftKneeBend = leftLegAngle < 0 ? Math.abs(leftLegAngle) * 0.8 : 0;
  player.leftCalfGroup.rotation.x = -leftKneeBend;
  
  // Pierna derecha
  const rightLegAngle = Math.sin(phase) * legSwing;
  player.rightLegGroup.rotation.x = rightLegAngle;
  
  const rightKneeBend = rightLegAngle < 0 ? Math.abs(rightLegAngle) * 0.8 : 0;
  player.rightCalfGroup.rotation.x = -rightKneeBend;
  
  // Torso y cabeza
  player.torso.rotation.y = Math.sin(phase * 2) * 0.03;
  player.head.rotation.y = Math.sin(phase * 0.5) * 0.04;
  
  // Rebote vertical
  const bounce = (1 + Math.sin(phase * 2)) * 0.03;
  player.position.y = 0.7 + bounce;
}

private resetPlayerRotation(){
  this.player.leftArmGroup.rotation.x = 0;
      this.player.leftForearmGroup.rotation.x = 0;
      this.player.rightArmGroup.rotation.x = 0;
      this.player.rightForearmGroup.rotation.x = 0;
      this.player.leftLegGroup.rotation.x = 0;
      this.player.leftCalfGroup.rotation.x = 0;
      this.player.rightLegGroup.rotation.x = 0;
      this.player.rightCalfGroup.rotation.x = 0;
      this.player.torso.rotation.y = 0;
      this.player.head.rotation.y = 0;
}





  private setupControls() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
      this.resetPlayerRotation();

    });
  }

private createMobileControls() {
  // Solo crear controles si es dispositivo móvil
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (!isMobile) return;

  // Crear contenedor de controles
  const controlsContainer = document.createElement('div');
  controlsContainer.id = 'mobile-controls';
  controlsContainer.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 20px;
    z-index: 1000;
  `;

  // Botón izquierda
  const leftButton = document.createElement('button');
  leftButton.innerHTML = '◀';
  leftButton.style.cssText = `
    width: 80px;
    height: 80px;
    font-size: 32px;
    background: rgba(74, 144, 226, 0.7);
    border: 3px solid white;
    border-radius: 50%;
    color: white;
    cursor: pointer;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
  `;

  // Botón derecha
  const rightButton = document.createElement('button');
  rightButton.innerHTML = '▶';
  rightButton.style.cssText = leftButton.style.cssText;
  // Botón adelante
  const upButton = document.createElement('button');
  upButton.innerHTML = '▲';
  upButton.style.cssText = leftButton.style.cssText;
  // Botón atras
  const downButton = document.createElement('button');
  downButton.innerHTML = '▼';
  downButton.style.cssText = leftButton.style.cssText;

  // Event listeners para el botón izquierdo
  leftButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    this.keys['a'] = true;
    leftButton.style.background = 'rgba(74, 144, 226, 1)';
  });

  leftButton.addEventListener('touchend', (e) => {
    e.preventDefault();
    this.keys['a'] = false;
    leftButton.style.background = 'rgba(74, 144, 226, 0.7)';
    this.resetPlayerRotation();
  });

  // Event listeners para el botón derecho
  rightButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    this.keys['d'] = true;
    rightButton.style.background = 'rgba(74, 144, 226, 1)';
  });

  rightButton.addEventListener('touchend', (e) => {
    e.preventDefault();
    this.keys['d'] = false;
    rightButton.style.background = 'rgba(74, 144, 226, 0.7)';
    this.resetPlayerRotation();
  });

  // Event listeners para el botón arriba
  upButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    this.keys['w'] = true;
    upButton.style.background = 'rgba(74, 144, 226, 1)';
  });

  upButton.addEventListener('touchend', (e) => {
    e.preventDefault();
    this.keys['w'] = false;
    upButton.style.background = 'rgba(74, 144, 226, 0.7)';
    this.resetPlayerRotation();
  });

  // Event listeners para el botón abajo
  downButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    this.keys['s'] = true;
    downButton.style.background = 'rgba(74, 144, 226, 1)';
  });

  downButton.addEventListener('touchend', (e) => {
    e.preventDefault();
    this.keys['s'] = false;
    downButton.style.background = 'rgba(74, 144, 226, 0.7)';
    this.resetPlayerRotation();
  });

  // Agregar botones al contenedor
  controlsContainer.appendChild(leftButton);
  controlsContainer.appendChild(rightButton);
  controlsContainer.appendChild(upButton);
  controlsContainer.appendChild(downButton);
  
  // Agregar al DOM
  document.body.appendChild(controlsContainer);
}















  /*loadPlants(plants: Plant[]) {
    this.plants.forEach(p => this.scene.remove(p.mesh));
    this.plants = [];

    const positions = [
      { x: -8, z: -10 }, { x: 8, z: -10 },
      { x: -12, z: -20 }, { x: 0, z: -20 }, { x: 12, z: -20 },
      { x: -8, z: -30 }, { x: 8, z: -30 },
      { x: -12, z: -40 }, { x: 12, z: -40 },
      { x: 0, z: -50 }
    ];

    plants.slice(0, 10).forEach((plant, index) => {
      const pos = positions[index];
      const plantMesh = this.createPlantMesh(plant);
      plantMesh.position.set(pos.x, 0, pos.z);
      this.scene.add(plantMesh);

      this.plants.push({
        mesh: plantMesh,
        plant,
        discovered: false
      });
    });
  }*/


    loadPlants(plants: Plant[]) {
    this.plants.forEach(p => this.scene.remove(p.mesh));
    this.plants = [];

    // Generar 98 posiciones dinámicamente
    const positions: { x: number; z: number }[] = [];
    const plantsPerRow = 7; // Plantas por fila
    const rows = 14; // Total de filas (7 * 14 = 98)
    const spacingX = 10; // Espaciado horizontal entre plantas
    const spacingZ = 25; // Espaciado vertical (profundidad) entre filas
    const startZ = -10; // Posición Z inicial
    const offsetX = (plantsPerRow - 1) * spacingX / 2; // Para centrar las plantas

    /*for (let row = 0; row < rows; row++) {
      for (let col = 0; col < plantsPerRow; col++) {
        positions.push({
          x: (col * spacingX) - offsetX, // Distribuir de izquierda a derecha, centrado
          z: startZ - (row * spacingZ) // Ir alejándose en profundidad
        });
      }
    }*/

  
  
  
  
  
  
  
      // Límites del plano (ajústalos según el tamaño real del plano)
  /*const planeWidth = plantsPerRow * spacingX;
  const planeDepth = rows * spacingZ;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < plantsPerRow; col++) {

      // Agregamos una pequeña variación aleatoria (pero controlada)
      const randomOffsetX = (Math.random() - 0.5) * (spacingX * 0.4); // máx ±40% del espaciado
      const randomOffsetZ = (Math.random() - 0.5) * (spacingZ * 0.4);

      // Calculamos la posición base
      let x = (col * spacingX) - offsetX + randomOffsetX;
      let z = startZ - (row * spacingZ) + randomOffsetZ;

      // Aseguramos que las plantas no salgan del plano
      const halfWidth = planeWidth / 2;
      const halfDepth = planeDepth / 2;

      x = Math.max(-halfWidth, Math.min(halfWidth, x));
      z = Math.max(-planeDepth - startZ, Math.min(startZ, z));

      positions.push({ x, z });
    }
  }*/











  const totalPlants = 98;
  const spacingMin = 8; // distancia mínima entre plantas
  const planeWidth = 80; // tamaño del plano en X (ajusta según tu escena)
  const planeDepth = 350; // tamaño del plano en Z (ajusta según tu escena)
  
  let attempts = 0;
  const maxAttempts = 5000;

  while (positions.length < totalPlants && attempts < maxAttempts) {
    attempts++;

    // Generamos coordenadas aleatorias dentro del plano
    const x = (Math.random() - 0.5) * planeWidth;
    const z = startZ - Math.random() * planeDepth;

    // Verificamos que esté lo suficientemente lejos de las demás
    const tooClose = positions.some(p => {
      const dx = p.x - x;
      const dz = p.z - z;
      return Math.sqrt(dx * dx + dz * dz) < spacingMin;
    });

    if (!tooClose) {
      positions.push({ x, z });
    }
  }

  if (positions.length < totalPlants) {
    console.warn(`Solo se generaron ${positions.length} plantas (espaciado o plano demasiado pequeño).`);
  }




    // Crear las 98 plantas (o las que haya disponibles)
    plants.forEach((plant, index) => {
      if (index < positions.length) {
        const pos = positions[index];
        const plantMesh = this.createPlantMesh(plant);
        plantMesh.position.set(pos.x, 0, pos.z);
        this.scene.add(plantMesh);

        this.plants.push({
          mesh: plantMesh,
          plant,
          discovered: false
        });
      }
    });
}

  private createPlantMesh(plant: Plant): THREE.Mesh {
    const group = new THREE.Group() as any;

    const colors: { [key: string]: number } = {
      tropical: 0x00FF00,
      desert: 0xFFD700,
      forest: 0x228B22,
      aquatic: 0x00CED1
    };

    //const stemGeometry = new THREE.CylinderGeometry(0.1, 0.15, 1.5, 8);
    const stemGeometry = new THREE.CylinderGeometry(0.3, 0.4, 3, 16);
    const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    stem.position.y = 0.75;
    stem.castShadow = true;
    group.add(stem);

    //const flowerGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const flowerGeometry = new THREE.BoxGeometry(1.5, 2, 0.8);
    //const flowerGeometry = new THREE.SphereGeometry(1.2, 16, 16);
    const flowerMaterial = new THREE.MeshStandardMaterial({
      color: colors[plant.zone] || 0xFF69B4,
      emissive: colors[plant.zone] || 0xFF69B4,
      emissiveIntensity: 0.2
    });
    const flower = new THREE.Mesh(flowerGeometry, flowerMaterial);
    flower.position.y = 2;
    flower.castShadow = true;
    group.add(flower);

    /*const petalCount = 6;
    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2;
      const petalGeometry = new THREE.SphereGeometry(0.3, 8, 8);
      const petal = new THREE.Mesh(petalGeometry, flowerMaterial);
      petal.position.set(
        Math.cos(angle) * 0.6,
        2,
        Math.sin(angle) * 0.6
      );
      petal.scale.set(1, 0.5, 0.5);
      petal.castShadow = true;
      group.add(petal);
    }*/


    // Cargar y aplicar la imagen sobre el cilindro
        if (plant.image_url) {
          const textureLoader = new THREE.TextureLoader();
           // Usar un proxy CORS para cargar la imagen
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(plant.image_url)}`;
          textureLoader.load(
            proxyUrl,
            (texture) => {
              // Crear un material con la textura
              const imageMaterial = new THREE.MeshStandardMaterial({
                map: texture,
                transparent: true,
                side: THREE.DoubleSide
              });
              
              // Reemplazar el material del cilindro con la imagen
              flower.material = imageMaterial;
            },
            undefined,
            (error) => {
              console.error('Error cargando la imagen de la planta:', error);
            }
          );
        }
    
    
        // Crear texto con el nombre común de la planta
        if (plant.common_name) {
          // Crear canvas para el texto
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          if (context) {
            // Configurar tamaño del canvas
            canvas.width = 512;
            canvas.height = 128;
            
            // Fondo transparente
            context.clearRect(0, 0, canvas.width, canvas.height);
            
            // Configurar texto
            context.fillStyle = '#FFFFFF';
            context.font = 'bold 48px Arial';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            
            // Agregar sombra/borde para mejor legibilidad
            context.strokeStyle = '#000000';
            context.lineWidth = 4;
            context.strokeText(plant.common_name, canvas.width / 2, canvas.height / 2);
            context.fillText(plant.common_name, canvas.width / 2, canvas.height / 2);
            
            // Crear textura desde el canvas
            const textTexture = new THREE.CanvasTexture(canvas);
            
            // Crear un plano para el texto
            const textGeometry = new THREE.PlaneGeometry(3, 1);
            const textMaterial = new THREE.MeshBasicMaterial({
              map: textTexture,
              transparent: true,
              side: THREE.DoubleSide
            });
            const textMesh = new THREE.Mesh(textGeometry, textMaterial);
            
            // Posicionar el texto encima del rectángulo
            textMesh.position.set(0, 3.3, 0); // y = 4 (rectángulo) + 1 (mitad del alto) + 0.3 (separación)
            
            group.add(textMesh);
          }
        }






    return group as THREE.Mesh;
  }

  private animate(){
    const time = performance.now() * 0.001; // Convertir a segundos
      this.animatePlayer(time);
  }

  update() {

    this.velocity.set(0, 0, 0);

    if (this.keys['w']) {
      this.velocity.z -= this.moveSpeed;
      this.animate();
    }
    if (this.keys['s']) {
      this.velocity.z += this.moveSpeed;
      this.animate();
    }
    if (this.keys['a']) {
      this.velocity.x -= this.moveSpeed;
      this.animate();
    }
    if (this.keys['d']) { 
      this.velocity.x += this.moveSpeed;
      this.animate();
    }

    if (this.velocity.length() > 0) {
      this.velocity.normalize().multiplyScalar(this.moveSpeed);
    }

    this.player.position.add(this.velocity);

    this.player.position.x = Math.max(-45, Math.min(45, this.player.position.x));
    this.player.position.z = Math.max(-505, Math.min(100, this.player.position.z));

    this.camera.position.x = this.player.position.x;
    this.camera.position.y = this.player.position.y + 2;
    this.camera.position.z = this.player.position.z + 5;
    this.camera.lookAt(this.player.position);

    this.checkPlantProximity();
  }

  private checkPlantProximity() {
    const proximityDistance = 3;

    for (const plantObj of this.plants) {
      const distance = this.player.position.distanceTo(plantObj.mesh.position);

      if (distance < proximityDistance && !plantObj.discovered && !this.discoveredPlants.has(plantObj.plant.id)) {
        this.discoveredPlants.add(plantObj.plant.id);
        if (this.onPlantNear) {
          this.onPlantNear(plantObj.plant);
        }
      }
    }
  }

  markPlantDiscovered(plantId: string) {
    const plantObj = this.plants.find(p => p.plant.id === plantId);
    if (plantObj) {
      plantObj.discovered = true;

      const flower = plantObj.mesh.children.find(
        child => child instanceof THREE.Mesh && child.geometry instanceof THREE.SphereGeometry
      ) as THREE.Mesh;

      if (flower && flower.material instanceof THREE.MeshStandardMaterial) {
        flower.material.emissiveIntensity = 0.6;

        this.createParticles(plantObj.mesh.position);
      }
    }
  }

  private createParticles(position: THREE.Vector3) {
    const particleCount = 20;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = position.x + (Math.random() - 0.5) * 2;
      positions[i + 1] = position.y + Math.random() * 2;
      positions[i + 2] = position.z + (Math.random() - 0.5) * 2;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0x00FF00,
      size: 0.15,
      transparent: true,
      opacity: 1
    });

    const particles = new THREE.Points(geometry, material);
    this.scene.add(particles);

    let opacity = 1;
    const fadeInterval = setInterval(() => {
      opacity -= 0.05;
      material.opacity = opacity;

      if (opacity <= 0) {
        clearInterval(fadeInterval);
        this.scene.remove(particles);
        geometry.dispose();
        material.dispose();
      }
    }, 50);
  }

  getScene(): THREE.Scene {
    return this.scene;
  }

  getCamera(): THREE.Camera {
    return this.camera;
  }

  dispose() {
    window.removeEventListener('keydown', () => {});
    window.removeEventListener('keyup', () => {});
  }
}
