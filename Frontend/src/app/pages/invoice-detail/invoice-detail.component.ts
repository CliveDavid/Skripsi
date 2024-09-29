import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'src/app/shared/services/toastr.service';
import { BASE_URL } from '../../constants';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-invoice-detail',
  templateUrl: './invoice-detail.component.html',
  styleUrls: ['./invoice-detail.component.css']
})
export class InvoiceDetailComponent implements OnInit {
  private apiUrl = BASE_URL;
  invoice: any;
  isLoading = true;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.queryParamMap.get('id');
    if (id) {
      this.loadInvoiceData(id);
    } else {
      this.toastr.error('No invoice ID provided');
      this.router.navigate(['/invoices']);
    }
  }

  loadInvoiceData(id: string) {
    this.http.post<any>(`${this.apiUrl}/invoices/get-by-id`, { id }).subscribe(
      (data) => {
        this.invoice = data;
        this.isLoading = false;
      },
      (error) => {
        this.toastr.error('Error loading invoice data');
        this.isLoading = false;
      }
    );
  }

  downloadPDF() {
    if (this.invoice?.invoice_id) {
      this.http.post(`${this.apiUrl}/invoices/generate-pdf`,
        { invoice_id: this.invoice.invoice_id },
        { responseType: 'blob' }
      ).subscribe(
        (response: Blob) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const arr = new Uint8Array(reader.result as ArrayBuffer).subarray(0, 5);
            const header = String.fromCharCode.apply(null, arr as any);
            if (header !== "%PDF-") {
              console.error('Invalid PDF header');
              this.toastr.error('Invalid PDF format');
              return;
            }
            this.proceedWithDownload(response);
          };
          reader.readAsArrayBuffer(response.slice(0, 5));
        },
        (error) => {
          this.toastr.error('Error downloading PDF');
        }
      );
    }
  }

  private proceedWithDownload(blob: Blob) {
    const url = window.URL.createObjectURL(blob);

    // Open the PDF in a new tab
    const newTab = window.open();
    if (newTab) {
      newTab.location.href = url; // Open the PDF in a new tab
    }

    // Download PDF
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-${this.invoice.invoice_id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the object URL after 100ms
    setTimeout(() => window.URL.revokeObjectURL(url), 100);

    this.toastr.success('PDF downloaded successfully');
  }

  goBack() {
    this.router.navigate(['/invoice']);
  }
}