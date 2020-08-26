import { Component, Input, ViewChildren, QueryList, OnChanges, AfterViewInit, ViewChild, OnInit, Output, EventEmitter } from '@angular/core';
import { PlexPanelComponent } from '@andes/plex/src/lib/accordion/panel.component';
import { OrganizacionService } from '../../../../services/organizacion.service';
import { TipoPrestacionService } from '../../../../services/tipoPrestacion.service';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
// import { IPermiso } from '../interfaces/IPermiso';
let shiroTrie = require('shiro-trie');

type IPermiso = any;

@Component({
    selector: 'arbol-permisos-item',
    templateUrl: 'arbol-permisos-item.component.html'
})

export class ArbolPermisosItemComponent implements OnInit, OnChanges, AfterViewInit {

    private shiro = shiroTrie.new();
    public state = false;
    public all = false;
    public seleccionados = [];
    public seleccionadosJson = '';
    public allModule = false;
    public itemsCount = 0;
    public loading = true;

    @Input() item: any;

    @Input() parentPermission: String = '';
    @Input() userPermissions: String[] = [];

    @ViewChild('panel', { static: false }) accordions: PlexPanelComponent;
    @ViewChildren(ArbolPermisosItemComponent) childsComponents: QueryList<ArbolPermisosItemComponent>;

    ngAfterViewInit() {
    }

    constructor(
        private servicioTipoPrestacion: TipoPrestacionService,
        private organizacionService: OrganizacionService,
        private auth: Auth,
        public plex: Plex
    ) { }

    get isHidden() {
        if (this.item.visibility) {
            if (this.item.visibility === 'hidden') {
                return true;
            } else if (this.item.visibility === 'restricted') {
                const permitido = this.auth.getPermissions(this.makePermission() + ':?').length > 0;
                return !permitido;
            }
        }
        return false;
    }
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

    removeInnerPermissions() {
        const checker = shiroTrie.new();
        checker.add(this.makePermission() + ':*');
        for (let i = 0; i < this.userPermissions.length; i++) {
            if (checker.check(this.userPermissions[i])) {
                this.userPermissions.splice(i, 1);
                i--;
            }
        }
        this.userPermissions = [...this.userPermissions];
    }

    public ngOnInit() {
        this.refresh();
    }

    public ngOnChanges() {
        this.refresh();
    }

    public parseSelecionados() {
        this.seleccionadosJson = JSON.stringify(this.seleccionados);
    }

    public onPaste(event: ClipboardEvent) {
        if (this.item.type === 'prestacion') {
            try {
                let clipboardData = event.clipboardData;
                let pastedText = clipboardData.getData('text');
                if (!this.seleccionados) {
                    this.seleccionados = [];
                }
                let arrayPrestaciones = this.seleccionados.concat(JSON.parse(pastedText));
                let setPrestaciones = new Map();
                arrayPrestaciones.forEach(prestacion => {
                    setPrestaciones.set(prestacion._id, prestacion);
                });
                this.seleccionados = [...setPrestaciones.values()];
                this.parseSelecionados();
            } catch (e) {
                this.plex.info('danger', 'Solo se permite pegar prestaciones válidas');
            }
        }
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
                        this.loading = false;
                    } else {
                        this.all = false;
                        this.loading = true;
                        // [TODO] Buscar según el tipo
                        switch (this.item.type) {
                            case 'prestacion':
                                this.servicioTipoPrestacion.get({ id: items }).subscribe((data) => {
                                    this.loading = false;
                                    this.seleccionados = [...data];
                                    this.parseSelecionados();
                                });
                                break;
                            case 'organizacion':
                                this.organizacionService.get({ ids: items }).subscribe((data) => {
                                    this.loading = false;
                                    this.seleccionados = [...data];
                                    this.parseSelecionados();
                                });
                                break;
                        }
                    }
                } else {
                    this.seleccionados = [];
                    this.loading = false;
                }
            }
        } else {
            let permisos = this.makePermission();
            let items: String[] = this.shiro.permissions(permisos + ':?');
            this.itemsCount = items.length;
            this.allModule = items.length > 0 && items.indexOf('*') >= 0;
        }
    }

    loadData(type, event) {
        // [TODO] Agregar parametros de busqueda en el JSON de permisos. Ej: { turneable: 1 }
        // [TODO] Filtrar otras tipos de datos
        let query: any = {};
        if (!event.query || event.query.length === 0) {
            return event.callback([...this.seleccionados]);
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
