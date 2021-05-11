import { Component, OnInit } from '@angular/core';
import { QueriesService } from '../../../../services/query.service';
import { Observable } from 'rxjs';
import { ProfesionalService } from '../../../../services/profesional.service';
import { Auth } from '@andes/auth';
import { Router } from '@angular/router';
import { FormsService } from 'src/app/modules/forms-builder/services/form.service';


@Component({
    selector: 'app-bi-queries',
    templateUrl: './bi-queries.component.html',
    styleUrls: ['./bi-queries.component.scss']
})
export class BiQueriesComponent implements OnInit {

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
    public opcionesSexo = [
        { id: 'femenino', nombre: 'Femenino' },
        { id: 'masculino', nombre: 'Masculino' }
    ];

    constructor(
        private queryService: QueriesService,
        private profesionalService: ProfesionalService,
        private formsService: FormsService,
        private auth: Auth,
        private router: Router
    ) { }

    ngOnInit() {
        const permisos = this.auth.getPermissions('visualizacionInformacion:biQueries:?');
        this.totalOrganizaciones = !this.auth.check('visualizacionInformacion:totalOrganizaciones');
        if (permisos.length) {
            if (permisos[0] === '*') {
                this.queries$ = this.queryService.getAllQueries({ desdeAndes: true });
            } else {
                this.queries$ = this.queryService.getAllQueries({ _id: permisos });
            }
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
            let query = {
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

    loadEstadosAgenda(event) {
        const estadosAgendas = [
            { id: 'planificacion', nombre: 'Planificación' },
            { id: 'disponible', nombre: 'Disponible' },
            { id: 'publicada', nombre: 'Publicada' },
            { id: 'suspendida', nombre: 'Suspendida' },
            { id: 'pausada', nombre: 'Pausada' },
            { id: 'pendienteAsistencia', nombre: 'Pendiente Asistencia' },
            { id: 'pendienteAuditoria', nombre: 'Pendiente Auditoría' },
            { id: 'auditada', nombre: 'Auditada' },
            { id: 'borrada', nombre: 'Borrada' }
        ];
        event.callback(estadosAgendas);
    }

    loadEstadosTurno(event) {
        const estadosTurnos = [
            { id: 'disponible', nombre: 'Disponible' },
            { id: 'asignado', nombre: 'Asignado' },
            { id: 'suspendido', nombre: 'Suspendido' },
            { id: 'turnoDoble', nombre: 'Turno Doble' }
        ];
        event.callback(estadosTurnos);
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
                if (valor instanceof Date) {
                    params[key] = valor;
                } else {
                    if (valor && valor.id) {
                        params[key] = valor.id;
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
