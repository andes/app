import { Component, Input } from '@angular/core';
import { IPrestacion } from '../../../interfaces/prestacion.interface';
import { IPrestacionRegistro } from '../../../interfaces/prestacion.registro.interface';
import { PrestacionesService } from '../../../services/prestaciones.service';
import { Auth } from '@andes/auth';
import { DocumentosService } from '../../../../../services/documentos.service';
import { ActivatedRoute } from '@angular/router';
import { Plex } from '@andes/plex';
import { OrganizacionService } from '../../../../../services/organizacion.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { getSemanticTag } from '../../../pipes/semantic-class.pipes';
import { getRegistros } from '../../../operators/populate-relaciones';

/**
 * Cualquier cambio en esta componente implica testear en:
 *   1. prestacion no validada (previsualizar PDF).
 *   2. prestacion validada enviar email y decargar pdf completo.
 *   3. registro procedimiento y solicitud muestras los botones de descarga y envio.
 *   4. verificar epicrisis.
 *   5. verificar en secciones.
 *   6. Si la organzacion no tiene emails configurado no debe mostrar el icono de enviar por emails
 */

@Component({
    selector: 'rup-acciones-envio-informe',
    templateUrl: 'acciones-envio-informe.component.html'
})
export class RUPAccionesEnvioInformeComponent {

    @Input() prestacion: IPrestacion;

    @Input() registro: IPrestacionRegistro = null;

    public showModalEmails = false;

    public requestInProgress = false;

    public hasEmails$: Observable<boolean>;

    constructor(
        public servicioPrestacion: PrestacionesService,
        private auth: Auth,
        private servicioDocumentos: DocumentosService,
        private activeRoute: ActivatedRoute,
        private plex: Plex,
        private organizacionService: OrganizacionService
    ) {
    }

    get noNominalizada() {
        return this.prestacion.solicitud.tipoPrestacion.noNominalizada;
    }

    get validada() {
        return this.prestacion && this.prestacion.estados[this.prestacion.estados.length - 1].tipo === 'validada';
    }

    get entorno() {
        const url = this.activeRoute.snapshot.url;
        if (url.length > 1) {
            if (url[0].path === 'validacion') {
                return 'validacion';
            } else if (url[0].path === 'ejecucion') {
                return 'ejecucion';
            }
        }
        return 'otro';
    }

    get btnSize() {
        return this.registro ? 'sm' : null;
    }

    get showPrevisualizacion() {
        if (this.entorno !== 'validacion') {
            return false;
        }
        return !this.validada && !this.noNominalizada && !this.registro;
    }

    get showEnviosBtn() {
        if (this.entorno !== 'validacion') {
            return false;
        }
        if (this.registro) {
            const concepto = getSemanticTag(this.registro.concepto, false);
            const esProcedimientoSolicitud = concepto === 'procedimiento' || concepto === 'hallazgo' || concepto === 'trastorno' || this.registro.esSolicitud;
            return this.validada && esProcedimientoSolicitud;
        } else {
            return this.validada && !this.noNominalizada;
        }
    }

    openModalEmails() {
        this.showModalEmails = true;
    }

    getAdjuntos() {
        const registros = getRegistros(this.prestacion);
        const regAdjuntos = registros.find(reg => reg.concepto.conceptId === '1921000013108');
        if (regAdjuntos) {
            return regAdjuntos.valor.documentos.map(i => {
                return {
                    id: i.id,
                    ext: i.ext
                };
            });
        }
        return null;
    }

    enviarPDF(data) {
        const { email, adjuntos } = data;
        const documentos = this.getAdjuntos();

        this.showModalEmails = false;
        if (email) {
            this.requestInProgress = true;
            const datos: any = {
                idPrestacion: this.prestacion.id,
                email: email,
                idOrganizacion: this.auth.organizacion.id,
                adjuntos: adjuntos ? documentos : undefined
            };
            if (this.registro) {
                datos.idRegistro = this.registro.id;
            }
            this.servicioDocumentos.enviarInformeRUP(datos).subscribe(
                result => {
                    this.requestInProgress = false;
                    this.showModalEmails = false;

                    if (result.status === 'OK') {
                        this.plex.info('success', 'El pdf ha sido enviado al servicio seleccionado', 'Envío exitoso!');
                    } else {
                        this.plex.info('danger', result.mensaje, 'Error');
                    }
                },
                () => this.requestInProgress = false
            );
        }
    }



    async descargarInforme() {
        this.requestInProgress = true;
        let term;

        const informe: any = {
            idPrestacion: this.prestacion.id
        };

        if (this.registro) {
            term = this.registro.concepto.term;
            informe.idRegistro = this.registro.id;
        } else {
            term = this.prestacion.solicitud.tipoPrestacion.term;
        }


        this.servicioDocumentos.descargarInformeRUP(informe, term).subscribe(
            () => {
                this.requestInProgress = false;
            },
            () => this.requestInProgress = false
        );
    }

    getHasEmail() {
        if (!this.hasEmails$) {
            this.hasEmails$ = this.organizacionService.configuracion(this.auth.organizacion.id).pipe(
                map(configuracion => configuracion && configuracion.emails && configuracion.emails.length > 0)
            );
        }
        return this.hasEmails$;
    }
}
