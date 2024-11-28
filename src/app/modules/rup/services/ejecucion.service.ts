import { Plex } from '@andes/plex';
import { cache } from '@andes/shared';
import { Injectable } from '@angular/core';
import { BehaviorSubject, from, of, Subject } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import { IPaciente } from '../../../core/mpi/interfaces/IPaciente';
import { IElementoRUP } from '../interfaces/elementoRUP.interface';
import { IPrestacion } from '../interfaces/prestacion.interface';
import { ISnomedConcept } from '../interfaces/snomed-concept.interface';
import { getRegistros } from '../operators/populate-relaciones';
import { ElementosRUPService } from './elementosRUP.service';
import { PrestacionesService } from './prestaciones.service';
import { ConstantesService } from './../../../services/constantes.service';
import { SnomedService } from '../../../apps/mitos';


@Injectable()
export class RupEjecucionService {
    /**
     * ATENCION: Por una primera etapa paso algunos datos como variables.
     * En un segundo refactor la idea es que este servicio haga toda la carga de los datos para
     * la ejecución.
     */

    public elementoRupPrestacion: IElementoRUP;
    public paciente: IPaciente;
    public prestacion: IPrestacion;


    private conceptoBuffer = new Subject<EmitConcepto>();
    private conceptoBuffer$ = this.conceptoBuffer.asObservable().pipe(
        filter(r => this.chequearRepetido(r)),
        switchMap(r => this.chequearEvolucionConcepto(r)),
        cache()
    );

    private seccion = new BehaviorSubject<ISnomedConcept>(null);
    private seccion$ = this.seccion.asObservable();

    private sugeridos = new Subject<ISnomedConcept[]>();
    private segeridos$ = this.sugeridos.asObservable();

    private actualizacion = new BehaviorSubject<string>('');
    private actualizacion$ = this.actualizacion.asObservable();

    constructor(
        private plex: Plex,
        private prestacionService: PrestacionesService,
        private elementosRUPService: ElementosRUPService,
        private constantesService: ConstantesService,
        private snomedService: SnomedService
    ) {

    }

    getSeccion() {
        return this.seccion$;
    }

    hasActualizacion() {
        return this.actualizacion$;
    }

    actualizar(concept: string) {
        this.actualizacion.next(concept);
    }

    setSeccion(concepto?: ISnomedConcept) {
        this.seccion.next(concepto);
    }

    clearSeccion() {
        this.seccion.next(null);
    }

    getSeccionValue() {
        return this.seccion.getValue();
    }

    getSugeridos() {
        return this.segeridos$;
    }

    addSugeridos(conceptos: ISnomedConcept[]) {
        this.sugeridos.next(conceptos);
    }

    agregarConcepto(concepto: ISnomedConcept, esSolicitud = false, seccion: ISnomedConcept | boolean = null, valor: any = null, extras: any = {}) {
        if (typeof seccion === 'boolean') {
            seccion = seccion && this.seccion.getValue();
        } else {
            seccion = seccion || this.seccion.getValue();
        }
        this.conceptoBuffer.next({
            concepto,
            esSolicitud,
            seccion,
            valor,
            ...extras
        });
    }

    conceptosStream() {
        return this.conceptoBuffer$;
    }

    conceptosAsociadosSolicitud() {
        this.constantesService.search({ source: 'solicitud:conceptosAsociados' }).subscribe(async (constantes) => {
            if (constantes?.length) {
                this.snomedService?.get({
                    search: constantes[0].query
                });
            }

        });
    }

    chequearRepetido(data: EmitConcepto) {
        const { concepto, esSolicitud } = data;

        const elementoRUP = this.elementosRUPService.buscarElemento(concepto, esSolicitud);

        if (elementoRUP.frecuentes?.length > 0) {
            this.addSugeridos(elementoRUP.frecuentes);
        }

        if (elementoRUP.permiteRepetidos) {
            return true;
        }

        const registros = this.getPrestacionRegistro();
        const registoExiste = registros.find(registro => registro.concepto.conceptId === concepto.conceptId);
        if (registoExiste) {
            this.plex.toast('warning', 'El elemento seleccionado ya se encuentra registrado.');
            return false;
        }
        return true;
    }

    getPrestacionRegistro() {
        return getRegistros(this.prestacion);
    }


    chequearEvolucionConcepto(data: EmitConcepto) {
        const { concepto, esSolicitud, valor } = data;
        const paraOdonto = !this.elementoRupPrestacion.reglas || !this.elementoRupPrestacion.reglas.requeridos || !this.elementoRupPrestacion.reglas.requeridos.relacionesMultiples;
        if (concepto.semanticTag === 'trastorno' && paraOdonto && !esSolicitud && !valor) { // Por ahora!

            return this.prestacionService.getUnTrastornoPaciente(this.paciente.id, concepto).pipe(
                switchMap((registro) => {
                    if (registro && registro.evoluciones[0].estado === 'activo') {
                        return from(
                            this.plex.confirm('¿Desea evolucionar el mismo?', 'El problema ya se encuentra registrado')
                        ).pipe(
                            map((confirmar) => {
                                if (confirmar) {
                                    return {
                                        ...data,
                                        valor: {
                                            idRegistroOrigen: registro.evoluciones[0].idRegistro
                                        }
                                    };
                                } else {
                                    return data;
                                }
                            })
                        );
                    } else {
                        return of(data);
                    }
                })
            );
        } else {
            return of(data);
        }
    }

}

export interface EmitConcepto {
    concepto: ISnomedConcept;
    esSolicitud: boolean;
    seccion?: ISnomedConcept;
    valor?: any;
    idEvolucion?: string;
}
