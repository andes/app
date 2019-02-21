import { Component, Output, Input, EventEmitter, OnInit, ViewEncapsulation, OnChanges } from '@angular/core';
import { Plex } from '@andes/plex';
import { PrestacionesService } from '../../../../modules/rup/services/prestaciones.service';
import { InternacionService } from '../services/internacion.service';

@Component({
    selector: 'internacion-resumen',
    templateUrl: 'resumenInternacion.html',
    styleUrls: ['resumenInternacion.scss'],
    encapsulation: ViewEncapsulation.None // Use to disable CSS Encapsulation for this component
})
export class ResumenInternacionComponent implements OnInit, OnChanges {
    private _prestacion: any;
    private _editarEgreso: Boolean;
    @Input() desdeListadoInternacion;
    @Input()
    set prestacion(value: any) {
        this._prestacion = value;
        this.btnIniciarEditar = 'Editar';
        this.editarEgreso = this.editarEgreso ? this.editarEgreso : false;
        this.editarIngreso = false;
        if (this._prestacion.estados[this._prestacion.estados.length - 1].tipo === 'validada') {
            this.puedeEditar = false;
        } else {
            let existeRegistro = this.servicioInternacion.verRegistro(this._prestacion, 'egreso');
            if (!existeRegistro) {
                this.btnIniciarEditar = 'Iniciar';
                this.puedeEditar = true;
            }

        }
    }
    get prestacion(): any {
        return this._prestacion;
    }

    @Input()
    set editarEgreso(value: any) {
        this._editarEgreso = value;
    }
    get editarEgreso(): any {
        return this._editarEgreso;
    }

    @Input() paciente;
    @Input() camaSeleccionada;
    @Input() soloValores;

    @Output() data: EventEmitter<any> = new EventEmitter<any>();
    @Output() refreshCamas: EventEmitter<any> = new EventEmitter<any>();

    public pases;
    public editarIngreso = false;
    public btnIniciarEditar;
    public mostrarValidacion = false;
    // Rotacion flechita
    public flechita = false;
    public puedeEditar = true;

    public conceptoEgreso = this.servicioInternacion.conceptosInternacion.egreso;

    constructor(
        public prestacionesService: PrestacionesService,
        private plex: Plex,
        public servicioInternacion: InternacionService,
    ) { }




    ngOnInit() {
    }

    ngOnChanges(changes) {
        // this.prestacionSelected = Object.assign({}, this.prestacion);
        this.comprobarEgresoParaValidar();
        this.prestacionesService.getPasesInternacion(this.prestacion.id).subscribe(lista => {
            this.pases = lista;
        });

    }

    onBtnIniciarEditar(event) {
        this.btnIniciarEditar = event;
    }

    onEgreso(event) {
        this.prestacion = event;
        this.desocuparCama();
    }


    /**
     * Devuelve el nombre del sector hoja donde esta la cama. Por lo general, debería ser la habitación.
     */
    public getHabitacionName(pase) {
        let sec = pase.sectores;
        if (sec && sec.length > 0) {
            return sec[sec.length - 1].nombre;
        }
        return '';
    }


    /**
     * Emite un false para ocultar el componente
     */
    cancelar() {
        this.data.emit(false);
    }

    editar(param) {
        switch (param) {
            case 'ingreso':
                this.editarIngreso = true;
                break;
            case 'egreso':
                this.editarEgreso = true;
                break;
            default:
                break;
        }
    }

    cierraEditar() {
        this.editarIngreso = false;
        this.editarEgreso = false;
    }

    changeRegistrosPrestacion(event) {
        this.prestacion = event;
    }

    /**
     * Si validamos la prestacion con el informe de egreso cargado
     * desocupamos la cama del paciente
     */
    desocuparCama() {
        let registros = this.prestacion.ejecucion.registros;
        // nos fijamos si el concepto ya aparece en los registros
        let egresoExiste = registros.find(registro => registro.concepto.conceptId === this.conceptoEgreso.conceptId);
        if (egresoExiste && egresoExiste.valor.InformeEgreso.fechaEgreso && egresoExiste.valor.InformeEgreso.tipoEgreso) {
            this.refreshCamas.emit({ cama: this.camaSeleccionada, desocupaCama: true, egresoExiste });
        }
    }

    comprobarEgresoParaValidar() {
        // nos fijamos si el concepto ya aparece en los registros
        let egresoExiste = this.servicioInternacion.verRegistro(this.prestacion, 'egreso');
        if (egresoExiste && this.prestacion.estados[this.prestacion.estados.length - 1].tipo !== 'validada') {
            if (egresoExiste.InformeEgreso.fechaEgreso && egresoExiste.InformeEgreso.tipoEgreso) {
                this.mostrarValidacion = true;
            } else {
                this.mostrarValidacion = false;
            }
        } else {
            this.mostrarValidacion = false;
        }
    }

