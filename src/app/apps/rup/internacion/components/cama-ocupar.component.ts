import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Subject } from 'rxjs/Rx';
import { CamasService } from '../services/camas.service';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { OrganizacionService } from '../../../../services/organizacion.service';
import { InternacionService } from '../services/internacion.service';
import { Router } from '@angular/router';

@Component({
    selector: 'cama-ocupar',
    templateUrl: 'cama-ocupar.html'
})
export class OcuparCamaComponent implements OnInit {

    // Propiedades privadas

    // Propiedades públicas
    public organizacion: any;
    public opcionDesocupar = null;
    public elegirUO = false;
    public fecha = new Date();
    public hora = new Date();
    public listaUnidadesOrganizativas = [];
    public listadoCamas = [];
    public paseAunidadOrganizativa: any;
    public camaSeleccionPase;
    public disponibles = new Subject();


    // Eventos
    // cama sobre la que estamos trabajando
    @Input() cama: any;
    // Internacion (prestacion) que está ocupando la cama
    @Input() prestacion: any;
    @Input() paciente: any;
    @Input() enEspera: any;


    // resultado de la accion realizada sobre la cama
    @Output() accionCama: EventEmitter<any> = new EventEmitter<any>();
    // @Output() verInternacionEmit: EventEmitter<any> = new EventEmitter<any>();


    // Constructor
    constructor(private plex: Plex,
        private auth: Auth,
        private camasService: CamasService,
        public organizacionService: OrganizacionService,
        private internacionService: InternacionService,
        private router: Router) {
        this.disponibles
            .debounceTime(1000)
            .subscribe(val => {
                this.selectCamasDisponibles(this.paseAunidadOrganizativa);
            });

    }

    // Métodos (privados y públicos)

    ngOnInit() {
        this.listadoCamas = null;
        // controlamos que llegue una prestación
        if (this.prestacion) {
            this.opcionDesocupar = null;
            if (this.enEspera) {
                this.paseAunidadOrganizativa = this.enEspera.paseA ? this.enEspera.paseA : null;
            }
            this.organizacionService.getById(this.auth.organizacion.id).subscribe(organizacion => {
                this.organizacion = organizacion;
                this.listaUnidadesOrganizativas = [...this.organizacion.unidadesOrganizativas];
                if (this.listaUnidadesOrganizativas && this.listaUnidadesOrganizativas.length > 1) {
                    this.elegirUO = true;
                    this.selectCamasDisponibles(this.paseAunidadOrganizativa);
                } else {
                    if (this.listaUnidadesOrganizativas && this.listaUnidadesOrganizativas.length === 1) {

                        this.selectCamasDisponibles(this.paseAunidadOrganizativa);
                    }
                }

            });
        } else {
            this.plex.info('danger', 'Parámetros incorrectos', 'Error');
            this.cancelar();
        }

    }

    filtrosOcupar() {
        const fechaActual = new Date();
        const fechaMovimiento = this.internacionService.combinarFechas(this.fecha, this.hora);
        if (fechaMovimiento > fechaActual) {
            this.plex.info('danger', 'La fecha y hora del movimiento no puede ser superior a la fecha actual', 'Error');
            return false;
        }
        // vamos a buscar la fecha de ingreso del paciente y a comprobar que la fecha del movimiento se
        // realiza entre las fecha de ingreso o egreso (esta última en caso que ya esté registrada)
        const ingreso = this.internacionService.verRegistro(this.prestacion, 'ingreso');
        const egreso = this.internacionService.verRegistro(this.prestacion, 'egreso');
        if (!ingreso || (ingreso && ingreso.informeIngreso.fechaIngreso > fechaMovimiento)) {
            this.plex.info('danger', 'La fecha y hora del movimiento no puede ser menor a la fecha de ingreso del paciente', 'Error');
            return false;
        }

        if (egreso) {
            if (egreso.InformeEgreso.fechaEgreso < fechaMovimiento) {
                this.plex.info('danger', 'La fecha y hora del movimiento no puede ser mayor a la fecha de egreso del paciente', 'Error');
                return false;
            }
        }

        return true;
    }

    /**
     * Realizar los cambios de estado usando los datos del formulario y emitir el dato guardado
     *
     * @param {any} $event formulario a validar
     * @memberof TemplateFormComponent
     */

    public ocuparCama(event) {
        if (event.formValid) {
            if (this.filtrosOcupar()) {
                let paciente = this.paciente;
                let idInternacion = this.prestacion.id;
                this.cama = this.camaSeleccionPase;
                if (this.cama) {
                    this.camasService.cambioEstadoMovimiento(this.camaSeleccionPase, 'ocupada', this.internacionService.combinarFechas(this.fecha, this.hora), paciente, idInternacion,
                        this.paseAunidadOrganizativa).subscribe(camaCambio => {
                            this.camaSeleccionPase.ultimoEstado = camaCambio.ultimoEstado;
                            this.accionCama.emit({ cama: this.camaSeleccionPase, accion: 'internarPaciente' });

                        }, (err1) => {
                            this.plex.info('danger', err1, 'Error');
                        });
                } else {
                    this.plex.info('warning', 'Debe seleccionar una cama');
                }

            }
        }
    }

    selectCamasDisponibles(unidadOrganizativa) {
        this.camaSeleccionPase = null;
        this.listadoCamas = null;
        let f = this.internacionService.combinarFechas(this.fecha, this.hora);
        if (this.filtrosOcupar()) {
            if (unidadOrganizativa) {
                this.camasService.getCamasXFecha(this.auth.organizacion.id, f).subscribe(resultado => {
                    if (resultado) {

                        let lista = resultado.filter(c => c.ultimoEstado.estado === 'disponible' && c.ultimoEstado.unidadOrganizativa.conceptId === unidadOrganizativa.conceptId);
                        this.listadoCamas = [...lista];
                    } else {
                        this.listadoCamas = [];
                    }

                });
            }
        }
    }

    routeTo(action, id) {
        this.router.navigate(['rup/' + action + '/', id]);
    }

    cancelar() {
        this.accionCama.emit({ cama: this.cama, accion: 'cancelaAccion' });
    }

}
