
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class SnomedBuscarService {

    private dataSource = new BehaviorSubject<string>('');
    onChange = this.dataSource.asObservable();

    constructor() { }

    search(text: string) {
        this.dataSource.next(text);
    }

}
