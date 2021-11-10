import { Plex } from '@andes/plex';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { tipoContactos as _tipoContactos } from '../../constantes';

@Component({
    selector: 'app-ficha-epidemiologica-contactos',
    templateUrl: './ficha-epidemiologica-contactos.component.html'
})
export class FichaEpidemiologicaContactosComponent implements OnInit {
    @Input() contactos: any;
    @Input() editMode: any;
    @Output() onEditEmit = new EventEmitter<any>();
    contactoEdicion;
    contactoUpdate;
    tipoContactos = _tipoContactos;

    constructor(
        private plex: Plex,
    ) { }

    ngOnInit() { }

    editContacto() {
        this.contactoEdicion = this.contactoEdicion ? this.contactoEdicion : { tipoContacto: null };
        this.onEditEmit.emit(true);
    }

    aceptar() {
        if (this.contactoUpdate) {
            Object.assign(this.contactoUpdate, this.contactoEdicion);
        } else {
            this.contactos.push(this.contactoEdicion);
        }
        this.cerrar();
    }

    edit(contacto) {
        this.contactoUpdate = contacto;
        this.contactoEdicion = Object.assign({}, contacto);
        this.editContacto();
    }

    delete(i) {
        this.contactos.splice(i, 1);
    }

    cerrar() {
        this.contactoEdicion = null;
        this.contactoUpdate = null;
        this.onEditEmit.emit(false);
    }

}
