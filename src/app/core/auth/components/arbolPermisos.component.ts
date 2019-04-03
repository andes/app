import { ITipoPrestacion } from '../../../interfaces/ITipoPrestacion';
import { Component, Output, EventEmitter, Input, ViewChildren, QueryList, OnChanges, AfterViewInit, ViewChild } from '@angular/core';
import { PlexPanelComponent } from '@andes/plex/src/lib/accordion/panel.component';
import { OrganizacionService } from '../../../services/organizacion.service';
import { IPermiso } from '../interfaces/IPermiso';
let shiroTrie = require('shiro-trie');

@Component({
    selector: 'arbolPermisos',
    templateUrl: 'arbolPermisos.html'
})

export class ArbolPermisosComponent implements OnChanges, AfterViewInit {

    private shiro = shiroTrie.new();
    public state = false;
    public all;
    /**
     * ITipoPrestaciones[] o IOrganizacion[] seleccionadas
     * @memberof ArbolPermisosComponent
     */
    public seleccionados = [];
    public allModule = false;
    /**
     * Permisos del usuario antes de comenzar a editarlos
     * @private
     * @type {string[]}
     * @memberof ArbolPermisosComponent
     */
    private permisosOriginales: String[] = [];
    @Input() item: IPermiso;

    @Input() parentPermission: String = '';
    @Input() userPermissions: String[] = [];
    /**
     * Todas las prestaciones turneables. De este arreglo se obtienen los nombres de las prestaciones dado un id. Es necesario que sea diferente de null
     * @type {ITipoPrestacion[]}
     * @memberof ArbolPermisosComponent
     */
    @Input() prestacionesTurneables: ITipoPrestacion[];
    /**
     * Sirve para notificar que se modificó la selección de permisos, para poder actualizar el listado de perfiles asignados
     * @memberof ArbolPermisosComponent
     */
    @Output() seleccionPermiso = new EventEmitter<{ checked: boolean, permiso: string }>();
    @ViewChild('panel') accordions: PlexPanelComponent;
    @ViewChildren(ArbolPermisosComponent) childsComponents: QueryList<ArbolPermisosComponent>;
    ngAfterViewInit() {
    }

    constructor(
        private organizacionService: OrganizacionService
    ) { }

    expand($event) {
        if ($event) {
            if (this.allModule) {
                this.accordions.active = false;
            } else {
                let index = this.userPermissions.findIndex(s => s === this.makePermission() + ':*');
                if (index >= 0) {
                    this.userPermissions.splice(index, 1);
                    this.userPermissions = [...this.userPermissions];
                }
            }
        }
    }

    public ngOnChanges() {
        this.refresh();
        this.permisosOriginales = [...this.userPermissions];
    }

    refresh() {
        this.initShiro();
        if (this.item.type) { // si tiene type es porque es hoja
            if (this.item.type === 'boolean') {
                this.state = this.shiro.check(this.makePermission() + ':?');
            } else {
                let permisos = this.makePermission();
                let items: String[] = this.shiro.permissions(permisos + ':?');
                if (items.length > 0) {
                    if (items.indexOf('*') >= 0) {
                        this.all = true;
                    } else {
                        this.all = false;
                        // [TODO] Buscar según el tipo
                        switch (this.item.type) {
                            case 'prestacion':
                                let prestaciones: ITipoPrestacion[] = [];
                                items.forEach((item: string) => {
                                    let prestacion = this.prestacionesTurneables.find((prest: ITipoPrestacion) => {
                                        return prest.id === item;
                                    });
                                    prestaciones.push(prestacion);
                                });
                                this.seleccionados = prestaciones;
                                break;
                            case 'organizacion':
                                this.organizacionService.get({ ids: items }).subscribe((data) => {
                                    this.seleccionados = [...data];
                                });
                                break;
                        }
                    }
                }
            }
        } else { // tiene hijos
            let permisos = this.makePermission();
            let items: String[] = this.shiro.permissions(permisos + ':?');
            this.allModule = items.length > 0 && items.indexOf('*') >= 0;
        }
    }

