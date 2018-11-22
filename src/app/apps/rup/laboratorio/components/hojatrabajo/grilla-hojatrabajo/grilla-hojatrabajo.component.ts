import { Plex } from '@andes/plex';
import { PrestacionesService } from './../../../../../../modules/rup/services/prestaciones.service';
import { Input, Component, OnInit } from '@angular/core';
import { IHojaTrabajo } from './../../../interfaces/practica/hojaTrabajo/IHojaTrabajo';
import { IPracticasHojaTrabajo } from '../../../interfaces/practica/hojaTrabajo/IPracticaHojaTrabajo';


@Component({
    selector: 'grilla-hojatrabajo',
    templateUrl: './grilla-hojatrabajo.html',
    styleUrls: ['../../../assets/grilla-hojatrabajo.css'],
})
export class GrillaHojatrabajoComponent implements OnInit {
    @Input() hojaTrabajo: IHojaTrabajo;
    constructor(
        public servicioPrestaciones: PrestacionesService,
        public plex: Plex
    ) { }

    ngOnInit() {
        this.buscarProtocolos();
    }
    grilla = [];
    protocolos: any[];
    practicasHT: IPracticasHojaTrabajo[] = [];

    buscarProtocolos() {
        let params = {
            tipoPrestacionSolicititud: '15220000',
            estado: []
        };

        this.servicioPrestaciones.get(params).subscribe(protocolos => {
            console.log(protocolos);
            this.protocolos = protocolos;
            this.generarGrilla();
        }, err => {
            if (err) {
                this.plex.info('danger', err);
            }
        });
    }

    generarGrilla() {

        let cargarPracticas = (registros, idMatch) => {
            for (let elem of registros) {
                let registro: any = elem;
                if (registro.registros && registro.registros.length > 0) {
                    return cargarPracticas(registro.registros, idMatch);
                } else {
                    if (registro.concepto.conceptId === idMatch) {
                        return registro.valor.resultado;
                    }
                }
            }
        };

        this.protocolos.forEach((protocolo) => {
            let entrada = {
                numeroProtocolo: protocolo.solicitud.registros[0].valor.solicitudPrestacion.numeroProtocolo ? protocolo.solicitud.registros[0].valor.solicitudPrestacion.numeroProtocolo.numeroCompleto : 'XXXX',
                resultados: []
            };

            this.practicasHT.forEach((practicaHT: any) => {
                entrada.resultados.push(cargarPracticas(protocolo.ejecucion.registros, practicaHT.practica.concepto.conceptId));
            });
            this.grilla.push(entrada);
        });
    }
}
