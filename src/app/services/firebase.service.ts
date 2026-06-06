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
  collectionData,
  addDoc,        
  query,         
  where,         
  orderBy        
} from '@angular/fire/firestore';

import { firebaseApp } from '../firebase';
import { Observable } from 'rxjs';

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

  // 📦 SALVAR PEDIDO (FIRESTORE)
  salvarPedido(pedido: any) {
    const user = this.getCurrentUser();
    
    const dadosPedido = {
      ...pedido,
      uidUsuario: user ? user.uid : 'anonimo', // Sincronizado com uidUsuario do seu PedidoService
      dataCriacao: new Date(),                // Sincronizado com dataCriacao do seu PedidoService
      status: 'Pedido confirmado'
    };

    const ref = collection(this.firestore, 'pedidos');
    return addDoc(ref, dadosPedido); 
  }

  // 📜 BUSCAR PEDIDOS DO USUÁRIO LOGADO (CORRIGIDO PARA MAPEAR SUA JORNADA DE COMPRA)
getPedidos(): Observable<any[]> {
    const ref = collection(this.firestore, 'pedidos');
    // Remove o filtro 'where' temporariamente para testar se puxa tudo
    const q = query(ref, orderBy('dataCriacao', 'desc')); 
    return collectionData(q, { idField: 'id' }) as Observable<any[]>;
  }
}