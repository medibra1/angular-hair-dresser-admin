import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css'
})
export class ModalComponent {

  
  @Input() title: string;
  // @Input() content: string | string[] | TemplateRef<any>;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Output() closeModal = new EventEmitter<void>();
  @Input() template: TemplateRef<any>;

  close() {
    this.closeModal.emit();
  }

  // ngOnDestroy() { }


}
