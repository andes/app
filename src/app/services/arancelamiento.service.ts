import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { Observable } from 'rxjs/Rx';
import { environment } from '../../environments/environment';
import { IBarrio } from './../interfaces/IBarrio';

@Injectable()
export class ArancelamientoService {
    private url = '/modules/arancelamiento';  // URL to web api

    constructor(private server: Server) { }

    get(dni: any): Observable<any> {
        return this.server.get(this.url + '/puco/' + dni);
    }
    
}