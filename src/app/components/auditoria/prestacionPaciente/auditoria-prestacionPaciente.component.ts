import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import * as moment from 'moment';
import { Auth } from '@andes/auth';
import { IAuditoriaPrestacionPaciente } from './../../../interfaces/auditoria/IAuditoriaPrestacionPaciente';
import { AuditoriaPrestacionPacienteService } from './../../../services/auditoria/auditoriaPrestacionPaciente.service';
import { PrestacionesService } from './../../../modules/rup/services/prestaciones.service';
import { IPrestacion } from '../../../modules/rup/interfaces/prestacion.interface';

@Component({
    selector: 'auditoria-prestacionPaciente',
    templateUrl: 'auditoria-prestacionPaciente.html',
})

export class AuditoriaPrestacionPacienteComponent implements OnInit {

    public autorizado = false;
    showupdate = false;
    auditoriaPP: any = {};
    prestacionesPaciente: any = [];
    auditoriasPPSeleccionadas: IPrestacion[] = [];
    auditoriaPPSeleccionada: any;

    showVistaAuditoriasPP = false;

    value: any;
    skip = 0;
    finScroll = false;
    tengoDatos = true;
    loader = false;

    constructor(private formBuilder: FormBuilder,
        private auditoriaPrestacionPacienteService: AuditoriaPrestacionPacienteService,
        private prestacionPacienteService: PrestacionesService,
        public auth: Auth) { }

    ngOnInit() {
        // this.loadAuditoriasPP();

        this.auditoriaPP = {
            paciente: {
                'createdBy': {
                    'organizacion': {
                        'id': '57e9670e52df311059bc8964',
                        'nombre': 'HOSPITAL PROVINCIAL NEUQUEN - DR. EDUARDO CASTRO RENDON',
                        '_id': '57e9670e52df311059bc8964'
                    },
                    'documento': 31965283,
                    'username': 31965283,
                    'apellido': '31965283',
                    'nombre': '31965283',
                    'nombreCompleto': '31965283 31965283'
                },
                'createdAt': new Date('2017-05-10T11:10:38.666Z'),
                'estado': 'validado',
                'documento': '45883853',
                'nombre': 'PABLO EXEQUIEL',
                'fechaNacimiento': new Date('2004-09-12T03:00:00.000Z'),
                'genero': 'masculino',
                'apellido': 'PEREZ',
                'estadoCivil': null,
                '__v': 0,
                'sexo': 'masculino',
                'scan': 'perez',
                '_id': '5912f52e7b41c2429c958c59',
                'entidadesValidadoras': [
                    'Sisa'
                ],
                'claveBlocking': [
                    'PRSPVL',
                    'PRS',
                    'PVLXKL',
                    '094015475',
                    '094'
                ],
                'financiador': [],
                'relaciones': [],
                'direccion': [
                    {
                        'codigoPostal': '8300',
                        '_id': '58cf323bd816ea2b7cfd6661',
                        'ranking': 1,
                        'ubicacion': {
                            'pais': {
                                'nombre': 'Argentina',
                                '_id': '582074dcde27c98959a5e351'
                            },
                            'provincia': {
                                'nombre': 'Neuquén',
                                '_id': '582074b2de27c98959a5e350'
                            },
                            'localidad': {
                                'nombre': 'Neuquén',
                                '_id': '57f538a472325875a199a82d'
                            },
                            '_id': '58cf323bd816ea2b7cfd6662'
                        },
                        'valor': 'MZA  22 LOTE G-CRNE PISO: 0 MZ: 22 LT: G',
                        'activo': true
                    }
                ],
                'contacto': [
                    {
                        'tipo': 'celular',
                        'ranking': 1,
                        'valor': '155745468',
                        '_id': '58cf323bd816ea2b7cfd6666',
                        'activo': true
                    }
                ],
                'identificadores': [
                    {
                        'entidad': 'SIPS',
                        'valor': '322580'
                    }
                ]
            },
            estado: 'pendiente',
            auditoria: {
                organizacion: this.auth.organizacion,
                auditor: {
                    id: '58f64c9b129fecba1dcb5f00',
                    documento: 21850262,
                    apellido: 'GOLDMAN ROTA',
                    nombre: 'ADELAIDA ANTONIA AMALIA'
                },
                estado: 'pendiente'
            },
            solicitud: null
        };

        this.prestacionPacienteService.get({ paciente: this.auditoriaPP.paciente.id }).subscribe((prestacionesPaciente) => {
            this.prestacionesPaciente = prestacionesPaciente;
        });
    }

    loadAuditoriasPP() {
        this.auditoriaPrestacionPacienteService.get({}).subscribe(
            auditoriaPP => {
                this.auditoriaPP = auditoriaPP;
                this.auditoriasPPSeleccionadas = [];
            },
            err => {
                if (err) {
                    console.log(err);
                }
            });
    }

