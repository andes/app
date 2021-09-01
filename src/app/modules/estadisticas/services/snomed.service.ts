import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';

/**
 * Repetido por ahora hasta modularizar mejor los componentes.
 * Deberíams hacer un ngModule de servicios o ngModule de Snomed por lo menos.
 */

@Injectable()
export class SnomedService {
    private snomedURL = '/core/term/snomed'; // URL to web api
    private snomedURLexpression = '/core/term/snomed/expression';

    constructor(private server: Server) {
    }

    get(params: any): Observable<any[]> {
        return this.server.get(this.snomedURL, { params: params, showError: true });
    }

    getQuery(params: any): Observable<any[]> {
        return this.server.get(this.snomedURLexpression, { params: params, showError: true });
    }

    getConcepts(sctids): Observable<any[]> {
        return this.server.get(this.snomedURL + '/concepts', { params: { sctids }, showError: true });
    }
}
