import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, of, from } from 'rxjs';
import { ISnomedConcept } from '../interfaces/snomed-concept.interface';
import { IElementoRUP } from '../interfaces/elementoRUP.interface';
import { IPaciente } from '../../../core/mpi/interfaces/IPaciente';
import { Plex } from '@andes/plex';
import { PrestacionesService } from './prestaciones.service';
import { switchMap, map, filter } from 'rxjs/operators';
import { IPrestacion } from '../interfaces/prestacion.interface';
import { cache } from '@andes/shared';
import { ElementosRUPService } from './elementosRUP.service';


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

    constructor(
        private plex: Plex,
        private prestacionService: PrestacionesService,
        private elementosRUPService: ElementosRUPService
    ) {

    }

    getSeccion() {
        return this.seccion$;
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

    agregarConcepto(concepto: ISnomedConcept, esSolicitud = false, seccion: ISnomedConcept | boolean = null, valor: any = null) {
        if (typeof seccion === 'boolean') {
            seccion = seccion && this.seccion.getValue();
        } else {
            seccion = seccion || this.seccion.getValue();
        }
        this.conceptoBuffer.next({
            concepto,
            esSolicitud,
            seccion,
            valor
        });
    }

    conceptosStream() {
        return this.conceptoBuffer$;
    }

    chequearRepetido(data: EmitConcepto) {
        const { concepto, esSolicitud } = data;

        const elementoRUP = this.elementosRUPService.buscarElemento(concepto, esSolicitud);
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
        const registros = this.prestacion.ejecucion.registros;
        let rs = [...registros];
        registros.forEach(registro => {
            if (registro.hasSections) {
                registro.registros.forEach(seccion => {
                    if (seccion.isSection) {
                        rs = [...rs, ...seccion.registros];
                    }
                });
            }
        });
        return rs;
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
}
