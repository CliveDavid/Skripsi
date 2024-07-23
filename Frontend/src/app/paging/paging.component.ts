import { Component, Input } from '@angular/core';

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
export class PagingComponent {
  @Input() tableTitle: string = '';
  @Input() addButton: boolean = false;
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];

  sortedColumn: string | null = null;
  sortOrder: 'asc' | 'desc' = 'asc';
  
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
