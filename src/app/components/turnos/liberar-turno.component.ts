import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { Plex } from 'andes-plex/src/lib/core/service';
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
    @Input() turno: ITurno;

    @Output() liberarTurnoEmit = new EventEmitter<ITurno>();

    showLiberarTurno: boolean = true;

    ngOnInit() {

    }

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

            this.plex.alert('El paciente paso a Lista de Espera');
            debugger;
        });
    }

    constructor(public plex: Plex, public listaEsperaService: ListaEsperaService, public serviceAgenda: AgendaService) { }

}