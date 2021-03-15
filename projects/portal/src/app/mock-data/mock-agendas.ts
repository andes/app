import { Agenda } from '../modelos/agenda';

export const AGENDAS: Agenda[] = [
    {
        id: 1513,
        tipoPrestaciones: 'Exámen médico del adulto',
        // profesionales: IProfesional[],
        profesionales: [{
            id: '5u32402r',
            nombre: 'Carlos Daniel',
            apellido: 'Ventura'
        }],
        paciente: [{
            id: '2ebqd',
            nombre: 'Nombre completo',
            apellido: 'Apellido',
        }],
        turnos: [
            {
                horaInicio: '10:30 hs.',
                estado: 'en ejecución',
                asistencia: 'asististe',
                prestacion: 'Exámen médico del adulto',
                profesional: 'Molinari, Juan Martin',
                nota: 'Esta es una nota de prueba',
                procedencia: 'Autocitado',
                prioritario: true,
                paciente: 'Regueiro, María Ines',
                dni: 31350247,
                carpeta: '4953242',
                efector: 'Hospital Provincial Neuquén Dr. Eduardo Castro Rendón',
            },
        ],
        organizacion: {
            id: '56u532o',
            nombre: 'Hospital Provincial '
        },
        espacioFisico: {
            id: 'String',
            nombre: 'Box 11',
            servicio: {
                id: 'String',
                nombre: 'Unidad de Terapia Intensiva de Adultos'
            },
            sector: {
                id: 'String',
                nombre: 'Internación'
            },
        },
        otroEspacioFisico: 'Servicio de consultorios externos',
        fecha: '27/11/20',
        dia: 'VIERNES',
        horaInicio: '10:00',
        horaFin: '13:00',
        intercalar: true,
        bloques: [{
            id: 'sdad',
            horaInicio: 10,
            horaFin: 13,
            cantidadTurnos: 15,
            duracionTurno: 20,
            descripcion: 'Esta es una descripcion del bloque de turnos',
            tipoPrestaciones: 'Consulta domiciliaria',
            accesoDirectoDelDia: 12,
            accesoDirectoProgramado: 8,
            reservadoGestion: 4,
            reservadoProfesional: 2,
            restantesDelDia: 5,
            restantesProgramados: 3,
            restantesGestion: 1,
            restantesProfesional: 2,
            pacienteSimultaneos: true,
            cantidadSimultaneos: 8,
            citarPorBloque: false,
            cantidadBloque: 3,
            turnos: 25,
        }],
        estado: 'publicada',
        prePausada: '',
        sobreturnos: 'Sin sobreturnos',
        turnosDisponibles: 20,
        turnosRestantesDelDia: 12,
        turnosRestantesProgramados: 3,
        turnosRestantesGestion: 2,
        turnosRestantesProfesional: 3,
        estadosAgendas: 'disponible',
        nota: 'Esta es una nota de prueba de la agenda',
        nominalizada: true,
        dinamica: true,
        cupo: 20,
        avisos: [{
            profenionalId: '5i324wef',
            estado: 'String',
            fecha: '27/11/20'
        }],
    },
    {
        id: 1513,
        tipoPrestaciones: 'Exámen médico del adulto',
        // profesionales: IProfesional[],
        profesionales: [{
            id: '5u32402r',
            nombre: 'Carlos Daniel',
            apellido: 'Ventura'
        }],
        paciente: [{
            id: '2ebqd',
            nombre: 'Nombre completo',
            apellido: 'Apellido',
        }],
        turnos: [
            {
                horaInicio: '10:30 hs.',
                estado: 'en ejecución',
                asistencia: 'asistió',
                prestacion: 'Exámen médico del adulto',
                profesional: 'Molinari, Juan Martin',
                nota: 'Esta es una nota de prueba',
                procedencia: 'Autocitado',
                prioritario: true,
                paciente: 'Regueiro, María Ines',
                dni: 31350247,
                carpeta: '4953242',
                efector: 'Hospital Provincial Neuquén',
            },
        ],
        organizacion: {
            id: '56u532o',
            nombre: 'Hospital Provincial '
        },
        espacioFisico: {
            id: 'String',
            nombre: 'Box 11',
            servicio: {
                id: 'String',
                nombre: 'Unidad de Terapia Intensiva de Adultos'
            },
            sector: {
                id: 'String',
                nombre: 'Unidad de Terapia Intensiva de Adultos'
            },
        },
        otroEspacioFisico: 'Servicio de consultorios externos',
        fecha: '27/11/20',
        dia: 'VIERNES',
        horaInicio: '10:00',
        horaFin: '13:00',
        intercalar: true,
        bloques: [{
            id: 'sdad',
            horaInicio: 10,
            horaFin: 13,
            cantidadTurnos: 15,
            duracionTurno: 20,
            descripcion: 'Esta es una descripcion del bloque de turnos',
            tipoPrestaciones: 'Consulta domiciliaria',
            accesoDirectoDelDia: 12,
            accesoDirectoProgramado: 8,
            reservadoGestion: 4,
            reservadoProfesional: 2,
            restantesDelDia: 5,
            restantesProgramados: 3,
            restantesGestion: 1,
            restantesProfesional: 2,
            pacienteSimultaneos: true,
            cantidadSimultaneos: 8,
            citarPorBloque: false,
            cantidadBloque: 3,
            turnos: 25,
        }],
        estado: 'publicada',
        prePausada: '',
        sobreturnos: 'Sin sobreturnos',
        turnosDisponibles: 20,
        turnosRestantesDelDia: 12,
        turnosRestantesProgramados: 3,
        turnosRestantesGestion: 2,
        turnosRestantesProfesional: 3,
        estadosAgendas: 'disponible',
        nota: 'Esta es una nota de prueba de la agenda',
        nominalizada: true,
        dinamica: true,
        cupo: 20,
        avisos: [{
            profenionalId: '5i324wef',
            estado: 'String',
            fecha: '27/11/20'
        }],
    },
    {
        id: 1513,
        tipoPrestaciones: 'Exámen médico del adulto',
        // profesionales: IProfesional[],
        profesionales: [{
            id: '5u32402r',
            nombre: 'Carlos Daniel',
            apellido: 'Ventura'
        }],
        paciente: [{
            id: '2ebqd',
            nombre: 'Nombre completo',
            apellido: 'Apellido',
        }],
        turnos: [
            {
                horaInicio: '10:30 hs.',
                estado: 'en ejecución',
                asistencia: 'asistió',
                prestacion: 'Exámen médico del adulto',
                profesional: 'Molinari, Juan Martin',
                nota: 'Esta es una nota de prueba',
                procedencia: 'Autocitado',
                prioritario: true,
                paciente: 'Regueiro, María Ines',
                dni: 31350247,
                carpeta: '4953242',
                efector: 'Hospital Provincial Neuquén',
            },
        ],
        organizacion: {
            id: '56u532o',
            nombre: 'Hospital Provincial '
        },
        espacioFisico: {
            id: 'String',
            nombre: 'Box 11',
            servicio: {
                id: 'String',
                nombre: 'Unidad de Terapia Intensiva de Adultos'
            },
            sector: {
                id: 'String',
                nombre: 'Unidad de Terapia Intensiva de Adultos'
            },
        },
        otroEspacioFisico: 'Servicio de consultorios externos',
        fecha: '27/11/20',
        dia: 'VIERNES',
        horaInicio: '10:00',
        horaFin: '13:00',
        intercalar: true,
        bloques: [{
            id: 'sdad',
            horaInicio: 10,
            horaFin: 13,
            cantidadTurnos: 15,
            duracionTurno: 20,
            descripcion: 'Esta es una descripcion del bloque de turnos',
            tipoPrestaciones: 'Consulta domiciliaria',
            accesoDirectoDelDia: 12,
            accesoDirectoProgramado: 8,
            reservadoGestion: 4,
            reservadoProfesional: 2,
            restantesDelDia: 5,
            restantesProgramados: 3,
            restantesGestion: 1,
            restantesProfesional: 2,
            pacienteSimultaneos: true,
            cantidadSimultaneos: 8,
            citarPorBloque: false,
            cantidadBloque: 3,
            turnos: 25,
        }],
        estado: 'publicada',
        prePausada: '',
        sobreturnos: 'Sin sobreturnos',
        turnosDisponibles: 20,
        turnosRestantesDelDia: 12,
        turnosRestantesProgramados: 3,
        turnosRestantesGestion: 2,
        turnosRestantesProfesional: 3,
        estadosAgendas: 'disponible',
        nota: 'Esta es una nota de prueba de la agenda',
        nominalizada: true,
        dinamica: true,
        cupo: 20,
        avisos: [{
            profenionalId: '5i324wef',
            estado: 'String',
            fecha: '27/11/20'
        }],
    },
    {
        id: 1513,
        tipoPrestaciones: 'Exámen médico del adulto',
        // profesionales: IProfesional[],
        profesionales: [{
            id: '5u32402r',
            nombre: 'Carlos Daniel',
            apellido: 'Ventura'
        }],
        paciente: [{
            id: '2ebqd',
            nombre: 'Nombre completo',
            apellido: 'Apellido',
        }],
        turnos: [
            {
                horaInicio: '10:30 hs.',
                estado: 'en ejecución',
                asistencia: 'asistió',
                prestacion: 'Exámen médico del adulto',
                profesional: 'Molinari, Juan Martin',
                nota: 'Esta es una nota de prueba',
                procedencia: 'Autocitado',
                prioritario: true,
                paciente: 'Regueiro, María Ines',
                dni: 31350247,
                carpeta: '4953242',
                efector: 'Hospital Provincial Neuquén',
            },
        ],
        organizacion: {
            id: '56u532o',
            nombre: 'Hospital Provincial '
        },
        espacioFisico: {
            id: 'String',
            nombre: 'Box 11',
            servicio: {
                id: 'String',
                nombre: 'Unidad de Terapia Intensiva de Adultos'
            },
            sector: {
                id: 'String',
                nombre: 'Unidad de Terapia Intensiva de Adultos'
            },
        },
        otroEspacioFisico: 'Servicio de consultorios externos',
        fecha: '27/11/20',
        dia: 'VIERNES',
        horaInicio: '10:00',
        horaFin: '13:00',
        intercalar: true,
        bloques: [{
            id: 'sdad',
            horaInicio: 10,
            horaFin: 13,
            cantidadTurnos: 15,
            duracionTurno: 20,
            descripcion: 'Esta es una descripcion del bloque de turnos',
            tipoPrestaciones: 'Consulta domiciliaria',
            accesoDirectoDelDia: 12,
            accesoDirectoProgramado: 8,
            reservadoGestion: 4,
            reservadoProfesional: 2,
            restantesDelDia: 5,
            restantesProgramados: 3,
            restantesGestion: 1,
            restantesProfesional: 2,
            pacienteSimultaneos: true,
            cantidadSimultaneos: 8,
            citarPorBloque: false,
            cantidadBloque: 3,
            turnos: 25,
        }],
        estado: 'publicada',
        prePausada: '',
        sobreturnos: 'Sin sobreturnos',
        turnosDisponibles: 20,
        turnosRestantesDelDia: 12,
        turnosRestantesProgramados: 3,
        turnosRestantesGestion: 2,
        turnosRestantesProfesional: 3,
        estadosAgendas: 'disponible',
        nota: 'Esta es una nota de prueba de la agenda',
        nominalizada: true,
        dinamica: true,
        cupo: 20,
        avisos: [{
            profenionalId: '5i324wef',
            estado: 'String',
            fecha: '27/11/20'
        }],
    },
    {
        id: 1513,
        tipoPrestaciones: 'Exámen médico del adulto',
        // profesionales: IProfesional[],
        profesionales: [{
            id: '5u32402r',
            nombre: 'Carlos Daniel',
            apellido: 'Ventura'
        }],
        paciente: [{
            id: '2ebqd',
            nombre: 'Nombre completo',
            apellido: 'Apellido',
        }],
        turnos: [
            {
                horaInicio: '10:30 hs.',
                estado: 'en ejecución',
                asistencia: 'asistió',
                prestacion: 'Exámen médico del adulto',
                profesional: 'Molinari, Juan Martin',
                nota: 'Esta es una nota de prueba',
                procedencia: 'Autocitado',
                prioritario: true,
                paciente: 'Regueiro, María Ines',
                dni: 31350247,
                carpeta: '4953242',
                efector: 'Hospital Provincial Neuquén',
            },
        ],
        organizacion: {
            id: '56u532o',
            nombre: 'Hospital Provincial '
        },
        espacioFisico: {
            id: 'String',
            nombre: 'Box 11',
            servicio: {
                id: 'String',
                nombre: 'Unidad de Terapia Intensiva de Adultos'
            },
            sector: {
                id: 'String',
                nombre: 'Unidad de Terapia Intensiva de Adultos'
            },
        },
        otroEspacioFisico: 'Servicio de consultorios externos',
        fecha: '27/11/20',
        dia: 'VIERNES',
        horaInicio: '10:00',
        horaFin: '13:00',
        intercalar: true,
        bloques: [{
            id: 'sdad',
            horaInicio: 10,
            horaFin: 13,
            cantidadTurnos: 15,
            duracionTurno: 20,
            descripcion: 'Esta es una descripcion del bloque de turnos',
            tipoPrestaciones: 'Consulta domiciliaria',
            accesoDirectoDelDia: 12,
            accesoDirectoProgramado: 8,
            reservadoGestion: 4,
            reservadoProfesional: 2,
            restantesDelDia: 5,
            restantesProgramados: 3,
            restantesGestion: 1,
            restantesProfesional: 2,
            pacienteSimultaneos: true,
            cantidadSimultaneos: 8,
            citarPorBloque: false,
            cantidadBloque: 3,
            turnos: 25,
        }],
        estado: 'publicada',
        prePausada: '',
        sobreturnos: 'Sin sobreturnos',
        turnosDisponibles: 20,
        turnosRestantesDelDia: 12,
        turnosRestantesProgramados: 3,
        turnosRestantesGestion: 2,
        turnosRestantesProfesional: 3,
        estadosAgendas: 'disponible',
        nota: 'Esta es una nota de prueba de la agenda',
        nominalizada: true,
        dinamica: true,
        cupo: 20,
        avisos: [{
            profenionalId: '5i324wef',
            estado: 'String',
            fecha: '27/11/20'
        }],
    },
    {
        id: 1513,
        tipoPrestaciones: 'Exámen médico del adulto',
        // profesionales: IProfesional[],
        profesionales: [{
            id: '5u32402r',
            nombre: 'Carlos Daniel',
            apellido: 'Ventura'
        }],
        paciente: [{
            id: '2ebqd',
            nombre: 'Nombre completo',
            apellido: 'Apellido',
        }],
        turnos: [
            {
                horaInicio: '10:30 hs.',
                estado: 'en ejecución',
                asistencia: 'asistió',
                prestacion: 'Exámen médico del adulto',
                profesional: 'Molinari, Juan Martin',
                nota: 'Esta es una nota de prueba',
                procedencia: 'Autocitado',
                prioritario: true,
                paciente: 'Regueiro, María Ines',
                dni: 31350247,
                carpeta: '4953242',
                efector: 'Hospital Provincial Neuquén',
            },
        ],
        organizacion: {
            id: '56u532o',
            nombre: 'Hospital Provincial '
        },
        espacioFisico: {
            id: 'String',
            nombre: 'Box 11',
            servicio: {
                id: 'String',
                nombre: 'Unidad de Terapia Intensiva de Adultos'
            },
            sector: {
                id: 'String',
                nombre: 'Unidad de Terapia Intensiva de Adultos'
            },
        },
        otroEspacioFisico: 'Servicio de consultorios externos',
        fecha: '27/11/20',
        dia: 'VIERNES',
        horaInicio: '10:00',
        horaFin: '13:00',
        intercalar: true,
        bloques: [{
            id: 'sdad',
            horaInicio: 10,
            horaFin: 13,
            cantidadTurnos: 15,
            duracionTurno: 20,
            descripcion: 'Esta es una descripcion del bloque de turnos',
            tipoPrestaciones: 'Consulta domiciliaria',
            accesoDirectoDelDia: 12,
            accesoDirectoProgramado: 8,
            reservadoGestion: 4,
            reservadoProfesional: 2,
            restantesDelDia: 5,
            restantesProgramados: 3,
            restantesGestion: 1,
            restantesProfesional: 2,
            pacienteSimultaneos: true,
            cantidadSimultaneos: 8,
            citarPorBloque: false,
            cantidadBloque: 3,
            turnos: 25,
        }],
        estado: 'publicada',
        prePausada: '',
        sobreturnos: 'Sin sobreturnos',
        turnosDisponibles: 20,
        turnosRestantesDelDia: 12,
        turnosRestantesProgramados: 3,
        turnosRestantesGestion: 2,
        turnosRestantesProfesional: 3,
        estadosAgendas: 'disponible',
        nota: 'Esta es una nota de prueba de la agenda',
        nominalizada: true,
        dinamica: true,
        cupo: 20,
        avisos: [{
            profenionalId: '5i324wef',
            estado: 'String',
            fecha: '27/11/20'
        }],
    },
    {
        id: 1513,
        tipoPrestaciones: 'Exámen médico del adulto',
        // profesionales: IProfesional[],
        profesionales: [{
            id: '5u32402r',
            nombre: 'Carlos Daniel',
            apellido: 'Ventura'
        }],
        paciente: [{
            id: '2ebqd',
            nombre: 'Nombre completo',
            apellido: 'Apellido',
        }],
        turnos: [
            {
                horaInicio: '10:30 hs.',
                estado: 'en ejecución',
                asistencia: 'asistió',
                prestacion: 'Exámen médico del adulto',
                profesional: 'Molinari, Juan Martin',
                nota: 'Esta es una nota de prueba',
                procedencia: 'Autocitado',
                prioritario: true,
                paciente: 'Regueiro, María Ines',
                dni: 31350247,
                carpeta: '4953242',
                efector: 'Hospital Provincial Neuquén',
            },
        ],
        organizacion: {
            id: '56u532o',
            nombre: 'Hospital Provincial '
        },
        espacioFisico: {
            id: 'String',
            nombre: 'Box 11',
            servicio: {
                id: 'String',
                nombre: 'Unidad de Terapia Intensiva de Adultos'
            },
            sector: {
                id: 'String',
                nombre: 'Unidad de Terapia Intensiva de Adultos'
            },
        },
        otroEspacioFisico: 'Servicio de consultorios externos',
        fecha: '27/11/20',
        dia: 'VIERNES',
        horaInicio: '10:00',
        horaFin: '13:00',
        intercalar: true,
        bloques: [{
            id: 'sdad',
            horaInicio: 10,
            horaFin: 13,
            cantidadTurnos: 15,
            duracionTurno: 20,
            descripcion: 'Esta es una descripcion del bloque de turnos',
            tipoPrestaciones: 'Consulta domiciliaria',
            accesoDirectoDelDia: 12,
            accesoDirectoProgramado: 8,
            reservadoGestion: 4,
            reservadoProfesional: 2,
            restantesDelDia: 5,
            restantesProgramados: 3,
            restantesGestion: 1,
            restantesProfesional: 2,
            pacienteSimultaneos: true,
            cantidadSimultaneos: 8,
            citarPorBloque: false,
            cantidadBloque: 3,
            turnos: 25,
        }],
        estado: 'publicada',
        prePausada: '',
        sobreturnos: 'Sin sobreturnos',
        turnosDisponibles: 20,
        turnosRestantesDelDia: 12,
        turnosRestantesProgramados: 3,
        turnosRestantesGestion: 2,
        turnosRestantesProfesional: 3,
        estadosAgendas: 'disponible',
        nota: 'Esta es una nota de prueba de la agenda',
        nominalizada: true,
        dinamica: true,
        cupo: 20,
        avisos: [{
            profenionalId: '5i324wef',
            estado: 'String',
            fecha: '27/11/20'
        }],
    },
    {
        id: 1513,
        tipoPrestaciones: 'Exámen médico del adulto',
        // profesionales: IProfesional[],
        profesionales: [{
            id: '5u32402r',
            nombre: 'Carlos Daniel',
            apellido: 'Ventura'
        }],
        paciente: [{
            id: '2ebqd',
            nombre: 'Nombre completo',
            apellido: 'Apellido',
        }],
        turnos: [
            {
                horaInicio: '10:30 hs.',
                estado: 'en ejecución',
                asistencia: 'asistió',
                prestacion: 'Exámen médico del adulto',
                profesional: 'Molinari, Juan Martin',
                nota: 'Esta es una nota de prueba',
                procedencia: 'Autocitado',
                prioritario: true,
                paciente: 'Regueiro, María Ines',
                dni: 31350247,
                carpeta: '4953242',
                efector: 'Hospital Provincial Neuquén',
            },
        ],
        organizacion: {
            id: '56u532o',
            nombre: 'Hospital Provincial '
        },
        espacioFisico: {
            id: 'String',
            nombre: 'Box 11',
            servicio: {
                id: 'String',
                nombre: 'Unidad de Terapia Intensiva de Adultos'
            },
            sector: {
                id: 'String',
                nombre: 'Unidad de Terapia Intensiva de Adultos'
            },
        },
        otroEspacioFisico: 'Servicio de consultorios externos',
        fecha: '27/11/20',
        dia: 'VIERNES',
        horaInicio: '10:00',
        horaFin: '13:00',
        intercalar: true,
        bloques: [{
            id: 'sdad',
            horaInicio: 10,
            horaFin: 13,
            cantidadTurnos: 15,
            duracionTurno: 20,
            descripcion: 'Esta es una descripcion del bloque de turnos',
            tipoPrestaciones: 'Consulta domiciliaria',
            accesoDirectoDelDia: 12,
            accesoDirectoProgramado: 8,
            reservadoGestion: 4,
            reservadoProfesional: 2,
            restantesDelDia: 5,
            restantesProgramados: 3,
            restantesGestion: 1,
            restantesProfesional: 2,
            pacienteSimultaneos: true,
            cantidadSimultaneos: 8,
            citarPorBloque: false,
            cantidadBloque: 3,
            turnos: 25,
        }],
        estado: 'publicada',
        prePausada: '',
        sobreturnos: 'Sin sobreturnos',
        turnosDisponibles: 20,
        turnosRestantesDelDia: 12,
        turnosRestantesProgramados: 3,
        turnosRestantesGestion: 2,
        turnosRestantesProfesional: 3,
        estadosAgendas: 'disponible',
        nota: 'Esta es una nota de prueba de la agenda',
        nominalizada: true,
        dinamica: true,
        cupo: 20,
        avisos: [{
            profenionalId: '5i324wef',
            estado: 'String',
            fecha: '27/11/20'
        }],
    },
    {
        id: 1527,
        tipoPrestaciones: 'Exámen médico del adulto',
        profesionales: [{
            id: '5u32402r',
            nombre: 'Carlos Daniel',
            apellido: 'Ventura'
        }],
        paciente: [{
            id: '2ebqd',
            nombre: 'Nombre completo',
            apellido: 'Apellido',
        }],
        turnos: [{
            horaInicio: '10:30 hs.',
            estado: 'validada',
            asistencia: 'asistió',
            prestacion: 'Exámen médico del adulto',
            profesional: 'Molinari, Juan Martin',
            nota: 'string',
            procedencia: 'autocitado',
            prioritario: true,
            paciente: 'string',
            dni: 31350247,
            carpeta: '4953242',
            efector: 'Hospital Heller',
        },
        ],
        organizacion: {
            id: '56u532o',
            nombre: 'Hospital Provincial '
        },
        espacioFisico: {
            id: 'String',
            nombre: 'Box 11',
            servicio: {
                id: 'String',
                nombre: 'Unidad de Terapia Intensiva de Adultos'
            },
            sector: {
                id: 'String',
                nombre: 'Unidad de Terapia Intensiva de Adultos'
            },
        },
        otroEspacioFisico: 'Servicio de consultorios externos',
        fecha: '27/11/20',
        dia: 'VIERNES',
        horaInicio: '10:00',
        horaFin: '13:00',
        intercalar: true,
        bloques: [{
            id: 'sdad',
            horaInicio: 10,
            horaFin: 13,
            cantidadTurnos: 15,
            duracionTurno: 20,
            descripcion: 'Esta es una descripcion del bloque de turnos',
            tipoPrestaciones: 'Consulta domiciliaria',
            accesoDirectoDelDia: 12,
            accesoDirectoProgramado: 8,
            reservadoGestion: 4,
            reservadoProfesional: 2,
            restantesDelDia: 5,
            restantesProgramados: 3,
            restantesGestion: 1,
            restantesProfesional: 2,
            pacienteSimultaneos: true,
            cantidadSimultaneos: 8,
            citarPorBloque: false,
            cantidadBloque: 3,
            turnos: 25,
        }],
        estado: 'publicada',
        prePausada: '',
        sobreturnos: 'Sin sobreturnos',
        turnosDisponibles: 20, // Virtual
        turnosRestantesDelDia: 12, // Virtual
        turnosRestantesProgramados: 3, // Virtual
        turnosRestantesGestion: 2, // Virtual
        turnosRestantesProfesional: 3, // Virtual
        estadosAgendas: 'disponible',
        nota: 'Esta es una nota de prueba de la agenda',
        nominalizada: true,
        dinamica: true,
        cupo: 20,
        avisos: [{
            profenionalId: '5i324wef',
            estado: 'String',
            fecha: '27/11/20'
        }],
    }
];
