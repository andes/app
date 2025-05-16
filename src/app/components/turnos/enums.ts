import { IEnum } from './../../utils/enums';

export const EstadosAgenda: IEnum = {
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
        class: 'info'
    }
};

export const EstadosAgendaAuditoria: IEnum = {
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
        class: 'info'
    }
};

export const EstadosFueraAgenda: IEnum = {
    'pendienteAuditoria': {
        nombre: 'Pendiente Auditoria',
        class: 'warning'
    },
    'auditada': {
        nombre: 'Auditada',
        class: 'info'
    }
};

export const EstadosAsistencia: IEnum = {
    'asistio': {
        nombre: 'Asistió',
        class: 'success'
    },
    'noAsistio': {
        nombre: 'No Asistió',
        class: 'danger'
    },
    'sinDatos': {
        nombre: 'Sin Datos',
        class: 'warning'
    }
};

export const PrioridadesPrestacion: IEnum = {
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

export const TiposDeTurnos: IEnum = {
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
