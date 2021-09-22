import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { HeaderPacienteComponent } from 'src/app/components/paciente/headerPaciente.component';
import { PacienteService } from 'src/app/core/mpi/services/paciente.service';
import { ElementosRUPService } from 'src/app/modules/rup/services/elementosRUP.service';
import { HUDSService } from 'src/app/modules/rup/services/huds.service';
import { PrestacionesService } from '../../../../../modules/rup/services/prestaciones.service';
import { PlanIndicacionesEventosServices } from '../../services/plan-indicaciones-eventos.service';
import { PlanIndicacionesServices } from '../../services/plan-indicaciones.service';
import { InternacionResumenHTTP } from '../../services/resumen-internacion.http';

@Component({
    selector: 'in-plan-indicacion',
    templateUrl: './plan-indicaciones.component.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: [
        '../../../../../modules/rup/components/core/_rup.scss',
        './plan-indicaciones.scss'
    ],
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

    private seccion = true;

    private internacion;
    private botones$ = this.selectedBuffer.pipe(
        map(selected => {
            const indicaciones = Object.keys(selected)
                .filter(k => selected[k])
                .map(k => this.indicaciones.find(i => i.id === k));
            return indicaciones;
        })
    );

    public detener$ = this.botones$.pipe(
        map(indicaciones => {
            const b = indicaciones.length > 0 && indicaciones.every(ind => ind.estado.tipo === 'active' || ind.estado.tipo === 'on-hold' || ind.estado.tipo === 'pending');
            return b;
        })
    );

    public continuar$ = this.botones$.pipe(
        map(indicaciones => indicaciones.length > 0 && indicaciones.every(ind => ind.estado.tipo === 'on-hold' || ind.estado.tipo === 'pending'))
    );

    public pausar$ = this.botones$.pipe(
        map(indicaciones => indicaciones.length > 0 && indicaciones.every(ind => ind.estado.tipo === 'active' || ind.estado.tipo === 'pending'))
    );

    public completar$ = this.botones$.pipe(
        map(indicaciones => indicaciones.length > 0 && indicaciones.every(ind => ind.estado.tipo === 'active' || ind.estado.tipo === 'pending'))
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
        private indicacionEventosService: PlanIndicacionesEventosServices,
        private hudsService: HUDSService,
        private router: Router,
        private auth: Auth,
        private elementoRUPService: ElementosRUPService
    ) { }


    ngOnInit() {
        this.capa = this.route.snapshot.paramMap.get('capa');
        this.ambito = this.route.snapshot.paramMap.get('ambito');
        this.idInternacion = this.route.snapshot.paramMap.get('idInternacion');

        this.getInternacion().subscribe((resumen) => {
            this.internacion = resumen;
            this.pacienteService.getById(resumen.paciente.id).subscribe(paciente => {
                this.plex.setNavbarItem(HeaderPacienteComponent, { paciente });
            });
            this.actualizar();

        });
    }

    actualizar() {
        forkJoin([
            this.planIndicacionesServices.getIndicaciones(this.idInternacion, this.fecha),
            this.indicacionEventosService.search({
                internacion: this.idInternacion,
                fecha: this.indicacionEventosService.queryDateParams(
                    moment(this.fecha).startOf('day').add(6, 'h').toDate(),
                    moment(this.fecha).startOf('day').add(6 + 24, 'h').toDate(),
                    false
                )
            })
        ]).subscribe(([datos, eventos]) => {
            this.indicaciones = datos;

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

    onClose() {
        this.indicacionView = null;
        this.indicacionEventoSelected = null;
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
        this.cambiarEstado('on-hold');
    }

    onDetenerClick() {
        this.cambiarEstado('cancelled');
    }

    onContinuarClick() {
        this.cambiarEstado('active');
    }

    onCompletarClick() {
        this.cambiarEstado('completed');
    }

    onSelectIndicacion(indicacion) {
        this.indicacionEventoSelected = null;
        if (!this.indicacionView || this.indicacionView.id !== indicacion.id) {
            this.indicacionView = indicacion;
        } else {
            this.indicacionView = null;
        }
    }


    onIndicacionesCellClick(indicacion, hora) {
        this.indicacionEventoSelected = indicacion;
        this.horaSelected = hora;
        this.indicacionView = null;
    }

    onEventos(debeActualizar: boolean) {
        this.indicacionEventoSelected = null;
        this.horaSelected = null;
        if (debeActualizar) {
            this.actualizar();
        }
    }


    onNuevaIndicacion() {
        const concepto = {
            'conceptId': '4981000013105',
            'term': 'plan de indicaciones médicas',
            'fsn': 'plan de indicaciones médicas (procedimiento)',
            'semanticTag': 'procedimiento'
        };

        this.crearPrestacion(this.internacion.paciente, concepto, new Date()).pipe(
            switchMap(prestacion => {
                return this.generarToken(prestacion.paciente, concepto, prestacion).pipe(
                    map(() => prestacion)
                );
            })
        ).subscribe((prestacion) => {
            this.prestacionService.notificaRuta({ nombre: 'Mapa de Camas', ruta: `/mapa-camas/${this.ambito}` });
            this.router.navigate(['rup/ejecucion', prestacion.id]);
        });

    }

    crearPrestacion(paciente, concepto, fecha: Date) {
        const nuevaPrestacion = this.prestacionService.inicializarPrestacion(
            paciente, concepto, 'ejecucion', this.ambito, fecha
        );
        nuevaPrestacion.trackId = this.idInternacion;
        // nuevaPrestacion.unidadOrganizativa = cama.unidadOrganizativa;
        return this.prestacionService.post(nuevaPrestacion);
    }

    generarToken(paciente, concepto, prestacion) {
        return this.hudsService.generateHudsToken(
            this.auth.usuario,
            this.auth.organizacion,
            paciente,
            concepto.term,
            this.auth.profesional,
            null,
            prestacion.id
        ).pipe(
            tap(hudsToken => window.sessionStorage.setItem('huds-token', hudsToken.token))
        );
    }
}
