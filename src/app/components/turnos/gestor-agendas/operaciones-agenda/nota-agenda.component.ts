import { Component, Input, EventEmitter, Output, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';
import { IAgenda } from './../../../../interfaces/turnos/IAgenda';
import { ITurno } from './../../../../interfaces/turnos/ITurno';
import { AgendaService } from '../../../../services/turnos/agenda.service';

@Component({
    selector: 'nota-agenda',
    templateUrl: 'nota-agenda.html'
})

export class AgregarNotaAgendaComponent implements OnInit {

    @Input() agenda: IAgenda;
    private _agendasSeleccionadas: Array<any>;

    @Input('agendasSeleccionadas')
    set agendasSeleccionadas(value: any) {
        this._agendasSeleccionadas = value;
    }
    get agendasSeleccionadas(): any {
        return this._agendasSeleccionadas;
    }

    @Output() saveAgregarNotaAgenda = new EventEmitter<IAgenda>();
    @Output() cancelaAgregarNotaAgenda = new EventEmitter<boolean>();

    showAgregarNotaAgenda: Boolean = true;

    public modelo: any;
    public resultado: any;
    public nota = '';
    public lenNota = 140;

    constructor(public plex: Plex, public serviceAgenda: AgendaService) { }

    ngOnInit() {
        this.agendasSeleccionadas.forEach((agenda, index) => {
            if (this.nota === '' || agenda.nota === this.nota) {
                this.nota = agenda.nota;
            } else {
                this.nota = null;
            }
        });
    }

    guardarNota() {
        let alertCount = 0;
        this.agendasSeleccionadas.forEach((agenda, index) => {
            let patch = {
                'op': 'notaAgenda',
                // 'nota': agenda.nota
                'nota': this.nota
            };

            this.serviceAgenda.patch(agenda.id, patch).subscribe(resultado => {
                if (alertCount === 0) {
                    if (this.agendasSeleccionadas.length === 1) {
                        this.plex.toast('success', 'La Nota se guardó correctamente');
                    } else {
                        this.plex.toast('success', 'Las Notas se guardaron correctamente');
                    }
                    alertCount++;
                }

                agenda = resultado;
                if (index === this.agendasSeleccionadas.length - 1) {
                    this.saveAgregarNotaAgenda.emit(agenda);
                }
            },
                err => {
                    if (err) {

                    }
                });

        });
    }

    verificarNota() {
        if (this.nota && this.nota.length > this.lenNota) {
            this.nota = this.nota.substring(0, this.lenNota);
        }
    }

    cancelar() {
        this.cancelaAgregarNotaAgenda.emit(true);
    }
}
