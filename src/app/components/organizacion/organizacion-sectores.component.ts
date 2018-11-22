import { SnomedService } from './../../services/term/snomed.service';
import { Plex } from '@andes/plex';
import { Component, OnInit, HostBinding } from '@angular/core';
import { OrganizacionService } from './../../services/organizacion.service';
import { IOrganizacion, ISectores } from './../../interfaces/IOrganizacion';
import { Router, ActivatedRoute } from '@angular/router';
import { ISnomedConcept } from '../../modules/rup/interfaces/snomed-concept.interface';
import { CamasService } from '../../modules/rup/services/camas.service';

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
        public plex: Plex,
        public snomed: SnomedService,
        private router: Router,
        public CamaService: CamasService,
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


    /**
     * Devuelve se la organizacion tiene sectores
     */

    hasItems() {
        return this.organizacion.mapaSectores && this.organizacion.mapaSectores.length > 0;
    }

    /**
     * Grabar los cambios de la organización
     */
    onSave() {
        this.organizacionService.save(this.organizacion).subscribe(() => {
            this.router.navigate(['/tm/organizacion']);
        });
    }

    /**
     * Vuelve al listado de organizaciones
     */

    onCancel() {
        this.router.navigate(['tm/organizacion']);
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
        if ($event.id) {
            this.CamaService.camaXsector($event.id).subscribe(camas => {
                if (camas.length <= 0) {
                    this.plex.confirm('¿Desea eliminarlo?', 'Eliminar Sector').then((confirmar) => {
                        let index = this.organizacion.mapaSectores.findIndex((item) => item === $event);
                        if (confirmar && index >= 0) {
                            this.organizacion.mapaSectores.splice(index, 1);
                        }
                    });
                } else {
                    this.plex.info('warning', 'El sector contiene camas', 'No se puede borrar');
                }
            });
        } else {
            this.plex.confirm('¿Está seguro que desea eliminar el sector?', 'Eliminar Sector').then((confirmar) => {
                let index = this.organizacion.mapaSectores.findIndex((item) => item === $event);
                if (confirmar && index >= 0) {
                    this.organizacion.mapaSectores.splice(index, 1);
                }
            });
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
        this.clearForm();
        this.selectedItem = null;
        this.disabledPanel = true;
    }

    /**
     * Agrega un item al nodo seleccionado
     */

    onAdd() {
        let item = this.createObject();
        if (!item) {
            return;
        }
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
                this.organizacion.mapaSectores.push(item);
                this.organizacion.mapaSectores = [...this.organizacion.mapaSectores];
            }
        }
        this.disabledPanel = true;
        this.selectedItem = null;
        this.clearForm();
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
