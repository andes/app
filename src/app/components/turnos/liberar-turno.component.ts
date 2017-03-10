import { Component, Input, EventEmitter, Output } from '@angular/core';
import { Plex } from 'andes-plex/src/lib/core/service';
import { IAgenda } from './../../interfaces/turnos/IAgenda';
import { ITurno } from './../../interfaces/turnos/ITurno';
import { ListaEsperaService } from '../../services/turnos/listaEspera.service';
import { AgendaService } from '../../services/turnos/agenda.service';

@Component({
    selector: 'liberar-turno',
    templateUrl: 'liberar-turno.html'
})

export class LiberarTurnoComponent {

    @Input() agenda: IAgenda;
    @Input() turno: ITurno;

    @Output() saveLiberarTurno = new EventEmitter<IAgenda>();
    @Output() reasignarTurnoLiberado = new EventEmitter<boolean>();

    showLiberarTurno: boolean = true;

    public reasignar: any = {};

    liberarTurno(turno: any) {
        let patch = {
            'op': 'liberarTurno',
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
        this.liberarTurno(turno);

        this.listaEsperaService.postXIdAgenda(this.agenda.id, patch).subscribe(resultado => {

            this.serviceAgenda.getById(this.agenda.id).subscribe(resulAgenda => {

                this.saveLiberarTurno.emit(resulAgenda);

                this.plex.alert('El paciente ' + turno.paciente.apellido + ' ' + turno.paciente.nombre + ' paso a Lista de Espera');
            })

        });
    }

    reasignarTurno(paciente: any) {
        debugger;
        this.reasignar = { 'paciente': paciente, 'idTurno': this.turno.id, 'idAgenda': this.agenda.id };

        this.reasignarTurnoLiberado.emit(this.reasignar);
    }

    constructor(public plex: Plex, public listaEsperaService: ListaEsperaService, public serviceAgenda: AgendaService) { }

}