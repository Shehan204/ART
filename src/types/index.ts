export interface Anchor {
  id: string;
  type: 'cube' | 'sphere' | 'cylinder' | 'model' | 'text';
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  color: string;
  anchorType: 'local' | 'geospatial' | 'vps';
  location?: { lat: number; lng: number };
  createdBy?: string;
  createdAt: number;
  visible: boolean;
  text?: string;
  modelUrl?: string;
}

export interface User {
  uid: string;
  email: string;
  role: 'admin' | 'user';
}