    auditar(prestacionPaciente: any, multiple, event) {
        this.auditoriaPPSeleccionada = prestacionPaciente;

        this.prestacionPacienteService.getById(prestacionPaciente.id).subscribe(pp => {

            // Actualizo la auditoria global (modelo) y local
            this.auditoriaPPSeleccionada = prestacionPaciente = pp;

            this.auditoriaPPSeleccionada.auditoria = {
                organizacion: this.auth.organizacion,
                auditor: {
                    id: '58f64c9b129fecba1dcb5f00',
                    documento: 21850262,
                    apellido: 'GOLDMAN ROTA',
                    nombre: 'ADELAIDA ANTONIA AMALIA'
                },
                estado: 'pendiente'
            };

            this.showVistaAuditoriasPP = true;

            // console.log(this.auditoriaPPSeleccionada);

            // Para que no rompa la validación, se asegura que no falten estas auditoria
            // if (typeof this.auditoriaPPSeleccionada.auditoria === 'undefined') {
            //     this.auditoriaPPSeleccionada.auditoria.edad = {
            //         desde: {
            //             valor: 0,
            //             unidad: null
            //         },
            //         hasta: {
            //             valor: 0,
            //             unidad: null
            //         }
            //     };
            // } else {
            //     if (typeof this.auditoriaPPSeleccionada.auditoria.edad === 'undefined') {
            //         this.auditoriaPPSeleccionada.auditoria.edad = {};
            //         this.auditoriaPPSeleccionada.auditoria.edad.desde = {
            //             valor: 0,
            //             unidad: null
            //         };
            //         this.auditoriaPPSeleccionada.auditoria.edad.hasta = {
            //             valor: 0,
            //             unidad: null
            //         };
            //     }
            // }


            // Para que no rompa la validación, se asegura que no falten estas auditoria
            // if (!this.auditoriaPPSeleccionada.auditoria.solicitud) {
            //     this.auditoriaPPSeleccionada.auditoria.solicitud = {
            //         requerida: false
            //     };
            //     this.auditoriaPPSeleccionada.auditoria.solicitud.vencimiento = {
            //         valor: 0,
            //         unidad: null
            //     };
            // }

            if (!multiple) {
                this.auditoriasPPSeleccionadas = [];
                this.auditoriasPPSeleccionadas = [...this.auditoriasPPSeleccionadas, pp];
            } else {
                let index;
                if (this.estaSeleccionada(prestacionPaciente)) {
                    index = this.auditoriasPPSeleccionadas.indexOf(prestacionPaciente);
                    this.auditoriasPPSeleccionadas.splice(index, 1);
                    this.auditoriasPPSeleccionadas = [...this.auditoriasPPSeleccionadas];
                } else {
                    this.auditoriasPPSeleccionadas = [...this.auditoriasPPSeleccionadas, pp];
                }
            }

        });

        // this.showVistaAuditoriasPP = true;
    }

    estaSeleccionada(auditoriaPP: any) {
        return this.auditoriasPPSeleccionadas.find(x => x.id === auditoriaPP._id);
    }

    // verAuditoria(auditoriaPP, multiple, e) {

    //     this.auditoriaPrestacionPacienteService.getById(auditoriaPP.id).subscribe(auditoria => {

    //         // Actualizo la auditoria global (modelo) y local
    //         this.auditoriaPPSeleccionada = auditoriaPP = auditoria;

    //         this.showVistaAuditoriasPP = true;

    //         console.log(this.auditoriaPPSeleccionada);

    //         // Para que no rompa la validación, se asegura que no falten estas auditoria
    //         if (typeof this.auditoriaPPSeleccionada.auditoria === 'undefined') {
    //             this.auditoriaPPSeleccionada.auditoria.edad = {
    //                 desde: {
    //                     valor: 0,
    //                     unidad: null
    //                 },
    //                 hasta: {
    //                     valor: 0,
    //                     unidad: null
    //                 }
    //             };
    //         } else {
    //             if (typeof this.auditoriaPPSeleccionada.auditoria.edad === 'undefined') {
    //                 this.auditoriaPPSeleccionada.auditoria.edad = {};
    //                 this.auditoriaPPSeleccionada.auditoria.edad.desde = {
    //                     valor: 0,
    //                     unidad: null
    //                 };
    //                 this.auditoriaPPSeleccionada.auditoria.edad.hasta = {
    //                     valor: 0,
    //                     unidad: null
    //                 };
    //             }
    //         }


