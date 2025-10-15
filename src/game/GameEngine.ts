import * as THREE from 'three';

export type GameMode = 'menu' | 'exploration' | 'rush' | 'herbario';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private currentScene: THREE.Scene | null = null;
  private currentCamera: THREE.Camera | null = null;
  private animationId: number | null = null;
  private updateCallback: (() => void) | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    window.addEventListener('resize', this.handleResize);
  }

  private handleResize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.renderer.setSize(width, height);

    if (this.currentCamera && this.currentCamera instanceof THREE.PerspectiveCamera) {
      this.currentCamera.aspect = width / height;
      this.currentCamera.updateProjectionMatrix();
    }
  };

  setScene(scene: THREE.Scene, camera: THREE.Camera) {
    this.currentScene = scene;
    this.currentCamera = camera;
  }

  setUpdateCallback(callback: () => void) {
    this.updateCallback = callback;
  }

  start() {
    if (this.animationId !== null) return;
    this.animate();
  }

  stop() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private animate = () => {
    this.animationId = requestAnimationFrame(this.animate);

    if (this.updateCallback) {
      this.updateCallback();
    }

    if (this.currentScene && this.currentCamera) {
      this.renderer.render(this.currentScene, this.currentCamera);
    }
  };

  dispose() {
    this.stop();
    window.removeEventListener('resize', this.handleResize);
    this.renderer.dispose();
  }

  getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }
}
