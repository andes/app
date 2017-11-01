import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';
import * as moment from 'moment';
@Component({
    selector: 'rup-adjuntar-documento',
    templateUrl: 'adjuntarDocumento.html'
})
export class AdjuntarDocumentoComponent extends RUPComponent implements OnInit {
    adjunto: any;
    loading = false;
    waiting = false;
    timeout = null;

    ngOnInit() {
        // Observa cuando cambia la propiedad 'peso' en otro elemento RUP

        console.log(this.registro);
    }

    fromMobile () {
        let paciente = this.paciente.id;
        let prestacion = this.prestacion.id;
        let registro = this.registro;
        this.loading = true;
        this.adjuntosService.post({paciente, prestacion, registro}).subscribe((data) => {
            this.adjunto = data;
            this.waiting = true;
            this.loading = false;

            this.timeout = setTimeout( (() => {
                this.backgroundSync();
            }).bind(this) , 5000);

        });
    }

    backgroundSync () {
        this.adjuntosService.get({ id: this.adjunto.id, estado: 'upload'  }).subscribe((data) => {
            if (data.length > 0) {
                console.log('Las fotos están acá');
                this.waiting = false;
                this.adjunto = data[0];
                this.registro.valor = this.adjunto.registro.valor;

                debugger;
                let file:string = this.registro.valor[0].file as string;
                file = file.replace('image/*', 'application/octet-stream');
                window.open(file);

            } else {
                this.timeout = setTimeout( (() => {
                    this.backgroundSync();
                }).bind(this) , 5000);
            }
        })
    }

}
