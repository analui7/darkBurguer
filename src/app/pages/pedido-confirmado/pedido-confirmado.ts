import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pedido-confirmado',
  templateUrl: './pedido-confirmado.html',
  styleUrls: ['./pedido-confirmado.css']
})
export class PedidoConfirmadoComponent implements OnInit {

  numeroPedido: string = '123456';

  enderecoEntrega = {
    rua: 'Rua das Flores',
    numero: '123',
    bairro: 'Centro'
  };

  constructor(
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.numeroPedido) {
      this.router.navigate(['/inicio']);
    }
  }

  fazerOutroPedido(): void {
    this.router.navigate(['/inicio']);
  }

  verMeusPedidos(): void {
    this.router.navigate([
      '/rastreamento',
      this.numeroPedido
    ]);
  }
}