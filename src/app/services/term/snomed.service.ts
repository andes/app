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

    getByConceptId(conceptId: any, params: any): Observable<any[]> {
        return this.server.get(this.snomedConceptURL + '/' + conceptId, { params: params, showError: true });
    }

    getProblemas(params: any): Observable<any[]> {
        return this.server.get(this.snomedURLProblema, { params: params, showError: true });
    }

    getProcedimientos(params: any): Observable<any[]> {
        return this.server.get(this.snomedURLProcedimiento, { params: params, showError: true });
    }

    getEquipamientos(params: any): Observable<any[]> {
        return this.server.get(this.snomedURLEquipamiento, { params: params, showError: true });
    }

    getProductos(params: any): Observable<any[]> {
        return this.server.get(this.snomedURL + '/producto', { params: params, showError: true });
    }

    getCie10(params: any): Observable<any> {
        return this.server.get(this.snomedURL + '/map', { params: params, showError: true });
    }

    getQuery(params: any): Observable<any[]> {
        return this.server.get(this.snomedURLexpression, { params: params, showError: true });
    }
    /*
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
    */
}
