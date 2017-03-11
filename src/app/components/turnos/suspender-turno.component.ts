import { Component, Input, EventEmitter, Output } from '@angular/core';
import { Plex } from '@andes/plex';
import { IAgenda } from './../../interfaces/turnos/IAgenda';
import { ITurno } from './../../interfaces/turnos/ITurno';
import { ListaEsperaService } from '../../services/turnos/listaEspera.service';
import { AgendaService } from '../../services/turnos/agenda.service';

@Component({
    selector: 'suspender-turno',
    templateUrl: 'suspender-turno.html'
})

export class SuspenderTurnoComponent {

    @Input() agenda: IAgenda;
    @Input() turno: ITurno;

    @Output() saveSuspenderTurno = new EventEmitter<IAgenda>();
    @Output() reasignarTurnoSuspendido = new EventEmitter<boolean>();

    showSuspenderTurno: boolean = true;

    public reasignar: any = {};

    suspenderTurno(turno: any) {
        let patch = {
            'op': 'suspenderTurno',
            'idTurno': turno.id
        };

        this.serviceAgenda.patch(this.agenda.id, patch).subscribe(resultado => {

        },
            err => {
                if (err) {
                    console.log(err);
                }
            });
    }

    agregarPacienteListaEspera(turno: any) {

        let patch = {
            'op': 'listaEsperaSuspensionAgenda',
            'idAgenda': this.agenda.id,
            'pacientes': turno
        };
        debugger;
        this.suspenderTurno(turno);

        this.listaEsperaService.postXIdAgenda(this.agenda.id, patch).subscribe(resultado => {

            this.serviceAgenda.getById(this.agenda.id).subscribe(resulAgenda => {

                this.saveSuspenderTurno.emit(resulAgenda);

                this.plex.alert('El paciente ' + turno.paciente.apellido + ' ' + turno.paciente.nombre + ' paso a Lista de Espera');
            })

        });
    }

    reasignarTurno(paciente: any) {
        debugger;
        this.reasignar = { 'paciente': paciente, 'idTurno': this.turno.id, 'idAgenda': this.agenda.id };

        this.reasignarTurnoSuspendido.emit(this.reasignar);
    }

    constructor(public plex: Plex, public listaEsperaService: ListaEsperaService, public serviceAgenda: AgendaService) { }
}