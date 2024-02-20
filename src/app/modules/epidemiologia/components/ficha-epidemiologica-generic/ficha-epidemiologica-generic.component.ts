import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { IPaciente } from 'src/app/core/mpi/interfaces/IPaciente';
import { FormsService } from '../../../forms-builder/services/form.service';
import { NgForm } from '@angular/forms';
import { Plex } from '@andes/plex';
import { FormsEpidemiologiaService } from '../../services/ficha-epidemiologia.service';
import { FormPresetResourcesService } from 'src/app/modules/forms-builder/services/preset.resources.service';


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
    public descripcion: string;
    constructor(
        private formsService: FormsService,
        private plex: Plex,
        private formsEpidemiologiaService: FormsEpidemiologiaService,
        private formPresetResourceService: FormPresetResourcesService,
    ) { }

    ngOnInit(): void { }

    ngOnChanges() {
        this.formsService.search({ name: this.fichaName }).subscribe(res => {
            this.secciones = res[0].sections;
            this.descripcion = res[0].description;
            if (this.fichaPaciente) {
                this.fichaPaciente.secciones.map(sec => {
                    const buscado = this.secciones.findIndex(seccion => seccion.name === sec.name);
                    sec.fields.map(field => {
                        const key = Object.keys(field);
                        this.secciones[buscado].fields[key[0]] = field[key[0]];
                    });
                });
            } else {
                this.secciones.forEach(seccion => {
                    if (seccion.preset) {
                        this.formPresetResourceService.setResource(`${seccion.preset}`, seccion, this.paciente);
                    }
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
                    let valor = seccion.fields[key];
                    if (key === 'identificadorpcr') {
                        // Regex que empieza sin 0 y tiene solo números.
                        const regexHisop = new RegExp('^[1-9]+[0-9]*$');
                        if (valor && !regexHisop.test(valor)) {
                            const numeroPcr = valor.replace(/[a-z]*0*/i, '');
                            valor = numeroPcr;
                        }
                    }
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
        const type = this.form ? { id: this.form.id, name: this.form.name } : this.fichaPaciente.type;
        const fichaFinal = {
            type,
            secciones: this.ficha,
            config: this.form ? this.form.config : this.fichaPaciente.config,
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
            const seccion = this.secciones.find(seccion => seccion.fields[field.dependency.id]);
            if (!seccion) {
                const seccionBuscada = this.secciones.find(seccion => seccion.fields[field.key]);
                if (seccionBuscada) {
                    seccionBuscada.fields[field.key] = null;
                }
            }
            res = seccion ? true : false;
        }
        return res;
    }

    toBack() {
        this.volver.emit();
    }
}
