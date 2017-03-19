import { Component, Input, EventEmitter, Output, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';
import { IAgenda } from './../../interfaces/turnos/IAgenda';
import { ITurno } from './../../interfaces/turnos/ITurno';
import { AgendaService } from '../../services/turnos/agenda.service';

@Component({
    selector: 'agregar-nota-turno',
    templateUrl: 'agregar-nota-turno.html'
})

export class AgregarNotaTurnoComponent implements OnInit {

    @Input() agenda: IAgenda;
    @Input() pacientesSeleccionados: ITurno;

    @Output() saveAgregarNotaTurno = new EventEmitter<IAgenda>();
    @Output() cancelaAgregarNota = new EventEmitter<boolean>();

    showAgregarNotaTurno: Boolean = true;
    pacientes: any = [];

    public modelo: any;
    public resultado: any;

    ngOnInit() {
        this.pacientes = this.pacientesSeleccionados;
    }

    guardarNota(nota: any, idTurno) {
            let patch = {
                'op': 'guardarNotaTurno',
                'idAgenda': this.agenda.id,
                'idTurno': idTurno,
                'textoNota': nota
            };

            this.serviceAgenda.patch(this.agenda.id, patch).subscribe(resultado => {
                this.plex.alert('La Nota se guardó correctamente');

                this.resultado = resultado;
                // this.pacientes.length = 0;
                // debugger;
                // this.pacientesSeleccionados;
                this.saveAgregarNotaTurno.emit(this.resultado);
            },
                err => {
                    if (err) {
                        console.log(err);
                    }
                });
    }

    cancelar() {
        this.cancelaAgregarNota.emit(true);
    }

    constructor(public plex: Plex, public serviceAgenda: AgendaService) { }
}