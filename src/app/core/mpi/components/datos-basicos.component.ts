import { OnInit, Component, Input, Output, EventEmitter } from '@angular/core';
import { IPaciente } from '../interfaces/IPaciente';
import { PacienteHttpService } from '../services/pacienteHttp.service';
import * as enumerados from '../../../utils/enumerados';
import { Plex } from '@andes/plex';
import { IPacienteMatch } from '../../../modules/mpi/interfaces/IPacienteMatch.inteface';
import { ParentescoService } from '../../../services/parentesco.service';
import { PacienteBuscarResultado } from '../../../modules/mpi/interfaces/PacienteBuscarResultado.inteface';
import { IPacienteRelacion } from '../../../modules/mpi/interfaces/IPacienteRelacion.inteface';

@Component({
    selector: 'datos-basicos',
    templateUrl: 'datos-basicos.html',
    styleUrls: []
})
export class DatosBasicosComponent implements OnInit {

    @Input() paciente: IPaciente;
    @Input() tipoPaciente = 'con-dni';
    @Output() changes: EventEmitter<any> = new EventEmitter<any>();

    foto = '';
    estados = [];
    sexos: any[];
    generos: any[];
    estadosCiviles: any[];
    tipoIdentificacion: any[];
    noPoseeDNI = false;
    // disableGuardar = false;
    // visualizarIgnorarGuardar = false;
    // disableIgnorarGuardar = false;
    // sugerenciaAceptada = false;
    // entidadValidadora = '';

    public nombrePattern: string;
    public patronDocumento = /^[1-9]{1}[0-9]{5,7}$/;
    hoy = moment().endOf('day').toDate();

    // PARA LA APP MOBILE
    // public showMobile = false;
    // public checkPass = false;
    // public emailAndes: String = '';
    // public messageApp: String = '';
    // public celularAndes: String = '';
    // public activarApp = false;

    // para registro de bebes
    busquedaTutor: IPacienteMatch[] | IPaciente[] = [];
    contactoImportado = false;
    direccionImportada = false;
    parentescoModel: any[];
    showBuscador = true;
    searchClear = true;
    relacionBebe: IPacienteRelacion = {
        relacion: {
            id: '',
            nombre: '',
            opuesto: ''
        },
        referencia: '',
        nombre: '',
        apellido: '',
        documento: '',
        fechaNacimiento: null,
        sexo: '',
        foto: ''
    };

    constructor(
        private plex: Plex,
        private pacienteHttpService: PacienteHttpService,
        private parentescoService: ParentescoService
    ) {
        this.nombrePattern = pacienteHttpService.nombreRegEx.source;
    }

    ngOnInit() {
        if (this.tipoPaciente === 'sin-dni') {
            this.noPoseeDNI = true;
            this.paciente.documento = '';
        }
        this.sexos = enumerados.getObjSexos();
        this.tipoIdentificacion = enumerados.getObjTipoIdentificacion();
        this.generos = enumerados.getObjGeneros();
        this.estadosCiviles = enumerados.getObjEstadoCivil();
        this.estados = enumerados.getEstados();
        // this.checkDisableValidar();
        this.parentescoService.get().subscribe(resultado => { this.parentescoModel = resultado; });
    }

    get validado() {
        return this.paciente.estado === 'validado';
    }

    limpiarDocumento() {
        if (this.noPoseeDNI) {
            this.paciente.documento = '';
            this.emitChanges(); // ver de agregar un output para notificar a componente padre
            this.plex.info('warning', 'Recuerde que al guardar un paciente sin el número de documento será imposible realizar validaciones contra fuentes auténticas.');
        }
    }


    completarGenero() {
        this.paciente.genero = ((typeof this.paciente.sexo === 'string')) ? this.paciente.sexo : (Object(this.paciente.sexo).id);
    }


    emitChanges() {
        this.changes.emit();
    }

    // --------------  PARA REGISTRO DE BEBES -----------------

    onSearchStart() {
        this.busquedaTutor = null;
    }

    onSearchEnd(resultado: PacienteBuscarResultado) {
        if (resultado.err) {
            this.plex.info('danger', resultado.err);
            return;
        }
        this.searchClear = false;
        if (resultado.pacientes.length === 1 && resultado.escaneado) {
            let pacienteScaneado = resultado.pacientes[0];
            if (!pacienteScaneado.id) {
                pacienteScaneado.estado = 'validado'; // este paciente fue scaneado
                pacienteScaneado.genero = pacienteScaneado.sexo;
                this.plex.showLoader();
                this.changes.emit({ disableValidar: true });
                this.pacienteHttpService.save(pacienteScaneado).subscribe(
                    pacGuardado => {
                        this.onPacienteSelected(pacGuardado);
                        this.plex.hideLoader();
                        this.changes.emit({ disableValidar: false });
                    },
                    () => {
                        this.plex.toast('warning', 'Paciente no guardado', 'Error');
                        this.plex.hideLoader();
                        this.changes.emit({ disableValidar: false });
                    });
            } else {
                this.onPacienteSelected(pacienteScaneado);
            }
        } else {
            this.busquedaTutor = resultado.pacientes;
        }

    }

