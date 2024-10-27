import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { FormsModule } from '@angular/forms';
import { AuthService } from './shared/services/auth.service';
import { SignupComponent } from './signup/signup.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { HttpClientModule } from '@angular/common/http';
import { AutoLogoutService } from './shared/services/auto-logout-service';
import { PagingComponent } from './shared/components/paging/paging.component';
import { FormsComponent } from './shared/components/forms/forms.component';
import { AdminComponent } from './pages/admin/admin.component';
import { AdminFormComponent } from './pages/admin-form/admin-form.component';
import { ProductComponent } from './pages/product/product.component';
import { ProductFormComponent } from './pages/product-form/product-form.component';
import { MessageComponent } from './shared/components/message/message.component';
import { DistributorComponent } from './pages/distributor/distributor.component';
import { DistributorFormComponent } from './pages/distributor-form/distributor-form.component';
import { HighlightPipe } from './shared/services/highlight.pipe';
import { DateFormatPipe } from './shared/services/date-format/date-format.pipe';
import { OrderComponent } from './pages/order/order.component';
import { OrderFormComponent } from './pages/order-form/order-form.component';
import { RupiahPipe } from './shared/services/rupiah.pipe';
import { InvoiceComponent } from './pages/invoice/invoice.component';
import { InvoiceDetailComponent } from './pages/invoice-detail/invoice-detail.component';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';
import { DistributorAddressDetailComponent } from './pages/distributor-address-detail/distributor-address-detail.component';
import { DetailComponent } from './shared/components/detail/detail.component';
import { DistributorAddressFormComponent } from './pages/distributor-address-form/distributor-address-form.component';
import { AddressChangeComponent } from './pages/address-change/address-change.component';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog.component';
import { AdditionalSettingsComponent } from './pages/additional-settings/additional-settings.component';
import { StatusFilterPipe } from './shared/services/status-filter-pipe';



@NgModule({
  declarations: [
    AppComponent,
    MessageComponent,
    NotFoundComponent,
    LoginComponent,
    SignupComponent,
    DashboardComponent,
    SidebarComponent,
    PagingComponent,
    DateFormatPipe,
    HighlightPipe,
    RupiahPipe,
    AdminComponent,
    FormsComponent,
    AdminFormComponent,
    ProductComponent,
    ProductFormComponent,
    DistributorComponent,
    DistributorFormComponent,
    OrderComponent,
    OrderFormComponent,
    InvoiceComponent,
    InvoiceDetailComponent,
    DistributorAddressDetailComponent,
    DetailComponent,
    DistributorAddressFormComponent,
    AddressChangeComponent,
    ConfirmDialogComponent,
    AdditionalSettingsComponent,
    StatusFilterPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [AuthService, AutoLogoutService],
  bootstrap: [AppComponent]
})
export class AppModule { }
