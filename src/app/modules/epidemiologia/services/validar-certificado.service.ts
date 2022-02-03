import { Server } from '@andes/shared';
import { Injectable } from '@angular/core';
import { url } from 'inspector';

@Injectable()

export class ValidarCertificadoService {
    private url = '/modules/validar-certificado';

    constructor(private server: Server) { }

    get(params) {
        return this.server.get(this.url, { params });
    }
}
