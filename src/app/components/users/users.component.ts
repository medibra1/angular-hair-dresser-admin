import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { ModalComponent } from '../modal/modal.component';
import { FormsModule, NgForm } from '@angular/forms';
import { AlertComponent } from '../alert/alert.component';
import { SignupFormComponent } from '../signup-form/signup-form.component';
import { UsersService } from '../../services/users/users.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, ModalComponent, FormsModule, AlertComponent, SignupFormComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent {

  displayDeleteModal = false;
  displayChangeStatusModal = false;
  displayAddModal = false;
  errorMessage = [];
  successMessage = '';

  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // users: User[] = [];
  filteredUsers: User[] = [];
  selectedUser = {} as User;
  selectedStatus?: number;
  private userService = inject(UsersService);

  statusList: any[] = [
    {
      statusNumber: 0,
      title: 'Disabled',
      color: 'danger',
    },
    {
      statusNumber: 1,
      title: 'Eanbled',
      color: 'primary',
    },
  ];

  @Input() userType: number;

  async ngOnInit() {
    await this.userService.loadUsers();
    this.userService.users.subscribe({
      next: (users: User[]) => {
        console.log('Users list: ', users);
        // this.users = users;
        this.filteredUsers = users.filter(user => user.type === this.userType); // 2: admins, 3:users
      },
    });
    // this.sortData('name');
    console.log('Filtered user: ', this.filteredUsers);
  }

  async onSubmit(form: NgForm, type?: string) {
    try {
      console.log(form.value.password);
      if(type == 'delete') {
        await this.userService.deleteUser(this.selectedUser.id, form.value.password);
        this.successMessage = 'User deleted successfully!';
      } else if(type == 'status') {
        await this.userService.changeUserStatus(this.selectedUser.id, this.selectedStatus, form.value.password);
        this.successMessage = 'User status changed successfully!';
      }
      this.closeModal();
    } catch (e) {
      console.log(e);
      this.errorMessage = [e.error.message || 'Something went wrong!'];
      this.closeModal();
      throw(e);
    }
  }

  sortData(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.filteredUsers.sort((a, b) => {
      const valueA = a[column as keyof User];
      const valueB = b[column as keyof User];
      if (valueA < valueB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  getStatusName(status: number) {
    const statusObj = this.statusList.find((s) => s.statusNumber == status);
    return statusObj
      ? {
          statusId: statusObj.statusNumber,
          title: statusObj.title,
          color: statusObj.color,
        }
      : { title: 'Unknown', color: 'secondary' };
  }

  async changeStatus(user: User, status: number) {
    if (window.confirm('Do you want to change appointment status to: ' +this.getStatusName(status).title)) {
      this.selectedUser = user;
      this.displayChangeStatusModal = true;
      this.selectedStatus = status;
    }
  }

  deleteUser(user: User) {
    if (window.confirm('Do you want to delete this User?')) {
      this.selectedUser = user;
      this.displayDeleteModal = true;
    }
  }

  closeModal(event?) {
    this.displayDeleteModal = false;
    this.displayChangeStatusModal = false;
    this.displayAddModal = false;
    this.selectedUser = {} as User;
    this.selectedStatus = null;
    if(event) {
      if(event.status == true) this.successMessage = event.message;
      else this.errorMessage = [event.message];
    }
  }




}
