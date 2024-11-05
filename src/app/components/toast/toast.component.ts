import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { GlobalService } from '../../services/global/global.service';
import { ToastOptions, ToastService } from '../../services/toast/toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css'
})
export class ToastComponent {

  toasSub: Subscription;

  private toastService = inject(ToastService);
  toastOptions: ToastOptions | null = null;
  positionTop = '20px';
  positionBottom = '';

  constructor() {
    this.toasSub = this.toastService.toast$.subscribe(options => {
      this.toastOptions = options;
      if (options) {
        // Configure la position
        if (options.position === 'bottom') {
          this.positionTop = '';
          this.positionBottom = '20px';
        } else {
          this.positionTop = '30px';
          this.positionBottom = '';
        }
      }
    });
  }

  dismiss() {
    this.toastService.dismissToast();
  }

  ngOnDestroy() {
    if(this.toasSub) this.toasSub.unsubscribe();
  }

}
