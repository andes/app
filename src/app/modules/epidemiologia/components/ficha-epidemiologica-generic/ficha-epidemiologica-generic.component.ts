import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { IPaciente } from 'src/app/core/mpi/interfaces/IPaciente';
import { FormsService } from '../../../forms-builder/services/form.service';
import { NgForm } from '@angular/forms';
import { Plex } from '@andes/plex';
import { FormsEpidemiologiaService } from '../../services/ficha-epidemiologia.service';


@Component({
    selector: 'app-ficha-epidemiologica-generic',
    templateUrl: './ficha-epidemiologica-generic.component.html'
})
export class FichaEpidemiologicaGenericComponent implements OnInit, OnChanges {
    @Input() fichaName: string;
    @Input() paciente: IPaciente;
    @Input() form: any;
    @Input() fichaPaciente: any;
    @Input() editFicha: boolean;
    @ViewChild('form', { static: false }) ngForm: NgForm;
    @Output() volver = new EventEmitter<any>();


    public ficha = [];
    public secciones;
    constructor(
        private formsService: FormsService,
        private plex: Plex,
        private formsEpidemiologiaService: FormsEpidemiologiaService
    ) { }

    ngOnInit(): void {
    }

    ngOnChanges() {
        this.formsService.search({ name: this.fichaName }).subscribe(res => {
            this.secciones = res[0].sections;
            if (this.fichaPaciente) {
                this.fichaPaciente.secciones.map(sec => {
                    const buscado = this.secciones.findIndex(seccion => seccion.name === sec.name);
                    sec.fields.map(field => {
                        const key = Object.keys(field);
                        this.secciones[buscado].fields[key[0]] = field[key[0]];
                    });
                });
            }
        });
    }

    registrarFicha() {
        if (this.ngForm.invalid) {
            this.plex.info('warning', 'Hay campos obligatorios que no fueron completados', 'Atención');
            this.ngForm.control.markAllAsTouched();
        } else {
            this.getValues();
            this.setFicha();
        }
    }

    getValues() {
        this.secciones.map(seccion => {
            const campos = [];
            seccion.fields.forEach(arg => {
                const params = {};
                const key = arg.key;
                if (key) {
                    const valor = seccion.fields[key];
                    if (valor !== undefined && valor !== null) {
                        params[key] = valor;
                        if (valor instanceof Date) {
                            params[key] = valor;
                        } else {
                            if (valor?.id) {
                                // caso en el que los select usan el select-search.directive que viene con los dos campos
                                if (valor?.nombre) {
                                    params[key] = {
                                        id: valor.id,
                                        nombre: valor.nombre
                                    };
                                } else {
                                    params[key] = valor.id;
                                }
                            } else if (valor === undefined) {
                                params[key] = arg.check;
                            }
                        }
                        campos.push(params);
                    }
                }
            });
            if (campos.length) {
                this.ficha.push({ name: seccion.name, fields: campos });
            }
        });
    }

    setFicha() {
        const type = { id: this.form.id, name: this.form.name };
        const fichaFinal = {
            type,
            secciones: this.ficha,
            paciente: {
                id: this.paciente.id,
                documento: this.paciente.documento,
                nombre: this.paciente.nombre,
                alias: this.paciente.alias,
                apellido: this.paciente.apellido,
                fechaNacimiento: this.paciente.fechaNacimiento,
                estado: this.paciente.estado,
                tipoIdentificacion: this.paciente.tipoIdentificacion ? this.paciente.tipoIdentificacion : this.paciente.numeroIdentificacion ? 'Passport' : null,
                numeroIdentificacion: this.paciente.numeroIdentificacion ? this.paciente.numeroIdentificacion : null,
                direccion: this.paciente.direccion,
                sexo: this.paciente.sexo,
                genero: this.paciente.genero
            }
        };

        if (this.fichaPaciente) {
            this.formsEpidemiologiaService.update(this.fichaPaciente._id, fichaFinal).subscribe(
                () => {
                    this.plex.toast('success', 'Su ficha fue actualizada correctamente');
                    this.volver.emit();
                },
                () => this.plex.toast('danger', 'ERROR: La ficha no pudo ser actualizada')
            );
        } else {
            this.formsEpidemiologiaService.save(fichaFinal).subscribe(
                () => {
                    this.plex.toast('success', 'Su ficha fue registrada correctamente');
                    this.volver.emit();
                },
                () => this.plex.toast('danger', 'ERROR: La ficha no pudo ser registrada')
            );
        }
    }

    checkDependency(field) {
        let res = true;
        if (field.dependency) {
            this.secciones.forEach(seccion => {
                res = seccion.fields[field.dependency.id];
            });
        }
        return res;
    }

    toBack() {
        this.volver.emit();
    }
}
