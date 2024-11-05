import { CommonModule } from '@angular/common';
import { Component, Input, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.css',
})
export class AlertComponent {
  @Input() successMessage: string | null = '';
  @Input() errorMessage: string[] = [];

  private clearTimeoutId: any;

  ngOnChanges(changes: SimpleChanges) {
    // Clear any existing timeout if messages change
    if (changes['successMessage'] || changes['errorMessage']) {
      clearTimeout(this.clearTimeoutId);

      // Reset the timeout for clearing messages
      this.clearTimeoutId = setTimeout(() => {
        this.successMessage = null;
        this.errorMessage = [];
      }, 5000);
    }
  }
}
