import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, doc, getDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  
  // Estado na memória para transferir as informações entre as telas com segurança
  private dadosPagamentoAtual: any = null;
  private enderecoSelecionadoAtual: any = { rua: 'Rua das Flores', numero: '123', bairro: 'Centro' };
  public observacoesPedido: string = '';

  public itensCarrinho = [
    { nome: 'Dark Burger Premium', quantidade: 2, precoUnitario: 39.90 },
    { nome: 'Smash Bacon', quantidade: 1, precoUnitario: 44.90 }
  ];
  public taxaEntrega = 8.90;

  constructor(private firestore: Firestore, private auth: Auth) {}

  get subtotal(): number {
    return this.itensCarrinho.reduce((acc, item) => acc + (item.precoUnitario * item.quantidade), 0);
  }

  get total(): number {
    return this.subtotal + this.taxaEntrega;
  }

  setPagamento(dados: any) { this.dadosPagamentoAtual = dados; }
  getPagamento() { return this.dadosPagamentoAtual; }
  
  setEndereco(dados: any) { this.enderecoSelecionadoAtual = dados; }
  getEndereco() { return this.enderecoSelecionadoAtual; }

  /**
   * Busca o endereço padrão salvo no perfil do usuário no Firestore
   */
  async buscarEnderecoPadrao(): Promise<any> {
    const usuario = this.auth.currentUser;
    if (!usuario) return this.enderecoSelecionadoAtual;

    try {
      const userDocRef = doc(this.firestore, `usuarios/${usuario.uid}`);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists() && userDoc.data()['endereco']) {
        return userDoc.data()['endereco'];
      }
    } catch (e) {
      console.warn('Não foi possível ler endereço do Firestore, usando padrão da memória.', e);
    }
    return this.enderecoSelecionadoAtual;
  }

  /**
   * Salva o pedido finalizado com todas as informações juntas
   */
  async salvarPedidoNoFirestore(dadosPagamento: any): Promise<string> {
    const usuario = this.auth.currentUser;
    
    // BACKUP DE SEGURANÇA: Se você testar sem estar logado no Firebase Auth, 
    // ele gera um ID temporário local para a tela de confirmação abrir e não travar o app!
    if (!usuario) {
      console.warn('Usuário não logado. Gerando ID local para teste visual.');
      return 'MOCK' + Math.floor(100000 + Math.random() * 900000);
    }

    const novoPedido = {
      uidUsuario: usuario.uid,
      nomeUsuario: usuario.displayName || 'Cliente Anônimo',
      enderecoEntrega: this.enderecoSelecionadoAtual,
      itens: this.itensCarrinho,
      pagamento: dadosPagamento,
      observacao: this.observacoesPedido,
      valores: {
        subtotal: this.subtotal,
        taxaEntrega: this.taxaEntrega,
        total: this.total
      },
      status: 'Pedido confirmado',
      dataCriacao: new Date()
    };

    const pedidosRef = collection(this.firestore, 'pedidos');
    const docRef = await addDoc(pedidosRef, novoPedido);
    return docRef.id; 
  }
}