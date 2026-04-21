import { Component, Input, OnInit } from '@angular/core';
import { IPaciente } from '../../../../core/mpi/interfaces/IPaciente';
import { HUDSService } from '../../services/huds.service';
import { RecetaService } from 'src/app/services/receta.service';
import { OrganizacionService } from 'src/app/services/organizacion.service';
import * as moment from 'moment';

@Component({
    selector: 'vista-receta',
    templateUrl: 'vistaReceta.html',
    styleUrls: ['vistaReceta.scss']
})
export class VistaRecetaComponent implements OnInit {

    @Input() paciente: IPaciente;
    @Input() registro: any;

    public columns = [
        {
            key: 'fecha',
            label: 'Fecha',
            sorteable: false,
            opcional: false
        },
        {
            key: 'organizacion',
            label: 'Organización',
            sorteable: false,
            opcional: false
        },
        {
            key: 'profesional',
            label: 'Profesional',
            sorteable: false,
            opcional: false
        },
        {
            key: 'diagnostico',
            label: 'Diagnóstico',
            sorteable: false,
            opcional: false
        },
        {
            key: 'estado',
            label: 'Estado',
            sorteable: false,
            opcional: false
        }
    ];

    public columnsDetalleDispensa = [
        {
            key: 'fecha',
            label: 'Fecha',
            sorteable: false,
            opcional: false
        },
        {
            key: 'medicamento',
            label: 'Medicamento',
            sorteable: false,
            opcional: false
        },
        {
            key: 'sistema',
            label: 'Sistema',
            sorteable: false,
            opcional: false
        },
        {
            key: 'organizacion',
            label: 'Organización',
            sorteable: false,
            opcional: false
        },
        {
            key: 'tipo',
            label: 'Tipo',
            sorteable: false,
            opcional: false
        },
        {
            key: 'estado',
            label: '',
            sorteable: false,
            opcional: false
        }
    ];
    public estadoReceta = {
        vigente: 'success',
        finalizada: 'success',
        suspendida: 'danger',
        vencida: 'danger',
        rechazada: 'danger',
        pendiente: 'info'
    } as { [key: string]: string };

    public estadoDispensa = {
        'sin-dispensa': 'info',
        'dispensada': 'success',
        'dispensa-parcial': 'warning'
    } as { [key: string]: string };

    public listadoDispensas = [];
    public recetas;
    public recetaPrincipal: any;
    public historialRecetas: any[];
    public recetasRestantes: any[] = [];

    constructor(
        public huds: HUDSService,
        public recetaService: RecetaService,
        public organizacionesService: OrganizacionService
    ) { }

