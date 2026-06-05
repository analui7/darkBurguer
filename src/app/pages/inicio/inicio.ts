import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseService } from '../../services/firebase.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css'
})
export class InicioComponent {

  products: any[] = [];
  filteredProducts: any[] = [];
  selectedCategory: string = 'todos';

  constructor(private firebaseService: FirebaseService) {}

  ngOnInit() {
    this.firebaseService.getProducts().subscribe((data: any) => {
      console.table(data);

      this.products = data;
      this.filteredProducts = [...data];
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
    console.log('Produto selecionado:', item);

    // Futuramente:
    // this.router.navigate(['/produto', item.id]);
  }

  logout() {
    localStorage.clear();

    console.log('Usuário deslogado');

    // Futuramente:
    // this.router.navigate(['/login']);
  }
}