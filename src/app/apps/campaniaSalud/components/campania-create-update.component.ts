import { AdjuntosService } from './../../../modules/rup/services/adjuntos.service';
import { CampaniaSaludService } from './../services/campaniaSalud.service';
import { ICampaniaSalud } from './../interfaces/ICampaniaSalud';
import { Plex } from '@andes/plex';
import { Component, OnInit, Input, EventEmitter, Output, ViewChild, ElementRef } from '@angular/core';
import * as enumerados from '../../../utils/enumerados';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

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
        this.imagenSvg = value.imagen;
        this.imagenSegura = this.sanitizer.bypassSecurityTrustHtml(this.imagenSvg);
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
    @ViewChild('upload') uploadComponent: ElementRef;

    /**
     * Bandera que indica si hay un problema con el formato de la imagen ingresada (que sea SVG y que no sea tamaño 35px*35px)
     *
     * @memberof CampaniaFormComponent
     */
    errorFormato = false;
    /**
     * Se utiliza para guardar en BD la imagen ingresada, como String
     *
     * @type {string}
     * @memberof CampaniaFormComponent
     */
    imagenSvg: string;
    /**
     * Esta es la imagen que se muestra al cargarla. Se utiliza esta para librarse del unsafe de la imagen
     * leída directamente en imagenSvg. Si este campo está nulo, el formulario pide que se cargue porque
     * hay un text box oculto que se carga con el valor de esta variable
     *
     * @type {SafeHtml}
     * @memberof CampaniaFormComponent
     */
    imagenSegura: SafeHtml;
    /**
     * Arreglo con todos los formatos válidos para adjuntar la imagen de la campañaformatosValidos
     *
     * @memberof CampaniaFormComponent
     */
    formatosValidos = ['svg'];

    /*FIN CARGA DE IMAGENES*/

    constructor(private plex: Plex, private campaniaSaludService: CampaniaSaludService, public adjuntosService: AdjuntosService, public sanitizer: DomSanitizer) { }

    ngOnInit(): void {
        this.sexos = enumerados.getObjSexos();
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

                this.campaniaEdit.imagen = this.imagenSvg;
                (this.campaniaEdit.id ? this.campaniaSaludService.putCampanias(this.campaniaEdit)
                    : this.campaniaSaludService.postCampanias(this.campaniaEdit)).subscribe(res => {
                        this.plex.info('success', 'Los datos están correctos');
                        this.guardar.emit(res);
                    });
            }

        } else {
            this.plex.info('warning', 'Completar datos requeridos');
        }
    }

    /*INICIO CARGA DE IMAGENES*/
    changeListener($event): void {
        this.readThis($event.target);
    }

    readThis(inputValue: any): void {
        let ext = this.fileExtension(inputValue.value);
        this.errorFormato = false;

        if (!this.formatosValidos.find((item) => item === ext.toLowerCase())) { // se fija si la extensión del archivo está dentro de las opciones permitidas
            this.uploadComponent.nativeElement.value = '';
            this.errorFormato = true;
            this.imagenSegura = null;
            return;
        }
        let file: File = inputValue.files[0];
        let myReader: FileReader = new FileReader();

        myReader.onloadend = (e) => {
            this.uploadComponent.nativeElement.value = '';

            this.imagenSvg = myReader.result as string;
            if (this.confirmarSvg(this.imagenSvg)) {
                this.imagenSegura = this.sanitizer.bypassSecurityTrustHtml(this.imagenSvg);
            } else {
                this.errorFormato = true;
                this.imagenSegura = null;
            }
        };
        myReader.readAsText(file);

    }

    /**
     * Devuelve la extensión del archivo pasado por parámetro
     *
     * @param {*} file
     * @returns {string}
     * @memberof CampaniaFormComponent
     */
    fileExtension(file): string {
        if (file.lastIndexOf('.') >= 0) {
            return file.slice((file.lastIndexOf('.') + 1));
        } else {
            return '';
        }
    }

    /**
     * Confirma si es un archivo SVG con ancho y alto 35px
     *
     * @param {string} archivo
     * @returns {boolean}
     * @memberof CampaniaFormComponent
     */
    confirmarSvg(archivo: string): boolean {
        let regExXml = /<\?xml (.|\n)*\?>/;
        let regExSvg = /svg (.|\n)*\/svg/; // verificar los <>
        let regExTamanio = /width(.|\n)*35[^0-9]*px(.|\n)*height(.|\n)*35[^0-9]*px/;

        let cumpleTamanio: boolean = regExTamanio.test(archivo);
        if (!cumpleTamanio) {
            this.plex.alert('El tamaño de la imagen debe ser 35px x 35px.');
        }

        return regExXml.test(archivo) && regExSvg.test(archivo) && cumpleTamanio;
    }

    /*FIN CARGA DE IMAGENES*/
}
