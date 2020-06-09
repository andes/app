import { Injectable } from '@angular/core';
import { PacienteHttpService } from '../services/pacienteHttp.service';
import { map, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';

export interface PacienteEscaneado {
    documento: string;
    apellido: string;
    nombre: string;
    sexo: string;
    fechaNacimiento: Date;
    scan: string;
}

@Injectable()
export class PacienteBuscarService {
    constructor(private pacienteHttp: PacienteHttpService) { }

    /**
     * Controla que el texto ingresado corresponda a un documento válido, controlando todas las expresiones regulares
     *
     * @returns {DocumentoEscaneado} Devuelve el documento encontrado
     */
    public comprobarDocumentoEscaneado(textoLibre: string): PacienteEscaneado {
        for (let key in DocumentoEscaneados) {
            if (DocumentoEscaneados[key].regEx.test(textoLibre)) {
                // Loggea el documento escaneado para análisis
                // this.logService.post('mpi', 'scan', { data: textoLibre }).subscribe(() => { });
                return this.parseDocumentoEscaneado(textoLibre, DocumentoEscaneados[key]);
            }
        }
        // if (textoLibre.length > 30) {
        // this.logService.post('mpi', 'scanFail', { data: textoLibre }).subscribe(() => { });
        // }
        return null;
    }

    /**
     * Parsea el texto libre en un objeto paciente
     *
     * @param {DocumentoEscaneado} documento documento escaneado
     * @returns {*} Datos del paciente
     */
    public parseDocumentoEscaneado(textoLibre: string, documento: DocumentoEscaneado): PacienteEscaneado {
        let datos = textoLibre.match(documento.regEx);
        let sexo = '';
        if (documento.grupoSexo > 0) {
            sexo = (datos[documento.grupoSexo].toUpperCase() === 'F') ? 'femenino' : 'masculino';
        }

        let fechaNacimiento = null;
        if (documento.grupoFechaNacimiento > 0) {
            fechaNacimiento = moment(datos[documento.grupoFechaNacimiento], 'DD/MM/YYYY').format('YYYY-MM-DD').toString();
        }

        return {
            documento: datos[documento.grupoNumeroDocumento].replace(/\D/g, ''),
            apellido: datos[documento.grupoApellido],
            nombre: datos[documento.grupoNombre],
            sexo: sexo,
            fechaNacimiento: fechaNacimiento,
            scan: textoLibre
        };
    }


    public findByScan(pacienteEscaneado: PacienteEscaneado) {
        const textoLibre = pacienteEscaneado.scan;
        // 1. Busca por documento escaneado (simplequery)
        return this.pacienteHttp.get({
            apellido: pacienteEscaneado.apellido,
            nombre: pacienteEscaneado.nombre,
            documento: pacienteEscaneado.documento,
            sexo: pacienteEscaneado.sexo,
            activo: true
        }).pipe(
            map(resultado => {
                return resultado.length ? { escaneado: true, pacientes: resultado, err: null } : null;
            }),
            mergeMap((resultado: any) => {
                // 1.2. Si encuentra el paciente (un matcheo al 100%) finaliza la búsqueda
                if (resultado) { return of(resultado); }

                // 1.3. Si no encontró el paciente escaneado, busca uno similar
                return this.pacienteHttp.match({
                    type: 'suggest',
                    apellido: pacienteEscaneado.apellido,
                    nombre: pacienteEscaneado.nombre,
                    documento: pacienteEscaneado.documento,
                    sexo: pacienteEscaneado.sexo,
                    fechaNacimiento: pacienteEscaneado.fechaNacimiento
                }).pipe(
                    map(resultadoSuggest => {
                        // 1.3.1. Si no encontró ninguno, retorna un array vacio
                        if (!resultadoSuggest.length) {
                            return { pacientes: [], err: null };
                        }
                        // 1.3.2. Busca a uno con el mismo código de barras
                        let candidato = resultadoSuggest.find(paciente => paciente.scan && paciente.scan === textoLibre);
                        if (candidato) {
                            return { escaneado: true, pacientes: [candidato], err: null };
                        } else {
                            // 1.3.3. Busca uno con un porcentaje alto de matcheo
                            if (resultadoSuggest[0]._score >= 0.94) {
                                if (resultadoSuggest[0].estado === 'validado') {
                                    return { pacientes: [resultadoSuggest[0]], err: null };
                                } else {
                                    // Si es un paciente temporal, actualizamos con los datos del DNI escaneado
                                    const pacienteActualizado: any = { ...resultadoSuggest[0] };
                                    return { pacientes: [pacienteActualizado], err: null };
                                }
                            } else {
                                // Si el matcheo es bajo, retorna un array vacio (No se encontró el paciente)
                                return { pacientes: [], err: null };
                            }
                        }
                    })
                );
            })
        );

    }

}

export interface DocumentoEscaneado {
    regEx: RegExp;
    grupoNumeroDocumento: number;
    grupoApellido: number;
    grupoNombre: number;
    grupoSexo: number;
    grupoFechaNacimiento: number;
}

export const DocumentoEscaneados: DocumentoEscaneado[] = [
    // DNI Argentino primera versión
    // Formato: @14157955    @A@1@GUTIERREZ@ROBERTO DANIEL@ARGENTINA@31/05/1960@M@01/11/2011@00079064950@7055 @01/11/2026@421@0@ILR:2.20 C:110927.01 (GM/EXE-MOVE-HM)@UNIDAD #02 || S/N: 0040>2008>>0006
    {
        regEx: /@([MF]*[A-Z0-9]+)\s*@[A-Z]+@[0-9]+@([a-zA-ZñÑáéíóúÁÉÍÓÚÜü'\-\s]+)@([a-zA-ZñÑáéíóúÁÉÍÓÚÜü'\-\s]+)@[A-Z]+@([0-9]{2}\/[0-9]{2}\/[0-9]{4})@([MF])@/i,
        grupoNumeroDocumento: 1,
        grupoApellido: 2,
        grupoNombre: 3,
        grupoSexo: 5,
        grupoFechaNacimiento: 4
    },
    // DNI Argentino segunda y tercera versión
    // Formato: 00327345190@GARCIA@JUAN FRANCISCO@M@23680640@A@25/08/1979@06/01/2015@209
    // Formato: 00125559991@PENA SAN JUAN@ORLANDA YUDITH@F@28765457@A@17/01/1944@28/12/2012
    {
        regEx: /[0-9]+@([a-zA-ZñÑáéíóúÁÉÍÓÚÜü'\-\s]+)@([a-zA-ZñÑáéíóúÁÉÍÓÚÜü'\-\s]+)@([MF])@([MF]*[0-9]+)@[A-Z]@([0-9]{2}\/[0-9]{2}\/[0-9]{4})(.*)/i,
        grupoNumeroDocumento: 4,
        grupoApellido: 1,
        grupoNombre: 2,
        grupoSexo: 3,
        grupoFechaNacimiento: 5
    },

    // QR ACTA DE NACIMIENTO
    // Formato: INOSTROZA, Ramiro Daniel DNI: 54852844Tomo: 5Folio: 88Acta: 507Año: 2015Formato de archivo de imágen no reconocido
    {
        regEx: /([a-zA-ZñÑáéíóúÁÉÍÓÚÜü'\-\s]+),([a-zA-ZñÑáéíóúÁÉÍÓÚÜü'\-\s]+)([DNI: ]{5})([0-9]+)(.*)/i,
        grupoNumeroDocumento: 4,
        grupoApellido: 1,
        grupoNombre: 2,
        grupoSexo: 0,
        grupoFechaNacimiento: 0
    }
];
