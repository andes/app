import { Observable } from 'rxjs/Rx';
import { Headers, Http, RequestOptions, RequestMethod, Response } from '@angular/http';
import { Injectable } from '@angular/core';
import { ServerService } from 'andes-shared/src/lib/server.service';
import { AppSettings } from './../../appSettings';

@Injectable()
export class SmsService {

    private smsUrl = AppSettings.API_ENDPOINT + '/core/tm/sms/';  // URL to web api

    constructor(private server: ServerService, private http: Http) { }

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
