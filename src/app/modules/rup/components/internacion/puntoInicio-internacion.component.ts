import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { PacienteBuscarResultado } from '../../../mpi/interfaces/PacienteBuscarResultado.inteface';
import { Plex } from '@andes/plex';
import { Router } from '@angular/router';
import { PrestacionesService } from '../../services/prestaciones.service';
import { ElementosRUPService } from '../../services/elementosRUP.service';
import { Auth } from '@andes/auth';

@Component({
    selector: 'app-punto-inicio-internacion',
    templateUrl: './puntoInicio-internacion.html',
    styleUrls: ['./puntoInicio-internacion.scss'],
    encapsulation: ViewEncapsulation.None // Use to disable CSS Encapsulation for this component
})
export class PuntoInicioInternacionComponent implements OnInit {

    public listado: any;
    public pacienteSeleccionado;
    public ListadoPrestacionesPorPaciente = [];
    public showLoader = false;
    public showInternacionEjecucion = false;
    public internacionEjecucion;
    public conceptosInternacion;
    public conceptoPrescripcion;

    public itemsDropDown: any;

    constructor(
        public servicioPrestacion: PrestacionesService,
        private plex: Plex,
        private router: Router,
        private elementoRupService: ElementosRUPService,
        private auth: Auth
    ) { }

    ngOnInit() {
        this.elementoRupService.ready.subscribe(() => {
            this.conceptosInternacion = this.elementoRupService.getConceptosInternacion();
            this.conceptoPrescripcion = this.elementoRupService.getConceptoPrescripcion();
        });
    }

    /**
     * Funcionalidades del buscador de MPI
     */
    searchStart() {
        this.listado = null;
    }

    searchEnd(resultado: PacienteBuscarResultado) {
        if (resultado.err) {
            this.plex.info('danger', resultado.err);
        } else {
            this.listado = resultado.pacientes;
        }
    }

    /**
     * Cuando seleccionamos un paciente busca todas sus epicrisis
     * formatea la descripcion a mostrar en el listado de epicrisis
     * @param paciente
     */
    onPacienteSelected(paciente) {
        this.showLoader = true;
        this.pacienteSeleccionado = paciente;
        this.servicioPrestacion.internacionesXPaciente(paciente, 'ejecucion', this.auth.organizacion.id).subscribe(resultado => {
            // Si el paciente ya tiene una internacion en ejecucion
            if (resultado) {
                this.servicioPrestacion.get({ idPrestacionOrigen: resultado.ultimaInternacion.id }).subscribe(prestacionExiste => {
                    if (prestacionExiste.length) {
                        this.internacionEjecucion = prestacionExiste[0];
                        this.showInternacionEjecucion = true;
                    }
                });
            } else {
                this.showInternacionEjecucion = false;
            }
        });
        this.servicioPrestacion.getPrestacionesXtipo(paciente.id, this.conceptosInternacion.epicrisis.conceptId).subscribe(epicrisis => {
            this.ListadoPrestacionesPorPaciente = epicrisis
                .map(e => {
                    e.origen = 'Epicrisis';

                    if (e.ejecucion.registros && e.ejecucion.registros[0] && e.ejecucion.registros[0].registros) {
                        e.ejecucion.registros[0].registros[0].valor = e.ejecucion.registros[0].registros[0].valor.substring(0, 100) + '...';
                    }
                    return e;
                });
            this.servicioPrestacion.getPrestacionesXtipo(paciente.id, this.conceptoPrescripcion.conceptId).subscribe(preinscripcion => {
                let a = preinscripcion
                    .map(e => {
                        e.origen = 'Prescripción';
                        this.ListadoPrestacionesPorPaciente.push(e);
                    });
            });
            this.showLoader = false;
        });
    }

    /**
     * Crea la prestacion de epicrisis
     * Nos rutea a la ejecucion de RUP.
     * @param paciente
     */
    nuevaEpicrisis(paciente) {
        let nuevaPrestacion = this.servicioPrestacion.inicializarPrestacion(paciente, this.conceptosInternacion.epicrisis, 'ejecucion', 'internacion');
        // nuevaPrestacion.solicitud.prestacionOrigen = nuevaInternacion.id;
        this.servicioPrestacion.post(nuevaPrestacion).subscribe(prestacion => {
            this.router.navigate(['rup/ejecucion', prestacion.id]);
        });
    }

    nuevaPrescripcion(paciente) {
        let nuevaPrestacion = this.servicioPrestacion.inicializarPrestacion(paciente, this.conceptoPrescripcion, 'ejecucion', 'internacion');
        // nuevaPrestacion.solicitud.prestacionOrigen = nuevaInternacion.id;
        this.servicioPrestacion.post(nuevaPrestacion).subscribe(prestacion => {
            this.router.navigate(['rup/ejecucion', prestacion.id]);
        });
    }

    /**
     * Ruteo a epicris/huds
     * @param id
     * @param key
     */
    ruteo(id, key) {
        this.servicioPrestacion.notificaRuta({ nombre: 'Punto inicio', ruta: 'internacion/inicio' });
        switch (key) {
            case 'huds':
                this.router.navigate(['rup/vista/', id]);
                break;
            case 'epicrisis':
                this.router.navigate(['rup/ejecucion', id]);
                break;
            default:
                this.router.navigate([]);
                break;
        }
    }
    newPrestacionConVerificacion(paciente, concepto) {
        console.log(paciente);
        this.servicioPrestacion.newPrestacion(paciente, concepto).subscribe(nuevaPrestacion => {
            this.servicioPrestacion.post(nuevaPrestacion).subscribe(prestacion => {
                this.router.navigate(['/rup/ejecucion', prestacion.id]);
            }, (err) => {
                this.plex.info('danger', 'La prestación no pudo ser registrada. ' + err);
            });
        });
    }

    cargaItems(pacienteSeleccionado) {

        this.itemsDropDown = [{
            label: 'Crear epicrisis',
            handler: () => {
                this.nuevaEpicrisis(pacienteSeleccionado);
            }
        }, {
            label: 'Crear prescripción',
            handler: () => {
                this.newPrestacionConVerificacion(pacienteSeleccionado, this.conceptoPrescripcion);
            }
        },
        {
            label: 'Ver huds',
            handler: () => {
                this.ruteo(pacienteSeleccionado.id, 'huds');
            }
        },
        ];
    }
}
