import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { ILocalidad } from 'src/app/interfaces/ILocalidad';
import { LocalidadService } from 'src/app/services/localidad.service';
import { GrupoPoblacionalService } from 'src/app/services/grupo-poblacional.service';
import { Auth } from '@andes/auth';
import { InscripcionService } from '../../services/inscripcion.service';
import { Router } from '@angular/router';
import { Plex } from '@andes/plex';
import { catchError } from 'rxjs/operators';

@Component({
    selector: 'monitoreo-inscriptos',
    templateUrl: 'monitoreo-inscriptos.html',
    styleUrls: ['../listado-inscriptos.scss']
})

export class MonitoreoInscriptosComponent implements OnInit {
    @ViewChild('formulario', { static: false }) formulario;

    public panelIndex = 0;
    public activeTab = 0;
    public pacienteLlamado;
    public mainSize = 12;
    public showSidebar = false;
    public pacienteSelected;
    public pacientes = [];
    public pacienteProcesado = true;
    public localidades$: Observable<ILocalidad[]>;
    public gruposPoblacionales = [];
    public localidadSelected;
    public grupoSelected;
    public localidadAsignadasSelected;
    public grupoAsignadasSelected;
    private idNeuquenProv = '57f3f3aacebd681cc2014c53';
    public showAgregarNota = false;
    public permisosEdicion;
    public editando = false;
    public dacionTurno = false;
    public fechaProximoLlamado;
    public hoy = moment().startOf('day').add(1, 'days').toDate();
    public desasignarInsc: Boolean;
    public inscriptosSinturno = [];
    public columns = [
        {
            key: 'grupo',
            label: 'Grupo',
            sorteable: false,
            opcional: false
        },
        {
            key: 'documento',
            label: 'Documento',
            sorteable: false,
            opcional: false
        },
        {
            key: 'apellido-nombre',
            label: 'Apellido y nombre',
            sorteable: false,
            opcional: false
        },
        {
            key: 'sexo',
            label: 'Sexo',
            sorteable: false,
            opcional: false
        },
        {
            key: 'edad',
            label: 'Edad',
            sorteable: false,
            opcional: false
        },
        {
            key: 'localidad',
            label: 'Localidad',
            sorteable: false,
            opcional: false
        },
        {
            key: 'fecha-registro',
            label: 'Fecha de registro',
            sorteable: false,
            opcional: false
        },
        {
            key: 'estado',
            label: 'Estado',
            sorteable: false,
            opcional: false
        },
        {
            key: 'certificado',
            label: 'Certificado',
            sorteable: false,
            opcional: false
        },
        {
            key: 'turno',
            label: 'Turno asignado',
            sorteable: false,
            opcional: false
        }];

    constructor(
        private localidadService: LocalidadService,
        private gruposService: GrupoPoblacionalService,
        private auth: Auth,
        private inscripcionService: InscripcionService,
        private router: Router,
        private plex: Plex
    ) { }

    ngOnInit() {
        if (!this.auth.getPermissions('vacunacion:dacion-turnos:?').length || !this.auth.getPermissions('vacunacion:tipoGrupos:?').length) {
            this.router.navigate(['inicio']);
        }
        this.localidades$ = this.localidadService.getXProvincia(this.idNeuquenProv);
        const gruposHabilitados = this.auth.getPermissions('vacunacion:tipoGrupos:?');
        this.permisosEdicion = this.auth.getPermissions('vacunacion:editar:?');
        this.desasignarInsc = this.auth.check('vacunacion:desasignar-inscriptos');
        let query = {};
        if (gruposHabilitados.length) {
            if (!(gruposHabilitados.length === 1 && gruposHabilitados[0] === '*')) {
                query = { ids: gruposHabilitados };
            }
            this.gruposService.search(query).subscribe(resp => {
                this.gruposPoblacionales = resp;
            });
        } else {
            this.gruposPoblacionales = [];
        }
    }

    showInSidebar(paciente) {
        if (paciente) {
            this.pacienteSelected = paciente;
            this.mainSize = 9;
            this.showSidebar = true;
        }
    }

    closeSidebar() {
        this.pacienteSelected = null;
        this.showSidebar = false;
        this.mainSize = 12;
    }

