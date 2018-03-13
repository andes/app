import { Component } from '@angular/core';
import { Plex } from '@andes/plex';
import { Observable } from 'rxjs/Rx';
import swal from 'sweetalert2';
import { SugerenciasService } from './../../services/sendmailsugerencias.service';

@Component({
    selector: 'sugerencias',
    templateUrl: 'sugerencias.html',
})

export class SugerenciasComponent {

    constructor(private sugerenciasService: SugerenciasService) { }

    sugerencias() {
        swal({
            title: 'Enviar sugerencias via email',
            input: 'textarea',
            inputPlaceholder: 'Explique brevemente la sugerencia o error...',
            showCancelButton: true,
            confirmButtonText: 'Enviar',
            showLoaderOnConfirm: true,
            preConfirm: (textarea) => {
                return new Promise((resolve, reject) => {
                    this.sugerenciasService.post({ texto: textarea, subject: "Reportes de Errores o Sugerencias" }).subscribe(
                        result => {
                            if (result.mensaje === 'Ok') {
                                swal({
                                    type: 'success',
                                    title: 'Se envió con éxito!',
                                    html: 'Muchas gracias.'
                                }).then(() => resolve())
                            } else {
                                swal({
                                    type: 'error',
                                    title: 'Hubo un error y no se envió el mensaje.',
                                    html: 'Error: ' + result.mensaje
                                })
                            };
                        },
                        err => {
                            if (err) {
                                swal({
                                    type: 'error',
                                    title: 'Hubo un error. No se envió el mensaje.',
                                    html: 'Error: ' + err
                                })
                            }
                        });
                });
            },
        }).catch(swal.noop);
    }
}