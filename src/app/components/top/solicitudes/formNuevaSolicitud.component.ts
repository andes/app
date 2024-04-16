import { Component, Output, EventEmitter, ViewChildren, QueryList, OnInit, Input } from '@angular/core';
import { Plex } from '@andes/plex';
import { ProfesionalService } from '../../../services/profesional.service';
import { Auth } from '@andes/auth';
import { PrestacionesService } from '../../../modules/rup/services/prestaciones.service';
import { ReglaService } from '../../../services/top/reglas.service';
import { AdjuntosService } from '../../../modules/rup/services/adjuntos.service';
import { FileObject, FILE_EXT, IMAGENES_EXT, VIDEO_EXT } from '@andes/shared';
import { DriveService } from 'src/app/services/drive.service';

@Component({
    selector: 'form-nueva-solicitud',
    templateUrl: './formNuevaSolicitud.html',
    styleUrls: ['adjuntarDocumento.scss'],
})
export class FormNuevaSolicitudComponent implements OnInit {
    @ViewChildren('upload') childsComponents: QueryList<any>;
    @Input() paciente: any;
    @Input() size: any;
    @Input() tipoSolicitud: string;
    @Output() operacionFinalizada = new EventEmitter();
    wizardActivo = false; // Se usa para evitar que los botones aparezcan deshabilitados
    permisos = this.auth.getPermissions('solicitudes:tipoPrestacion:?');
    motivo: '';
    fecha: any;
    arrayReglasDestino = [];
    autocitado = false;
    prestacionDestino: any;
    prestacionOrigen: any;
    // Adjuntar Archivo
    errorExt = false;
    waiting = false;
    fileToken: string = null;
    timeout = null;
    documentos = [];
    imagenes = IMAGENES_EXT;
    extensions = FILE_EXT;
    videos = VIDEO_EXT;
    public documentosUrl = [];

    modelo: any = {
        inicio: 'top',
        paciente: {
            id: '',
            nombre: '',
            apellido: '',
            documento: '',
            sexo: '',
            fechaNacimiento: null
        },
        solicitud: {
            organizacion: null,
            organizacionOrigen: null,
            profesional: null,
            profesionalOrigen: null,
            fecha: null,
            turno: null,
            tipoPrestacion: null,
            tipoPrestacionOrigen: null,
            registros: []
        },
        estados: [],
        prestacionOrigen: null
    };
    arrayPrestacionesOrigen: { id: any; nombre: any }[];
    arrayReglasOrigen: { id: any; nombre: any }[];
    arrayOrganizacionesOrigen: { id: any; nombre: any }[];
    dataOrganizacionesOrigen = [];
    dataOrganizacionesDestino = [];
    dataTipoPrestacionesOrigen = [];
    dataReglasDestino = [];
    dataReglasOrigen: { id: any; nombre: any }[];

    constructor(
        private plex: Plex,
        private auth: Auth,
        private servicioProfesional: ProfesionalService,
        private servicioPrestacion: PrestacionesService,
        private servicioReglas: ReglaService,
        private adjuntosService: AdjuntosService,
        private driveService: DriveService
    ) { }

    ngOnInit() {
        if (this.tipoSolicitud === 'entrada') {
            this.modelo.solicitud.organizacion = this.auth.organizacion;
        } else {
            this.modelo.solicitud.organizacionOrigen = this.auth.organizacion;
        }
        this.extensions = this.extensions.concat(this.imagenes, this.videos);
        this.adjuntosService.token$.subscribe((data: any) => {
            this.fileToken = data.token;
        });
    }

    onSelect() {
        if (this.tipoSolicitud === 'salida') {
            this.dataOrganizacionesDestino = [];
            this.modelo.solicitud.organizacion = null;
            this.prestacionOrigen = null;
            if (this.auth.organizacion.id && this.modelo.solicitud.tipoPrestacionOrigen && this.modelo.solicitud.tipoPrestacionOrigen.conceptId) {
                this.servicioReglas.get({ organizacionOrigen: this.auth.organizacion.id, prestacionOrigen: this.modelo.solicitud.tipoPrestacionOrigen.conceptId })
                    .subscribe(
                        res => {
                            this.arrayReglasDestino = res;
                            this.dataReglasDestino = res.map(elem => {
                                return { id: elem.destino.prestacion.conceptId, nombre: elem.destino.prestacion.term };
                            });
                            this.dataOrganizacionesDestino = res.map(elem => {
                                return { id: elem.destino.organizacion.id, nombre: elem.destino.organizacion.nombre };
                            });
                        }
                    );
            }
        } else if (this.tipoSolicitud === 'entrada' && this.auth.organizacion.id) {
            if (this.prestacionOrigen) {
                const regla: any = this.arrayReglasOrigen.find((rule: any) => {
                    return rule.prestacion.conceptId === this.prestacionOrigen.id;
                });
                if (regla.auditable) {
                    this.modelo.estados = [{ tipo: 'auditoria' }];
                } else {
                    this.modelo.estados = [{ tipo: 'pendiente' }];
                }
                this.modelo.solicitud.tipoPrestacionOrigen = regla.prestacion;
            } else {
                this.prestacionOrigen = null;
                this.modelo.solicitud.tipoPrestacionOrigen = null;
            }
        }
    }

