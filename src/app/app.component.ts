import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule, Location } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterModule, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { LoaderComponent } from './components/loader/loader.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, RouterModule, LoaderComponent],
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

  ngOnInit() {
    const currentRoute = this.location.path().split('/');
    console.log('Current Route: ', currentRoute[1]);
    if(currentRoute[1] == 'products' || !currentRoute[1]) this.activeItem ='products';
    if(currentRoute[1] == 'settings') this.activeItem ='settings';
    if(currentRoute[1] == 'services') this.activeItem ='services';
    if(currentRoute[1] == 'appointments') this.activeItem ='appointments';
    // if(currentRoute[1] == 'products/categories') this.activeItem ='products/categories';
    
    // this.router.events
    // .pipe(filter(event => event instanceof NavigationEnd))
    // .subscribe((event: any) => {
    //    console.log('Current Route: ', event.url);
    //   });
  }
     
  toggleMenu() { 
    this.isActive = !this.isActive;
    console.log('Toggle: ', this.isActive);
  }
  toggleSubMenu(value: string) {
    if(this.openSubNav == value) this.openSubNav = '';
    else this.openSubNav = value;
    console.log('Toggle sub nav open: ', this.openSubNav);
  }

  handleActiveITem(value: string) {
    this.activeItem = value;
    this.toggleMenu();
  }

}
