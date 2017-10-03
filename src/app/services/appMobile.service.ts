import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { environment } from '../../environments/environment';

@Injectable()
export class AppMobileService {

    // URL to web api
    private mobileUrl = '/modules/mobileApp/';

    constructor(private server: Server) { }

    create(idPaciente: String): Observable<any> {
        return this.server.post(this.mobileUrl + 'create' + '/' + idPaciente, {});
    }

    check(idPaciente: String): Observable<any> {
        return this.server.get(this.mobileUrl + 'check' + '/' + idPaciente, {});
    }

    update(params): Observable<any> {
        return this.server.post(this.mobileUrl + 'reenviar-codigo', { email: params });
    }

}