    onSearchClear() {
        this.busquedaTutor = [];
        this.searchClear = true;
    }

    onPacienteSelected(pacienteSelected: IPaciente) {
        this.searchClear = true;
        if (pacienteSelected) {
            this.pacienteHttpService.findById(pacienteSelected.id, { activo: true }).subscribe(paciente => {
                // Relacionamos al bebe con su progenitor/a
                this.relacionBebe.apellido = paciente.apellido;
                this.relacionBebe.nombre = paciente.nombre;
                this.relacionBebe.documento = paciente.documento;
                this.relacionBebe.fechaNacimiento = paciente.fechaNacimiento;
                this.relacionBebe.sexo = paciente.sexo;
                this.relacionBebe.foto = paciente.foto ? paciente.foto : null;
                this.relacionBebe.referencia = paciente.id;
                let rel = this.parentescoModel.find((elem) => {
                    if (elem.nombre === 'progenitor/a') {
                        return elem;
                    }
                });
                this.relacionBebe.relacion = rel;
                this.paciente.relaciones = [this.relacionBebe];

                /* Si no se cargó ninguna dirección, tomamos el dato de la madre/padre/tutor */
                this.copiarDireccion(paciente);
                /* Si no se cargó un contacto, tomamos el dato de la madre/padre/tutor */
                this.copiarContacto(paciente);
                this.busquedaTutor = [];
                this.showBuscador = false;
            });
        } else {
            this.plex.info('warning', 'Imposible obtener el paciente seleccionado', 'Error');
        }
    }
    private copiarContacto(paciente: IPaciente) {
        if (!paciente.contacto || !paciente.contacto.length) { return; }
        if (!this.paciente.contacto[0].valor) {
            this.paciente.contacto[0].valor = paciente.contacto[0].valor;
            this.paciente.contacto[0].tipo = paciente.contacto[0].tipo;
            this.contactoImportado = true;
        }
    }

    private copiarDireccion(tutor: IPaciente) {
        if (!tutor.direccion || !tutor.direccion.length) { return; }
        if (!this.paciente.direccion[0].valor) {
            this.paciente.direccion[0].valor = tutor.direccion[0].valor;
            this.direccionImportada = true;
        }
        if (!this.paciente.direccion[0].ubicacion.provincia && tutor.direccion[0].ubicacion && tutor.direccion[0].ubicacion.provincia) {
            this.paciente.direccion[0].ubicacion.provincia = tutor.direccion[0].ubicacion.provincia;
            // this.viveProvActual = (paciente.direccion[0].ubicacion.provincia.id === this.provinciaActual.id);
            this.direccionImportada = true;
        }
        if (!this.paciente.direccion[0].ubicacion.localidad && tutor.direccion[0].ubicacion.localidad) {
            this.paciente.direccion[0].ubicacion.localidad = tutor.direccion[0].ubicacion.localidad;
            // this.viveLocActual = (paciente.direccion[0].ubicacion.localidad.id === this.localidadActual.id);
            if (tutor.direccion[0].geoReferencia) {
                this.paciente.direccion[0].geoReferencia = tutor.direccion[0].geoReferencia;
            }
            this.direccionImportada = true;
        }
        if (!this.paciente.direccion[0].ubicacion.provincia && !this.paciente.direccion[0].ubicacion.localidad) {
            // this.localidadRequerida = true;
        }
        if (!this.paciente.direccion[0].ubicacion.barrio && tutor.direccion[0].ubicacion.barrio) {
            this.paciente.direccion[0].ubicacion.barrio = tutor.direccion[0].ubicacion.barrio;
            this.direccionImportada = true;
        }
    }

    cambiarRelacion() {
        this.showBuscador = true;
        // si los datos direccion/contacto fueron obtenidos de la relación, se resetean.
        if (this.direccionImportada) {
            this.paciente.direccion[0].valor = '';
            this.paciente.direccion[0].ubicacion.localidad = null;
            this.paciente.direccion[0].ubicacion.provincia = null;
            this.paciente.direccion[0].geoReferencia = null;
            this.direccionImportada = false;
        }
        if (this.contactoImportado) {
            this.paciente.contacto[0].valor = '';
            this.paciente.contacto[0].tipo = 'celular';
            this.contactoImportado = false;
        }
        // this.viveLocActual = false;
        // this.viveProvActual = false;
    }
}
