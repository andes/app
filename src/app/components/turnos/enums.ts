import { IEnum } from './../../utils/enums';


export let EstadosAgenda: IEnum = {
    'planificacion': {
        nombre: 'En planificación',
        class: 'default'
    },
    'disponible': {
        nombre: 'Disponible',
        class: 'success'
    },
    'publicada': {
        nombre: 'Publicada',
        class: 'success'
    },
    'suspendida': {
        nombre: 'Suspendida',
        class: 'danger'
    },
    'pausada': {
        nombre: 'Pausada',
        class: 'warning'
    }
};


export let EstadosAsistencia: IEnum = {
    'asistio': {
        nombre: 'Asistio',
        class: 'success'
    },
    'noAsistio': {
        nombre: 'No Asistio',
        class: 'danger'
    },
    'sinDatos': {
        nombre: 'Sin Datos',
        class: 'warning'
    }
};
