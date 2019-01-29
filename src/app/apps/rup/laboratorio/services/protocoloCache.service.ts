import { Constantes } from './../controllers/constants';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

Injectable();
export class LaboratorioContextoCacheService {

    private contextoCache = new BehaviorSubject<any>({ titulo: null, modo: null });

    /**
     *
     *
     * @param {*} prestacion
     * @memberof LaboratorioContextoCacheService
     */
    setContextoCache(prestacion: any) {
        this.contextoCache.next(prestacion);
    }

    /**
     *
     *
     * @returns {*}
     * @memberof LaboratorioContextoCacheService
     */
    getContextoCache(): any {
        return (this.contextoCache.asObservable().source as any)._value;
    }

    /**
     *
     *
     * @param {*} modoId
     * @memberof LaboratorioContextoCacheService
     */
    cambiarModo(modoId) {
        if (modoId === Constantes.modoIds.recepcion) {
            this.getContextoCache().modo = 'recepcion';
            this.getContextoCache().titulo = Constantes.titulos.recepcion;
        } else if (modoId === Constantes.modoIds.recepcionSinTurno) {
            this.getContextoCache().modo = 'recepcion';
            this.getContextoCache().titulo = Constantes.titulos.recepcionSinTurno;
        } else if (modoId === Constantes.modoIds.control) {
            this.getContextoCache().modo = 'control';
            this.getContextoCache().titulo = Constantes.titulos.control;
        } else if (modoId === Constantes.modoIds.carga) {
            this.getContextoCache().titulo = Constantes.titulos.carga;
            this.getContextoCache().modo = 'carga';
        } else if (modoId === Constantes.modoIds.validacion) {
            this.getContextoCache().titulo = Constantes.titulos.validacion;
            this.getContextoCache().modo = 'validacion';
        } else if (modoId === Constantes.modoIds.listado) {
            this.getContextoCache().titulo = Constantes.titulos.listado;
            this.getContextoCache().modo = 'listado';
        }
    }

    /**
     *
     *
     * @memberof LaboratorioContextoCacheService
     */
    irAuditoriaProtocolo() {
        this.getContextoCache().ocultarPanelLateral = true;
        this.getContextoCache().modoAVolver = this.getContextoCache().modo;
        this.cambiarModo(Constantes.modoIds.control);
    }

    /**
     *
     *
     * @memberof LaboratorioContextoCacheService
     */
    aceptarCambiosAuditoriaProtocolo() {
        this.getContextoCache().ocultarPanelLateral = false;
        this.getContextoCache().modo = this.getContextoCache().modoAVolver;
        this.getContextoCache().modoAVolver = null;
    }

    /**
     *
     *
     * @memberof LaboratorioContextoCacheService
     */
    salirDeHistoricoResultados() {
        this.getContextoCache().titulo = Constantes.titulos.validacion;
        this.getContextoCache().botonesAccion = 'validacion';
        this.getContextoCache().mostrarCuerpoProtocolo = true;
        this.getContextoCache().verHistorialResultados = false;
    }

    /**
     *
     *
     * @memberof LaboratorioContextoCacheServicethis
     */
    seleccionarProtocolo() {
        this.getContextoCache().edicionDatosCabecera = false;
        this.getContextoCache().mostrarCuerpoProtocolo = (this.getContextoCache().modo !== 'recepcion');
        this.getContextoCache().ocultarPanelLateral =
            (this.getContextoCache().modo === 'recepcion')
            || (this.getContextoCache().modo === Constantes.modoIds.recepcionSinTurno)
            || this.getContextoCache().cargarPorPracticas;
            console.log('this.getContextoCache().ocultarPanelLateral ', this.getContextoCache().ocultarPanelLateral );
    }

    /**
     *
     *
     * @memberof LaboratorioContextoCacheService
     */
    setPaciente() {
        this.getContextoCache().edicionDatosCabecera = true;
        this.getContextoCache().ocultarPanelLateral = true;
        this.getContextoCache().mostrarCuerpoProtocolo = true;
    }

    /**
     *
     *
     * @memberof LaboratorioContextoCacheService
     */
    ventanillaSinTurno() {
        this.cambiarModo(Constantes.modoIds.recepcionSinTurno);
        this.getContextoCache().ocultarPanelLateral = true;
        this.getContextoCache().mostrarCuerpoProtocolo = false;
    }
}



