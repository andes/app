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
    },
    'pendienteAsistencia': {
        nombre: 'Pendiente Asistencia',
        class: 'warning'
    },
    'pendienteAuditoria': {
        nombre: 'Pendiente Auditoria',
        class: 'warning'
    },
    'auditada': {
        nombre: 'Auditada',
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

export let PrioridadesPrestacion: IEnum = {
    'no prioritario': {
        nombre: 'No Prioritario',
        class: 'success'
    },
    'urgencia': {
        nombre: 'Urgencia',
        class: 'danger'
    },
    'emergencia': {
        nombre: 'Emergencia',
        class: 'warning'
    }

};

export let TiposDeTurnos: IEnum = {
    'delDia': {
        nombre: 'Del día',
        class: 'info'
    },
    'programado': {
        nombre: 'Programado',
        class: 'info'
    },
    'gestion': {
        nombre: 'De gestión',
        class: 'info'
    },
    'profesional': {
        nombre: 'Del profesional',
        class: 'info'
    }

};
