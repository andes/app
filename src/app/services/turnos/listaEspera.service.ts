import { Plex } from '@andes/plex';
import { Server } from '@andes/shared';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IDemanda, IListaEspera } from './../../interfaces/turnos/IListaEspera';

@Injectable()
export class ListaEsperaService {

    private listaEsperaUrl = '/modules/turnos/listaEspera';

    constructor(
        private server: Server,
        private plex: Plex
    ) { }

    /**
       * Metodo get. Trae el objeto organizacion.
       * @param {any} params Opciones de busqueda
       */
    get(params: any): Observable<IListaEspera[]> {
        return this.server.get(this.listaEsperaUrl, { params: params, showError: true });
    }

    post(listaEspera: IListaEspera): Observable<IListaEspera> {
        return this.server.post(this.listaEsperaUrl, listaEspera);
    }

    postXIdAgenda(id: string, cambios: any): Observable<IListaEspera> {
        return this.server.post(this.listaEsperaUrl + '/IdAgenda/' + id, cambios);
    }

    getById(id: string): Observable<IListaEspera> {
        return this.server.get(this.listaEsperaUrl + '/' + id, null);
    }

    put(id: string, cambios: any): Observable<IListaEspera> {
        return this.server.put(this.listaEsperaUrl + '/' + id, cambios);
    }

    patch(id: string, datoMod: string, cambios: any): Observable<IListaEspera> {
        return this.server.patch(this.listaEsperaUrl + '/' + id + '/' + datoMod, cambios);
    }

    save(paciente, tipoPrestacion, estado: string, profesional, organizacion, motivo: string, origen: string) {
        const datosProfesional = !profesional ? null : {
            id: profesional.id,
            nombre: profesional.nombre,
            apellido: profesional.apellido
        };
        const demanda: IDemanda = {
            profesional: datosProfesional,
            organizacion,
            motivo,
            fecha: moment().toDate(),
            origen
        };
        const listaEspera: IListaEspera = {
            paciente,
            fecha: moment().toDate(),
            vencimiento: null,
            estado,
            demandas: [demanda],
            tipoPrestacion,
            resolucion: null
        };
        return this.post(listaEspera);
    }
}
