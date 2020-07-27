import { Auth } from '@andes/auth';
import { Location } from '@angular/common';
import { SnomedService } from '../../apps/mitos';
import { Plex } from '@andes/plex';
import { Component, OnInit, HostBinding } from '@angular/core';
import { OrganizacionService } from './../../services/organizacion.service';
import { ISectores } from './../../interfaces/IOrganizacion';
import { Router, ActivatedRoute } from '@angular/router';
import { ISnomedConcept } from '../../modules/rup/interfaces/snomed-concept.interface';
import { NgForm } from '@angular/forms';

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
    public nombreOrganizacion: String;
    public mapaSectores: any[];
    public selectedItem: any;

    constructor(
        private organizacionService: OrganizacionService,
        public plex: Plex,
        public snomed: SnomedService,
        private router: Router,
        private route: ActivatedRoute,
        private location: Location,
        private auth: Auth
    ) { }

    public unidadID: String = '2441000013103';
    public sectoresIniciales: any[] = [];
    public ambienteHospitalarioQuery: String = '^2391000013102';
    public unidadesOrganizativasQuery: String = '<<284548004';

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.idOrganizacion = params['id'];
            if (!this.auth.check('tm:organizacion:sectores')) {
                this.router.navigate(['inicio']);
            }
            this.organizacionService.getSectores(this.idOrganizacion).subscribe(org => {
                this.nombreOrganizacion = org.nombre;
                this.mapaSectores = org.mapaSectores;
            });
        });
    }

    /**
     * Devuelve se la organizacion tiene sectores
     */
    hasItems() {
        return this.mapaSectores && this.mapaSectores.length > 0;
    }

    /**
     * Vuelve atrás
     */
    volver() {
        this.location.back();
    }

    /**
     * Agrega un sector root
     */
    onAddParent() {
        this.disabledPanel = false;
    }

    /**
     * Habilita el plex-box de la derecha para agregar un item
     */
    addItem($event) {
        this.selectedItem = $event;
        this.disabledPanel = false;
    }

    /**
     * Habilita el plex-box de la derecha en modo edición.
     */
    editItem($event) {
        this.selectedItem = $event;
        this.disabledPanel = false;
        this.editing = true;

        this.itemName = $event.nombre;
        this.tipoSector = $event.tipoSector;
        this.unidadOrg = $event.unidadConcept;
    }


    /**
     * Remueve un item root
     */
    removeItem($event) {
        this.plex.confirm('¿Desea eliminarlo?', 'Eliminar Sector').then((confirmar) => {
            if (confirmar) {
                this.organizacionService.deleteSector(this.idOrganizacion, $event._id).subscribe(result => {
                    if (result === $event._id) {
                        let index = this.mapaSectores.findIndex((item) => item === $event);
                        this.mapaSectores.splice(index, 1);
                        this.plex.info('success', 'El sector fue eliminado', 'Sector eliminado!');
                    } else {
                        this.plex.info('danger', 'No se puede eliminar sector ya que hay camas asignadas.', 'No se puede eliminar');
                    }
                });
            }
        });
    }

    /**
     * Crea un sector item para agregar al arbol de sectores
     */
    createObject(): ISectores {
        if (!this.tipoSector) {
            return null;
        }
        if (this.unidadID !== this.tipoSector.conceptId) {
            return {
                nombre: this.itemName,
                tipoSector: this.tipoSector,
                hijos: []
            };
        } else {
            if (!this.unidadOrg) {
                return null;
            }
            return {
                nombre: this.unidadOrg.term,
                tipoSector: this.tipoSector,
                unidadConcept: this.unidadOrg,
                hijos: []
            };
        }
    }

    /**
     * Cancela el modo edición
     */
    onDissmis() {
        this.selectedItem = null;
        this.disabledPanel = true;
    }

    /**
     * Agrega un item al nodo seleccionado
     */
    onAdd(valid) {
        if (valid.formValid) {
            let item = this.createObject();
            if (!item) {
                return;
            }
            if (this.editing) {
                this.selectedItem.nombre = item.nombre;
                this.selectedItem.tipoSector = item.tipoSector;
                this.selectedItem.unidadOrg = item.unidadConcept;
                item = this.selectedItem;
            } else {
                if (this.selectedItem) {
                    this.selectedItem.hijos.push(item);
                    item = this.selectedItem;
            } else {
                    this.mapaSectores.push(item);
                    this.mapaSectores = [...this.mapaSectores];
                }
            }

            this.organizacionService.patchSector(this.idOrganizacion, item, item.unidadConcept, this.editing).subscribe(mapaSectores => {
                this.plex.info('success', 'El sector fue guardado', 'Sector guardado!');
                this.mapaSectores = mapaSectores;
                this.editing = false;
                this.disabledPanel = true;
                this.selectedItem = null;
                this.clearForm();
            });
        } else {
            this.plex.info('info', 'ERROR: Los datos de requeridos no estan completos');
            return;
        }
    }

    /**
     * Limpia el form del panel derecho
     */
    clearForm() {
        this.itemName = '';
        this.tipoSector = null;
        this.unidadOrg = null;

    }
}
