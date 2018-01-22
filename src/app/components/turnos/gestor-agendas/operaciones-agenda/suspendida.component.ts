import { Component, Input, EventEmitter, Output, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';
import { IAgenda } from './../../../../interfaces/turnos/IAgenda';
import { ITurno } from './../../../../interfaces/turnos/ITurno';
import { EstadosAgenda } from './../../enums';



@Component({
    selector: 'suspendida',
    templateUrl: 'suspendida.html'
})

export class SuspendidaComponent implements OnInit {

    @Input() agenda: IAgenda;
    @Input() cerrar: boolean;
    @Output() cancelaSuspenderAgenda = new EventEmitter<boolean>();

    constructor(public plex: Plex) { }

    public motivoSuspensionSelect = { select: null };
    public motivoSuspension: { id: number; nombre: string; }[];
    public estadosAgenda = EstadosAgenda;
    public ag;
    public showData = false;
    public showConfirmar = true;
    public turnos = [];
    ngOnInit() {
        if (this.cerrar) {
            this.cancelar();
        } else {
            this.motivoSuspension = [{
                id: 1,
                nombre: 'edilicia'
            }, {
                id: 2,
                nombre: 'profesional'
            },
            {
                id: 3,
                nombre: 'organizacion'
            }];
            this.motivoSuspensionSelect.select = this.motivoSuspension[1];

            this.confirmar();
        }
    }

    confirmar() {
        this.showConfirmar = true;
    }

    suspenderTurno() {
        this.showConfirmar = false;
        this.showData = true;
    }

    cancelar() {
        this.showConfirmar = false;
        this.showData = false;
        this.cancelaSuspenderAgenda.emit(true);
    }
}
