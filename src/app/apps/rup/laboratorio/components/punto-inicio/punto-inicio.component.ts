import { LaboratorioContextoCacheService } from './../../services/protocoloCache.service';
import { IPaciente } from './../../../../../interfaces/IPaciente';
import { AppMobileService } from './../../../../../services/appMobile.service';
import { PacienteService } from './../../../../../services/paciente.service';
import { Component, OnInit, Output, EventEmitter, HostBinding, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { PacienteBuscarResultado } from '../../../../../modules/mpi/interfaces/PacienteBuscarResultado.inteface';

@Component({
    selector: 'punto-inicio-laboratorio',
    templateUrl: 'punto-inicio.html',
    styleUrls: ['../../assets/laboratorio.scss']
})

export class PuntoInicioLaboratorioComponent implements OnInit, OnDestroy {

    @HostBinding('class.plex-layout') layout = true;
    @Output() selected: EventEmitter<any> = new EventEmitter<any>();
    @Output() escaneado: EventEmitter<any> = new EventEmitter<any>();
    @Output() seleccionarProtocoloEmitter: EventEmitter<any> = new EventEmitter<any>();

    public showListaSolicitudes = false;
    public paciente: IPaciente;
    showDarTurnos = false;
    showDashboard = true;
    showCreateUpdate = false;
    seleccion: IPaciente = null;
    esEscaneado = false;
    listado: any;
    pacienteId: any;
    routeParams: any;


    constructor(
        private laboratorioContextoCacheService: LaboratorioContextoCacheService,
        public servicePaciente: PacienteService,
        public auth: Auth,
        public appMobile: AppMobileService,
        private router: Router,
        private route: ActivatedRoute,
        private location: Location,
        private plex: Plex) { }

    ngOnInit() {
        if (!this.auth.getPermissions('laboratorio:recibir:?').length) {
            this.router.navigate(['./inicio']);
        }

        this.routeParams = this.route.params.subscribe(params => {
            if (params['id'] && !this.seleccion) {
                this.pacienteId = params['id'];

                this.servicePaciente.getById(this.pacienteId).subscribe(pacienteMPI => {
                    this.onPacienteSelected(pacienteMPI);
                });
            }

        });
    }

    ngOnDestroy() {
        this.routeParams.unsubscribe(); // <-------
    }

    /**
     * Funcionalidades del buscador de MPI
     */
    searchStart() {
        this.listado = null;
        this.seleccion = null;
        this.router.navigate(['/laboratorio/recepcion/']);
    }

    searchEnd(resultado: PacienteBuscarResultado) {
        if (resultado.err) {
            this.plex.info('danger', resultado.err);
        } else {
            this.listado = resultado.pacientes;
        }
    }

    recepcionarSinTurno() {
        this.laboratorioContextoCacheService.modoRecepcion();
        this.router.navigate(['/laboratorio/recepcion/paciente/' + this.seleccion.id]); // Navega a laboratorioComponent
    }

    /**
     *
     *
     * @memberof PuntoInicioLaboratorioComponent
     */
    recepcionarConTurno(turnoId) {
        this.laboratorioContextoCacheService.modoRecepcion();
        this.router.navigate(['/laboratorio/protocolos/turnos/' + turnoId]); // Navega a laboratorioComponent
    }

    /**
     *
     *
     * @param {IPaciente} paciente
     * @memberof PuntoInicioLaboratorioComponent
     */
    onPacienteSelected(paciente: IPaciente): void {
        this.paciente = paciente;
        this.seleccion = paciente;

        if (paciente.id) {


            if (paciente.estado === 'temporal' && paciente.scan) {
                this.seleccion = paciente;
                if (paciente.scan) {
                    this.esEscaneado = true;
                }
                this.escaneado.emit(this.esEscaneado);
                this.selected.emit(this.seleccion);
                this.showCreateUpdate = true;
                this.showDarTurnos = false;
                this.showDashboard = false;
            } else {
                this.servicePaciente.getById(paciente.id).subscribe(
                    pacienteMPI => {
                        this.paciente = pacienteMPI;

                        this.showListaSolicitudes = true;

                        // Si el paciente previamente persistido no posee string de scan, y tenemos scan, actualizamos el pac.
                        if (!this.paciente.scan && paciente.scan) {
                            this.servicePaciente.patch(paciente.id, { op: 'updateScan', scan: paciente.scan }).subscribe();
                        }
                    }
                );
            }

            let url = this.router.createUrlTree(['/laboratorio/recepcion/' + paciente.id]).toString();
            this.location.go(url);

        } else {
            if (paciente.scan) {
                this.esEscaneado = true;
            }
            this.escaneado.emit(this.esEscaneado);
            this.selected.emit(this.seleccion);
            this.showCreateUpdate = true;
            this.showDarTurnos = false;
            this.showDashboard = false;
        }
    }


    /**
     *
     *
     * @param {string} pagina
     * @returns
     * @memberof PuntoInicioLaboratorioComponent
     */
    redirect(pagina: string) {
        this.router.navigate(['./' + pagina]);
        return false;
    }

    /**
     *
     *
     * @param {*} $event
     * @memberof PuntoInicioLaboratorioComponent
     */
    seleccionarProtocolo($event) {
        this.seleccionarProtocoloEmitter.emit($event);
    }
}
