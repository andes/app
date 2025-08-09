import { Component, OnInit } from '@angular/core';
import moment from 'moment';
import { RupElement } from '.';
import { RUPComponent } from './../core/rup.component';

@Component({
    selector: 'rup-saturacion-oxigeno',
    templateUrl: 'saturacionOxigeno.html'
})
@RupElement('SaturacionOxigenoComponent')
export class SaturacionOxigenoComponent extends RUPComponent implements OnInit {
    ngOnInit() {
        // Observa cuando cambia la propiedad 'SaturacionOxigeno' en otro elemento RUP
        if (!this.soloValores) {
            this.conceptObserverService.observe(this.registro).subscribe((data) => {
                // No soy yo mismo
                if (this.registro !== data && this.registro.valor !== data.valor) {
                    this.registro.valor = data.valor;
                    this.emitChange(false);
                }
            });
        }
        if (this.registro.valor) {
            this.mensaje = this.getMensajes();
        }
    }
    getMensajes() {
        const saturacionOxigeno = this.registro.valor;

        // Calculo Edad en Meses
        const edadMeses: any = null;
        const fechaNac: any = moment(this.paciente.fechaNacimiento, 'YYYY-MM-DD HH:mm:ss');
        const fechaActual: Date = new Date();
        const fechaAct: any = moment(fechaActual, 'YYYY-MM-DD HH:mm:ss');
        const difDias: any = fechaAct.diff(fechaNac, 'd');
        const edadEnMeses = Math.trunc(difDias / 30.4375);

        const mensaje: any = {
            texto: '',
            class: 'danger'
        };

        if (saturacionOxigeno) {
            // agregar validaciones aca en base al paciente y el tipo de prestacion
            if (saturacionOxigeno <= 89) {
                mensaje.texto = 'Hipoxemia Severa';
            }
            if (saturacionOxigeno >= 90 && saturacionOxigeno <= 94) {
                mensaje.texto = 'Hipoxemia';
            }
        }
        return mensaje;
    }
}
