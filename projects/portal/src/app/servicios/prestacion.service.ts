import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router, NavigationEnd } from '@angular/router';

import { Prestacion } from '../modelos/prestacion';
import { HUDS } from '../mock-data/mock-huds';
import { PRESTACIONES } from '../mock-data/mock-consultas';
import { Vacuna } from '../modelos/vacuna';
import { VACUNAS } from '../mock-data/mock-vacunas';
import { Turno } from '../modelos/turno';
import { TURNOS } from '../mock-data/mock-turnos';
import { Laboratorio } from '../modelos/laboratorio';
import { LABORATORIOS } from '../mock-data/mock-laboratorios';
import { Familiar } from '../modelos/familiar';
import { FAMILIARES } from '../mock-data/mock-familiares';
import { Prescripcion } from '../modelos/prescripcion';
import { PRESCRIPCIONES } from '../mock-data/mock-prescripciones';
import { Huds } from '../modelos/huds';
import { Problema } from '../modelos/problema';
import { PROBLEMAS } from '../mock-data/mock-problemas';
import { Profesional } from '../modelos/profesional';
import { PROFESIONALES } from '../mock-data/mock-equipo';

@Injectable()

export class PrestacionService {

    private previousUrl: string;
    private currentUrl: string;

    public getPreviousUrl() {
        return this.previousUrl;
    }

    private valorInicial = new BehaviorSubject<number>(9);
    valorActual = this.valorInicial.asObservable();

    constructor(private router: Router) {
        this.currentUrl = this.router.url;
        router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                this.previousUrl = this.currentUrl;
                this.currentUrl = event.url;
            };
        });
    }

    actualizarValor(sidebarValue: number) {
        this.valorInicial.next(sidebarValue)
    }

    getHuds(): Observable<Huds[]> {
        return of(HUDS);
    }

    getHud(id: number | string) {
        return this.getHuds().pipe(
            map((prestaciones: Huds[]) => prestaciones.find(prestacion => prestacion.id === +id))
        );
    }

    getConsultas(): Observable<Prestacion[]> {
        return of(PRESTACIONES);
    }

    getConsulta(id: number | string) {
        return this.getConsultas().pipe(
            map((prestaciones: Prestacion[]) => prestaciones.find(prestacion => prestacion.id === +id))
        );
    }

    getVacunas(): Observable<Vacuna[]> {
        return of(VACUNAS);
    }

    getVacuna(id: number | string) {
        return this.getVacunas().pipe(
            map((vacunas: Vacuna[]) => vacunas.find(vacuna => vacuna.id === +id))
        );
    }

    getFamiliares(): Observable<Familiar[]> {
        return of(FAMILIARES);
    }

    getFamiliar(id: number | string) {
        return this.getFamiliares().pipe(
            map((familiares: Familiar[]) => familiares.find(familiar => familiar.id === +id))
        );
    }

    getLaboratorios(): Observable<Laboratorio[]> {
        return of(LABORATORIOS);
    }

    getLaboratorio(id: number | string) {
        return this.getLaboratorios().pipe(
            map((laboratorios: Laboratorio[]) => laboratorios.find(laboratorio => laboratorio.id === +id))
        );
    }

    getTurnos(): Observable<Turno[]> {
        return of(TURNOS);
    }

    getTurno(id: number | string) {
        return this.getTurnos().pipe(
            map((turnos: Turno[]) => turnos.find(turno => turno.id === +id))
        );
    }

    getPrescripciones(): Observable<Prescripcion[]> {
        return of(PRESCRIPCIONES);
    }

    getPrescripcion(id: number | string) {
        return this.getPrescripciones().pipe(
            map((prescripciones: Prescripcion[]) => prescripciones.find(prescripcion => prescripcion.id === +id))
        );
    }

    getProblemas(): Observable<Problema[]> {
        return of(PROBLEMAS);
    }

    getProblema(id: number | string) {
        return this.getProblemas().pipe(
            map((problemas: Problema[]) => problemas.find(problema => problema.id === +id))
        );
    }

    getEquipo(): Observable<Profesional[]> {
        return of(PROFESIONALES);
    }

    getProfesional(id: number | string) {
        return this.getEquipo().pipe(
            map((equipo: Profesional[]) => equipo.find(profesional => profesional.id === +id))
        );
    }


    // Limpio los ruteos auxiliares
    resetOutlet() {
        this.router.navigate(['portal-paciente', {
            outlets: {
                detalle: null,
                detalleHuds: null,
                detalleVacuna: null,
                detalleTurno: null,
                detalleFamiliar: null,
                detalleLaboratorio: null,
                detalleProblema: null,
            }
        }]);
    }

    goto(path: string[]) {
        console.log(path);
        this.router.navigate(path);
    }

}
