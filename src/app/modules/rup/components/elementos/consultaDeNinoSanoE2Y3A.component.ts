import { Component, OnInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';

@Component({
    selector: 'rup-consulta-nino-sano-e2y3a',
    templateUrl: 'consultaDeNinoSanoE2Y3A.html'
})
export class ConsultaDeNinoSanoE2Y3AComponent extends RUPComponent implements OnInit {
    ninoSanoHUDS: any;
    ultimaConsulta: any;
    ultimaConsultaIndex: number;
    validacion = false;

    ngOnInit() {

        this.route.url.subscribe(urlParts => {
            if (urlParts[1].path === 'validacion') {
                this.validacion = true;
            }
        });

        this.registro.valido = true;
        let params: any = {
            idPaciente: this.paciente.id,
            ordenFecha: true,
            estado: 'validada'
        };

        this.ultimaConsulta = JSON.parse(JSON.stringify(this.registro));

        if (!this.validacion) {
            this.prestacionesService.get(params).subscribe(consultasPaciente => {
                this.ninoSanoHUDS = consultasPaciente.reverse();
                if (this.ninoSanoHUDS && this.ninoSanoHUDS.length > 0) {
                    this.ultimaConsultaIndex = this.ninoSanoHUDS.length - 1;

                    console.log(this.ultimaConsultaIndex);

                    const elementoRUP = this.elementosRUPService.buscarElemento(this.registro.concepto, false);
                    this.ultimaConsulta = this.ninoSanoHUDS[this.ultimaConsultaIndex].ejecucion.registros.find(x => {
                        return (this.existeConcepto(elementoRUP, x.concepto.conceptId) ? x : null);
                    });

                    if (this.ultimaConsulta && this.ultimaConsulta.registros.length) {

                        this.registro.registros = JSON.parse(JSON.stringify(this.ultimaConsulta.registros));
                        if (new Date(this.ultimaConsulta.updatedAt).getTime() > new Date(this.prestacion.updatedAt ? this.prestacion.updatedAt : this.prestacion.createdAt).getTime()) {
                            this.ultimaConsulta.registros = this.registro.registros;
                        }
                    } else {
                        this.ultimaConsulta = JSON.parse(JSON.stringify(this.registro));
                    }
                }
            });
        } else {
            this.registro = JSON.parse(JSON.stringify(this.registro));
        }
    }

    existeConcepto(elementoRUP, conceptId) {
        return elementoRUP.conceptos.find(c => {
            return c.conceptId === conceptId;
        });
    }

    buscarConceptoDeep(registros: any[], target: string, conceptId) {
        if (registros) {
            for (let i = 0; i < registros.length; i++) {
                if (registros[i].concepto.conceptId === conceptId) {
                    this[String(target)].push(registros[i]);
                } else {
                    this.buscarConceptoDeep(registros[i].registros, target, conceptId);
                }
            }
        }

    }
}
