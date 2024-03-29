import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { RupElement } from '..';
import { IPrestacionRegistro } from '../../../interfaces/prestacion.registro.interface';
import { RUPComponent } from '../../core/rup.component';

/**
 * DEPRECADO
 * Este elemento se remplaza por SeccionComponent. No usar mas en futuros conceptos.
 */

@Component({
    selector: 'rup-ElementoDeRegistroComponent',
    templateUrl: 'elementoDeRegistro.html',
    styleUrls: ['elementoDeRegistro.scss']
})
@RupElement('ElementoDeRegistroComponent')
export class ElementoDeRegistroComponent extends RUPComponent implements OnInit, OnDestroy, AfterViewInit {


    // Variable para mostrar el div dropable en el momento que se hace el drag
    public isDraggingConcepto: Boolean = true;

    // utilizamos confirmarDesvincular para mostrar el boton de confirmacion de desvinculado
    public confirmarDesvincular: any[] = [];

    public confirmarEliminar: Boolean = false;
    public indexEliminar: any;

    // el concepto que seleccionamos para eliminar lo guradamos aca.
    public conceptoAEliminar: any;

    public scopeEliminar: String;

    public conceptosPermitidos: any[] = [];
    public conceptosSeleccionar: any[] = [];
    public conceptoElegido: any = null;

    public itemsRegistros = {};
    // boleean para verificar si estan todos los conceptos colapsados
    public collapse = true;
    public ocultarPanel = false;
    suscriptionBuscador: any;
    seleccionado: any;
    conceptoSeleccionado: any;
    afterInit = false;
    onDestroy$ = new Subject();

    ngOnDestroy() {
        this.onDestroy$.next(null);
    }

    ngOnInit() {
        this.registro.isSection = true;
        if (this.registro && this.registro.registros) {
            this.registro.registros.forEach((registro: any) => {
                this.itemsRegistros[registro.id] = { collapse: true, items: null };
            });
        }
        this.params.required = this.params.required ? this.params.required : false;
        this.params.conceptsRequired = this.params.conceptsRequired || false;

        // buscamos si existe por parametro alguna restriccion en los conceptos.
        if (this.params.refsetId) {
            this.snomedService.getQuery({ expression: '^' + this.params.refsetId }).subscribe(resultado => {
                this.conceptosPermitidos = resultado;
            });
        }

        if (this.params.query) {
            this.snomedService.getQuery({ expression: this.params.query }).subscribe(resultado => {
                this.conceptosSeleccionar = resultado.map(r => {
                    r['checked'] = false; return r;
                });
                if (this.params.extraQuery) {
                    // agregamos al resultado las opciones extra, si existieran
                    this.conceptosSeleccionar = this.conceptosSeleccionar.concat(this.params.extraQuery);
                    // determinamos visibilidad del panel 'agregar prestaciones asociadas al tratamiento'
                    this.ocultarPanel = !this.params.extraQuery.some(opt => opt.checked);
                }
            });
        }

        if (this.params.noIndex) {
            this.registro.noIndex = this.params.noIndex;
        }
        if (this.ejecucionService) {
            this.ejecucionService.conceptosStream().pipe(
                filter(r => r.seccion && r.seccion.conceptId === this.registro.concepto.conceptId),
                takeUntil(this.onDestroy$)

            ).subscribe((registro) => {
                this.cargarNuevoRegistro(registro.concepto, registro.esSolicitud, registro.valor, null);
            });
        }
    }

