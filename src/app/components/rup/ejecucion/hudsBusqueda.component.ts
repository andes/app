import { IPaciente } from './../../../interfaces/IPaciente';
import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit, HostBinding, ViewEncapsulation } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';

import { PrestacionPacienteService } from './../../../services/rup/prestacionPaciente.service';

@Component({
    selector: 'rup-hudsBusqueda',
    templateUrl: 'hudsBusqueda.html',
     styleUrls: ['hudsBusqueda.css'],
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
     * Devuelve un elemento seleccionado que puede ser 
     * una prestacion o un ?????
     */
    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();

    // Listado de prestaciones validadas
    public prestaciones: any = [];

    // Listado de prestaciones validadas
    public hallazgos: any = [];

    constructor(private servicioPrestacion: PrestacionPacienteService,
        public plex: Plex, public auth: Auth) {
    }

    /**
     * buscamos y listamos las prestaciones o hallazgos del paciente
     *
     * @memberof PrestacionEjecucionComponent
     */
    ngOnInit() {
        if (this.paciente) {
            this.listarProblemasCronicos();
        }

    }


    dragStart(e) {
        this._onDragStart.emit(e);
    }

    dragEnd(e) {
        this._onDragEnd.emit(e);
    }



    devolverPrestacion(prestacion) {
        let resultado = {
            tipo: 'prestacion',
            data: prestacion
        }
        this.evtData.emit(resultado);
    }

    devolverHallazgo(hallazgo) {
        let resultado = {
            tipo: 'hallazgo',
            data: hallazgo
        }
        this.evtData.emit(resultado);
    }


    listarPrestaciones() {
        this.servicioPrestacion.getByPaciente(this.paciente.id,this.prestacionActual).subscribe(prestaciones => {
            this.hallazgos = null;
            this.prestaciones = prestaciones;
        });
    }

    listarHallazgos() {
        this.servicioPrestacion.getByPacienteHallazgo(this.paciente.id,this.prestacionActual).subscribe(hallazgos => {
            this.prestaciones = null;
            this.hallazgos = hallazgos;
        });
    }

    listarProblemasCronicos(){
        this.servicioPrestacion.getByPacienteHallazgo(this.paciente.id,this.prestacionActual).subscribe(hallazgos => {
            this.prestaciones = null;
            this.hallazgos = hallazgos.filter(h => h.evoluciones[h.evoluciones.length - 1].esCronico);
        });
    }




}
