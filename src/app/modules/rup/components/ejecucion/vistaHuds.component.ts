import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { Location } from '@angular/common';
import { Component, EventEmitter, OnDestroy, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderPacienteComponent } from '../../../../components/paciente/headerPaciente.component';
import { IPaciente } from '../../../../core/mpi/interfaces/IPaciente';
import { PacienteService } from '../../../../core/mpi/services/paciente.service';
import { LogService } from '../../../../services/log.service';
import { HUDSService } from '../../services/huds.service';
import { PrestacionesService } from '../../services/prestaciones.service';
import { ConceptObserverService } from './../../services/conceptObserver.service';
import { ElementosRUPService } from './../../services/elementosRUP.service';

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

    // Seguimiento Paciente San Juan
    public flagSeguimiento = false;

    constructor(
        public elementosRUPService: ElementosRUPService,
        public plex: Plex,
        public auth: Auth,
        private router: Router,
        private route: ActivatedRoute,
        private servicioPaciente: PacienteService,
        private logService: LogService,
        private servicioPrestacion: PrestacionesService,
        private conceptObserverService: ConceptObserverService,
        public huds: HUDSService,
        private location: Location
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
                });
            });
        } else {
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
        this.location.back();
    }

    evtCambiaPaciente() {
        this.cambiarPaciente.emit(true);
    }



}
