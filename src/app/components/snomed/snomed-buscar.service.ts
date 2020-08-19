
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface SnomedBuscadorParam {
    term?: string;
    expression?: string;
}

@Injectable()
export class SnomedBuscarService {

    private dataSource = new BehaviorSubject<SnomedBuscadorParam>({});
    onChange = this.dataSource.asObservable();

    constructor() { }

    search(param: string | SnomedBuscadorParam) {
        if (typeof param === 'string') {
            this.dataSource.next({ term: param });
        } else {
            this.dataSource.next(param);
        }
    }

}
