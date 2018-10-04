import { Component, Output, Input, EventEmitter, OnInit, ViewEncapsulation, OnChanges } from '@angular/core';
import { PrestacionesService } from '../../../services/prestaciones.service';
import { Plex } from '@andes/plex';
import { InternacionService } from '../../../services/internacion.service';

@Component({
    selector: 'internacion-resumen',
    templateUrl: 'resumenInternacion.html',
    styleUrls: ['resumenInternacion.scss'],
    encapsulation: ViewEncapsulation.None // Use to disable CSS Encapsulation for this component
})
export class ResumenInternacionComponent implements OnInit, OnChanges {
    @Input() prestacion;
    @Input() paciente;
    @Input() camaSeleccionada;
    @Input() soloValores;
    @Input() editarEgreso;
    @Output() data: EventEmitter<any> = new EventEmitter<any>();
    @Output() refreshCamas: EventEmitter<any> = new EventEmitter<any>();

    public pases;
    public editarIngreso = false;
    public btnIniciarEditar;
    public mostrarValidacion = false;

    public conceptoEgreso = this.servicioInternacion.conceptosInternacion.egreso;

    constructor(
        public prestacionesService: PrestacionesService,
        private plex: Plex,
        public servicioInternacion: InternacionService,
    ) { }




    ngOnInit() { }

    ngOnChanges() {
        this.prestacionesService.getPasesInternacion(this.prestacion.id).subscribe(lista => {
            this.pases = lista;
        });
        this.comprobarEgresoParaValidar();
    }

    onBtnIniciarEditar(event) {
        this.btnIniciarEditar = event;
    }

    onEgreso(event) {
        this.prestacion = event;
        this.comprobarEgresoParaValidar();
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

    cierraEditar(event) {
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
        if (egresoExiste && this.prestacion.estados[this.prestacion.estados.length - 1].tipo === 'validada' &&
            egresoExiste.valor.InformeEgreso.fechaEgreso && egresoExiste.valor.InformeEgreso.tipoEgreso) {
            this.refreshCamas.emit({ cama: this.camaSeleccionada, desocupaCama: true });
        }
    }

    comprobarEgresoParaValidar() {
        let registros = this.prestacion.ejecucion.registros;
        // nos fijamos si el concepto ya aparece en los registros
        let egresoExiste = registros.find(registro => registro.concepto.conceptId === this.conceptoEgreso.conceptId);

        if (egresoExiste && this.prestacion.estados[this.prestacion.estados.length - 1].tipo !== 'validada') {
            if (egresoExiste.valor.InformeEgreso.fechaEgreso && egresoExiste.valor.InformeEgreso.tipoEgreso) {
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
                let planes = [];
                this.prestacionesService.validarPrestacion(this.prestacion, planes).subscribe(prestacion => {
                    this.prestacion = prestacion;
                    this.desocuparCama();
                    this.plex.toast('success', 'La prestación se validó correctamente', 'Información', 300);

                    // this.cancelar();
                }, (err) => {
                    this.plex.toast('danger', 'ERROR: No es posible validar la prestación');
                });
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
                        estado: { tipo: 'ejecucion', idOrigenModifica: prestacionModificada.id }
                    };
                    // Vamos a cambiar el estado de la prestación a ejecucion
                    this.prestacionesService.patch(this.prestacion.id, cambioEstado).subscribe(prestacion => {
                        this.prestacion = prestacion;
                    }, (err) => {
                        this.plex.toast('danger', 'ERROR: No es posible romper la validación de la prestación');
                    });
                });
            }
        });
    }

    // Rotacion flechita
    flechita = false;
    rotarFlechita(event) {
        this.flechita = !this.flechita;
    }

}
