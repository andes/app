import { Component, Output, EventEmitter, Input, HostBinding, ViewChildren, QueryList, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';
import { TipoPrestacionService } from '../../../services/tipoPrestacion.service';
import { OrganizacionService } from '../../../services/organizacion.service';
import { ProfesionalService } from '../../../services/profesional.service';
import { Auth } from '@andes/auth';
import { PrestacionesService } from '../../../modules/rup/services/prestaciones.service';
import { ReglaService } from '../../../services/top/reglas.service';
import { environment } from '../../../../environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { AdjuntosService } from '../../../modules/rup/services/adjuntos.service';

@Component({
    selector: 'nueva-solicitud',
    templateUrl: './nuevaSolicitud.html',
    styleUrls: ['adjuntarDocumento.scss'],
})
export class NuevaSolicitudComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;
    @ViewChildren('upload') childsComponents: QueryList<any>;

    showSeleccionarPaciente = true;
    permisos = this.auth.getPermissions('turnos:darTurnos:prestacion:?');
    paciente: any;
    motivo: '';
    fecha: any;
    arrayReglasDestino = [];
    autocitado = false;
    prestacionDestino: any;
    prestacionOrigen: any;
    // Adjuntar Archivo
    errorExt = false;
    waiting = false;
    fotos: any[] = [];
    fileToken: String = null;
    timeout = null;
    lightbox = false;
    indice;
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

    private _tipoSolicitud;
    @Input('tipoSolicitud')
    set tipoSolicitud(value: any) {
        this._tipoSolicitud = value;
        if (this._tipoSolicitud === 'entrada') {
            this.modelo.solicitud.organizacion = this.auth.organizacion;
        } else {
            this.modelo.solicitud.organizacionOrigen = this.auth.organizacion;
        }
    }
    get tipoSolicitud() {
        return this._tipoSolicitud;
    }
    @Output() newSolicitudEmitter: EventEmitter<any> = new EventEmitter<any>();
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
        private servicioTipoPrestacion: TipoPrestacionService,
        private servicioOrganizacion: OrganizacionService,
        private servicioProfesional: ProfesionalService,
        private servicioPrestacion: PrestacionesService,
        private servicioReglas: ReglaService,
        public sanitazer: DomSanitizer,
        public adjuntosService: AdjuntosService,

    ) { }

    ngOnInit() {
        this.extensions = this.extensions.concat(this.imagenes);
        this.adjuntosService.generateToken().subscribe((data: any) => {
            this.fileToken = data.token;
        });
    }

    seleccionarPaciente(paciente: any): void {
        this.paciente = paciente;
        this.showSeleccionarPaciente = false;
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
        if (this.tipoSolicitud === 'salida' && this.auth.organizacion.id && this.modelo.solicitud.tipoPrestacionOrigen && this.modelo.solicitud.tipoPrestacionOrigen.conceptId) {
            this.servicioReglas.get({ organizacionOrigen: this.auth.organizacion.id, prestacionOrigen: this.modelo.solicitud.tipoPrestacionOrigen.conceptId })
                .subscribe(
                    res => {
                        this.arrayReglasDestino = res;
                        this.dataReglasDestino = res.map(elem => { return { id: elem.destino.prestacion.conceptId, nombre: elem.destino.prestacion.term }; });
                        this.dataOrganizacionesDestino = res.map(elem => { return { id: elem.destino.organizacion.id, nombre: elem.destino.organizacion.nombre }; });

                    }
                );
        }
        if (this.tipoSolicitud === 'entrada' && this.auth.organizacion.id && this.modelo.solicitud.tipoPrestacion && this.modelo.solicitud.tipoPrestacion.conceptId) {
            if (this.prestacionOrigen) {
                // let regla: any = this.arrayReglasOrigen.find((rule: any) => { return rule.conceptId === this.prestacionOrigen.id; });
                let regla: any = this.arrayReglasOrigen.find((rule: any) => { return rule.prestacion.conceptId === this.prestacionOrigen.id; });

                if (regla.auditable) {
                    this.modelo.estados.push({ tipo: 'auditoria' });
                } else {
                    this.modelo.estados.push({ tipo: 'pendiente' });
                }
                this.modelo.solicitud.tipoPrestacionOrigen = regla.prestacion;
            }
        }
    }

    onSelectOrganizacionOrigen() {
        let regla: any = this.arrayOrganizacionesOrigen.find((org: any) => org.origen.organizacion.id === this.modelo.solicitud.organizacionOrigen.id);
        if (regla && regla.origen) {
            this.arrayReglasOrigen = regla.origen.prestaciones;
            this.dataTipoPrestacionesOrigen = regla.origen.prestaciones.map(elem => { return { id: elem.prestacion.conceptId, nombre: elem.prestacion.term }; });
        }
    }

    onSelectOrganizacionDestino() {
        if (this.tipoSolicitud === 'salida') {
            this.servicioReglas.get({ organizacionOrigen: this.auth.organizacion.id, prestacionOrigen: this.modelo.solicitud.tipoPrestacionOrigen.conceptId })
                .subscribe(
                    res => {
                        this.dataReglasDestino = res.map(elem => { return { id: elem.destino.prestacion.conceptId, nombre: elem.destino.prestacion.term }; });
                    }
                );
        }
    }

    onSelectPrestacionOrigen() {
        if (this.tipoSolicitud === 'entrada' && this.modelo.solicitud && this.modelo.solicitud.tipoPrestacion) {
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
        if (this.prestacionDestino && this.modelo.solicitud && this.modelo.solicitud.tipoPrestacionOrigen) {
            let regla = this.arrayReglasDestino.find(rule => { return rule.destino.prestacion.conceptId === this.prestacionDestino.id; });
            this.modelo.solicitud.tipoPrestacion = regla.destino.prestacion;
            let regla2 = regla.origen.prestaciones.find(rule => { return rule.prestacion.conceptId === this.modelo.solicitud.tipoPrestacionOrigen.conceptId; });
            if (regla2.auditable) {
                this.modelo.estados.push({ tipo: 'auditoria' });
            } else {
                this.modelo.estados.push({ tipo: 'pendiente' });
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
                    this.modelo.estados.push({ tipo: 'pendiente' });
                }
            } else {
                this.modelo.solicitud.organizacionOrigen = this.auth.organizacion;
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
                this.newSolicitudEmitter.emit();
                this.plex.toast('success', this.modelo.solicitud.tipoPrestacion.term, 'Solicitud guardada', 4000);
            });

        } else {
            this.plex.alert('Debe completar los datos requeridos');
        }
    }

    cancelar() {
        this.newSolicitudEmitter.emit();
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

    loadTipoPrestaciones(event) {
        this.servicioTipoPrestacion.get({ turneable: 1 }).subscribe((data: any) => {
            let dataF;
            if (this.permisos[0] === '*') {
                dataF = data;
            } else {
                dataF = data.filter((x) => { return this.permisos.indexOf(x.id) >= 0; });
            }
            event.callback(dataF);
        });
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
            console.log(this.childsComponents.first);
            (this.childsComponents.first as any).nativeElement.value = '';
            let metadata = {};
            this.adjuntosService.upload(myReader.result, metadata).subscribe((data) => {
                this.fotos.push({
                    ext,
                    id: data._id
                });
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
        let foto = {
            ext: this.fileExtension($event.file.name),
            file: $event.src,
        };
        this.fotos.push(foto);
    }

    imageRemoved($event) {
        let index = this.fotos.indexOf($event);
        this.fotos.splice(index, 1);
        // this.registro.valor.documentos.splice(index, 1);
    }

    activaLightbox(index) {
        if (this.fotos[index].ext !== 'pdf') {
            this.lightbox = true;
            this.indice = index;
        }
    }

    imagenPrevia(i) {
        let imagenPrevia = i - 1;
        if (imagenPrevia >= 0) {
            this.indice = imagenPrevia;
        }
    }

    imagenSiguiente(i) {
        let imagenSiguiente = i + 1;
        if (imagenSiguiente <= this.fotos.length - 1) {
            this.indice = imagenSiguiente;
        }
    }

    createUrl(doc) {
        /** Hack momentaneo */
        // let jwt = window.sessionStorage.getItem('jwt');
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
