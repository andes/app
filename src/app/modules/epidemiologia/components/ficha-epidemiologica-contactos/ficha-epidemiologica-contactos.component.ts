import { Plex } from '@andes/plex';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { tipoContactos as _tipoContactos } from '../../constantes';

@Component({
    selector: 'app-ficha-epidemiologica-contactos',
    templateUrl: './ficha-epidemiologica-contactos.component.html'
})
export class FichaEpidemiologicaContactosComponent {
    @Input() contactos: any;
    @Input() editMode: any;
    @Output() editEmited = new EventEmitter<any>();
    contactoEdicion;
    contactoUpdate;
    tipoContactos = _tipoContactos;

    constructor(
        private plex: Plex,
    ) { }

    editContacto() {
        this.contactoEdicion = this.contactoEdicion ? this.contactoEdicion : { tipoContacto: null };
        this.editEmited.emit(true);
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
        this.editEmited.emit(false);
    }

}
