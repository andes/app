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
    selector: 'rup-evolucionaProblema',
    templateUrl: 'evolucionProblema.html'
})
export class EvolucionProblemaComponent implements OnInit {

    @Output() evtData: EventEmitter<IProblemaPaciente> = new EventEmitter<IProblemaPaciente>();

    @Input() problema: IProblemaPaciente;
    vigencia = null;
    duracion = null;
    unaEvolucion: any = {
        fecha: new Date(),
        observacion: '',
        profesional: this.auth.profesional.id,
        organizacion: this.auth.organizacion.id,
        duracion: '',
        vigencia: '',
        segundaOpinion: null
    };

    public profesional: IProfesional;

    opcionesDuracion = [{ id: 'Crónico', nombre: 'Crónico' }, { id: 'agudo', nombre: 'Agudo' }];
    opcionesVigencia = [{ id: 'activo', nombre: 'Activo' }, { id: 'Inactivo', nombre: 'Inactivo' }, { id: 'Resuelto', nombre: 'Resuelto' }];

    constructor(private servProbPaciente: ProblemaPacienteService,
        public plex: Plex, public auth: Auth) { }


    ngOnInit() {
        let evols = this.problema.evoluciones;
    }

    evolucionarProblema(event) {


        if (event.formValid) {

            if (this.duracion) {
                this.unaEvolucion.duracion = this.duracion.id;
            }

            this.unaEvolucion.vigencia = this.vigencia.id;



            // Guardo los datos del formulario
            this.problema.evoluciones.push(this.unaEvolucion);

            console.log('EV: ', this.problema);

            this.servProbPaciente.put(this.problema).subscribe(resultado => {
                if (resultado) {
                    this.evtData.emit(this.problema);
                } else {
                    this.plex.alert('Ha ocurrido un error al almacenar la evolución');
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