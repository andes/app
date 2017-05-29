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
        class: 'error'
    },
    'pausada': {
        nombre: 'Pausada',
        class: 'warning'
    }
};

export function getEstados() {
    let arrEstados = Object.keys(EstadosAgenda);
    // arrEstados = arrEstados.slice(arrEstados.length / 2);
    let salida = arrEstados.map(elem => { return { 'id': elem, 'nombre': EstadosAgenda[elem].nombre }; } );
    return salida;
}
