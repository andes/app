import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';

@Injectable()
export class HojaTrabajoService {
    private laboratorioUrl = '/modules/rup/laboratorio/'; // URL API
    constructor(private server: Server) { }

    getHojasTrabajo() {
        return this.server.get(this.laboratorioUrl + 'hojatrabajo');
    }
}
