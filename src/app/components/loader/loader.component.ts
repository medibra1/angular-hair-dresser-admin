import { Component, inject } from '@angular/core';
import { GlobalService } from '../../services/global/global.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.css'
})
export class LoaderComponent {
  public loader = inject(GlobalService);
}
