import { IPractica } from '../../../../../../interfaces/laboratorio/IPractica';
import { PracticaService } from '../../../services/practica.service';
import { Component, OnInit, Input } from '@angular/core';
import { Plex } from '@andes/plex';

@Component({
    selector: 'practicas-hojatrabajo',
    templateUrl: './practicas-hojatrabajo.html'
})
export class PracticasHojatrabajoComponent implements OnInit {

    codigo;
    nombrePractica;
    nombreImpresion: String;
    practica: IPractica;
    @Input() hojaTrabajo: any;


    constructor(public plex: Plex, private servicioPractica: PracticaService) { }

    ngOnInit() {
    }

    /**
     *
     *
     * @param {*} value
     * @memberof PracticasHojatrabajoComponent 
     */
    getPracticaPorCodigo() {
        console.log()
        if (this.codigo) {
            this.servicioPractica.getMatchCodigo(this.codigo).subscribe((resultado: any) => {
                if (resultado) {
                    console.log('getPracticaPorCodigo')
                    this.seleccionarPractica(resultado);
                }
            });
        }
    }

    /**
     *
     *
     * @param {any} $event
     * @memberof TablaDatalleProtocolo
     */
    getPracticasPorNombre($event) {
        if ($event.query) {
            this.servicioPractica.getMatch({
                cadenaInput: $event.query
            }).subscribe((resultado: any) => {
                // this.seleccionarPractica(resultado);
                $event.callback(resultado);
            });
        } else {
            $event.callback([]);
        }
    }

    /**
     *
     *
     * @param {IPractica} practica
     * @returns
     * @memberof PracticasHojatrabajoComponent
     */
    findPracticaIndex(practica: IPractica) {
        return this.hojaTrabajo.practicas.findIndex(x => x.practica.concepto.conceptId === practica.concepto.conceptId);
    }

    /**
    * Incluye una nueva práctica seleccionada tanto a la solicitud como a la ejecución
    *
    * @param {IPractica} practica
    * @memberof ProtocoloDetalleComponent
    */
    async agregarPractica() {
        if (this.practica) {
            if (this.findPracticaIndex(this.practica) < 0) {
                this.hojaTrabajo.practicas.push({
                    nombre: this.nombreImpresion,
                    practica: {
                        id: this.practica._id,
                        nombre: this.practica.nombre,
                        codigo: this.practica.codigo,
                        concepto: this.practica.concepto
                    }
                });
            } else {
                this.plex.alert('', 'Práctica ya ingresada');
            }
        }
        this.nombreImpresion = '';
        this.codigo = '';
        this.practica = null;
    }

    /**
    * Incluye una nueva práctica seleccionada tanto a la solicitud como a la ejecución
    *
    * @param {IPractica} practica
    * @memberof ProtocoloDetalleComponent
    */
    async seleccionarPractica(practica: IPractica) {
        console.log('seleccionarPractica', practica)
        this.practica = practica;
        this.codigo = practica.codigo;
        this.nombrePractica = practica.nombre;
    }

    /**
     *
     *
     * @param {IPractica} practica
     * @memberof PracticasHojatrabajoComponent
     */
    eliminarPractica(practica: IPractica) {
        this.hojaTrabajo.practicas.splice(this.findPracticaIndex(practica), 1);
    }
}