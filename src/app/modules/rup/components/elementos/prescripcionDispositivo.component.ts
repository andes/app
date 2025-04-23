import { Unsubscribe } from '@andes/shared';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { RupElement } from '.';
import { RUPComponent } from '../core/rup.component';
@Component({
    selector: 'rup-prescripcion-dispositivo',
    templateUrl: 'prescripcionDispositivo.html',
    styleUrls: ['recetaMedica.scss']
})

@RupElement('PrescripcionDispositivoComponent')

export class PrescripcionDispositivoComponent extends RUPComponent implements OnInit {
    @ViewChild('formDispositivo') formDispositivo: NgForm;

    public dispositivo: any = {
        generico: null,
        // presentacion: null,
        cantidad: null,
        tratamientoProlongado: false,
        tiempoTratamiento: null
    };
    public collapse = false;
    public unidades = [];
    public genericos = [];
    public registros = [];
    public loading = false;

    public tiemposTratamiento = [
        { id: '3meses', nombre: '3 meses' },
        { id: '6meses', nombre: '6 meses' }
    ];


    ngOnInit() {
        if (!this.registro.valor) {
            this.registro.valor = {};
        }
        if (!this.registro.valor.dispositivos) {
            this.registro.valor.dispositivos = [];
        }
        this.registros = this.prestacion.ejecucion.registros.filter(reg => reg.id !== this.registro.id).map(reg => reg.concepto);
        // this.buscarDiagnosticosConTrastornos();

        // this.ejecucionService?.hasActualizacion().subscribe(async (estado) => {
        //     this.loadRegistros();
        // });
    }

    @Unsubscribe()
    loadDispositivo(event) {
        const input = event.query;
        if (input && input.length > 2) {
            const query: any = {
                expression: '<272181003',
                search: input
            };
            this.snomedService.get(query).subscribe(event.callback);
        } else {
            event.callback([]);
        }
    }

    loadRegistros() {
        this.registros = [
            ...this.prestacion.ejecucion.registros
                .filter(reg => reg.id !== this.registro.id && (reg.concepto.semanticTag === 'procedimiento'
                    || reg.concepto.semanticTag === 'hallazgo' || reg.concepto.semanticTag === 'trastorno'))
                .map(reg => reg.concepto),
            // ...this.recetasConFiltros
        ];
    }

    // loadPresentaciones() {
    //     // this.deshacerCantidadManual();
    //     this.loading = true;
    //     this.dispositivo.cantidad = null;
    //     this.dispositivo.presentacion = null;
    //     if (this.dispositivo.generico) {
    //         const queryPresentacion: any = {
    //             expression: `${this.dispositivo.generico.conceptId}.763032000`,
    //             search: ''
    //         };
    //         // const queryUnidades: any = {
    //         //     expression: `(^331101000221109: 774160008 =<${this.insumo.generico.conceptId}).774161007`,
    //         //     search: ''
    //         // };
    //         // forkJoin([
    //         //     this.snomedService.get(queryPresentacion),
    //         //     this.snomedService.get(queryUnidades)]
    //         // )
    //         this.snomedService.get(queryPresentacion).subscribe((presentaciones) => {
    //             // this.dispositivo.presentacion = presentaciones;
    //             // this.unidades = presentaciones.map(elto => {
    //             //     return { id: elto.term, valor: elto.term };
    //             // });
    //             // if (this.unidades.length) {
    //             //     this.unidades.unshift({ id: 'otro', valor: 'Otro' });
    //             // } else {
    //             //     this.ingresoCantidadManual = true;
    //             // }
    //             this.loading = false;
    //         });
    //     }
    //     // else {
    //     //     this.unidades = [];
    //     //     this.ingresoCantidadManual = false;
    //     // }
    // }

    agregarDispositivo() {
        this.registro.valor.dispositivos.push(this.dispositivo);
        this.unidades = [];
        this.dispositivo = {
            generico: null,
            // presentacion: null,
            cantidad: null,
            tratamientoProlongado: false,
            tiempoTratamiento: null
        };
        this.formDispositivo.reset();
        this.formDispositivo.form.markAsPristine();
        this.formDispositivo.form.markAsUntouched();
    }

    borrar(dispositivo) {
        this.plex.confirm('¿Está seguro que desea eliminar este dispositivo de la receta?').then((resultado) => {
            if (resultado) {
                const index = this.registro.valor.dispositivos.indexOf(dispositivo);
                this.registro.valor.dispositivos.splice(index, 1);
            }
        });
    }
}
