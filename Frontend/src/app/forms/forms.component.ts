import { Component, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

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

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.id = this.route.snapshot.queryParamMap.get('id');
    if (this.id && this.fetchUrl) {
      this.isEditMode = true;
      this.fetchData(this.id);
    }
  }

  fetchData(id: string): void {
    this.http.get(`${this.fetchUrl}/${id}`).subscribe(data => {
      this.formData = data;
    });
  }

 onSubmit(): void {
  if (this.isEditMode) {
    this.http.put(`${this.submitUrl}/${this.id}`, this.formData).subscribe(() => {
      this.router.navigate(['/admin']);
    }, error => {
      console.error('Error updating data', error);
    });
  } else {
    this.http.post(this.submitUrl, this.formData).subscribe(() => {
      this.router.navigate(['/admin']);
    }, error => {
      console.error('Error creating data', error);
    });
  }
  }

  onCancel(): void {
    this.router.navigate(['/admin']);
  }
}
