import { ZonaSanitariaService } from './../../../../services/zonaSanitaria.service';
import { GrupoPoblacionalService } from './../../../../services/grupo-poblacional.service';
import { Component, Input, ViewChildren, QueryList, OnChanges, AfterViewInit, ViewChild, OnInit, Inject, Optional, InjectionToken } from '@angular/core';
import { PlexPanelComponent } from '@andes/plex/src/lib/accordion/panel.component';
import { OrganizacionService } from '../../../../services/organizacion.service';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { QueriesService } from 'src/app/services/query.service';
import { ConceptosTurneablesService } from 'src/app/services/conceptos-turneables.service';
import { ServicioIntermedioService } from 'src/app/modules/rup/services/servicio-intermedio.service';
const shiroTrie = require('shiro-trie');

@Component({
    selector: 'arbol-permisos-item',
    templateUrl: 'arbol-permisos-item.component.html'
})

export class ArbolPermisosItemComponent implements OnInit, OnChanges {

    private shiro = shiroTrie.new();
    public state = false;
    public all = false;
    public seleccionados = [];
    public seleccionadosJson = '';
    public allModule = false;
    public itemsCount = 0;
    public loading = true;

    @Input() item: any;

    @Input() organizacion: string = null;
    @Input() parentPermission = '';
    @Input() userPermissions: string[] = [];

    @ViewChild('panel', { static: false }) accordions: PlexPanelComponent;
    @ViewChildren(ArbolPermisosItemComponent) childsComponents: QueryList<ArbolPermisosItemComponent>;

    constructor(
        private conceptosTurneablesService: ConceptosTurneablesService,
        private organizacionService: OrganizacionService,
        private queryService: QueriesService,
        private grupoPoblacionalService: GrupoPoblacionalService,
        private servicioIntermedio: ServicioIntermedioService,
        private zonaSanitariaService: ZonaSanitariaService,
        private auth: Auth,
        public plex: Plex
    ) { }

    get isHidden() {
        if (this.item.visibility) {
            if (this.item.visibility === 'hidden') {
                return true;
            } else {
                const permitido = this.auth.getPermissions(this.makePermission() + ':?').length > 0;

                if (this.item.visibility === 'restricted') {
                    return !permitido;
                }

                if (this.item.visibility === 'local-restricted') {
                    const local = this.organizacion === this.auth.organizacion.id;

                    return !(local && permitido);
                }
            }
        }

        return false;
    }
    expand($event) {
        if ($event) {
            if (this.allModule) {
                this.accordions.active = false;
            } else {
                const index = this.userPermissions.findIndex(s => s === this.makePermission() + ':*');
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
        event.preventDefault();
        if (this.item.type === 'prestacion') {
            try {
                const clipboardData = event.clipboardData;
                const pastedText = clipboardData.getData('text');
                if (!this.seleccionados) {
                    this.seleccionados = [];
                }
                const arrayPrestaciones = this.seleccionados.concat(JSON.parse(pastedText));
                const setPrestaciones = new Map();
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
                const permisos = this.makePermission();
                const items: string[] = this.shiro.permissions(permisos + ':?');
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
                            const srhPrest: any = { ids: items };
                            if (this.item.subtype) {
                                srhPrest.ambito = this.item.subtype;
                            }
                            this.conceptosTurneablesService.search(srhPrest).subscribe((data) => {
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
                        case 'zona-sanitaria':
                            this.zonaSanitariaService.search({ ids: items }).subscribe((data) => {
                                this.loading = false;
                                this.seleccionados = [...data];
                                this.parseSelecionados();
                            });
                            break;
                        case 'grupo-poblacional':
                            this.grupoPoblacionalService.search({ ids: items }).subscribe((data) => {
                                this.loading = false;
                                this.seleccionados = [...data];
                                this.parseSelecionados();
                            });
                            break;
                        case 'queries':
                            this.queryService.getAllQueries({ _id: items }).subscribe((data) => {
                                this.loading = false;
                                this.seleccionados = [...data];
                                this.parseSelecionados();
                            });
                            break;
                        case 'unidad-organizativa':
                            this.organizacionService.unidadesOrganizativas(this.organizacion).subscribe((data) => {
                                this.seleccionados = data.filter(u => items.includes(u.id));
                                this.loading = false;
                                this.parseSelecionados();
                            });
                            break;
                        case 'servicio-intermedio':
                            this.servicioIntermedio.search({ ids: items }).subscribe((data) => {
                                this.seleccionados = data.filter(u => items.includes(u.id));
                                this.loading = false;
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
            const permisos = this.makePermission();
            const items: string[] = this.shiro.permissions(permisos + ':?');
            this.itemsCount = items.length;
            this.allModule = items.length > 0 && items.indexOf('*') >= 0;
        }
    }

    loadData(type, event, subtype?) {
        // [TODO] Agregar parametros de busqueda en el JSON de permisos. Ej: { turneable: 1 }
        // [TODO] Filtrar otras tipos de datos
        const query: any = {};
        if (!event.query || event.query.length === 0) {
            return event.callback([...this.seleccionados]);
        }
        switch (type) {
        case 'prestacion':
            query.term = '^' + event.query;
            if (subtype) {
                query.ambito = subtype;
            }
            this.conceptosTurneablesService.search(query).subscribe((data) => {
                data = [...data, ...this.seleccionados || []];
                event.callback(data);
            });
            break;
        case 'organizacion':
            this.organizacionService.get({ nombre: event.query }).subscribe((data) => {
                event.callback(data);
            });
            break;
        case 'zona-sanitaria':
            query.nombre = '^' + event.query;
            this.zonaSanitariaService.search(query).subscribe((data) => {
                event.callback(data);
            });
            break;
        case 'queries':
            this.queryService.getAllQueries({ desdeAndes: true }).subscribe((data) => {
                event.callback(data);
            });
            break;
        case 'grupo-poblacional':
            this.grupoPoblacionalService.search().subscribe((data) => {
                event.callback(data);
            });
            break;
        case 'unidad-organizativa':
            this.organizacionService.unidadesOrganizativas(this.auth.organizacion.id).subscribe((data) => {
                event.callback(data);

            });
            break;
        case 'servicio-intermedio':
            query.term = '^' + event.query;
            this.servicioIntermedio.search(query).subscribe((data) => {
                data = [...data, ...this.seleccionados || []];
                event.callback(data);
            });
            break;
        }
    }



    private initShiro() {
        this.shiro.reset();
        this.shiro.add(this.userPermissions);
    }

    makePermission() {
        return this.parentPermission + (this.parentPermission.length ? ':' : '') + this.item.key;
    }

    public generateString(): string[] {
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

                const lists = [];
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


