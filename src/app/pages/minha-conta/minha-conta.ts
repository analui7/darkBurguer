import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FirebaseService } from '../../services/firebase.service';
import { PedidoService } from '../../services/pedido.service';

// 🆕 Importações oficiais e reativas do Angular Fire
import { Firestore, collection, query, where, orderBy, collectionData } from '@angular/fire/firestore';
import { Auth, authState } from '@angular/fire/auth'; 
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-minha-conta',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './minha-conta.html',
  styleUrl: './minha-conta.css',
})
export class MinhaContaComponent implements OnInit, OnDestroy {
  
  // O HTML vai iniciar com 'Carregando...' até o Firebase responder
  usuario: any = { nome: 'Usuário', email: 'Carregando...' };
  endereco: any = { rua: 'Rua das Flores', numero: '123', bairro: 'Centro' };
  pedidos: any[] = [];

  showModalDados: boolean = false;
  showModalEndereco: boolean = false;
  tempUsuario: any = {};
  tempEndereco: any = {};

  // Inscrições para evitar vazamento de memória
  private authSubscription: Subscription | null = null;
  private pedidosSubscription: Subscription | null = null;

  constructor(
    private firebaseService: FirebaseService,
    private pedidoService: PedidoService, 
    private firestore: Firestore,         
    private auth: Auth, // 🆕 Injetando o Auth reativo do Angular Fire
    private router: Router
  ) {}

  ngOnInit() {
    this.carregarEnderecoLocal();
    this.escutarEstadoDoLogin();
  }

  ngOnDestroy() {
    if (this.authSubscription) this.authSubscription.unsubscribe();
    if (this.pedidosSubscription) this.pedidosSubscription.unsubscribe();
  }

  carregarEnderecoLocal() {
    const endLocal = localStorage.getItem('endereco_entrega');
    if (endLocal) {
      this.endereco = JSON.parse(endLocal);
    }
  }

  // 🔐 1. ESCUTA SE O USUÁRIO ESTÁ LOGADO (REATIVO)
  escutarEstadoDoLogin() {
    // O authState fica vigiando o Firebase. Quando os "..." sumirem e o login for validado, ele dispara!
    this.authSubscription = authState(this.auth).subscribe({
      next: (user) => {
        if (user) {
          console.log('✅ [Minha Conta] Usuário detectado pelo AuthState:', user.uid);
          
          // Atualiza o e-mail na tela tirando os "..."
          this.usuario.email = user.email || 'Sem e-mail';
          
          // Tenta pegar o nome salvo no LocalStorage ou usa o displayName do Firebase
          const dadosLocais = localStorage.getItem('usuario');
          this.usuario.nome = dadosLocais ? JSON.parse(dadosLocais).nome : (user.displayName || 'Cliente');

          // Agora que temos o UID real com certeza absoluta, buscamos os pedidos dele!
          this.buscarPedidosDoBanco(user.uid);
        } else {
          console.warn('⚠️ [Minha Conta] Nenhum usuário logado no Firebase.');
          this.usuario.email = 'deslogado@darkburger.com';
          this.buscarPedidosDoBanco('anonimo');
        }
      },
      error: (err) => console.error('Erro ao checar estado do login:', err)
    });
  }

  // 🍔 2. BUSCA OS PEDIDOS USANDO O ID CORRETO VINDOR DO AUTHSTATE
  private buscarPedidosDoBanco(uid: string) {
    console.log('🔎 [Minha Conta] Buscando pedidos no Firestore para o UID:', uid);

    const ref = collection(this.firestore, 'pedidos');
    
    // Consulta filtrando direto no banco pelo ID do usuário logado
    const q = query(
      ref, 
      where('uidUsuario', '==', uid), 
      orderBy('dataCriacao', 'desc')
    );

    if (this.pedidosSubscription) this.pedidosSubscription.unsubscribe();

    this.pedidosSubscription = collectionData(q, { idField: 'id' }).subscribe({
      next: (dados: any[]) => {
        console.log('📦 [Minha Conta] Pedidos recebidos do Firestore:', dados);

        this.pedidos = dados.map(pedido => {
          let dataFormatada = 'Recente';
          
          if (pedido.dataCriacao) {
            try {
              const t = pedido.dataCriacao;
              const dateObj = t.seconds ? new Date(t.seconds * 1000) : new Date(t);
              dataFormatada = dateObj.toLocaleDateString('pt-BR');
            } catch (e) {
              dataFormatada = 'Recente';
            }
          }

          return {
            id: pedido.id,
            status: pedido.status || 'Pedido confirmado',
            data: dataFormatada,
            total: pedido.valores?.total ? Number(pedido.valores.total) : (pedido.total ? Number(pedido.total) : 0),
            totalItens: pedido.itens ? pedido.itens.length : (pedido.totalItens ? Number(pedido.totalItens) : 1)
          };
        });
      },
      error: (err) => {
        console.error('❌ Erro ao listar pedidos do Firebase:', err);
      }
    });
  }

  // --- MODAIS ---
  abrirModalDados() { this.tempUsuario = { ...this.usuario }; this.showModalDados = true; }
  salvarDadosPessoais() { if (!this.tempUsuario.nome.trim()) return; this.usuario.nome = this.tempUsuario.nome; localStorage.setItem('usuario', JSON.stringify({ nome: this.usuario.nome })); this.showModalDados = false; }
  abrirModalEndereco() { this.tempEndereco = { ...this.endereco }; this.showModalEndereco = true; }
  salvarEndereco() { if (!this.tempEndereco.rua.trim() || !this.tempEndereco.numero.trim()) return; this.endereco = { ...this.tempEndereco }; localStorage.setItem('endereco_entrega', JSON.stringify(this.endereco)); this.showModalEndereco = false; }
  
  irParaRastreamento(pedido: any) { 
    this.router.navigate(['/rastreamento', pedido.id]); 
  }
  
  logout() { this.firebaseService.logout().then(() => { localStorage.clear(); sessionStorage.clear(); this.router.navigate(['/']); }); }
}