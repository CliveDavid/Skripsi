import { Component, OnInit } from '@angular/core';
import { BASE_URL } from 'src/app/constants';

@Component({
  selector: 'app-order-form',
  templateUrl: './order-form.component.html',
  styleUrls: ['./order-form.component.css']
})
export class OrderFormComponent implements OnInit {
  BASE_URL = BASE_URL;

  constructor() { }

  ngOnInit(): void {
  }

}
