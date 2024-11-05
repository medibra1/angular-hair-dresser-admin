import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule, Location } from '@angular/common';
import { Component, ElementRef, inject, Renderer2 } from '@angular/core';
import {
  ActivatedRoute,
  Router,
  RouterModule,
  RouterOutlet,
} from '@angular/router';
import { LoaderComponent } from './components/loader/loader.component';
import { AuthService } from './services/auth/auth.service';
import { ProfileService } from './services/profile/profile.service';
import { User } from './models/user.model';
import { Subscription } from 'rxjs';
import { ToastComponent } from './components/toast/toast.component';
import { ToastService } from './services/toast/toast.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, RouterModule, LoaderComponent, ToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ 'max-height': '0', opacity: 0 }),
        animate(
          '500ms ease-in-out',
          style({ 'max-height': '500px', opacity: 1 })
        ),
      ]),
      transition(':leave', [
        style({ 'max-height': '500px', opacity: 1 }),
        animate('250ms ease-in-out', style({ 'max-height': 0, opacity: 0 })),
      ]),
    ]),
  ],
})
export class AppComponent {
  title = 'barbershop-admin';

  isActive = false;
  openSubNav: string = '';
  activeItem: string = '';
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private authService = inject(AuthService);
  private profileService = inject(ProfileService);
  profile = {} as User;
  profileSub: Subscription;
  routerSub: Subscription;

  showMainLayout: boolean = true;

  isdroppedDown = false;

  private renderer = inject(Renderer2);
  // private element = inject(ElementRef);
  // private listener: (() => void) | undefined;
  private clickListener: (() => void) | null = null; // Pour stocker le listener
  constructor() {
    this.routerSub = this.router.events.subscribe(() => {
      this.checkRoute();
    });
  }

  checkRoute(): void {
    // Cache le layout principal si on est sur la page de login
    this.showMainLayout = !this.router.url.includes('/auth');
  }

  ngOnInit() {   
    // this.listener = this.renderer.listen(
    //   'document',
    //   'click',
    //   this.onDocumentClick
    // );
    
    if(this.authService.isAuthenticated()) {
      this.getProfile();
      this.profileSub = this.profileService.profile.subscribe({
        next: profile => {
          this.profile = profile;
          console.log('Profile data app component: ', this.profile);
        }
      });
    }

    const currentRoute = this.location.path().split('/');
    console.log('Current Route: ', currentRoute[1]);
    if (currentRoute[1] == 'products' || !currentRoute[1])
      this.activeItem = 'products';
    if (currentRoute[1] == 'settings') this.activeItem = 'settings';
    if (currentRoute[1] == 'services') this.activeItem = 'services';
    if (currentRoute[1] == 'appointments') this.activeItem = 'appointments';
    if (currentRoute[1] == 'appointments-settings') this.activeItem = 'appointments';
    if (currentRoute[1] == 'users') this.activeItem = 'users';
    // if(currentRoute[1] == 'products/categories') this.activeItem ='products/categories';

    // this.router.events
    // .pipe(filter(event => event instanceof NavigationEnd))
    // .subscribe((event: any) => {
    //    console.log('Current Route: ', event.url);
    //   });
  }

  async getProfile() {
    await this.profileService.getProfile()
  }

  toggleMenu() {
    this.isActive = !this.isActive;
    console.log('Toggle: ', this.isActive);
  }
  toggleSubMenu(value: string) {
    if (this.openSubNav == value) this.openSubNav = '';
    else this.openSubNav = value;
    console.log('Toggle sub nav open: ', this.openSubNav);
  }

  handleActiveITem(value: string) {
    this.activeItem = value;
    this.toggleMenu();
  }

  toggleProfileDropdown(event: Event) {
    event.stopPropagation();
    if (!this.isdroppedDown) {
      this.isdroppedDown = true;
      // Ajoute un listener pour détecter les clics en dehors du dropdown
      this.clickListener = this.renderer.listen(
        'document',
        'click',
        (e: Event) => {
          const dropdownElement = document.querySelector('.dropdown-menu'); // Sélectionne le dropdown dans le document global

          if (dropdownElement && !dropdownElement.contains(e.target as Node)) {
            this.isdroppedDown = false; // Fermer le dropdown
            this.removeClickListener(); // Supprimer le listener
          }
        }
      );
    } else {
      this.isdroppedDown = false;
      this.removeClickListener();
    }
  }

  private removeClickListener() {
    if (this.clickListener) {
      this.clickListener(); // Désactive le listener
      this.clickListener = null; // Réinitialise la variable
    }
  }

  async logout() {
    await this.authService.logout();
    this.isdroppedDown = false;
  }

  ngOnDestroy() {
    if(this.profileSub) this.profileSub.unsubscribe();
    if(this.routerSub) this.routerSub.unsubscribe();
    this.removeClickListener();
  }

  // // Execute this function when click outside of the dropdown-container
  // onDocumentClick = (event: Event) => {
  //   const dropdownElement = document.querySelector('.dropdown-menu'); // Sélectionne le dropdown dans le document global
  //   if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
  //     this.isdroppedDown = false;
  //   }
  // };
  // //To reduce unnecessary memory leaks you need to use the clean-up
  // ngOnDestroy(): void {
  //   if (this.listener) {
  //     this.listener();
  //   }
  // }
}
