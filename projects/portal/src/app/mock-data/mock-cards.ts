import { Card } from '../modelos/card';

export const CARDS: Card[] = [
    {
        id: 1,
        nombre: 'huds',
        tipo: 'info',
        semanticTag: 'solicitud',
        icono: 'historial',
        path: 'miHuds',
        color: '#0070cc',
        outlet: 'listado',
    },
    {
        id: 2,
        nombre: 'consultas',
        tipo: 'custom',
        semanticTag: 'solicitud',
        icono: 'mano-corazon',
        path: 'misConsultas',
        color: '#0070cc',
        outlet: 'listado',
    },
    {
        id: 3,
        nombre: 'problemas',
        tipo: 'custom',
        semanticTag: 'trastorno',
        icono: 'trastorno',
        path: 'misProblemas',
        color: '#ff4a1a',
        outlet: 'listado',
    },
    {
        id: 4,
        nombre: 'observaciones',
        tipo: 'custom',
        semanticTag: 'hallazgo',
        icono: 'lupa-ojo',
        path: 'misProblemas',
        color: '#f4a03b',
        outlet: 'listado',
    },
    {
        id: 5,
        nombre: 'prácticas',
        tipo: 'custom',
        semanticTag: 'procedimiento',
        icono: 'termometro',
        path: 'misLaboratorios',
        color: '#92278e',
        outlet: 'listado',
    },
    {
        id: 6,
        nombre: 'prescripciones',
        tipo: 'custom',
        semanticTag: 'producto',
        icono: 'pildoras',
        path: 'misPrescripciones',
        color: '#00bcb4',
        outlet: 'listado',
    },
    {
        id: 7,
        nombre: 'laboratorios',
        tipo: 'custom',
        semanticTag: 'laboratorio',
        icono: 'recipiente',
        path: 'misLaboratorios',
        color: '#a0a0a0',
        outlet: 'listado',
    },
    {
        id: 8,
        nombre: 'vacunas',
        tipo: 'custom',
        semanticTag: 'procedimiento',
        icono: 'vacuna',
        path: 'misVacunas',
        color: '#92278e',
        outlet: 'listado',
    },
    {
        id: 10,
        nombre: 'relaciones',
        tipo: 'info',
        semanticTag: 'solicitud',
        icono: 'familia',
        path: 'misFamiliares',
        color: '#0070cc',
        outlet: 'listado',
    },
    {
        id: 11,
        nombre: 'documentos',
        tipo: 'info',
        semanticTag: 'registro',
        icono: 'documento-cursor',
        path: 'misDocumentos',
        color: '#0070cc',
        outlet: 'listado',
    },
    {
        id: 12,
        nombre: 'turnos',
        tipo: 'info',
        semanticTag: 'solicitud',
        icono: 'turno-bold',
        path: 'misTurnos',
        color: '#0070cc',
        outlet: 'listado',
    },
    {
        id: 13,
        nombre: 'mensajes',
        tipo: 'info',
        semanticTag: 'otro',
        icono: 'mail',
        path: 'misMensajes',
        color: '#0070cc',
        outlet: 'listado',
    },
    {
        id: 14,
        nombre: 'organizaciones',
        tipo: 'info',
        semanticTag: 'solicitud',
        icono: 'hospital',
        path: 'misOrganizaciones',
        color: '#0070cc',
        outlet: 'listado',
    },
    {
        id: 9,
        nombre: 'equipo de salud',
        tipo: 'info',
        semanticTag: 'solicitud',
        icono: 'medico',
        path: 'miEquipo',
        color: '#0070cc',
        outlet: 'listado',
    },
    {
        id: 15,
        nombre: 'derivaciones',
        tipo: 'info',
        semanticTag: 'solicitud',
        icono: 'avion',
        path: 'misSolicitudes',
        color: '#0070cc',
        outlet: 'listado',
    },
];
