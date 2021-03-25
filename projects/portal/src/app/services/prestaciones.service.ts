import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
@Injectable({
    providedIn: 'root',
})

export class PrestacionService {
    private mobileUrl = '/modules/mobileApp/';
    private valorInicial = new BehaviorSubject<number>(12);
    valorActual = this.valorInicial.asObservable();
    private focoInicial = new BehaviorSubject<string>('main');
    focoActual = this.focoInicial.asObservable();
    constructor(
        private server: Server,
        private router: Router
    ) { }

    getLaboratorios(id): Observable<any[]> {
        return this.server.get(`${this.mobileUrl}/laboratorios/${id}`);

    }

    getLaboratorio(id: number | string, idPaciente) {
        return this.getLaboratorios(idPaciente).pipe(
            map((laboratorios) => laboratorios.find(laboratorio => laboratorio.cda_id === id))
        );
    }

    actualizarValor(sidebarValue: number) {
        this.valorInicial.next(sidebarValue);
    }

    actualizarFoco(valorFoco: string) {
        this.focoInicial.next(valorFoco);
    }

    resetOutlet() {
        this.router.navigate(['home', {
            outlets: {
                // detalle: null,
                detalleHuds: null,
                detalleVacuna: null,
                detalleTurno: null,
                detalleFamiliar: null,
                detallePrescripcion: null,
                detalleLaboratorio: null,
                detalleProblema: null,
                detalleProfesional: null,
                detalleMensaje: null,
            }
        }]);
    }
}
