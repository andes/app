import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { IPaciente } from '../../../interfaces/IPaciente';

@Component({
    selector: 'rup-consulta-general-clinica-medica',
    templateUrl: 'consultaGeneralClinicaMedica.html'
})
export class ConsultaGeneralClinicaMedicaComponent implements OnInit {

    @Input('tipoPrestacion') tipoPrestacion: any;
    // @Input('paciente') paciente: IPaciente;
    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();

    prestacionConsultaGeneralClinicaMedica: any;
    prestacionSignosVitales: any;
    prestacionTalla: any;
    paciente: any;

    mensaje: String = null;

    data: Object = {};

    ngOnInit() {
        // debugger;
        this.paciente = {
            'id': '588257bce70a44138c44a002',
            'documento': '93155329',
            'estado': 'validado',
            'nombre': 'SERGIO ECIO JUAN',
            'apellido': 'GIORGIS',
            'sexo': 'masculino',
            'genero': 'masculino',
            'fechaNacimiento': '02/11/1993',
            'estadoCivil': '',
            'activo': true
        };

        this.prestacionConsultaGeneralClinicaMedica = {
            'id': '5894657e7358af394f6d52e2',
            'key': 'consultaGeneralClinicaMedica',
            'nombre': 'Consulta general de clínica médica',
            'autonoma': true,
            'activo': true,
            'ejecucion': [
                '5891e543159eb45d71236e52',
                '5890c94d7358af394f6d52da'
            ],
            'componente': 'rup/consulta-general-clinica-medica/consultaGeneralClinicaMedica.componente.ts'
        };

        this.prestacionSignosVitales = {
            'id': '5891e543159eb45d71236e52',
            'key': 'signosVitales',
            'nombre': 'Signos Vitales',
            'autonoma': false,
            'activo': true,
            'ejecucion': [
                '589073500c4eccd05d2a7a44',
                '5890c8aa7358af394f6d52d6',
                '5890c8f77358af394f6d52d7',
                '5890c92c7358af394f6d52d8',
                '5890c93f7358af394f6d52d9',
                '5890ca047358af394f6d52dc'
            ],
            'componente': 'rup/signos-vitales/signosVitales.component.ts'
        };

        this.prestacionTalla = {
            'id': '5890c94d7358af394f6d52da',
            'key': 'talla',
            'nombre': 'Talla',
            'autonoma': false,
            'activo': true,
            'componente': 'rup/talla.component.ts'
        }
    }

    onReturn(valor: Number, tipoPrestacion: any) {
        this.data[this[tipoPrestacion].key] = valor;
        this.evtData.emit(this.prestacionConsultaGeneralClinicaMedica);

        // agregar validaciones aca en base al paciente y el tipo de prestacion
        // if (this.tensionDiastolica > 10){
        // }
    }

}