import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { BASE_URL } from 'src/app/constants';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  tableData: any[] = [];

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.fetchTableData();
  }

  fetchTableData() {
    this.http.get<any[]>(BASE_URL + "/admin").subscribe(data => {
      this.tableData = data;
    });
  }

}
