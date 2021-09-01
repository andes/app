import { SnomedService } from '../../../apps/mitos';
import { Plex } from '@andes/plex';
import { Component, OnInit, Output, EventEmitter, Input, HostBinding } from '@angular/core';
import { ISectores } from '../../../interfaces/IOrganizacion';
import { SectoresService } from '../../../services/sectores.service';

@Component({
    selector: 'sectores-item',
    templateUrl: 'sectores-item.html',
    styleUrls: ['sectores-item.scss']
})
export class SectoresItemComponent implements OnInit {

    @HostBinding('class.plex-layout') layout = true; // Permite el uso de flex-box en el componente

    // definición de arreglos
    @Output() onAdd: EventEmitter<any> = new EventEmitter();
    @Output() onRemove: EventEmitter<any> = new EventEmitter();
    @Output() onEdit: EventEmitter<any> = new EventEmitter();
    @Output() onSelect: EventEmitter<any> = new EventEmitter();

    @Input() root: ISectores;
    @Input() actions: Boolean = true;
    @Input() selected: any;
    @Input() idOrganizacion: string;
    public hidden = false;

    constructor(
        public plex: Plex,
        public snomed: SnomedService,
        private sectoresService: SectoresService,
    ) { }

    /**
     * Devuelve el conjunto de clases a aplicar a la card. Según el tipo de elemento seleccionado.
     */
    getClass() {
        const c = {
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
        const i = Object.assign({}, item);
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

    onRemoveClick() {
        this.onRemove.emit(this.root);
    }

    /**
     * Emite el evento de modificar item
     * @param
     */

    onEditClick() {
        this.onEdit.emit(this.root);
    }

    /**
     * Oculta o no los hijos
     * @param
     */

    onCollapseClick() {
        this.hidden = !this.hidden;
    }


    onSectorChange() {

    }

    onUnidadChange() {
    }

    /**
     * Borra un hijo del listado. Según el evento handleado.
     * @param child
     */
    removeChild(child) {
        this.plex.confirm('¿Desea eliminarlo?', 'Eliminar Sector').then((confirmar) => {
            if (confirmar) {
                this.sectoresService.deleteSector(this.idOrganizacion, child._id).subscribe(result => {
                    if (result === child._id) {
                        const index = this.root.hijos.findIndex((item) => item === child);
                        this.root.hijos.splice(index, 1);
                        this.plex.info('success', 'El sector fue eliminado', 'Sector eliminado!');
                    } else {
                        this.plex.info('danger', 'No se puede eliminar sector ya que hay camas asignadas.', 'No se puede eliminar');
                    }
                });
            }
        });
    }

}
