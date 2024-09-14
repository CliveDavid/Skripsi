import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AdminComponent } from './pages/admin/admin.component';
import { AdminFormComponent } from './pages/admin-form/admin-form.component';
import { ProductFormComponent } from './pages/product-form/product-form.component';
import { ProductComponent } from './pages/product/product.component';
import { DistributorComponent } from './pages/distributor/distributor.component';
import { DistributorFormComponent } from './pages/distributor-form/distributor-form.component';
import { OrderComponent } from './pages/order/order.component';
import { OrderFormComponent } from './pages/order-form/order-form.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'admin/form', component: AdminFormComponent },
  { path: 'distributor', component: DistributorComponent },
  { path: 'distributor/form', component: DistributorFormComponent },
  { path: 'product', component: ProductComponent },
  { path: 'product/form', component: ProductFormComponent },
  { path: 'order', component: OrderComponent },
  { path: 'order/form', component: OrderFormComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
