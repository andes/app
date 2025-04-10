import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SnomedService } from 'src/app/apps/mitos/services/snomed.service';
import { IPaciente } from 'src/app/core/mpi/interfaces/IPaciente';
import { PacienteService } from 'src/app/core/mpi/services/paciente.service';
import { LocalidadService } from 'src/app/services/localidad.service';
import { PaisService } from 'src/app/services/pais.service';
import { ProvinciaService } from 'src/app/services/provincia.service';
import { InstitucionService } from 'src/app/services/turnos/institucion.service';
import { VacunasService } from 'src/app/services/vacunas.service';
import { OrganizacionService } from '../../../../services/organizacion.service';
import { FormsService } from '../../../forms-builder/services/form.service';
import { FormsEpidemiologiaService } from '../../services/ficha-epidemiologia.service';
import { ElementosRUPService } from 'src/app/modules/rup/services/elementosRUP.service';
import { PrestacionesService } from 'src/app/modules/rup/services/prestaciones.service';
import { SECCION_CLASIFICACION, SECCION_CONTACTOS_ESTRECHOS, SECCION_MPI, SECCION_OPERACIONES, SECCION_USUARIO } from '../../constantes';
import { PacientesVacunasService } from 'src/app/services/pacientes-vacunas.service';
import { DocumentosService } from 'src/app/services/documentos.service';

@Component({
    selector: 'app-ficha-epidemiologica-crud',
    templateUrl: './ficha-epidemiologica-crud.component.html'
})
export class FichaEpidemiologicaCrudComponent implements OnInit, OnChanges {
    @Input() paciente: IPaciente;
    @Input() fichaPaciente: any;
    @Input() editFicha: boolean;
    @Input() hideVolver: boolean;
    @Input() fichaName: string;
    @Input() form: any;
    @Input() volverBuscador: boolean;
    @Input() accesoHuds: boolean;
    @Output() volver = new EventEmitter<any>();
    @ViewChild('form', { static: false }) ngForm: NgForm;

    public laborPersonalSalud = [
        { id: 'asistencial', nombre: 'Asistencial' },
        { id: 'administrativa', nombre: 'Administrativa' }
    ];
    public funcionPersonalSalud = [
        { id: 'tecnico', nombre: 'Técnico/Auxiliar con función asistencial' },
        { id: 'profesional', nombre: 'Profesional con función asistencial' },
        { id: 'noAsistencial', nombre: 'Profesional con función no asistencial' },
        { id: 'admin', nombre: 'Trabajador de la salud con función administrativa' }
    ];
    public funcionSeguridad = [
        { id: 'policia', nombre: 'Policía' },
        { id: 'gendarmeria', nombre: 'Gendarmería' },
        { id: 'penitenciario', nombre: 'Penitenciario' },
        { id: 'ejercito', nombre: 'Ejército' }
    ];
    public tipoContacto = [
        { id: 'conviviente', nombre: 'Conviviente' },
        { id: 'laboral', nombre: 'Laboral' },
        { id: 'social', nombre: 'Social' },
        { id: 'noConviviente', nombre: 'Familiar no conviviente' }
    ];
    public tipoInstitucion = [
        { id: 'residencia', nombre: 'Residencia de larga estadía' },
        { id: 'hogarMenores', nombre: 'Hogar de niños, niñas y adolescentes' },
        { id: 'carcel', nombre: 'Penal/Penitenciaría' },
        { id: 'militar', nombre: 'Instituciones militares/Gendarmería' },
        { id: 'rehabilitacion', nombre: 'Instituciones de rehabilitación/neurorehabilitación' },
        { id: 'otros', nombre: 'Otros' }
    ];

