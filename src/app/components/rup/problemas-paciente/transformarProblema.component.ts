import { Plex } from '@andes/plex';
import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ProblemaPacienteService } from './../../../services/rup/problemaPaciente.service';
import { TipoProblemaService } from './../../../services/rup/tipoProblema.service';

import { ITipoProblema } from './../../../interfaces/rup/ITipoProblema';
import { ITipoPrestacion } from './../../../interfaces/ITipoPrestacion';

import { IPrestacionPaciente } from './../../../interfaces/rup/IPrestacionPaciente';
import { IPaciente } from './../../../interfaces/IPaciente';
import { IProblemaPaciente } from './../../../interfaces/rup/IProblemaPaciente';

@Component({
    selector: 'rup-transformarProblema',
    templateUrl: 'transformarProblema.html'
})
export class TransformarProblemaComponent implements OnInit {

    @Output() evtData: EventEmitter<IProblemaPaciente> = new EventEmitter<IProblemaPaciente>();

    @Input() problema: IProblemaPaciente;
    @Input() paciente: IPaciente;
    vigencia = null;
    duracion = null;
    tipoProblema = null;
    nuevoProblemaPaciente: IProblemaPaciente;
    observacion = "";

    opcionesDuracion = [{ id: 'cronico', nombre: 'Crónico' }, { id: 'agudo', nombre: 'Agudo' }];
    opcionesVigencia = [{ id: 'activo', nombre: 'Activo' }, { id: 'Inactivo', nombre: 'Inactivo' }, { id: 'Resuelto', nombre: 'Resuelto' }];


    constructor(private servicioTipoProblema: TipoProblemaService,
        private servicioProblemaPac: ProblemaPacienteService,
        public plex: Plex) { }


    ngOnInit() {
        debugger;
        let evols = this.problema.evoluciones;
    }

    loadTiposProblemas(event) {
        this.servicioTipoProblema.get({}).subscribe(event.callback);
    }

    agregarProblema() {
        let problemasOrigen: String[] = Array();
        problemasOrigen.push(this.problema.id);
        let nuevoProblema: IProblemaPaciente = {
            id: null,
            tipoProblema: this.tipoProblema,
            idProblemaOrigen: problemasOrigen,
            paciente: this.paciente.id,
            fechaInicio: new Date(),
            evoluciones: [
                {
                    fecha: new Date(),
                    observacion: this.observacion,
                    profesional: null,
                    organizacion: null,
                    duracion: this.duracion.id,
                    vigencia: 'activo',
                    segundaOpinion: null
                }
            ]
        };

        this.servicioProblemaPac.post(nuevoProblema).subscribe(resultado => {
            if (resultado) {
                this.nuevoProblemaPaciente = resultado;
                this.evtData.emit(this.nuevoProblemaPaciente);
            } else {
                this.plex.alert('Error al intentar asociar el problema a la consulta');
            }
        });
    }

    transformarProblema(event) {
        debugger;
        if (event.formValid) {
            //Primero cargamos la evolucion en el problema actual y ponemos vigencia = transformado
            var unaEvolucion: any = {
                fecha: new Date(),
                observacion: 'Problema Transformado',
                profesional: null,
                organizacion: null,
                duracion: this.problema.evoluciones[this.problema.evoluciones.length - 1].duracion,
                vigencia: 'transformado',
                segundaOpinion: null
            };
            this.problema.evoluciones.push(unaEvolucion);
            this.servicioProblemaPac.put(this.problema).subscribe(resultado => {
                if (resultado) {
                    //Aqui vamos a cargar el nuevo problema del paciente
                    this.agregarProblema();
                } else {
                    this.plex.alert('Ha ocurrido un error al transformar el problema');
                }

            });
        } else {
            this.plex.alert('Completar datos requeridos');
        }
    }




    cerrar() {
        this.evtData.emit(this.problema);
    }

}