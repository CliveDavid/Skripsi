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
  url?: string; // dropdown
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
  @Input() editPath: string = '';
  @Input() addPath: string = '';

  formData: any = {};
  isEditMode: boolean = false;
  id: any;
  dropdownOptions: { [key: string]: DropdownOption[] } = {};
  imageFile: File | null = null;
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
        const reader = new FileReader();
        reader.onloadend = () => {
          this.imagePreview = reader.result;
        };
        reader.readAsDataURL(blob);
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
    if (!file.type.startsWith('image/')) {
      this.toastr.error('Please select an image file.');
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      this.toastr.error('File is too large. Maximum size is 5MB.');
      return;
    }

    this.imageFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result;
    };
    reader.readAsDataURL(file);
  }

  private compressImage(file: File, maxWidth: number, maxHeight: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx!.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Canvas to Blob conversion failed'));
              }
            },
            file.type,
            0.7
          );
        };
        img.onerror = () => reject(new Error('Image loading failed'));
        img.src = event.target?.result as string;
      };
      reader.onerror = () => reject(new Error('File reading failed'));
      reader.readAsDataURL(file);
    });
  }

  onSubmit(): void {
    let url: string;
    if (this.isEditMode) {
      url = this.editPath || `${this.submitUrl}/update`;
    } else {
      url = this.addPath || `${this.submitUrl}/create`;
    }

    const formDataToSubmit = { ...this.formData };
    this.columns.forEach(column => {
      if (column.type === 'date' && formDataToSubmit[column.field]) {
        formDataToSubmit[column.field] = new Date(formDataToSubmit[column.field]).toISOString();
      }
    });

    if (this.isEditMode) {
      formDataToSubmit.id = this.id;
    }

    if (this.imageFile) {
      this.compressImage(this.imageFile, 800, 600).then(compressedBlob => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          formDataToSubmit.image = base64data.split(',')[1];
          this.sendRequest(url, formDataToSubmit);
        };
        reader.readAsDataURL(compressedBlob);
      });
    } else {
      this.sendRequest(url, formDataToSubmit);
    }
  }

  private sendRequest(url: string, formData: any): void {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');

    this.http.post(url, formData, { headers, observe: 'response' }).subscribe(
      (response) => {
        // CHANGE: Check for success message in response body
        const successMessage = response.body && (response.body as any).message
          ? (response.body as any).message
          : `Data ${this.isEditMode ? 'updated' : 'created'} successfully`;
        this.toastr.success(successMessage);
        setTimeout(() => this.closeOrGoBack(), 1500);
      },
      (error) => {
        let errorMessage = `Error ${this.isEditMode ? 'updating' : 'creating'} data. Please try again.`;
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
          if (error.error.error) {
            errorMessage += `: ${error.error.error}`;
          }
        }
        this.toastr.error(errorMessage);
      }
    );
  }

  onCancel(): void {
    this.closeOrGoBack();
  }

  private closeOrGoBack(): void {
    if (window.opener) {
      window.close();
    } else {
      // Check if this is the only tab in the window
      if (window.history.length > 1) {
        this.location.back();
      } else {
        window.close();
      }
    }
  }


}