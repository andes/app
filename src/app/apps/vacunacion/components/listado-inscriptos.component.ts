import moment from 'moment';
import { Component, OnInit, ViewChild } from '@angular/core';
import { InscripcionService } from '../services/inscripcion.service';
import { GrupoPoblacionalService } from 'src/app/services/grupo-poblacional.service';
import { Auth } from '@andes/auth';
import { Router } from '@angular/router';
import { PacienteService } from 'src/app/core/mpi/services/paciente.service';
import { Plex } from '@andes/plex';
import * as enumerados from '../../../utils/enumerados';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    selector: 'listado-inscriptos',
    templateUrl: 'listado-inscriptos.html',
    styleUrls: ['./listado-inscriptos.scss']
})

export class ListadoInscriptosVacunacionComponent implements OnInit {
    @ViewChild('formulario', { static: false }) formulario;

    public mainSize = 12;
    public showSidebar = false;
    public showAgregarNota = false;
    public showDetalle = false;
    public showNueva = false;
    public pacienteSelected: any;
    public listado$: Observable<any[]>;
    private listadoActual: any[];
    public gruposPoblacionales: any[];
    public candidatos: any[];
    public candidatosBuscados = false;
    public editando = false;
    public permisosEdicion;
    public editInscripcion;
    public sexos;
    public fechaMaximaNacimiento;
    public fechaMinimaNacimiento;
    public nombreCorregido;
    public apellidoCorregido;
    public sexoCorregido;
    public dniCorregido;
    public fechaNacimientoCorregida;
    public notasPredefinidas = [
        { id: 'turno-asignado', nombre: 'Turno asignado' },
        { id: 'no-quiere', nombre: 'No quiere vacunarse' },
        { id: 'vacunado', nombre: 'Ya se vacunó' },
        { id: 'no-contesta', nombre: 'No contesta' },
        { id: 'otra', nombre: 'Otra' }
    ];
    public patronDocumento = /^[1-9]{1}[0-9]{4,7}$/;
    public columns = [
        {
            key: 'grupo',
            label: 'Grupo',
            sorteable: false,
            opcional: false,
            sort: (a, b) => {
                return a.grupo.nombre.localeCompare(b.grupo.nombre);
            }
        },
        {
            key: 'documento',
            label: 'Documento',
            sorteable: false,
            opcional: false,
            sort: (a, b) => {
                return a.documento.localeCompare(b.documento);
            }
        },
        {
            key: 'apellido-nombre',
            label: 'Apellido y nombre',
            sorteable: false,
            opcional: false,
            sort: (a, b) => {
                return `${a.apellido} ${a.nombre}`.localeCompare(`${b.apellido} ${b.nombre}`);
            }
        },
        {
            key: 'sexo',
            label: 'Sexo',
            sorteable: false,
            opcional: false,
            sort: (a, b) => {
                return a.sexo.localeCompare(b.sexo);
            }
        },
        {
            key: 'edad',
            label: 'Edad',
            sorteable: false,
            opcional: false,
            sort: (a, b) => {
                return moment(a.fechaNacimiento).diff(moment(b.fechaNacimiento));
            }
        },
        {
            key: 'localidad',
            label: 'Localidad',
            sorteable: false,
            opcional: false,
            sort: (a, b) => {
                return a.localidad?.nombre.localeCompare(b.localidad?.nombre);
            }
        },
        {
            key: 'fecha-registro',
            label: 'Fecha de registro',
            sorteable: false,
            opcional: false,
            sort: (a, b) => {
                return moment(a.fechaRegistro).diff(moment(b.fechaRegistro));
            }
        },
        {
            key: 'estado',
            label: 'Estado',
            sorteable: false,
            opcional: false,
            sort: (a, b) => {
                return a.estado.localeCompare(b.estado);
            }
        },
        {
            key: 'turno',
            label: 'Tiene turno',
            sorteable: false,
            opcional: false
        },
        {
            key: 'vacunado',
            label: 'Vacunado',
            sorteable: false,
            opcional: false
        },
        {
            key: 'certificado',
            label: 'Certificado',
            sorteable: false,
            opcional: false
        }];

    public permisosAlta;

    constructor(
        private inscripcionService: InscripcionService,
        private gruposService: GrupoPoblacionalService,
        private auth: Auth,
        private router: Router,
        private pacienteService: PacienteService,
        private plex: Plex
    ) { }

    ngOnInit() {
        this.sexos = enumerados.getObjSexos();
        if (!this.auth.getPermissions('vacunacion:?').length) {
            this.router.navigate(['inicio']);
        }
        this.permisosEdicion = this.auth.getPermissions('vacunacion:editar:?');
        this.listado$ = this.inscripcionService.inscriptosFiltrados$.pipe(
            map(resp => this.listadoActual = resp)
        );
        this.permisosAlta = this.auth.getPermissions('vacunacion:crear:?');
        this.gruposService.search().subscribe(resp => {
            this.gruposPoblacionales = resp;
        });
    }

    showInSidebar(paciente) {
        this.showNueva = false;
        if (paciente) {
            this.pacienteSelected = paciente;
            this.showSidebar = true;
            this.showDetalle = true;
            this.mainSize = 8;
            this.candidatosBuscados = false;
            this.editando = false;
            this.showAgregarNota = false;
            this.editInscripcion = false;
        }
    }

