import { Auth } from '@andes/auth';
import { LoteDerivacionService } from './../../../../services/loteDerivacion.service';
import { ILoteDerivacion } from '../../../../interfaces/practica/ILoteDerivacion';
import { Input, Component, OnInit } from '@angular/core';

@Component({
    selector: 'lista-lotes',
    templateUrl: 'lista-lotes.html'
})

export class ListaLotesComponent implements OnInit {

    ngOnInit() {
    }
    valoresCheckboxes = [];
    estadoEnviado = {
        tipo: 'enviado',
        fecha: new Date(),
        usuario: this.auth.usuario
    };

    lotes;
    @Input('lotes')
    set lts(value) {
        // this.valoresCheckboxes = [];
        // value.forEach( (p: any) => {
        //     p.ejecucion.registros.forEach( r => this.valoresCheckboxes[r._id] = false );
        // });
        this.lotes = value;
    }
    @Input() lote: ILoteDerivacion;
    constructor(
        private loteDerivacionService: LoteDerivacionService,
        private auth: Auth ) { }

    /**
     *
     *
     * @param {*} lote
     * @memberof ListaLotesComponent
     */
    enviarLote(lote) {
        this.loteDerivacionService.patch(lote._id, this.getParamsEnvio(lote)).subscribe ( res => {
            console.log('res');
            lote.estados.push(this.estadoEnviado);
        });

    }

    /**
     *
     *
     * @private
     * @param {*} lote
     * @returns
     * @memberof ListaLotesComponent
     */
    private getParamsEnvio(lote) {
        return {
            organizacionId: this.auth.organizacion.id,
            lote: lote,
            estado: this.estadoEnviado
        };
    }
}
