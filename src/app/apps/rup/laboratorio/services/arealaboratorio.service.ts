import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';

@Injectable()
export class AreaLaboratorioService {
    private laboratorioUrl = '/modules/rup/laboratorio/'; // URL API
    constructor(private server: Server) { }

    get() {
        return this.server.get(this.laboratorioUrl + 'areas');
    }
}
