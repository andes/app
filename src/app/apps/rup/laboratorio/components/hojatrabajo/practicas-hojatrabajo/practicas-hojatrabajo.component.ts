import { IPractica } from '../../../../../../interfaces/laboratorio/IPractica';
import { PracticaService } from '../../../services/practica.service';
import { Component, OnInit, Input } from '@angular/core';
import { Plex } from '@andes/plex';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';


@Component({
    selector: 'practicas-hojatrabajo',
    templateUrl: './practicas-hojatrabajo.html',
    styleUrls: ['./practicas-hojatrabajo.css']
})
export class PracticasHojatrabajoComponent implements OnInit {

    codigo;
    nombrePractica;
    nombreImpresion: String;
    practica: IPractica = {} as IPractica;
    @Input() hojaTrabajo: any;


    constructor(public plex: Plex, private servicioPractica: PracticaService) { }

    ngOnInit() {
        this.seleccionarPractica({} as IPractica);
    }

    /**
     *
     *
     * @param {*} value
     * @memberof PracticasHojatrabajoComponent
     */
    getPracticaPorCodigo() {
        console.log();
        if (this.codigo) {
            this.servicioPractica.getMatchCodigo(this.codigo, false, true).subscribe((resultado: any) => {
                if (resultado) {
                    this.seleccionarPractica(resultado);
                }
            });
        }
    }

    /**
     *
     *
     * @param {any} $event
     * @memberof PracticasHojatrabajoComponent
     */
    getPracticasPorNombre($event) {
        if ($event.query) {
            this.servicioPractica.getMatch({
                cadenaInput: $event.query,
                buscarNoNomencladas: true
            }).subscribe((resultado: any) => {
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
    async agregarPractica($event) {
        if ($event.formValid) {
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
                    this.plex.info('danger', 'Práctica ya ingresada');
                }
            }
            this.nombreImpresion = '';
            this.codigo = '';
            this.practica = null;
        } else {
            this.plex.info('warning', 'Debe completar los datos requeridos');
        }
    }

    /**
    * Incluye una nueva práctica seleccionada tanto a la solicitud como a la ejecución
    *
    * @param {IPractica} practica
    * @memberof ProtocoloDetalleComponent
    */
    async seleccionarPractica(practica: IPractica) {
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

    /**
     * Drag and Drop ng7
     */
    drop(event: CdkDragDrop<string[]>) {
        console.log('movido', event.previousIndex, event.currentIndex, event.item);
        moveItemInArray(this.hojaTrabajo.practicas, event.previousIndex, event.currentIndex);
    }

    clickUp(index: number) {
        if (index !== 0) {
            moveItemInArray(this.hojaTrabajo.practicas, index, index - 1);
        }
    }

    clickDown(index: number) {
        if (index < this.hojaTrabajo.practicas.length) {
            console.log(moveItemInArray(this.hojaTrabajo.practicas, index, index + 1));
        }
    }
}
