import { ResourceBaseHttp, Server } from '@andes/shared';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class InternacionResumenHTTP extends ResourceBaseHttp<IResumenInternacion> {
    protected url = '/modules/rup/internacion/internacion-resumen';
    showError = false;

    constructor(protected server: Server) {
        super(server);
    }

}


export interface IResumenInternacion {
    id: string;
    paciente: {
        id: string;
        nombre: string;
        apellido: string;
        documento: string;
        sexo: string;
        fechaNacimiento: string;
    };
    fechaIngreso: string;
    fechaEgreso: string;
    ingreso: {
        registros: any[];
        elementoRUP: any;
    };
}
