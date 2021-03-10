import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { PrestacionService } from '../../../servicios/prestacion.service';
import { Prestacion } from '../../../modelos/prestacion';
import { Profesional } from '../../../modelos/profesional';

@Component({
    selector: 'app-detalle-profesional',
    templateUrl: './detalle-profesional.component.html',
})
export class DetalleProfesionalComponent implements OnInit {

    public selectedId;
    public equipo$;
    public prestaciones$;
    public listadoPrestacion: Prestacion[];
    prestacion$: Observable<Prestacion>;
    profesional$: Observable<Profesional>;

    constructor(
        private prestacionService: PrestacionService,
        private route: ActivatedRoute,
        private router: Router,
    ) { }


    registros = [
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
            id: 765,
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
            id: 356,
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
            id: 986,
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
            id: 743,
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
            id: 845,
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
            id: 175,
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

    ngOnInit() {
        this.equipo$ = this.prestacionService.getEquipo();

        // Mostrar detalle de prestacion
        this.profesional$ = this.route.paramMap.pipe(
            switchMap((params: ParamMap) =>
                this.prestacionService.getProfesional(params.get('id')))
        );
    }


}