    selectChange(event) {
        let prefijo = '';
        switch (this.parentPermission) {
            case 'rup':
                prefijo = 'rup:tipoPrestacion';
                break;
            case 'turnos:planificarAgenda':
                prefijo = 'turnos:planificarAgenda:prestacion';
                break;
            case 'turnos:darTurnos':
                prefijo = 'turnos:darTurnos:prestacion';
                break;
            case 'solicitudes':
                prefijo = 'solicitudes:tipoPrestacion';
                break;
            case 'tm:organizacion':
                prefijo = 'tm:organizacion:sectores';
        }
        let arrayIdSelect = [];
        if (this.seleccionados) { // esto lo hago porque trae duplicados algunas prestaciones TODO: arreglar de raiz (ver por que se ponen dos veces)
            let selectSinRepetir = [];
            this.seleccionados.forEach(elem => {
                if (arrayIdSelect.indexOf(elem.id) === -1) {
                    arrayIdSelect.push(elem.id);
                    selectSinRepetir.push(elem);
                }
            });
            this.seleccionados = [...selectSinRepetir];
        }

        let arrayIdPrestacionesOriginales = [];
        let i = 0;
        let permiso;
        while (i < this.permisosOriginales.length) {
            permiso = this.permisosOriginales[i];
            if (permiso.substr(0, prefijo.length) === prefijo) {
                arrayIdPrestacionesOriginales.push(permiso.substr(prefijo.length + 1)); // +1 por los dos puntos
            } else if (arrayIdPrestacionesOriginales.length > 0) { // como los permisos estan ordenados, puedo cortar si ya se dejaron de encontrar permisos que cumplan el prefijo
                break;
            }
            i++;
        }

        let arrayIdPrestacionesModificadas = null;
        let cantSeleccionados = this.seleccionados ? this.seleccionados.length : 0;
        if (cantSeleccionados > arrayIdPrestacionesOriginales.length) { // si agrego prestacion
            arrayIdPrestacionesModificadas = arrayIdSelect.filter(id => {
                return arrayIdPrestacionesOriginales.indexOf(id) === -1; // devuelve los que no tiene
            });
        } else if (cantSeleccionados < arrayIdPrestacionesOriginales.length) { // si quito prestacion
            arrayIdPrestacionesModificadas = arrayIdPrestacionesOriginales.filter(id => {
                return arrayIdSelect.indexOf(id) === -1; // devuelve los que no tiene
            });
        } // si es igual no hago nada

        if (arrayIdPrestacionesModificadas) {
            arrayIdPrestacionesModificadas.forEach(id => {
                let json = {
                    checked: cantSeleccionados > arrayIdPrestacionesOriginales.length,
                    permiso: prefijo + ':' + id
                };
                this.seleccionPermiso.emit(json);
            });
        }
    }
    loadData(type, event) {
        // TODO: Agregar parametros de busqueda en el JSON de permisos. Ej: { turneable: 1 }
        // TODO: Filtrar otras tipos de datos
        switch (type) {
            case 'prestacion':
                let query: any = {};
                if (event.query) {
                    query.term = event.query;
                    let prestacionesFiltradas = this.prestacionesTurneables.filter((prestacion: ITipoPrestacion) => {
                        return prestacion.term === query.term;
                    });
                    // this.servicioTipoPrestacion.get(query).subscribe((data) => {
                    //     data = [...data, ...this.seleccionados || []];
                    //     event.callback(data);
                    // });
                    event.callback([prestacionesFiltradas, ...this.seleccionados]);
                } else {
                    event.callback([...this.prestacionesTurneables, ...this.seleccionados]); // TODO: por que agrega el seleccionados?
                }

                break;
        }
    }



    private initShiro() {
        this.shiro.reset();
        this.seleccionados = []; // borro los permisos que no son booleanos (los select de tipo prestación y organización)
        this.shiro.add(this.userPermissions);
    }

    private makePermission() {
        return this.parentPermission + (this.parentPermission.length ? ':' : '') + this.item.key;
    }

    public generateString(): String[] {
        let results = [];
        if (this.allModule) {
            return [this.makePermission() + ':*'];
        }
        if (this.item.child && this.childsComponents) {
            this.childsComponents.forEach(child => {
                results = [...results, ...child.generateString()];
            });
            return results;
        } else {
            if (this.item.type === 'boolean') {
                if (this.state) {
                    return [this.makePermission()];
                }
            } else {
                if (this.all) {
                    return [this.makePermission() + ':*'];
                }

                let lists = [];
                if (this.seleccionados) {
                    this.seleccionados.forEach(item => {
                        lists.push(this.makePermission() + ':' + item._id);
                    });
                }

                return lists;
            }
        }
        return [];
    }

    /**
     * Indica al componente padre que se (des)activó un permiso
     * @param {*} event
     * @memberof ArbolPermisosComponent
     */
    tildarPermiso(event: any) {
        if (!event.permiso) { // TODO: no manejar con event.value porque es de javascript y no angular
            // this.seleccionPermiso.emit({ checked: event.value, permiso: this.item.key });
            let permiso = '';
            if (this.parentPermission !== '') {
                permiso += this.parentPermission + ':';
            }
            permiso += this.item.key;
            if (this.item.child) {
                permiso += ':*';
            }
            this.seleccionPermiso.emit({ checked: event.value, permiso: permiso });
        } else {
            this.seleccionPermiso.emit(event); // vino de una selección
        }
    }
}
