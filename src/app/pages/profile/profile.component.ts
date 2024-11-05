import { Component, inject } from '@angular/core';
import { User } from '../../models/user.model';
import { ProfileService } from '../../services/profile/profile.service';
import { Subscription } from 'rxjs';
import { ModalComponent } from '../../components/modal/modal.component';
import { CommonModule } from '@angular/common';
import { ProfileFormComponent } from '../../components/profile-form/profile-form.component';
import { UpdatePasswordFormComponent } from '../../components/update-password-form/update-password-form.component';
import { AlertComponent } from '../../components/alert/alert.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    ModalComponent,
    CommonModule,
    ProfileFormComponent,
    UpdatePasswordFormComponent,
    AlertComponent
],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent {

  profile = {} as User;
  profileService = inject(ProfileService);
  profileSub: Subscription;

  displayUpdateProfileModal = false;
  displayUpdatePwdModal = false;

  successMessage = '';
  errorMessage: any[] = [];

  constructor() {}

  async ngOnInit() {
    await this.profileService.getProfile();
    this.profileSub = this.profileService.profile.subscribe({
      next: (profile) => {
        this.profile = profile;
        console.log('Profile data Profile - component: ', this.profile);
      },
    });

    // this.initializeForm();
  }

  closeModal(event?: any): void {
    // this.profileForm.reset();
    // this.initializeForm();
    console.log('Close Modal reponse: ', event);
      if(event) {
      if(event.status == true) this.successMessage = event.message;
      else this.errorMessage = [event.message];
    }
      this.displayUpdateProfileModal = false;
      this.displayUpdatePwdModal = false
  }

  ngOnDestroy() {
    if (this.profileSub) this.profileSub.unsubscribe();
  }


}
