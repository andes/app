import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { Plex } from 'andes-plex/src/lib/core/service';
import { IAgenda } from './../../interfaces/turnos/IAgenda';
import { ITurno } from './../../interfaces/turnos/ITurno';
import { ListaEsperaService } from '../../services/turnos/listaEspera.service';

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
        debugger;
        this.turno;   
    
    }

    agregarPacienteListaEspera(paciente: any) {
        let patch: any = {};
        // let pacienteListaEspera = {};

        // if (paciente) {
        //     pacienteListaEspera = paciente;
        // } else {
        //     pacienteListaEspera = this.pacientesSeleccionados;
        // }

        patch = {
            'op': 'listaEsperaSuspensionAgenda',
            'idAgenda': this.agenda.id,
            'pacientes': paciente
        };
        debugger;
        this.listaEsperaService.postXIdAgenda(this.agenda.id, patch).subscribe(resultado => {

            this.plex.alert('El paciente paso a Lista de Espera');
            debugger;
        });
    }

    constructor(public plex: Plex, public listaEsperaService: ListaEsperaService) { }

}