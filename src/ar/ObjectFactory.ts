import * as THREE from 'three';
import { Anchor } from '../types';

export class ObjectFactory {
  public static createMesh(anchor: Anchor): THREE.Group {
    const group = new THREE.Group();
    group.uuid = anchor.id; // Try to keep ID in sync
    group.userData = { anchor };
    
    let geometry: THREE.BufferGeometry;
    const material = new THREE.MeshStandardMaterial({ 
      color: anchor.color,
      roughness: 0.7,
      metalness: 0.3
    });

    switch (anchor.type) {
      case 'cube':
        geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        break;
      case 'sphere':
        geometry = new THREE.SphereGeometry(0.05, 32, 32);
        break;
      case 'cylinder':
        geometry = new THREE.CylinderGeometry(0.05, 0.05, 0.1, 32);
        break;
      default:
        geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        break;
    }

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);

    group.position.set(anchor.position.x, anchor.position.y, anchor.position.z);
    group.rotation.set(anchor.rotation.x, anchor.rotation.y, anchor.rotation.z);
    group.scale.set(anchor.scale.x, anchor.scale.y, anchor.scale.z);

    return group;
  }

  public static updateMesh(group: THREE.Group, anchor: Anchor): void {
    group.position.set(anchor.position.x, anchor.position.y, anchor.position.z);
    group.rotation.set(anchor.rotation.x, anchor.rotation.y, anchor.rotation.z);
    group.scale.set(anchor.scale.x, anchor.scale.y, anchor.scale.z);
    group.userData = { anchor };

    // Update material color if possible
    group.children.forEach(child => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
        child.material.color.set(anchor.color);
      }
    });
  }
}
