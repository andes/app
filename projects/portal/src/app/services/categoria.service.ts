import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
// providers
import { Server } from '@andes/shared';

@Injectable()
export class CategoriasService {
    public user: any;
    private baseUrl = '/modules/mobileApp/categoria';

    constructor(
        public server: Server) {
    }

    get(params): Observable<any> {
        return this.server.get(this.baseUrl, params);
    }

}
