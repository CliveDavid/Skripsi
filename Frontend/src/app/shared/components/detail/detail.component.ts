import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BASE_URL } from 'src/app/constants';
import { ToastrService } from '../../services/toastr.service';

interface DetailColumn {
  header: string;
  field: string;
  type: 'text' | 'date' | 'boolean' | 'currency' | 'int';
}

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css']
})
export class DetailComponent implements OnInit {

  @Input() tableTitle: string = '';
  @Input() columns: DetailColumn[] = [];
  @Input() url: string = '';
  @Input() editButton: boolean = false;

  data: any = null;
  id: string | null = null;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.id = params['id'];
      if (this.id) {
        this.fetchData();
      }
    });
  }

  fetchData() {
    const body = { id: this.id };
    this.http.post(`${BASE_URL}/${this.url}`, body).subscribe(
      (response: any) => {
        this.data = response;
      },
      (error) => {
        this.toastr.error('Error fetching data');
      }
    );
  }
}
