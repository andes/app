import { Input, Component, OnInit } from '@angular/core';
import { AdjuntosService } from '../../../modules/rup/services/adjuntos.service';
import { environment } from '../../../../environments/environment';
import { DomSanitizer } from '@angular/platform-browser';
import { Plex } from '@andes/plex';
@Component({
    selector: 'detalle-solicitud',
    templateUrl: './detalleSolicitud.html',
    styleUrls: ['adjuntarDocumento.scss'],
})
export class DetalleSolicitudComponent implements OnInit {
    imagenes = ['bmp', 'jpg', 'jpeg', 'gif', 'png', 'tif', 'tiff', 'raw'];
    extensions = [
        // Documentos
        'pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'xml', 'html', 'txt',
        // Audio/Video
        'mp3', 'mp4', 'm4a', 'mpeg', 'mpg', 'mov', 'flv', 'avi', 'mkv',
        // Otros
        'dat'
    ];
    @Input() prestacionSeleccionada: any;
    @Input() turnoSeleccionado: any;
    @Input() tipoSolicitud: string;
    // Adjuntos
    fotos: any[] = [];
    fileToken: String = null;
    lightbox = false;
    indice;
    public items = [
        { key: 'solicitud', label: 'SOLICITUD' },
        { key: 'historial', label: 'HISTORIAL' }
    ];
    public mostrar;
    pacienteFields = ['sexo', 'fechaNacimiento', 'edad', 'cuil', 'financiador', 'numeroAfiliado', 'direccion', 'telefono'];
    ngOnInit() {
        this.extensions = this.extensions.concat(this.imagenes);
        this.adjuntosService.generateToken().subscribe((data: any) => {
            this.fileToken = data.token;
        });
    }
    constructor(
        plex: Plex,
        public adjuntosService: AdjuntosService,
        public sanitazer: DomSanitizer,
    ) { }
    esImagen(extension) {
        return this.imagenes.find(x => x === extension.toLowerCase());
    }
    createUrl(doc) {
        if (doc.id) {
            let apiUri = environment.API;
            return apiUri + '/modules/rup/store/' + doc.id + '?token=' + this.fileToken;
        } else {
            // Por si hay algún documento en la vieja versión.
            return this.sanitazer.bypassSecurityTrustResourceUrl(doc.base64);
        }
    }
    cambiarOpcion(opcion) {
        this.mostrar = opcion;
    }
    get documentos() {
        let solicitudRegistros = this.prestacionSeleccionada.solicitud.registros;
        if (solicitudRegistros.some(reg => reg.valor.documentos)) {
            return solicitudRegistros[0].valor.documentos.map((doc) => {
                doc.url = this.createUrl(doc);
                return doc;
            });
        } else {
            return [];
        }
    }
}
