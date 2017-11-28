import { PrestacionesService } from './../../services/prestaciones.service';
import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit, HostBinding, ViewEncapsulation } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';

@Component({
    selector: 'rup-hudsBusqueda',
    templateUrl: 'hudsBusqueda.html',
    styleUrls: ['hudsBusqueda.scss'],
    // Use to disable CSS Encapsulation for this component
    encapsulation: ViewEncapsulation.None
})
export class HudsBusquedaComponent implements OnInit {

    @Input() paciente: any;
    @Input() prestacionActual: any;

    // TODO: Agregar metodos faltantes, dragEnd() , dragStart() y poder vincularlos
    @Input() _draggable: Boolean = false;
    @Input() _dragScope: String;
    @Input() _dragOverClass: String = 'drag-over-border';
    /**
    * Variable por parametro para mostrar o no todo lo relacionado a emitir conceptos
    */
    @Input() emitirConceptos = true;
    // Outputs de los eventos drag start y drag end
    @Output() _onDragStart: EventEmitter<any> = new EventEmitter<any>();
    @Output() _onDragEnd: EventEmitter<any> = new EventEmitter<any>();

    /**
     * Vista actual
     */
    public vista: 'destacados' | 'problemas' | 'hallazgos' | 'prestaciones' = 'hallazgos';
    /**
     * Listado de prestaciones validadas
     */
    public prestaciones: any = [];
    /**
     * Listado de todos los hallazgos
     */
    public hallazgos: any = [];

    /**
     * Listado de todos los hallazgos
     */
    public hallazgosCronicos: any = [];

    /**
     * Listado de todos los medicamentos
     */
    public medicamentos: any = [];


    /**
     * Listado de todos los hallazgos
     */
    public problemasActivos: any = [];

    /**
         * Listado de todos los hallazgos no activos
         */
    public hallazgosNoActivos: any = [];

    /**
     * Listado de todos los registros de la HUDS seleccionados
     */
    public registrosHuds: any = [];

    /**
     * Devuelve un elemento seleccionado que puede ser
     * una prestacion o un ?????
     */
    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();


    /*
     * Devuelve el array de registros seleccionados para visualizar
     * de la HUDS
     */
    @Output() evtHuds: EventEmitter<any> = new EventEmitter<any>();

    constructor(private servicioPrestacion: PrestacionesService,
        public plex: Plex, public auth: Auth) {
    }

    /**
     * buscamos y listamos las prestaciones o hallazgos del paciente
     *
     * @memberof PrestacionEjecucionComponent
     */
    ngOnInit() {
        if (this.paciente) {
            this.listarPrestaciones();
            this.listarProblemasCronicos();
            // this.listarHallazgos();
            this.listarHallazgosNoActivos();
            this.listarProblemasActivos();
            this.listarMedicamentos();
        }
    }

    dragStart(e) {
        this._onDragStart.emit(e);
    }

    dragEnd(e) {
        this._onDragEnd.emit(e);
    }

    /**
     * Actualiza la vista. En un futuro, podría cargar a demanda los datos requeridos
     *
     * @param {any} vista Vista actual
     * @memberof HudsBusquedaComponent
     */
    actualizarVista(vista) {
        this.vista = vista;
    }

    devolverPrestacion(prestacion) {
        let resultado = {
            tipo: 'prestacion',
            data: prestacion
        };
        this.evtData.emit(resultado);
    }

    devolverHallazgo(hallazgo) {
        let resultado = {
            tipo: 'hallazgo',
            data: hallazgo
        };
        this.evtData.emit(resultado);
    }

    devolverMedicamento(medicamento) {
        let resultado = {
            tipo: 'medicamento',
            data: medicamento
        };
        this.evtData.emit(resultado);
    }

    devolverRegistrosHuds(registro, tipo) {
        let index;
        if (tipo === 'hallazgo' || tipo === 'medicamento') {
            index = this.registrosHuds.findIndex(r => {
                return ((r.tipo === 'hallazgo' || r.tipo === 'medicamento') && r.data.concepto.id === registro.concepto.id);
            });

            switch (registro.concepto.semanticTag) {
                case 'hallazgo':
                case 'trastorno':
                    registro.class = 'problemas';
                    break;
                case 'producto':
                    registro.class = 'productos';
            }
        } else if (tipo === 'prestacion') {
            // Se populan las relaciones usando el _id
            if (registro.ejecucion.registros) {
                registro.ejecucion.registros.forEach(reg => {
                    if (reg.relacionadoCon && reg.relacionadoCon.length > 0) {
                        if (typeof reg.relacionadoCon[0] === 'string') {
                            reg.relacionadoCon = reg.relacionadoCon.map((idRegistroRel) => {
                                return registro.ejecucion.registros.find(r => r.id === idRegistroRel);
                            });
                        }
                    }
                });
            }

            index = this.registrosHuds.findIndex(r => {
                return (r.tipo === 'prestacion' && r.data.id === registro.id);
            });

            registro.class = 'prestacion';
        }

        let elemento = {
            tipo: tipo,
            data: registro
        };

        // si no existe lo agregamos
        if (index === -1) {
            this.registrosHuds.push(elemento);
        } else {
            // si existe lo quitamos
            this.registrosHuds.splice(index, 1);
        }

        this.evtHuds.emit(this.registrosHuds);

    }

