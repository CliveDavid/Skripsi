import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { BASE_URL } from '../../../constants';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from '../../services/toastr.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

type StatusType = 'Pending' | 'Processing' | 'Invoiced' | 'Delivered' | 'Cancelled';

interface TableColumn {
  header: string;
  field: string;
  alignment: 'left' | 'center' | 'right';
  type: 'text' | 'currency' | 'link' | 'date' | 'boolean' | 'int' | 'image' | 'status';
  path?: string;
}

interface FilterOption {
  label: string;
  value: string | string[];
  default?: boolean;
}

@Component({
  selector: 'app-paging',
  templateUrl: './paging.component.html',
  styleUrls: ['./paging.component.css']
})
export class PagingComponent implements OnInit {

  //#region Variables
  @Input() tableTitle: string = '';
  @Input() addButton: boolean = false;
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() url: string = '';
  @Input() editButton: boolean = false;
  @Input() primaryKey: string = 'id';
  showImagePopup: boolean = false;
  popupImageUrl: SafeUrl | null = null;

  sortedColumn: string | null = null;
  sortOrder: 'asc' | 'desc' = 'asc';
  currentRoute: string = '';

  // for search
  searchText: string = '';
  filteredData: any[] = [];

  // filter dropdown
  @Input() filterOptions: FilterOption[] = [];
  @Input() filterField: string = '';
  selectedFilter: string | string[] = 'All';

  // status
  statusClasses: { [key in StatusType]: string } = {
    'Pending': 'status-pending',
    'Processing': 'status-processing',
    'Invoiced': 'status-invoiced',
    'Delivered': 'status-delivered',
    'Cancelled': 'status-cancelled'
  };

  currentPage: number = 1;
  rowsPerPage: number = 20;
  //#endregion

  constructor(
    private http: HttpClient,
    private activatedRoute: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.setCurrentRoute();
    if (this.url) {
      this.fetchData().then(() => {
        this.setDefaultFilter();
        this.filterData();
      }).catch(error => {
        this.toastr.error('Error fetching data');
      });
    }
  }

  setDefaultFilter() {
    const defaultOption = this.filterOptions.find(option => option.default);
    if (defaultOption) {
      this.selectedFilter = defaultOption.value;
    }
  }

  fetchData(): Promise<void> {
    return new Promise((resolve, reject) => {
      const body = {};
      this.http.post<any[]>(`${BASE_URL}/${this.url}`, body).subscribe(
        (data) => {
          this.data = data;
          this.filteredData = data;
          resolve();
        },
        (error: HttpErrorResponse) => {
          console.error('Error fetching data:', error);
          if (error.status === 0) {
            this.toastr.error('Unable to connect to the server.');
          } else {
            this.toastr.error('Error fetching data. Please try again later.');
          }
          reject(error);
        }
      );
    });
  }

  setCurrentRoute() {
    this.currentRoute = this.router.url;
  }

  sortData(column: TableColumn) {
    if (this.sortedColumn === column.field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortedColumn = column.field;
      this.sortOrder = 'asc';
    }
    this.filteredData.sort((a, b) => {
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

  filterData() {
    this.filteredData = this.data.filter(row => {
      let filterMatch: boolean;
      if (this.selectedFilter === 'All') {
        filterMatch = true;
      } else if (Array.isArray(this.selectedFilter)) {
        filterMatch = this.selectedFilter.includes(row[this.filterField]);
      } else if (typeof this.selectedFilter === 'string') {
        if (this.selectedFilter.includes(',')) {
          // Handle case where selectedFilter is a comma-separated string
          const filterValues = this.selectedFilter.split(',');
          filterMatch = filterValues.includes(row[this.filterField]);
        } else {
          filterMatch = row[this.filterField] === this.selectedFilter;
        }
      } else {
        filterMatch = false;
      }

      const searchMatch = this.columns
        .filter(column => column.type === 'text')
        .some(column => {
          const match = row[column.field]?.toString().toLowerCase().includes(this.searchText.toLowerCase());
          console.log(`Search Match for ${column.field}:`, match);
          return match;
        });

      return filterMatch && searchMatch;
    });

    this.currentPage = 1;
    this.forceRefresh();
  }

  forceRefresh() {
    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        const event = new KeyboardEvent('keypress', { key: 'Enter' });
        document.dispatchEvent(event);
      }, 0);
    }
  }

  //#region Image Popup
  openImagePopup(id: string) {
    const imageUrl = `${BASE_URL}/product/image`;
    this.popupImageUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`${imageUrl}?id=${id}`);
    this.showImagePopup = true;
  }

  closeImagePopup() {
    this.showImagePopup = false;
    this.popupImageUrl = null;
  }
  //#endregion

  //#region Pagination

  paginatedData() {
    const startIndex = (this.currentPage - 1) * this.rowsPerPage;
    return this.filteredData.slice(startIndex, startIndex + this.rowsPerPage);
  }

  totalPages() {
    return Math.ceil(this.filteredData.length / this.rowsPerPage);
  }

  nextPage() {
    if (this.currentPage < this.totalPages()) {
      this.currentPage++;
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  getStatusClass(status: any): string {
    return this.statusClasses[status as StatusType] || '';
  }

  //#endregion
}
