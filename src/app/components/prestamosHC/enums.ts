import { IEnum } from './../../utils/enums';

export let EstadosDevolucionCarpetas: IEnum = {
    'normal': {
        nombre: 'Normal',
        class: 'success'
    },
    'enMalEstado': {
        nombre: 'En mal estado',
        class: 'warning'
    },
    'fueraDeTermino': {
        nombre: 'Fuera de término',
        class: 'warning'
    },
    'documentacionFaltante': {
        nombre: 'Hojas o documentación faltante',
        class: 'warning'
    }
};