    onSelectOrganizacionOrigen() {
        this.prestacionOrigen = null;
        if (this.modelo.solicitud.organizacionOrigen) {
            const regla: any = this.arrayOrganizacionesOrigen.find((org: any) => org.origen.organizacion.id === this.modelo.solicitud.organizacionOrigen.id);
            if (regla && regla.origen) {
                this.arrayReglasOrigen = regla.origen.prestaciones;
                this.dataTipoPrestacionesOrigen = regla.origen.prestaciones.map(elem => {
                    return { id: elem.prestacion.conceptId, nombre: elem.prestacion.term };
                });
            }
        } else {
            if (!this.modelo.solicitud.tipoPrestacion) {
                this.dataOrganizacionesOrigen = [];
            }
            this.dataReglasDestino = [];
        }
    }

    onSelectOrganizacionDestino() {
        this.prestacionDestino = null;

        if (this.modelo.solicitud.organizacion) {
            this.servicioReglas.get({
                organizacionOrigen: this.auth.organizacion.id,
                organizacionDestino: this.modelo.solicitud.organizacion.id,
                prestacionOrigen: this.modelo.solicitud.tipoPrestacionOrigen.conceptId
            })
                .subscribe(res => {
                    this.dataReglasDestino = res.map(elem => ({ id: elem.destino.prestacion.conceptId, nombre: elem.destino.prestacion.term }));
                });
        } else {
            if (!this.modelo.solicitud.tipoPrestacionOrigen) {
                this.dataOrganizacionesDestino = [];
                this.modelo.solicitud.organizacion = null;
            }
            this.dataReglasDestino = [];
        }
    }

    onSelectPrestacionOrigen() {
        this.dataOrganizacionesOrigen = [];
        this.modelo.solicitud.organizacionOrigen = null;
        this.dataTipoPrestacionesOrigen = [];

        if (this.modelo.solicitud && this.modelo.solicitud.tipoPrestacion) {
            this.servicioReglas.get({ organizacionDestino: this.auth.organizacion.id, prestacionDestino: this.modelo.solicitud.tipoPrestacion.conceptId })
                .subscribe(
                    res => {
                        this.arrayOrganizacionesOrigen = res;
                        this.dataOrganizacionesOrigen = res.map(elem => {
                            return { id: elem.origen.organizacion.id, nombre: elem.origen.organizacion.nombre };
                        });
                    }
                );
        }
    }

    onSelectPrestacionDestino() {
        if (this.modelo.solicitud.tipoPrestacionOrigen) {
            if (this.prestacionDestino) {
                const regla = this.arrayReglasDestino.find(rule => {
                    if (rule.destino.prestacion.conceptId === this.prestacionDestino.id) {
                        const orgDestino = this.arrayReglasDestino.filter(r => r.destino.prestacion.conceptId === this.prestacionDestino.id).map(elem => {
                            return { id: elem.destino.organizacion.id, nombre: elem.destino.organizacion.nombre };
                        });
                        this.dataOrganizacionesDestino = [...orgDestino];
                        return rule;
                    }
                });
                this.modelo.solicitud.tipoPrestacion = regla.destino.prestacion;

            } else {
                const orgDestino = this.arrayReglasDestino.map(elem => {
                    return { id: elem.destino.organizacion.id, nombre: elem.destino.organizacion.nombre };
                });
                this.dataOrganizacionesDestino = [...orgDestino];
                if (!this.modelo.solicitud.organizacion) {
                    this.dataReglasDestino = [];
                }
            }
        }
    }

    checkProfesional() {
        // Si profesional origen y destino coinciden ..
        if (!this.autocitado && this.modelo.solicitud.profesionalOrigen && this.modelo.solicitud.profesional
            && this.modelo.solicitud.profesionalOrigen.id === this.modelo.solicitud.profesional.id) {
            // Si organización origen y destino son distintas ..
            if (this.modelo.solicitud.organizacionOrigen && this.modelo.solicitud.organizacionOrigen.id !== this.modelo.solicitud.organizacion.id) {
                this.plex.info('info', 'Para realizar una autocitación, la organización origen y destino debe ser la misma.');
                this.modelo.solicitud.profesional = [];
            }
        }
    }

