import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { BASE_URL } from '../constants';
import { ActivatedRoute, Router } from '@angular/router';

interface TableColumn {
  header: string;
  field: string;
  alignment: 'left' | 'center' | 'right';
  type: 'text' | 'currency' | 'link' | 'date';
}

@Component({
  selector: 'app-paging',
  templateUrl: './paging.component.html',
  styleUrls: ['./paging.component.css']
})
export class PagingComponent implements OnInit {
  @Input() tableTitle: string = '';
  @Input() addButton: boolean = false;
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() url: string = '';
  @Input() editButton: boolean = false;
  @Input() primaryKey: string = 'id';

  sortedColumn: string | null = null;
  sortOrder: 'asc' | 'desc' = 'asc';
  currentRoute: string = '';

  constructor(
    private http: HttpClient,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    if (this.url) {
      this.fetchData();
    }
    this.setCurrentRoute();
  }

  fetchData() {
    this.http.get<any[]>(BASE_URL + "/" + this.url).subscribe(data => {
      this.data = data;
    });
  }

  setCurrentRoute() {
    this.currentRoute = this.router.url;
  }
  
  
  //#region Sort
  sortData(column: TableColumn) {
    if (this.sortedColumn === column.field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortedColumn = column.field;
      this.sortOrder = 'asc';
    }
    this.data.sort((a, b) => {
      const valueA = a[column.field];
      const valueB = b[column.field];
      let comparison = 0;

      if (valueA > valueB) {
        comparison = 1;
      } else if (valueA < valueB) {
        comparison = -1;
      }

      return this.sortOrder === 'asc' ? comparison : -comparison;
    });
  }
  //#endregion
}
