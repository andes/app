import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';


@Injectable()
export class ValidacionService {

    private url = '/core-v2/mpi/validacion'; // '/modules/fuentesAutenticas';  // URL to web api


    constructor(private server: Server) { }

    post(params: any): Observable<any> {
        return this.server.post(this.url, params, { showError: false });
    }

    renaperDisponible(): Observable<boolean> {
        return this.server.get('/core-v2/mpi/renaper/status', { showError: false }).pipe(
            map(status => status === 200),
            catchError(() => of(false))
        );
    }

}
