import { Routes } from '@angular/router';
import { AuthComponent } from './pages/auth/auth.component';
import { ProductsComponent } from './pages/products-container/products/products.component';
import { ProductsContainerComponent } from './pages/products-container/products-container.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'products',
  },
  {
    path: 'products',
    component: ProductsContainerComponent,
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
    title: 'YGB | services',
    loadComponent: () =>
      import('./pages/services/services.component').then(
        (mod) => mod.ServicesComponent
      ),
  },
  {
    path: 'settings',
    title: 'YGB | settings',
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
    loadComponent: () =>
      import('./pages/appointments/appointments.component').then(
        (mod) => mod.AppointmentsComponent
      ),
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
      //   {
      //     path: 'signup',
      //     loadComponent: () => import('./pages/auth/signup/signup.component').then( m => m.SignupComponent)
      //   },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('./pages/auth/reset-password/reset-password.component').then(
            (m) => m.ResetPasswordComponent
          ),
      },
      {
        path: '',
        redirectTo: '/auth/login',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: 'products',
  },
];
