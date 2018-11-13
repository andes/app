import { Component, OnInit, HostBinding, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { PacienteService } from './../../../../services/paciente.service';
import { ElementosRUPService } from './../../services/elementosRUP.service';
import { IPaciente } from './../../../../interfaces/IPaciente';
import { LogService } from '../../../../services/log.service';
import { PrestacionesService } from '../../services/prestaciones.service';
import { ConceptObserverService } from './../../services/conceptObserver.service';

@Component({
    selector: 'rup-vistaHuds',
    templateUrl: 'vistaHuds.html',
    encapsulation: ViewEncapsulation.None
})
export class VistaHudsComponent implements OnInit {

    @HostBinding('class.plex-layout') layout = true;


    @Input() paciente: IPaciente;
    @Output() cambiarPaciente = new EventEmitter<boolean>();

    // Defaults de Tabs panel derecho
    public panelIndex = 0;
    public mostrarPI = false;
    public mostrarCambiaPaciente = false;

    // Array de registros de la HUDS a agregar en tabs
    public registrosHuds: any[] = [];

    // boton de volver cuando la ejecucion tiene motivo de internacion.
    // Por defecto vuelve al mapa de camas
    public btnVolver = 'VOLVER';
    public rutaVolver;

    constructor(public elementosRUPService: ElementosRUPService,
        public plex: Plex, public auth: Auth,
        private router: Router, private route: ActivatedRoute,
        private servicioPaciente: PacienteService,
        private logService: LogService,
        private servicioPrestacion: PrestacionesService,
        private conceptObserverService: ConceptObserverService) { }

    /**
    *Inicializamos con el id del paciente
    * Cargamos los problemas del paciente
    *
    */
    ngOnInit() {
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

        if (!this.auth.profesional && this.auth.getPermissions('huds:?').length <= 0) {
            this.redirect('inicio');
        }

        if (this.auth.profesional) {
            this.mostrarPI = true;
        }

        if (!this.auth.profesional && this.auth.getPermissions('huds:?').length > 0) {
            this.mostrarCambiaPaciente = true;
        }


        if (!this.paciente) {
            this.route.params.subscribe(params => {
                let id = params['id'];
                // Carga la información completa del paciente
                this.servicioPaciente.getById(
                    id).subscribe(paciente => {
                        this.paciente = paciente;
                    });
            });
        } else {
            // Loggeo de lo que ve el profesional
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

    redirect(pagina: string) {
        this.router.navigate(['./' + pagina]);
        return false;
    }


    agregarListadoHuds(elemento) {
        if (elemento.tipo === 'prestacion') {
            // Limpiar los valores observados al iniciar la ejecución
            // Evita que se autocompleten valores de una consulta anterior
            this.conceptObserverService.destroy();
            // Loggeo de lo que ve el médico
            this.logService.post('rup', 'hudsPrestacion', {
                paciente: {
                    id: this.paciente.id,
                    nombre: this.paciente.nombre,
                    apellido: this.paciente.apellido,
                    sexo: this.paciente.sexo,
                    fechaNacimiento: this.paciente.fechaNacimiento,
                    documento: this.paciente.documento
                },
                prestacion: elemento.data.id
            }).subscribe(() => { return true; });
        }
        // this.registrosHuds = registrosHuds;
    }
    /**
    * Setea el boton volver, Segun la ruta que recibe
    * Si no recibe ninguna por defecto setea RUP (el punto de inicio de RUP)
    * @param ruta
    */
    volver(ruta = null) {
        ruta = ruta ? ruta : 'rup';
        this.router.navigate([ruta]);
    }

    // recibe el tab que se clikeo y lo saca del array..
    cerrartab($event) {
        this.registrosHuds.splice($event, 1);
    }

    evtCambiaPaciente() {
        this.cambiarPaciente.emit(true);
    }

}
