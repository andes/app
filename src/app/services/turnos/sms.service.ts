import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { environment } from '../../../environments/environment';

@Injectable()
export class SmsService {

    private smsUrl = '/core/tm/sms/';  // URL to web api

    constructor(private server: Server) { }

    enviarSms(params): Observable<String> {
        return this.server.get(this.smsUrl, { params: params, showError: true });
    }
}
