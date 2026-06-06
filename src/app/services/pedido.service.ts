import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, doc, getDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { FirebaseService } from './firebase.service'; 

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  
  private dadosPagamentoAtual: any = null;
  private enderecoSelecionadoAtual: any = { rua: 'Rua das Flores', numero: '123', bairro: 'Centro' };
  public observacoesPedido: string = '';

  // 🆕 Começa como um array vazio para receber os itens REAIS do seu carrinho
  public itensCarrinho: any[] = [];
  public taxaEntrega = 8.90;

  constructor(
    private firestore: Firestore, 
    private auth: Auth,
    private firebaseService: FirebaseService 
  ) {}

  // 🆕 FUNÇÃO PARA O SEU CARRINHO INJETAR OS PRODUTOS REAIS
  setItensCarrinho(itens: any[], taxa: number = 8.90) {
    this.itensCarrinho = itens.map(item => ({
      nome: item.nome || item.product?.name || 'Item do Carrinho',
      quantidade: item.quantidade || item.quantity || 1,
      precoUnitario: item.precoUnitario || item.product?.price || item.price || 0
    }));
    this.taxaEntrega = taxa;
    console.log('🛒 Itens sincronizados com sucesso no PedidoService:', this.itensCarrinho);
  }

  // 🧮 CALCULA O SUBTOTAL DINAMICAMENTE BASEADO NOS ITENS REAIS
  get subtotal(): number {
    return this.itensCarrinho.reduce((acc, item) => acc + (item.precoUnitario * item.quantidade), 0);
  }

  // 🧮 CALCULA O TOTAL DINAMICAMENTE
  get total(): number {
    return this.subtotal + this.taxaEntrega;
  }

  setPagamento(dados: any) { this.dadosPagamentoAtual = dados; }
  getPagamento() { return this.dadosPagamentoAtual; }
  setEndereco(dados: any) { this.enderecoSelecionadoAtual = dados; }
  getEndereco() { return this.enderecoSelecionadoAtual; }

  async buscarEnderecoPadrao(): Promise<any> {
    const usuario = this.auth.currentUser || this.firebaseService.getCurrentUser();
    if (!usuario) return this.enderecoSelecionadoAtual;

    try {
      const userDocRef = doc(this.firestore, `usuarios/${usuario.uid}`);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists() && userDoc.data()['endereco']) {
        // Sincroniza o endereço interno com o do banco para o envio do pedido
        this.enderecoSelecionadoAtual = userDoc.data()['endereco'];
        return this.enderecoSelecionadoAtual;
      }
    } catch (e) {
      console.warn('Não foi possível ler endereço do Firestore, usando padrão da memória.', e);
    }
    return this.enderecoSelecionadoAtual;
  }

  // 🍔 SALVAMENTO OFICIAL COM DADOS REAIS
  async salvarPedidoNoFirestore(dadosPagamento: any): Promise<string> {
    const usuario = this.auth.currentUser || this.firebaseService.getCurrentUser();
    
    const uidFinal = usuario ? usuario.uid : 'anonimo';
    const nomeFinal = usuario ? (usuario.displayName || usuario.email?.split('@')[0]) : 'Cliente Anônimo';

    const novoPedido = {
      uidUsuario: uidFinal, 
      nomeUsuario: nomeFinal,
      enderecoEntrega: this.enderecoSelecionadoAtual,
      itens: this.itensCarrinho, // Grava a lista real (Ex: X-Burger)
      pagamento: dadosPagamento,
      observacao: this.observacoesPedido,
      valores: {
        subtotal: this.subtotal,
        taxaEntrega: this.taxaEntrega,
        total: this.total
      },
      status: 'Pedido confirmed',
      dataCriacao: new Date() 
    };

    console.log('🚀 Gravando pedido real no Firestore para o UID:', uidFinal, novoPedido);

    const pedidosRef = collection(this.firestore, 'pedidos');
    const docRef = await addDoc(pedidosRef, novoPedido);
    return docRef.id; 
  }
}