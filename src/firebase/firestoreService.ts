import { db } from './firebase';
import { collection, onSnapshot, setDoc, doc, deleteDoc, getDocs, updateDoc, query, where } from 'firebase/firestore';
import { Anchor } from '../types';

export class FirestoreService {
  private collectionName = 'anchors';

  public subscribeToAnchors(callback: (anchors: Anchor[]) => void) {
    const q = query(collection(db, this.collectionName), where('visible', '==', true));
    return onSnapshot(q, (snapshot) => {
      const anchors: Anchor[] = [];
      snapshot.forEach((doc) => {
        anchors.push({ id: doc.id, ...doc.data() } as Anchor);
      });
      callback(anchors);
    }, (error) => {
      console.error("Firestore subscription error", error);
    });
  }

  public subscribeToAllAnchorsAsAdmin(callback: (anchors: Anchor[]) => void) {
    return onSnapshot(collection(db, this.collectionName), (snapshot) => {
      const anchors: Anchor[] = [];
      snapshot.forEach((doc) => {
        anchors.push({ id: doc.id, ...doc.data() } as Anchor);
      });
      callback(anchors);
    }, (error) => {
      console.error("Firestore subscription error", error);
    });
  }

  public async saveAnchor(anchor: Anchor): Promise<void> {
    try {
      await setDoc(doc(db, this.collectionName, anchor.id), anchor);
    } catch (error) {
      console.error("Error saving anchor", error);
      throw error;
    }
  }

  public async updateAnchor(id: string, updates: Partial<Anchor>): Promise<void> {
    try {
      await updateDoc(doc(db, this.collectionName, id), updates);
    } catch (error) {
      console.error("Error updating anchor", error);
      throw error;
    }
  }

  public async deleteAnchor(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.collectionName, id));
    } catch (error) {
      console.error("Error deleting anchor", error);
      throw error;
    }
  }
}

export const firestoreService = new FirestoreService();
