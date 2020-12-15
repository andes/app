import { DriveService } from 'src/app/services/drive.service';
import { DerivacionesService } from './../../../../services/com/derivaciones.service';
import { Component, Output, EventEmitter, ViewChildren, QueryList, OnInit, OnDestroy } from '@angular/core';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { OrganizacionService } from 'src/app/services/organizacion.service';
import { ProfesionalService } from 'src/app/services/profesional.service';
import { PacienteService } from 'src/app/core/mpi/services/paciente.service';
import { COMAdjuntosService } from 'src/app/services/com/adjuntos.service';
import { IMAGENES_EXT, FILE_EXT } from '@andes/shared';

@Component({
    selector: 'nueva-solicitud',
    templateUrl: './nueva-derivacion.html',
    styleUrls: ['../adjuntos.scss']
})
export class NuevaDerivacionComponent implements OnInit, OnDestroy {
    @ViewChildren('upload') childsComponents: QueryList<any>;
    @Output() newDerivacionEmitter: EventEmitter<any> = new EventEmitter<any>();
    paciente: any;
    organizacionDestino: any;
    detalle: '';
    // Adjuntar Archivo
    errorExt = false;
    fileToken: String = null;
    adjuntos = [];
    adjuntosUrl = [];
    imagenes = IMAGENES_EXT;
    extensions = FILE_EXT;

    modelo: any = {
        fecha: new Date(),
        organizacionOrigen: null,
        organizacionDestino: {
            id: '',
            nombre: '',
            direccion: ''
        },
        profesionalSolicitante: null,
        paciente: {
            id: '',
            nombre: '',
            apellido: '',
            documento: '',
            sexo: '',
            fechaNacimiento: null
        },
        detalle: '',
        estado: 'solicitada',
        obraSocial: null,
        historial: []
    };
    organizacionesDestino = [];
    paramsSubscribe: any;

    constructor(
        private plex: Plex,
        private auth: Auth,
        private organizacionService: OrganizacionService,
        private derivacionesService: DerivacionesService,
        private profesionalService: ProfesionalService,
        private pacienteService: PacienteService,
        public sanitazer: DomSanitizer,
        public adjuntosService: COMAdjuntosService,
        private route: ActivatedRoute,
        private router: Router,
        private driveService: DriveService
    ) { }

    ngOnInit() {
        if (!(this.auth.getPermissions('com:?').length > 0)) {
            this.router.navigate(['./inicio']);
        }
        this.plex.updateTitle([{
            route: '/com',
            name: 'COM'
        }, {
            name: 'Nueva derivación'
        }
        ]);
        this.paramsSubscribe = this.route.params.subscribe(params => {
            if (params['paciente']) {
                this.seleccionarPaciente(params['paciente']);
                this.modelo.organizacionOrigen = this.auth.organizacion;
                this.seleccionarProfesional(this.auth.profesional);
            } else {

            }
        });
        this.extensions = this.extensions.concat(this.imagenes);
        this.adjuntosService.generateToken().subscribe((data: any) => {
            this.fileToken = data.token;
        });
        this.cargarDestinos();
    }

    ngOnDestroy() {
        if (this.paramsSubscribe) {
            this.paramsSubscribe.unsubscribe();
        }
    }

    seleccionarPaciente(idPaciente): void {
        this.pacienteService.getById(idPaciente).subscribe(
            paciente => {
                this.paciente = paciente;
            },
            () => {
                this.plex.info('danger', 'Intente nuevamente', 'Error en la búsqueda de paciente');
                this.router.navigate(['/derivaciones']);
            }
        );
    }

    seleccionarProfesional(idProfesional): void {
        this.profesionalService.getProfesional({ id: idProfesional }).subscribe(
            profesional => {
                this.modelo.profesionalSolicitante = profesional[0];
            },
            () => {
                this.plex.info('danger', 'Intente nuevamente', 'Error al asignar profesional por defecto');
            }
        );
    }

    cargarDestinos() {
        this.organizacionService.get({ esCOM: true }).subscribe(resultado => {
            this.organizacionesDestino = resultado;
            this.organizacionDestino = this.organizacionesDestino[0];
        });
    }

    guardarDerivacion($event) {
        if ($event.formValid) {
            this.derivacionesService.search({ paciente: this.paciente.id, estado: '~finalizada' }).subscribe(resultado => {
                if (resultado.length) {
                    this.plex.toast('danger', 'Ya existe una derivación en curso para el paciente seleccionado');
                } else {
                    this.modelo.organizacionOrigen = this.auth.organizacion;
                    this.modelo.paciente = {
                        id: this.paciente.id,
                        nombre: this.paciente.nombre,
                        apellido: this.paciente.apellido,
                        documento: this.paciente.documento,
                        sexo: this.paciente.sexo,
                        fechaNacimiento: this.paciente.fechaNacimiento
                    };
                    if (this.paciente.financiador) {
                        this.modelo.paciente.obraSocial = this.paciente.financiador[0];
                    }
                    this.modelo.organizacionDestino = {
                        id: this.organizacionDestino.id,
                        nombre: this.organizacionDestino.nombre,
                        direccion: this.organizacionDestino.direccion
                    };
                    this.modelo.historial.push({ estado: 'solicitada', organizacionDestino: this.modelo.organizacionDestino, observacion: 'Inicio de derivación' });
                    this.modelo.adjuntos = this.adjuntos;
                    this.derivacionesService.create(this.modelo).subscribe(respuesta => {
                        this.router.navigate(['/com']);
                        this.plex.toast('success', 'Derivación guardada', 'Éxito', 4000);
                    });
                }
            });
        } else {
            this.plex.info('danger', 'Debe completar los datos requeridos');
        }
    }

    cancelar() {
        this.router.navigate(['/com']);
    }

    loadProfesionales(event) {
        if (event.query) {
            let query = {
                nombreCompleto: event.query
            };
            this.profesionalService.get(query).subscribe(event.callback);
        } else {
            event.callback([]);
        }
    }

    onUpload($event) {
        if ($event.status = 200) {
            this.adjuntos.push({
                ext: $event.body.ext,
                id: $event.body.id
            });
            this.calcDocumentosUrl();
        }
    }

    removeFile($event) {
        this.driveService.deleteFile($event.id).subscribe(() => {
            const index = this.adjuntos.findIndex(a => a.id === $event.id);
            this.adjuntos.splice(index, 1);
            this.calcDocumentosUrl();
        });
    }

    calcDocumentosUrl() {
        this.adjuntosUrl = this.adjuntos.map((doc) => {
            return {
                ...doc,
                url: this.derivacionesService.getUrlImage(doc.id, this.fileToken)
            };
        });
    }
}
