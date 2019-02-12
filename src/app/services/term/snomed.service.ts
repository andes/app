import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';

export function Cache ({key}) {
    let _cache: any = {};
    return function ( target: any, propertyKey: string, descriptor: PropertyDescriptor ) {
        const fn = descriptor.value as Function;
        descriptor.value = function (...args) {
            const objectKey = key ? (typeof key === 'string' ? args[0][key] : args[0]) : 'default';
            if (!_cache[objectKey]) {
                return fn.apply(this, args).do(x => _cache[objectKey] = x);
            } else {
                return new Observable(resultado => resultado.next(_cache[objectKey]));
            }
        };
        return descriptor;
    };
}


@Injectable()
export class SnomedService {
    private snomedURL = '/core/term/snomed';  // URL to web api
    private snomedURLexpression = '/core/term/snomed/expression';

    constructor(private server: Server) {
    }

    @Cache({ key : 'search' })
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
