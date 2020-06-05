import { Component, OnInit, OnDestroy, HostBinding, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { PacienteService } from '../../../../core/mpi/services/paciente.service';
import { ElementosRUPService } from './../../services/elementosRUP.service';
import { IPaciente } from '../../../../core/mpi/interfaces/IPaciente';
import { LogService } from '../../../../services/log.service';
import { PrestacionesService } from '../../services/prestaciones.service';
import { ConceptObserverService } from './../../services/conceptObserver.service';
import { HeaderPacienteComponent } from '../../../../components/paciente/headerPaciente.component';
import { HUDSService } from '../../services/huds.service';
import { Location } from '@angular/common';

import { SeguimientoPacienteService } from '../../services/seguimientoPaciente.service';

@Component({
    selector: 'rup-vistaHuds',
    templateUrl: 'vistaHuds.html',
    styleUrls: ['vistaHuds.scss'],
    encapsulation: ViewEncapsulation.None
})
export class VistaHudsComponent implements OnInit, OnDestroy {


    @Output() cambiarPaciente = new EventEmitter<boolean>();
    paciente: IPaciente = null;
    public activeIndexPrestacion = 0;
    public activeIndexResumen = 0;

    public registros = [];
    // boton de volver cuando la ejecucion tiene motivo de internacion.
    // Por defecto vuelve al mapa de camas
    public btnVolver = 'VOLVER';
    public rutaVolver;

    // Seguimiento Paciente San Juan
    public flagSeguimiento = false;

    constructor(
        public elementosRUPService: ElementosRUPService,
        public plex: Plex,
        public auth: Auth,
        private router: Router,
        private route: ActivatedRoute,
        private location: Location,
        private servicioPaciente: PacienteService,
        private logService: LogService,
        private servicioPrestacion: PrestacionesService,
        private conceptObserverService: ConceptObserverService,
        public huds: HUDSService,
        public seguimientoPacienteService: SeguimientoPacienteService
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

        if (!this.auth.check('huds:visualizacionHuds')) {
            this.redirect('inicio');
        }

        this.huds.registrosHUDS.subscribe((datos) => {
            if (this.registros.length < datos.length) {
                this.activeIndexPrestacion = datos.length + 1;
            } else if (this.activeIndexPrestacion > datos.length) {
                this.activeIndexPrestacion = this.activeIndexPrestacion - 1;
            }
            this.registros = [...datos];
        });

        // consultamos desde que pagina se ingreso para poder volver a la misma
        this.servicioPrestacion.rutaVolver.subscribe((resp: any) => {
            if (resp) {
                this.btnVolver = resp.nombre;
                this.rutaVolver = resp.ruta;
            }
        });
        // Limpiar los valores observados al iniciar la ejecución
        // Evita que se autocompleten valores de una consulta anterior
        this.conceptObserverService.destroy();

        if (!this.paciente) {
            this.route.params.subscribe(params => {
                let id = params['id'];
                // Carga la información completa del paciente
                this.servicioPaciente.getById(id).subscribe(paciente => {
                    this.paciente = paciente;
                    this.plex.setNavbarItem(HeaderPacienteComponent, { paciente: this.paciente });
                    if (paciente) {
                        this.registroSeguimiento();
                    }
                });
            });
        } else {
            if (this.paciente) {
                this.registroSeguimiento();
            }
            // Loggeo de lo que ve el profesional
            this.plex.setNavbarItem(HeaderPacienteComponent, { paciente: this.paciente });
            this.logService.post('rup', 'hudsPantalla', {
                paciente: {
                    id: this.paciente.id,
                    nombre: this.paciente.nombre,
                    apellido: this.paciente.apellido,
                    sexo: this.paciente.sexo,
                    fechaNacimiento: this.paciente.fechaNacimiento,
                    documento: this.paciente.documento
                }
            }).subscribe(() => { return true; });
        }

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

    /**
    * Setea el boton volver, Segun la ruta que recibe
    * Si no recibe ninguna por defecto setea RUP (el punto de inicio de RUP)
    * @param ruta
    */
    volver() {
        // this.location.back();
        this.router.navigate(['/rup']);
    }

    evtCambiaPaciente() {
        this.cambiarPaciente.emit(true);
    }

    registroSeguimiento() {
        // Se evalúa si hay registros de seguimiento
        this.seguimientoPacienteService.getRegistros({ paciente: this.paciente.id }).subscribe(seguimientoPaciente => {
            if (seguimientoPaciente.length) {
                this.flagSeguimiento = true;
            } else {
                this.flagSeguimiento = false;
            }
        });
    }


}
