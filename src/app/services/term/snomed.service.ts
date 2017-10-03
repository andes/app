import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { environment } from '../../../environments/environment';

// import { Injectable } from '@angular/core';
// import { Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';
// import { Observable } from 'rxjs/Rx';
// import 'rxjs/add/operator/map';

@Injectable()
export class SnomedService {
    private cie10URL = '/core/term/cie10';
    private snomedURL = '/core/term/snomed';  // URL to web api
    private snomedURLProblema = '/core/term/snomed/problema';  // URL to web api
    private snomedURLProcedimiento = '/core/term/snomed/procedimiento';  // URL to web api
    private snomedURLEquipamiento = '/core/term/snomed/equipamiento';  // URL to web api

    constructor(private server: Server) {
    }

    get(params: any): Observable<any[]> {
        return this.server.get(this.snomedURL, { params: params, showError: true });
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
        return new Observable(resultado => resultado.next({
            '_id': '59bbf1ed53916746547cb963',
            'idCie10': 76,
            'idNew': 2457,
            'capitulo': '06',
            'grupo': '01',
            'causa': 'G03',
            'subcausa': '9',
            'codigo': 'G03.9',
            'nombre': 'Meningitis, no especificada',
            'sinonimo': 'Meningitis, no especificada',
            'descripcion': '06.Enfermedades del sistema nervioso (G00-G99)',
            'c2': false
        }));
        // this.server.get(this.snomedURL + '/map', { params: params, showError: true }).subscribe(resultado => {
        //     if (resultado) {
        //         let datos = { codigo: resultado.mapTarget };
        //         this.server.get(this.cie10URL, { params: datos, showError: true }).subscribe(resultado2 => {
        //             return new Observable(r => r.next(resultado2[0]));
        //         });
        //     } else {
        //         return new Observable(r => r.next(null));
        //     }
        // });
    }
}
