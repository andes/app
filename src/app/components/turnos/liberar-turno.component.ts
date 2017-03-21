import { Component, Input, EventEmitter, Output, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';
import { IAgenda } from './../../interfaces/turnos/IAgenda';
import { ITurno } from './../../interfaces/turnos/ITurno';
import { ListaEsperaService } from '../../services/turnos/listaEspera.service';
import { AgendaService } from '../../services/turnos/agenda.service';

@Component({
    selector: 'liberar-turno',
    templateUrl: 'liberar-turno.html'
})

export class LiberarTurnoComponent implements OnInit {

    @Input() agenda: IAgenda;
    @Input() pacientesSeleccionados: ITurno;

    @Output() saveLiberarTurno = new EventEmitter<IAgenda>();
    @Output() reasignarTurnoLiberado = new EventEmitter<boolean>();

    pacientes: any = [];

    showLiberarTurno: Boolean = true;

    public reasignar: any = {};

    ngOnInit() {
        debugger;
        this.pacientes = this.pacientesSeleccionados;
    }

    liberarTurno() {
        for (let x = 0; x < this.pacientes.length; x++) {
            let patch = {
                'op': 'liberarTurno',
                'idTurno': this.pacientes[x].id
            };

            this.serviceAgenda.patch(this.agenda.id, patch).subscribe(resultado => {

            },
                err => {
                    if (err) {
                        console.log(err);
                    }
                });
        }
    }

    agregarPacienteListaEspera() {

        for (let x = 0; x < this.pacientes.length; x++) {
            let patch = {
                'op': 'listaEsperaSuspensionAgenda',
                'idAgenda': this.agenda.id,
                'pacientes': this.pacientes[x]
            };

            this.liberarTurno();

            this.listaEsperaService.postXIdAgenda(this.agenda.id, patch).subscribe(resultado => {

                this.serviceAgenda.getById(this.agenda.id).subscribe(resulAgenda => {

                    this.saveLiberarTurno.emit(resulAgenda);

                    this.plex.alert('Los pacientes seleccionados pasaron a Lista de Espera');
                });
            });
        }
    }

    reasignarTurno(paciente: any) {
        this.reasignar = { 'paciente': paciente.paciente, 'idTurno': paciente.id, 'idAgenda': this.agenda.id };

        this.liberarTurno();

        this.reasignarTurnoLiberado.emit(this.reasignar);
    }

    constructor(public plex: Plex, public listaEsperaService: ListaEsperaService, public serviceAgenda: AgendaService) { }
}
