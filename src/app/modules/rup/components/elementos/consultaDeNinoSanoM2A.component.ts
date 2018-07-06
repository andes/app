import { Component, OnInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';
import { IPrestacion } from '../../interfaces/prestacion.interface';

@Component({
    selector: 'rup-consulta-nino-sano-m2a',
    templateUrl: 'consultaNinoSanoM2A.html'
})
export class ConsultaDeNinoSanoM2AComponent extends RUPComponent implements OnInit {
    ninoSanoHUDS: any;
    ultimaConsulta: any;
    ultimaConsultaIndex: number;
    valoresUltimaConsulta: any = [];
    ultimaConsultaLactancia: any = [];
    ultimaConsultaDesPsicomotor: any = [];
    valoresUltimaConsultaLactancia: any = [];
    valoresUltimaConsultaDesPsicomotor: any = [];
    valoresUltimaConsultaClon: any;
    validacion = false;
    lactanciaRegistrada = false;
    desarrolloPiscoRegistrado: any;
    registroClon: any;

    ngOnInit() {

        console.log('init', this.registro.registros);

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

        if (!this.validacion) {
            this.prestacionesService.get(params).subscribe(consultasPaciente => {
                this.ninoSanoHUDS = consultasPaciente.reverse();
                if (this.ninoSanoHUDS && this.ninoSanoHUDS.length > 0) {
                    this.ultimaConsultaIndex = this.ninoSanoHUDS.length - 1;

                    const elementoRUP = this.elementosRUPService.buscarElemento(this.registro.concepto, false);
                    this.ultimaConsulta = this.ninoSanoHUDS[this.ultimaConsultaIndex].ejecucion.registros.find(x => {
                        return (this.existeConcepto(elementoRUP, x.concepto.conceptId) ? x : null);
                    });

                    if (this.ultimaConsulta && this.ultimaConsulta.registros.length) {

                        this.registro.registros = JSON.parse(JSON.stringify(this.ultimaConsulta.registros));
                        if (new Date(this.ultimaConsulta.updatedAt).getTime() > new Date(this.prestacion.updatedAt ? this.prestacion.updatedAt : this.prestacion.createdAt).getTime()) {
                            this.ultimaConsulta.registros = this.registro.registros;
                        } else {
                            this.ultimaConsulta.registros = this.registro.registros;
                        }
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
            // this[String(target)] = [];
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
