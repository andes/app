import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ParentescoService {
    private parentescoUrl = '/core/mpi/parentescos';  // URL to web api

    constructor(private server: Server) { }

    get(): Observable<any[]> {
        return this.server.get(this.parentescoUrl);
    }
}
