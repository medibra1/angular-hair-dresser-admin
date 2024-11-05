import { Component, inject } from '@angular/core';
import { ModalComponent } from '../../../components/modal/modal.component';
import { CommonModule } from '@angular/common';
import { User } from '../../../models/user.model';
import { FormsModule, NgForm } from '@angular/forms';
import { UsersService } from '../../../services/users/users.service';
import { AlertComponent } from '../../../components/alert/alert.component';
import { UsersComponent } from '../../../components/users/users.component';

@Component({
  selector: 'app-customer',
  standalone: true,
  imports: [UsersComponent],
  templateUrl: './customer.component.html',
  styleUrl: './customer.component.css'
})
export class CustomerComponent {


}
