import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { IListaEspera } from './../../../interfaces/turnos/IListaEspera';
import { Plex } from '@andes/plex';
import * as moment from 'moment';

// Interfaces
import { IProfesional } from './../../../interfaces/IProfesional';
import { IPaciente } from './../../../interfaces/IPaciente';

// Services
import { TipoPrestacionService } from './../../../services/tipoPrestacion.service';
import { ListaEsperaService } from '../../../services/turnos/listaEspera.service';
import { ProfesionalService } from './../../../services/profesional.service';
import { PacienteService } from './../../../services/paciente.service';

@Component({
    selector: 'listaEspera-create-update',
    templateUrl: 'listaEspera-create-update.html'
})
export class ListaEsperaCreateUpdateComponent implements OnInit {
    @Output() data: EventEmitter<IListaEspera> = new EventEmitter<IListaEspera>();

    public opciones = {
        prestacion: null,
        profesional: null,
        fecha: null,
        telefono: null,
        observaciones: null,
    };
    createForm: FormGroup;
    // Este paciente hay que reemplazarlo por el que viene de la búsqueda
    paciente: IPaciente;
        /*= { id: '57f66f2076e97c2d18f1808b',
        documento: '20567899',
        apellido: 'García',
        nombre: 'Pablo',
        contacto: [{
            tipo: 'Teléfono Fijo',
            valor: '2995573273',
            ranking: 1,
            activo: true
        }]
    };*/
    pacientesSearch = false;
    checkout = false;

    constructor(
        public formBuilder: FormBuilder,
        public profesionalService: ProfesionalService,
        public pacienteService: PacienteService,
        public listaEsperaService: ListaEsperaService,
        public prestacionService: TipoPrestacionService,
        public plex: Plex,
        private router: Router
    ) { }

    ngOnInit() {
    }

    buscarPaciente() {
        this.pacientesSearch = true;
    }

    onCancel() {
        window.setTimeout(() => this.data.emit(null), 100);
    }

    loadPrestaciones(event) {
        this.prestacionService.get({}).subscribe(event.callback);
    }

    loadProfesionales(event) {
        this.profesionalService.get({}).subscribe(event.callback);
    }

    onSave() {
        let listaEspera: any;
        let operacion: Observable<IListaEspera>;
        let datosPrestacion = {
            id: this.opciones.prestacion.id,
            nombre: this.opciones.prestacion.nombre
        };
        let datosProfesional = !this.opciones.profesional ? null : {
            id: this.opciones.profesional.id,
            nombre: this.opciones.profesional.nombre,
            apellido: this.opciones.profesional.apellido
        };
        let datosPaciente = {
            id: this.paciente.id,
            nombre: this.paciente.nombre,
            apellido: this.paciente.apellido,
            documento: this.paciente.documento
        };
        let fechaActual = moment().format();
        listaEspera = {
            fecha: fechaActual,
            estado: 'Ingreso Manual',
            prestacion: datosPrestacion,
            profesional: datosProfesional,
            paciente: datosPaciente,
        };
        operacion = this.listaEsperaService.post(listaEspera);
        operacion.subscribe(resultado => this.data.emit(resultado));
        return false;
    }

    onReturn(objPaciente: IPaciente): void {
        this.paciente = objPaciente;
        this.pacientesSearch = false;
        this.checkout = true;
    }
}
