import { Component, OnInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';
import { IPrestacionRegistro } from './../../interfaces/prestacion.registro.interface';
@Component({
    selector: 'rup-ElementoDeRegistroComponent',
    templateUrl: 'elementoDeRegistro.html',
    styleUrls: ['elementoDeRegistro.scss']
})

export class ElementoDeRegistroComponent extends RUPComponent implements OnInit {


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

    public itemsRegistros = {};
    // boleean para verificar si estan todos los conceptos colapsados
    public collapse = true;

    ngOnInit() {
        if (this.params.refsetId) {
            console.log(this.params.refsetId);
            this.snomedService.getQuery({ expression: '^' + this.params.refsetId }).subscribe(resultado => {
                this.conceptosPermitidos = resultado;
                console.log(resultado);
            });
        }
        if (!this.registro.valor) {
            this.registro.valor = {
                descripcion: null,
                registros: []
            };
        }
    }
    onConceptoDrop(e: any) {
        if (!this.validaConcepto(e.dragData)) {
        } else {
            if (e.dragData.tipo) {
                switch (e.dragData.tipo) {
                    case 'prestacion':
                        this.ejecutarConcepto(e.dragData.data.solicitud.tipoPrestacion);
                        break;
                    case 'hallazgo':
                    case 'trastorno':
                    case 'situación':
                        this.ejecutarConcepto(e.dragData.data.concepto);
                        break;
                    default:
                        this.ejecutarConcepto(e.dragData);
                        break;
                }

            } else {
                window.setTimeout(() => {
                    this.ejecutarConcepto(e.dragData);
                });
            }


        }
    }


    ejecutarConcepto(snomedConcept, registroDestino = null) {
        let valor;
        this.isDraggingConcepto = false;
        let registros = this.prestacion.ejecucion.registros;

        // El concepto ya aparece en los registros?
        let registoExiste = registros.find(registro => registro.concepto.conceptId === snomedConcept.conceptId);
        // si estamos cargando un concepto para una transformación de hall
        if (registoExiste) {
            // this.plex.toast('warning', 'El elemento seleccionado ya se encuentra registrado.');
            // return false;
        }
        this.cargarNuevoRegistro(snomedConcept);
    }




    // cargarNuevoRegistro(snomedConcept, valor = null) {
    //     // Si proviene del drag and drop
    //     if (snomedConcept.dragData) {
    //         snomedConcept = snomedConcept.dragData;
    //     }
    //     // Elemento a ejecutar dinámicamente luego de buscar y clickear en snomed
    //     let esSolicitud = false;

    //     // Si es un plan seteamos el true para que nos traiga el elemento rup por default
    //     if (this.tipoBusqueda && this.tipoBusqueda.length && this.tipoBusqueda[0] === 'planes') {
    //         esSolicitud = true;
    //     }
    //     let elementoRUP = this.elementosRUPService.buscarElemento(snomedConcept, esSolicitud);
    //     // armamos el elemento data a agregar al array de registros
    //     let nuevoRegistro = new IPrestacionRegistro(elementoRUP, snomedConcept);
    //     this.itemsRegistros[nuevoRegistro.id] = { collapse: false, items: null };
    //     nuevoRegistro['_id'] = nuevoRegistro.id;
    //     // Verificamos si es un plan. Si es un plan seteamos esSolicitud en true
    //     if (esSolicitud) {
    //         nuevoRegistro.esSolicitud = true;
    //     }
    //     nuevoRegistro.valor = valor;

    //     // Agregamos al array de registros
    //     this.prestacion.ejecucion.registros.splice(this.prestacion.ejecucion.registros.length, 0, nuevoRegistro);
    //     this.showDatosSolicitud = false;
    //     // this.recuperaLosMasFrecuentes(snomedConcept, elementoRUP);
    //     return nuevoRegistro;
    // }




    cargarNuevoRegistro(snomedConcept, valor = null) {
        // Si proviene del drag and drop
        if (snomedConcept.dragData) {
            snomedConcept = snomedConcept.dragData;
        }
        // Elemento a ejecutar dinámicamente luego de buscar y clickear en snomed
        let esSolicitud = false;

        // Si es un plan seteamos el true para que nos traiga el elemento rup por default
        // if (this.tipoBusqueda && this.tipoBusqueda.length && this.tipoBusqueda[0] === 'planes') {
        //     esSolicitud = true;
        // }
        let elementoRUP = this.elementosRUPService.buscarElemento(snomedConcept, esSolicitud);
        // armamos el elemento data a agregar al array de registros
        let nuevoRegistro = new IPrestacionRegistro(elementoRUP, snomedConcept);
        this.itemsRegistros[nuevoRegistro.id] = { collapse: false, items: null };
        nuevoRegistro['_id'] = nuevoRegistro.id;
        // Verificamos si es un plan. Si es un plan seteamos esSolicitud en true
        if (esSolicitud) {
            nuevoRegistro.esSolicitud = true;
        }
        nuevoRegistro.valor = valor;

        this.registro.valor.registros.push(nuevoRegistro);
    }


    vincularRegistros(registroOrigen: any, registroDestino: any) {
        let registros = this.registro.valor.registros;

        // si proviene del drag and drop lo que llega es un concepto
        if (registroOrigen.dragData) {
            registroOrigen = registroOrigen.dragData;
        }
        // Verificamos si ya esta vinculado no dejar que se vinculen de nuevo
        let control = this.controlVinculacion(registroOrigen, registroDestino);
        if (control) {
            // this.plex.toast('warning', 'Los elementos seleccionados ya se encuentran vinculados.');
            return false;
        }
        // Controlar si lo que llega como parámetro es un registro o es un concepto
        if (!registroOrigen.concepto) {
            this.ejecutarConcepto(registroOrigen, registroDestino);
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
            let registroActual = this.registro.valor.registros.find(r => r.id === registroId);

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
            for (let registro of registroDestino.relacionadoCon) {
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
            let registros = this.registro.valor.registros;
            let _registro = registros[this.indexEliminar];

            // Quitamos toda la vinculación que puedan tener con el registro
            registros.forEach(registro => {
                if (registro.relacionadoCon && registro.relacionadoCon.length > 0) {

                    // relacionadoCon está populado, y debe comprobarse el id
                    if (registro.relacionadoCon[0].id === _registro.id) {
                        registro.relacionadoCon = [];
                    }
                }
            });

            // Si exite el campo idRegistroTransformado significa que el registro a elimininar nace de una transformación
            // y por lo tanto hay qye volver el registro orige a su estado original
            if (_registro.valor.registros && _registro.valor.registros.idRegistroTransformado) {
                let registroOriginal = registros.find(r => r.id === _registro.valor.idRegistroTransformado);
                if (registroOriginal) {
                    registroOriginal.valor.estado = 'activo';
                    delete registroOriginal.valor.idRegistroGenerado;
                }
            }
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
            index = this.registro.valor.registros.findIndex(r => (registroEliminar.dragData.id === r.id));
        } else {
            index = this.registro.valor.registros.findIndex(r => (registroEliminar.id === r.id));
        }
        this.scopeEliminar = scope;
        this.indexEliminar = index;
        this.confirmarEliminar = true;
    }

    validaConcepto(concepto) {
        if (this.conceptosPermitidos.length) {

            let control = this.conceptosPermitidos.find(c => c.conceptId === concepto.conceptId);

            if (control) {
                return true;
            } else {
                // TODO: Ver el mensaje a mostrar..
                this.plex.alert('No se puede agregar ese concepto');
                return false;
            }
        } else {
            return true;
        }
    }


    cambiaValorCollapse(indice) {
        console.log(indice);
        console.log(this.itemsRegistros[indice], 'rrrr');
        if (this.itemsRegistros[indice]) {
            console.log(this.itemsRegistros[indice].collapse);

            this.itemsRegistros[indice].collapse = !this.itemsRegistros[indice].collapse;
        }
        this.registrosColapsados();
    }

    registrosColapsados() {
        this.registro.valor.registros.forEach(registro => {
            let unRegistro = this.itemsRegistros[registro.id].collapse;
            if (unRegistro !== this.collapse) {
                this.collapse = !this.collapse;
            }
        });
    }
}
