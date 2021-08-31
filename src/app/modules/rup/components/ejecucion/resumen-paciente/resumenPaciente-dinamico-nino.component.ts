import { Component, Input, OnInit, HostBinding } from '@angular/core';
import { Plex } from '@andes/plex';
import { IPaciente } from '../../../../../core/mpi/interfaces/IPaciente';
import { ResumenPacienteDinamicoService } from '../../../services/resumenPaciente-dinamico.service';
import { VacunasService } from '../../../../../services/vacunas.service';
import { PrestacionesService } from '../../../services/prestaciones.service';
import { ElementosRUPService } from '../../../services/elementosRUP.service';

@Component({
    selector: 'rup-resumenPaciente-dinamico-nino',
    templateUrl: 'resumenPaciente-dinamico-nino.html'
})

export class ResumenPacienteDinamicoNinoComponent implements OnInit {
    @Input() paciente: IPaciente;
    private tablaModelo = []; // modelo de tabla a imprimir, con titulos e idConcepts ordenados como se deberia mostrar. No modificar.
    public tabla = []; // tabla que finalmente va a mostrar la informacion. Se utiliza el formato de la tabla modelo para confeccionarla.
    public prestaciones: any = [];
    public vacunas = [];
    public registro = null;

    constructor(private servicioResumenPaciente: ResumenPacienteDinamicoService,
                private servicioVacunas: VacunasService,
                private prestacionesService: PrestacionesService,
                public elementosRUPService: ElementosRUPService,
                private plex: Plex) { }

    ngOnInit() {
        this.loadPrestaciones();
        this.loadVacunas();
        this.loadResumen();
    }
    // carga el resumen de historia clinica
    loadResumen() {
        this.prestacionesService.getRegistrosHuds(this.paciente.id, '6035001').subscribe(prestaciones => {
            if (prestaciones && prestaciones.length) {
                prestaciones.sort((a, b) => {
                    const dateA = new Date(a.fecha).getTime();
                    const dateB = new Date(b.fecha).getTime();
                    return dateA > dateB ? 1 : -1;
                });
                this.registro = prestaciones[prestaciones.length - 1].registro;
            }
        });
    }

    loadVacunas() {
        this.servicioVacunas.get(this.paciente.id).subscribe(resultado => {
            this.vacunas = resultado;
        });
    }

    loadPrestaciones() {
        this.servicioResumenPaciente.get(this.paciente.id).subscribe(resultado => {
            // se ordenan las prestaciones encontradas de mayor a menor segun fecha (Mas actuales primero)
            resultado.sort((a, b) => {
                const dateA = new Date(a.fecha).getTime();
                const dateB = new Date(b.fecha).getTime();
                return dateA < dateB ? 1 : -1;
            });
            /* Existe la posibilidad de encontrar prestaciones repetidas, por eso se generaa un array auxiliar solo con la
                prestacion mas actualde cada una. Es decir, la primera aparicion de cada prestacion
                (Ya que primero son ordenadas por fecha en forma decreciente). */
            const prestacionesAux = [];
            resultado.forEach(unaPrestacion => {
                if (!prestacionesAux.find(p => p.motivo.conceptId === unaPrestacion.motivo.conceptId)) {
                    prestacionesAux.push(unaPrestacion);
                }
            });
            this.prestaciones = prestacionesAux;
            this.crearTabla();
        });

    }

    crearTabla() {
        // Por cada prestacion cargamos los datos que se van a mostrar en la tabla, siendo cada prestacion una fila.
        this.prestaciones.forEach(prestacion => {
            const filaTabla = [];
            // se carga la fecha
            filaTabla.push({ tiulo: 'Fecha', valor: moment(prestacion.fecha).format('DD/MM/YYYY') });
            // se carga la edad
            filaTabla.push({ titulo: 'Edad', valor: prestacion.motivo.term });
            // recorremos las columnas de la tabla modelo para armar la nueva tabla con la informacion en el mismo orden
            let unValor;
            prestacion.conceptos.forEach(unConcepto => {
                unValor = null;
                if (unConcepto.contenido) { // Si en la consulta el concepto fue completado, el campo valor tendrá contenido
                    const conceptoValor = unConcepto.contenido.valor;
                    unValor = Array.isArray(conceptoValor) && conceptoValor.length > 0 ? conceptoValor.filter(e => e.checkbox || e.checked).map(e => e.concepto.term).join(', ') : conceptoValor;
                }
                if (!unValor) {
                    unValor = 'S/D';
                }
                filaTabla.push({ titulo: unConcepto.titulo, valor: unValor });
            });
            this.tabla.push(filaTabla);
        });
    }
}