    seleccionaGrupo() {
        const grupo = this.pacienteSelected.grupo;
        if (grupo) {
            switch (grupo.nombre) {
                case 'discapacidad':
                    this.fechaMinimaNacimiento = moment('1900-01-01').toDate();
                    this.fechaMaximaNacimiento = moment().subtract(12, 'years').toDate();
                    break;
                case 'mayores60':
                    this.fechaMinimaNacimiento = moment('1900-01-01').toDate();
                    this.fechaMaximaNacimiento = moment().subtract(60, 'years').toDate();
                    break;
                case 'personal-salud':
                case 'policia':
                    this.fechaMinimaNacimiento = moment('1900-01-01').toDate();
                    this.fechaMaximaNacimiento = moment().subtract(18, 'years').toDate();
                    break;
                case 'factores-riesgo': {
                    this.fechaMinimaNacimiento = moment().subtract(60, 'years').toDate();
                    this.fechaMaximaNacimiento = moment().subtract(12, 'years').toDate();
                    break;
                }
            }
        }
    }

    buscarCandidatos() {
        if (this.pacienteSelected) {
            this.candidatosBuscados = false;
            this.pacienteService.get({
                documento: this.pacienteSelected.documento,
                sexo: this.pacienteSelected.sexo,
                activo: true
            }).subscribe(resp => {
                this.candidatos = resp;
                this.candidatosBuscados = true;
            });
        }
    }

    asociarCandidato(candidato) {
        this.pacienteSelected.paciente = candidato;
        this.inscripcionService.patch(this.pacienteSelected).subscribe(resp => {
            this.pacienteSelected = resp;
            this.candidatos = [];
            this.candidatosBuscados = false;
            this.plex.toast('success', 'El paciente se ha asociado correctamente.');
        }, error => {
            this.plex.toast('danger', 'Hubo un error asociando el paciente');
        });
    }

    desasociarPaciente() {
        this.plex.confirm('¿Está seguro que desea desasociar al paciente de la inscripción?').then((respuesta) => {
            if (respuesta) {
                this.pacienteSelected.paciente = null;
                this.inscripcionService.patch(this.pacienteSelected).subscribe(resultado => {
                    this.pacienteSelected = resultado;
                    this.plex.toast('success', 'El paciente se ha desvinculado correctamente');
                }, error => {
                    this.plex.toast('danger', 'No se pudo desvincular el paciente de la inscripción');
                });
            }
        });
    }

    cancelarBusqueda() {
        this.candidatosBuscados = false;
        this.candidatos = [];
    }

    nuevaInscripcion() {
        this.showDetalle = false;
        this.showSidebar = true;
        this.showNueva = true;
        this.mainSize = 8;
    }

    grupoPoblacional(nombre: string) {
        const maxLength = 30;
        let descripcion;
        if (this.gruposPoblacionales) {
            descripcion = this.gruposPoblacionales.find(item => item.nombre === nombre).descripcion;
        }
        if (descripcion && descripcion.length > maxLength) {
            return `${descripcion.substring(0, maxLength)} ..`;
        }
        return descripcion;
    }

    onScroll() {
        this.inscripcionService.lastResults.next(this.listadoActual);
    }

    editPaciente() {
        this.editando = true;
    }

    editDatosBasicos() {
        this.editInscripcion = true;
        this.nombreCorregido = this.pacienteSelected.nombre;
        this.apellidoCorregido = this.pacienteSelected.apellido;
        this.fechaNacimientoCorregida = this.pacienteSelected.fechaNacimiento;
        this.dniCorregido = this.pacienteSelected.documento;
        this.sexoCorregido = this.pacienteSelected.sexo;
    }

    domicilioValidado(inscripcion) {
        return inscripcion.validaciones.includes('domicilio');
    }

    returnEdicion(inscripcionActualizada) {
        if (inscripcionActualizada) {
            this.pacienteSelected = inscripcionActualizada;
            this.listado$ = this.inscripcionService.inscriptosFiltrados$.pipe(
                map(resp => this.listadoActual = resp)
            );
        }
        this.editando = false;
        this.showAgregarNota = false;
    }

    returnNotas(nota) {
        this.pacienteSelected.nota = nota;
        this.inscripcionService.update(this.pacienteSelected.id, this.pacienteSelected).subscribe(resultado => {
            this.listado$ = this.inscripcionService.inscriptosFiltrados$.pipe(
                map(resp => this.listadoActual = resp)
            );
            if (nota) {
                this.plex.toast('success', 'Nota editada con éxito');
            } else {
                this.plex.toast('success', 'Nota eliminada con éxito');
            }
        }, error => {
            this.plex.toast('danger', 'La inscripción no pudo ser actualizada');
        });
    }

    validarDomicilio(inscripcion) {
        this.inscripcionService.patch(inscripcion).subscribe(resultado => {
            if (resultado.validaciones.some(v => v === 'domicilio')) {
                this.pacienteSelected = resultado;
                this.plex.toast('success', 'El domicilio ha sido validado exitosamente');
            } else {
                this.plex.toast('danger', 'El domicilio no pudo ser validado');
            }
        });
    }

    guardarPaciente() {
        this.pacienteSelected.sexo = this.sexoCorregido.id;
        this.pacienteSelected.nombre = this.nombreCorregido;
        this.pacienteSelected.apellido = this.apellidoCorregido;
        this.pacienteSelected.documento = this.dniCorregido;
        this.pacienteSelected.fechaNacimiento = this.fechaNacimientoCorregida;
        this.inscripcionService.patch(this.pacienteSelected).subscribe(resultado => {
            if (resultado) {
                this.plex.toast('success', 'Datos actualizados con éxito');
            }
            this.editInscripcion = false;
        });
    }

    cancelarGuardarPaciente() {
        this.editInscripcion = false;
    }

    returnBusqueda(event) {
        if (event.status) {
            this.router.navigate([`/vacunacion/nueva/${event.paciente}`]);
        } else {
            this.closeSidebar();
        }
    }

    closeSidebar() {
        this.pacienteSelected = null;
        this.showSidebar = false;
        this.showDetalle = false;
        this.showNueva = false;
        this.mainSize = 12;
        this.editInscripcion = false;
    }

}