    ngOnInit() {
        this.recetaPrincipal = this.registro.recetas?.length > 1 ? this.recetaService.getRecetaPrincipal(this.registro.recetas) : this.registro.recetas?.[0];
        if (!this.recetaPrincipal) {
            return;
        }
        this.combinarDispensas();

        const historialBase = (this.registro.recetas || []).filter(receta => receta.id !== this.recetaPrincipal.id && receta.fechaRegistro <= this.recetaPrincipal.fechaRegistro && receta.estadoActual?.tipo !== 'eliminada');

        this.recetasRestantes = (this.registro.recetas || []).filter(r =>
            r.id !== this.recetaPrincipal.id &&
            r.idRegistro === this.recetaPrincipal.idRegistro &&
            (this.recetaPrincipal.medicamento?.tratamientoProlongado || this.recetaPrincipal.insumo?.tratamientoProlongado) &&
            r.estadoActual?.tipo !== 'eliminada'
        );
        this.recetasRestantes.sort((a, b) => ((a.medicamento?.ordenTratamiento ?? a.insumo?.ordenTratamiento) || 0) - ((b.medicamento?.ordenTratamiento ?? b.insumo?.ordenTratamiento) || 0));

        const historialExcluidoActual = historialBase.filter(r => {
            if (this.recetaPrincipal.idRegistro && r.idRegistro === this.recetaPrincipal.idRegistro) {
                return false;
            }
            return true;
        });

        const grupos = {};
        const result = [];

        historialExcluidoActual.forEach(receta => {
            const esTP = receta.medicamento?.tratamientoProlongado || receta.insumo?.tratamientoProlongado;
            if (esTP && receta.idRegistro) {
                if (!grupos[receta.idRegistro]) {
                    grupos[receta.idRegistro] = [];
                }
                grupos[receta.idRegistro].push(receta);
            } else {
                result.push(receta);
            }
        });

        Object.keys(grupos).forEach(key => {
            const recetasGrupo = grupos[key];
            const todasFinalizadas = recetasGrupo.every(r => r.estadoActual?.tipo !== 'vigente');
            if (todasFinalizadas) {
                recetasGrupo.sort((a, b) => ((a.medicamento?.ordenTratamiento ?? a.insumo?.ordenTratamiento) || 0) - ((b.medicamento?.ordenTratamiento ?? b.insumo?.ordenTratamiento) || 0));
                result.push({
                    esGrupo: true,
                    expandido: false,
                    fechaRegistro: recetasGrupo[0].fechaRegistro,
                    organizacion: recetasGrupo[0].organizacion,
                    profesional: recetasGrupo[0].profesional,
                    diagnostico: recetasGrupo[0].diagnostico,
                    recetas: recetasGrupo
                });
            } else {
                result.push(...recetasGrupo);
            }
        });

        result.sort((a, b) => new Date(b.fechaRegistro).getTime() - new Date(a.fechaRegistro).getTime());
        this.historialRecetas = result;
    }

