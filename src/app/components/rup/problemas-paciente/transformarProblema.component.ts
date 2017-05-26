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

import { Auth } from '@andes/auth';
import { IProfesional } from './../../../interfaces/IProfesional';

@Component({
    selector: 'rup-transformarProblema',
    templateUrl: 'transformarProblema.html'
})
export class TransformarProblemaComponent implements OnInit {

    @Output() evtData: EventEmitter<IProblemaPaciente[]> = new EventEmitter<IProblemaPaciente[]>();
    @Input() listaProblemas: IProblemaPaciente[];
    @Input() problema: IProblemaPaciente;
    @Input() paciente: IPaciente;
    cronico = null;
    estado = null;
    tipoProblema = null;
    nuevoProblemaPaciente: IProblemaPaciente;
    observacion = '';

    opcionesDuracion = true;
    opcionesVigencia = [{ id: 'activo', nombre: 'Activo' }, { id: 'Inactivo', nombre: 'Inactivo' }, { id: 'Resuelto', nombre: 'Resuelto' }];


    constructor(private servicioTipoProblema: TipoProblemaService,
        private servicioProblemaPac: ProblemaPacienteService,
        public plex: Plex, public auth: Auth) { }


    ngOnInit() {
        let evols = this.problema.evoluciones;
    }

    loadTiposProblemas(event) {
        this.servicioTipoProblema.get({}).subscribe(event.callback);
    }

    existeProblema(tipoProblema: ITipoProblema) {
        return this.listaProblemas.find(elem => elem.tipoProblema.fsn === tipoProblema.fsn);
    }

    agregarProblema() {
        let problemaActivo: IProblemaPaciente;
        let unaEvolucion = {
            fecha: new Date(),
            observacion: this.observacion,
            profesional: null,
            organizacion: null,
            cronico: this.cronico,
            estado: 'activo',
            segundaOpinion: null
        };

        // Chequeamos si ya existe el problema en la lista completa del paciente.
        this.servicioProblemaPac.get({ idPaciente: this.paciente.id, idTipoProblema: this.tipoProblema.id })
            .subscribe(resultado => {
                if (resultado && resultado.length > 0) {
                    problemaActivo = resultado[0];
                    if (problemaActivo.idProblemaOrigen) {
                        problemaActivo.idProblemaOrigen.push(this.problema.id);
                    } else {
                        problemaActivo.idProblemaOrigen = [this.problema.id];
                    }
                    problemaActivo.evoluciones.push(unaEvolucion);
                    this.servicioProblemaPac.put(problemaActivo).subscribe(problema => {
                        if (problema) {
                            if (!this.existeProblema(this.tipoProblema)) {
                                this.listaProblemas.push(problema);
                            }
                            this.evtData.emit(this.listaProblemas);
                        } else {
                            this.plex.alert('Ha ocurrido un error al transformar el problema');
                        }

                    });
                } else {
                    let problemasOrigen: String[] = Array();
                    problemasOrigen.push(this.problema.id);
                    let nuevoProblema: IProblemaPaciente = {
                        id: null,
                        tipoProblema: this.tipoProblema,
                        idProblemaOrigen: problemasOrigen,
                        paciente: this.paciente.id,
                        fechaIdentificacion: null, //ver despues
                        descripcion: null, //ver despues
                        fechaInicio: new Date(),
                        evoluciones: [unaEvolucion]
                    };

                    this.servicioProblemaPac.post(nuevoProblema).subscribe(unProblema => {
                        if (unProblema) {
                            this.nuevoProblemaPaciente = unProblema;
                            this.listaProblemas.push(this.nuevoProblemaPaciente);
                            this.evtData.emit(this.listaProblemas);
                        } else {
                            this.plex.alert('Error al intentar asociar el problema a la consulta');
                        }
                    });
                }
            });
        // }

    }

    transformarProblema(event) {
        if (event.formValid) {
            // Primero cargamos la evolucion en el problema actual y ponemos vigencia = transformado
            let unaEvolucion: any = {
                fecha: new Date(),
                observacion: 'Problema Transformado',
                profesional: null,
                organizacion: null,
                cronico: this.problema.evoluciones[this.problema.evoluciones.length - 1].cronico,
                estado: 'transformado',
                segundaOpinion: null
            };
            this.problema.evoluciones.push(unaEvolucion);


            this.servicioProblemaPac.put(this.problema).subscribe(resultado => {
                if (resultado) {
                    // Aqui vamos a cargar el nuevo problema del paciente
                    this.listaProblemas = this.listaProblemas.filter(p => { return p.id !== this.problema.id; });
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
        this.evtData.emit(null);
    }

}