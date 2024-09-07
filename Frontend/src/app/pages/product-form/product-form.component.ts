import { Component, OnInit } from '@angular/core';
import { BASE_URL } from 'src/app/constants';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css']
})
export class ProductFormComponent implements OnInit {

  BASE_URL = BASE_URL;

  constructor() { }

  ngOnInit(): void {
  }

}
