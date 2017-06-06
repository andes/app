import { Plex } from '@andes/plex';
import { Component, OnInit } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    Validators,
    FormsModule,
    ReactiveFormsModule
} from '@angular/forms';
import { AuditoriaService } from '../../services/auditoria/auditoria.service';
import {
    IAudit
} from '../../interfaces/auditoria/IAudit';
import {
    PacienteService
} from './../../services/paciente.service';
import * as moment from 'moment';
// import {
//   AuditoriaPage
// } from './../../e2e/app.po';

@Component({
    selector: 'auditoria1',
    templateUrl: 'auditoria1.html',
    styleUrls: ['auditoria1.css']
})

export class Auditoria1Component implements OnInit {

    showValidator = false;
    seleccionada = false;
    loading = false;

    pacientesAudit = [
        {
            "seleccionado": false,
            "documento": "36433556",
            "estado": "temporal",
            "nombre": "MARCOS DANIEL",
            "apellido": "OSMAN",
            "sexo": "masculino",
            "genero": "masculino",
            "fechaNacimiento": moment("1991-08-07T00:00:00.000-03:00"),
            "matchSisa": "0.88",

        }, {
            "seleccionado": false,
            "documento": "30096099",
            "estado": "temporal",
            "nombre": "RICARDO DANIEL",
            "apellido": "LOPEZ",
            "sexo": "masculino",
            "genero": "masculino",
            "fechaNacimiento": moment("1983-10-27T00:00:00.000-03:00"),
            "matchSisa": "0.82",
        }, {
            "seleccionado": false,
            "documento": "39682204",
            "estado": "temporal",
            "nombre": "MAURO LEANDRO",
            "apellido": "JARA",
            "sexo": "masculino",
            "genero": "masculino",
            "fechaNacimiento": moment("1996-06-21T00:00:00.000-03:00"),
            "matchSisa": "0.72",
        },
        {
            "seleccionado": false,
            "documento": "36433556",
            "estado": "temporal",
            "nombre": "MARCOS DANIEL",
            "apellido": "OSMAN",
            "sexo": "masculino",
            "genero": "masculino",
            "fechaNacimiento": moment("1991-08-07T00:00:00.000-03:00"),
            "matchSisa": "0.88",

        }, {
            "seleccionado": false,
            "documento": "30096099",
            "estado": "temporal",
            "nombre": "RICARDO DANIEL",
            "apellido": "LOPEZ",
            "sexo": "masculino",
            "genero": "masculino",
            "fechaNacimiento": moment("1983-10-27T00:00:00.000-03:00"),
            "matchSisa": "0.82",
        }, {
            "seleccionado": false,
            "documento": "39682204",
            "estado": "temporal",
            "nombre": "MAURO LEANDRO",
            "apellido": "JARA",
            "sexo": "masculino",
            "genero": "masculino",
            "fechaNacimiento": moment("1996-06-21T00:00:00.000-03:00"),
            "matchSisa": "0.72",
        },
        {
            "seleccionado": false,
            "documento": "36433556",
            "estado": "temporal",
            "nombre": "MARCOS DANIEL",
            "apellido": "OSMAN",
            "sexo": "masculino",
            "genero": "masculino",
            "fechaNacimiento": moment("1991-08-07T00:00:00.000-03:00"),
            "matchSisa": "0.88",

        }, {
            "seleccionado": false,
            "documento": "30096099",
            "estado": "temporal",
            "nombre": "RICARDO DANIEL",
            "apellido": "LOPEZ",
            "sexo": "masculino",
            "genero": "masculino",
            "fechaNacimiento": moment("1983-10-27T00:00:00.000-03:00"),
            "matchSisa": "0.82",
        }, {
            "seleccionado": false,
            "documento": "39682204",
            "estado": "temporal",
            "nombre": "MAURO LEANDRO",
            "apellido": "JARA",
            "sexo": "masculino",
            "genero": "masculino",
            "fechaNacimiento": moment("1996-06-21T00:00:00.000-03:00"),
            "matchSisa": "0.72",
        },
        {
            "seleccionado": false,
            "documento": "36433556",
            "estado": "temporal",
            "nombre": "MARCOS DANIEL",
            "apellido": "OSMAN",
            "sexo": "masculino",
            "genero": "masculino",
            "fechaNacimiento": moment("1991-08-07T00:00:00.000-03:00"),
            "matchSisa": "0.88",

        }, {
            "seleccionado": false,
            "documento": "30096099",
            "estado": "temporal",
            "nombre": "RICARDO DANIEL",
            "apellido": "LOPEZ",
            "sexo": "masculino",
            "genero": "masculino",
            "fechaNacimiento": moment("1983-10-27T00:00:00.000-03:00"),
            "matchSisa": "0.82",
        }, {
            "seleccionado": false,
            "documento": "39682204",
            "estado": "temporal",
            "nombre": "MAURO LEANDRO",
            "apellido": "JARA",
            "sexo": "masculino",
            "genero": "masculino",
            "fechaNacimiento": moment("1996-06-21T00:00:00.000-03:00"),
            "matchSisa": "0.72",
        },
    ]

    candidatos = [
        {

            "documento": "36945224",
            "estado": "temporal",
            "nombre": "VALERIA EDIT",
            "apellido": "ATENCIO",
            "sexo": "femenino",
            "genero": "femenino",
            "fechaNacimiento": moment("1992-08-10T00:00:00.000-03:00"),
            "similitud": "0.88",

        }, {
            "documento": "36945253",
            "estado": "temporal",
            "nombre": "EDGARDO GERMAN",
            "apellido": "RIOS",
            "sexo": "masculino",
            "genero": "masculino",
            "fechaNacimiento": moment("1992-08-24T00:00:00.000-03:00"),
            "similitud": "0.82",
        }, {
            "documento": "32292948",
            "estado": "temporal",
            "nombre": "MARIA SOL",
            "apellido": "FERNANDEZ",
            "sexo": "femenino",
            "genero": "femenino",
            "fechaNacimiento": moment("1986-05-07T00:00:00.000-03:00"),
            "similitud": "0.79",
        }
    ]

    datosSisa = [
        {

            "documento": "36945224",
            "estado": "temporal",
            "nombre": "VALERIA EDIT",
            "apellido": "ATENCIO",
            "sexo": "femenino",
            "genero": "femenino",
            "fechaNacimiento": moment("1992-08-10T00:00:00.000-03:00"),
            "similitud": "0.88",

        }, {
            "documento": "36945253",
            "estado": "temporal",
            "nombre": "EDGARDO GERMAN",
            "apellido": "RIOS",
            "sexo": "masculino",
            "genero": "masculino",
            "fechaNacimiento": moment("1992-08-24T00:00:00.000-03:00"),
            "similitud": "0.82",
        }, {
            "documento": "32292948",
            "estado": "temporal",
            "nombre": "MARIA SOL",
            "apellido": "FERNANDEZ",
            "sexo": "femenino",
            "genero": "femenino",
            "fechaNacimiento": moment("1986-05-07T00:00:00.000-03:00"),
            "similitud": "0.79",
        }
    ]
    constructor(
        private formBuilder: FormBuilder,
        private auditoriaService: AuditoriaService,
        private pacienteService: PacienteService,
        private plex: Plex
    ) { }

    ngOnInit() {

    }

    validar() {
        this.loading = true;
        setTimeout(() => this.showResult(), 2000);
    }

    showResult() {
        this.loading = false;
        this.plex.alert('resultado');
    }
}
