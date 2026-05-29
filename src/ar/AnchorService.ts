import { Anchor } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class AnchorService {
  /**
   * Translates a hit test position into an Anchor object.
   * In a real VPS system, this would map local coordinates to geospatial or cloud coordinates.
   */
  public createLocalAnchor(
    type: Anchor['type'],
    position: { x: number; y: number; z: number },
    color: string = '#ffffff'
  ): Anchor {
    return {
      id: uuidv4(),
      type,
      position,
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      color,
      anchorType: 'local',
      createdAt: Date.now(),
      visible: true
    };
  }

  /**
   * Placeholder for future cloud/VPS anchor resolution.
   */
  public resolveAnchor(anchor: Anchor, localReferenceSpace: any): { x: number; y: number; z: number } {
    // For now, assume the anchor position is directly relative to the initial local reference space
    return anchor.position;
  }
}

export const anchorService = new AnchorService();
