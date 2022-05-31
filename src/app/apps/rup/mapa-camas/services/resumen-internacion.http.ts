import { ResourceBaseHttp, Server } from '@andes/shared';
import { Injectable } from '@angular/core';
import { ISnomedConcept } from 'src/app/modules/rup/interfaces/snomed-concept.interface';

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
        alias?: string;
        apellido: string;
        documento: string;
        numeroIdentificion?: string;
        sexo: string;
        genero: string;
        fechaNacimiento: string;
    };
    fechaIngreso: Date;
    fechaEgreso: Date;
    ingreso: {
        registros: any[];
        elementoRUP: any;
    };
    registros: {
        tipo: string;
        idPrestacion: string;
        concepto: ISnomedConcept;
        valor: any;
        esDiagnosticoPrincipal: boolean;
    }[];

    idPrestacion: string;

}
