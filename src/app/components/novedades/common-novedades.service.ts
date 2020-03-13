import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class CommonNovedadesService {
    private selectedNovedad: Subject<string> = new Subject();

    setSelectedNovedad(value: any) {
        this.selectedNovedad.next(value);
    }

    getSelectedNovedad(): Observable<any> {
        return this.selectedNovedad.asObservable();
    }
}
