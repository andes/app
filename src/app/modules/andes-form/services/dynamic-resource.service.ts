import { Server } from '@andes/shared';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DynamicResourcesService {
    constructor( private server: Server ) { }

    get(url, params?): Observable<any[]> {
        return this.server.get(url, { params, showError: true });
    }
}
