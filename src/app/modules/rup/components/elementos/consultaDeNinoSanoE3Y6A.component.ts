import { Component, OnInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';

@Component({
    selector: 'rup-consulta-nino-sano-e3y6a',
    templateUrl: 'consultaDeNinoSanoE3Y6A.html'
})
export class ConsultaDeNinoSanoE3Y6AComponent extends RUPComponent implements OnInit {
    ninoSanoHUDS: any;
    ultimaConsulta: any;
    ultimaConsultaIndex: number;
    validacion = false;
    registrosVacios = false;

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

        // Nos aseguramos que NO estamos en la pantalla de Validación/Resumen
        if (!this.validacion && !this.soloValores) {

            // Se busca en la HUDS si hay prestaciones con valores ya cargados
            this.prestacionesService.get(params).subscribe(consultasPaciente => {

                // Se da vuelta el array, para que quede el último registro en la última posición del array (length - 1)
                this.ninoSanoHUDS = consultasPaciente.reverse();

                // Hay registros anteriores en la HUDS?
                if (this.ninoSanoHUDS && this.ninoSanoHUDS.length > 0) {

                    // Index de las consultas, para poder navegarse (sin uno ahora)
                    this.ultimaConsultaIndex = this.ninoSanoHUDS.length - 1;

                    // Se busca el elemento RUP para armar el árbol de conceptos, etc
                    const elementoRUP = this.elementosRUPService.buscarElemento(this.registro.concepto, false);

                    // Se arma el árbol de conceptos y valores
                    this.ultimaConsulta = this.ninoSanoHUDS[this.ultimaConsultaIndex].ejecucion.registros.find(x =>
                        x.concepto.conceptId === this.registro.concepto.conceptId);

                    // La consulta encontada en la HUDS tiene registros?
                    if (this.ultimaConsulta && this.ultimaConsulta.registros.length) {
                        this.registro.registros = JSON.parse(JSON.stringify(this.ultimaConsulta.registros));
                        if (new Date(this.ultimaConsulta.updatedAt).getTime() > new Date(this.prestacion.updatedAt ? this.prestacion.updatedAt : this.prestacion.createdAt).getTime()) {
                            this.ultimaConsulta.registros = this.registro.registros;
                        } else {
                            this.registro.registros = JSON.parse(JSON.stringify(this.ultimaConsulta.registros));
                        }
                    } else {
                        this.ultimaConsulta = JSON.parse(JSON.stringify(this.registro));
                    }
                } else {
                    this.ultimaConsulta = JSON.parse(JSON.stringify(this.registro));
                    if (!this.hayAlgunValor(this.ultimaConsulta.registros)) {
                        // No se encontraron registros anteriores en la HUDS
                        this.registrosVacios = true;
                    }
                }
            });
        } else {
            // En pantalla Validación, simplemente tomamos los registros guardados y los mostramos
            this.ultimaConsulta = JSON.parse(JSON.stringify(this.registro));
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

    hayAlgunValor(registros: any[]) {
        if (registros) {
            for (let i = 0; i < registros.length; i++) {
                if (registros[i].valor) {
                    return true;
                } else {
                    this.hayAlgunValor(registros[i].registros);
                }
            }
        }
    }
}
