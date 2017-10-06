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

    // Outputs de los eventos drag start y drag end
    @Output() _onDragStart: EventEmitter<any> = new EventEmitter<any>();
    @Output() _onDragEnd: EventEmitter<any> = new EventEmitter<any>();

    /**
     * Vista actual
     */
    public vista: 'destacados' | 'problemas' | 'hallazgos' | 'prestaciones' = 'destacados';
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
     * Listado de todos los hallazgos
     */
    public problemasActivos: any = [];

    /**
         * Listado de todos los hallazgos no activos
         */
    public hallazgosNoActivos: any = [];

    /**
     * Devuelve un elemento seleccionado que puede ser
     * una prestacion o un ?????
     */
    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();

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
            // this.listarProblemasCronicos();
            // this.listarHallazgos();
            this.listarHallazgosNoActivos();
            this.listarProblemasActivos();
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


    listarPrestaciones() {
        this.servicioPrestacion.getByPaciente(this.paciente.id, false).subscribe(prestaciones => {
            this.prestaciones = prestaciones.filter(p => p.estados[p.estados.length - 1].tipo === 'validada');
        });
    }

    listarHallazgos() {
        this.servicioPrestacion.getByPacienteHallazgo(this.paciente.id, true).subscribe(hallazgos => {
            this.hallazgos = hallazgos;
        });
    }

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

    listarProblemasCronicos() {
        this.servicioPrestacion.getByPacienteHallazgo(this.paciente.id, true).subscribe(hallazgos => {
            this.hallazgosCronicos = hallazgos.filter(h => h.evoluciones[0].esCronico);
        });
    }

    listarProblemasActivos() {
        this.servicioPrestacion.getByPacienteHallazgo(this.paciente.id, true).subscribe(hallazgos => {
            this.problemasActivos = hallazgos.filter(h => h.evoluciones[0].estado === 'activo');
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
}
