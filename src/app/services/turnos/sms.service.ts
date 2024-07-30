import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { environment } from '../../../environments/environment';

@Injectable()
export class SmsService {

    private smsUrl = '/core/tm/'; // URL to web api

    constructor(private server: Server) { }

    enviarSms(params): Observable<String> {
        return this.server.get(this.smsUrl + 'sms/', { params: params, showError: true });
    }

    enviarNotificacion(params): Observable<String> {
        return this.server.post(this.smsUrl + 'notificacion/', { params: params, showError: true });
    }
}
