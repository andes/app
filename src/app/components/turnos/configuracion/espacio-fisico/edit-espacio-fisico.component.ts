import { Plex } from 'andes-plex/src/lib/core/service';
import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Rx';

import { IEspacioFisico } from './../../../../interfaces/turnos/IEspacioFisico';
import { EspacioFisicoService } from './../../../../services/turnos/espacio-fisico.service';
import { OrganizacionService } from './../../../../services/organizacion.service';

@Component({
    selector: 'edit-espacio-fisico',
    templateUrl: 'edit-espacio-fisico.html',
})

export class EditEspacioFisicoComponent implements OnInit {
    @Input('selectedEspacioFisico') espacioFisicoHijo: IEspacioFisico;

    @Output()
    data: EventEmitter<IEspacioFisico> = new EventEmitter<IEspacioFisico>();
    public modelo: any = {};
    public edif: any = {};
    constructor(public plex: Plex, public EspacioFisicoService: EspacioFisicoService, public OrganizacionService: OrganizacionService) { }

    ngOnInit() {
        let nombre = this.espacioFisicoHijo ? this.espacioFisicoHijo.nombre : '';
        let descripcion = this.espacioFisicoHijo ? this.espacioFisicoHijo.descripcion : '';
        let edificio = this.espacioFisicoHijo ? this.espacioFisicoHijo.edificio : '';
        let detalle = this.espacioFisicoHijo ? this.espacioFisicoHijo.detalle : '';
        let activo = this.espacioFisicoHijo ? this.espacioFisicoHijo.activo : true;
        this.modelo = { nombre: nombre, descripcion: descripcion, activo: activo, edificio: edificio, detalle: detalle };
    }

    loadEdificios(event) {
        this.OrganizacionService.getById('57e9670e52df311059bc8964').subscribe(respuesta => {event.callback(respuesta.edificio); });
    }

    onClick(modelo: IEspacioFisico) {
        let estOperation: Observable<IEspacioFisico>;
        if (this.espacioFisicoHijo) {
            modelo.id = this.espacioFisicoHijo.id;
            estOperation = this.EspacioFisicoService.put(modelo);
        } else {
            estOperation = this.EspacioFisicoService.post(modelo);
        }
        estOperation.subscribe(resultado => this.data.emit(resultado));
    }

    onCancel() {
        this.data.emit(null);
        return false;
    }
}
