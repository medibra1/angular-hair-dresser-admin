import { CommonModule, Time } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ModalComponent } from '../../components/modal/modal.component';
import { AppointmentService } from '../../services/appointment/appointment.service';
import { AppointmentFormComponent } from '../../components/appointment-form/appointment-form.component';
import { NgxPaginationModule, PaginationControlsComponent } from 'ngx-pagination';

export interface IAppointment {
  id: number;
  name: string;
  email: string;
  phone: string;
  date: Date;
  time: Time;
  status: number;
  service: string;
  service_id: number
}

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, AppointmentFormComponent, NgxPaginationModule],
  templateUrl: './appointments.component.html',
  styleUrl: './appointments.component.css',
})


export class AppointmentsComponent {
  appointments: any[] = [];
  filteredAppointments: any[] = [];
  appointmentSub: Subscription;

  // filter = {
  //   name: '',
  //   email: '',
  //   date: '',
  //   status: ''
  // }
  
  statusList: any[] = [ {
      statusNumber: 1,
      title: 'Pending',
      color: 'warning'
    },
    {
      statusNumber: 2,
      title: 'Confirmed',
      color: 'primary'
    },
    {
      statusNumber: 3,
      title: 'Missed',
      color: 'secondary'
    },
    // { statusNumber: 4, title: 'Cancelled', color: 'danger' }
  ];

  filter = {
    searchText: '',
    status:  '',
    date: '',
  };

  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  displayModal = false;

  errorMessage = '';
  successMessage = '';

  currentPage: number = 1;  //ngx pagination
  page = 1;
  pageSize = 10;
  // collectionSize = this.appointments.length;

  currentSortField: string = 'name'; // Champ de tri actuel
  sortOrder: 'asc' | 'desc' = 'asc'; // Ordre de tri actuel

  constructor(
    private appointmentService: AppointmentService,
  ) {}

  ngOnInit(): void {
    this.appointmentService.loadAppointments();
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.appointmentSub = this.appointmentService.appointments$.subscribe({
      next: (data) => {
        this.appointments = data;
        this.filteredAppointments = data;
      },
      error: (error) => {
        this.errorMessage = 'Error fetching appointments';
        console.error('Error fetching appointments', error);
      },
    });
  }

  async changeStatus(id: number, status: number) {  
    if(window.confirm('Do you want to change appointment status to: '+this.getStatusName(status).title)) {
      await this.appointmentService.changeAppointmentStatus(id, status)
    }
  }

  applyFilters() {
    this.filteredAppointments = this.appointments
      .filter((appointment) => {
        const searchText = this.filter.searchText ? this.filter.searchText.toLowerCase() : '';
  
        return (
          (!searchText || 
            (appointment.name && appointment.name.toLowerCase().includes(searchText)) ||
            (appointment.service && appointment.service.toLowerCase().includes(searchText)) ||
            (appointment.phone && appointment.phone.toLowerCase().includes(searchText)) ||
            (appointment.email && appointment.email.toLowerCase().includes(searchText))
          ) &&
          (!this.filter.date || appointment.date === this.filter.date) &&
          (!this.filter.status || appointment.status == +this.filter.status)
        );
      })
      .sort((a, b) => this.sortAppointments(a, b));

  }

  resetFilters() {
    this.filter = {
      searchText: '',
      status:  '',
      date: '',
    };
    this.filteredAppointments = this.appointments;
  }

  sort(field: string) {
    if (this.currentSortField === field) {
      // Inverse l'ordre de tri si le champ est le même
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      // Définit le champ de tri et l'ordre par défaut (asc)
      this.currentSortField = field;
      this.sortOrder = 'asc';
    }
    this.applyFilters(); // Applique le tri après la mise à jour
  }

  sortAppointments(a: any, b: any): number {
    const field = this.currentSortField;
    const order = this.sortOrder === 'asc' ? 1 : -1;
    return a[field] > b[field] ? order : a[field] < b[field] ? -order : 0;
  }

/*   // Méthode pour trier les appointments
  sortAppointments(a: IAppointment, b: IAppointment): number {
    const column = this.sortColumn;
    if (!column) {
      return 0;
    }

    const dir = this.sortDirection === 'asc' ? 1 : -1;

    if (a[column] < b[column]) {
      return -1 * dir;
    } else if (a[column] > b[column]) {
      return 1 * dir;
    } else {
      return 0;
    }
  }
  // Méthode pour définir la colonne de tri et l'ordre
  setSortColumn(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applyFilters();
  } */

  getStatusName(status: number) {
    const statusObj = this.statusList.find(s => s.statusNumber == status);
    return statusObj ? { statusId: statusObj.statusNumber, title: statusObj.title, color: statusObj.color } : { title: 'Unknown', color: 'secondary' };
  }

  // getStatusName(status: number) {
  //   switch (status) {
  //     case 1:
  //       return { title: 'Pending', color: 'warning' };
  //     case 2:
  //       return { title: 'Confirmed', color: 'success' };
  //     case 3:
  //       return { title: 'Missed', color: 'secondary' };
  //     default:
  //       return { title: 'Unknown', color: 'secondary' };
  //   }
  // }


  // applyFilters(): void {
  //   this.filteredAppointments = this.appointments.filter(appointment => {
  //     return (!this.filter.name ||  appointment.name.toLowerCase().includes(this.filter.name.toLowerCase())) &&
  //            (!this.filter.email || appointment.email.toLowerCase().includes(this.filter.email.toLowerCase())) &&
  //            (!this.filter.date || appointment.date === this.filter.date) &&
  //            (!this.filter.status ||  appointment.status.toLowerCase().includes(this.filter.status.toLowerCase()));
  //           //  (!this.filter.status || appointment.status == +this.filter.status);
  //   });
  // }

  // resetFilters(): void {
  //   this.filter = {
  //     name: '',
  //     email: '',
  //     date: '',
  //     status: ''
  //   };
  //   this.filteredAppointments = [...this.appointments];
  // }

  closeModal(msg?: string): void {
    this.displayModal = false;
    if(msg) {
      this.successMessage = msg;
      setTimeout(() => {
        this.successMessage = undefined;
      }, 3000);
    }
  }

  async deleteAppointment(id: number) {
    try {
      if (window.confirm('Do you want to remove this Appointment?')) {
      await this.appointmentService.deleteAppointment(id);
      } else return;
      this.successMessage = 'Appointment deleted successfully';
      setTimeout(() => {
        this.successMessage = undefined;
      }, 3000);
    } catch (error) {
      this.errorMessage = 'Error deleting appointment';
      console.error('Error deleting appointment', error);
    }
  }

  // pageChanged(event: number): void {
  //   this.currentPage = event;
  // }
  get collectionSize(): number {
    return this.filteredAppointments.length;
  }

  pageChanged(event: number): void {
    console.log('EVENT: ', event);
    console.log('page size: ', this.pageSize);
    console.log('currentpage: ', this.currentPage);
    this.page = event;
    console.log('this Page: ', this.page);
    console.log('collection size: ', this.filteredAppointments.length);
  }

  addAppointment(): void {
    // this.router.navigate([`/appointments/new`]);
  }
}
