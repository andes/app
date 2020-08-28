import { Component, OnInit } from '@angular/core';
import { RUPComponent } from '../core/rup.component';
import { RupElement } from '.';

@Component({
    selector: 'rup-molecula-base',
    templateUrl: '../core/rup.html'
})
@RupElement('MoleculaBaseComponent')
export class MoleculaBaseComponent extends RUPComponent implements OnInit {
    flag = true;
    ultimaConsulta;
    validacion = false;

    ngOnInit() {
        if (this.params && this.params.hasSections) {
            this.registro.hasSections = true;
        }
        this.route.url.subscribe(urlParts => {
            if (urlParts.length > 1) {
                if (urlParts[1].path === 'validacion') {
                    this.validacion = true;
                }
            } else {
                this.validacion = false;
            }
        });
        if (!this.validacion && !this.soloValores) {

            this.prestacionesService.getRegistrosHuds(this.paciente.id, this.registro.concepto.conceptId).subscribe(consulta => {
                // ordeno por fecha desde lo mas actual hasta infinito

                consulta.sort(function (a, b) {
                    let dateA = new Date(a.fecha).getTime();
                    let dateB = new Date(b.fecha).getTime();

                    return dateA > dateB ? -1 : 1;
                });

                if (consulta.length > 0) {
                    const fechaPrestacion = this.prestacion.updatedAt || this.prestacion.createdAt;
                    const esFutura = consulta[0].registro.updatedAt.getTime() > fechaPrestacion.getTime();

                    if (!esFutura) {

                        this.ultimaConsulta = consulta[0].registro;
                        this.registro.registros = JSON.parse(JSON.stringify(this.ultimaConsulta.registros));



                    }
                }
            });
        }


    }


}
