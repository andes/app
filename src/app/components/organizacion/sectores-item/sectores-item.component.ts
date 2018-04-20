import { SnomedService } from '../../../services/term/snomed.service';
import { Plex } from '@andes/plex';
import { Server } from '@andes/shared';
import { Observable } from 'rxjs/Rx';
import { Component, OnInit, Output, EventEmitter, Input, HostBinding } from '@angular/core';

import { Router, ActivatedRoute } from '@angular/router';
import { ISectores } from '../../../interfaces/IOrganizacion';

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
        public plex: Plex, private server: Server,
        public snomed: SnomedService,
        private router: Router,
        private route: ActivatedRoute,
    ) { }


    ngOnInit() {

    }

    cloneObject(item) {
        let i = Object.assign({}, item);
        delete i['hijos'];
        return i;
    }

    onSelectItem($event) {
        this.onSelect.emit([this.cloneObject(this.root), ...$event]);
    }

    selectItem($event) {
        $event.stopPropagation();
        if (!this.actions) {
            this.onSelect.emit([this.cloneObject(this.root)]);
        }
    }
    hasItems() {
        return this.root.hijos.length > 0;
    }

    onAddClick() {
        this.onAdd.emit(this.root);
    }

    onRemoveClick () {
        this.onRemove.emit(this.root);
    }

    onCollapseClick () {
        this.hidden = !this.hidden;
    }

    onEditClick () {
        this.onEdit.emit(this.root);
    }

    onSectorChange() {

    }

    onUnidadChange () {
    }

    removeChild(child) {
        let index = this.root.hijos.findIndex((item) => item === child);
        if (index >= 0) {
            this.root.hijos.splice(index, 1);
        }
    }

}
