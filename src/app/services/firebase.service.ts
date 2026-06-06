import { Injectable } from '@angular/core';
import { 
  Auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  authState
} from '@angular/fire/auth';

import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  query,
  where,
  orderBy,
  doc,
  getDoc,
  setDoc
} from '@angular/fire/firestore';

import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor(
    private firestore: Firestore,
    private auth: Auth
  ) {}

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

  // 👤 PERFIL DO USUÁRIO
  async salvarPerfilUsuario(uid: string, dados: any) {
    console.log('💾 [FirebaseService] Salvando perfil para UID:', uid, dados);
    const userDocRef = doc(this.firestore, `usuarios/${uid}`);
    return setDoc(userDocRef, dados, { merge: true });
  }

  async buscarPerfilUsuario(uid: string) {
    console.log('🔍 [FirebaseService] Buscando perfil para UID:', uid);
    const userDocRef = doc(this.firestore, `usuarios/${uid}`);
    const docSnap = await getDoc(userDocRef);
    return docSnap.exists() ? docSnap.data() : null;
  }

  // 📜 BUSCAR PEDIDOS DO USUÁRIO LOGADO
  buscarPedidosUsuario(uid: string): Observable<any[]> {
    console.log('📡 [FirebaseService] Iniciando busca de pedidos para UID:', uid);
    const ref = collection(this.firestore, 'pedidos');
    
    // Simplificamos a query removendo o orderBy temporariamente
    // Isso evita erros de "Index missing" que fazem a query retornar vazio silenciosamente
    const q = query(
      ref, 
      where('uidUsuario', '==', uid)
    );

    return collectionData(q, { idField: 'id' }) as Observable<any[]>;
  }
}