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
    @Input() turno: ITurno;

    @Output() saveAgregarNotaTurno = new EventEmitter<IAgenda>();
    @Output() cancelaAgregarNota = new EventEmitter<boolean>();

    showAgregarNotaTurno: boolean = true;
    public modelo: any;

    ngOnInit() {
        this.modelo = { nota: null };
    }

    guardarNota(agenda: any, turno: any) {
        let patch: any = {};
        debugger;
        patch = {
            'op': 'guardarNotaTurno',
            'idAgenda': agenda.id,
            'idTurno': turno.id,
            'textoNota': this.modelo.nota
        };

        this.serviceAgenda.patch(agenda.id, patch).subscribe(resultado => {

        },
            err => {
                if (err) {
                    console.log(err);
                }
            });
    }

    cancelar() {
        debugger;
        this.cancelaAgregarNota.emit(true);
    }
    constructor(public plex: Plex, public serviceAgenda: AgendaService) { }

}