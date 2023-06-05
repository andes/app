
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';


export interface SnomedBuscadorParam {
    term?: string;
    expression?: string;
}

@Injectable()
export class SnomedBuscarService {

    private dataSource = new BehaviorSubject<SnomedBuscadorParam>({});
    private buscado: BehaviorSubject<string> = new BehaviorSubject<string>('');
    onChange = this.dataSource.asObservable();

    constructor() { }

    search(param: string | SnomedBuscadorParam) {
        if (!param) {
            param = '';
        }
        if (typeof param === 'string') {
            this.dataSource.next({ term: param });
        } else {
            this.dataSource.next(param);
        }
    }

    getBuscadoValue(): Observable<string> {
        return this.buscado.asObservable();
    }
    setBuscado(search: string) {
        this.buscado.next(search);
    }

}
