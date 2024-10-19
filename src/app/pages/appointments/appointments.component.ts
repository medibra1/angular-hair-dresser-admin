import { CommonModule, Time } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ModalComponent } from '../../components/modal/modal.component';
import { AppointmentService } from '../../services/appointment/appointment.service';
import { AppointmentFormComponent } from '../../components/appointment-form/appointment-form.component';
import { NgxPaginationModule } from 'ngx-pagination';

import jsPDF from 'jspdf';
import 'jspdf-autotable';

export interface IAppointment {
  id: number;
  name: string;
  email: string;
  phone: string;
  date: Date;
  time: Time;
  status: number;
  service: string;
  service_id: number;
}

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ModalComponent,
    AppointmentFormComponent,
    NgxPaginationModule,
  ],
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

  statusList: any[] = [
    {
      statusNumber: 1,
      title: 'Pending',
      color: 'warning',
    },
    {
      statusNumber: 2,
      title: 'Confirmed',
      color: 'primary',
    },
    {
      statusNumber: 3,
      title: 'Missed',
      color: 'secondary',
    },
    // { statusNumber: 4, title: 'Cancelled', color: 'danger' }
  ];

  filter = {
    searchText: '',
    status: '',
    date: '',
  };

  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  displayModal = false;

  errorMessage = '';
  successMessage = '';

  currentPage: number = 1; //ngx pagination
  page = 1;
  pageSize = 10;
  // collectionSize = this.appointments.length;

  currentSortField: string = 'name'; // Champ de tri actuel
  sortOrder: 'asc' | 'desc' = 'asc'; // Ordre de tri actuel

  @ViewChild('dateInput') dateInput!: ElementRef; 
  @ViewChild('dateInputBtn') dateInputBtn!: ElementRef; 

  constructor(private appointmentService: AppointmentService) {}

  ngOnInit(): void {
    this.appointmentService.loadAppointments();
    this.loadAppointments();
  }

  openDatePicker(event: MouseEvent): void {
      event.preventDefault();
      this.dateInputBtn.nativeElement.style.display = 'none'; 
      this.dateInput.nativeElement.style.display = 'block'; 
      this.dateInput.nativeElement.focus(); 
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
    if (
      window.confirm(
        'Do you want to change appointment status to: ' +
          this.getStatusName(status).title
      )
    ) {
      await this.appointmentService.changeAppointmentStatus(id, status);
    }
  }

  applyFilters() {
    this.filteredAppointments = this.appointments
      .filter((appointment) => {
        const searchText = this.filter.searchText
          ? this.filter.searchText.toLowerCase()
          : '';

        return (
          (!searchText ||
            (appointment.name &&
              appointment.name.toLowerCase().includes(searchText)) ||
            (appointment.service &&
              appointment.service.toLowerCase().includes(searchText)) ||
            (appointment.phone &&
              appointment.phone.toLowerCase().includes(searchText)) ||
            (appointment.email &&
              appointment.email.toLowerCase().includes(searchText))) &&
          (!this.filter.date || appointment.date === this.filter.date) &&
          (!this.filter.status || appointment.status == +this.filter.status)
        );
      })
      .sort((a, b) => this.sortAppointments(a, b));
  }

  resetFilters() {
    this.filter = {
      searchText: '',
      status: '',
      date: '',
    };
    this.dateInput.nativeElement.style.display = 'none';
    this.dateInputBtn.nativeElement.style.display = 'block';
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
    const statusObj = this.statusList.find((s) => s.statusNumber == status);
    return statusObj
      ? {
          statusId: statusObj.statusNumber,
          title: statusObj.title,
          color: statusObj.color,
        }
      : { title: 'Unknown', color: 'secondary' };
  }

  getOnlyHourMinute(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return `${this.padZero(hours)}:${this.padZero(minutes)}`;
  }

  padZero(number: number): string {
    return number < 10 ? `0${number}` : number.toString(); // ajouter un zéro au début si le chiffre est inférieur à 10
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
    if (msg) {
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
    // console.log('EVENT: ', event);
    // console.log('page size: ', this.pageSize);
    // console.log('currentpage: ', this.currentPage);
    // console.log('collection size: ', this.filteredAppointments.length);
    this.page = event;
    console.log('this Page: ', this.page);
  }

  generatePDF() {
    const doc = new jsPDF({
      orientation: 'landscape', // Mode paysage
      unit: 'mm',
      format: 'a4',
    });

    // Charger l'image depuis /assets
    const logo = new Image();
    logo.src = 'assets/img/logo.png';
    doc.addImage(logo, 'PNG', 10, 10, 18, 17); // Position (x, y) et taille (width, height)

    // Titre du document
    doc.text('Appointments List', 40, 20);

    // Données du tableau
    const head = [['Name', 'Phone', 'Date', 'Time', 'Service', 'Status']];
    const data = this.filteredAppointments.map((row) => [
      row.name,
      row.phone,
      row.date,
      this.getOnlyHourMinute(row.time),
      row.service,
      this.getStatusName(row.status),
    ]);

    // Générer le tableau dans le PDF avec AutoTable
    (doc as any).autoTable({
      head: head,
      body: data,
      startY: 35, // Commencer le tableau après le logo
      theme: 'striped',
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
    });

    // doc.save('table.pdf');
    //window.open(doc.output('bloburl'));

    const blob = doc.output('blob');
    // Créer une URL pour le Blob
    const blobUrl = URL.createObjectURL(blob);
    // Créer un lien <a> caché et le déclencher
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = 'ygb-appointments-list.pdf'; // Définir le nom de fichier pour le téléchargement
    document.body.appendChild(a);
    a.click(); // Simuler le clic sur le lien pour déclencher le téléchargement
    document.body.removeChild(a); // Supprimer le lien après le clic
  }

  addAppointment(): void {
    // this.router.navigate([`/appointments/new`]);
  }
}
