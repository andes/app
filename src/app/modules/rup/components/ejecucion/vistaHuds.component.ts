import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { Location } from '@angular/common';
import { Component, EventEmitter, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { MapaCamasHTTP } from 'src/app/apps/rup/mapa-camas/services/mapa-camas.http';
import { HeaderPacienteComponent } from '../../../../components/paciente/headerPaciente.component';
import { IPaciente } from '../../../../core/mpi/interfaces/IPaciente';
import { PacienteService } from '../../../../core/mpi/services/paciente.service';
import { HUDSService } from '../../services/huds.service';
import { ConceptObserverService } from './../../services/conceptObserver.service';
import { ElementosRUPService } from './../../services/elementosRUP.service';
import * as moment from 'moment';
import { RecetaService } from 'src/app/services/receta.service';

@Component({
    selector: 'rup-vistaHuds',
    templateUrl: 'vistaHuds.html',
    styleUrls: ['vistaHuds.scss'],
    encapsulation: ViewEncapsulation.None
})
export class VistaHudsComponent implements OnInit, OnDestroy {
    @Output() cambiarPaciente = new EventEmitter<boolean>();

    public paciente: IPaciente = null;
    public activeIndexPrestacion = 0;
    public internacione$: Observable<any[]>;
    public registros = [];
    public indice = 0;
    public indiceSeccion = 0;
    public hudsOpciones = [
        { icon: 'corazon-pulso', tooltip: 'Situaciones de salud activas' },
        { icon: 'paciente', tooltip: 'Antecedentes personales' },
        { icon: 'familia', tooltip: 'Antecedentes familiares' },
        { icon: 'corazon-sano', tooltip: 'Hábitos y condiciones de vida' },
        { icon: 'escudo-check', tooltip: 'Cuidados-preventivos' },
        { icon: 'listado-receta', tooltip: 'Prescripciones' },
        { icon: 'signos-vitales', tooltip: 'Mediciones y signos vitales' },
        { icon: 'conecciones', tooltip: 'Vínculos y red familiar' },
        { icon: 'historial', tooltip: 'Accesos a la HUDS' },
        { icon: 'camilla', tooltip: 'Internación' },
        { icon: 'calendario-rango-bold', tooltip: 'Turnos' }
    ];
    public permisoHudsCompleta: boolean;
    public permisoLaboratorios: boolean;
    public permisoVacunas: boolean;
    public permisoRecetas: boolean;
    private fechaDesdeInternacion = moment('2016-01-01').toDate();
    private origen: string;

    constructor(
        public elementosRUPService: ElementosRUPService,
        public plex: Plex,
        public auth: Auth,
        private router: Router,
        private route: ActivatedRoute,
        private servicioPaciente: PacienteService,
        private conceptObserverService: ConceptObserverService,
        public huds: HUDSService,
        private location: Location,
        private serviceMapaCamasHTTP: MapaCamasHTTP,
        public recetaService: RecetaService
    ) { }

    /**
    *Inicializamos con el id del paciente
    * Cargamos los problemas del paciente
    *
    */
    ngOnInit() {
        this.plex.updateTitle([{
            route: '/',
            name: 'ANDES'
        }, {
            name: 'Historia Única De Salud'
        }]);

        if (!this.auth.getPermissions('huds:?')?.length) {
            this.redirect('inicio');
        }
        this.permisoHudsCompleta = this.auth.check('huds:visualizacionHuds');
        this.permisoLaboratorios = this.permisoHudsCompleta || this.auth.check('huds:visualizacionParcialHuds:*') || this.auth.check('huds:visualizacionParcialHuds:laboratorio');
        this.permisoVacunas = this.permisoHudsCompleta || this.auth.check('huds:visualizacionParcialHuds:*') || this.auth.check('huds:visualizacionParcialHuds:vacuna');
        this.permisoRecetas = this.permisoHudsCompleta || this.auth.check('huds:visualizacionParcialHuds:*') || this.auth.check('huds:visualizacionParcialHuds:receta');

        // cargar las internaciones y armar un filtro en api .
        this.huds.registrosHUDS.subscribe((datos) => {
            if (this.registros.length < datos.length) {
                this.activeIndexPrestacion = datos.length;
            } else if (this.activeIndexPrestacion > datos.length) {
                this.activeIndexPrestacion = this.activeIndexPrestacion - 1;
            }
            this.registros = [...datos];
            this.indice = this.registros.length;
            this.registros.forEach((elemento, index) => {
                if (elemento.tipo === 'internacion' && elemento.data?.indices && elemento.data.registros?.length > 0) {
                    const registrosAux = elemento.data.registros[0];
                    const keys = Object.keys(registrosAux);
                    const allRegistros = [];
                    keys.forEach(key => {
                        if (registrosAux[key]?.fecha) {
                            allRegistros.push(registrosAux[key]);
                        }
                    });
                    allRegistros.sort((a, b) => {
                        const fechaA = moment(a.fecha);
                        const fechaB = moment(b.fecha);
                        return fechaB.diff(fechaA);
                    });
                    this.registros[index].data.registros[0] = allRegistros;
                }
            });
        });
        this.huds.activeTab$.subscribe((tab) => {
            if (tab >= 0) {
                this.activeIndexPrestacion = tab;
            }
        });
        // Limpiar los valores observados al iniciar la ejecución
        // Evita que se autocompleten valores de una consulta anterior
        this.conceptObserverService.destroy();

        if (!this.paciente) {
            this.route.params.subscribe(params => {
                const id = params['id'];

                this.servicioPaciente.getById(id).subscribe(paciente => {
                    this.paciente = paciente;

                    if (this.permisoHudsCompleta) {
                        const filtros = {
                            fechaIngresoDesde: this.fechaDesdeInternacion,
                            idPaciente: id
                        };
                        this.internacione$ = this.serviceMapaCamasHTTP.getPrestacionesInternacion(filtros);
                    }
                    this.plex.setNavbarItem(HeaderPacienteComponent, { paciente: this.paciente });
                });
            });
        } else {
            this.plex.setNavbarItem(HeaderPacienteComponent, { paciente: this.paciente });
        }

        this.route.queryParams.subscribe(params => {
            this.origen = params['origen'];
        });
    }


    ngOnDestroy() {
        this.huds.clear();
    }

    redirect(pagina: string) {
        this.router.navigate(['./' + pagina]);
        return false;
    }

    public onCloseTab(index) {
        this.huds.remove(index - 1);
    }

    public onChangeTab(index: number) {
        if (index >= 0 && index <= this.registros.length) {
            this.activeIndexPrestacion = index;
        }
    }

    public seleccionarSeccion(index: number) {
        this.indiceSeccion = index;
    }

    /**
    * Setea el boton volver, Segun la ruta que recibe
    * Si no recibe ninguna por defecto setea RUP (el punto de inicio de RUP)
    * @param ruta
    */
    volver() {
        if (this.origen === 'mpi') {
            this.router.navigate(['apps/mpi/busqueda']);
        } else {
            this.location.back();
        }
    }


    evtCambiaPaciente() {
        this.cambiarPaciente.emit(true);
    }


    onExploracionClick() {
        this.router.navigate(['huds', 'timeline', this.paciente.id]);
    }

    detalleRegistro(registro) {
        return registro.data.class === 'situación' ||
            registro.data.class === 'hallazgo' ||
            registro.data.class === 'trastorno';
    }

    prestacionVisible(registro) {
        return registro.data.class === 'plan' ||
            registro.data.class === 'regimen' ||
            registro.data.class === 'elementoderegistro' ||
            registro.data.class === 'producto';
    }

    esGuardia(registro: any) {
        const term = (registro.tipo === 'rup') ?
            registro.data?.solicitud?.tipoPrestacion?.term :
            registro.data?.prestacion?.snomed?.term;
        const isGuardia = term && term.toLowerCase().includes('emergencia');
        return isGuardia;
    }
}
