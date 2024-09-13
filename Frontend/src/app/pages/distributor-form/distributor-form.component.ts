import { Component, OnInit } from '@angular/core';
import { BASE_URL } from 'src/app/constants';

@Component({
  selector: 'app-distributor-form',
  templateUrl: './distributor-form.component.html',
  styleUrls: ['./distributor-form.component.css']
})
export class DistributorFormComponent implements OnInit {
  BASE_URL = BASE_URL;

  constructor() { }

  ngOnInit(): void {
  }

}