    combinarDispensas() {
        const organizacionNombre = this.recetaPrincipal.organizacion?.nombre;
        let anteriorDispensada = false;
        this.listadoDispensas = (this.recetaPrincipal.estadosDispensa || [])
            .map(rec => {
                let esDuplicada = false;
                if (anteriorDispensada && rec.tipo === 'dispensada') {
                    esDuplicada = true;
                }
                anteriorDispensada = rec.tipo === 'dispensada';

                let detalleMedicamento = '';
                let organizacionDispensa = organizacionNombre;

                if (this.recetaPrincipal.dispensa && this.recetaPrincipal.dispensa.length) {
                    const dispCoincidente = this.recetaPrincipal.dispensa.find(d => {
                        if (rec.idDispensaApp && d.idDispensaApp) {
                            return d.idDispensaApp === rec.idDispensaApp;
                        }
                        return moment(d.fecha).isSame(moment(rec.fecha), 'day');
                    }) || (rec.tipo === 'dispensada' ? this.recetaPrincipal.dispensa[0] : null);

                    if (dispCoincidente) {
                        if (dispCoincidente.organizacion?.nombre) {
                            organizacionDispensa = dispCoincidente.organizacion.nombre;
                        }

                        // 1. Medicamentos
                        if (dispCoincidente.medicamentos?.length) {
                            detalleMedicamento = dispCoincidente.medicamentos.map(m => {
                                const nombre = m.medicamento?.nombre || m.descripcion || m.medicamento?.concepto?.term || '';
                                const cant = m.cantidadEnvases ?? m.cantidad ?? m.unidades;
                                const pres = m.presentacion ? ` ${m.presentacion}` : '';
                                const cantStr = cant !== null && cant !== undefined ? ` - ${cant}${pres}` : (pres ? ` - ${pres}` : '');
                                return `${nombre}${cantStr}`.trim();
                            }).filter(Boolean).join(', ');
                        }

                        // 2. Insumos / Nutricion / Alimentacion
                        if (!detalleMedicamento && dispCoincidente.insumos?.length) {
                            detalleMedicamento = dispCoincidente.insumos.map(i => {
                                const nombre = i.insumo?.nombre || i.descripcion || '';
                                const cant = i.cantidadEnvases ?? i.cantidad ?? i.unidades;
                                const pres = i.presentacion ? ` ${i.presentacion}` : '';
                                const cantStr = cant !== null && cant !== undefined ? ` - ${cant}${pres}` : (pres ? ` - ${pres}` : '');
                                return `${nombre}${cantStr}`.trim();
                            }).filter(Boolean).join(', ');
                        }

                        // 3. Magistral o descripción general
                        if (!detalleMedicamento) {
                            if (typeof dispCoincidente.magistral === 'string') {
                                detalleMedicamento = dispCoincidente.magistral;
                            } else if (dispCoincidente.magistral?.nombre || dispCoincidente.magistral?.descripcion) {
                                detalleMedicamento = dispCoincidente.magistral?.nombre || dispCoincidente.magistral?.descripcion;
                            } else if (dispCoincidente.descripcion) {
                                detalleMedicamento = dispCoincidente.descripcion;
                            }
                        }
                    }
                }

                // Fallbacks if not present in dispensa items
                if (!detalleMedicamento && rec.tipo === 'dispensada') {
                    if (this.recetaPrincipal.medicamento?.esMagistral || this.recetaPrincipal.medicamento?.tipoReceta === 'magistral') {
                        detalleMedicamento = this.recetaPrincipal.medicamento?.concepto?.term || this.recetaPrincipal.medicamento?.nombre || 'Preparado Magistral';
                    } else if (this.recetaPrincipal.insumo) {
                        const cant = this.recetaPrincipal.insumo.cantidad;
                        const cantStr = cant ? ` - ${cant} unidad(es)` : '';
                        detalleMedicamento = `${this.recetaPrincipal.insumo.nombre || ''}${cantStr}`.trim();
                    } else if (this.recetaPrincipal.medicamento) {
                        const cant = this.recetaPrincipal.medicamento.cantEnvases ?? this.recetaPrincipal.medicamento.cantidad;
                        const cantStr = cant ? ` - ${cant}` : '';
                        detalleMedicamento = `${this.recetaPrincipal.medicamento.concepto?.term || this.recetaPrincipal.medicamento.nombre || ''}${cantStr}`.trim();
                    }
                }

                return {
                    fecha: rec.fecha,
                    tipo: rec.tipo,
                    organizacion: organizacionDispensa || 'Sin especificar',
                    sistema: rec.sistema || 'Sin especificar',
                    dispensaDuplicada: esDuplicada,
                    cancelada: rec.cancelada ?? false,
                    detalleMedicamento: detalleMedicamento || '-'
                };
            });

        for (let i = 1; i < this.listadoDispensas.length; i++) {
            const actual = this.listadoDispensas[i];

            if (actual.cancelada && actual.cancelada !== false) {
                this.listadoDispensas[i - 1].cancelada = actual.cancelada;
                this.listadoDispensas[i - 1].fechaCancelada = actual.fecha;
                this.listadoDispensas.splice(i, 1);
            }
        }
        return this.listadoDispensas.shift();
    }

    get esInsumo(): boolean {
        return !!(this.recetaPrincipal?.insumo || this.recetaPrincipal?.esInsumo || this.recetaPrincipal?.medicamento?.tipoReceta === 'insumo');
    }

    get labelColumnaDispensa(): string {
        return this.esInsumo ? 'INSUMO DISPENSADO' : 'MEDICAMENTO DISPENSADO';
    }

    get tituloSeccionHistorial(): string {
        return this.esInsumo ? 'Registro de insumos' : 'Registro del medicamento';
    }

    checkDispensaAnticipada(receta) {
        if (receta?.estadoDispensaActual?.tipo && receta.estadoDispensaActual.tipo !== 'sin-dispensa' && receta.estadoDispensaActual.fecha) {
            const fechaDispensa = moment(receta.estadoDispensaActual.fecha);
            const fechaRegistro = moment(receta.fechaRegistro);
            if (fechaDispensa.isBefore(fechaRegistro)) {
                if (receta.estadoActual?.tipo === 'finalizada') {
                    return 'dispensa anticipada';
                } else if (receta.estadoActual?.tipo === 'pendiente') {
                    return 'dispensa parcial anticipada';
                }
            }
        }
        return null;
    }

}