    //         // Para que no rompa la validación, se asegura que no falten estas auditoria
    //         if (!this.auditoriaPPSeleccionada.auditoria.solicitud) {
    //             this.auditoriaPPSeleccionada.auditoria.solicitud = {
    //                 requerida: false
    //             };
    //             this.auditoriaPPSeleccionada.auditoria.solicitud.vencimiento = {
    //                 valor: 0,
    //                 unidad: null
    //             };
    //         }

    //         if (!multiple) {
    //             this.auditoriasPPSeleccionadas = [];
    //             this.auditoriasPPSeleccionadas = [...this.auditoriasPPSeleccionadas, auditoria];
    //         } else {
    //             let index;
    //             if (this.estaSeleccionada(auditoriaPP)) {
    //                 index = this.auditoriasPPSeleccionadas.indexOf(auditoriaPP);
    //                 this.auditoriasPPSeleccionadas.splice(index, 1);
    //                 this.auditoriasPPSeleccionadas = [...this.auditoriasPPSeleccionadas];
    //             } else {
    //                 this.auditoriasPPSeleccionadas = [...this.auditoriasPPSeleccionadas, auditoria];
    //             }
    //         }

    //     });

    // }

    cambiarEstado(auditoriaPP: IAuditoriaPrestacionPaciente, key: String, value: any) {
        let patch = {
            key: key,
            value: value
        };

        this.showVistaAuditoriasPP = false;
        this.auditoriaPrestacionPacienteService.patch(auditoriaPP.id, patch).subscribe(auditoria => {
            this.auditoriaPPSeleccionada.auditoria = auditoria;
        });
    }

    saveAuditoriaPP() {
        this.showVistaAuditoriasPP = false;
        this.loadAuditoriasPP();
    }

    // Botón 'Nueva Auditoría'
    nuevaAuditoriaPP() {

        this.auditoriaPP = {
            paciente: {
                'createdBy': {
                    'organizacion': {
                        'id': '57e9670e52df311059bc8964',
                        'nombre': 'HOSPITAL PROVINCIAL NEUQUEN - DR. EDUARDO CASTRO RENDON',
                        '_id': '57e9670e52df311059bc8964'
                    },
                    'documento': 31965283,
                    'username': 31965283,
                    'apellido': '31965283',
                    'nombre': '31965283',
                    'nombreCompleto': '31965283 31965283'
                },
                'createdAt': new Date('2017-05-10T11:10:38.666Z'),
                'estado': 'validado',
                'documento': '45883853',
                'nombre': 'PABLO EXEQUIEL',
                'fechaNacimiento': new Date('2004-09-12T03:00:00.000Z'),
                'genero': 'masculino',
                'apellido': 'PEREZ',
                'estadoCivil': null,
                '__v': 0,
                'sexo': 'masculino',
                'scan': 'perez',
                '_id': '5912f52e7b41c2429c958c59',
                'entidadesValidadoras': [
                    'Sisa'
                ],
                'claveBlocking': [
                    'PRSPVL',
                    'PRS',
                    'PVLXKL',
                    '094015475',
                    '094'
                ],
                'financiador': [],
                'relaciones': [],
                'direccion': [
                    {
                        'codigoPostal': '8300',
                        '_id': '58cf323bd816ea2b7cfd6661',
                        'ranking': 1,
                        'ubicacion': {
                            'pais': {
                                'nombre': 'Argentina',
                                '_id': '582074dcde27c98959a5e351'
                            },
                            'provincia': {
                                'nombre': 'Neuquén',
                                '_id': '582074b2de27c98959a5e350'
                            },
                            'localidad': {
                                'nombre': 'Neuquén',
                                '_id': '57f538a472325875a199a82d'
                            },
                            '_id': '58cf323bd816ea2b7cfd6662'
                        },
                        'valor': 'MZA  22 LOTE G-CRNE PISO: 0 MZ: 22 LT: G',
                        'activo': true
                    }
                ],
                'contacto': [
                    {
                        'tipo': 'celular',
                        'ranking': 1,
                        'valor': '155745468',
                        '_id': '58cf323bd816ea2b7cfd6666',
                        'activo': true
                    }
                ],
                'identificadores': [
                    {
                        'entidad': 'SIPS',
                        'valor': '322580'
                    }
                ]
            },
            auditoria: {
                organizacion: this.auth.organizacion,
                auditor: {
                    id: '58f64c9b129fecba1dcb5f00',
                    documento: 21850262,
                    apellido: 'GOLDMAN ROTA',
                    nombre: 'ADELAIDA ANTONIA AMALIA'
                },
                estado: 'pendiente'
            }
        };

        this.auditoriasPPSeleccionadas = [];
        this.showVistaAuditoriasPP = true;
    }

    cancelaEditarAuditoriaPP() {
        this.showVistaAuditoriasPP = false;
        this.auditoriasPPSeleccionadas = [];
    }

}
