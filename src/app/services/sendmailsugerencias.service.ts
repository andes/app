import { Server } from '@andes/shared';
import { Injectable } from '@angular/core';
import swal from 'sweetalert2';


@Injectable()
export class SugerenciasService {
    private sugerenciasUrl = '/modules/sugerencias/'; // URL to web api

    constructor(private server: Server) { }

    post(): void {
        swal({
            title: 'Escriba un comentario',
            input: 'textarea',
            inputPlaceholder: 'Explique brevemente la sugerencia o error...',
            showCancelButton: true,
            confirmButtonText: 'Enviar',
            showLoaderOnConfirm: true,
            preConfirm: (textarea) => {

                return new Promise((resolve, reject) => {
                    this.server.post(this.sugerenciasUrl, { texto: textarea, subject: 'Reportes de Errores o Sugerencias' }).subscribe(
                        result => {
                            if (result.mensaje === 'Ok') {
                                swal({
                                    type: 'success',
                                    title: 'Se envió con éxito!',
                                    html: 'Muchas gracias.'
                                }).then(() => resolve(null));
                            } else {
                                swal({
                                    type: 'error',
                                    title: 'Hubo un error y el mensaje no pudo ser enviado.',
                                    html: 'Error: ' + result.mensaje
                                });
                            }
                        },
                        err => {
                            if (err) {
                                swal({
                                    type: 'error',
                                    title: 'Hubo un error. El mensaje no pudo ser enviado.',
                                    html: 'Error: ' + err
                                });
                            }
                        });
                });
            },
        }).catch(swal.noop);
    }
}
