import moment from 'moment';
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
    public internacione$: Observable<any[]>;
    public registros = [];
    public flagSeguimiento = false;

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
        private serviceMapaCamasHTTP: MapaCamasHTTP
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

        // cargar las internaciones y armar un filtro en api .
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
                const id = params['id'];
                // Carga la información completa del paciente
                this.servicioPaciente.getById(id).subscribe(paciente => {
                    this.paciente = paciente;
                    // carga todas las internaciones del paciente
                    const filtros = {
                        fechaIngresoDesde: moment('2016-01-01').toDate(),
                        idPaciente: id
                    };
                    this.internacione$ = this.serviceMapaCamasHTTP.getPrestacionesInternacion(filtros);
                    this.plex.setNavbarItem(HeaderPacienteComponent, { paciente: this.paciente });
                });
            });
        } else {
            this.plex.setNavbarItem(HeaderPacienteComponent, { paciente: this.paciente });
            return true;
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


    onExploracionClick() {
        this.router.navigate(['huds', 'timeline', this.paciente.id]);
    }

    prestacionVisible(registro) {
        return registro.data.class === 'plan' ||
            registro.data.class === 'regimen' ||
            registro.data.class === 'elementoderegistro' ||
            registro.data.class === 'producto';
    }
}
