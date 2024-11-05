import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom, lastValueFrom } from 'rxjs';
import { ApiService } from '../api/api.service';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  
  private usersSubject = new BehaviorSubject<any>([]);
  get users() {
    return this.usersSubject.asObservable();
  }

  private api = inject(ApiService);

  constructor() { }

  async loadUsers() {
    try {
      const data = await lastValueFrom(this.api.get('users'));
      console.log('++++ users list +++++: ', data);
      this.usersSubject.next(data);
    } catch (error) {
      console.log(error);
      throw(error);
    }
  }

  async signup(data: FormData) {
    try {
      const res = await lastValueFrom(this.api.post('user/register', data, true));
      let currentUsers = [];
      currentUsers.push(res.data);
      currentUsers = currentUsers.concat(this.usersSubject.value);
      this.usersSubject.next(currentUsers);
    } catch (error) {
      console.log(error);
      throw(error);
    }
  }

  async deleteUser(id, password) {
    try {
      const data = {password: password};
      const res = await firstValueFrom(this.api.delete(`user/delete/${id}`, data));
      console.log('++++ delete user response +++++: ', res);
      let currentUsers = this.usersSubject.value.slice(); // Make a copy of the current services
      currentUsers = currentUsers.filter(user => user.id !== id);
      this.usersSubject.next(currentUsers);
      // this.usersSubject.next(data);
    } catch (error) {
      console.log(error);
      throw(error);
    }
  }

  async changeUserStatus(id: number, status: number, password: string) {
    try {
      const data = {
        status: status,
        password: password
      }
      const res = await firstValueFrom(this.api.patch(`user/change/status/${id}`, data));
      // this.appointmentsSubject.value.map( d=> {if(d.id == id) d.status = status;});       
      this.usersSubject.next(
        this.usersSubject.value.map(u => {
          if (u.id === id) {
            return { ...u, status };
          }
          return u;
        })
      );                
      console.log('User status changed res: ', data);
    } catch (error) {
      console.log(error);
      throw(error);
    }
  }
  
}
