import { Injectable } from '@angular/core';
import { 
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail
} from 'firebase/auth';

import { firebaseApp } from '../firebase';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  private auth = getAuth(firebaseApp);

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

  // 👤 PEGAR USUÁRIO ATUAL
  getCurrentUser() {
    return this.auth.currentUser;
  }
}