    public clasificacion = [
        { id: 'casoSospechoso', nombre: 'Caso sospechoso' },
        { id: 'controlAlta', nombre: 'Control de alta' },
        { id: 'casoAsintomatico', nombre: 'Caso asintomático estudiado en situaciones especiales' }
    ];
    public segundaClasificacion = [
        { id: 'autotest', nombre: 'Autotest' },
        { id: 'antigeno', nombre: 'Antígeno COVID-19' },
        { id: 'pcr', nombre: 'PCR-RT' },
        { id: 'lamp', nombre: 'LAMP COVID-19 (Neokit)' },
        { id: 'ifi', nombre: 'IFI' },
    ];
    public tipoMuestra = [
        { id: 'aspirado', nombre: 'Aspirado' },
        { id: 'hisopado', nombre: 'Hisopado' },
        { id: 'esputo', nombre: 'Esputo' },
        { id: 'lavadoBroncoalveolar', nombre: 'Lavado broncoalveolar' },
    ];
    public resultadoAntigeno = [
        { id: 'confirmado', nombre: 'Reactivo' },
        { id: 'muestra', nombre: 'No reactivo' }
    ];
    public resultadoDetectable = [
        { id: 'confirmado', nombre: 'Se detecta genoma de SARS-CoV-2' },
        { id: 'descartado', nombre: 'No se detecta genoma de SARS-CoV-2' },
        { id: 'muestra', nombre: 'Muestra tomada' }
    ];
    public estadoCovid = [
        { id: 'completa', nombre: 'Completa' },
        { id: 'incompleta', nombre: 'Incompleta' }
    ];
    public reqCuidado = [
        { id: 'ambulatorio', nombre: 'Ambulatorio' },
        { id: 'salaGeneral', nombre: 'Internación Sala General' },
        { id: 'uce', nombre: 'Internación UCE' },
        { id: 'ut', nombre: 'Internación UT Intermedia' },
        { id: 'uti', nombre: 'Internación UTI' },
    ];
    public selectGral = [
        { id: 'si', nombre: 'SI' },
        { id: 'no', nombre: 'NO' }
    ];

