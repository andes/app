import { Component, OnInit, HostBinding, ViewEncapsulation, Input } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ObjectID } from 'bson';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { IPrestacion } from '../../interfaces/prestacion.interface';
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

    // Defaults de Tabs panel derecho
    public panelIndex = 0;

    // Array de registros de la HUDS a agregar en tabs
    public registrosHuds: any[] = [];

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

        // Limpiar los valores observados al iniciar la ejecución
        // Evita que se autocompleten valores de una consulta anterior
        this.conceptObserverService.destroy();

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
    volver() {
        this.router.navigate(['rup']);
    }
    // recibe el tab que se clikeo y lo saca del array..
    cerrartab($event) {
        this.registrosHuds.splice($event, 1);
    }

}
