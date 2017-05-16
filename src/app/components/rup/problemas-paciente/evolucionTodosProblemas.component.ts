import { Plex } from '@andes/plex';
import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ProblemaPacienteService } from './../../../services/rup/problemaPaciente.service';
import { TipoProblemaService } from './../../../services/rup/tipoProblema.service';

import { ITipoProblema } from './../../../interfaces/rup/ITipoProblema';
import { ITipoPrestacion } from './../../../interfaces/ITipoPrestacion';

import { IProblemaPaciente } from './../../../interfaces/rup/IProblemaPaciente';

@Component({
    selector: 'rup-evolucionaProblemasTodos',
    templateUrl: 'evolucionTodosProblemas.html'
})
export class EvolucionTodosProblemasComponent implements OnInit {

    @Output() evtData: EventEmitter<IProblemaPaciente[]> = new EventEmitter<IProblemaPaciente[]>();
    @Input() problemas: IProblemaPaciente[];
    vigencia = { id: '', nombre: '...' };
    duracion = { id: '', nombre: '...' };
    unaEvolucion: any = {
        fecha: new Date(),
        observacion: '',
        profesional: null,
        organizacion: null,
        duracion: '',
        vigencia: '',
        segundaOpinion: null
    };

    opcionesDuracion = [{ id: 'Crónico', nombre: 'Crónico' }, { id: 'agudo', nombre: 'Agudo' }];
    opcionesVigencia = [{ id: 'activo', nombre: 'Activo' }, { id: 'Inactivo', nombre: 'Inactivo' }, { id: 'Resuelto', nombre: 'Resuelto' }];


    constructor(private servProbPaciente: ProblemaPacienteService,
        public plex: Plex) { }


    ngOnInit() {
        debugger;
    }

    evolucionar(event) {
      let problema;
        if (event.formValid) {
            this.unaEvolucion.duracion = this.duracion.id;
            this.unaEvolucion.vigencia = this.vigencia.id;
            let cant = this.problemas.length;
            for (let i = 0; i < cant; i++) {
              problema = this.problemas[i];
              delete problema.$order;
              this.problemas[i] = problema;
                this.problemas[i].evoluciones.push(this.unaEvolucion);
            }

            this.servProbPaciente.putAll(this.problemas).subscribe(resultado => {
                if (resultado) {
                    this.plex.alert('Los datos se han modificado correctamente');
                    this.evtData.emit(this.problemas);
                } else {
                    this.plex.alert('Ha ocurrido un error al almacenar la evolución de los problemas');
                }
            });

        } else {
            this.plex.alert('Completar datos requeridos');
        }
    }

    cerrar() {
        this.evtData.emit(this.problemas);
    }

}
