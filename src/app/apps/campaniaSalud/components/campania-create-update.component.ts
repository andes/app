import { environment } from './../../../../environments/environment';
import { AdjuntosService } from './../../../modules/rup/services/adjuntos.service';
import { CampaniaSaludService } from './../services/campaniaSalud.service';
import { ICampaniaSalud } from './../interfaces/ICampaniaSalud';
import { Plex } from '@andes/plex';
import { Component, OnInit, Input, EventEmitter, Output, ViewChildren, QueryList } from '@angular/core';
import * as enumerados from '../../../utils/enumerados';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'campaniaForm',
    templateUrl: 'campania-create-update.html'
})
export class CampaniaFormComponent implements OnInit {
    /**
     * Campaña que se utiliza para crear o editar.
     *
     * @readonly
     * @type {ICampaniaSalud}
     * @memberof CampaniaFormComponent
     */
    @Input()
    get campania(): ICampaniaSalud {
        return this.campaniaEdit;
    }
    set campania(value: ICampaniaSalud) {
        this.campaniaEdit = {} as any;
        Object.assign(this.campaniaEdit, value);
        if (!this.campaniaEdit.target) {
            this.campaniaEdit.target = {};
        }
        if (!this.campaniaEdit.target.grupoEtario) {
            this.campaniaEdit.target.grupoEtario = {};
        }
        console.log('campaniaEdit: ', this.campaniaEdit);
    }
    @Output() cancelar = new EventEmitter<boolean>();
    @Output() guardar = new EventEmitter<ICampaniaSalud>();

    /**
     * Clon de la campaña pasada por parámetro sobre el que se realizan las modificaciones.
     * Si se guarda, es este el objeto que pisa el documento de la base de datos.
     * @type {ICampaniaSalud}
     * @memberof CampaniaFormComponent
     */
    campaniaEdit: ICampaniaSalud;
    /**
     * Donde se almacenan las diferentes opciones de sexo enumerados
     *
     * @type {any[]}
     * @memberof CampaniaFormComponent
     */
    sexos: any[];
    /*CARGA DE IMAGENES*/
    // @ViewChildren('upload') childsComponents: QueryList<any>;
    // errorExt = false;

    // extensions = [
    //     // Documentos
    //     'pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'xml', 'html', 'txt',
    //     // Audio/Video
    //     'mp3', 'mp4', 'm4a', 'mpeg', 'mpg', 'mov', 'flv', 'avi', 'mkv',
    //     // Otros
    //     'dat'
    // ];

    // documentos = [];

    // imagenes = ['bmp', 'jpg', 'jpeg', 'gif', 'png', 'tif', 'tiff', 'raw'];
    // fotos: any[] = [];
    // lightbox = false;
    // indice;
    // fileToken: String = null;
    /*FIN CARGA DE IMAGENES*/

    constructor(private plex: Plex, private campaniaSaludService: CampaniaSaludService, public adjuntosService: AdjuntosService, public sanitazer: DomSanitizer) {

    }
    ngOnInit(): void {
        this.sexos = enumerados.getObjSexos();

        // INICIO CARGA DE IMAGENES
        // this.extensions = this.extensions.concat(this.imagenes);
        // this.adjuntosService.generateToken().subscribe((data: any) => {
        //     this.fileToken = data.token;
        // });
        // FIN CARGA DE IMAGENES
    }

    /**
     * Notifica al componente padre que se seleccionó la opción de cancelar modificaciones del formulario
     *
     * @memberof CampaniaFormComponent
     */
    onCancel() {
        this.cancelar.emit();
    }

