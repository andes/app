import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { Observable } from 'rxjs';


@Injectable()
export class ValidacionService {

    private url = '/core-v2/mpi/validacion'; // '/modules/fuentesAutenticas';  // URL to web api


    constructor(private server: Server) { }

    post(params: any): Observable<any> {
        return this.server.post(this.url, params, { showError: false });
    }

}
