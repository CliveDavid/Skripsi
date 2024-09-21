import { Component, Input, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ToastrService } from '../../services/toastr.service';

interface FormColumn {
  header: string;
  field: string;
  type: 'text' | 'date' | 'boolean' | 'currency' | 'link' | 'dropdown' | 'image';
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
  imagePreview: string | ArrayBuffer | null = null;

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
        // Load image preview if there's an image
        if (data.image) {
          this.loadImagePreview(id);
        }
      },
      error => {
        this.toastr.error('Error fetching data. Please try again.');
      }
    );
  }

  loadImagePreview(id: string): void {
    this.http.post(`${this.submitUrl}/image`, { id }, { responseType: 'blob' }).subscribe(
      (blob: Blob) => {
        this.handleFile(new File([blob], 'preview.jpg', { type: blob.type }), 'image');
      },
      error => {
        this.toastr.error('Error loading image preview.');
      }
    );
  }

  onFileSelected(event: Event, field: string): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.handleFile(file, field);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const dropzone = event.target as HTMLElement;
    dropzone.classList.add('dragover');
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const dropzone = event.target as HTMLElement;
    dropzone.classList.remove('dragover');
  }

  onDrop(event: DragEvent, field: string): void {
    event.preventDefault();
    event.stopPropagation();
    const dropzone = event.target as HTMLElement;
    dropzone.classList.remove('dragover');

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0], field);
    }
  }

  private handleFile(file: File, field: string): void {
    // Check file type
    if (!file.type.startsWith('image/')) {
      this.toastr.error('Please select an image file.');
      return;
    }

    // Check file size (e.g., limit to 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      this.toastr.error('File is too large. Maximum size is 5MB.');
      return;
    }

    this.formData[field] = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result;
    };
    reader.readAsDataURL(file);
  }

  onSubmit(): void {
    const url = this.isEditMode ? `${this.submitUrl}/update` : `${this.submitUrl}/create`;

    const formData = new FormData();
    for (const key in this.formData) {
      if (this.formData[key] instanceof File) {
        formData.append(key, this.formData[key], this.formData[key].name);
      } else {
        formData.append(key, this.formData[key]);
      }
    }

    this.http.post(url, formData).subscribe(
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
    this.location.back();
  }
}