    onValidate() {
        if (this.params.conceptsRequired) {
            return this.registro.registros.length > 0;
        }
        return true;
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.afterInit = true;
        }, 300);
    }


    seleccionarOpcion(data) {
        if (data.checked) {
            // quitamos los conceptos de la selección
            this.conceptosSeleccionar.forEach(unConcepto => {
                unConcepto.checked = false;
            });
            this.registro.registros = [];
            // cargamos el nuevo concepto seleccionado
            data.checked = true;
            let esConceptoSnomed = true;
            // chequeamos si es concepto snomed o una opcion extra del elementoRUP
            if (this.params && this.params.extraQuery) {
                this.ocultarPanel = !this.params.extraQuery.some(opt => opt.checked);
                esConceptoSnomed = this.ocultarPanel;
            }
            if (esConceptoSnomed) {
                this.ejecucionService.agregarConcepto(data);
                // this.ejecutarConceptoInside(data);

            }
        } else {
            const indexEncontrado = this.registro.registros.findIndex(r => (data.conceptId === r.concepto.conceptId));
            this.registro.registros.splice(indexEncontrado, 1);
            if (this.params && this.params.extraQuery) {
                this.ocultarPanel = true;
            }
        }
    }

    onConceptoDrop(e: any) {
        const { esSolicitud, term, fsn, semanticTag, conceptId } = e.dragData;
        this.ejecucionService.agregarConcepto(
            {
                fsn, term, semanticTag, conceptId
            },
            esSolicitud,
            true
        );
    }

    cargarNuevoRegistro(snomedConcept, esSolicitud = false, valor = null, relaciones = null) {

        const elementoRUP = this.elementosRUPService.buscarElemento(snomedConcept, esSolicitud);
        const nuevoRegistro = new IPrestacionRegistro(elementoRUP, snomedConcept, this.prestacion);

        this.itemsRegistros[nuevoRegistro.id] = { collapse: false, items: null };
        nuevoRegistro['_id'] = nuevoRegistro.id;

        if (esSolicitud) {
            nuevoRegistro.esSolicitud = true;
        }
        nuevoRegistro.valor = valor;
        if (relaciones) {
            nuevoRegistro.relacionadoCon = relaciones;
        }

        if (snomedConcept.semanticTag === 'procedimiento' || snomedConcept.semanticTag === 'elemento de registro' || snomedConcept.semanticTag === 'régimen/tratamiento' || snomedConcept.semanticTag === 'situación') {
            this.plantillasService.get(snomedConcept.conceptId, esSolicitud).subscribe(() => { });
        }
        this.registro.registros.push(nuevoRegistro);
    }


    vincularRegistros(registroOrigen: any, registroDestino: any) {
        // si proviene del drag and drop lo que llega es un concepto
        if (registroOrigen.dragData) {
            registroOrigen = registroOrigen.dragData;
        }
        // Verificamos si ya esta vinculado no dejar que se vinculen de nuevo
        const control = this.controlVinculacion(registroOrigen, registroDestino);
        if (control) {
            // this.plex.toast('warning', 'Los elementos seleccionados ya se encuentran vinculados.');
            return false;
        }
        // Controlar si lo que llega como parámetro es un registro o es un concepto
        if (!registroOrigen.concepto) {
            // this.ejecutarConceptoInside(registroOrigen, registroDestino);
        } else {
            if (registroOrigen) {
                registroOrigen.relacionadoCon = [registroDestino];
            }
        }

    }

    /**
     * Mostrar opciones de confirmación de desvinculación
     *
     * @param {any} index Indice del elemento de los registros a desvincular
     * @memberof PrestacionEjecucionComponent
     */
    desvincular(registroActual, registroDesvincular) {
        this.confirmarDesvincular[registroActual.id] = registroDesvincular.id;
    }

    /**
     * Quitamos vinculación de los registros
     *
     * @param {any} index Indice del elemento de los registros a desvincular
     * @memberof PrestacionEjecucionComponent
     */
    confirmarDesvinculacion(registroId, index) {

        // quitamos relacion si existe
        if (this.confirmarDesvincular[registroId]) {
            const registroActual = this.registro.registros.find(r => r.id === registroId);

            if (registroActual) {
                registroActual.relacionadoCon = registroActual.relacionadoCon.filter(rr => rr.id !== this.confirmarDesvincular[registroId]);
                delete this.confirmarDesvincular[registroId];
                // this.moverRegistroEnPosicion(index, this.prestacion.ejecucion.registros.length);
            }
        }

    }


    cancelarDesvincular(registroId) {
        delete this.confirmarDesvincular[registroId];
    }

    // Controla antes de vincular que no esten vinculados
    controlVinculacion(registroOrigen, registroDestino) {
        let control;
        if (this.recorreArbol(registroDestino, registroOrigen)) {
            return true;
        }
        if (registroOrigen === registroDestino) {
            return true;
        }
        if (registroOrigen.relacionadoCon && registroOrigen.relacionadoCon.length > 0) {
            control = registroOrigen.relacionadoCon.find(registro => registro.id === registroDestino.id);
        }
        if (registroDestino.relacionadoCon && registroDestino.relacionadoCon.length > 0) {
            control = registroDestino.relacionadoCon.find(registro => registro.id === registroOrigen.id);
        }
        if (control) {
            return true;
        } else {
            return false;
        }
    }

    // Busca recursivamente en los relacionadoCon de los registros
    recorreArbol(registroDestino, registroOrigen) {
        if (registroDestino.relacionadoCon && registroDestino.relacionadoCon.length > 0) {
            for (const registro of registroDestino.relacionadoCon) {
                if (registro.id === registroOrigen.id) {
                    return true;
                }
                if (registro.relacionadoCon && registro.relacionadoCon.length > 0) {
                    return this.recorreArbol(registro, registroOrigen);
                } else {
                    return false;
                }
            }
        } else {
            return false;
        }
    }

    /**
         * Quitamos elemento del array de registros
         * En caso de tener elementos relacionados, se les quita la relacion
         * hacia el elemento a eliminar
         * @memberof PrestacionEjecucionComponent
         */
    eliminarRegistro() {
        if (this.confirmarEliminar) {
            const registros = this.registro.registros;
            const _registro = registros[this.indexEliminar];

            // Quitamos toda la vinculación que puedan tener con el registro
            registros.forEach(registro => {
                if (registro.relacionadoCon && registro.relacionadoCon.length > 0) {

                    // relacionadoCon está populado, y debe comprobarse el id
                    if (registro.relacionadoCon[0].id === _registro.id) {
                        registro.relacionadoCon = [];
                    }
                }
            });

            // eliminamos el registro del array
            registros.splice(this.indexEliminar, 1);

            // this.errores[this.indexEliminar] = null;
            this.indexEliminar = null;
            this.confirmarEliminar = false;
            this.scopeEliminar = '';
        }
    }

    /**
     * Mostramos dialogo de confirmacion en la interfaz
     * para confirmar el borrado del registro
     * @param {any} snomedConcept
     * @param {any} scope
     * @memberof PrestacionEjecucionComponent
     */
    confirmarEliminarRegistro(registroEliminar, scope) {
        let index;
        if (registroEliminar.dragData) {
            this.conceptoAEliminar = registroEliminar.dragData.concepto;
            index = this.registro.registros.findIndex(r => (registroEliminar.dragData.id === r.id));
        } else {
            index = this.registro.registros.findIndex(r => (registroEliminar.id === r.id));
        }
        this.scopeEliminar = scope;
        this.indexEliminar = index;
        this.confirmarEliminar = true;
    }

    cambiaValorCollapse(indice) {
        if (this.itemsRegistros[indice]) {
            this.itemsRegistros[indice].collapse = !this.itemsRegistros[indice].collapse;
        }
        this.registrosColapsados();
    }

    registrosColapsados() {
        this.registro.registros.forEach(registro => {
            const unRegistro = this.itemsRegistros[registro.id].collapse;
            if (unRegistro !== this.collapse) {
                this.collapse = !this.collapse;
            }
        });
    }
}
