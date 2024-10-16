export interface IAppointmentSetting {
    id?: number;
    start_time?: string;
    end_time?: string;
    pause_start_time?: string;
    pause_end_time?: string;
    off_days?: string[];
    off_dates?: string[];
    status?: boolean;
    message?: string;
    interval?: number;
    created_at?: Date;
    updated_at?: Date;
  }