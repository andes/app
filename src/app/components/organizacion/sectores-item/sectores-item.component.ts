import { SnomedService } from '../../../services/term/snomed.service';
import { Plex } from '@andes/plex';
import { Component, OnInit, Output, EventEmitter, Input, HostBinding } from '@angular/core';
import { ISectores } from '../../../interfaces/IOrganizacion';
import { CamasService } from '../../../modules/rup/services/camas.service';

@Component({
    selector: 'sectores-item',
    templateUrl: 'sectores-item.html',
    styleUrls: ['sectores-item.scss']
})
export class SectoresItemComponent implements OnInit {

    @HostBinding('class.plex-layout') layout = true;  // Permite el uso de flex-box en el componente

    // definición de arreglos
    @Output() onAdd: EventEmitter<any> = new EventEmitter();
    @Output() onRemove: EventEmitter<any> = new EventEmitter();
    @Output() onEdit: EventEmitter<any> = new EventEmitter();
    @Output() onSelect: EventEmitter<any> = new EventEmitter();

    @Input() root: ISectores;
    @Input() actions: Boolean = true;
    @Input() selected: any;
    public hidden = false;

    public idOrganizacion: String;
    constructor(
        public plex: Plex,
        public snomed: SnomedService,
        public camaService: CamasService
    ) { }

    /**
     * Devuelve el conjunto de clases a aplicar a la card. Según el tipo de elemento seleccionado.
     */
    getClass() {
        let c =  {
            selected: this.selected === this.root,
        };
        c[this.root.tipoSector.term.replace(' ', '-').replace('ó', 'o').toLocaleLowerCase()] = true;
        return c;
    }

    ngOnInit() {

    }

    /**
     * Clona un item sin sus hijos.
     * @param item
     */
    cloneObject(item) {
        let i = Object.assign({}, item);
        delete i['hijos'];
        return i;
    }

    /**
     * Emite la selección de un item
     * @param
     */

    onSelectItem($event) {
        this.onSelect.emit([this.cloneObject(this.root), ...$event]);
    }

    /**
     * Reacciona con la selección de un item
     * @param
     */

    selectItem($event) {
        $event.stopPropagation();
        if (!this.actions && this.root.hijos.length === 0) {
            this.onSelect.emit([this.cloneObject(this.root)]);
        }
    }

    /**
     * Devuelve si tiene items
     * @param
     */

    hasItems() {
        return this.root.hijos.length > 0;
    }

    /**
     * Emite el evento de agregar items
     * @param
     */

    onAddClick() {
        this.onAdd.emit(this.root);
    }

    /**
     * Emite el evento de borrar item
     * @param
     */

    onRemoveClick () {
        this.onRemove.emit(this.root);
    }

    /**
     * Emite el evento de modificar item
     * @param
     */

    onEditClick () {
        this.onEdit.emit(this.root);
    }

    /**
     * Oculta o no los hijos
     * @param
     */

    onCollapseClick () {
        this.hidden = !this.hidden;
    }


    onSectorChange() {

    }

    onUnidadChange () {
    }

    /**
     * Borra un hijo del listado. Según el evento handleado.
     * @param child
     */
    removeChild(child) {
        this.camaService.camaXsector(child.id).subscribe(camas => {
            if (camas.length <= 0) {
                this.plex.confirm('¿Desea eliminarlo?', 'Eliminar Sector').then((confirmar) => {
                    let index = this.root.hijos.findIndex((item) => item === child);
                    if (index >= 0) {
                        this.root.hijos.splice(index, 1);
                    }
                });
            } else {
                this.plex.alert('El sector contiene camas', 'No se puede borrar');
            }
        });
    }

}
