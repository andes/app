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
import { MENSAJES } from '../mock-data/mock-mensajes';
import { Mensaje } from '../modelos/mensaje';
import { Organizacion } from '../modelos/organizacion';
import { ORGANIZACIONES } from '../mock-data/mock-organizaciones';
import { DOCUMENTOS } from '../mock-data/mock-documentos';
import { Documento } from '../modelos/documento';
import { SOLICITUDES } from '../mock-data/mock-solicitudes';
import { Solicitud } from '../modelos/solicitud';
import { REGISTROS } from '../mock-data/mock-registros';
import { Registro } from '../modelos/registro';

@Injectable()

export class PrestacionService {

    private previousUrl: string;
    private currentUrl: string;

    // Recupero ultima URL
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
            }
        });
    }

    // Navego a ultima URL
    goTo(path: string[]) {
        this.router.navigate(path);
    }

    actualizarValor(sidebarValue: number) {
        this.valorInicial.next(sidebarValue);
    }

    // Limpio los ruteos auxiliares
    resetOutlet() {
        this.router.navigate(['portal-paciente', {
            outlets: {
                // detalle: null,
                detalleHuds: null,
                detalleVacuna: null,
                detalleTurno: null,
                detalleFamiliar: null,
                detallePrescripcion: null,
                detalleLaboratorio: null,
                detalleProblema: null,
                detalleProfesional: null,
                detalleMensaje: null,
            }
        }]);
    }

    // Modelos y mock-data

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

    getMensajes(): Observable<Mensaje[]> {
        return of(MENSAJES);
    }

    getMensaje(id: number | string) {
        return this.getMensajes().pipe(
            map((mensajes: Mensaje[]) => mensajes.find(mensaje => mensaje.id === +id))
        );
    }

    getOrganizaciones(): Observable<Organizacion[]> {
        return of(ORGANIZACIONES);
    }

    getOrganizacion(id: number | string) {
        return this.getOrganizaciones().pipe(
            map((organizaciones: Organizacion[]) => organizaciones.find(organizacion => organizacion.id === +id))
        );
    }

    getDocumentos(): Observable<Documento[]> {
        return of(DOCUMENTOS);
    }

    getDocumento(id: number | string) {
        return this.getDocumentos().pipe(
            map((documentos: Documento[]) => documentos.find(documento => documento.id === +id))
        );
    }

    getSolicitudes(): Observable<Solicitud[]> {
        return of(SOLICITUDES);
    }

    getSolicitud(id: number | string) {
        return this.getSolicitudes().pipe(
            map((solicitudes: Solicitud[]) => solicitudes.find(solicitud => solicitud.id === +id))
        );
    }

    getRegistros(): Observable<Registro[]> {
        return of(REGISTROS);
    }

    getRegistro(id: number | string) {
        return this.getRegistros().pipe(
            map((registros: Registro[]) => registros.find(registro => registro.id === +id))
        );
    }

    registros: [
        {
            id: 123,
            evolucion: 'Tensión arterial dentro de los valores de referencia. T.A baja: 96, alta: 125 mmHg.',
            valor: '96/125 mmHg',
            esDiagnosticoPrincipal: true,
            semanticTag: 'trastorno',
            icono: 'trastorno',
            color: 'danger',
            term: 'Hipertensión Arterial',
            fecha: '27/01/2021',
            estado: true,
        },
        {
            id: 123,
            evolucion: 'El paciente se presenta con dolor agudo en la zona del abdomen',
            valor: '37,5º',
            esDiagnosticoPrincipal: true,
            semanticTag: 'trastorno',
            icono: 'trastorno',
            color: 'danger',
            term: 'lesión traumática del abdomen',
            fecha: '27/01/2021',
            estado: true,
        },
        {
            id: 123,
            evolucion: 'El paciente presenta signos y síntomas frecuentes de la alergia a la penicilina: urticaria, sarpullido y picazón',
            valor: '125 mm',
            esDiagnosticoPrincipal: true,
            semanticTag: 'hallazgo',
            icono: 'lupa-ojo',
            color: 'warning',
            term: 'Alergia A Penicilina',
            fecha: '11/09/2020',
            estado: false,
        },
        {
            id: 123,
            evolucion: 'Tensión arterial dentro de los valores de referencia',
            valor: '96/125 mmHg',
            esDiagnosticoPrincipal: true,
            semanticTag: 'elemento de registro',
            icono: 'documento-lapiz',
            color: 'success',
            term: 'documento adjunto',
            fecha: '27/01/2021',
            estado: false,
        },
        {
            id: 123,
            evolucion: 'Temperatura de 37,5. T.A baja: 96, alta: 125 mmHg. Saturación: 96%. Peso: 75 Kg. Talla: 185 cms.',
            valor: '96 kgs.',
            esDiagnosticoPrincipal: true,
            semanticTag: 'procedimiento',
            icono: 'termometro',
            color: 'info',
            term: 'Registro de signos vitales',
            fecha: '27/01/2021',
            estado: true,
        },
        {
            id: 123,
            evolucion: 'paciente refiere disnea que se intensifica con el esfuerzo. Presencia de sibilancias autoescuchadas durante la noche. Tos, No presenta historia de alergias. Antecedentes familiar de Asma. Durante los ultimos dias presenta fiebre que no cede 38º. Mucosidad serosa',
            valor: '38º',
            esDiagnosticoPrincipal: true,
            semanticTag: 'hallazgo',
            icono: 'lupa-ojo',
            color: 'warning',
            term: 'Antecedente familiar de asma',
            fecha: '17/11/2021',
            estado: false,
        },
        {
            id: 123,
            evolucion: 'El paciente se encuentra apto para desarrollar actividad física.',
            valor: '96 kgs.',
            esDiagnosticoPrincipal: true,
            semanticTag: 'elemento de registro',
            icono: 'documento-lapiz',
            color: 'success',
            term: 'certificado médico',
            fecha: '27/01/2021',
            estado: false,
        },
    ];
}
