import { Component } from '@angular/core';
import { UsersComponent } from '../../../components/users/users.component';


@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [UsersComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
})
export class AdminComponent {

}
