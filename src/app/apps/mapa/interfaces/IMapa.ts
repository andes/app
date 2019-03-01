export interface IMapa {

    status?: {
        mpi?: boolean,
        citas?: boolean,
        mobile?: boolean,
        rup?: boolean,
        top?: boolean
    };

    coordenadas?: {
        longitud: number;
        latitud: number;
    };

    nombreCorto?: string;
    lng: number;
    lat: number;
    label?: string;
    draggable: boolean;
    infofiltro?: string;
    iconColorMarker?: string;
}
