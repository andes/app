import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class PreviousUrlService {

    // TODO: Esto es un poco hacky -- soluciona el problema de tener la url anterior
    // hasta la actualización a Angular 7.2, donde se incorpora la posibilidad de pasar un estado en el navigate
    private previousUrl = new BehaviorSubject<any>(null);

    setUrl(url) {
        this.previousUrl.next(url);
    }

    getUrl(): string {
        return this.previousUrl.value;
    }
}

