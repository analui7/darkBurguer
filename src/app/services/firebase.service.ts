import { Injectable } from '@angular/core';
import { 
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail
} from 'firebase/auth';

import { 
  Firestore,
  collection,
  collectionData
} from '@angular/fire/firestore';

import { firebaseApp } from '../firebase';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  private auth = getAuth(firebaseApp);

  constructor(private firestore: Firestore) {}

  // 🔐 LOGIN
  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  // 🆕 CADASTRO
  register(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  // 🚪 LOGOUT
  logout() {
    return signOut(this.auth);
  }

  // 📩 ESQUECI SENHA
  resetPassword(email: string) {
    return sendPasswordResetEmail(this.auth, email);
  }

  // 👤 USUÁRIO ATUAL
  getCurrentUser() {
    return this.auth.currentUser;
  }

  // 🍔 PRODUTOS (FIRESTORE)
  getProducts() {
    const ref = collection(this.firestore, 'products');
    return collectionData(ref, { idField: 'id' });
  }
}