    listarPrestaciones() {
        this.servicioPrestacion.getByPaciente(this.paciente.id, false).subscribe(prestaciones => {
            this.prestaciones = prestaciones.filter(p => p.estados[p.estados.length - 1].tipo === 'validada');
        });
    }

    // Trae los hallazgos
    listarHallazgos() {
        this.servicioPrestacion.getByPacienteHallazgo(this.paciente.id, true).subscribe(hallazgos => {
            this.hallazgos = hallazgos;
        });
    }

    // Trae los problemas activos NO activos
    listarHallazgosNoActivos() {
        this.servicioPrestacion.getByPacienteHallazgo(this.paciente.id, true).subscribe(listaHallazgos => {

            this.hallazgosNoActivos = listaHallazgos.filter(h => h.evoluciones[0].estado !== 'activo');
            this.hallazgosNoActivos = this.hallazgosNoActivos.map(element => {
                if (element.evoluciones[0].idRegistroGenerado) {
                    element['transformado'] = listaHallazgos.find(h => h.evoluciones[0].idRegistro === element.evoluciones[0].idRegistroGenerado);
                } return element;
            });
        });
    }

    // Trae los problemas crónicos (por SNOMED refsetId)
    listarProblemasCronicos() {
        this.servicioPrestacion.getByPacienteHallazgo(this.paciente.id, true).subscribe(hallazgos => {
            // Buscamos si es crónico
            this.hallazgosCronicos = hallazgos.filter((hallazgo) => {
                if (hallazgo.concepto && hallazgo.concepto.refsetIds) {
                    return hallazgo.concepto.refsetIds.find(cronico => cronico === this.servicioPrestacion.refsetsIds.cronico);
                }
            });
        });
    }

    // Trae los problemas activos NO crónicos
    listarProblemasActivos() {
        this.servicioPrestacion.getByPacienteHallazgo(this.paciente.id, true).subscribe(hallazgos => {
            this.problemasActivos = hallazgos.filter((hallazgo) => {
                if (hallazgo.evoluciones[0].estado === 'activo') {
                    return (hallazgo.concepto && hallazgo.concepto.refsetIds && hallazgo.concepto.refsetIds.find(cronico => cronico === this.servicioPrestacion.refsetsIds.cronico)) ? false : hallazgo;
                }
            });
        });
    }

    // Trae los medicamentos registrados para el paciente
    listarMedicamentos() {
        this.servicioPrestacion.getByPacienteMedicamento(this.paciente.id, true).subscribe(medicamentos => {
            this.medicamentos = medicamentos;
        });
    }

    buscarTranformacion(transformado) {
        let listaCompleta = [... this.hallazgosNoActivos, ... this.problemasActivos];
        let hallazgoEncontrado = listaCompleta.find(h => h.evoluciones[0].idRegistro === transformado.evoluciones[0].idRegistroGenerado);
        if (hallazgoEncontrado) {
            return hallazgoEncontrado.concepto.term;
        } else {
            return '';
        }
    }

    /**
     * Determina si un hallazgo ya fué cargado en los tabs de la HUDS
     * Para agregarle una clase activa en el listado de hallazgos.
     *
     * @param {any} registro Registro a verificar si esta cargado o no en la HUDS
     * @param {any} tipo hallzago | prestacion
     * @returns boolean
     * @memberof HudsBusquedaComponent
     */
    estaEnTabs(registro, tipo) {
        if (!this.registrosHuds.length) {
            return false;
        }

        for (let i = 0; i < this.registrosHuds.length; i++) {
            const _registro = this.registrosHuds[i].data;

            if (tipo === 'hallazgo' && _registro.concepto && _registro.concepto.conceptId === registro.concepto.conceptId) {
                return true;
            } else if (tipo === 'prestacion' && _registro.id === registro.id) {
                return true;
            }
        }

        return false;
    }
}
