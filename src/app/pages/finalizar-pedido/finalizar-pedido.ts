import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { PedidoService } from '../../services/pedido.service';

@Component({
  selector: 'app-finalizar-pedido',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './finalizar-pedido.html',
  styleUrl: './finalizar-pedido.css'
})
export class FinalizarPedidoComponent implements OnInit {
  
  // Variáveis locais que o HTML vai renderizar
  endereco = { rua: 'Carregando...', numero: '', bairro: '' };
  enderecoEdicao = { rua: '', numero: '', bairro: '' };
  observacoesPedido: string = '';
  
  itensPedido: any[] = [];
  subtotal: number = 0;
  taxaEntrega: number = 0;

  constructor(
    private pedidoService: PedidoService, 
    private router: Router,
    private location: Location
  ) {}

  async ngOnInit() {
    // Puxa os dados reais do serviço
    this.itensPedido = this.pedidoService.itensCarrinho;
    this.subtotal = this.pedidoService.subtotal;
    this.taxaEntrega = this.pedidoService.taxaEntrega;

    // Busca o endereço do banco ou retorna o padrão do serviço
    const enderecoBanco = await this.pedidoService.buscarEnderecoPadrao();
    if (enderecoBanco) {
      this.endereco = enderecoBanco;
      this.pedidoService.setEndereco(this.endereco);
    }
  }

  voltar() { 
    this.location.back(); 
  }

  abrirModalEndereco() {
    this.enderecoEdicao = { ...this.endereco };
    const modal = document.getElementById('modalEndereco') as HTMLDialogElement;
    if (modal) modal.showModal();
  }

  fecharModalEndereco() {
    const modal = document.getElementById('modalEndereco') as HTMLDialogElement;
    if (modal) modal.close();
  }

  salvarNovoEndereco() {
    this.endereco = { ...this.enderecoEdicao };
    this.pedidoService.setEndereco(this.endereco); // Atualiza no serviço usando seu método real
    this.fecharModalEndereco();
  }

  avancarParaPagamento() {
    this.pedidoService.setPagamento({
      // Passa um estado inicial de pagamento para a próxima tela se necessário
    });
    this.router.navigate(['/pagamento']);
  }
}