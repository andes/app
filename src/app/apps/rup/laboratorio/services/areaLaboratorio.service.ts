import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';


@Injectable()
export class AreaLaboratorioService {
    private practicaUrl = '/modules/rup/laboratorio/areas'; 
    constructor(private server: Server) { }

    /**
     * Metodo get. Trae el objeto organizacion.
     * @param {any} params Opciones de busqueda
     */
   
    get(): Observable<[]> {
        return this.server.get(this.practicaUrl, null).map((value) => {
            return value;
        });
    }
}
