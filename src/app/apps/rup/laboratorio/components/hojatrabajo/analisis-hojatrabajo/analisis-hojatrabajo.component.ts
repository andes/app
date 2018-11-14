import { IPractica } from './../../../../../../interfaces/laboratorio/IPractica';
// import { IHojaTrabajo } from './../../../interfaces/IHojaTrabajo';
import { PracticaService } from './../../../services/practica.service';
import { Component, OnInit, Input } from '@angular/core';
import { Plex } from '@andes/plex';

@Component({
    selector: 'analisis-hojatrabajo',
    templateUrl: './analisis-hojatrabajo.html'
})
export class AnalisisHojatrabajoComponent implements OnInit {

    codigo;
    nombreImpresion: String;
    @Input() hojaTrabajo: any;

    constructor(public plex: Plex, private servicioPractica: PracticaService) { }

    ngOnInit() {
    }

    getPracticaPorCodigo(value) {
        if (this.codigo) {
            this.servicioPractica.getMatchCodigo(this.codigo).subscribe((resultado: any) => {
                if (resultado) {
                    this.seleccionarPractica(resultado);
                }
            });
        }
    }

    findPracticaIndex(practica: IPractica) {
        return this.hojaTrabajo.practicas.findIndex(x => x.practica.concepto.conceptId === practica.concepto.conceptId);
    }

    /**
    * Incluye una nueva práctica seleccionada tanto a la solicitud como a la ejecución
    *
    * @param {IPractica} practica
    * @memberof ProtocoloDetalleComponent
    */
    async seleccionarPractica(practica: IPractica) {
        if (practica) {
            if (this.findPracticaIndex(practica) >= 0) {
                this.hojaTrabajo.practicas.push({
                    nombre: this.nombreImpresion,
                    practica: practica
                });
            } else {
                this.plex.alert('', 'Práctica ya ingresada');
            }
        }
        this.nombreImpresion = '';
        this.codigo = '';
    }

    loadPracticasPorNombre($event) {
        if ($event.query) {
            this.servicioPractica.getMatch({
                cadenaInput: $event.query,
                buscarSimples: true
            }).subscribe((resultado: any) => {
                console.log(resultado);
                $event.callback(resultado);
            });
        } else {
            $event.callback([]);
        }
    }

    eliminarPractica(practica: IPractica) {
        this.hojaTrabajo.practicas.splice(this.findPracticaIndex(practica), 1);
    }

    agregarPractica() {

    }
}