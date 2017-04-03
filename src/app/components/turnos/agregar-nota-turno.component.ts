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

    // @Input() turnosSeleccionados: ITurno[];

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


    showAgregarNotaTurno: Boolean = true;
    turnos: any = [];

    public modelo: any;
    public resultado: any;

    ngOnInit() {
        console.log('this.turnosSeleccionados: ', this.turnosSeleccionados);
        this.turnos = this.turnosSeleccionados;
    }

    guardarNota(turnos: any, idTurno) {

        let alertCount = 0;
        turnos.forEach((turno, index) => {

            let patch = {
                'op': 'guardarNotaTurno',
                'idAgenda': this.agenda.id,
                'idTurno': turno.id,
                'textoNota': turno.nota
            };

            this.serviceAgenda.patch(this.agenda.id, patch).subscribe(resultado => {

                if ( alertCount === 0 ) {
                    if ( turnos.length === 1 ) {
                        this.plex.alert('La Nota se guardó correctamente');
                    } else {
                        this.plex.alert('Las Notas se guardaron correctamente');
                    }
                    alertCount++;
                }

                this.resultado = resultado;

                this.saveAgregarNotaTurno.emit(this.resultado);
            },
                err => {
                    if (err) {
                        console.log(err);
                    }
                });
        });
    }

    cancelar() {
        this.cancelaAgregarNota.emit(true);
    }

    constructor(public plex: Plex, public serviceAgenda: AgendaService) { }
}