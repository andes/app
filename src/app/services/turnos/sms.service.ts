import { Observable } from 'rxjs/Rx';
import { Http, Response } from '@angular/http';
import { Injectable } from '@angular/core';
import { Server } from 'andes-shared/src/lib/server/server.service';
import { AppSettings } from './../../appSettings';

@Injectable()
export class SmsService {

    private smsUrl = AppSettings.API_ENDPOINT + '/core/tm/sms/';  // URL to web api

    constructor(private server: Server, private http: Http) { }

    enviarSms(numero): Observable<String> {

        return this.http.get(this.smsUrl + numero)
            .map((res: Response) => res.json())
            .catch(this.handleError);
    }

    handleError(error: any) {
        console.log(error.json());
        return Observable.throw(error.json().error || 'Server error');
    }
}
