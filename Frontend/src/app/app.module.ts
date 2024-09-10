import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { FormsModule } from '@angular/forms';
import { AuthService } from './services/auth.service';
import { SignupComponent } from './signup/signup.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { HttpClientModule } from '@angular/common/http';
import { AutoLogoutService } from './services/auto-logout-service';
import { PagingComponent } from './paging/paging.component';
import { DateFormatPipe } from './services/date-format/date-format.pipe';
import { AdminComponent } from './pages/admin/admin.component';
import { FormsComponent } from './forms/forms.component';
import { AdminFormComponent } from './pages/admin-form/admin-form.component';
import { ProductComponent } from './pages/product/product.component';
import { ProductFormComponent } from './pages/product-form/product-form.component';
import { MessageComponent } from './shared/components/message/message.component';


@NgModule({
  declarations: [
    AppComponent,
    MessageComponent,
    LoginComponent,
    SignupComponent,
    DashboardComponent,
    SidebarComponent,
    PagingComponent,
    DateFormatPipe,
    AdminComponent,
    FormsComponent,
    AdminFormComponent,
    ProductComponent,
    ProductFormComponent
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
