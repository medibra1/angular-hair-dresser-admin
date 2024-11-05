import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import { User } from '../../models/user.model';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private api = inject(ApiService);

  private _profile = new BehaviorSubject<User>(null);

  get profile() {
    return this._profile.asObservable();
  }
  
  constructor() { }

  async getProfile() {
    try {
      const profile_data = this._profile.value;
      if(!profile_data) {
        const res: any = await lastValueFrom(this.api.get('user/profile'));
        const profile: User = res.data
        console.log('get profile data api: ', profile);
        return this.updateProfileData(profile);
      } else return profile_data;
    } catch(e) {
      console.log(e);
      throw(e);
    }
  }

  async updateProfile(id, data: FormData) {
    try {
      data.append('_method', 'PUT');
      const profile_data = await lastValueFrom(this.api.post(`user/update/${id}`, data, true));
      const profile: User = profile_data?.data;
      console.log('profile data: ', profile);
      this.updateProfileData(profile);
      return profile_data;
    } catch(e) {
      console.log(e);
      throw(e);
    }
  }

  async updatePassword(data) {
    try {
      const updatePwdRes = await lastValueFrom(this.api.patch(`user/update/password`, data));
      // const profile: User = profile_data?.data;
      console.log('update password service: ', updatePwdRes);
      // this.updateProfileData(profile);
      // return profile_data;
    } catch(e) {
      console.log(e);
      throw(e);
    }
  }

  updateProfileData(profile) {

    let data: any;
    if(profile) {
      data = new User(
        profile?.email,
        profile?.phone,
        profile?.name,
        profile?.type,
        profile?.status,
        profile?.email_verified,
        profile?.photo ? this.downloadImage(profile?.photo) : null,
        // profile?.photo,
        profile?.city,
        profile?.address,
        profile?.id,
      );
    } else data = profile;
    console.log('Update profile data: ', profile);
    this._profile.next(data);
    return data;
  }

  downloadImage(imageName: string) {
    const data =  this.api.downloadImage('profiles', imageName);
    console.log('Image URL: ', data);
    return data;
 }

}

