import { Auth } from '@andes/auth';
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { IZonaSanitaria } from 'src/app/interfaces/IZonaSanitaria';
import { FormsService } from 'src/app/modules/forms-builder/services/form.service';
import { ProfesionalService } from '../../../../services/profesional.service';
import { QueriesService } from '../../../../services/query.service';
import { ZonaSanitariaService } from './../../../../services/zonaSanitaria.service';


@Component({
    selector: 'app-bi-queries',
    templateUrl: './bi-queries.component.html',
    styleUrls: ['./bi-queries.component.scss']
})
export class BiQueriesComponent implements OnInit {
    @Input() queries;

    public consultaSeleccionada;
    public opciones = [];
    public queries$: Observable<any>;
    public organizaciones$: Observable<any>;
    public argumentos;
    public argumentosSalida = [];
    public resultados;
    public mostrarSalida = false;
    public tipoPrestaciones;
    public totalOrganizaciones = false;
    public permisosZonas: any[];
    public zonasSanitarias: IZonaSanitaria[] = [];

    constructor(
        private queryService: QueriesService,
        private profesionalService: ProfesionalService,
        private zonaSanitariaService: ZonaSanitariaService,
        private formsService: FormsService,
        private auth: Auth,
        private router: Router
    ) { }

    ngOnInit() {
        const permisos = this.auth.getPermissions('visualizacionInformacion:biQueries:?');
        this.totalOrganizaciones = !this.auth.check('visualizacionInformacion:totalOrganizaciones');
        this.permisosZonas = this.auth.getPermissions('visualizacionInformacion:zonasSanitarias:?');
        if (this.permisosZonas.length > 0) {
            this.loadZonasSanitarias();
        }
        let params;
        if (permisos.length) {
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
        if (this.consultaSeleccionada) {
            this.argumentos = this.consultaSeleccionada.argumentos;
            this.organizaciones$ = this.auth.organizaciones();
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
        this.zonaSanitariaService.search(params).subscribe(resultado => {
            this.zonasSanitarias = resultado;
        });
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
            params['totalOrganizaciones'] = !this.totalOrganizaciones;
            this.queryService.descargarCsv(this.consultaSeleccionada.nombre, params).subscribe();
        }
    }
}
