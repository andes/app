/**
*
*
* @param {*} practica
* @returns
* @memberof TablaDatalleProtocoloComponent
*/
export function generateRegistroEjecucion(usuario, organizacion, practica) {
    let practicaEjecucion: any = {
        codigo: practica.codigo,
        destacado: false,
        esSolicitud: false,
        esDiagnosticoPrincipal: false,
        relacionadoCon: practica.requeridos.map((req) => { return req._id; }),
        nombre: practica.nombre,
        concepto: practica.concepto,
        valor: {
            idPractica: practica._id,
            nivel: practica.nivel,
            resultado: {
                valor: null,
                sinMuestra: false,
                validado: false
            },
            estados: [{
                tipo: 'pendiente',
                usuario: usuario,
                fecha: new Date()
            }],
            organizacionDestino: organizacion,
            practica: practica
        }
    };
    return practicaEjecucion;
}
