import { Component, OnInit } from '@angular/core';
import { filter, takeUntil } from 'rxjs/operators';
import { IPrestacionRegistro } from '../../interfaces/prestacion.registro.interface';
import { ISnomedConcept } from '../../interfaces/snomed-concept.interface';
import { RUPComponent } from '../core/rup.component';
import { RupElement } from '.';

@Component({
    selector: 'rup-molecula-base',
    templateUrl: 'moleculaBase.html'
})
@RupElement('MoleculaBaseComponent')
export class MoleculaBaseComponent extends RUPComponent implements OnInit {
    public contentLoaded = false;
    public ultimaConsulta;
    public validacion = false;
    public estados = [
        { id: 'resuelto', nombre: 'Resuelto' },
        { id: 'activo', nombre: 'Activo' }
    ];
    public consultaTrastornoOriginal: any;
    public evoluciones;

    // Cantidad de requeridos definidos en la configuración de la molécula.
    // Los registros que superan este índice fueron agregados dinámicamente.
    public cantidadRequeridos = 0;

    ngOnInit() {
        this.cantidadRequeridos = this.elementoRUP?.requeridos?.length || 0;
        if (this.registro.concepto.semanticTag === 'trastorno') {
            if (!this.registro.valor) {
                this.registro.valor = { estado: 'activo' };
            }
            const regFechaInicio = this.registro.registros.find(reg => reg.concepto.conceptId === '298059007');
            const regHhoraInicio = this.registro.registros.find(reg => reg.concepto.conceptId === '405795006');
            if (regFechaInicio?.valor && regHhoraInicio?.valor) {
                const inicio = moment(regHhoraInicio.valor).date(moment(regFechaInicio.valor).date()).toDate();
                this.registro.valor.fechaInicio = inicio;
            }
            // Si llega un idRegistroOrigen es porque se trata de evolucionar un problema que ya existe en la HUDS
            // tenemos que mostrar las evoluciones anteriores
            if (this.registro.valor.idRegistroOrigen) {
                this.getRegistrosAnteriores(this.registro.concepto);
            }
        }

        if (this.params && this.params.hasSections) {
            this.registro.hasSections = true;
        }
        this.validacion = !this.ejecucionService;

        const buscarAnterior = this.params && this.params.buscarAnterior;
        if (!this.validacion && !this.soloValores && buscarAnterior) {
            this.prestacionesService.getRegistrosHuds(this.paciente.id, this.registro.concepto.conceptId).subscribe(consulta => {
                consulta.sort((a, b) => {
                    const dateA = new Date(a.fecha).getTime();
                    const dateB = new Date(b.fecha).getTime();

                    return dateA > dateB ? -1 : 1;
                });

                if (consulta.length > 0) {
                    const fechaPrestacion = this.prestacion.updatedAt || this.prestacion.createdAt;
                    const esFutura = consulta[0].registro.updatedAt.getTime() > fechaPrestacion.getTime();

                    if (!esFutura) {

                        this.ultimaConsulta = consulta[0].registro;
                        this.registro.registros = JSON.parse(JSON.stringify(this.ultimaConsulta.registros));
                    }
                }
                this.contentLoaded = true;
            });
        } else {
            this.contentLoaded = true;
        }
        this.createRules();

        if (this.ejecucionService) {
            // Si un concepto se agrega con la sección de esta molécula, se agrega adentro de la misma
            this.ejecucionService.conceptosStream().pipe(
                filter(r => r.seccion && r.seccion.conceptId === this.registro.concepto.conceptId),
                takeUntil(this.onDestroy$)
            ).subscribe((registro) => {
                this.cargarNuevoRegistro(registro.concepto, registro.esSolicitud, registro.valor);
            });
        }
    }

