import { Injectable } from '@angular/core';
import { map, mergeMap } from 'rxjs/operators';
import { of, EMPTY } from 'rxjs';
import { PacienteService } from './paciente.service';

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
    private searchText;
    private skip = 0;
    private limit = 10;
    private scrollEnd = false;
    constructor(
        private pacienteService: PacienteService) { }

    /**
* Controla si se ingresó el caracter " en la primera parte del string, indicando que el scanner no está bien configurado
*
* @public
* @returns {boolean} Indica si está bien configurado
*/
    public controlarScanner(scan): boolean {
        if (scan) {
            let index = scan.indexOf('"');
            if (index >= 0 && index < 20 && scan.length > 5) {
                /* Agregamos el control que la longitud sea mayor a 5 para incrementar la tolerancia de comillas en el input */
                return false;
            }
        }
        return true;
    }


    /**
     * Controla que el texto ingresado corresponda a un documento válido, controlando todas las expresiones regulares
     *
     * @returns {DocumentoEscaneado} Devuelve el documento encontrado
     */
    public comprobarDocumentoEscaneado(textoLibre: string): PacienteEscaneado {
        for (let key in DocumentoEscaneados) {
            if (DocumentoEscaneados[key].regEx.test(textoLibre)) {
                // Loggea el documento escaneado para análisis
                return this.parseDocumentoEscaneado(textoLibre, DocumentoEscaneados[key]);
            }
        }
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
        return this.pacienteService.get({
            apellido: pacienteEscaneado.apellido,
            nombre: pacienteEscaneado.nombre,
            documento: pacienteEscaneado.documento,
            sexo: pacienteEscaneado.sexo,
            escaneado: true
        }).pipe(
            map(resultado => {
                return resultado.length ? { escaneado: true, pacientes: resultado, err: null } : null;
            }),
            mergeMap((resultado: any) => {
                // 1.2. Si encuentra el paciente (un matcheo al 100%) finaliza la búsqueda
                if (resultado) { return of(resultado); }

                // 1.3. Si no encontró el paciente escaneado, busca uno similar (suggest)
                return this.pacienteService.match({
                    apellido: pacienteEscaneado.apellido,
                    nombre: pacienteEscaneado.nombre,
                    documento: pacienteEscaneado.documento,
                    sexo: pacienteEscaneado.sexo,
                    fechaNacimiento: pacienteEscaneado.fechaNacimiento
                }).pipe(
                    map((resultadoSuggest: any) => {
                        // 1.3.1. Si no encontró ninguno, retorna un array vacio
                        if (!resultadoSuggest.length) {
                            return { pacientes: [], err: null };
                        }
                        // 1.3.2. Busca a uno con el mismo código de barras
                        let candidato = resultadoSuggest.find(elto => elto.paciente.scan && elto.paciente.scan === textoLibre);
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

    /**
     * Busca paciente cada vez que el campo de busqueda cambia su valor
     */
    public search(searchText: string, returnScannedPatient = false) {
        // Inicia búsqueda
        if (searchText) {
            this.searchText = searchText;
            this.skip = 0;
            this.scrollEnd = false;
            // Si matchea una expresión regular, busca inmediatamente el paciente
            let pacienteEscaneado = this.comprobarDocumentoEscaneado(searchText);
            if (pacienteEscaneado) {
                return this.findByScan(pacienteEscaneado).pipe(
                    map(resultadoPacientes => {
                        if (resultadoPacientes.pacientes.length) {
                            return resultadoPacientes;
                        } else {
                            // Si el paciente no fue encontrado ..
                            if (returnScannedPatient) {
                                // Ingresa a registro de pacientes ya que es escaneado
                                return { pacientes: [pacienteEscaneado], escaneado: true, scan: searchText, err: null };
                            } else {
                                return { pacientes: [], err: null };
                            }
                        }
                    })
                );
            } else {
                // Busca por texto libre
                return this.findByText();
            }
        }
    }

    /**
     * Busca paciente cada vez que el campo de busqueda cambia su valor
     */
    public findByText() {
        if (this.scrollEnd) {
            return EMPTY;
        }
        // Busca por texto libre
        return this.pacienteService.get({ search: this.searchText, limit: this.limit, skip: this.skip }).pipe(
            map((resultado: any) => {
                this.skip += resultado.length;
                // si vienen menos resultado que {{ limit }} significa que ya se cargaron todos
                if (!resultado.length || resultado.length < this.limit) {
                    this.scrollEnd = true;
                }
                return { pacientes: resultado, err: null };
            },
                err => { return { pacientes: [], err: err }; }
            ),
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
