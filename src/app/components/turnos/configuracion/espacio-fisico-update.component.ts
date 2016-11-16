import { PlexService } from 'andes-plex/src/lib/core/service';
import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Rx';

import { IEspacioFisico } from './../../../interfaces/turnos/IEspacioFisico';
import { EspacioFisicoService } from './../../../services/turnos/espacio-fisico.service';

@Component({
    selector: 'espacio-fisico-update',
    templateUrl: 'espacio-fisico-update.html',
})

export class EspacioFisicoUpdateComponent implements OnInit {
    @Input('selectedEspacioFisico') espacioFisicoHijo: IEspacioFisico;

    @Output()
    data: EventEmitter<IEspacioFisico> = new EventEmitter<IEspacioFisico>();
    public modelo: any = {};

    constructor(public plex: PlexService, public EspacioFisicoService: EspacioFisicoService) { }

    ngOnInit() {
        debugger;        
        this.modelo = { nombre: this.espacioFisicoHijo.nombre, descripcion: this.espacioFisicoHijo.descripcion, activo: this.espacioFisicoHijo.activo };
    }

    onClick(modelo: IEspacioFisico) {
        let estOperation: Observable<IEspacioFisico>;
        modelo.id = this.espacioFisicoHijo.id;
        estOperation = this.EspacioFisicoService.put(modelo);
        estOperation.subscribe(resultado => this.data.emit(resultado));
    }

      onCancel(){
        this.data.emit(null);
        return false;
    }
}