import { Server } from '@andes/shared';
import { Observable } from 'rxjs/Observable';
import { IPais } from './../interfaces/IPais';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable()
export class PaisService {

    private paisUrl = '/core/tm/paises';  // URL to web api

    constructor(private server: Server) { }

    get(params: any): Observable<IPais[]> {
        return this.server.get(this.paisUrl, { params: params, showError: true });
    }

}
