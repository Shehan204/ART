import * as THREE from 'three';
import { ObjectFactory } from './ObjectFactory';
import { Anchor } from '../types';

export class SceneManager {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  private objectsGroup: THREE.Group;
  
  public reticle: THREE.Mesh | null = null;
  private hitTestSource: XRHitTestSource | null = null;
  private hitTestSourceRequested = false;
  private localReferenceSpace: XRReferenceSpace | null = null;

  constructor(container: HTMLElement) {
    this.scene = new THREE.Scene();
    
    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
    
    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    light.position.set(0.5, 1, 0.25);
    this.scene.add(light);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight.position.set(0, 2, 0);
    dirLight.castShadow = true;
    this.scene.add(dirLight);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.xr.enabled = true;
    container.appendChild(this.renderer.domElement);

    this.objectsGroup = new THREE.Group();
    this.scene.add(this.objectsGroup);

    this.setupReticle();
    this.setupWindowResize();
  }

  private setupReticle() {
    const geometry = new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    this.reticle = new THREE.Mesh(geometry, material);
    this.reticle.matrixAutoUpdate = false;
    this.reticle.visible = false;
    this.scene.add(this.reticle);
  }

  private setupWindowResize() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  public render(timestamp: number, frame: XRFrame) {
    if (frame && this.reticle) {
      if (!this.hitTestSourceRequested) {
        const session = this.renderer.xr.getSession();
        if (session) {
          session.requestReferenceSpace('viewer').then((referenceSpace) => {
            session.requestHitTestSource({ space: referenceSpace })?.then((source) => {
              this.hitTestSource = source;
            });
          });
          session.requestReferenceSpace('local').then((refSpace) => {
             this.localReferenceSpace = refSpace;
          });
          this.hitTestSourceRequested = true;
        }
      }

      if (this.hitTestSource && this.localReferenceSpace) {
        const hitTestResults = frame.getHitTestResults(this.hitTestSource);
        if (hitTestResults.length > 0) {
          const hit = hitTestResults[0];
          const pose = hit.getPose(this.localReferenceSpace);
          if (pose) {
            this.reticle.visible = true;
            this.reticle.matrix.fromArray(pose.transform.matrix);
          }
        } else {
          this.reticle.visible = false;
        }
      }
    }
    
    this.renderer.render(this.scene, this.camera);
  }

  public getReticlePosition(): THREE.Vector3 | null {
    if (!this.reticle || !this.reticle.visible) return null;
    const position = new THREE.Vector3();
    position.setFromMatrixPosition(this.reticle.matrix);
    return position;
  }

  public getCameraPosition(): THREE.Vector3 {
    return this.camera.position.clone();
  }
  
  public getCameraDirection(): THREE.Vector3 {
    const dir = new THREE.Vector3();
    this.camera.getWorldDirection(dir);
    return dir;
  }

  public syncObjects(anchors: Anchor[]) {
    // Remove objects that don't exist in the new list
    const existingIds = this.objectsGroup.children.map(child => child.uuid);
    const newIds = anchors.map(a => a.id);
    
    const toRemove = this.objectsGroup.children.filter(child => !newIds.includes(child.uuid));
    toRemove.forEach(child => this.objectsGroup.remove(child));

    // Add or update objects
    anchors.forEach(anchor => {
      const existing = this.objectsGroup.children.find(c => c.uuid === anchor.id) as THREE.Group;
      if (existing) {
        ObjectFactory.updateMesh(existing, anchor);
      } else {
        const mesh = ObjectFactory.createMesh(anchor);
        this.objectsGroup.add(mesh);
      }
    });
  }

  public dispose() {
    this.renderer.dispose();
  }
}
