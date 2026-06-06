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
    console.log('🔄 [Minha Conta] Iniciando escuta do estado de login...');
    this.authSubscription = authState(this.auth).subscribe({
      next: async (user) => {
        if (user) {
          console.log('✅ [Minha Conta] Usuário detectado:', user.uid, user.email);
          
          this.usuario.email = user.email || 'Sem e-mail';
          
          try {
            // Busca perfil no Firestore para garantir dados reais
            const perfil: any = await this.firebaseService.buscarPerfilUsuario(user.uid);
            console.log('👤 [Minha Conta] Perfil retornado do Firestore:', perfil);
            
            if (perfil) {
              // ATUALIZAÇÃO COMPLETA: Nome e e-mail vindos do banco
              this.usuario = {
                nome: perfil['nome'] || user.displayName || 'Cliente',
                email: perfil['email'] || user.email || 'Sem e-mail'
              };
              
              if (perfil['endereco']) {
                this.endereco = perfil['endereco'];
              }
              console.log('✅ [Minha Conta] Dados do usuário atualizados:', this.usuario);
            } else {
              console.warn('⚠️ [Minha Conta] Perfil não encontrado no Firestore para o UID:', user.uid);
              // Fallback se não existir documento no Firestore
              this.usuario = {
                nome: user.displayName || 'Cliente',
                email: user.email || 'Sem e-mail'
              };
            }
          } catch (e) {
            console.error('❌ [Minha Conta] Erro ao buscar perfil:', e);
          }

          this.buscarPedidosDoBanco(user.uid);
        } else {
          console.warn('⚠️ [Minha Conta] Nenhum usuário logado no Firebase Auth.');
          this.usuario.email = 'Desconectado';
          this.usuario.nome = 'Visitante';
          this.pedidos = [];
        }
      },
      error: (err) => console.error('❌ [Minha Conta] Erro no AuthState:', err)
    });
  }

  // 🍔 2. BUSCA OS PEDIDOS USANDO O SERVIÇO CENTRALIZADO
  private buscarPedidosDoBanco(uid: string) {
    console.log('🔎 [Minha Conta] Buscando pedidos no Firestore para o UID:', uid);

    if (this.pedidosSubscription) this.pedidosSubscription.unsubscribe();

    // Usando o método centralizado do FirebaseService para garantir que a query seja a mesma
    this.pedidosSubscription = this.firebaseService.buscarPedidosUsuario().subscribe({
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

          const statusRaw = pedido.status || 'Pedido confirmado';
          const isEntregue = statusRaw.toLowerCase().includes('entregue');

          return {
            id: pedido.id,
            status: statusRaw,
            estaEmAndamento: !isEntregue,
            data: dataFormatada,
            total: pedido.valores?.total ? Number(pedido.valores.total) : (pedido.total ? Number(pedido.total) : 0),
            totalItens: pedido.itens ? pedido.itens.length : (pedido.totalItens ? Number(pedido.totalItens) : 1)
          };
        });
      },
      error: (err) => {
        console.error('❌ [Minha Conta] Erro ao listar pedidos do Firebase:', err);
      }
    });
  }

  // --- MODAIS ---
  abrirModalDados() { this.tempUsuario = { ...this.usuario }; this.showModalDados = true; }
  
  async salvarDadosPessoais() { 
    if (!this.tempUsuario.nome.trim()) return; 
    
    this.usuario.nome = this.tempUsuario.nome; 
    
    const user = this.auth.currentUser;
    if (user) {
      await this.firebaseService.salvarPerfilUsuario(user.uid, { nome: this.usuario.nome });
    }
    
    localStorage.setItem('usuario', JSON.stringify({ nome: this.usuario.nome })); 
    this.showModalDados = false; 
  }

  abrirModalEndereco() { this.tempEndereco = { ...this.endereco }; this.showModalEndereco = true; }
  
  async salvarEndereco() { 
    if (!this.tempEndereco.rua.trim() || !this.tempEndereco.numero.trim()) return; 
    
    this.endereco = { ...this.tempEndereco }; 
    
    const user = this.auth.currentUser;
    if (user) {
      await this.firebaseService.salvarPerfilUsuario(user.uid, { endereco: this.endereco });
    }

    localStorage.setItem('endereco_entrega', JSON.stringify(this.endereco)); 
    this.showModalEndereco = false; 
  }
  
  irParaRastreamento(pedido: any) { 
    this.router.navigate(['/rastreamento', pedido.id]); 
  }
  
  logout() { this.firebaseService.logout().then(() => { localStorage.clear(); sessionStorage.clear(); this.router.navigate(['/']); }); }
}