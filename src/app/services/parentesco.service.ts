import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable()
export class ParentescoService {
    private parentescoUrl = '/core/mpi/parentescos';  // URL to web api

    constructor(private server: Server) { }

    get(): Observable<any[]> {
        // TODO -> Cachear este response https://codeburst.io/angular-best-practices-4bed7ae1d0b7
        return this.server.get(this.parentescoUrl);
    }
}
