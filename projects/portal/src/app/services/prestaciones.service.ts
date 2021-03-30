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


    getTurnos(idPaciente: String): Observable<any[]> {

        return this.server.get(this.agendaUrl + '/paciente' + '/' + idPaciente).pipe(

            map(
                agendas => {
                    const turnos = [];
                    agendas.forEach((agenda, indexAgenda) => {
                        agenda.bloques.forEach((bloque, indexBloque) => {
                            bloque.turnos.forEach((turno, indexTurno) => {
                                if (turno.paciente) {

                                    if (turno.paciente.id === idPaciente) {
                                        turnos.push({
                                            tipoPrestacion: turno.tipoPrestacion,
                                            horaInicio: turno.horaInicio,
                                            estado: turno.estado,
                                            organizacion: agenda.organizacion.nombre,
                                            profesionales: agenda.profesionales,
                                            asistencia: turno.asistencia,
                                            id: turno.id,
                                            fechaHoraDacion: turno.fechaHoraDacion,
                                            horaAsistencia: turno.horaAsistencia,
                                            nota: turno.nota
                                        });
                                    }
                                }
                            });
                        });
                    });
                    return turnos;
                }));




    }

    getTurno(id: number | string, idPaciente) {
        return this.getTurnos(idPaciente).pipe(
            map((turnos) => turnos.find(turno => turno.id === id)));
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
