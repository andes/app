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
    selector: 'rup-enmendarProblema',
    templateUrl: 'enmendarProblema.html'
})
export class EnmendarProblemaComponent implements OnInit {

    @Output() evtData: EventEmitter<IProblemaPaciente> = new EventEmitter<IProblemaPaciente>();
    @Input() problema: IProblemaPaciente;
    unaEvolucion: any = {
        fecha: new Date(),
        observacion: '',
        profesional: this.auth.profesional.id,
        organizacion: this.auth.organizacion.id,
        duracion: '',
        vigencia: '',
        segundaOpinion: null
    };

    constructor(private servProbPaciente: ProblemaPacienteService,
        public plex: Plex, public auth: Auth) { }


    ngOnInit() {
        let evols = this.problema.evoluciones;
    }

    enmendarProblema(event) {
        if (event.formValid) {
            this.unaEvolucion.duracion = this.problema.evoluciones[this.problema.evoluciones.length - 1].duracion;
            this.unaEvolucion.vigencia = 'enmendado';
            this.problema.evoluciones.push(this.unaEvolucion);

            this.servProbPaciente.put(this.problema).subscribe(resultado => {
                if (resultado) {
                    this.plex.alert('Los datos se cargaron correctamente');
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
        this.evtData.emit(null);
    }

}
