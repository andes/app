import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Server, Cache } from '@andes/shared';

@Injectable()
export class SnomedService {
    private snomedURL = '/core/term/snomed';  // URL to web api
    private snomedURLexpression = '/core/term/snomed/expression';

    constructor(private server: Server) {
    }

    // @Cache({ key: 'search' })
    get(params: any): Observable<any[]> {
        return this.server.get(this.snomedURL, { params: params, showError: true });
    }

    getCie10(body): Observable<any> {
        return this.server.post(this.snomedURL + '/map', body);
    }

    getQuery(params: any): Observable<any[]> {
        return this.server.get(this.snomedURLexpression, { params: params, showError: true });
    }

}
