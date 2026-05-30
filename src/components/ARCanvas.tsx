import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import * as THREE from 'three';
import { ARButton } from 'three/addons/webxr/ARButton.js';
import { SceneManager } from '../ar/SceneManager';
import { firestoreService } from '../firebase/firestoreService';
import { Anchor } from '../types';

export interface ARCanvasRef {
  placeObject: (type: Anchor['type'], color: string) => void;
  deleteLookedAtObject: () => void;
}

interface ARCanvasProps {
  isAdmin: boolean;
  onSessionStart?: () => void;
  onSessionEnd?: () => void;
  onReady?: () => void;
}

export const ARCanvas = forwardRef<ARCanvasRef, ARCanvasProps>(({ isAdmin, onSessionStart, onSessionEnd, onReady }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const sceneManagerRef = useRef<SceneManager | null>(null);
  const [anchors, setAnchors] = useState<Anchor[]>([]);
  
  useEffect(() => {
    if (!containerRef.current || !buttonContainerRef.current) return;
    
    // Initialize Three.js Scene
    sceneManagerRef.current = new SceneManager(containerRef.current);
    const sceneManager = sceneManagerRef.current;
    
    // Create AR Button with DOM Overlay enabled so UI is visible on iOS/WebXR Viewer
    const button = ARButton.createButton(sceneManager.renderer, { 
      requiredFeatures: ['hit-test'],
      optionalFeatures: ['dom-overlay', 'local-floor'],
      // We set root to document body so entire React tree is overlayed
      domOverlay: { root: document.body }
    });
    button.style.position = 'absolute';
    button.style.bottom = '20px';
    button.style.padding = '12px 24px';
    button.style.border = '1px solid #00F0FF';
    button.style.borderRadius = '2px';
    button.style.background = '#0A0B0E';
    button.style.color = '#00F0FF';
    button.style.fontFamily = 'monospace';
    button.style.fontSize = '12px';
    button.style.fontWeight = 'bold';
    button.style.textTransform = 'uppercase';
    button.style.letterSpacing = '0.1em';
    button.style.outline = 'none';
    button.style.zIndex = '999';
    button.style.cursor = 'pointer';
    button.style.left = '50%';
    button.style.transform = 'translateX(-50%)';
    buttonContainerRef.current.appendChild(button);
    
    const renderLoop = (timestamp: number, frame: XRFrame) => {
      sceneManager.render(timestamp, frame);
    };

    if (sceneManager.renderer.xr.enabled) {
      sceneManager.renderer.setAnimationLoop(renderLoop);
    }
    
    // Tap to select/delete
    const onSelect = () => {
      if (!isAdmin) return;
      import('three').then((THREE) => {
        const controller = sceneManager.renderer.xr.getController(0);
        const tempMatrix = new THREE.Matrix4();
        tempMatrix.identity().extractRotation(controller.matrixWorld);
        
        const raycaster = new THREE.Raycaster();
        raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
        raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);
        
        const intersects = raycaster.intersectObjects(sceneManager.scene.children, true);
        if (intersects.length > 0) {
          const findGroup = (obj: THREE.Object3D): THREE.Group | null => {
            if (obj.userData?.anchor) return obj as THREE.Group;
            if (obj.parent) return findGroup(obj.parent);
            return null;
          };
          
          for (let i = 0; i < intersects.length; i++) {
             const group = findGroup(intersects[i].object);
             if (group && group.uuid) {
                 // Automatically delete tapped object if admin
                 firestoreService.deleteAnchor(group.uuid).catch(console.error);
                 return;
             }
          }
        }
      });
    };

    const controller = sceneManager.renderer.xr.getController(0);
    controller.addEventListener('select', onSelect);
    sceneManager.scene.add(controller);
    
    if (onReady) onReady();
    
    // Listen for WebXR session events
    sceneManager.renderer.xr.addEventListener('sessionstart', () => {
      if (buttonContainerRef.current) buttonContainerRef.current.style.display = 'none';
      if (onSessionStart) onSessionStart();
    });
    sceneManager.renderer.xr.addEventListener('sessionend', () => {
      if (buttonContainerRef.current) buttonContainerRef.current.style.display = 'block';
      if (onSessionEnd) onSessionEnd();
    });

    // Subscribe to Firestore for anchors (View only vs Admin)
    const unsubscribe = isAdmin 
      ? firestoreService.subscribeToAllAnchorsAsAdmin((fetched) => setAnchors(fetched))
      : firestoreService.subscribeToAnchors((fetched) => setAnchors(fetched));

    return () => {
      if (sceneManagerRef.current) {
        sceneManagerRef.current.dispose();
      }
      if (button.parentElement) button.parentElement.removeChild(button);
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Sync anchors to scene whenever data changes
    if (sceneManagerRef.current && anchors.length > 0) {
      sceneManagerRef.current.syncObjects(anchors);
    } else if (sceneManagerRef.current && anchors.length === 0) {
      sceneManagerRef.current.syncObjects([]);
    }
  }, [anchors]);

  // Expose methods for Admin UI
  useImperativeHandle(ref, () => ({
    placeObject: async (type: Anchor['type'], color: string) => {
      if (!sceneManagerRef.current) return;
      let pos = sceneManagerRef.current.getReticlePosition();
      if (!pos) {
        console.warn("No surface found, placing 1.5m in front of camera as fallback");
        const cameraPos = sceneManagerRef.current.getCameraPosition();
        const cameraDir = sceneManagerRef.current.getCameraDirection();
        pos = {
          x: cameraPos.x + cameraDir.x * 1.5,
          y: cameraPos.y + cameraDir.y * 1.5,
          z: cameraPos.z + cameraDir.z * 1.5,
        } as any;
      }
      
      const { anchorService } = await import('../ar/AnchorService');
      const anchor = anchorService.createLocalAnchor(type, { x: pos.x, y: pos.y, z: pos.z }, color);
      
      try {
        await firestoreService.saveAnchor(anchor);
      } catch (e) {
        console.error("Failed to save anchor", e);
      }
    },
    deleteLookedAtObject: () => {
       if (!sceneManagerRef.current) return;
       import('three').then(THREE => {
          const pos = sceneManagerRef.current!.getCameraPosition();
          const dir = sceneManagerRef.current!.getCameraDirection();
          const raycaster = new THREE.Raycaster(pos, dir.normalize());
          
          const intersects = raycaster.intersectObjects(sceneManagerRef.current!.scene.children, true);
          if (intersects.length > 0) {
            const findGroup = (obj: THREE.Object3D): THREE.Group | null => {
               if (obj.userData?.anchor) return obj as THREE.Group;
               if (obj.parent) return findGroup(obj.parent);
               return null;
            };
            
            for (let i = 0; i < intersects.length; i++) {
               const group = findGroup(intersects[i].object);
               if (group && group.uuid) {
                  firestoreService.deleteAnchor(group.uuid).catch(console.error);
                  break;
               }
            }
          }
       });
    }
  }));

  // Render a full-screen container
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center bg-transparent">
        <div ref={containerRef} className="absolute inset-0 w-full h-full bg-transparent" style={{ touchAction: 'none' }} />
        <div ref={buttonContainerRef} className="absolute inset-0 z-[100] pointer-events-none [&>button]:pointer-events-auto" />
    </div>
  );
});
