export class User {

  constructor(
    public email: string,
    public phone: string,
    public name?: string,
    public type?: number,
    public status?: number,
    public email_verified?: boolean,
    public photo?: string,
    public city?: string,
    public address?: string,
    public id?: number
  ) {}
  
}
