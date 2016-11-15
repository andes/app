import { PlexService } from 'andes-plex/src/lib/core/service';
import { Component, EventEmitter, Output } from '@angular/core';
import { Observable } from 'rxjs/Rx';

import { IEspacioFisico } from './../../../interfaces/turnos/IEspacioFisico';
import { EspacioFisicoService } from './../../../services/turnos/espacio-fisico.service';

@Component({
    templateUrl: 'espacio-fisico-create.html',
})

export class EspacioFisicoComponent {
    @Output() data: EventEmitter<IEspacioFisico> = new EventEmitter<IEspacioFisico>();
    public modelo: any = {};

    constructor(public plex: PlexService, public servicioConfig: EspacioFisicoService,
        public EspacioFisicoService: EspacioFisicoService) { }

    ngOnInit() {
        this.modelo = { activo: true };
        this.modelo = { nombre: "", descripcion: "" };
    }

    onClick(modelo: IEspacioFisico) {
        let estOperation: Observable<IEspacioFisico>;

        estOperation = this.EspacioFisicoService.post(modelo);
        estOperation.subscribe(resultado => this.data.emit(resultado));
    }
}