    public contacto = {
        apellidoNombre: '',
        dni: '',
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
            key: 'dni',
            label: 'Dni'
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


    public fields = [];
    public fieldSelected;
    public organizaciones$: Observable<any>;
    public secciones = [];
    public ficha = [];
    public telefono = null;
    public contactosEstrechos = [];
    public operaciones = [];
    public nuevoContacto = false;
    public zonaSanitaria = null;
    public localidades$: Observable<any>;
    public provincias$: Observable<any>;
    public institucionesEducativas$: Observable<any>;
    public residencias$: Observable<any>;
    public paises$: Observable<any>;
    public organizacionesInternacion$: Observable<any>;
    public vacunas$: Observable<any>;
    public estaInternado = false;
    public asintomatico = false;
    public showFichaParcial = false;
    public patronPCR = '([A-Za-z])*([0-9]+$)+';
    private clasificacionOriginal;
    public loading = true;

    constructor(
        private formsService: FormsService,
        private formEpidemiologiaService: FormsEpidemiologiaService,
        private localidadService: LocalidadService,
        private provinciaService: ProvinciaService,
        private plex: Plex,
        private auth: Auth,
        private organizacionService: OrganizacionService,
        private router: Router,
        private snomedService: SnomedService,
        public servicePaciente: PacienteService,
        public serviceInstitucion: InstitucionService,
        private paisService: PaisService,
        private vacunasService: VacunasService,
        private prestacionesService: PrestacionesService,
        private elementoRupService: ElementosRUPService,
        private pacientesVacunasService: PacientesVacunasService,
        private servicioDocumentos: DocumentosService
    ) { }

    ngOnChanges(): void {
        this.contactosEstrechos = [];
        this.operaciones = [];
        this.formsService.search({ name: this.fichaName }).subscribe((ficha: any) => {
            this.secciones = ficha[0].sections;

            if (this.fichaPaciente) { // caso en el que es una ficha a editar/visualizar
                const seccionClasificacion = this.formEpidemiologiaService.getSeccionClasifacionFinal(this.fichaPaciente);
                this.clasificacionOriginal = seccionClasificacion?.fields?.find(f => f.clasificacionfinal)?.clasificacionfinal;

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
                            this.loading = false;
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
                this.setFields();
            }
        });
    }

    ngOnInit(): void {
        // Pregunta por el permiso de huds para el caso en el que se visualiza una ficha desde la huds y no tiene permisos de epidemiologia
        if (!this.auth.getPermissions('epidemiologia:?').length && !this.auth.check('huds:visualizacionHuds')) {
            this.router.navigate(['inicio']);
        }
        this.provincias$ = this.provinciaService.get({});
        this.paises$ = this.paisService.get({});
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
            let campos = [];
            if (seccion.name === SECCION_CONTACTOS_ESTRECHOS) {
                campos = this.contactosEstrechos;
            } else if (seccion.name === SECCION_OPERACIONES) {
                campos = this.operaciones;
            } else {
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
            }
            if (campos.length) {
                const buscado = this.ficha.findIndex(sec => sec.name === seccion.name);
                if (buscado !== -1) {
                    // si ya existe la sección, la reemplazo
                    this.ficha[buscado] = { name: seccion.name, fields: campos };
                } else {
                    this.ficha.push({ name: seccion.name, fields: campos });
                }
            }
        });
    }

    setFicha() {
        const type = this.form ? { id: this.form.id, name: this.form.name } : this.fichaPaciente.type;
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
            },
            zonaSanitaria: this.zonaSanitaria
        };
        const contactosPaciente = fichaFinal.secciones.find(elem => elem.name === SECCION_MPI);
        if (contactosPaciente) {
            this.setMpiPaciente(contactosPaciente.fields);
        }

        if (this.fichaPaciente) {
            this.formEpidemiologiaService.update(this.fichaPaciente._id, fichaFinal).subscribe({
                next: (fichaFinal) => {
                    this.plex.toast('success', 'Su ficha fue actualizada correctamente');
                    this.postSave(fichaFinal);
                },
                error: () => {
                    this.plex.toast('danger', 'ERROR: La ficha no pudo ser actualizada');
                }
            });
        } else {
            this.formEpidemiologiaService.save(fichaFinal).subscribe({
                next: (fichaFinal) => {
                    const msg = fichaFinal.configLaboratorio?.interopera ? `La ficha con el identificador: ${fichaFinal.configLaboratorio.nroIdentificador} fue registrada correctamente` : 'La ficha fue generada correctamente';
                    this.plex.info('success', msg);
                    this.postSave(fichaFinal);
                },
                error: () => {
                    this.plex.toast('danger', 'ERROR: La ficha no pudo ser registrada');
                }
            });
        }
    }

    setFields() {
        this.organizaciones$ = this.auth.organizaciones();
        this.secciones.map(seccion => {
            switch (seccion.id) {
                case 'usuario':
                    seccion.fields['responsable'] = this.auth.usuario.nombreCompleto;
                    seccion.fields['organizacion'] = { id: this.auth.organizacion.id, nombre: this.auth.organizacion.nombre };
                    seccion.fields['fechanotificacion'] = new Date();
                    this.setOrganizacion(seccion, this.auth.organizacion.id);
                    break;
                case 'clasificacionFinal':
                    seccion.fields['fechamuestra'] = new Date();
                    break;
                case 'informacionClinica':
                    seccion.fields['establecimientoconsulta'] = {
                        id: this.auth.organizacion.id,
                        nombre: this.auth.organizacion.nombre
                    };
                    seccion.fields['fechaprimerconsulta'] = new Date();
                    break;
                case 'mpi':
                    this.paises$.pipe(
                        map(paises => {
                            seccion.fields['nacionalidad'] = paises.find(pais => pais.nombre === 'Argentina');
                        })).subscribe();
                    if (this.paciente.direccion) {
                        seccion.fields['direccioncaso'] = this.paciente.direccion[0].valor ? this.paciente.direccion[0].valor : '';
                        seccion.fields['lugarresidencia'] = this.paciente.direccion[0].ubicacion.provincia ? this.paciente.direccion[0].ubicacion.provincia : '';
                        seccion.fields['localidadresidencia'] = this.paciente.direccion[0].ubicacion.localidad ? this.paciente.direccion[0].ubicacion.localidad : '';
                        this.setLocalidades({ provincia: this.paciente.direccion[0].ubicacion.provincia?.id });
                    }
                    break;
                case 'antecedentesEpidemiologicos':
                    this.setEstadoVacunacion(seccion.fields);
                    break;
            }
        });
    }

    // Funcion para calcular automáticamente la clasificacion final segun resultados de los hisopados
    resultadoFinal(key) {
        this.secciones.map(seccion => {
            if (seccion.id === 'clasificacionFinal') {
                const clasificaciones = {
                    segundaclasificacion: this.checkConfirmados(seccion.fields['segundaclasificacion']),
                    antigeno: seccion.fields['antigeno']?.id,
                    ifi: seccion.fields['ifi']?.id,
                    pcrM: seccion.fields['pcrM'] ? 'muestra' : '',
                    pcr: seccion.fields['pcr']?.id,
                    lamp: seccion.fields['lamp']?.id
                };
                if (this.checkConfirmados(seccion.fields['segundaclasificacion']) === 'confirmado') {
                    this.clearDependencias({ value: false }, seccion.id, ['tipomuestra', 'fechamuestra', 'antigeno', 'ifi', 'lamp', 'pcrM', 'pcr', 'identificadorpcr']);
                } else {
                    if (!seccion.fields['fechamuestra']) {
                        seccion.fields['fechamuestra'] = new Date();
                    }
                }
                if (clasificaciones.antigeno === 'confirmado' || clasificaciones.ifi === 'confirmado') {
                    seccion.fields['lamp'] = null;
                }
                if (!this.asintomatico) {
                    switch (clasificaciones[key]) {
                        case 'confirmado':
                            seccion.fields['clasificacionfinal'] = 'Confirmado';
                            break;
                        case 'descartado':
                            seccion.fields['clasificacionfinal'] = 'Descartado';
                            break;
                        case 'muestra':
                            seccion.fields['clasificacionfinal'] = (clasificaciones.antigeno === 'confirmado' || clasificaciones.ifi === 'confirmado') ? 'Confirmado' : 'Sospechoso';
                            break;
                        default:
                            if (!clasificaciones.antigeno && !clasificaciones.ifi && !clasificaciones.pcr && !clasificaciones.lamp) {
                                seccion.fields['clasificacionfinal'] = '';
                            }
                            break;
                    }
                }
            }
        });
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

    postSave(fichaFinal) {
        const seccionClasificacion = this.ficha.find(seccion => seccion.name === SECCION_CLASIFICACION);
        const clasificacionFinal = seccionClasificacion?.fields?.find(f => f.clasificacionfinal)?.clasificacionfinal;
        if (this.puedeRegistrar(clasificacionFinal)) {
            this.registrarPrestacion(fichaFinal);
        } else {
            this.volver.emit();
        }
    }

    private puedeRegistrar(clasificacionFinal) {
        return this.auth.profesional && clasificacionFinal !== this.clasificacionOriginal && clasificacionFinal !== 'Descartado' && clasificacionFinal !== 'Caso asintomático';
    }

    private registrarPrestacion(ficha) {
        const concepto = this.elementoRupService.getConceptoSeguimientoCOVID();
        const elemento = this.elementoRupService.buscarElemento(concepto, false);
        const registrosEjecucion = this.formEpidemiologiaService.getConceptosCovid(ficha).map((c: any) => ({
            concepto: c,
            elementoRUP: elemento.id,
            nombre: c.term,
            esSolicitud: false
        })
        );

        const nuevaPrestacion = this.prestacionesService.inicializarPrestacion(this.paciente, concepto, 'ejecucion', 'ambulatorio', new Date(), null, null, registrosEjecucion);
        this.prestacionesService.post(nuevaPrestacion).subscribe(prestacion => {
            if (this.volverBuscador) {
                this.prestacionesService.notificaRuta({ nombre: 'EPIDEMIOLOGÍA', ruta: 'epidemiologia/buscador-ficha-epidemiologica' });
            } else {
                this.prestacionesService.notificaRuta({ nombre: 'EPIDEMIOLOGÍA', ruta: 'epidemiologia/ficha-epidemiologica' });
            }
            this.router.navigate(['rup/ejecucion', prestacion.id]);
        });
    }

    toBack() {
        this.volver.emit();
    }

    showNuevoContacto() {
        this.nuevoContacto = true;
    }

    addContacto() {
        this.contactosEstrechos.push(this.contacto);
        this.contacto = {
            apellidoNombre: '',
            dni: '',
            telefono: '',
            domicilio: '',
            fechaUltimoContacto: '',
            tipoContacto: ''
        };
        this.nuevoContacto = false;
    }

    deleteContacto(contacto) {
        const index = this.contactosEstrechos.findIndex(item => item.dni === contacto.dni);
        if (index >= 0) {
            this.contactosEstrechos.splice(index, 1);
            this.contactosEstrechos = [...this.contactosEstrechos];
        }
    }

    setLocalidades(event) {
        if (event.value) {
            this.clearDependencias({ value: false }, 'mpi', ['localidadresidencia']);
            this.localidades$ = this.localidadService.get({ codigo: event.value.codigo });
        } else if (event.provincia) {
            // setea el combo de localidades cuando se cargan los datos de mpi,en este momento no tengo el código de provincia
            this.localidades$ = this.localidadService.getXProvincia(event.provincia);
        }
    }

    clearDependencias(event, idSeccion, keys) {
        if (event.value?.id === 'no' || event.value === false) {
            this.secciones.map(seccion => {
                if (seccion.id === idSeccion) {
                    if (keys.length) {
                        keys.map(element => {
                            if (seccion.fields[element]) {
                                seccion.fields[element] = null;
                            }
                        });
                    } else {
                        seccion.fields.map(element => {
                            if (seccion.fields[element.key]) {
                                seccion.fields[element.key] = null;
                            }
                        });
                    }
                }
            });
        }
    }

    getSnomed(query, event) {
        this.snomedService.getQuery({ expression: query }).subscribe(res => {
            event.callback(res);
        });
    }

    setMpiPaciente(contactosPaciente) {
        const nuevoContacto = contactosPaciente.find(elem => (Object.keys(elem))[0] === 'telefonocaso');
        this.addContactoMpi('celular', nuevoContacto.telefonocaso);
        const dirPaciente = contactosPaciente.find(elem => (Object.keys(elem))[0] === 'direccioncaso');
        const provinciaPaciente = contactosPaciente.find(elem => (Object.keys(elem))[0] === 'lugarresidencia');
        const localidadPaciente = contactosPaciente.find(elem => (Object.keys(elem))[0] === 'localidadresidencia');
        if (this.setDireccion({ dirPaciente, provinciaPaciente, localidadPaciente })) {
            const nuevaDireccion = {
                valor: dirPaciente.direccioncaso,
                ultimaActualizacion: new Date(),
                activo: true,
                ubicacion: {
                    localidad: localidadPaciente.localidadresidencia,
                    provincia: provinciaPaciente.lugarresidencia,
                    barrio: null,
                    pais: null
                },
                codigoPostal: this.paciente.direccion ? this.paciente.direccion[0].codigoPostal : null,
                ranking: 0,
                geoReferencia: this.paciente.direccion ? this.paciente.direccion[0].geoReferencia : null
            };
            (this.paciente.direccion) ? this.paciente.direccion[0] = nuevaDireccion : this.paciente.direccion = [nuevaDireccion];
        }
        this.servicePaciente.save(this.paciente).subscribe();
    }

    addContactoMpi(key, value) {
        const nuevo = {
            tipo: key,
            valor: value,
            ranking: 1,
            activo: true,
            ultimaActualizacion: new Date()
        };
        if (this.paciente.contacto) {
            const index = this.paciente.contacto.findIndex(item => item.tipo === key);
            (index >= 0) ? this.paciente.contacto[index].valor = value : this.paciente.contacto.push(nuevo);
        } else {
            this.paciente.contacto = [nuevo];
        }
    }

    setDireccion(nuevaDir) {
        return (this.paciente.direccion ? nuevaDir.dirPaciente.direccioncaso !== this.paciente.direccion[0]?.valor ||
            nuevaDir.provinciaPaciente.lugarresidencia.id !== this.paciente.direccion[0].ubicacion?.provincia?.id ||
            nuevaDir.localidadPaciente.localidadresidencia.id !== this.paciente.direccion[0].ubicacion?.localidad?.id : true);
    }

    pacienteInternado(event) {
        this.estaInternado = event.value.id === 'salaGeneral' || event.value.id === 'uce' ||
            event.value.id === 'ut' || event.value.id === 'uti';
        if (this.estaInternado) {
            this.organizacionesInternacion$ = this.organizacionService.get({ aceptaDerivacion: true });
        }
        return this.estaInternado;
    }

    getInstituciones(educativas) {
        if (educativas) {
            this.institucionesEducativas$ = this.serviceInstitucion.get({ tipo: 'Establecimiento educativo' });
        } else {
            this.residencias$ = this.serviceInstitucion.get({ tipo: 'Residencia' });
        }
    }

    setPcr(event) {
        if (event.value) {
            this.secciones.map(seccion => {
                if (seccion.id === 'clasificacionFinal') {
                    seccion.fields['pcr'] = { id: 'muestra', nombre: 'Muestra tomada' };
                }
            });
        }
    }

    setSemanaEpidemiologica(event) {
        const primerSintoma = moment(event.value);
        const primerDomingo = moment(primerSintoma).startOf('year').startOf('week').weekday(-1);
        if (primerDomingo.format('YYYY') < moment().format('YYYY')) {
            primerDomingo.add(7, 'days');
        }
        this.secciones.map(seccion => {
            if (seccion.id === 'informacionClinica') {
                const resultado = Math.trunc((primerSintoma.diff(primerDomingo, 'days') / 7)) + 1;
                seccion.fields['semanaepidemiologica'] = resultado ? resultado : '';
            }
        });
    }

    setCasoAsintomatico(event) {
        if (!event.value) { return; }
        this.clearDependencias({ value: false }, 'clasificacionFinal', []);
        if (event.value.id === 'casoAsintomatico') {
            const seccionFinal = this.secciones.find(seccion => seccion.id === 'clasificacionFinal');
            seccionFinal.fields['clasificacionfinal'] = 'Caso asintomático';
            if (!this.showFichaParcial) {
                seccionFinal.fields['segundaclasificacion'] = { id: 'pcr', nombre: 'PCR-RT' };
            }
            this.asintomatico = true;
            this.clearDependencias({ value: false }, 'signosSintomas', []);
            this.clearDependencias({ value: false }, 'antecedentesEpidemiologicos', ['sospechosoconantecedente', 'sospechosoconcontacto', 'sospechosoconglomerado', 'sospechosoasistencial', 'apellidonombresospechoso', 'sospechosodni', 'apellidonombrecontacto', 'dnicontacto', 'nombreasistencial']);
        } else {
            this.asintomatico = false;
            this.clearDependencias({ value: false }, 'clasificacion', ['situacionespecial']);
        }
    }

    setEstadoVacunacion(fields) {
        this.vacunas$ = this.vacunasService.getNomivacVacunas({});
        this.pacientesVacunasService.search({ paciente: this.paciente.id }).subscribe(res => {
            if (res.length) {
                const vacunas = res[0];
                const ultimaDosis = vacunas.aplicaciones[vacunas.aplicaciones.length - 1];
                fields['vacunacioncovid'] = true;
                fields['fechadosis'] = ultimaDosis.fechaAplicacion;
                fields['nombrevacunacovid'] = { _id: ultimaDosis.vacuna.id, nombre: ultimaDosis.vacuna.nombre };
            }
        });
    }

    checkConfirmados(field) {
        if (field?.id === 'autotest' || field?.id === 'laboPcr' || field?.id === 'laboAntigeno') {
            return 'confirmado';
        } else {
            return field?.id;
        }
    }

    condicionAntigeno(field, seccion) {
        return field.key === 'antigeno' && this.checkConfirmados(seccion.fields['segundaclasificacion']) !== 'confirmado'
            && seccion.fields['segundaclasificacion']?.id !== 'lamp' && seccion.fields['segundaclasificacion']?.id !== 'pcr' && seccion.fields['segundaclasificacion']?.id !== 'ifi';
    }
    condicionIFI(field, seccion) {
        return field.key === 'ifi' && this.checkConfirmados(seccion.fields['segundaclasificacion']) !== 'confirmado'
            && seccion.fields['segundaclasificacion']?.id !== 'lamp' && seccion.fields['segundaclasificacion']?.id !== 'pcr' && seccion.fields['segundaclasificacion']?.id !== 'antigeno';

    }
    condicionLamp(field, seccion) {
        return field.key === 'lamp' && this.checkConfirmados(seccion.fields['segundaclasificacion']) !== 'confirmado'
            && seccion.fields['antigeno']?.id !== 'confirmado' && seccion.fields['ifi']?.id !== 'confirmado' && seccion.fields['segundaclasificacion']?.id !== 'pcr';
    }

    descargar() {
        const data = `${this.fichaPaciente.type.name} - ${this.fichaPaciente.paciente.nombre}_${this.fichaPaciente.paciente.apellido}`;
        this.servicioDocumentos.descargarFicha({
            ficha: this.fichaPaciente,
            usuario: this.auth.usuario.nombreCompleto
        }, data).subscribe();
    }
}
