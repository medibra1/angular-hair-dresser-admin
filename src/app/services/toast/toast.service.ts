import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastOptions {
  message: string;
  type?: 'success' | 'warning' | 'error';
  duration?: number;
  position?: 'top' | 'bottom';
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {

  private toastSubject = new BehaviorSubject<ToastOptions | null>(null);
  toast$ = this.toastSubject.asObservable();

  showToast(options: ToastOptions) {
    this.toastSubject.next(options);

    // Dismiss automatiquement si `duration` est spécifié
    if (options.duration) {
      setTimeout(() => this.dismissToast(), options.duration);
    }
  }

  dismissToast() {
    this.toastSubject.next(null);
  }

}
