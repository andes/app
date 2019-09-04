import { Component, Input, ViewChildren, QueryList, OnChanges, AfterViewInit, ViewChild, OnInit, Output, EventEmitter } from '@angular/core';
import { PlexPanelComponent } from '@andes/plex/src/lib/accordion/panel.component';
import { OrganizacionService } from '../../../../services/organizacion.service';
import { TipoPrestacionService } from '../../../../services/tipoPrestacion.service';
// import { IPermiso } from '../interfaces/IPermiso';
let shiroTrie = require('shiro-trie');

type IPermiso = any;

@Component({
    selector: 'arbol-permisos-item',
    templateUrl: 'arbol-permisos-item.component.html'
})

export class ArbolPermisosItemComponent implements OnInit, OnChanges, AfterViewInit {

    private shiro = shiroTrie.new();
    private state = false;
    private all = false;
    private seleccionados = [];
    private allModule = false;
    public itemsCount = 0;

    @Input() item: any;

    @Input() parentPermission: String = '';
    @Input() userPermissions: String[] = [];

    @Output() change = new EventEmitter();

    @ViewChild('panel') accordions: PlexPanelComponent;
    @ViewChildren(ArbolPermisosItemComponent) childsComponents: QueryList<ArbolPermisosItemComponent>;

    ngAfterViewInit() {
    }

    constructor(
        private servicioTipoPrestacion: TipoPrestacionService,
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
        this.change.emit();
    }

    public ngOnInit() {
        this.refresh();
    }

    public ngOnChanges() {
        this.refresh();
    }

    refresh() {
        this.initShiro();
        if (this.item.type) {
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
                                this.servicioTipoPrestacion.get({ id: items }).subscribe((data) => {
                                    this.seleccionados = [...data];
                                });
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
        } else {
            let permisos = this.makePermission();
            let items: String[] = this.shiro.permissions(permisos + ':?');
            this.itemsCount = items.length;
            this.allModule = items.length > 0 && items.indexOf('*') >= 0;
        }
    }

    selectChange() {
        this.change.emit();
        // console.log(this.seleccionados);
    }

    loadData(type, event) {
        // [TODO] Agregar parametros de busqueda en el JSON de permisos. Ej: { turneable: 1 }
        // [TODO] Filtrar otras tipos de datos
        let query: any = {};
        if (!event.query || event.query.length === 0) {
            return event.callback(this.seleccionados);
        }
        switch (type) {
            case 'prestacion':
                query.term = event.query;
                this.servicioTipoPrestacion.get(query).subscribe((data) => {
                    data = [...data, ...this.seleccionados || []];
                    event.callback(data);
                });
                break;
            case 'organizacion':
                this.organizacionService.get({ nombre: event.query }).subscribe((data) => {
                    event.callback(data);
                });
                break;
        }
    }



    private initShiro() {
        this.shiro.reset();
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

}
