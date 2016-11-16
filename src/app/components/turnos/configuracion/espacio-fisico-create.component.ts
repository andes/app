import { PlexService } from 'andes-plex/src/lib/core/service';
import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Rx';

import { IEspacioFisico } from './../../../interfaces/turnos/IEspacioFisico';
import { EspacioFisicoService } from './../../../services/turnos/espacio-fisico.service';

@Component({
    selector: 'espacio-fisico-create',
    templateUrl: 'espacio-fisico-create.html',
})

export class EspacioFisicoCreateComponent implements OnInit {


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

    onCancel() {
        this.data.emit(null);
        return false;
    }
}