    /**
     * Agrega un nuevo registro dentro de la molécula para que el elemento RUP se renderice dentro de la misma.
     */
    cargarNuevoRegistro(snomedConcept: ISnomedConcept, esSolicitud = false, valor = null) {
        const elementoRUP = this.elementosRUPService.buscarElemento(snomedConcept, esSolicitud);
        const nuevoRegistro = new IPrestacionRegistro(elementoRUP, snomedConcept, this.prestacion);
        nuevoRegistro['_id'] = nuevoRegistro.id;
        if (esSolicitud) {
            nuevoRegistro.esSolicitud = true;
        }

        // asignamos valor y marcamos origen para que persista en el backend cuando sea posible
        if (valor && typeof valor === 'object') {
            nuevoRegistro.valor = valor;
            nuevoRegistro.valor.origen = 'molecula';
        } else if (valor == null) {
            nuevoRegistro.valor = { origen: 'molecula' } as any;
        } else {
            // valor es primitivo; lo asignamos tal cual y mantenemos la marca temporal
            nuevoRegistro.valor = valor;
        }

        this.registro.registros.push(nuevoRegistro);

        // También agregamos el registro al array de ejecución de la prestación
        // para que pueda persistirse junto con la prestación cuando corresponda.
        if (this.prestacion && this.prestacion.ejecucion && Array.isArray(this.prestacion.ejecucion.registros)) {
            // marcamos que este registro fue creado desde la molécula para evitar duplicado visual
            nuevoRegistro._origenMolecula = true;
            // posponemos la inserción al siguiente tick para evitar ExpressionChangedAfterItHasBeenCheckedError
            setTimeout(() => {
                this.prestacion.ejecucion.registros = [...this.prestacion.ejecucion.registros, nuevoRegistro];
                if (this.ejecucionService) {
                    this.ejecucionService.actualizar('cargar');
                }
            }, 0);
        }
    }

    /**
     * Quita de la molécula un registro que fue agregado dinámicamente.
     */
    quitarRegistro(registro: IPrestacionRegistro) {
        const index = this.registro.registros.findIndex(r => r.id === registro.id);
        if (index !== -1) {
            this.registro.registros.splice(index, 1);
            // También removemos del array global de la prestación para mantener consistencia con backend
            if (this.prestacion && this.prestacion.ejecucion && Array.isArray(this.prestacion.ejecucion.registros)) {
                const idxGlobal = this.prestacion.ejecucion.registros.findIndex(r => r.id === registro.id || r._id === registro._id);
                if (idxGlobal !== -1) {
                    this.prestacion.ejecucion.registros.splice(idxGlobal, 1);
                    if (this.ejecucionService) {
                        this.ejecucionService.actualizar('eliminar');
                    }
                }
            }
            this.emitChange();
        }
    }

    onChange(value) {
        if (this.registro.concepto.semanticTag === 'trastorno') {
            const regFechaInicio = this.registro.registros.find(reg => reg.concepto.conceptId === '298059007');
            const regHhoraInicio = this.registro.registros.find(reg => reg.concepto.conceptId === '405795006');
            if (regFechaInicio?.valor && regHhoraInicio?.valor && (value.concepto.conceptId === '298059007' || value.concepto.conceptId === '405795006')) {
                // para mantener el registro 'horaInicio' consistente con la fecha, ya que desde la molecula solo podemos setear la hora
                regHhoraInicio.valor = moment(regHhoraInicio.valor).date(moment(regFechaInicio.valor).date()).toDate();
                regFechaInicio.valor = moment(regHhoraInicio.valor).date(moment(regFechaInicio.valor).date()).toDate();
                this.registro.valor.fechaInicio = regHhoraInicio.valor;
            }
        }
    }

    getRegistrosAnteriores(idOrigen) {
        this.prestacionesService.getUnTrastornoPaciente(this.paciente.id, idOrigen).subscribe(trastorno => {
            if (trastorno) {
                this.consultaTrastornoOriginal = trastorno.registros.find(reg => reg.concepto.conceptId === this.registro.concepto.conceptId);
                this.evoluciones = [...trastorno.evoluciones];

                if (this.evoluciones && this.evoluciones.length > 0) {
                    this.registro.valor.estado = this.registro.valor.estado || 'activo';
                    this.registro.valor.fechaInicio = this.consultaTrastornoOriginal.registros.find(reg => reg.concepto.conceptId === '298059007').valor;
                    this.registro.registros.find(reg => reg.concepto.conceptId === '298059007').valor = this.registro.valor.fechaInicio;
                    this.registro.registros.find(reg => reg.concepto.conceptId === '405795006').valor = this.consultaTrastornoOriginal.registros.find(reg => reg.concepto.conceptId === '405795006').valor;
                    this.registro.valor.evolucion = this.registro.registros.find(reg => reg.concepto.conceptId === '229059009').valor;
                }
            }
        });
    }

    createRules() {
        if (this.elementoRUP.rules?.length > 0) {
            const registros = (this.registro.registros || []);
            registros.forEach(item => {
                this.conceptObserverService.observe({ concepto: item.concepto } as any).subscribe(value => {
                    this.addFact(item.concepto.conceptId, value.valor);
                });
            });

            this.onRule('set-value').subscribe(evento => {
                const { params } = evento;
                this.conceptObserverService.notify(params.target, { valor: params.valor } as any);
            });
        }
    }

    formatearEstado() {
        this.registro.valor.estado = ((typeof this.registro.valor.estado === 'string')) ? this.registro.valor.estado : (Object(this.registro.valor.estado).id);
        this.emitChange();
    }
}
