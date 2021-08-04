import { Component, EventEmitter, Output, Input, OnInit, HostBinding } from '@angular/core';
import { Observable } from 'rxjs';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { Unsubscribe } from '@andes/shared';
import { IEspacioFisico } from './../../../../interfaces/turnos/IEspacioFisico';
import { EspacioFisicoService } from './../../../../services/turnos/espacio-fisico.service';
import { OrganizacionService } from './../../../../services/organizacion.service';
import * as enumerados from './../../../../utils/enumerados';
import { Router } from '@angular/router';
import { SnomedService } from '../../../../apps/mitos';

@Component({
    selector: 'edit-espacio-fisico',
    templateUrl: 'edit-espacio-fisico.html',
    styleUrls: [
        'edit-espacio-fisico.scss'
    ]
})

export class EditEspacioFisicoComponent implements OnInit {
    estados: (string | any[])[];
    @HostBinding('class.plex-layout') layout = true; // Permite el uso de flex-box en el componente
    @Input() espacioFisicoHijo: IEspacioFisico;
    @Output() data: EventEmitter<IEspacioFisico> = new EventEmitter<IEspacioFisico>();

    /**
     * Devuelve un elemento seleccionado en el buscador SNOMED.
     */
    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();

    public modelo: any = {};
    public edif: any = {};
    public autorizado: boolean;
    constructor(private SNOMED: SnomedService, public plex: Plex, private router: Router, public espacioFisicoService: EspacioFisicoService, public organizacionService: OrganizacionService,
                public auth: Auth) { }

    ngOnInit() {
        this.autorizado = this.auth.check('turnos:*') || this.auth.check('turnos:editarEspacio');
        if (!this.autorizado) {
            this.router.navigate(['./inicio']);
        }
        let nombre = this.espacioFisicoHijo ? this.espacioFisicoHijo.nombre : '';
        let descripcion = this.espacioFisicoHijo ? this.espacioFisicoHijo.descripcion : '';
        let edificio = this.espacioFisicoHijo ? this.espacioFisicoHijo.edificio : '';
        let sector = this.espacioFisicoHijo ? this.espacioFisicoHijo.sector : '';
        let servicio = this.espacioFisicoHijo ? this.espacioFisicoHijo.servicio : '';
        let detalle = this.espacioFisicoHijo ? this.espacioFisicoHijo.detalle : '';
        let activo = this.espacioFisicoHijo ? this.espacioFisicoHijo.activo : true;
        let equipamiento = this.espacioFisicoHijo ? this.espacioFisicoHijo.equipamiento : [];
        let estado = this.espacioFisicoHijo ? this.espacioFisicoHijo.estado : '';
        // this.modelo = { nombre, descripcion, activo, edificio, detalle, servicio, sector, equipamiento };
        this.modelo = { nombre, descripcion, activo, estado, edificio, detalle, equipamiento };
        if (servicio && servicio !== '') {
            this.modelo['servicio'] = servicio;
        }

        if (sector && sector !== '') {
            this.modelo['sector'] = sector;
        }
    }

    loadEdificios(event) {
        this.organizacionService.getById(this.auth.organizacion.id).subscribe(respuesta => {
            event.callback(respuesta.edificio);
        });
    }

    loadSectores(event) {
        // let sectores = [];
        this.espacioFisicoService.get({ organizacion: this.auth.organizacion.id }).subscribe(respuesta => {
            let sectores = respuesta.map((ef) => {
                return (typeof ef.sector !== 'undefined' && ef.sector.nombre !== '-' ? ef.sector : []);
            }).filter((elem, index, self) => {
                return index === self.indexOf(elem);
            });
            event.callback(sectores || []);

        });
    }

    loadServicios(event) {
        let servicios = [];
        this.espacioFisicoService.get({ organizacion: this.auth.organizacion.id }).subscribe(respuesta => {
            servicios = respuesta.map((ef) => {
                return (typeof ef.servicio !== 'undefined' ? ef.servicio : []);
            });
            event.callback(servicios || []);
        });
    }

    loadEstados(event) {
        event.callback(enumerados.getEstadosEspacios());
    }

    guardar(form) {
        if (form.formValid) {
            let estOperation: Observable<IEspacioFisico>;
            this.modelo.organizacion = this.auth.organizacion;
            this.modelo.estado = this.modelo.estado ? this.modelo.estado.id : 'disponible';

            if (this.espacioFisicoHijo) {
                this.modelo.id = this.espacioFisicoHijo.id;
                estOperation = this.espacioFisicoService.put(this.modelo);
            } else {
                estOperation = this.espacioFisicoService.post(this.modelo);
            }
            estOperation.subscribe(resultado => this.data.emit(resultado));
        }
    }

    onCancel() {
        this.data.emit(null);
        return false;
    }

    @Unsubscribe()
    buscarEquipamiento(event) {
        if (event.query && event.query.length > 3) {
            if (event.query.match(/^\s{1,}/)) {
                event.query = '';
                return;
            }
            this.SNOMED.get({ search: event.query, semanticTag: ['objeto físico'] }).subscribe(res => {
                event.callback(res);
            });
        } else {
            event.callback(this.modelo.equipamiento);
        }
    }
}
