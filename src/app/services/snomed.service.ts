// import { TransformarProblemaComponent } from './../components/rup/problemas-paciente/transformarProblema.component';
// import { Observable } from 'rxjs/Rx';
// import { Injectable } from '@angular/core';
// import { Server } from '@andes/shared';
// import { environment } from '../../environments/environment';

import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/map';

@Injectable()
export class SnomedService {
    // private snomedURL = 'http://mongolito:3000/snomed/es-edition/v20160430/descriptions';

    // constructor(private server: Server) {
    // }

    // get(params: any): Observable<any[]> {
    //     return this.server.get(this.snomedURL, { params: params, showError: true });
    // }

    // private snomedURL = 'http://mongolito:3000/snomed/es-edition/v20160430/descriptions';
    //http://127.0.0.1:3000/snomed/es-edition/v20160430/concepts/
    private snomedURL = 'http://127.0.0.1:3000/snomed/es-edition/v20160430/descriptions';

    constructor(private http: Http) { }

    getDefaultOptions(params) {
        const headers = new Headers({ 'Content-Type': 'application/json' });
        const options = new RequestOptions({
            headers: headers
        });

        // establecemos los parametros de busqueda
        if (params) {
            options.search = new URLSearchParams();
            for (const param in params) {
                if (params[param]) {
                    options.search.set(param, params[param]);
                }
            }
        }

        return options;
    }

    extractData(res: Response) {
        return res.json();
    }

     get(params: any): Observable<any[]> {
        const options = this.getDefaultOptions(params);

        return this.http.get(this.snomedURL, options).map(this.extractData);
    }

    buscarTrastornosHallazgos(query: String): Observable<any[]> {
        if (!query) {
            return null;
        }

        let params = {
            query: query,
            semanticFilter: '',
            limit: 10,
            searchMode: 'partialMatching',
            lang: 'english',
            statusFilter: 'activeOnly',
            skipTo: 0,
            returnLimit: 10,
            langFilter: 'spanish',
            normalize: true
        };

        // duplicamos params para cada query
        let _paramsHallazgos = JSON.parse(JSON.stringify(params));
        let _paramsTrastornos = JSON.parse(JSON.stringify(params));

        // modificamos el semanticFilter para cada query
        _paramsHallazgos['semanticFilter'] = 'hallazgo';
        _paramsTrastornos['semanticFilter'] = 'trastorno';

        return Observable.forkJoin([
            this.get(_paramsHallazgos),
            this.get(_paramsTrastornos)
        ])
        .map((data: any[]) => {
            let hallazgos: any[] = data[0].matches;
            let trastornos: any[] = data[1].matches;

            // concatenamos resultados
            let result = hallazgos.concat(trastornos);

            // ordenamos en forma ascendente
            result.sort(function compare(a, b) {
                let x = a.fsn.toLowerCase();
                let y = b.fsn.toLowerCase();
                return x < y ? -1 : x > y ? 1 : 0;
            });

            // limitamos la cantiadd de resultados y retornamos
            return result.slice(0, params.returnLimit);
        });
    }
}
