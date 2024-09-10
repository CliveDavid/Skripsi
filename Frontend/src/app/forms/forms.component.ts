import { Component, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ToastrService } from '../shared/services/toastr.service';

interface FormColumn {
  header: string;
  field: string;
  type: 'text' | 'date' | 'boolean' | 'currency' | 'link';
  fullWidth?: boolean;
  editDisabled?: boolean;
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
    if (this.isEditMode) {
      this.http.post(`${this.submitUrl}/update`, this.formData).subscribe(
        () => {
          this.toastr.success('Data updated successfully');
          setTimeout(() => this.location.back(), 1500); // Go back to the previous page after 2 seconds
        },
        error => {
          this.toastr.error('Error updating data. Please try again.');
        }
      );
    } else {
      this.http.post(`${this.submitUrl}/create`, this.formData).subscribe(
        () => {
          this.toastr.success('Data created successfully');
          setTimeout(() => this.location.back(), 1500); // Go back to the previous page after 2 seconds
        },
        error => {
          this.toastr.error('Error creating data. Please try again.');
        }
      );
    }
  }

  onCancel(): void {
    this.location.back(); // Go back to the previous page
  }
}