    /**Validamos la prestacion
     * desocupamos la cama si corresponde
     * y regresamos al mapa de camas
     */
    validar() {
        this.plex.confirm('Luego de validar la prestación ya no podrá editarse.<br />¿Desea continuar?', 'Confirmar validación').then(validar => {
            if (!validar) {
                return false;
            } else {
                let egresoExiste = this.servicioInternacion.verRegistro(this.prestacion, 'egreso');
                if (egresoExiste && this.prestacion.estados[this.prestacion.estados.length - 1].tipo !== 'validada') {
                    if (egresoExiste.InformeEgreso.fechaEgreso && egresoExiste.InformeEgreso.tipoEgreso &&
                        egresoExiste.InformeEgreso.diagnosticoPrincipal) {
                        let planes = [];
                        this.prestacionesService.validarPrestacion(this.prestacion, planes).subscribe(prestacion => {
                            this.prestacion = prestacion;
                            if (this.camaSeleccionada) {
                                this.desocuparCama();
                            } else {
                                this.refreshCamas.emit({ cama: null, desocupaCama: true, egresoExiste });
                            }

                        }, (err) => {
                            this.plex.info('danger', 'ERROR: No es posible validar la prestación');
                        });
                    } else {
                        this.plex.info('danger', 'ERROR: Debe completar los datos mínimos de egreso para validar la internación');
                    }
                } else {
                    this.plex.info('danger', 'ERROR: Debe completar los datos mínimos de egreso para validar la internación');
                }
            }
        });

    }

    romperValidacion() {
        this.plex.confirm('Esta acción puede traer consecuencias <br />¿Desea continuar?', 'Romper validación').then(validar => {
            if (!validar) {
                return false;
            } else {
                // guardamos una copia de la prestacion antes de romper la validacion.
                let prestacionCopia = JSON.parse(JSON.stringify(this.prestacion));
                // Agregamos el estado de la prestacion copiada.
                let estado = { tipo: 'modificada', idOrigenModifica: prestacionCopia.id };
                // Guardamos la prestacion copia
                this.prestacionesService.clonar(prestacionCopia, estado).subscribe(prestacionClonada => {
                    let prestacionModificada = prestacionClonada;
                    // hacemos el patch y luego creamos los planes
                    let cambioEstado: any = {
                        op: 'romperValidacion',
                        estado: { tipo: 'ejecucion', idOrigenModifica: prestacionModificada.id },
                        desdeInternacion: true
                    };
                    // Vamos a cambiar el estado de la prestación a ejecucion
                    this.prestacionesService.patch(this.prestacion.id, cambioEstado).subscribe(prestacion => {
                        this.prestacion = prestacion;

                        this.mostrarValidacion = true;
                        this.refreshCamas.emit({ cama: null, desocupaCama: true });
                    }, (err) => {
                        this.plex.toast('danger', 'ERROR: No es posible romper la validación de la prestación');
                    });
                });
            }
        });
    }


    rotarFlechita(event) {
        this.flechita = !this.flechita;
    }


    // romperValidacion() {
    //     this.plex.confirm('Esta acción puede traer consecuencias <br />¿Desea continuar?', 'Romper validación').then(validar => {
    //         if (!validar) {
    //             return false;
    //         } else {
    //             // guardamos una copia de la prestacion antes de romper la validacion.
    //             // let prestacionCopia = JSON.parse(JSON.stringify(this.prestacion));
    //             const prestacionCopia = this.prestacion;

    //             // Agregamos el estado de la prestacion copiada.
    //             let estado = { tipo: 'modificada', idOrigenModifica: prestacionCopia._id };

    //             // Guardamos la prestacion copia
    //             this.prestacionesService.clonar(prestacionCopia, estado).subscribe(prestacionClonada => {

    //                 let prestacionModificada = prestacionClonada;

    //                 // hacemos el patch y luego creamos los planes
    //                 let cambioEstado: any = {
    //                     op: 'romperValidacion',
    //                     estado: { tipo: 'ejecucion', idOrigenModifica: prestacionModificada.id }
    //                 };


    //                 // Vamos a cambiar el estado de la prestación a ejecucion
    //                 this.prestacionesService.patch(this.prestacion._id, cambioEstado).subscribe(prestacion => {
    //                     this.prestacion = prestacion;
    //                     // chequeamos si es no nominalizada si
    //                     if (!this.prestacion.solicitud.tipoPrestacion.noNominalizada) {
    //                         // actualizamos las prestaciones de la HUDS
    //                         this.prestacionesService.getByPaciente(this.paciente.id, true).subscribe(resultado => {
    //                         });
    //                     } else {
    //                     }

    //                 }, (err) => {
    //                     this.plex.toast('danger', 'ERROR: No es posible romper la validación de la prestación');
    //                 });

    //             });
    //         }

    //     });
    // }

}
