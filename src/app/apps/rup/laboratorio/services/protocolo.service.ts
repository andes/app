import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';

@Injectable()
export class ProtocoloService {
    private laboratorioUrl = '/modules/rup/laboratorio/'; // URL API
    constructor(private server: Server) { }

    getNumeroProtocolo(idOrganizacion) {
        return this.server.get(this.laboratorioUrl + 'protocolo/numero?idEfector=' + idOrganizacion, { params: {}, showError: true });
    }

    getResultadosAnteriores(idPaciente, practicaConceptId) {
        return this.server.get(this.laboratorioUrl + 'practicas/resultadosAnteriores', { params: { idPaciente: idPaciente, practicaConceptId: practicaConceptId}, showError: true });
    }
}
