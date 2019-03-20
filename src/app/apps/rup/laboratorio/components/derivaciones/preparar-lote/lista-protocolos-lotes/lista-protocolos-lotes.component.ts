import { IItemLoteDerivacion } from './../../../../interfaces/practica/IItemLoteDerivacion';
import { ILoteDerivacion } from './../../../../interfaces/practica/ILoteDerivacion';
import { Input, Component, OnInit } from '@angular/core';

@Component({
    selector: 'lista-protocolos-lotes',
    templateUrl: 'lista-protocolos-lotes.html'
})

export class ListaProtocolosLotesComponent implements OnInit {

    ngOnInit() {
    }
    valoresCheckboxes = [];

    protocolos;
    @Input('protocolos')
    set prtcls(value) {
        this.valoresCheckboxes = [];
        value.forEach( (p: any) => {
            p.ejecucion.registros.forEach( r => this.valoresCheckboxes[r._id] = false );
        });
        this.protocolos = value;
    }
    @Input() lote: ILoteDerivacion;
    constructor() { }

    /**
     *
     *
     * @param {*} event
     * @param {*} protocolo
     * @param {*} registro
     * @memberof ListaProtocolosLotesComponent
     */
    onCheckboxChange(event, protocolo, registro) {
        let numeroProtocolo = protocolo.solicitud.registros[0].valor.solicitudPrestacion.numeroProtocolo.numeroCompleto;
        let itemLoteDerivacion = this.lote.itemsLoteDerivacion.find( i => i.numeroProtocolo === numeroProtocolo);

        if (event.value) {
            if (!itemLoteDerivacion) {
                itemLoteDerivacion = this.generarItemLoteDerivacion(protocolo);
            }

            if (!itemLoteDerivacion.registros.find( r => r === registro)) {
                itemLoteDerivacion.registros.push(registro);
            }
        } else {
            itemLoteDerivacion.registros = itemLoteDerivacion.registros.filter( r =>  r.id !== registro.id );
            if (itemLoteDerivacion.registros.length === 0) {
                this.lote.itemsLoteDerivacion = this.lote.itemsLoteDerivacion.filter( i =>  i.numeroProtocolo !== numeroProtocolo );
            }
        }
    }

    /**
     *
     *
     * @private
     * @memberof ListaProtocolosLotesComponent
     */
    private generarItemLoteDerivacion(protocolo): IItemLoteDerivacion {
        let itemLoteDerivacion: IItemLoteDerivacion = {
            idPrestacion: protocolo._id,
            numeroProtocolo: protocolo.solicitud.registros[0].valor.solicitudPrestacion.numeroProtocolo.numeroCompleto,
            fechaSolicitud: protocolo.solicitud.fecha,
            paciente: {
                id: protocolo.paciente.id,
                documento: protocolo.paciente.documento,
                apellido: protocolo.paciente.apellido,
                nombre: protocolo.paciente.nombre,
                sexo: protocolo.paciente.sexo
            },
            registros: []
        };
        this.lote.itemsLoteDerivacion.push(itemLoteDerivacion);
        return itemLoteDerivacion;
    }
}
