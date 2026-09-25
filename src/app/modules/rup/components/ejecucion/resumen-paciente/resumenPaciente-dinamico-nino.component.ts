import { Component, Input, OnInit } from '@angular/core';
import { IPaciente } from '../../../../../core/mpi/interfaces/IPaciente';
import { ResumenPacienteDinamicoService } from '../../../services/resumenPaciente-dinamico.service';
import { VacunasService } from '../../../../../services/vacunas.service';

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
    public opcionesSecciones = [
        { id: 'vacunas', nombre: 'Vacunas aplicadas' },
        { id: 'curvaPeso', nombre: 'Curva de peso' },
        { id: 'curvaTalla', nombre: 'Curva de talla' },
        { id: 'perimetroCefalico', nombre: 'Perímetro cefálico' },
        { id: 'registroVisitas', nombre: 'Registro de visitas' }
    ];
    public seccionSeleccionada;

    constructor(private servicioResumenPaciente: ResumenPacienteDinamicoService,
                private servicioVacunas: VacunasService) { }

    ngOnInit() {
        this.seccionSeleccionada = this.opcionesSecciones[0];
        this.loadPrestaciones();
        this.loadVacunas();
    }

    get mostrarCurva() {
        return this.seccionSeleccionada?.id === 'curvaPeso' ||
            this.seccionSeleccionada?.id === 'curvaTalla' ||
            this.seccionSeleccionada?.id === 'perimetroCefalico';
    }

    get curvaActual() {
        switch (this.seccionSeleccionada?.id) {
            case 'curvaPeso':
                return 1;
            case 'curvaTalla':
                return 2;
            case 'perimetroCefalico':
                return 3;
            default:
                return null;
        }
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
