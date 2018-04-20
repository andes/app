import { SnomedService } from './../../services/term/snomed.service';
import { Plex } from '@andes/plex';
import { Server } from '@andes/shared';
import { Observable } from 'rxjs/Rx';
import { Component, OnInit, Output, EventEmitter, Input, HostBinding } from '@angular/core';
import * as enumerados from './../../utils/enumerados';
// Services
import { BarrioService } from './../../services/barrio.service';
import { TipoEstablecimientoService } from './../../services/tipoEstablecimiento.service';
import { OrganizacionService } from './../../services/organizacion.service';
import { PaisService } from './../../services/pais.service';
import { ProvinciaService } from './../../services/provincia.service';
import { LocalidadService } from './../../services/localidad.service';
// Interfaces
import { IPais } from './../../interfaces/IPais';
import { IBarrio } from './../../interfaces/IBarrio';
import { ILocalidad } from './../../interfaces/ILocalidad';
import { IUbicacion } from './../../interfaces/IUbicacion';
import { IEdificio } from './../../interfaces/IEdificio';
import { IDireccion } from './../../interfaces/IDireccion';
import { IContacto } from './../../interfaces/IContacto';
import { IOrganizacion, ISectores } from './../../interfaces/IOrganizacion';
import { ITipoEstablecimiento } from './../../interfaces/ITipoEstablecimiento';
import { IProvincia } from './../../interfaces/IProvincia';
import { Router, ActivatedRoute } from '@angular/router';
import { SectoresItemComponent } from './sectores-item/sectores-item.component';
import { ISnomedConcept } from '../../modules/rup/interfaces/snomed-concept.interface';

@Component({
    selector: 'organizacion-sectores',
    templateUrl: 'organizacion-sectores.html',
    styleUrls: ['organizacion-sectores.scss']
})
export class OrganizacionSectoresComponent implements OnInit {

    @HostBinding('class.plex-layout') layout = true;  // Permite el uso de flex-box en el componente

    // definición de arreglos
    public disabledPanel = true;
    public editing = false;

    public itemName: String;
    public tipoSector: ISnomedConcept;
    public unidadOrg: ISnomedConcept;

    public tiposSectores: ISnomedConcept[];

    public idOrganizacion: String;
    public organizacion: IOrganizacion;
    public selectedItem: any;

    constructor(
        private organizacionService: OrganizacionService,
        private tipoEstablecimientoService: TipoEstablecimientoService,
        public plex: Plex, private server: Server,
        public snomed: SnomedService,
        private router: Router,
        private route: ActivatedRoute
    ) { }

    public unidadID: String = '2441000013103';

    public ambienteHospitalarioQuery: String = '^2391000013102';
    public unidadesOrganizativasQuery: String = '<<284548004';

    ngOnInit() {
        this.loadSectores();
        this.route.params.subscribe(params => {
            this.idOrganizacion = params['id'];
            this.organizacionService.getById(this.idOrganizacion).subscribe(org => {
                this.organizacion = org;
            });
        });
    }

    /**
     * Funciones del plex-box de la izquierda
     */

    hasItems () {
        return this.organizacion.unidadesOrganizativas && this.organizacion.unidadesOrganizativas.length > 0;
    }

    onSave() {
        this.organizacionService.save(this.organizacion).subscribe(() => {
            console.log('Todo bien!');
        });
    }



    onCancel() {
        this.router.navigate(['tm/organizacion']);
    }

    onStart () {
        this.disabledPanel = false;
    }

    addItem($event) {
        this.selectedItem = $event;
        this.disabledPanel = false;
    }

    editItem($event) {
        this.selectedItem = $event;
        this.disabledPanel = false;
        this.editing = true;

        this.itemName = $event.nombre;
        this.tipoSector = $event.tipoSector;
        this.unidadOrg = $event.unidadConcept;
    }

    removeItem($event) {
        let index = this.organizacion.unidadesOrganizativas.findIndex((item) => item === $event);
        if (index >= 0) {
            this.organizacion.unidadesOrganizativas.splice(index, 1);
        }
    }

    /**
     * Funciones del plex-box de la derecha
     */

    loadUnidades($event) {
        this.snomed.getQuery({ expression: this.unidadesOrganizativasQuery }).subscribe(result => {
            $event.callback(result);
        });
    }

    loadSectores() {
        this.snomed.getQuery({ expression: this.ambienteHospitalarioQuery }).subscribe(result => {
            this.tiposSectores = result;
        });
    }


    onSectorChange() {

    }

    onUnidadChange() {

    }

    createObject (): ISectores {
        if (this.unidadID !== this.tipoSector.conceptId) {
            return  {
                nombre: this.itemName,
                tipoSector: this.tipoSector,
                hijos: []
            };
        } else {
            return {
                nombre: this.unidadOrg.term,
                tipoSector: this.tipoSector,
                unidadConcept: this.unidadOrg,
                hijos: []
            };
        }
    }

    onDissmis () {
        this.clearForm();
        this.selectedItem = null;
        this.disabledPanel = true;
    }

    onAdd() {
        let item = this.createObject();
        if (this.editing) {
            this.selectedItem.nombre = item.nombre;
            this.selectedItem.tipoSector = item.tipoSector;
            this.selectedItem.unidadOrg = item.unidadConcept;
            this.editing = false;
        } else {
            if (this.selectedItem) {
                this.selectedItem.hijos.push(item);
                // this.selectedItem.hijos = [...this.selectedItem.hijos];
            } else {
                this.organizacion.unidadesOrganizativas.push(item);
                this.organizacion.unidadesOrganizativas = [...this.organizacion.unidadesOrganizativas];
            }
        }
        this.disabledPanel = true;
        this.selectedItem = null;
        this.clearForm();
    }

    clearForm() {
        this.itemName = '';
        this.tipoSector = null;
        this.unidadOrg = null;

    }

}
