import { Component, Input, EventEmitter, Output, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';
import { IAgenda } from './../../../../interfaces/turnos/IAgenda';
import { ITurno } from './../../../../interfaces/turnos/ITurno';
import { EstadosAgenda } from './../../enums';
import { AgendaService } from '../../../../services/turnos/agenda.service';



@Component({
    selector: 'suspendida',
    templateUrl: 'suspendida.html'
})

export class SuspendidaComponent implements OnInit {


    @Input() agenda: IAgenda;
    @Output() cancelaSuspenderAgenda = new EventEmitter<boolean>();


    constructor(public plex: Plex, public serviceAgenda: AgendaService) { }

    public motivoSuspensionSelect = { select: null };
    public motivoSuspension: { id: number; nombre: string; }[];
    public estadosAgenda = EstadosAgenda;
    public ag;
    public showData = false;
    public showConfirmar = false;
    public turnos = [];
    ngOnInit() {
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

        (this.agenda.estado !== 'suspendida') ? this.showConfirmar = true : this.showData = true;
    }

    suspenderAgenda() {
        this.showConfirmar = false;
        this.showData = true;
        if (this.motivoSuspensionSelect.select.nombre === null) {
            return;
        }

        let patch = {
            'op': 'suspendida',
            'estado': 'suspendida'
        };

        this.serviceAgenda.patch(this.agenda.id, patch).subscribe((resultado: any) => {
            // Si son múltiples, esperar a que todas se actualicen
            this.agenda.estado = resultado.estado;
            this.plex.toast('success', 'Información', 'La agenda cambió el estado a Suspendida');
        });
        this.cancelaSuspenderAgenda.emit(true);

    }

    cancelar() {
        this.showConfirmar = false;
        this.showData = false;
        this.cancelaSuspenderAgenda.emit(true);
    }

}
