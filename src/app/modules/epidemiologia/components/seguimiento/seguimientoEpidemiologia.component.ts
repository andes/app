import moment from 'moment';
import { cache } from '@andes/shared';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ElementosRUPService } from 'src/app/modules/rup/services/elementosRUP.service';
import { PrestacionesService } from 'src/app/modules/rup/services/prestaciones.service';
import { SeguimientoPacientesService } from '../../services/seguimiento-pacientes.service';
import { Auth } from '@andes/auth';
import { SemaforoService } from 'src/app/modules/semaforo-priorizacion/service/semaforo.service';
import { estadosSeguimiento as estados } from '../../constantes';
import { Plex } from '@andes/plex';
import { PlexWrapperComponent } from '@andes/plex';
import { DocumentosService } from 'src/app/services/documentos.service';

@Component({
    selector: 'seguimiento-epidemiologia',
    templateUrl: 'seguimientoEpidemiologia.html',
    encapsulation: ViewEncapsulation.None
})
export class SeguimientoEpidemiologiaComponent implements OnInit {
    @ViewChild('wrapper') wrapper: PlexWrapperComponent;

    public checkedSeguimientos = {};
    public seguimientos$: Observable<any[]> = new Observable<any[]>();
    public showAsingar: boolean;
    public allSelected: boolean;
    public showSideBar;
    public listado;
    public seguimiento;
    public fechaDesde: Date;
    public fechaHasta: Date;
    public estado;
    public inProgress: boolean;
    public documento: string;
    public query;
    public lastResults = new BehaviorSubject<any[]>(null);
    public selectedLlamado;
    public actualizacionSeguimiento;
    public organizacion;
    public opcionesSemaforo;
    public esAuditor: boolean;
    public estadosSeguimiento = estados;
    public anyChecked;
    public asignados = false;
    prioridad;
    profesional;
    public orderBy = [{ id: 'prioridad', label: 'Prioridad' }, { id: 'fecha', label: 'Fecha' }];
    public orden = 'prioridad';
    public collapse = false;
    public itemsOrden = [];
    public totalResultados;

    constructor(
        private seguimientoPacientesService: SeguimientoPacientesService,
        private route: ActivatedRoute,
        private elementosRUPService: ElementosRUPService,
        private prestacionesService: PrestacionesService,
        private router: Router,
        private semaforoService: SemaforoService,
        private plex: Plex,
        private auth: Auth,
        private documentosService: DocumentosService
    ) { }

    ngOnInit(): void {
        if (!this.auth.getPermissions('epidemiologia:seguimiento:?').length) {
            this.router.navigate(['inicio']);
        }
        this.esAuditor = this.auth.check('epidemiologia:seguimiento:auditoria');
        this.organizacion = this.auth.organizacion;
        this.itemsOrden.push({
            'label': 'Prioridad', handler: () => {
                this.orden = 'prioridad';
                this.buscar();
            }
        },
            {
                'label': 'Fecha', handler: () => {
                    this.orden = 'fecha';
                    this.buscar();
                }
            });
    }

    volverInicio() {
        this.router.navigate(['../epidemiologia'], { relativeTo: this.route });
    }

    private setQueryParams() {
        const estadosActivo = ['pendiente', 'seguimiento'];
        this.query = {
            fechaInicio: this.seguimientoPacientesService.queryDateParams(this.fechaDesde, this.fechaHasta),
            estado: this.estado?.id || estadosActivo,
            organizacionSeguimiento: this.auth.organizacion.id,
            paciente: this.documento || undefined,
            sort: this.orden === 'prioridad' ? '-score.value score.fecha' : '-createdAt',
            limit: 20,
            profesional: this.profesional?.id,
            asignados: this.asignados ? !this.asignados : undefined,
            total: true
        };
        if (!this.esAuditor) {
            this.query.profesional = this.auth.profesional;
        }
        if (this.prioridad) {
            const scoreRange = [];
            if (this.prioridad.max) {
                for (let i = this.prioridad.min; i <= this.prioridad.max; i++) {
                    scoreRange.push(i);
                }
            } else {
                scoreRange.push(this.prioridad.min);
            }
            this.query.score = scoreRange;
        }
    }

