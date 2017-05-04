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

    @Output() saveAgregarNotaTurno = new EventEmitter<IAgenda>();
    @Output() cancelaAgregarNota = new EventEmitter<boolean>();

    private _turnosSeleccionados: Array<any>;

    @Input('turnosSeleccionados')
    set turnosSeleccionados(value: any) {
        this._turnosSeleccionados = value;
    }
    get turnosSeleccionados(): any {
        return this._turnosSeleccionados;
    }

    public modelo: any;
    public resultado: any;

    constructor(public plex: Plex, public serviceAgenda: AgendaService) { }

    ngOnInit() {
        console.log('this.turnosSeleccionados: ', this.turnosSeleccionados);
    }

    guardarNota() {

        let alertCount = 0;
        this.turnosSeleccionados.forEach((turno, index) => {

            let patch = {
                'op': 'guardarNotaTurno',
                'idAgenda': this.agenda.id,
                'idTurno': turno.id,
                'textoNota': turno.nota
            };

            this.serviceAgenda.patch(this.agenda.id, patch).subscribe(resultado => {

                if ( alertCount === 0 ) {
                    if ( this.turnosSeleccionados.length === 1 ) {
                        this.plex.alert('La Nota se guardó correctamente');
                    } else {
                        this.plex.alert('Las Notas se guardaron correctamente');
                    }
                    alertCount++;
                }

                this.agenda = resultado;
            },
                err => {
                    if (err) {
                        console.log(err);
                    }
                });

            if ( index === this.turnosSeleccionados.length - 1 ) {
                this.saveAgregarNotaTurno.emit(this.agenda);
            }
        });
    }

    cancelar() {
        this.cancelaAgregarNota.emit(true);
    }

}