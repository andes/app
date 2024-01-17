import { Auth } from '@andes/auth';
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { IZonaSanitaria } from 'src/app/interfaces/IZonaSanitaria';
import { FormsService } from 'src/app/modules/forms-builder/services/form.service';
import { ProfesionalService } from '../../../../services/profesional.service';
import { QueriesService } from '../../../../services/query.service';
import { ZonaSanitariaService } from './../../../../services/zonaSanitaria.service';
import { OrganizacionService } from '../../../../services/organizacion.service';
import { map, switchMap } from 'rxjs/operators';
@Component({
    selector: 'app-bi-queries',
    templateUrl: './bi-queries.component.html',
    styleUrls: ['./bi-queries.component.scss']
})
export class BiQueriesComponent implements OnInit {
    @Input() queries;
    public consultaSeleccionada;
    public queries$: Observable<any>;
    public organizaciones = []; // total de organizaciones segun permisos
    public organizacionesOrigenFiltradas = []; // resultado de filtro por zona origen
    public organizacionesDestinoFiltradas = []; // resultado de filtro por zona destino
    public argumentos;
    public totalOrganizaciones = false;
    public permisosZonas: any[];
    public zonasSanitarias: IZonaSanitaria[] = [];
    public disabledFiltroZonas = false;
    public inProgress = false;
    private idSubmoduloQueries = '60cce2a42e15361fe51b373d'; // coleccion modulos, mod. visualizacion, submodulo bi-queries

    constructor(
        private queryService: QueriesService,
        private profesionalService: ProfesionalService,
        private zonaSanitariaService: ZonaSanitariaService,
        private servicioOrganizacion: OrganizacionService,
        private formsService: FormsService,
        private auth: Auth,
        private router: Router,
        private organizacionService: OrganizacionService
    ) { }

    ngOnInit() {
        const permisos = this.auth.getPermissions('visualizacionInformacion:biQueries:?');
        this.totalOrganizaciones = this.auth.check('visualizacionInformacion:totalOrganizaciones');
        this.permisosZonas = this.auth.getPermissions('visualizacionInformacion:zonasSanitarias:?');

        if (this.permisosZonas.length) { // tiene permisos para zona
            // cargamos organizaciones segun permisos de zona
            this.loadZonasSanitarias();
        } else {
            // cargamos organizaciones segun permisos
            this.disabledFiltroZonas = true;
            this.auth.getModuleOrganizaciones(this.idSubmoduloQueries).subscribe(orgs => this.organizaciones = orgs);
        }

        let params;
        if (permisos.length) {
            // cargamos queries segun permisos
            if (permisos[0] === '*') {
                if (this.queries?.length) {
                    params = { _id: this.queries };
                } else {
                    params = { desdeAndes: true };
                }
            } else {
                if (this.queries?.length) {
                    const permisosFilter = this.queries.filter(q => permisos.find(p => p === q));
                    if (permisosFilter?.length) {
                        params = { _id: permisosFilter };
                    } else {
                        return;
                    }
                } else {
                    params = { _id: permisos };
                }
            }
            this.queries$ = this.queryService.getAllQueries(params);
        } else {
            this.router.navigate(['./inicio']);
        }
    }

    getArgumentos() {
        this.inProgress = true;
        this.organizacionesOrigenFiltradas = [];
        this.organizacionesDestinoFiltradas = [];

        if (this.consultaSeleccionada) {
            // filtramos zonas y organizaciones segun permisos
            const filtrosPorZona = this.consultaSeleccionada.argumentos.filter(arg => arg.tipo === 'zonaSanitaria');

            if (this.zonasSanitarias.length && this.permisosZonas[0] !== '*') { // tiene permiso para zonas?
                // permiso solo para algunas zonas
                filtrosPorZona.map(filtro => filtro.required = true);
            }
            this.organizacionesOrigenFiltradas = this.organizaciones;
            this.organizacionesDestinoFiltradas = this.organizaciones;
            this.argumentos = this.consultaSeleccionada.argumentos;
            this.inProgress = false;
        }
    }

    changeZona(zona, key) {
        if (zona) {
            const orgFiltradas = this.organizaciones.filter(org => org.zonaSanitaria.id === zona.id);
            key === 'zonaOrigen' ? this.organizacionesOrigenFiltradas = orgFiltradas : this.organizacionesDestinoFiltradas = orgFiltradas;
        } else if (key === 'zonaOrigen') {
            this.argumentos['organizacionOrigen'] = null;
            this.organizacionesOrigenFiltradas = [];
        } else {
            this.argumentos['organizacionDestino'] = null;
            this.organizacionesDestinoFiltradas = [];
        }
    }

    loadUnidadesOrganizativas(event) {
        if (this.argumentos?.organizacion && event.query) {
            const organizacion = this.argumentos.organizacion.id;
            this.servicioOrganizacion.unidadesOrganizativas(organizacion).subscribe(resultado => {
                event.callback(resultado);
            });
        } else {
            event.callback([]);
        }
    }

    loadProfesionales(event) {
        let listaProfesionales = [];
        if (event.query) {
            const query = {
                nombreCompleto: event.query
            };
            this.profesionalService.get(query).subscribe(resultado => {
                listaProfesionales = resultado;
                event.callback(listaProfesionales);
            });
        } else {
            event.callback(listaProfesionales);
        }
    }

    loadZonasSanitarias() {
        const params = {};
        if (this.permisosZonas[0] !== '*') {
            params['ids'] = this.permisosZonas;
        }
        this.zonaSanitariaService.search(params).pipe(
            switchMap(zonas => {
                this.zonasSanitarias = zonas;
                const idZonas = zonas.map(zona => zona.id);
                return this.organizacionService.get({ idsZonasSanitarias: idZonas, activo: true });
            }),
            map(orgs => this.organizaciones = orgs)
        ).subscribe();
    }

    loadFomTypes(event) {
        this.formsService.search().subscribe(res => event.callback(res));
    }

    descargar() {
        if (this.consultaSeleccionada) {
            const params = {};
            this.argumentos.forEach(arg => {
                const key = arg.key;
                const valor = this.argumentos[key];
                params[key] = valor;
                const idField = arg.idField || 'id';

                if (valor instanceof Date) {
                    params[key] = valor;
                } else {
                    if (valor && valor[idField]) {
                        params[key] = valor[idField];
                    } else if (valor === undefined && arg.tipo === 'salida') {
                        params[key] = arg.check;
                    }
                }
            });
            params['totalOrganizaciones'] = this.totalOrganizaciones;
            this.queryService.descargarCsv(this.consultaSeleccionada.nombre, params).subscribe();
        }
    }
}
