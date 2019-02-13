import { IPrestacion } from './../../../../interfaces/turnos/IPrestacion';
import { IPrestacionGetParams } from './../../../../modules/rup/interfaces/prestacionGetParams.interface';
import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';

@Injectable()
export class ProtocoloService {
    private laboratorioUrl = '/modules/rup/laboratorio/'; // URL API
    private protocolosUrl = this.laboratorioUrl + 'protocolos/';
    private registrosPrestacionesUrl = this.protocolosUrl + 'ejecuciones/registros'; // URL to web api

    constructor(private server: Server) { }

    /**
     * Método get. Trae lista de objetos prestacion.
     *
     * @param {*} params: IPrestacioGetParams Opciones de búsqueda
     * @param {*} [options={}] Options a pasar a la API
     * @returns {Observable<IPrestacion[]>}
     *
     * @memberof PrestacionesService
     */
    get(params: IPrestacionGetParams, options: any = {}): Observable<IPrestacion[]> {
        if (typeof options.showError === 'undefined') {
            options.showError = true;
        }

        let opt = { params: params, options };

        return this.server.get(this.protocolosUrl, opt);
    }

    post(cambios: any): Observable<IPrestacion> {
        return this.server.post(this.protocolosUrl, cambios);
    }

    patch(cambios: any): Observable<IPrestacion> {
        return this.server.patch(this.registrosPrestacionesUrl, cambios);
    }

    getNumeroProtocolo(idOrganizacion) {
        return this.server.get(this.protocolosUrl  + 'generarNumero?idEfector=' + idOrganizacion, { params: {}, showError: true });
    }

    getResultadosAnteriores(idPaciente, practicaConceptIds) {
        return this.server.get(this.laboratorioUrl + 'practicas/resultadosAnteriores', { params: { idPaciente: idPaciente, practicaConceptIds: practicaConceptIds }, showError: true });
    }

    searchByNumeroProcolo(param) {
        return this.server.get(this.protocolosUrl  + 'numero/' + param, { params: {}, showError: true });
    }
}
