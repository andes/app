import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { RupElement } from '../..';
import { RUPComponent } from '../../../core/rup.component';
import { IPrestacionRegistro } from '../../../../interfaces/prestacion.registro.interface';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

/**
 * Parametros:
 * showText: muestra el textarea para escribir texto libre
 * textRequired: es requerido ingresar texto libre
 * conceptsRequired: es requerido al menos un valor registrado
 * showTitle: muestra el titulo de la seccion
 * direction = horizontal | vertical: expande el textarea ocupando toda la fila.
 * noIndex: hay secciones que son alertas, no deberían ir a la HUDS
 * whitelist: conceptos permitidos (Query Snomed)
 * options: muestra opciones de conceptos de rapida seleccion (tipo sugeridos). (Query Snomed)
 * extraOptions: agrega un "otras" opciones a los atajos
 */

// [TODO] Las relaciones estaban por la mitad en la otra seccion, queda unificar criterios

@Component({
    selector: 'rup-seccion-component',
    templateUrl: 'seccion.component.html',
    styleUrls: ['seccion.component.scss']
})
@RupElement('SeccionComponent')
export class SeccionComponent extends RUPComponent implements OnInit, OnDestroy, AfterViewInit {


    // Variable para mostrar el div dropable en el momento que se hace el drag
    public isDraggingConcepto: Boolean = true;

    // utilizamos confirmarDesvincular para mostrar el boton de confirmacion de desvinculado
    public confirmarDesvincular: any[] = [];

    public confirmarEliminar: Boolean = false;
    public indexEliminar: any;

    // el concepto que seleccionamos para eliminar lo guradamos aca.
    public conceptoAEliminar: any;

    public scopeEliminar: string;

    public conceptosSeleccionar: any[] = [];
    public conceptoElegido: any = null;

    public itemsRegistros = {};
    // boleean para verificar si estan todos los conceptos colapsados
    public collapse = true;
    public ocultarPanel = false;
    // suscriptionBuscador: Subscription;
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

        this.params.showText = this.params.showText || false;
        this.params.textRequired = (this.params.showText && this.params.textRequired) || false;
        this.params.showTitle = this.params.showTitle || false;
        this.params.conceptsRequired = this.params.conceptsRequired || false;
        this.params.direction = this.params.direction || 'horizontal';


        if (this.params.options) {
            this.snomedService.getQuery({ expression: this.params.options }).subscribe(resultado => {
                this.conceptosSeleccionar = resultado.map(r => {
                    r['checked'] = false;
                    return r;
                });
                if (this.params.extraOptions) {
                    // agregamos al resultado las opciones extra, si existieran
                    this.conceptosSeleccionar = this.conceptosSeleccionar.concat(this.params.extraOptions);
                    // determinamos visibilidad del panel 'agregar prestaciones asociadas al tratamiento'
                    this.ocultarPanel = !this.params.extraOptions.some(opt => opt.checked);
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
                if (this.params.whitelist) {
                    const query = `(${this.params.whitelist}) AND ${registro.concepto.conceptId}`;
                    this.snomedService.getQuery({ expression: query }).subscribe((conceptos) => {
                        if (conceptos.length > 0) {
                            this.cargarNuevoRegistro(registro.concepto, registro.esSolicitud, registro.valor, null);
                        }
                    });
                } else {
                    this.cargarNuevoRegistro(registro.concepto, registro.esSolicitud, registro.valor, null);
                }
            });
        }


    }
    ngAfterViewInit() {
        setTimeout(() => {
            this.afterInit = true;
        }, 300);
    }

    get colForText() {
        if (this.soloValores || this.params.direction === 'vertical') {
            return 'col-12';
        } else {
            return 'col-5';
        }
    }

    get colForOptions() {
        if (this.params.direction === 'vertical') {
            return 'col-12';
        } else {
            return 'col-5';
        }
    }

    get colForRegistros() {
        if (this.soloValores || this.params.direction === 'vertical') {
            return 'col-12';
        } else if (!this.params.showText && !(this.conceptosSeleccionar.length > 0)) {
            return 'col-12';
        } else {
            return 'col-7';
        }
    }

    onValidate() {
        if (this.params.conceptsRequired) {
            return this.registro.registros.length > 0;
        }
        return true;
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
                this.ejecucionService.agregarConcepto(
                    data,
                    false
                );
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
        // Verificamos si es un plan. Si es un plan seteamos esSolicitud en true
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
        const registros = this.registro.registros;

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

    checkPlantilla(registro) {
        const checkSemtag = registro.concepto.semanticTag === 'procedimiento' || registro.concepto.semanticTag === 'elemento de registro' || registro.concepto.semanticTag === 'régimen/tratamiento';
        return checkSemtag;
    }
}
