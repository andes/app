import { Component, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { ConceptosTurneablesService } from 'src/app/services/conceptos-turneables.service';
import { OrganizacionService } from 'src/app/services/organizacion.service';
import { PacientePortalService } from '../../services/paciente-portal.service';
import { ListaEsperaService } from 'src/app/services/turnos/listaEspera.service';
import { take, switchMap } from 'rxjs/operators';

@Component({
    selector: 'pdp-notificar-necesidad',
    templateUrl: './notificar-necesidad.component.html',
    styles: [`
        form.elements-container {
            height: 72%;
        }
        div.button-container {
            height: 5%;
        }
        .button-container plex-button {
            display: grid;
        }
    `]
})
export class PDPNotificarNecesidadComponent {

    public tipoPrestacion;
    public organizacion;
    public textoLibre;
    public notificacionEnviada = false;
    public width: number;
    public iconsColor = '#00a8e0';

    get paciente() {
        return this.pacienteService.me();
    }

    constructor(
        private router: Router,
        private el: ElementRef,
        private conceptosTurneablesService: ConceptosTurneablesService,
        private organizacionService: OrganizacionService,
        private pacienteService: PacientePortalService,
        private listaEsperaService: ListaEsperaService
    ) { }

    loadTipoPrestacion(event) {
        if (event.query) {
            this.conceptosTurneablesService.search(event.query).subscribe(event.callback);
        } else {
            event.callback([]);
        }
    }

    loadOrganizacion(event) {
        if (event.query) {
            this.organizacionService.get({ nombre: event.query }).subscribe(event.callback);
        } else {
            event.callback([]);
        }
    }

    enviar(formValid) {
        if (formValid) {
            const organizacion = {
                id: this.organizacion.id,
                nombre: this.organizacion.nombre
            };
            this.paciente.pipe(
                take(1),
                switchMap(pac =>{
                    const paciente = {
                        id: pac.id,
                        nombre: pac.nombre,
                        apellido: pac.apellido,
                        documento: pac.documento
                    };
                    const listaEspera = {
                        fecha: new Date(),
                        estado: 'Demanda Rechazada',
                        origen: 'citas/portal/top',
                        tipoPrestacion: this.tipoPrestacion,
                        paciente,
                        organizacion
                    };
                    return this.listaEsperaService.post(listaEspera as any);
                })
            ).subscribe(() => {
                this.notificacionEnviada = true;
            });
        }
    }

    goTo() {
        this.router.navigate(['mis-turnos']);
    }

    isResponsive() {
        this.width = this.el.nativeElement.clientWidth;
        return this.width >= 980;
    }
}
