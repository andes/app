import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { Observable, BehaviorSubject, observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
@Injectable({
    providedIn: 'root',
})

export class PrestacionService {

    private vacunasURL = '/modules/vacunas';
    private agendaUrl = '/modules/turnos/agenda';
    private valorInicial = new BehaviorSubject<number>(12);
    valorActual = this.valorInicial.asObservable();

    private sidebarInicial = new BehaviorSubject<Boolean>(false);
    sidebarActual = this.sidebarInicial.asObservable();

    private focoInicial = new BehaviorSubject<string>('main');
    focoActual = this.focoInicial.asObservable();


    constructor(
        private server: Server,
        private router: Router
    ) { }

    getVacunas(idPaciente: String): Observable<any[]> {
        return this.server.get(this.vacunasURL + '/paciente/' + idPaciente, null);
    }


    getVacuna(id: number | string, idPaciente) {
        return this.getVacunas(idPaciente).pipe(
            map((vacunas) => vacunas.find(vacuna => vacuna.id === id))
        );
    }


    getTurnos(idPaciente: String): Observable<any[]> {

        return this.server.get(this.agendaUrl + '/paciente' + '/' + idPaciente);

    }

    getTurno(id: number | string, idPaciente) {
        return this.getTurnos(idPaciente).pipe(
            map((turnos) => turnos.map(turno => turno.bloques.find(c => c.turnos.find(g => {
                if (g.id === id) {
                    console.log(id);
                    return g;
                }
            }

            ))))
        );
    }

    actualizarValor(mainValue: number) {
        this.valorInicial.next(mainValue);
    }

    actualizarFoco(valorFoco: string) {
        this.focoInicial.next(valorFoco);
    }
    actualizarSidebar(valorSidebar: boolean) {

        this.sidebarInicial.next(valorSidebar);
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
