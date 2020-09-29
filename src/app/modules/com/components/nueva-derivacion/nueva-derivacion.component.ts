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
    waiting = false;
    fileToken: String = null;
    timeout = null;
    adjuntos = [];
    imagenes = ['bmp', 'jpg', 'jpeg', 'gif', 'png', 'tif', 'tiff', 'raw'];
    extensions = [
        // Documentos
        'pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'xml', 'html', 'txt',
        // Otros
        'dat'
    ];

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
        estado: 'pendiente',
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
    ) { }

    ngOnInit() {
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
            } else {

            }
        });
        this.extensions = this.extensions.concat(this.imagenes);
        this.adjuntosService.generateToken().subscribe((data: any) => {
            this.fileToken = data.token;
        });
        this.loadOrganizaciones();
    }

    ngOnDestroy() {
        if (this.paramsSubscribe) {
            this.paramsSubscribe.unsubscribe();
        }
    }

    seleccionarPaciente(paciente): void {
        this.pacienteService.getById(paciente).subscribe(
            resultado => {
                this.paciente = resultado;
            },
            () => {
                this.plex.info('danger', 'Intente nuevamente', 'Error en la búsqueda de paciente');
                this.router.navigate(['/solicitudes']);
            }
        );
    }

    loadOrganizaciones() {
        this.organizacionService.get({ esCOM: true }).subscribe(resultado => {
            this.organizacionesDestino = resultado;
            this.organizacionDestino = this.organizacionesDestino[0];
        });
    }

    guardarDerivacion($event) {
        if ($event.formValid) {
            this.modelo.organizacionOrigen = this.auth.organizacion;
            this.modelo.paciente = {
                id: this.paciente.id,
                nombre: this.paciente.nombre,
                apellido: this.paciente.apellido,
                documento: this.paciente.documento,
                sexo: this.paciente.sexo,
                fechaNacimiento: this.paciente.fechaNacimiento
            };
            this.modelo.organizacionDestino = {
                id: this.organizacionDestino.id,
                nombre: this.organizacionDestino.nombre,
                direccion: this.organizacionDestino.direccion
            };
            this.modelo.historial.push({ estado: 'pendiente', organizacionDestino: this.modelo.organizacionDestino, observacion: 'Inicio de derivación' });
            this.modelo.adjuntos = this.adjuntos;
            this.derivacionesService.create(this.modelo).subscribe(respuesta => {
                this.router.navigate(['/com']);
                this.plex.toast('success', 'Derivación guardada', 'Éxito', 4000);
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
                this.adjuntos.push({
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

    subirArchivo($event) {
        let foto = {
            ext: this.fileExtension($event.file.name),
            file: $event.src,
        };
        this.adjuntos.push(foto);
    }

    eliminarArchivo($event) {
        let index = this.adjuntos.indexOf($event);
        this.adjuntos.splice(index, 1);
    }

    get adjuntosUrl() {
        return this.adjuntos.map((doc) => {
            doc.url = this.createUrl(doc);
            return doc;
        });
    }

    createUrl(doc) {
        if (doc.id) {
            return this.derivacionesService.getUrlImage(doc.id, this.fileToken);
        }
    }

    cancelarAdjunto() {
        clearTimeout(this.timeout);
        this.waiting = false;
    }
}