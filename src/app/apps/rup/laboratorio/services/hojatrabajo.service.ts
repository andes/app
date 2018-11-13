import { IHojaTrabajo } from './../interfaces/IHojaTrabajo';
import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';

@Injectable()
export class HojaTrabajoService {
    private laboratorioUrl = '/modules/rup/laboratorio/'; // URL API
    constructor(private server: Server) { }

    get() {
        return this.server.get(this.laboratorioUrl + 'hojatrabajo');
    }

    post(hojaTrabajo: IHojaTrabajo): Observable<IHojaTrabajo> {
        return this.server.post(this.laboratorioUrl + 'hojatrabajo', hojaTrabajo);
    }
}
