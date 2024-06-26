import { Component, Input, EventEmitter, Output, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';
import { IAgenda } from './../../../../interfaces/turnos/IAgenda';
import { AgendaService } from '../../../../services/turnos/agenda.service';

@Component({
    selector: 'agregar-nota-turno',
    templateUrl: 'agregar-nota-turno.html'
})

export class AgregarNotaTurnoComponent implements OnInit {

    @Input() agenda: IAgenda;

    @Output() saveAgregarNotaTurno = new EventEmitter<IAgenda>();

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
    public nota = '';
    public lenNota = 140;

    constructor(public plex: Plex, public serviceAgenda: AgendaService) { }

    ngOnInit() {
        this.turnosSeleccionados.forEach((turno, index) => {
            if (this.nota === '' || turno.nota === this.nota) {
                this.nota = turno.nota;
            } else {
                this.nota = null;
            }
        });
    }

    guardarNota() {

        let alertCount = 0;
        this.turnosSeleccionados.forEach((turno, index) => {

            const patch = {
                'op': 'guardarNotaTurno',
                'idAgenda': this.agenda.id,
                'idTurno': turno.id,
                'textoNota': this.nota
            };

            this.serviceAgenda.patch(this.agenda.id, patch).subscribe({

                next: resultado => {
                    if (alertCount === 0) {
                        if (this.turnosSeleccionados.length === 1) {
                            this.plex.toast('success', 'La nota se guardó correctamente.');
                        } else {
                            this.plex.toast('success', 'Las notas se guardaron correctamente.');
                        }
                        alertCount++;
                    }

                    this.agenda = resultado;
                    if (index === this.turnosSeleccionados.length - 1) {
                        this.saveAgregarNotaTurno.emit();
                    }
                },
                error: () => this.plex.toast('error', 'Error al cargar una o varias notas.')
            });

        });
    }

    verificarNota() {
        if (this.nota && this.nota.length > this.lenNota) {
            this.nota = this.nota.substring(0, this.lenNota);
        }
    }

}
