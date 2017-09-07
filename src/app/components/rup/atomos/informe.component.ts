import { element } from 'protractor';
import { Atomo } from './../core/atomoComponent';
import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit } from '@angular/core';

@Component({
    selector: 'rup-informe',
    templateUrl: 'informe.html',
    styleUrls: ['informe.css'],
})

export class InformeComponent extends Atomo implements OnInit {
    lightbox = false;
    fotos: any[] = [];
    indice;


    ngOnInit() {
        this.data[this.elementoRUP.key] = (this.datosIngreso) ? this.datosIngreso : {};

        // si tengo valores cargados entonces devuelvo los resultados y mensajes
        if (this.datosIngreso) {
            this.fotos = this.data[this.elementoRUP.key].fotos;
            // this.devolverValores();
            // this.mensaje = this.getMensajes();
        }
    }

    imageUploaded($event) {
        // Ver que otra info guardar.
        let foto = {
            name: $event.file.name,
            src: $event.src,
        };
        this.fotos.push(foto);
        this.data[this.elementoRUP.key].fotos = this.fotos;
    }

    imageRemoved($event) {
        let index = this.data[this.elementoRUP.key].fotos.indexOf($event);
        this.data[this.elementoRUP.key].fotos.splice(index, 1);
    }

    activaLightbox(index) {
        this.lightbox = true;
        this.indice = index;
    }
    imagenPrevia(i) {
        let imagenPrevia = i - 1;
        if (imagenPrevia >= 0) {
            this.indice = imagenPrevia;
        }
    }
    imagenSiguiente(i) {
        let imagenSiguiente = i + 1;
        if (imagenSiguiente <= this.data[this.elementoRUP.key].fotos.length - 1) {
            this.indice = imagenSiguiente;
        }
    }
}
