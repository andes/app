import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { FILE_EXT, IMAGENES_EXT } from '@andes/shared';
import { Component, EventEmitter, OnDestroy, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { PacienteService } from 'src/app/core/mpi/services/paciente.service';
import { ElementosRUPService } from 'src/app/modules/rup/services/elementosRUP.service';
import { TipoTrasladoService } from 'src/app/services/com/tipoTraslados.service';
import { DriveService } from 'src/app/services/drive.service';
import { OrganizacionService } from 'src/app/services/organizacion.service';
import { ProfesionalService } from 'src/app/services/profesional.service';
import { DerivacionesService } from './../../../../services/com/derivaciones.service';
import { AdjuntosService } from './../../../rup/services/adjuntos.service';

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
    fileToken: string = null;
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
    tipoTraslados = [];
    paramsSubscribe: any;
    esCOM;

    constructor(
        private plex: Plex,
        private auth: Auth,
        private organizacionService: OrganizacionService,
        private derivacionesService: DerivacionesService,
        private tipoTrasladoService: TipoTrasladoService,
        private profesionalService: ProfesionalService,
        private pacienteService: PacienteService,
        public sanitazer: DomSanitizer,
        public adjuntosService: AdjuntosService,
        private route: ActivatedRoute,
        private router: Router,
        private driveService: DriveService,
        private elementoRupService: ElementosRUPService
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

        const paciente = this.route.snapshot.paramMap.get('paciente');
        if (paciente) {
            this.organizacionService.getById(this.auth.organizacion.id).subscribe(org => {
                this.esCOM = org.esCOM;
                this.modelo.organizacionOrigen = this.esCOM ? null : this.auth.organizacion;
                this.seleccionarPaciente(paciente);
                this.seleccionarProfesional(this.auth.profesional);
            });
        }

        this.extensions = this.extensions.concat(this.imagenes);
        this.adjuntosService.generateToken().subscribe(data => this.fileToken = data.token);

        this.cargarDestinos();
        this.cargarTipoTraslados();
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

    cargarTipoTraslados() {
        this.tipoTrasladoService.search().subscribe(resultado => {
            this.tipoTraslados = resultado;
        });
    }

    guardarDerivacion($event) {
        if ($event.formValid) {
            this.derivacionesService.search({ paciente: this.paciente.id, estado: '~finalizada', cancelada: false }).subscribe(resultado => {
                if (resultado.length) {
                    this.plex.toast('danger', 'Ya existe una derivación en curso para el paciente seleccionado');
                } else {
                    const concepto = this.elementoRupService.getConceptoDerivacion();

                    // TODO descomentar lineas 149, 150, 152 y 177 a la hora de habilitar el registro de prestación en la derivación.

                    // let nuevaPrestacion = this.servicioPrestacion.inicializarPrestacion(this.paciente, concepto, 'ejecucion', 'internacion');
                    // this.servicioPrestacion.post(nuevaPrestacion).subscribe(prestacion => {

                    // this.modelo.prestacion = prestacion.id,
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
                    // });
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
        if ($event.status === 200) {
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
                url: this.adjuntosService.createUrl('drive', doc, this.fileToken)
            };
        });
    }
}
