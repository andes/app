import { Plex } from '@andes/plex';
import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProblemaPacienteService } from './../../../services/rup/problemaPaciente.service';
import { PrestacionPacienteService } from './../../../services/rup/prestacionPaciente.service';
import { IPrestacionPaciente } from './../../../interfaces/rup/IPrestacionPaciente';
import { ITipoProblema } from './../../../interfaces/rup/ITipoProblema';
import { IPaciente } from './../../../interfaces/IPaciente';
import { IProblemaPaciente } from './../../../interfaces/rup/IProblemaPaciente';
import { Auth } from '@andes/auth';
import * as moment from 'moment';


@Component({
    selector: 'rup-nuevoProblema',
    templateUrl: 'nuevoProblema.html'
})
export class NuevoProblemaComponent implements OnInit {

    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();
    @Input() problema: IProblemaPaciente;
    @Input() paciente: IPaciente;
    @Input() prestacion: IPrestacionPaciente;
    @Input() tipoProblema: ITipoProblema;

    // public profesional: IProfesional;
    cronico = false;
    descripcion: String = '';
    observacion: String = '';
    fechaIdentificacion: Date = new Date();
    inicioEstimadoUnidad: any = null;
    fechaInicio: Date = new Date();
    estadoActual: any = { id: 'activo', nombre: 'Activo' };
    inicioEstimadoTiempo: any = { id: 'dias', nombre: 'Día(s)' };
    estados      = [{ id: 'resuelto', nombre: 'Resuelto' }, { id: 'inactivo', nombre: 'Inactivo' }, { id: 'activo', nombre: 'Activo' }];
    unidadTiempo = [{ id: 'anios', nombre: 'Año(s)' }, { id: 'mes', nombre: 'Mes(es)' }, { id: 'semanas', nombre: 'Semana(s)' } , { id: 'dias', nombre: 'Día(s)' }  ];


    constructor(private servProbPaciente: ProblemaPacienteService,
                private servicioPrestacion: PrestacionPacienteService,
                public plex: Plex, public auth: Auth) { }


    ngOnInit() {}

    guardarProblema(event) {

       if (event.formValid) {

            // Calculo fecha inicio del problema
            let fecha;
            switch (true) {
                    case (this.inicioEstimadoTiempo.id === 'anios'):
                        fecha = moment().subtract('years', this.inicioEstimadoUnidad);
                        break;
                    case (this.inicioEstimadoTiempo.id === 'mes'):
                        fecha = moment().subtract('months', this.inicioEstimadoUnidad);
                        break;
                    case (this.inicioEstimadoTiempo.id === 'semanas'):
                        fecha = moment().subtract('week', this.inicioEstimadoUnidad);
                        break;
                    case (this.inicioEstimadoTiempo.id === 'dias'):
                        fecha = moment().subtract('days', this.inicioEstimadoUnidad);
                        break;
                    default:
                        fecha = new Date();
            }

            let nuevoProblema: IProblemaPaciente = {
                id: null,
                tipoProblema: this.tipoProblema,
                idProblemaOrigen: null, // Se graba vacío hasta obtener definición
                paciente: this.paciente.id,
                fechaIdentificacion: this.fechaIdentificacion,
                fechaInicio: fecha,
                descripcion: this.descripcion,
                evoluciones: [{
                    fecha: new Date(),
                    observacion: this.observacion || 'Inicio' ,
                    profesional: this.auth.profesional.id,
                    organizacion: this.auth.organizacion.id,
                    cronico: this.cronico,
                    estado: this.estadoActual.id,
                    segundaOpinion: null,
                }]
            };

            // -- Guardo problema en el documento 'problema' y en 'prestacionPaciente' --
            this.servProbPaciente.post(nuevoProblema).subscribe(resultado => {
                if (resultado) { // asignamos el problema a la prestacion de origen
                    this.plex.toast('success', 'El problema fue asociado correctamente a la lista de problemas', 'Problema asociado', 4000);
                    // this.prestacionListaProblemas(resultado.id); // Los asigno a la lista de problemas de la prestación
                    this.evtData.emit(resultado.id);
                } else {
                    this.plex.alert('Error al intentar asociar el problema a la lista de problemas');
                }
            });

        } else {
            this.plex.alert('Completar los campos requeridos');
        } // (event.formValid)
    }

  cerrar() {
        this.evtData.emit(null);
  }

 }
