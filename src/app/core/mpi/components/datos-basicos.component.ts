import { Plex } from '@andes/plex';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { IPacienteMatch } from '../../../modules/mpi/interfaces/IPacienteMatch.inteface';
import { IPacienteRelacion } from '../../../modules/mpi/interfaces/IPacienteRelacion.inteface';
import { PacienteBuscarResultado } from '../../../modules/mpi/interfaces/PacienteBuscarResultado.inteface';
import { ParentescoService } from '../../../services/parentesco.service';
import * as enumerados from '../../../utils/enumerados';
import { IPaciente } from '../interfaces/IPaciente';
import { PacienteService } from '../services/paciente.service';

@Component({
    selector: 'datos-basicos',
    templateUrl: 'datos-basicos.html',
    styleUrls: ['datos-basicos.scss']
})

export class DatosBasicosComponent implements OnInit, OnChanges {

    @Input() paciente: IPaciente;
    @Input() tipoPaciente = 'con-dni';
    @Output() changes: EventEmitter<any> = new EventEmitter<any>();
    @ViewChild('form', { static: false }) ngForm: NgForm;
    formChangesSubscription: Subscription;

    estados = [];
    sexos: any[];
    generos: any[];
    estadosCiviles: any[];
    tipoIdentificacion: any[];
    noPoseeDNI = false;

    public nombrePattern: string;
    public patronDocumento = /^[1-9]{1}[0-9]{4,7}$/;
    hoy = moment().endOf('day').toDate();

    // para registro de bebes
    busquedaTutor: IPacienteMatch[] | IPaciente[] = [];
    contactoImportado = false;
    direccionImportada = false;
    parentescoModel: any[];
    showBuscador = true;
    searchClear = true;
    relacionBebe: IPacienteRelacion = {
        id: null,
        relacion: {
            id: '',
            nombre: '',
            opuesto: ''
        },
        referencia: '',
        nombre: '',
        alias: '',
        genero: '',
        numeroIdentificacion: '',
        apellido: '',
        documento: '',
        fechaNacimiento: null,
        fechaFallecimiento: null,
        sexo: '',
        foto: null,
        fotoId: null
    };


    constructor(
        private plex: Plex,
        private pacienteService: PacienteService,
        private parentescoService: ParentescoService
    ) {
        this.nombrePattern = pacienteService.nombreRegEx.source;
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
        this.parentescoService.get().subscribe(resultado => {
            this.parentescoModel = resultado;
        });
    }

    ngOnChanges({ paciente }: SimpleChanges) {
        if (!paciente.currentValue.notaError?.length) {
            this.paciente.reportarError = false;
        }
    }

    public checkForm() {
        this.ngForm.control.markAllAsTouched();
        return this.ngForm.control.valid;
    }

    checkDisableValidar() {
        this.changes.emit({ checkValues: true });
    }

    get validado() {
        return this.paciente.estado === 'validado';
    }

    limpiarDocumento() {
        if (this.noPoseeDNI) {
            this.paciente.documento = '';
            this.plex.info('warning', 'Recuerde que al guardar un paciente sin el número de documento será imposible realizar validaciones contra fuentes auténticas.');
        }
    }

    completarGenero() {
        this.paciente.genero = ((typeof this.paciente.sexo === 'string')) ? this.paciente.sexo : (Object(this.paciente.sexo).id);
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
        if (resultado.pacientes.length === 1 && resultado.scan?.length) {
            const pacienteScaneado = resultado.pacientes[0];
            if (!pacienteScaneado.id) {
                pacienteScaneado.estado = 'validado'; // este paciente fue scaneado
                pacienteScaneado.genero = pacienteScaneado.sexo;
                this.plex.showLoader();
                this.pacienteService.save(pacienteScaneado).subscribe(
                    pacGuardado => {
                        this.onPacienteSelected(pacGuardado);
                        this.plex.hideLoader();
                    },
                    () => {
                        this.plex.toast('warning', 'Paciente no guardado', 'Error');
                        this.plex.hideLoader();
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
            this.pacienteService.getById(pacienteSelected.id).subscribe(paciente => {
                // Relacionamos al bebe con su progenitor/a
                this.relacionBebe.apellido = paciente.apellido;
                this.relacionBebe.nombre = paciente.nombre;
                this.relacionBebe.alias = paciente.alias;
                this.relacionBebe.genero = paciente.genero;
                this.relacionBebe.documento = paciente.documento;
                this.relacionBebe.numeroIdentificacion = paciente.numeroIdentificacion;
                this.relacionBebe.fechaNacimiento = paciente.fechaNacimiento;
                this.relacionBebe.fechaFallecimiento = paciente.fechaFallecimiento;
                this.relacionBebe.sexo = paciente.sexo;
                this.relacionBebe.fotoId = paciente.fotoId ? paciente.fotoId : null;
                this.relacionBebe.referencia = paciente.id;
                const rel = this.parentescoModel.find((elem) => {
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
                this.changes.emit({
                    refreshData: true,
                    relaciones: this.paciente.relaciones,
                    relacionesEdit: [this.relacionBebe]
                });
            });
        } else {
            this.plex.info('warning', 'Imposible obtener el paciente seleccionado', 'Error');
        }
    }
    private copiarContacto(paciente: IPaciente) {
        if (!paciente.contacto || !paciente.contacto.length) {
            return;
        }
        if (!this.paciente.contacto[0].valor) {
            this.paciente.contacto[0].valor = paciente.contacto[0].valor;
            this.paciente.contacto[0].tipo = paciente.contacto[0].tipo;
            this.contactoImportado = true;
        }
    }

    private copiarDireccion(tutor: IPaciente) {
        if (!tutor.direccion || !tutor.direccion.length) {
            return;
        }
        if (!this.paciente.direccion[0].valor) {
            this.paciente.direccion[0].valor = tutor.direccion[0].valor;
            this.direccionImportada = true;
        }
        if (!this.paciente.direccion[0].ubicacion.provincia && tutor.direccion[0].ubicacion && tutor.direccion[0].ubicacion.provincia) {
            this.paciente.direccion[0].ubicacion.provincia = tutor.direccion[0].ubicacion.provincia;
            this.direccionImportada = true;
        }
        if (!this.paciente.direccion[0].ubicacion.localidad && tutor.direccion[0].ubicacion.localidad) {
            this.paciente.direccion[0].ubicacion.localidad = tutor.direccion[0].ubicacion.localidad;
            this.direccionImportada = true;
        }
        if (!this.paciente.direccion[0].ubicacion.provincia && !this.paciente.direccion[0].ubicacion.localidad) {
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
        this.changes.emit({ refreshData: true, relaciones: [] });
    }
}
