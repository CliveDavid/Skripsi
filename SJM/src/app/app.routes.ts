import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        component: MainLayoutComponent,
        children: [
            { path: '', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
            { path: 'cart', loadComponent: () => import('./pages/cart/cart.component').then(m => m.CartComponent) },
            { path: 'post-checkout', loadComponent: () => import('./pages/post-checkout/post-checkout.component').then(m => m.PostCheckoutComponent), canActivate: [AuthGuard] },
            { path: 'edit-profile', loadComponent: () => import('./pages/edit-profile/edit-profile.component').then(m => m.EditProfileComponent), canActivate: [AuthGuard] },
            { path: 'order-history', loadComponent: () => import('./pages/order-history/order-history.component').then(m => m.OrderHistoryComponent), canActivate: [AuthGuard] },
            // { path: 'cart', loadComponent: () => import('./pages/cart/cart.component').then(m => m.CartComponent), canActivate: [AuthGuard] }
        ]
    },
    {
        path: '',
        component: AuthLayoutComponent,
        children: [
            { path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
            { path: 'register', loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent) },
            { path: 'verify-otp', loadComponent: () => import('./pages/verify-otp/verify-otp.component').then(m => m.VerifyOtpComponent) },
        ]
    },
    {
        path: '**',
        loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent)
    }
];