import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rastreamento',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rastreamento.html',
  styleUrls: ['./rastreamento.css']
})
export class RastreamentoComponent implements OnInit {

  pedidoId: string | null = null;

  pedido = {
    id: '',
    tempoEstimado: 35,

    endereco: {
      rua: 'Rua das Flores',
      bairro: 'Centro',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01000-000'
    },

    itens: [
      {
        quantidade: 1,
        nome: 'Dark Burguer',
        descricao: 'Hambúrguer artesanal da casa',
        valor: 29.90
      },
      {
        quantidade: 1,
        nome: 'Batata Frita',
        descricao: 'Porção média',
        valor: 12.90
      }
    ],

    subtotal: 42.80,
    entrega: 5.00,
    total: 47.80
  };

  etapas = [
    {
      titulo: 'Pedido recebido',
      descricao: 'Recebemos seu pedido.',
      concluido: true
    },
    {
      titulo: 'Pagamento aprovado',
      descricao: 'Pagamento confirmado.',
      concluido: true
    },
    {
      titulo: 'Preparando pedido',
      descricao: 'Seu lanche está sendo preparado.',
      concluido: true
    },
    {
      titulo: 'Saiu para entrega',
      descricao: 'O entregador está a caminho.',
      concluido: false
    },
    {
      titulo: 'Entregue',
      descricao: 'Pedido entregue com sucesso.',
      concluido: false
    }
  ];

constructor(
  private route: ActivatedRoute,
  private router: Router
) {}

  ngOnInit(): void {

    this.pedidoId =
      this.route.snapshot.paramMap.get('id');

    if (this.pedidoId) {
      this.pedido.id = this.pedidoId;
    }

    console.log('ID do pedido:', this.pedidoId);
  }
  voltarInicio(): void {
  this.router.navigate(['/inicio']);
}
}