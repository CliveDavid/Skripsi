import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BASE_URL } from '../constants';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  tableData: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchTableData();
  }

  fetchTableData() {
    this.http.get<any[]>(BASE_URL+"/admin").subscribe(data => {
      this.tableData = data;
    });
  }

}
