import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';

@Injectable()
export class ProtocoloService {
    private protocoloUrl = '/modules/laboratorio/protocolo'; // URL API
    constructor(private server: Server) { }

    getNumeroProtocolo(idOrganizacion) {
        return this.server.get('/modules/laboratorio/protocolo/numero?idEfector=' + idOrganizacion, { params: {}, showError: true })
    }
}
