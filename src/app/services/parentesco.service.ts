import { Injectable } from '@angular/core';
import { cacheStorage, Server } from '@andes/shared';
import { Observable } from 'rxjs';

@Injectable()
export class ParentescoService {
    private parentescoUrl = '/core-v2/mpi/parentescos';  // URL to web api

    constructor(private server: Server) { }

    get(): Observable<any[]> {
        return this.server.get(this.parentescoUrl).pipe(
            cacheStorage({ key: 'parentescos', ttl: 60 * 24 })
        );
    }
}
