import * as THREE from 'three';
import { Plant } from '../lib/supabase';

interface QuizOption {
  text: string;
  correct: boolean;
  position: number;
}

export class RushMode {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  //private player: THREE.Mesh;
  private player: THREE.Group;
  private currentPlant: Plant | null = null;
  private options: QuizOption[] = [];
  private optionMeshes: THREE.Mesh[] = [];
  private groundSegments: THREE.Mesh[] = [];
  private plantMesh: THREE.Mesh | null = null;
  private speed = 0.1;
  private times = 0;
  private timeDivisor=20;
  private score = 0;
  private plantsCorrect = 0;
  private plantsTotal = 0;
  private lives = 3;
  private playerLane = 0;
  private targetLane = 0;
  private controls = {left: false, right: false};
  private laneWidth = 4;

  // Solo crear controles si es dispositivo móvil
  private isInMobile = false;

  onQuizResult: ((correct: boolean, plant: Plant) => void) | null = null;
  onGameOver: ((score: number, correct: number, total: number) => void) | null = null;

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB);
    this.scene.fog = new THREE.Fog(0x87CEEB, 5, 40);

    // Solo crear controles si es dispositivo móvil
    this.isInMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    if(this.isInMobile){
      this.camera.position.set(0, 5, 15);
      this.speed = 0.1;
    }
    else
      this.camera.position.set(0, 5, 10);
    this.camera.lookAt(0, 0, -10);

    this.setupLights();
    this.createGround();
    this.player = this.createPlayer();
    this.setupControls();
    this.createMobileControls();
  }

  private setupLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);
  }

  private createGround() {
    for (let i = 0; i < 10; i++) {
      const geometry = new THREE.PlaneGeometry(15, 10);
      const material = new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0x4A7C4E : 0x3D6B40,
        roughness: 0.8,
      });
      const ground = new THREE.Mesh(geometry, material);
      ground.rotation.x = -Math.PI / 2;
      ground.position.z = -i * 10;
      ground.receiveShadow = true;
      this.scene.add(ground);
      this.groundSegments.push(ground);
    }
  }

  /*private createPlayer(): THREE.Mesh {
    const geometry = new THREE.CapsuleGeometry(0.5, 1, 4, 8);
    const material = new THREE.MeshStandardMaterial({ color: 0x4A90E2 });
    const player = new THREE.Mesh(geometry, material);
    player.position.set(0, 1, 5);
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














  private setupControls() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' && this.targetLane > -1) {
        this.targetLane--;
      } else if (e.key === 'ArrowRight' && this.targetLane < 1) {
        this.targetLane++;
      }
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

  // Event listeners para el botón izquierdo
  leftButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    this.controls.left = true;
    if(this.targetLane > -1)
      this.targetLane--;
    leftButton.style.background = 'rgba(74, 144, 226, 1)';
  });

  leftButton.addEventListener('touchend', (e) => {
    e.preventDefault();
    this.controls.left = false;
    leftButton.style.background = 'rgba(74, 144, 226, 0.7)';
  });

  // Event listeners para el botón derecho
  rightButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    this.controls.right = true;
    if(this.targetLane < 1)
      this.targetLane++;
    rightButton.style.background = 'rgba(74, 144, 226, 1)';
  });

  rightButton.addEventListener('touchend', (e) => {
    e.preventDefault();
    this.controls.right = false;
    rightButton.style.background = 'rgba(74, 144, 226, 0.7)';
  });

  // Agregar botones al contenedor
  controlsContainer.appendChild(leftButton);
  controlsContainer.appendChild(rightButton);
  
  // Agregar al DOM
  document.body.appendChild(controlsContainer);
}

  loadNextQuiz(plant: Plant, allPlants: Plant[]) {
    this.currentPlant = plant;
    this.plantsTotal++;

    if (this.plantMesh) {
      this.scene.remove(this.plantMesh);
    }

    this.plantMesh = this.createPlantMesh(plant);
    this.plantMesh.position.set(0, 1, -15);
    this.scene.add(this.plantMesh);

    this.optionMeshes.forEach(mesh => this.scene.remove(mesh));
    this.optionMeshes = [];

    const wrongPlants = allPlants
      .filter(p => p.id !== plant.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);

    const options: QuizOption[] = [
      { text: plant.scientific_name, correct: true, position: 0 },
      { text: wrongPlants[0].scientific_name, correct: false, position: -1 },
      { text: wrongPlants[1].scientific_name, correct: false, position: 1 }
    ];

    options.sort(() => Math.random() - 0.5);
    options.forEach((opt, idx) => {
      opt.position = idx - 1;
    });

    this.options = options;

    options.forEach(option => {
      const mesh = this.createOptionMesh(option);
      mesh.position.set(option.position * this.laneWidth, 0.5, -25);
      this.scene.add(mesh);
      this.optionMeshes.push(mesh);
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

    //const stemGeometry = new THREE.CylinderGeometry(0.08, 0.12, 1, 8);
    const stemGeometry = new THREE.CylinderGeometry(0.3, 0.4, 3, 16);
    const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    stem.position.y = 0.5;
    group.add(stem);

    //const flowerGeometry = new THREE.SphereGeometry(0.4, 12, 12);
    //const flowerGeometry = new THREE.SphereGeometry(1.2, 16, 16);
    const flowerGeometry = new THREE.BoxGeometry(1.5, 2, 0.8);
    const flowerMaterial = new THREE.MeshStandardMaterial({
      color: colors[plant.zone] || 0xFF69B4,
      emissive: colors[plant.zone] || 0xFF69B4,
      emissiveIntensity: 0.3
    });
    const flower = new THREE.Mesh(flowerGeometry, flowerMaterial);
    flower.position.y = 1.2;
    group.add(flower);

    // Cargar y aplicar la imagen sobre el cilindro
    if (plant.image_url) {
      const textureLoader = new THREE.TextureLoader();
      // Usar un proxy CORS para cargar la imagen
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(plant.image_url)}`;
      textureLoader.load(
        //plant.image_url,
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
        textMesh.position.set(0, 2.3, 0); // y = 4 (rectángulo) + 1 (mitad del alto) + 0.3 (separación)
        
        group.add(textMesh);
      }
    }



    return group as THREE.Mesh;
  }

  /*private createOptionMesh(option: QuizOption): THREE.Mesh {
    const geometry = new THREE.BoxGeometry(3, 1, 0.5);
    const material = new THREE.MeshStandardMaterial({
      color: option.correct ? 0x4CAF50 : 0x2196F3,
      emissive: option.correct ? 0x2E7D32 : 0x1565C0,
      emissiveIntensity: 0.2
    });
    console.log(option.text);
    const mesh = new THREE.Mesh(geometry, material);
    return mesh;
  }*/

    private createOptionMesh(option: QuizOption): THREE.Mesh {
    const group = new THREE.Group() as any;
    
    const geometry = new THREE.BoxGeometry(3, 3, 0.5);
    const material = new THREE.MeshStandardMaterial({
      //color: option.correct ? 0x4CAF50 : 0x2196F3,
      color: 0x1565C0,
      //emissive: option.correct ? 0x2E7D32 : 0x1565C0,
      emissive: 0x1565C0,
      emissiveIntensity: 0.2
    });
    console.log(option.text);
    const mesh = new THREE.Mesh(geometry, material);
    group.add(mesh);

    // Crear texto estampado en la caja
    if (option.text) {
      // Crear canvas para el texto
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (context) {
        // Configurar tamaño del canvas
        canvas.width = 1024;
        canvas.height = 256;
        
        // Fondo transparente
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        // Configurar texto
        context.fillStyle = '#FFFFFF';
        context.font = 'bold 64px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        // Agregar sombra/borde para mejor legibilidad
        context.strokeStyle = '#000000';
        context.lineWidth = 6;
        context.strokeText(option.text, canvas.width / 2, canvas.height / 2);
        context.fillText(option.text, canvas.width / 2, canvas.height / 2);
        
        // Crear textura desde el canvas
        const textTexture = new THREE.CanvasTexture(canvas);
        
        // Crear un plano para el texto en el frente de la caja
        const textGeometry = new THREE.PlaneGeometry(3.8, 1.8);
        const textMaterial = new THREE.MeshBasicMaterial({
          map: textTexture,
          transparent: true,
          side: THREE.DoubleSide
        });
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        
        // Posicionar el texto al frente de la caja
        textMesh.position.z = 0.26; // Ligeramente adelante de la caja (0.5/2 + 0.01)
        textMesh.position.y = 0.5;
        
        group.add(textMesh);
      }
    }

    return group as THREE.Mesh;
}

  update() {
    const time = performance.now() * 0.001; // Convertir a segundos
  
  // Llamar a la animación del personaje
  this.animatePlayer(time);


    if (this.lives <= 0) return;

    this.playerLane += (this.targetLane - this.playerLane) * 0.15;
    this.player.position.x = this.playerLane * this.laneWidth;

    this.groundSegments.forEach(segment => {
      segment.position.z += this.speed;
      if (segment.position.z > 10) {
        segment.position.z -= 100;
      }
    });

    if (this.plantMesh) {
      this.plantMesh.position.z += this.speed;
      this.plantMesh.rotation.y += 0.02;
    }

    this.optionMeshes.forEach(mesh => {
      mesh.position.z += this.speed;
    });

    if (this.optionMeshes.length > 0 && this.optionMeshes[0].position.z > 5) {
      this.checkAnswer();
    }
  }

  private checkAnswer() {
    if (!this.currentPlant) return;

    const selectedLane = Math.round(this.playerLane);
    const selectedOption = this.options.find(opt => opt.position === selectedLane);

    if (selectedOption) {
      const correct = selectedOption.correct;

      if (correct) {
        this.score += 100;
        this.plantsCorrect++;
        this.createSuccessEffect();
        this.times++;
      } else {
        this.lives--;
        this.createFailEffect();
      }

      if (this.onQuizResult) {
        this.onQuizResult(correct, this.currentPlant);
      }

      if (this.lives <= 0 && this.onGameOver) {
        this.onGameOver(this.score, this.plantsCorrect, this.plantsTotal);
      }

      // check time to update speed
      /*if(this.times > 0 && (this.times % this.timeDivisor)) {
        this.speed = this.speed + 0.01;
      }*/
     if(this.times > 0){
      if (this.isInMobile){
        this.speed = this.speed + 0.005;
      }else
        this.speed = this.speed + 0.005;
     }
    } else {
      this.lives--;
      if (this.lives <= 0 && this.onGameOver) {
        this.onGameOver(this.score, this.plantsCorrect, this.plantsTotal);
      }
    }

    this.optionMeshes.forEach(mesh => this.scene.remove(mesh));
    this.optionMeshes = [];
    if (this.plantMesh) {
      this.scene.remove(this.plantMesh);
      this.plantMesh = null;
    }
  }

  private createSuccessEffect() {
    const particleCount = 30;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = this.player.position.x + (Math.random() - 0.5) * 3;
      positions[i + 1] = this.player.position.y + Math.random() * 2;
      positions[i + 2] = this.player.position.z + (Math.random() - 0.5) * 3;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0x00FF00,
      size: 0.2,
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

  private createFailEffect() {
    const particleCount = 20;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = this.player.position.x + (Math.random() - 0.5) * 2;
      positions[i + 1] = this.player.position.y + Math.random() * 2;
      positions[i + 2] = this.player.position.z + (Math.random() - 0.5) * 2;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xFF0000,
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

  getScore(): number {
    return this.score;
  }

  getLives(): number {
    return this.lives;
  }

  getStats() {
    return {
      score: this.score,
      correct: this.plantsCorrect,
      total: this.plantsTotal,
      lives: this.lives
    };
  }

  reset() {
    this.score = 0;
    this.plantsCorrect = 0;
    this.plantsTotal = 0;
    this.lives = 3;
    this.playerLane = 0;
    this.targetLane = 0;

    this.optionMeshes.forEach(mesh => this.scene.remove(mesh));
    this.optionMeshes = [];
    if (this.plantMesh) {
      this.scene.remove(this.plantMesh);
      this.plantMesh = null;
    }
  }

  dispose() {
    window.removeEventListener('keydown', () => {});
  }
}
