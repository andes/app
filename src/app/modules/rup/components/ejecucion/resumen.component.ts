import { PrestacionesService } from './../../services/prestaciones.service';
import { Component, Output, Input, EventEmitter, OnInit, HostBinding } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { IPrestacion } from '../../interfaces/prestacion.interface';

@Component({
    selector: 'rup-resumen',
    templateUrl: 'resumen.html'
})

export class ResumenComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;  // Permite el uso de flex-box en el componente
    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();

    public prestacion: any;
    public prestacionesPendientes: IPrestacion[] = [];

    // Para cargar Indicadores
    // public prestacionPeso: IPrestacionPaciente = null;
    // public prestacionTalla: IPrestacionPaciente = null;

    constructor( private servicioPrestacionPaciente: PrestacionesService,
        private router: Router, private route: ActivatedRoute,
        public auth: Auth, private plex: Plex) { }

    ngOnInit() {
        this.route.params.subscribe(params => {
            let id = params['id'];
            this.servicioPrestacionPaciente.getById(id, { showError: false }).subscribe(prestacion => {
                this.prestacion = prestacion;
                // this.loadProblemas();
                this.buscarPrestacionesPendientes();
                // this.cargarIndicadores();
            }, (err) => {
                if (err) {
                    this.plex.info('danger', err, 'Error');
                    this.router.navigate(['/rup']);
                }
            });
        });
    }

    /**
   * Buscar las ultimas 10 prestaciones pendientes del paciente
   *
   * @memberof ResumenComponent
   */
    buscarPrestacionesPendientes() {
        this.servicioPrestacionPaciente.get({ estado: 'pendiente', idPaciente: this.prestacion.paciente.id, limit: 10 })
            .subscribe(prestaciones => {
                this.prestacionesPendientes = prestaciones;
            });
    }

    /**
     * Mostrar indicadores de valores registrados
     *
     * @memberof ResumenComponent
     */
    /*
    cargarIndicadores() {
        // Indicador de Peso
        this.servicioPrestacionPaciente.getByKey({ key: 'peso', idPaciente: this.prestacion.paciente.id })
            .subscribe(prestacion => {
                if (prestacion && prestacion.length > 0) {
                    this.prestacionPeso = prestacion[0];
                }
            });



        // Indicador de Talla
        this.servicioPrestacionPaciente.getByKey({ key: 'talla', idPaciente: this.prestacion.paciente.id })
            .subscribe(prestacion => {
                if (prestacion && prestacion.length > 0) {
                    this.prestacionTalla = prestacion[0];
                }
            });
    }
    */

    /**
     * Para iniciar una ejecución cambiamos estado a ejecución
     *
     * @param {any} id: _id de la prestacion a ejecutar
     *
     * @memberof ResumenComponent
     */
    iniciarPrestacion(id) {

        let cambioEstado: any = {
            op: 'estadoPush',
            estado: {
                fecha: new Date(),
                tipo: 'ejecucion'
            }
        };

        // this.prestacion.estados.push(cambioEstado);

        // Si la prestion tiene problemas en la solicitud,
        // lo cargamos en el listado de problemas a ejecutar en la consulta
        // this.prestacion.ejecucion.listaProblemas = this.prestacion.solicitud.listaProblemas;

        this.servicioPrestacionPaciente.patch(this.prestacion, cambioEstado).subscribe(prestacion => {
            this.router.navigate(['/rup/ejecucion', id]);
        }, (err) => {
            this.plex.toast('danger', 'ERROR: No es posible iniciar la prestación');
        });
    }

    /**
     * Si la prestación ya está en ejecución se redirecciona directamente a ejecutar
     *
     * @param {any} id
     *
     * @memberof ResumenComponent
     */
    verPrestacion(id) {
        // this.showEjecucion = true;
        this.router.navigate(['/rup/ejecucion', id]);
    }

    /**
     * Si la prestacion está validada se redirecciona a la pantalla de validación (no ha ejecución)
     *
     * @param {any} id
     *
     * @memberof ResumenComponent
     */
    verResumen(id) {
        this.router.navigate(['rup/validacion', id]);
    }

    volver(ruta) {
        this.router.navigate([ruta]);
    }

    onReturn(prestacion) {
        // this.loadProblemas();
        this.buscarPrestacionesPendientes();
        // this.cargarIndicadores();
    }

}
