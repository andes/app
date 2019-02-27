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

    onCheckboxChange(event, protocolo, registro) {
        let registrosPracticas = this.lote.registrosPracticas as Array<any>;
        if (event.value && registrosPracticas.indexOf(registro) < 0) {
            let registroPractica = {
                _id: registro._id,
                idPrestacion: protocolo._id,
                numeroProtocolo: protocolo.solicitud.registros[0].valor.solicitudPrestacion.numeroProtocolo.numeroCompleto,
                paciente: {
                    id: protocolo.paciente.id,
                    documento: protocolo.paciente.documento,
                    apellido: protocolo.paciente.apellido,
                    nombre: protocolo.paciente.nombre
                },
                registro: {
                    _id: registro._id,
                    nombre: registro.nombre
                }
            };

            registrosPracticas.push(registroPractica);
        } else if (!event.value && registrosPracticas.indexOf(registro) > -1) {
            registrosPracticas = registrosPracticas.filter( e =>  e._id === registro._id );
        }
    }
}
