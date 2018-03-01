import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';

@Injectable()
export class PrestamosService {
    private turnoUrl = '/modules/prestamosCarpetas';

    constructor(private server: Server) { }

    getCarpetas(): Observable<any[]> {
        debugger;
        return this.server.get(this.turnoUrl + '/prestamosHC');
    }
}