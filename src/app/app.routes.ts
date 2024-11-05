import { Routes } from '@angular/router';
import { AuthComponent } from './pages/auth/auth.component';
import { ProductsContainerComponent } from './pages/products-container/products-container.component';
import { AuthService } from './services/auth/auth.service';
import { inject } from '@angular/core';
import { UsersContainerComponent } from './pages/users-container/users-container.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'products',
  },
  {
    path: 'products',
    component: ProductsContainerComponent,
    canMatch: [ async () => inject(AuthService).authGuard()],
    children: [
      {
        path: 'list',
        title: 'YGB | products',
        loadComponent: () =>
          import('./pages/products-container/products/products.component').then(
            (mod) => mod.ProductsComponent
          ),
      },
      {
        path: 'categories',
        title: 'YGB | products categories',
        loadComponent: () =>
          import('./pages/products-container/categories/categories.component').then(
            (m) => m.CategoriesComponent
          ),
      },
      {
        path: '',
        redirectTo: '/products/list',
        pathMatch: 'full',
      },
    ],
  },
  // {
  //   path: 'products',
  //   title: 'YGB | products',
  //   // data: { ttile: 'products' },
  //   loadComponent: () =>
  //     import('./pages/products/products.component').then(
  //       (mod) => mod.ProductsComponent
  //     ),
  // },
  // {
  //   path: 'categories',
  //   title: 'YGB | categories',
  //   loadComponent: () =>
  //     import('./pages/categories/categories.component').then(
  //       (mod) => mod.CategoriesComponent
  //     ),
  // },
  {
    path: 'services',
    canMatch: [ async () => inject(AuthService).authGuard()],
    title: 'YGB | services',
    loadComponent: () =>
      import('./pages/services/services.component').then(
        (mod) => mod.ServicesComponent
      ),
  },
  {
    path: 'settings',
    title: 'YGB | settings',
    canMatch: [ async () => inject(AuthService).authGuard()],
    loadComponent: () =>
      import('./pages/settings/settings.component').then(
        (mod) => mod.SettingsComponent
      ),
  },
  //   {
  //     path: 'products/:slug',
  //     loadComponent: () =>
  //       import('./pages/product-detail/product-detail.component').then((mod) => mod.ProductDetailComponent),
  //   },
  {
    path: 'appointments',
    title: 'appointments list',
    canMatch: [ async () => inject(AuthService).authGuard()],
    loadComponent: () =>
      import('./pages/appointments/appointments.component').then(
        (mod) => mod.AppointmentsComponent
      ),
  },
  {
    path: 'appointments-settings',
    title: 'appointments settings',
    canMatch: [ async () => inject(AuthService).authGuard()],
    loadComponent: () =>
      import('./pages/appointments-settings/appointments-settings.component').then(
        (mod) => mod.AppointmentsSettingsComponent
      ),
  },
  {
    path: 'profile',
    title: 'User profile',
    canMatch: [ async () => inject(AuthService).authGuard()],
    loadComponent: () =>
      import('./pages/profile/profile.component').then(
        (mod) => mod.ProfileComponent
      ),
  },
  {
    path: 'users',
    component: UsersContainerComponent,
    canMatch: [ async () => inject(AuthService).authGuard()],
    children: [
      {
        path: 'admins',
        title: 'YGB | admins',
        loadComponent: () =>
          import('./pages/users-container/admin/admin.component').then(
            (mod) => mod.AdminComponent
          ),
      },
      {
        path: 'customers',
        title: 'YGB | customers',
        loadComponent: () =>
          import('./pages/users-container/customer/customer.component').then(
            (m) => m.CustomerComponent
          ),
      },
      {
        path: '',
        redirectTo: '/users/admins',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'auth',
    component: AuthComponent,
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./pages/auth/login/login.component').then(
            (m) => m.LoginComponent
          ),
        },
        // {
        //   path: 'signup',
        //   loadComponent: () => import('./components/signup-form/signup-form.component').then( m => m.SignupComponent)
        // },
        // {
        //   path: 'reset-password',
        //   loadComponent: () =>
        //     import('./pages/auth/reset-password/reset-password.component').then(
        //       (m) => m.ResetPasswordComponent
        //     ),
        //   },
          {
            path: '',
            redirectTo: '/auth/login',
            pathMatch: 'full',
          },
        ],
        canMatch: [ async () => inject(AuthService).autoLoginGuard()],
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: 'products',
  },
];
