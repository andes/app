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
<<<<<<< HEAD
     */ 
   
=======
     */

>>>>>>> 711bd5cf3d8e2f1e052a1750c2ca5884ce17bd72
    get(): Observable<[]> {
        return this.server.get(this.practicaUrl, null).map((value) => {
            return value;
        });
    }
}
