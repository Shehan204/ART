export class ARSessionManager {
  public static async isARSupported(): Promise<boolean> {
    if ('xr' in navigator && navigator.xr) {
      try {
        return await navigator.xr.isSessionSupported('immersive-ar');
      } catch (e) {
        return false;
      }
    }
    return false;
  }
}
