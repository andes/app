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
    result = false;
    pacienteSelected: any;
    btnSisa = false;
    btnSintys = false;
    btnRenaper = false;
    expand = false;
    resultado: any[];

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
            "entidadesValidadoras": [
                "Sisa"
            ],


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
            "entidadesValidadoras": [
                "Sisa"
            ],
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
            "entidadesValidadoras": [
                "Sisa"
            ],
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
            "entidadesValidadoras": [
                "Sintys"
            ],

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
            "entidadesValidadoras": [
                "Renaper"
            ],
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
            'estado': 'temporal',
            'nombre': 'MAURO LEANDRO',
            'apellido': 'JARA',
            'sexo': 'masculino',
            'genero': 'masculino',
            'fechaNacimiento': moment('1996-06-21T00:00:00.000-03:00'),
            'matchSisa': '0.72',
        },
        {
            'seleccionado': false,
            'documento': '36433556',
            'estado': 'temporal',
            'nombre': 'MARCOS DANIEL',
            'apellido': 'OSMAN',
            'sexo': 'masculino',
            'genero': 'masculino',
            'fechaNacimiento': moment('1991-08-07T00:00:00.000-03:00'),
            'matchSisa': '0.88',

        }, {
            'seleccionado': false,
            'documento': '30096099',
            'estado': 'temporal',
            'nombre': 'RICARDO DANIEL',
            'apellido': 'LOPEZ',
            'sexo': 'masculino',
            'genero': 'masculino',
            'fechaNacimiento': moment('1983-10-27T00:00:00.000-03:00'),
            'matchSisa': '0.82',
        }, {
            'seleccionado': false,
            'documento': '39682204',
            'estado': 'temporal',
            'nombre': 'MAURO LEANDRO',
            'apellido': 'JARA',
            'sexo': 'masculino',
            'genero': 'masculino',
            'fechaNacimiento': moment('1996-06-21T00:00:00.000-03:00'),
            'matchSisa': '0.72',
        },
    ]

    candidatos = [
        {

            'documento': '36945253',
            'estado': 'temporal',
            'nombre': 'VALERIA EDIT',
            'apellido': 'ATENCIO',
            'sexo': 'femenino',
            'genero': 'femenino',
            'fechaNacimiento': moment('1992-08-10T00:00:00.000-03:00'),
            'similitud': '0.88',

        }, {
            'documento': '36945253',
            'estado': 'temporal',
            'nombre': 'EDGARDO GERMAN',
            'apellido': 'RIOS',
            'sexo': 'masculino',
            'genero': 'masculino',
            'fechaNacimiento': moment('1992-08-24T00:00:00.000-03:00'),
            'similitud': '0.82',
        }
    ]

    datosSisa = [
        {

            'documento': '36945224',
            'estado': 'temporal',
            'nombre': 'VALERIA EDIT',
            'apellido': 'ATENCIO',
            'sexo': 'femenino',
            'genero': 'femenino',
            'fechaNacimiento': moment('1992-08-10T00:00:00.000-03:00'),
            'similitud': '0.88',

        }, {
            'documento': '36945253',
            'estado': 'temporal',
            'nombre': 'EDGARDO GERMAN',
            'apellido': 'RIOS',
            'sexo': 'masculino',
            'genero': 'masculino',
            'fechaNacimiento': moment('1992-08-24T00:00:00.000-03:00'),
            'similitud': '0.82',
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

    showLoader() {
        this.result = false;
        this.loading = true;
        setTimeout(() => this.showResult(), 2000);
    }

    validarSisa(band: any, paciente: any) {
        this.showLoader();
        this.resultado = this.datosSisa;
        this.plex.info('warning', '', 'Match Incompleto');
        paciente.entidadesValidadoras.push('Sisa');
        this.seleccionarPaciente(paciente);
    }

    validarSintys(band: any, paciente: any) {
        this.showLoader();
        this.resultado = [];
        this.plex.info('danger', '', 'No Encontrado');
        paciente.entidadesValidadoras.push('Sintys');
        this.seleccionarPaciente(paciente);
    }

    validarRenaper(band: any, paciente: any) {
        this.showLoader();
        this.plex.info('success', '', 'Paciente Validado');
        this.resultado = [
            {
                'documento': paciente.documento,
                'nombre': paciente.nombre,
                'apellido': paciente.apellido,
                'sexo': paciente.sexo,
                'fechaNacimiento': paciente.fechaNacimiento,
                'similitud': '1'
            }
        ]
        paciente.entidadesValidadoras.push('Renaper');
        this.seleccionarPaciente(paciente);
    }


    showResult() {
        this.loading = false;
        this.result = true;

    }

    estaSeleccionado(paciente: any) {
        debugger;
        return this.pacienteSelected === paciente;
    }

    seleccionarPaciente(paciente: any) {
        // this.btnRenaper = false;
        // this.btnSintys = false;
        // this.btnSisa = false;
        this.pacienteSelected = paciente;
        // (this.pacienteSelected.entidadesValidadoras.indexOf('Sisa') >= 0) ? this.btnSisa = true : this.btnSisa = false;
        // (this.pacienteSelected.entidadesValidadoras.indexOf('Renaper') >= 0) ? this.btnRenaper = true : this.btnRenaper = false;
        // (this.pacienteSelected.entidadesValidadoras.indexOf('Sintys') >= 0) ? this.btnSintys = true : this.btnSintys = false;
    }
}
