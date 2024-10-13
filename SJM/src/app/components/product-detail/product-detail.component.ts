import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product, ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';

interface BoxType {
    value: string;
    label: string;
}

@Component({
    selector: 'app-product-detail',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './product-detail.component.html',
    styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
    @Input() product!: Product;
    @Output() close = new EventEmitter<void>();

    boxTypes: BoxType[] = [];
    selectedBoxType: string = '';
    quantity: number = 1;
    totalPrice: number = 0;
    priceMap: { [key: string]: number } = {};
    placeholderImage = 'assets/images/placeholder-image.png';

    constructor(
        private productService: ProductService,
        private cartService: CartService
    ) { }

    ngOnInit() {
        this.fetchBoxTypes();
    }

    fetchBoxTypes() {
        this.productService.getBoxTypes().subscribe({
            next: (boxTypes) => {
                this.boxTypes = boxTypes;
                this.fetchPrices();
            },
            error: (error) => console.error('Error fetching box types:', error)
        });
    }

    fetchPrices() {
        this.boxTypes.forEach(boxType => {
            this.productService.getPrice(this.product.prod_id, boxType.value).subscribe({
                next: (priceData) => {
                    this.priceMap[boxType.value] = priceData.price;
                    if (Object.keys(this.priceMap).length === this.boxTypes.length) {
                        this.selectedBoxType = this.boxTypes[0].value;
                        this.updateTotalPrice();
                    }
                },
                error: (error) => console.error(`Error fetching price for ${boxType.value}:`, error)
            });
        });
    }

    updatePrice() {
        this.updateTotalPrice();
    }

    updateTotalPrice() {
        if (this.selectedBoxType && this.priceMap[this.selectedBoxType]) {
            this.totalPrice = this.priceMap[this.selectedBoxType] * this.quantity;
        } else {
            this.totalPrice = 0;
        }
    }

    addToCart() {
        const cartItem = {
            product: this.product,
            boxType: this.selectedBoxType,
            quantity: this.quantity,
            totalPrice: this.totalPrice
        };
        this.cartService.addToCart(cartItem);
        this.closePopup();
    }

    closePopup() {
        this.close.emit();
    }
}