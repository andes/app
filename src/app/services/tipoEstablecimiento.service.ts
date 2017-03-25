import { Observable } from 'rxjs/Rx';
import { Server } from '@andes/shared';
import { ITipoEstablecimiento } from './../interfaces/ITipoEstablecimiento';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable()
export class TipoEstablecimientoService {

    private tipoEstablecimientoUrl = '/core/tm/tiposEstablecimiento';  // URL to web api

    constructor(private server: Server) { }

    get(): Observable<ITipoEstablecimiento[]> {
        return this.server.get(this.tipoEstablecimientoUrl);
    }
}