    buscar() {
        this.setQueryParams();
        this.inProgress = true;
        this.lastResults.next(null);
        this.wrapper.desplegado = this.checkCollapse();
        this.seguimientos$ = this.lastResults.pipe(
            switchMap(lastResults => {
                if (!lastResults) {
                    this.query.skip = 0;
                }
                return this.seguimientoPacientesService.search(this.query).pipe(
                    map((resultados: any) => {
                        this.listado = lastResults ? lastResults.concat(resultados.data) : resultados.data;
                        if (resultados.pagination.total) {
                            // si skip > 0 total es undefined
                            this.totalResultados = resultados.pagination.total;
                        }
                        this.clearChecked();
                        this.query.skip = this.listado.length;
                        this.inProgress = false;
                        this.closeSideBar();
                        return this.listado;
                    })
                );
            }),
            cache()
        );
    }

    descargarListadoCsv() {
        this.setQueryParams();
        const now = moment().format('DD-MM-hh-mm-ss');
        this.documentosService.descargarListadoSeguimiento(this.query, `seguimiento ${now}`).subscribe();
    }

    private clearChecked() {
        this.checkedSeguimientos = {};
        this.allSelected = false;
        this.anyChecked = false;
    }

    getOpcionesSemaforo(event) {
        this.semaforoService.findByName('seguimiento-epidemiologico').subscribe(res => {
            this.opcionesSemaforo = res.options;
            event.callback(this.opcionesSemaforo);
        });
    }

    onScroll() {
        if (this.query.skip > 0 && this.query.skip % this.query.limit === 0) {
            this.lastResults.next(this.listado);
        }
    }

    selectSeguimiento(_seguimiento) {
        this.actualizacionSeguimiento = false;
        this.seguimiento = _seguimiento;
        this.showAsingar = false;
    }

    actualizarSeguimiento(_seguimiento) {
        this.selectSeguimiento(_seguimiento);
        this.actualizacionSeguimiento = true;
        this.showAsingar = false;
    }

    closeSideBar() {
        this.seguimiento = null;
        this.actualizacionSeguimiento = false;
        this.showAsingar = false;
    }

    displayAsignar() {
        this.showAsingar = true;
        this.actualizacionSeguimiento = false;
    }

    reload() {
        this.closeSideBar();
        this.buscar();
    }

    iniciarSeguimiento(seguimiento) {
        const concepto = this.elementosRUPService.getConceptoSeguimientoCOVID();
        const nuevaPrestacionSeguimiento = this.prestacionesService.inicializarPrestacion(seguimiento.paciente, concepto, 'ejecucion', 'ambulatorio');
        this.prestacionesService.post(nuevaPrestacionSeguimiento).subscribe(prestacion => {
            this.prestacionesService.notificaRuta({ nombre: 'SEGUIMIENTO', ruta: 'epidemiologia/seguimiento' });
            this.router.navigate(['/rup/ejecucion', prestacion.id]);
        });
    }

    verLlamado($event) {
        this.selectedLlamado = $event;
    }

    getColorPrioridad(score) {
        return score ? this.opcionesSemaforo?.find(x => {
            return score >= x.min && (!x.max || score <= x.max);
        })?.itemRowStyle : false;
    }

    selectAll($event) {
        this.anyChecked = $event.value;
        if ($event.value) {
            this.seguimientos$.subscribe(data => data.forEach(d => this.checkedSeguimientos[d.id] = true));
        } else {
            this.checkedSeguimientos = {};
        }
    }

    onCheck($event) {
        const checked = Object.keys(this.checkedSeguimientos).filter(k => this.checkedSeguimientos[k]);
        this.anyChecked = !!checked.length;
        if (this.anyChecked) {
            this.seguimiento = null;
        }

        if (!$event.value) {
            this.allSelected = false;
        }
    }

    asignarProfesional(profesional) {
        const data = {
            profesional,
            seguimientos: Object.entries(this.checkedSeguimientos).filter(e => e[1]).map(e => e[0])
        };
        this.seguimientoPacientesService.asignarProfesional(data).subscribe(res => {
            this.plex.toast('success', 'Profesional asignado con éxito');
            this.anyChecked = false;
            this.checkedSeguimientos = {};
            this.reload();
        });
    }

    changeCollapse(event) {
        this.collapse = event;
    }

    checkCollapse() {
        return this.query.score || this.query.profesional || this.query.paciente || this.asignados;
    }
}