    /**
     * Notifica al componente padre que se seleccionó la opción de guardar las modicicaciones del formulario.
     *
     * @param {*} $event
     * @memberof CampaniaFormComponent
     */
    save($event) {
        if ($event.formValid) {
            if ((this.campaniaEdit.target.grupoEtario.desde && this.campaniaEdit.target.grupoEtario.hasta)
                && this.campaniaEdit.target.grupoEtario.desde > this.campaniaEdit.target.grupoEtario.hasta) {
                this.plex.info('danger', 'Edad Desde debe ser menor que la Edad Hasta.');
            } else {
                if (this.campaniaEdit.target && this.campaniaEdit.target.sexo) { // como sexo es un enumerado, debo hacer esto para obtener el id (string) que se va a guardar en base de datos
                    this.campaniaEdit.target.sexo = (this.campaniaEdit.target.sexo as any).id || this.campaniaEdit.target.sexo;
                }

                (this.campaniaEdit.id ? this.campaniaSaludService.putCampanias(this.campaniaEdit)
                    : this.campaniaSaludService.postCampanias(this.campaniaEdit)).subscribe(res => {
                        this.plex.info('success', 'Los datos están correctos');
                        console.log('campaña guardada: ', res);
                        this.guardar.emit(res);
                    });

            }

        } else {
            this.plex.info('warning', 'Completar datos requeridos');
        }
    }




    /*INICIO CARGA DE IMAGENES*/
    // changeListener($event): void {
    //     this.readThis($event.target);
    // }

    // private readThis(inputValue: any): void {
    //     let ext = this.fileExtension(inputValue.value);
    //     this.errorExt = false;
    //     if (!this.extensions.find((item) => item === ext.toLowerCase())) {
    //         (this.childsComponents.first as any).nativeElement.value = '';
    //         this.errorExt = true;
    //         return;
    //     }
    //     let file: File = inputValue.files[0];
    //     let myReader: FileReader = new FileReader();

    //     myReader.onloadend = (e) => {
    //         console.log(this.childsComponents.first);
    //         (this.childsComponents.first as any).nativeElement.value = '';
    //         let metadata = {};
    //         this.adjuntosService.upload(myReader.result, metadata).subscribe((data) => {
    //             this.fotos.push({
    //                 ext,
    //                 id: data._id
    //             });
    //             this.documentos.push({
    //                 ext,
    //                 id: data._id
    //             });
    //         });


    //     };
    //     myReader.readAsDataURL(file);
    // }

    // fileExtension(file) {
    //     if (file.lastIndexOf('.') >= 0) {
    //         return file.slice((file.lastIndexOf('.') + 1));
    //     } else {
    //         return '';
    //     }
    // }

    // cancelarAdjunto() {
    //     clearTimeout(null);
    // }

    // activaLightbox(index) {
    //     if (this.fotos[index].ext !== 'pdf') {
    //         this.lightbox = true;
    //         this.indice = index;
    //     }
    // }

    // imagenPrevia(i) {
    //     let imagenPrevia = i - 1;
    //     if (imagenPrevia >= 0) {
    //         this.indice = imagenPrevia;
    //     }
    // }

    // imagenSiguiente(i) {
    //     let imagenSiguiente = i + 1;
    //     if (imagenSiguiente <= this.fotos.length - 1) {
    //         this.indice = imagenSiguiente;
    //     }
    // }

    // createUrl(doc) {
    //     /** Hack momentaneo */
    //     // let jwt = window.sessionStorage.getItem('jwt');
    //     if (doc.id) {
    //         let apiUri = environment.API;
    //         return apiUri + '/modules/rup/store/' + doc.id + '?token=' + this.fileToken;
    //     } else {
    //         // Por si hay algún documento en la vieja versión.
    //         return this.sanitazer.bypassSecurityTrustResourceUrl(doc.base64);
    //     }
    // }

    // esImagen(extension) {
    //     return this.imagenes.find(x => x === extension.toLowerCase());
    // }

    // imageRemoved($event) {
    //     let index = this.fotos.indexOf($event);
    //     this.fotos.splice(index, 1);
    //     // this.registro.valor.documentos.splice(index, 1);
    // }


    /*FIN CARGA DE IMAGENES*/
}
