import { Plex } from '@andes/plex';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HeaderPacienteComponent } from 'src/app/components/paciente/headerPaciente.component';
import { PacienteService } from 'src/app/core/mpi/services/paciente.service';
import { PrestacionesService } from '../../../../../modules/rup/services/prestaciones.service';
import { PlanIndicacionesEventosServices } from '../../services/plan-indicaciones-eventos.service';
import { PlanIndicacionesServices } from '../../services/plan-indicaciones.service';
import { InternacionResumenHTTP } from '../../services/resumen-internacion.http';

@Component({
    selector: 'in-plan-indicacion',
    templateUrl: './plan-indicaciones.component.html',
    styles: [`
        .pointer {
            cursor: pointer;
        }

        .selected {
            border: 2px solid #5bc0de;
        }

        .punto {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            display: block;
        }

        .punto.realizado {
            background-color: #638e2a;
        }

        .punto.no-realizado {
            background-color: #ac2d1e;
        }

        .punto.incompleto {
            background-color: #c9bd2c;
        }


    `]
})
export class PlanIndicacionesComponent implements OnInit {
    private capa: string;
    private ambito: string;
    private idInternacion: string;

    public fecha = new Date();

    public horas = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5];
    public indicaciones = [];
    public selectedIndicacion = {};
    private selectedBuffer = new BehaviorSubject({});



    private botones$ = this.selectedBuffer.pipe(
        map(selected => {
            const indicaciones = Object.keys(selected).filter(k => selected[k]).map(k => this.indicaciones.find(i => i.id === k));
            return indicaciones;
        })
    );

    public detener$ = this.botones$.pipe(
        map(indicaciones => {
            const b = indicaciones.length > 0 && indicaciones.every(ind => ind.estado.tipo === 'activo' || ind.estado.tipo === 'pausado');
            return b;
        })
    );

    public continuar$ = this.botones$.pipe(
        map(indicaciones => indicaciones.length > 0 && indicaciones.every(ind => ind.estado.tipo === 'pausado'))
    );

    public pausar$ = this.botones$.pipe(
        map(indicaciones => indicaciones.length > 0 && indicaciones.every(ind => ind.estado.tipo === 'activo'))
    );


    eventos = {};

    indicacionView = null;

    indicacionEventoSelected = null;
    horaSelected: Date;

    constructor(
        private prestacionService: PrestacionesService,
        private route: ActivatedRoute,
        private resumenInternacionService: InternacionResumenHTTP,
        private pacienteService: PacienteService,
        private plex: Plex,
        private planIndicacionesServices: PlanIndicacionesServices,
        private indicacionEventosService: PlanIndicacionesEventosServices
    ) { }


    ngOnInit() {
        this.capa = this.route.snapshot.paramMap.get('capa');
        this.ambito = this.route.snapshot.paramMap.get('ambito');
        this.idInternacion = this.route.snapshot.paramMap.get('idInternacion');

        this.getInternacion().subscribe((resumen) => {
            this.pacienteService.getById(resumen.paciente.id).subscribe(paciente => {
                this.plex.setNavbarItem(HeaderPacienteComponent, { paciente });
            });
            this.actualizar();

        });
    }

    actualizar() {
        forkJoin([
            this.planIndicacionesServices.search({
                internacion: this.idInternacion,
                fechaInicio: `<${moment(this.fecha).endOf('day').format()}`
            }),
            this.indicacionEventosService.search({
                internacion: this.idInternacion,
                fecha: this.indicacionEventosService.queryDateParams(
                    moment(this.fecha).startOf('day').add(6, 'h').toDate(),
                    moment(this.fecha).startOf('day').add(6 + 24, 'h').toDate(),
                    false
                )
            })
        ]).subscribe(([datos, eventos]) => {
            const fecha = moment(this.fecha).endOf('day').toDate();
            this.indicaciones = datos
                .filter(ind => !ind.fechaBaja || moment(fecha).startOf('day').isBefore(ind.fechaBaja))
                .map(ind => {
                    const estado = ind.estados.sort((a, b) => a.fecha.getTime() - b.fecha.getTime()).reduce(
                        (acc, current) => {
                            if (!acc) { return current; }
                            if (current.fecha.getTime() < fecha.getTime()) {
                                return current;
                            }
                            return acc;
                        },
                        null
                    );
                    return {
                        ...ind,
                        estado
                    };
                });

            const eventosMap = {};
            eventos.forEach(evento => {
                eventosMap[evento.idIndicacion] = eventosMap[evento.idIndicacion] || {};
                const hora = moment(evento.fecha).hour();
                eventosMap[evento.idIndicacion][hora] = evento;
            });

            this.eventos = eventosMap;
        });
    }


    getInternacion(): Observable<any> {
        if (this.capa === 'estadistica') {
            return this.prestacionService.getById(this.idInternacion).pipe(
                map(prestacion => {
                    return {
                        paciente: prestacion.paciente,
                        fechaIngreso: prestacion.ejecucion.registros[0]?.valor.informeIngreso.fechaIngreso,
                        fechaEgreso: prestacion.ejecucion.registros[1]?.valor.InformeEgreso.fechaEgreso,
                    };
                })
            );
        } else {
            return this.resumenInternacionService.get(this.idInternacion);
        }
    }

    onSelectedChange() {
        this.selectedBuffer.next(this.selectedIndicacion);
    }

    onDateChange() {
        this.actualizar();
        this.selectedIndicacion = {};
        this.onSelectedChange();
    }

    cambiarEstado(estado: string) {
        const indicaciones = Object.keys(this.selectedIndicacion).filter(k => this.selectedIndicacion[k]).map(k => this.indicaciones.find(i => i.id === k));
        const estadoParams = {
            tipo: estado,
            fecha: new Date()
        };
        const datos = indicaciones.map(ind => this.planIndicacionesServices.updateEstado(ind.id, estadoParams));
        forkJoin(
            datos
        ).subscribe(() => {
            this.actualizar();
            this.plex.toast('success', 'Indicaciones actualizadas');
        });
    }

    onPausarClick() {
        this.cambiarEstado('pausado');
    }

    onDetenerClick() {
        this.cambiarEstado('suspendido');
    }

    onContinuarClick() {
        this.cambiarEstado('activo');
    }

    onSelectIndicacion(indicacion) {
        if (!this.indicacionView || this.indicacionView.id !== indicacion.id) {
            this.indicacionView = indicacion;
        } else {
            this.indicacionView = null;
        }
    }


    onIndicacionesCellClick(indicacion, hora) {
        this.indicacionEventoSelected = indicacion;
        this.horaSelected = hora;
    }

    onEventos(debeActualizar: boolean) {
        this.indicacionEventoSelected = null;
        this.horaSelected = null;
        if (debeActualizar) {
            this.actualizar();
        }
    }
}