    confirmGuardar($event) {
        if ($event.formValid) {
            if (this.tipoSolicitud === 'entrada' && !this.modelo.solicitud.profesionalOrigen) {
                this.plex.confirm('Está a punto de guardar una solicitud de entrada sin indicar profesional de origen', '¿Desea continuar?').then((resultado) => {
                    if (resultado) {
                        this.guardarSolicitud();
                    }
                });
            } else {
                this.guardarSolicitud();
            }
        } else {
            this.plex.info('danger', 'Debe completar los datos requeridos');
        }
    }

    guardarSolicitud() {
        const params: any = {
            estados: [
                'auditoria',
                'pendiente',
                'ejecucion'
            ],
            idPaciente: this.paciente.id,
            prestacionDestino: this.modelo.solicitud.tipoPrestacion.conceptId
        };
        this.servicioPrestacion.getSolicitudes(params).subscribe(resultado => {
            if (resultado.length) {
                this.plex.confirm(`El paciente ya tiene una solicitud en curso para ${this.modelo.solicitud.tipoPrestacion.term}. ¿Desea continuar?`, 'Paciente con solicitud en curso').then(confirmar => {
                    if (confirmar) {
                        this.postSolicitud();
                    }
                });
            } else {
                this.postSolicitud();
            }
        });
    }

    private postSolicitud() {
        if (this.tipoSolicitud === 'entrada') {
            this.modelo.solicitud.organizacion = this.auth.organizacion;
            // ------- solo solicitudes de entrada pueden ser autocitadas  ------
            if (this.autocitado) {
                this.modelo.solicitud.profesional = this.modelo.solicitud.profesionalOrigen;
                this.modelo.solicitud.organizacionOrigen = this.modelo.solicitud.organizacion;
                this.modelo.solicitud.tipoPrestacionOrigen = this.modelo.solicitud.tipoPrestacion;
                // solicitudes autocitadas
                this.modelo.estados = [{ tipo: 'pendiente' }];
            }
        } else {
            this.modelo.solicitud.organizacionOrigen = this.auth.organizacion;
            const reglaAplicada = this.arrayReglasDestino.find(regla => regla.destino.prestacion.conceptId === this.modelo.solicitud.tipoPrestacion.conceptId &&
                regla.destino.organizacion.id === this.modelo.solicitud.organizacion.id);
            const reglaOrigen = reglaAplicada.origen.prestaciones.find(regla => {
                return regla.prestacion.conceptId === this.modelo.solicitud.tipoPrestacionOrigen.conceptId;
            });
            if (reglaOrigen.auditable) {
                this.modelo.estados = [{ tipo: 'auditoria' }];
            } else {
                this.modelo.estados = [{ tipo: 'pendiente' }];
            }
        }
        this.modelo.solicitud.registros.push({
            nombre: this.modelo.solicitud.tipoPrestacion.term,
            concepto: this.modelo.solicitud.tipoPrestacion,
            valor: {
                solicitudPrestacion: {
                    motivo: this.motivo,
                    autocitado: this.autocitado
                },
                documentos: this.documentos
            },
            tipo: 'solicitud'
        });
        this.modelo.paciente = {
            id: this.paciente.id,
            nombre: this.paciente.nombre,
            alias: this.paciente.alias,
            apellido: this.paciente.apellido,
            documento: this.paciente.documento,
            numeroIdentificacion: this.paciente.numeroIdentificacion,
            sexo: this.paciente.sexo,
            genero: this.paciente.genero,
            fechaNacimiento: this.paciente.fechaNacimiento
        };
        // Se guarda la solicitud 'pendiente' de prestación
        this.servicioPrestacion.post(this.modelo).subscribe(respuesta => {
            this.plex.toast('success', this.modelo.solicitud.tipoPrestacion.term, 'Solicitud guardada', 4000);
            this.operacionFinalizada.emit(true);
        });
    }

    cancelar() {
        this.operacionFinalizada.emit(false);
    }

    loadProfesionales(event) {
        if (event.query) {
            const query = {
                nombreCompleto: event.query
            };
            this.servicioProfesional.get(query).subscribe(event.callback);
        } else {
            event.callback([]);
        }
    }

    imageRemoved(archivo: FileObject) {
        this.driveService.deleteFile(archivo.id).subscribe(() => {
            const index = this.documentos.findIndex((doc) => doc.id === archivo.id);
            this.documentos.splice(index, 1);
            this.calcDocumentosUrl();
        });
    }

    calcDocumentosUrl() {
        this.documentosUrl = this.documentos.map((doc) => {
            return {
                ...doc,
                url: this.adjuntosService.createUrl('rup', doc, this.fileToken)
            };
        });
    }

    onUpload($event) {
        if ($event.status === 200) {
            this.documentos.push({
                ext: $event.body.ext,
                id: $event.body.id
            });
            this.calcDocumentosUrl();
        }
    }
}
