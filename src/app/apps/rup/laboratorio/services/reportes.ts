import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';

@Injectable()
export class ReportesLaboratorioService {
    private reportesUrl = '/modules/rup/laboratorio/reportes/';

    constructor(private server: Server) { }

    /**
     * @param {PracticaSearch} params
     * @returns {Observable<IPracticaMatch[]>}
     * @memberof PracticaService
     */
    reporteResultados(protocolos) {
        return this.server.post(this.reportesUrl + 'resultados/', protocolos).map((value) => {
            return value;
        });
    }
}
