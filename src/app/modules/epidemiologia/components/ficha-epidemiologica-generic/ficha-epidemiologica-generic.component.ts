import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { IPaciente } from 'src/app/core/mpi/interfaces/IPaciente';
import { FormsService } from '../../../forms-builder/services/form.service';
import { NgForm } from '@angular/forms';
import { Plex } from '@andes/plex';
import { FormsEpidemiologiaService } from '../../services/ficha-epidemiologia.service';
import { FormPresetResourcesService } from 'src/app/modules/forms-builder/services/preset.resources.service';
import { SECCION_CONTACTOS_ESTRECHOS, SECCION_OPERACIONES, SECCION_USUARIO } from '../../constantes';
import { Observable } from 'rxjs';
import { Auth } from '@andes/auth';
import { OrganizacionService } from 'src/app/services/organizacion.service';
import { DocumentosService } from 'src/app/services/documentos.service';
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
    @Input() accesoHuds: boolean;
    @Input() hideVolver: boolean;
    @ViewChild('form', { static: false }) ngForm: NgForm;
    @Output() volver = new EventEmitter<any>();


    public ficha = [];
    public secciones;
    public descripcion: string;
    public contactosEstrechos = [];
    public contacto = {
        apellidoNombre: '',
        documento: '',
        telefono: '',
        domicilio: '',
        fechaUltimoContacto: '',
        tipoContacto: ''
    };
    public columns = [
        {
            key: 'apellidoNombre',
            label: 'Apellido y Nombre'
        },
        {
            key: 'documento',
            label: 'documento'
        },
        {
            key: 'telefono',
            label: 'Teléfono'
        },
        {
            key: 'domicilio',
            label: 'Domicilio'
        },
        {
            key: 'fechaContacto',
            label: 'Fecha último contacto'
        },
        {
            key: 'tipoContacto',
            label: 'Tipo de contacto'
        },
        {
            key: 'acciones',
            label: 'Acciones'
        }
    ];
    public tipoContacto = [
        { id: 'conviviente', nombre: 'Conviviente' },
        { id: 'laboral', nombre: 'Laboral' },
        { id: 'social', nombre: 'Social' },
        { id: 'noConviviente', nombre: 'Familiar no conviviente' }
    ];
    public nuevoContacto = false;
    public organizaciones$: Observable<any>;
    public asintomatico = false;
    public operaciones = [];
    public zonaSanitaria = null;
    public contactoCorrecto = false;
    public patronDocumento = /^[1-9]{1}[0-9]{4,7}$/;
    public patronContactoNumerico = /^[0-9]{3,4}[0-9]{6}$/;
    public loading = true;
    constructor(
        private formsService: FormsService,
        private plex: Plex,
        private formsEpidemiologiaService: FormsEpidemiologiaService,
        private formPresetResourceService: FormPresetResourcesService,
        private auth: Auth,
        private organizacionService: OrganizacionService,
        private servicioDocumentos: DocumentosService
    ) { }

    ngOnInit(): void { }

    ngOnChanges() {
        this.formsService.search({ name: this.fichaName }).subscribe(res => {
            this.secciones = res[0].sections;
            this.descripcion = res[0].description;
            if (this.fichaPaciente) {

                this.fichaPaciente.secciones.map(sec => {
                    if (sec.name !== SECCION_CONTACTOS_ESTRECHOS && sec.name !== SECCION_OPERACIONES) {
                        const buscado = this.secciones.findIndex(seccion => seccion.name === sec.name);
                        if (buscado !== -1) {
                            if (sec.name === SECCION_USUARIO && this.editFicha) {

                                this.organizaciones$ = this.auth.organizaciones();
                                sec.fields.map(field => {
                                    switch (Object.keys(field)[0]) {
                                        case 'responsable':
                                            this.secciones[buscado].fields[Object.keys(field)[0]] = this.auth.usuario.nombreCompleto;
                                            break;
                                        case 'organizacion':
                                            this.secciones[buscado].fields[Object.keys(field)[0]] = { id: this.auth.organizacion.id, nombre: this.auth.organizacion.nombre };
                                            this.setOrganizacion(this.secciones[buscado], this.auth.organizacion.id);
                                            break;
                                        case 'fechanotificacion':
                                            this.secciones[buscado].fields['fechanotificacion'] = Object.values(field)[0];
                                            break;
                                        case 'funcionusuario':
                                            this.secciones[buscado].fields['funcionusuario'] = Object.values(field)[0];
                                            break;
                                        case 'email':
                                            this.secciones[buscado].fields['email'] = Object.values(field)[0];
                                            break;
                                    }
                                });
                            } else {
                                sec.fields.map(field => {
                                    if (!this.editFicha && Object.keys(field)[0] === 'organizacion') {
                                        this.organizaciones$ = this.organizacionService.getById(field.organizacion.id ? field.organizacion.id : field.organizacion);
                                    }
                                    if (Object.keys(field)[0] === 'clasificacion') {
                                        this.asintomatico = field.clasificacion.id === 'casoAsintomatico' ? true : false;
                                    }
                                    const key = Object.keys(field);
                                    this.secciones[buscado].fields[key[0]] = field[key[0]];
                                });
                            }
                        }
                    } else {
                        if (sec.name === SECCION_OPERACIONES) {
                            this.operaciones = sec.fields;
                        } else {
                            this.contactosEstrechos = sec.fields;
                        }
                    }
                });
            } else {
                this.secciones.forEach(seccion => {
                    if (seccion.preset) {
                        this.formPresetResourceService.setResource(`${seccion.preset}`, seccion, this.paciente);
                    }
                });
            }
            this.loading = false;
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
            },
            configLaboratorio: {
                interopera: this.form ? this.form.config?.interoperaLab : this.fichaPaciente.configLaboratorio.interopera,
                resultado: this.form ? '' : this.fichaPaciente.configLaboratorio?.resultado,
                nroIdentificacion: this.form ? '' : this.fichaPaciente.configLaboratorio?.nroIdentificacion
            }
        };

        if (this.fichaPaciente) {
            this.formsEpidemiologiaService.update(this.fichaPaciente._id, fichaFinal).subscribe({
                next: () => {
                    this.plex.toast('success', 'Su ficha fue actualizada correctamente');
                    this.volver.emit();
                },
                error: () => {
                    this.plex.toast('danger', 'ERROR: La ficha fue actualizada correctamente');
                }
            });
        } else {
            this.formsEpidemiologiaService.save(fichaFinal).subscribe({
                next: (fichaFinal) => {
                    const msg = fichaFinal.configLaboratorio?.interopera ? `La ficha con el identificador: ${fichaFinal.configLaboratorio.nroIdentificacion} fue registrada correctamente` : 'La ficha fue generada correctamente';
                    this.volver.emit();
                    this.plex.info('success', msg);
                },
                error: () => {
                    this.plex.toast('danger', 'ERROR: La ficha no pudo ser registrada');
                }
            });
        }
    }

    checkDependency(field) {
        let res = true;
        if (field.dependency) {
            const seccion = this.secciones.find(seccion => seccion.fields[field.dependency.id]);
            if (!seccion) {
                res = false;
                const seccionBuscada = this.secciones.find(seccion => seccion.fields[field.key]);
                if (seccionBuscada) {
                    seccionBuscada.fields[field.key] = null;
                }
            } else {
                if (field.dependency.valor) {
                    const campo = seccion.fields[field.dependency.id];
                    res = field.dependency.valor === campo || field.dependency.valor === campo?.id;
                }
            }
        }
        return res;
    }

    toBack() {
        this.volver.emit();
    }

    addContacto() {

        this.contactoCorrecto = !!(this.contacto.apellidoNombre && this.contacto.documento && this.contacto.telefono
            && this.contacto.domicilio && this.contacto.fechaUltimoContacto && this.contacto.tipoContacto);

        if (this.contactoCorrecto) {
            const documentoCorrecto = this.patronDocumento.test(this.contacto.documento);
            const telefonoCorrecto = this.patronContactoNumerico.test(this.contacto.telefono);
            if (documentoCorrecto && telefonoCorrecto) {
                this.contactosEstrechos.push(this.contacto);
                this.contacto = {
                    apellidoNombre: '',
                    documento: '',
                    telefono: '',
                    domicilio: '',
                    fechaUltimoContacto: '',
                    tipoContacto: ''
                };
                this.plex.toast('success', 'El contacto estrecho se ha agregado satisfactoriamente!');
            } else {
                this.plex.info('danger', 'Revise los datos ingresados');
            }

        } else {
            this.plex.info('danger', 'Debe completar los datos requeridos');
        }
        this.contactoCorrecto = false;
    }
    deleteContacto(contacto) {
        const index = this.contactosEstrechos.findIndex(item => item.documento === contacto.documento);
        if (index >= 0) {
            this.contactosEstrechos.splice(index, 1);
            this.contactosEstrechos = [...this.contactosEstrechos];
        }
        if (!this.contactosEstrechos?.length) {
            this.nuevoContacto = false;
        }
        this.plex.toast('success', 'Contacto eliminado exitosamente!');
    }
    showNuevoContacto() {
        this.nuevoContacto = true;
    }
    setOrganizacion(seccion, organizacion) {
        const idOrganizacion = organizacion.value ? organizacion.value.id : organizacion;
        this.organizacionService.getById(idOrganizacion).subscribe(res => {
            seccion.fields['telefonoinstitucion'] = res.contacto[0]?.valor;
            seccion.fields['localidad'] = {
                id: res.direccion.ubicacion.localidad.id,
                nombre: res.direccion.ubicacion.localidad.nombre
            };
            seccion.fields['provincia'] = {
                id: res.direccion.ubicacion.provincia.id,
                nombre: res.direccion.ubicacion.provincia.nombre
            };
            this.zonaSanitaria = res.zonaSanitaria;
        });
    }

    descargar() {
        const data = `${this.fichaPaciente.type.name} - ${this.fichaPaciente.paciente.nombre}_${this.fichaPaciente.paciente.apellido}`;
        this.servicioDocumentos.descargarFicha({
            ficha: this.fichaPaciente,
            usuario: this.auth.usuario.nombreCompleto
        }, data).subscribe();
    }
}
