import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pedido-confirmado',
  templateUrl: './pedido-confirmado.html',
  styleUrl: './pedido-confirmado.css'
})
export class PedidoConfirmadoComponent implements OnInit {

  numeroPedido: string = '------';
  enderecoEntrega = { rua: '', numero: '', bairro: '' };

  constructor(private router: Router) {
    const navegacao = this.router.getCurrentNavigation();
    if (navegacao && navegacao.extras.state) {
      // Resgata o ID gerado pelo Firestore e o endereço final
      if (navegacao.extras.state['idPedido']) {
        // Exibe os últimos 6 dígitos do ID do documento Firebase para ficar estético como na imagem
        const idCompleto = navegacao.extras.state['idPedido'];
        this.numeroPedido = idCompleto.substring(0, 6).toUpperCase();
      }
      if (navegacao.extras.state['endereco']) {
        this.enderecoEntrega = navegacao.extras.state['endereco'];
      }
    }
  }

  ngOnInit(): void {
    // Se o usuário atualizar a página e perder o estado, evita travar a tela
    if (this.numeroPedido === '------') {
      this.router.navigate(['/inicio']);
    }
  }

  fazerOutroPedido() { this.router.navigate(['/inicio']); }
  verMeusPedidos() { this.router.navigate(['/minha-conta']); }
}