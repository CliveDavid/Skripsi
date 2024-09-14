import { Component, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ToastrService } from '../../services/toastr.service';

interface FormColumn {
  header: string;
  field: string;
  type: 'text' | 'date' | 'boolean' | 'currency' | 'link' | 'dropdown';
  fullWidth?: boolean;
  editDisabled?: boolean;
  url?: string; // For dropdown options
}

interface DropdownOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-forms',
  templateUrl: './forms.component.html',
  styleUrls: ['./forms.component.css']
})
export class FormsComponent implements OnInit {
  @Input() formTitle: string = 'Form';
  @Input() columns: FormColumn[] = [];
  @Input() submitUrl: string = '';
  @Input() submitButtonText: string = 'Submit';
  @Input() fetchUrl: string = '';

  formData: any = {};
  isEditMode: boolean = false;
  id: any;
  dropdownOptions: { [key: string]: DropdownOption[] } = {};

  constructor(
    private http: HttpClient,
    private location: Location,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.queryParamMap.get('id');
    if (this.id && this.fetchUrl) {
      this.isEditMode = true;
      this.fetchData(this.id);
    }
    this.loadDropdownOptions();
  }

  loadDropdownOptions(): void {
    this.columns.forEach(column => {
      if (column.type === 'dropdown' && column.url) {
        this.http.post<DropdownOption[]>(column.url, {}).subscribe(
          options => {
            this.dropdownOptions[column.field] = options;
          },
          error => {
            this.toastr.error(`Error fetching options for ${column.header}`);
          }
        );
      }
    });
  }

  fetchData(id: string): void {
    const body = { id: id };
    this.http.post<any>(this.fetchUrl, body).subscribe(
      data => {
        this.formData = data;
      },
      error => {
        this.toastr.error('Error fetching data. Please try again.');
      }
    );
  }

  onSubmit(): void {
    const url = this.isEditMode ? `${this.submitUrl}/update` : `${this.submitUrl}/create`;
    this.http.post(url, this.formData).subscribe(
      () => {
        this.toastr.success(`Data ${this.isEditMode ? 'updated' : 'created'} successfully`);
        setTimeout(() => this.location.back(), 1500);
      },
      error => {
        this.toastr.error(`Error ${this.isEditMode ? 'updating' : 'creating'} data. Please try again.`);
      }
    );
  }

  onCancel(): void {
    this.location.back(); // Go back to the previous page
  }
}
