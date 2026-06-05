
import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CarrinhoService } from '../../services/carrinho.service';
import { FirebaseService } from '../../services/firebase.service';


@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css'
})
export class InicioComponent {

  showModal = false;

  products: any[] = [];
  filteredProducts: any[] = [];
  selectedCategory: string = 'todos';

  selectedProduct: any = null;

  quantity = 1;

  observation = '';

  ingredients = [
    { name: 'Queijo cheddar', checked: true },
    { name: 'Bacon', checked: true },
    { name: 'Alface', checked: true },
    { name: 'Tomate', checked: true },
    { name: 'Cebola roxa', checked: true },
    { name: 'Molho especial', checked: true }
  ];

  extras = [
    { name: 'Queijo cheddar extra', price: 5, checked: false },
    { name: 'Bacon extra', price: 8, checked: false },
    { name: 'Ovo', price: 3, checked: false },
    { name: 'Cebola caramelizada', price: 4, checked: false }
  ];

constructor(
  private firebaseService: FirebaseService,
  private carrinhoService: CarrinhoService,
  private router: Router
) {}

ngOnInit() {

  this.firebaseService.getProducts().subscribe((data: any) => {

    this.products = data || [];

    this.products.sort((a: any, b: any) => {

      if (a.category === 'lanches' && b.category !== 'lanches') {
        return -1;
      }

      if (a.category !== 'lanches' && b.category === 'lanches') {
        return 1;
      }

      return 0;
    });

    this.filteredProducts = [...this.products];

    this.selectedCategory = 'todos';

    

  });

}
  filterCategory(category: string) {
    this.selectedCategory = category;

    if (category === 'todos') {
      this.filteredProducts = [...this.products];
      return;
    }

    this.filteredProducts = this.products.filter(
      p => p.category?.toLowerCase() === category.toLowerCase()
    );
  }

  search(event: any) {
    const value = event.target.value.toLowerCase().trim();

    if (!value) {
      this.filterCategory(this.selectedCategory);
      return;
    }

    const baseList =
      this.selectedCategory === 'todos'
        ? this.products
        : this.products.filter(
            p => p.category?.toLowerCase() === this.selectedCategory.toLowerCase()
          );

    this.filteredProducts = baseList.filter(
      p => p.name?.toLowerCase().includes(value)
    );
  }

  openProduct(item: any) {

    this.selectedProduct = item;

    this.quantity = 1;

    this.observation = '';

    this.extras.forEach(extra => {
      extra.checked = false;
    });

    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  increaseQuantity() {
    this.quantity++;
  }

  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  getTotalPrice(): number {

    let total = Number(this.selectedProduct?.price || 0);

    this.extras.forEach(extra => {
      if (extra.checked) {
        total += extra.price;
      }
    });

    return total * this.quantity;
  }

addToCart() {

  const item = {
    product: this.selectedProduct,
    quantity: this.quantity,
    observation: this.observation,
    ingredients: this.ingredients.filter(i => i.checked),
    extras: this.extras.filter(e => e.checked),
    total: this.getTotalPrice()
  };

  this.carrinhoService.adicionarItem(item);

  console.log('Item adicionado:', item);

  this.closeModal();

  this.router.navigate(['/carrinho']);
}

  logout() {
    localStorage.clear();

    console.log('Usuário deslogado');
  }
}