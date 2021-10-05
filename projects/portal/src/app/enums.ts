import { ICard } from './interfaces/icard';

export const CARDS: ICard[] = [
    {
        id: 0,
        titulo: 'inicio',
        subtitulo: '',
        tipo: '',
        semanticTag: '',
        icono: 'paciente-casa',
        path: 'mi-inicio',
        color: '#0070cc',
        outlet: '',
        inicio: false
    },
    {
        id: 1,
        titulo: 'mi cuenta',
        subtitulo: 'datos personales',
        tipo: '',
        semanticTag: '',
        icono: 'paciente',
        path: 'mis-datos-personales',
        color: '#0070cc',
        outlet: '',
        inicio: false
    },
    {
        id: 2,
        titulo: 'mis turnos',
        subtitulo: 'próximos, historial y obtención',
        tipo: 'info',
        semanticTag: 'solicitud',
        icono: 'turno-bold',
        path: 'mis-turnos',
        color: '#00a8e0',
        outlet: 'listado',
        inicio: true
    },
    {
        id: 3,
        titulo: 'mis vacunas',
        subtitulo: 'historial de vacunación',
        tipo: 'custom',
        semanticTag: 'procedimiento',
        icono: 'vacuna',
        path: 'mis-vacunas',
        color: '#aa1daa',
        outlet: 'listado',
        inicio: true
    },
    {
        id: 4,
        titulo: 'mis laboratorios',
        subtitulo: 'descarga de resultados',
        tipo: 'custom',
        semanticTag: 'laboratorio',
        icono: 'recipiente',
        path: 'mis-laboratorios',
        color: '#a0a0a0',
        outlet: 'listado',
        inicio: true
    },
    {
        id: 5,
        titulo: 'mis certificados',
        subtitulo: 'descarga de informes',
        tipo: 'info',
        semanticTag: 'registro',
        icono: 'documento-cursor',
        path: 'mis-certificados',
        color: '#8bc43f',
        outlet: 'listado',
        inicio: true
    },
    {
        id: 6,
        titulo: 'mis relaciones',
        subtitulo: 'permisos y cuentas delegadas',
        tipo: 'info',
        semanticTag: 'solicitud',
        icono: 'familia',
        path: 'mis-relaciones',
        color: '#027a8a',
        outlet: 'listado',
        inicio: true
    }
];