    asignarInscripcion() {
        let params: any = {};
        if (this.grupoSelected) {
            params.grupos = [this.grupoSelected.nombre];
        }
        if (this.localidadSelected) {
            params.localidad = this.localidadSelected.id;
        }
        return this.inscripcionService.asignar(params).subscribe(resultado => {
            this.pacienteProcesado = false;
            this.pacienteLlamado = resultado;
            this.showInSidebar(this.pacienteLlamado);
        });
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

    editPaciente() {
        this.editando = true;
    }

    darTurno() {
        this.dacionTurno = true;
    }

    returnEdicion(inscripcionActualizada) {
        if (inscripcionActualizada) {
            this.pacienteSelected = inscripcionActualizada;
            if (this.activeTab === 1) {
                this.pacienteSelected = inscripcionActualizada;
                this.cargarAsignadas();
            } else {
                this.pacienteLlamado = inscripcionActualizada;
            }
        }
        this.editando = false;
    }


    returnNotas(inscripcionActualizada) {
        if (inscripcionActualizada) {
            this.pacienteSelected = inscripcionActualizada;
            if (this.activeTab === 1) {
                this.pacienteSelected = inscripcionActualizada;
                this.cargarAsignadas();
            } else {
                this.pacienteLlamado = inscripcionActualizada;
                this.pacienteProcesado = true;
            }
        }
        this.showAgregarNota = false;
    }

    cargarAsignadas() {
        let params: any = {};
        if (this.grupoAsignadasSelected) {
            params.grupos = [this.grupoAsignadasSelected.nombre];
        }
        if (this.localidadAsignadasSelected) {
            params.localidad = this.localidadAsignadasSelected.id;
        }
        params.userAsignado = this.auth.usuario.id;
        this.inscripcionService.get(params).subscribe(resultado => {
            this.pacientes = resultado;
        });
    }

    returnDacionTurno(inscripcionActualizada) {
        if (inscripcionActualizada) {
            this.pacienteSelected = inscripcionActualizada;
            if (this.activeTab === 1) {
                this.pacienteSelected = inscripcionActualizada;
                this.cargarAsignadas();
            } else {
                this.pacienteLlamado = inscripcionActualizada;
                this.pacienteProcesado = false;
            }
        }
        this.dacionTurno = false;
    }

    cambio(activeTab) {
        if (activeTab !== this.activeTab) {
            this.activeTab = activeTab;
            this.closeSidebar();
            if (this.activeTab === 1) {
                this.pacienteSelected = null;
                this.cargarAsignadas();
            } else {
                if (this.pacienteLlamado) {
                    this.showInSidebar(this.pacienteLlamado);
                }
            }
        }
    }

    setProximoLlamado(undo = false) {
        if (undo) {
            this.fechaProximoLlamado = undefined;
        }
        if (this.fechaProximoLlamado) {
            this.fechaProximoLlamado = moment(this.fechaProximoLlamado).startOf('day').toDate();
        }
        this.pacienteSelected.fechaProximoLlamado = this.fechaProximoLlamado;
        this.inscripcionService.patch(this.pacienteSelected).subscribe(paciente => {
            this.pacienteSelected = paciente;
            this.pacienteProcesado = true;
            this.plex.toast('success', 'Cambios guardados correctamente.');
        }, error => {
            this.plex.toast('danger', 'Hubo un error guardando los cambios.');
        });
    }

    incrementarLlamado() {
        let llamado = {
            fechaRealizacion: new Date(),
            usuario: this.auth.usuario,
            numeroIntento: 1,
        };
        if (this.pacienteSelected.llamados?.length) {
            let ultimoLlamado = this.pacienteSelected.llamados[this.pacienteSelected.llamados.length - 1].numeroIntento;

            llamado.numeroIntento = ultimoLlamado + 1;

            this.pacienteSelected.llamados.push(llamado);
        } else {
            this.pacienteSelected.llamados = [llamado];
        }

        this.inscripcionService.patch(this.pacienteSelected).pipe(
            catchError((err) => {
                this.plex.toast('danger', 'No se pudo incrementar cantidad de llamados');
                return null;
            }),
        ).subscribe(() => {
            this.plex.toast('success', 'Se incrementó correctamente la cantidad de llamados');
        });
    }

    desasignarInscriptos() {
        this.inscripcionService.get().subscribe(inscripcion => {
            inscripcion.map(inscripto => {
                if (!inscripto.turno && !inscripto.fechaProximoLlamado) {
                    inscripto.asignado = undefined;
                    this.inscripcionService.patch(inscripto).subscribe();
                }
            });
            this.plex.toast('success', 'Se desasignaron inscriptos ');
            this.cargarAsignadas();
        });
    }
}
