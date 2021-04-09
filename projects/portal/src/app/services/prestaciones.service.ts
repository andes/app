import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
@Injectable({
    providedIn: 'root',
})

export class PrestacionService {
    private mobileUrl = '/modules/mobileApp/';
    private valorInicial = new BehaviorSubject<number>(12);
    valorActual = this.valorInicial.asObservable();

    private sidebarInicial = new BehaviorSubject<Boolean>(false);
    sidebarActual = this.sidebarInicial.asObservable();

    private focoInicial = new BehaviorSubject<string>('main');
    focoActual = this.focoInicial.asObservable();
    constructor(
        private server: Server,

    ) { }

    getLaboratorios(id): Observable<any[]> {
        return this.server.get(`${this.mobileUrl}/laboratorios/${id}`);

    }

    getLaboratorio(id: number | string, idPaciente) {
        return this.getLaboratorios(idPaciente).pipe(
            map((laboratorios) => laboratorios.find(laboratorio => laboratorio.cda_id === id))
        );
    }


}
