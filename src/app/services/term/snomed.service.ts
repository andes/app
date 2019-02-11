import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { environment } from '../../../environments/environment';

// import { Injectable } from '@angular/core';
// import { Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';
// import { Observable } from 'rxjs/Observable';
// import 'rxjs/add/operator/map';

@Injectable()
export class SnomedService {
    private snomedURL = '/core/term/snomed';  // URL to web api
    private snomedConceptURL = '/core/term/snomed/concepts';  // URL to web api
    private snomedURLProblema = '/core/term/snomed/problema';  // URL to web api
    private snomedURLProcedimiento = '/core/term/snomed/procedimiento';  // URL to web api
    private snomedURLEquipamiento = '/core/term/snomed/equipamiento';  // URL to web api
    private snomedURLexpression = '/core/term/snomed/expression';

    constructor(private server: Server) {
    }

    get(params: any): Observable<any[]> {
        return this.server.get(this.snomedURL, { params: params, showError: true });
    }

    getCie10(params: any): Observable<any> {
        return this.server.get(this.snomedURL + '/map', { params: params, showError: true });
    }

    getQuery(params: any): Observable<any[]> {
        return this.server.get(this.snomedURLexpression, { params: params, showError: true });
    }

}
