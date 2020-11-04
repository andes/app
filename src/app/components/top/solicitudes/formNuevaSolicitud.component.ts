import { Component, Output, EventEmitter, ViewChildren, QueryList, OnInit, OnDestroy, Input } from '@angular/core';
import { Plex } from '@andes/plex';
import { OrganizacionService } from '../../../services/organizacion.service';
import { ProfesionalService } from '../../../services/profesional.service';
import { Auth } from '@andes/auth';
import { PrestacionesService } from '../../../modules/rup/services/prestaciones.service';
import { ReglaService } from '../../../services/top/reglas.service';
import { environment } from '../../../../environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { AdjuntosService } from '../../../modules/rup/services/adjuntos.service';
import { ActivatedRoute, Router } from '@angular/router';

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
    fileToken: String = null;
    timeout = null;
    documentos = [];
    imagenes = ['bmp', 'jpg', 'jpeg', 'gif', 'png', 'tif', 'tiff', 'raw'];
    extensions = [
        // Documentos
        'pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'xml', 'html', 'txt',
        // Audio/Video
        'mp3', 'mp4', 'm4a', 'mpeg', 'mpg', 'mov', 'flv', 'avi', 'mkv',
        // Otros
        'dat'
    ];

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
    arrayPrestacionesOrigen: { id: any; nombre: any; }[];
    arrayReglasOrigen: { id: any; nombre: any; }[];
    arrayOrganizacionesOrigen: { id: any; nombre: any; }[];
    dataOrganizacionesOrigen = [];
    dataOrganizacionesDestino = [];
    dataTipoPrestacionesOrigen = [];
    dataReglasDestino = [];
    dataReglasOrigen: { id: any; nombre: any; }[];

    constructor(
        private plex: Plex,
        private auth: Auth,
        private servicioOrganizacion: OrganizacionService,
        private servicioProfesional: ProfesionalService,
        private servicioPrestacion: PrestacionesService,
        private servicioReglas: ReglaService,
        public sanitazer: DomSanitizer,
        public adjuntosService: AdjuntosService,
        private route: ActivatedRoute,
        private router: Router,
    ) { }

    ngOnInit() {
        if (this.tipoSolicitud === 'entrada') {
            this.modelo.solicitud.organizacion = this.auth.organizacion;
        } else {
            this.modelo.solicitud.organizacionOrigen = this.auth.organizacion;
        }
        this.extensions = this.extensions.concat(this.imagenes);
        this.adjuntosService.generateToken().subscribe((data: any) => {
            this.fileToken = data.token;
        });
    }

    loadOrganizacion(event) {
        if (event.query) {
            let query = {
                nombre: event.query
            };
            this.servicioOrganizacion.get(query).subscribe(resultado => {
                event.callback(resultado);
            });
        } else {
            event.callback([]);
        }
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
                            this.dataReglasDestino = res.map(elem => { return { id: elem.destino.prestacion.conceptId, nombre: elem.destino.prestacion.term }; });
                            this.dataOrganizacionesDestino = res.map(elem => { return { id: elem.destino.organizacion.id, nombre: elem.destino.organizacion.nombre }; });
                        }
                    );
            }
        } else if (this.tipoSolicitud === 'entrada' && this.auth.organizacion.id) {
            if (this.prestacionOrigen) {
                let regla: any = this.arrayReglasOrigen.find((rule: any) => { return rule.prestacion.conceptId === this.prestacionOrigen.id; });
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
            let regla: any = this.arrayOrganizacionesOrigen.find((org: any) => org.origen.organizacion.id === this.modelo.solicitud.organizacionOrigen.id);
            if (regla && regla.origen) {
                this.arrayReglasOrigen = regla.origen.prestaciones;
                this.dataTipoPrestacionesOrigen = regla.origen.prestaciones.map(elem => { return { id: elem.prestacion.conceptId, nombre: elem.prestacion.term }; });
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
                        this.dataOrganizacionesOrigen = res.map(elem => { return { id: elem.origen.organizacion.id, nombre: elem.origen.organizacion.nombre }; });
                    }
                );
        }
    }

    onSelectPrestacionDestino() {
        if (this.modelo.solicitud.tipoPrestacionOrigen) {
            if (this.prestacionDestino) {
                let regla = this.arrayReglasDestino.find(rule => {
                    if (rule.destino.prestacion.conceptId === this.prestacionDestino.id) {
                        const orgDestino = this.arrayReglasDestino.filter(r => r.destino.prestacion.conceptId === this.prestacionDestino.id).map(elem => { return { id: elem.destino.organizacion.id, nombre: elem.destino.organizacion.nombre }; });
                        this.dataOrganizacionesDestino = [...orgDestino];
                        return rule;
                    }
                });
                this.modelo.solicitud.tipoPrestacion = regla.destino.prestacion;

            } else {
                const orgDestino = this.arrayReglasDestino.map(elem => { return { id: elem.destino.organizacion.id, nombre: elem.destino.organizacion.nombre }; });
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

    guardarSolicitud($event) {
        if ($event.formValid) {
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
                let reglaAplicada = this.arrayReglasDestino.find(r => r.destino.prestacion.conceptId === this.modelo.solicitud.tipoPrestacion.conceptId &&
                    r.destino.organizacion.id === this.modelo.solicitud.organizacion.id);
                let reglaOrigen = reglaAplicada.origen.prestaciones.find(rule => { return rule.prestacion.conceptId === this.modelo.solicitud.tipoPrestacionOrigen.conceptId; });
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
                apellido: this.paciente.apellido,
                documento: this.paciente.documento,
                sexo: this.paciente.sexo,
                fechaNacimiento: this.paciente.fechaNacimiento
            };
            // Se guarda la solicitud 'pendiente' de prestación
            this.servicioPrestacion.post(this.modelo).subscribe(respuesta => {
                this.plex.toast('success', this.modelo.solicitud.tipoPrestacion.term, 'Solicitud guardada', 4000);
                this.operacionFinalizada.emit(true);
            });

        } else {
            this.plex.info('danger', 'Debe completar los datos requeridos');
        }
    }

    cancelar() {
        this.operacionFinalizada.emit(false);
    }

    loadProfesionales(event) {
        if (event.query) {
            let query = {
                nombreCompleto: event.query
            };
            this.servicioProfesional.get(query).subscribe(event.callback);
        } else {
            event.callback([]);
        }
    }

    // Adjuntar archivo
    changeListener($event): void {
        this.readThis($event.target);
    }

    readThis(inputValue: any): void {
        let ext = this.fileExtension(inputValue.value);
        this.errorExt = false;
        if (!this.extensions.find((item) => item === ext.toLowerCase())) {
            (this.childsComponents.first as any).nativeElement.value = '';
            this.errorExt = true;
            return;
        }
        let file: File = inputValue.files[0];
        let myReader: FileReader = new FileReader();

        myReader.onloadend = (e) => {
            (this.childsComponents.first as any).nativeElement.value = '';
            let metadata = {};
            this.adjuntosService.upload(myReader.result, metadata).subscribe((data) => {
                this.documentos.push({
                    ext,
                    id: data._id
                });
            });
        };
        myReader.readAsDataURL(file);
    }

    fileExtension(file) {
        if (file.lastIndexOf('.') >= 0) {
            return file.slice((file.lastIndexOf('.') + 1));
        } else {
            return '';
        }
    }

    esImagen(extension) {
        return this.imagenes.find(x => x === extension.toLowerCase());
    }

    imageUploaded($event) {
        let documento = {
            ext: this.fileExtension($event.file.name),
            file: $event.src,
        };
        this.documentos.push(documento);
    }

    imageRemoved($event) {
        let index = this.documentos.indexOf($event);
        this.documentos.splice(index, 1);
    }

    get documentosUrl() {
        return this.documentos.map((doc) => {
            doc.url = this.createUrl(doc);
            return doc;
        });
    }

    createUrl(doc) {
        /** Hack momentaneo */
        if (doc.id) {
            let apiUri = environment.API;
            return apiUri + '/modules/rup/store/' + doc.id + '?token=' + this.fileToken;
        } else {
            // Por si hay algún documento en la vieja versión.
            return this.sanitazer.bypassSecurityTrustResourceUrl(doc.base64);
        }
    }

    cancelarAdjunto() {
        clearTimeout(this.timeout);
        this.waiting = false;
    }
}