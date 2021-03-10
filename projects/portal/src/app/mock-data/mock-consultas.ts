import { Prestacion } from '../modelos/prestacion';


export const PRESTACIONES: Prestacion[] = [
    {
        auditable: true,
        conceptId: '410620009',
        fsn: 'consulta domiciliaria (procedimiento)',
        id: 75434,
        profesional: 'Walter Juan Molini',
        organizacion: 'Hospital Provincial Neuquén',
        servicio: 'Unidad de Terapia Intermedia',
        sector: 'Consultorios externos',
        fecha: '07/04/2021',
        nombre: 'consulta domiciliaria',
        semanticTag: 'procedimiento',
        icono: 'mano-corazon',
        color: 'info',
        term: 'consulta domiciliaria',
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
        ],
    },
    {
        auditable: true,
        conceptId: '391000013108',
        fsn: 'consulta de medicina general',
        id: 645234,
        profesional: 'Walter Juan Molini',
        organizacion: 'Hospital Provincial Neuquén',
        servicio: 'Unidad de Terapia Intermedia',
        sector: 'Consultorios externos',
        fecha: '11/02/2021',
        nombre: 'consulta de medicina general',
        semanticTag: 'procedimiento',
        icono: 'mano-corazon',
        color: 'info',
        term: 'consulta de medicina general',
        registros: [
            {
                id: 123,
                evolucion: 'Tensión arterial dentro de los valores de referencia. T.A baja: 96, alta: 125 mmHg.',
                valor: '96/125 mmHg',
                esDiagnosticoPrincipal: true,
                semanticTag: 'trastorno',
                icono: 'trastorno',
                color: 'warning',
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
                color: 'warning',
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
            }
        ],
    },
    {
        auditable: true,
        conceptId: '389067005',
        fsn: 'procedimiento de salud comunitaria (procedimiento)',
        id: 988767,
        profesional: 'Walter Juan Molini',
        organizacion: 'Hospital Provincial Neuquén',
        servicio: 'Unidad de Terapia Intermedia',
        sector: 'Consultorios externos',
        fecha: '28/01/2021',
        noNominalizada: true,
        nombre: 'consulta general de medicina',
        semanticTag: 'procedimiento',
        icono: 'mano-corazon',
        color: 'info',
        term: 'consulta general de medicina',
        registros: [
            {
                id: 123,
                evolucion: 'Tensión arterial dentro de los valores de referencia. T.A baja: 96, alta: 125 mmHg.',
                valor: '96/125 mmHg',
                esDiagnosticoPrincipal: true,
                semanticTag: 'trastorno',
                icono: 'trastorno',
                color: 'warning',
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
                color: 'warning',
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
            }
        ],
    },
    {
        auditable: true,
        conceptId: '1191000013107',
        fsn: 'consulta de control de embarazo (procedimiento)',
        id: 325543,
        profesional: 'Walter Juan Molini',
        organizacion: 'Hospital Provincial Neuquén',
        servicio: 'Unidad de Terapia Intermedia',
        sector: 'Consultorios externos',
        fecha: '27/01/2021',
        nombre: 'consulta de control de embarazo',
        semanticTag: 'procedimiento',
        icono: 'mano-corazon',
        color: 'info',
        term: 'consulta de control de embarazo ',
        registros: [
            {
                id: 123,
                evolucion: 'Tensión arterial dentro de los valores de referencia. T.A baja: 96, alta: 125 mmHg.',
                valor: '96/125 mmHg',
                esDiagnosticoPrincipal: true,
                semanticTag: 'trastorno',
                icono: 'trastorno',
                color: 'warning',
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
                color: 'warning',
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
            }
        ],
    },
    {
        auditable: true,
        conceptId: '439708006',
        fsn: 'visita domiciliaria (procedimiento)',
        id: 432434,
        profesional: 'Walter Juan Molini',
        organizacion: 'Hospital Provincial Neuquén',
        servicio: 'Unidad de Terapia Intermedia',
        sector: 'Consultorios externos',
        fecha: '25/01/2021',
        nombre: 'visita domiciliaria',
        semanticTag: 'procedimiento',
        icono: 'mano-corazon',
        color: 'info',
        term: 'visita domiciliaria',
        registros: [
            {
                id: 123,
                evolucion: 'Tensión arterial dentro de los valores de referencia. T.A baja: 96, alta: 125 mmHg.',
                valor: '96/125 mmHg',
                esDiagnosticoPrincipal: true,
                semanticTag: 'trastorno',
                icono: 'trastorno',
                color: 'warning',
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
                color: 'warning',
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
            }
        ],
    },
    {
        auditable: true,
        conceptId: '308397003',
        fsn: 'procedimiento de convocatoria de pacientes (procedimiento)',
        id: 876321,
        profesional: 'Walter Juan Molini',
        organizacion: 'Hospital Provincial Neuquén',
        servicio: 'Unidad de Terapia Intermedia',
        sector: 'Consultorios externos',
        fecha: '17/09/2020',
        nombre: 'procedimiento de convocatoria de pacientes',
        semanticTag: 'procedimiento',
        icono: 'mano-corazon',
        color: 'info',
        term: 'procedimiento de convocatoria de pacientes',
        registros: [
            {
                id: 123,
                evolucion: 'Tensión arterial dentro de los valores de referencia. T.A baja: 96, alta: 125 mmHg.',
                valor: '96/125 mmHg',
                esDiagnosticoPrincipal: true,
                semanticTag: 'trastorno',
                icono: 'trastorno',
                color: 'warning',
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
                color: 'warning',
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
            }
        ],
    },
    {
        auditable: true,
        conceptId: '4041000013100',
        fsn: 'consulta en area rural (procedimiento)',
        id: 198765,
        profesional: 'Walter Juan Molini',
        organizacion: 'Hospital Provincial Neuquén',
        servicio: 'Unidad de Terapia Intermedia',
        sector: 'Consultorios externos',
        fecha: '07/05/2020',
        nombre: 'consulta en area rural',
        semanticTag: 'procedimiento',
        icono: 'mano-corazon',
        color: 'info',
        term: 'consulta en area rural',
        registros: [
            {
                id: 123,
                evolucion: 'Tensión arterial dentro de los valores de referencia. T.A baja: 96, alta: 125 mmHg.',
                valor: '96/125 mmHg',
                esDiagnosticoPrincipal: true,
                semanticTag: 'trastorno',
                icono: 'trastorno',
                color: 'warning',
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
                color: 'warning',
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
            }
        ],
    },
    {
        auditable: true,
        conceptId: '5281000013103',
        fsn: 'consejería en salud integral del adolescente (procedimiento)',
        id: 987542,
        profesional: 'Walter Juan Molini',
        organizacion: 'Hospital Provincial Neuquén',
        servicio: 'Unidad de Terapia Intermedia',
        sector: 'Consultorios externos',
        fecha: '11/03/2020',
        nombre: 'consejería en salud integral del adolescente',
        semanticTag: 'procedimiento',
        icono: 'mano-corazon',
        color: 'info',
        term: 'consejería en salud integral del adolescente',
        registros: [
            {
                id: 123,
                evolucion: 'Tensión arterial dentro de los valores de referencia. T.A baja: 96, alta: 125 mmHg.',
                valor: '96/125 mmHg',
                esDiagnosticoPrincipal: true,
                semanticTag: 'trastorno',
                icono: 'trastorno',
                color: 'warning',
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
                color: 'warning',
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
            }
        ],
    },
    {
        auditable: true,
        conceptId: '5301000013104',
        fsn: 'actividades de promoción de la salud del adolescente (procedimiento)',
        id: 235466,
        profesional: 'Walter Juan Molini',
        organizacion: 'Hospital Provincial Neuquén',
        servicio: 'Unidad de Terapia Intermedia',
        sector: 'Consultorios externos',
        fecha: '03/12/2019',
        noNominalizada: true,
        nombre: 'actividades de promoción de la salud del adolescente',
        semanticTag: 'procedimiento',
        icono: 'mano-corazon',
        color: 'info',
        term: 'actividades de promoción de la salud del adolescente',
        registros: [
            {
                id: 123,
                evolucion: 'Tensión arterial dentro de los valores de referencia. T.A baja: 96, alta: 125 mmHg.',
                valor: '96/125 mmHg',
                esDiagnosticoPrincipal: true,
                semanticTag: 'trastorno',
                icono: 'trastorno',
                color: 'warning',
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
                color: 'warning',
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
            }
        ],
    }
];
