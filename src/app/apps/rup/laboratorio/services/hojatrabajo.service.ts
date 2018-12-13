import { IHojaTrabajo } from '../interfaces/practica/hojaTrabajo/IHojaTrabajo';
import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';

@Injectable()
export class HojaTrabajoService {
    private laboratorioUrl = '/modules/rup/laboratorio/'; // URL API
    constructor(private server: Server) { }

    get(organizacion) {
        return this.server.get(this.laboratorioUrl + 'hojatrabajo', { params: {organizacion: organizacion}, showError: true });
    }

    post(hojaTrabajo: IHojaTrabajo): Observable<IHojaTrabajo> {
        return this.server.post(this.laboratorioUrl + 'hojatrabajo', hojaTrabajo);
    }

    put(hojaTrabajo: IHojaTrabajo): Observable<IHojaTrabajo> {
        return this.server.put(this.laboratorioUrl + 'hojatrabajo/' + hojaTrabajo._id, hojaTrabajo);
    }

    patch(hojaTrabajo: IHojaTrabajo): Observable<IHojaTrabajo> {
        return this.server.patch(this.laboratorioUrl + 'hojatrabajo/' + hojaTrabajo._id, hojaTrabajo);
    }

}
