import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ReglaService } from 'src/app/services/top/reglas.service';

@Component({
    selector: 'reglas',
    templateUrl: './reglas.component.html',
    styleUrls: ['reglas.scss'],
})

export class ReglasComponent implements OnInit {
    constructor(
        private plex: Plex,
        private auth: Auth,
        private servicioReglas: ReglaService
    ) { }

    organizacionDestino;
    organizacionOrigen;
    tipoPrestacion;
    prestacionDestino;
    prestacionOrigen;
    reglas;
    regla;
    reglaActiva = -1;
    reglasIniciales = [];
    prestacionActiva = -1;
    prestacion = {};
    prestaciones = [];
    auditable = false;

    @Output() volver = new EventEmitter<any>();

    ngOnInit() {
        this.plex.updateTitle('TOP | Nueva solicitud de entrada');
        this.organizacionDestino = this.auth.organizacion;
    }

    limpiarForm() {
        this.reglas = [];
        this.reglaActiva = -1;
        this.regla = {};
    }

    cargarReglas() {
        const query: any = {};
        this.limpiarForm();
        query.organizacionDestino = this.organizacionDestino.id;
        if (this.prestacionDestino && this.prestacionDestino.conceptId) {
            query.prestacionDestino = this.prestacionDestino.conceptId;
            this.servicioReglas.get(query).subscribe((reglas: any) => {
                this.reglas = reglas.filter(r => !r.pacs); // Hasta tener ABM pacs
                this.reglasIniciales = reglas.filter(r => !r.pacs);
            });
        }
    }

    activarRegla(indice) {
        this.reglaActiva = indice;
        this.regla = this.reglas[indice];
    }

    reglaCorrecta() {
        return this.reglas?.every(regla => regla.destino?.organizacion && regla.destino?.prestacion);
    }

    activarPrestacion(indice) {
        this.prestacionActiva = indice;
        this.prestacion = (this.regla as any).origen.prestaciones[indice];
    }

    addOrganizacion() {
        if (this.organizacionOrigen && this.prestacionDestino) {
            if (this.reglas.some(r => r.origen.organizacion.id === this.organizacionOrigen.id)) {
                this.plex.info('warning', 'La organización ya fue seleccionada');
                this.organizacionOrigen = null;
            } else {
                const longitud = this.reglas.length;
                const destino = {
                    organizacion: {
                        nombre: this.organizacionDestino.nombre,
                        id: this.organizacionDestino.id
                    },
                    prestacion: this.prestacionDestino
                };
                const origen = {
                    organizacion: {
                        nombre: this.organizacionOrigen.nombre,
                        id: this.organizacionOrigen.id
                    },
                };
                this.reglas.push({
                    destino: destino,
                    origen: origen
                });
                this.activarRegla(longitud);
                this.organizacionOrigen = null;
            }
        } else {
            const mensaje = this.prestacionDestino ? 'Debe seleccionar la organización de origen' : 'Debe seleccionar la prestación destino';
            this.plex.info('info', mensaje);
        }
    }

    deleteOrganizacion(indice: number, event: Event) {
        event.stopPropagation();
        const regla = this.reglas[indice];
        const id = regla.id || (regla._id && (regla._id.$oid || regla._id));

        if (!id) {
            this.plex.toast('danger', 'No se pudo obtener el ID de la regla.');
            return;
        }
        this.plex.confirm('¿Está seguro de que desea eliminar esta regla?', 'Atención').then((respuesta) => {
            if (respuesta) {
                this.servicioReglas.deleteById(id).subscribe({
                    next: (respuestaServidor) => {
                        this.reglas.splice(indice, 1);
                        this.plex.toast('success', 'La regla se eliminó correctamente.');
                        if (this.reglaActiva === indice) {
                            this.reglaActiva = -1;
                            this.regla = null;
                        } else if (this.reglaActiva > indice) {
                            this.reglaActiva--;
                        }
                    },
                    error: () => {
                        this.plex.toast('danger', 'Error al eliminar la regla.');
                    }
                });
            }
        });
    }
    addPrestacion() {
        this.prestaciones = [];

        if (this.regla.origen.prestaciones) {
            this.prestaciones = this.regla.origen.prestaciones;
        }
        this.auditable = this.regla.origen.auditable;

        if (this.prestacionOrigen) {
            if (this.regla.origen.prestaciones && this.regla.origen.prestaciones.some(p => p.prestacion.conceptId === this.prestacionOrigen.conceptId)) {
                this.plex.info('warning', 'La prestación ya fue seleccionada');
                this.prestacionOrigen = null;
            } else {
                this.prestaciones.push({ prestacion: this.prestacionOrigen, auditable: this.auditable });
                this.regla.origen.prestaciones = this.prestaciones;
                this.prestacionOrigen = null;
            }
        } else {
            this.plex.info('info', 'Debe seleccionar la prestación origen');
        }
    }

    deletePrestacion(indice: number) {
        const prestacion = this.regla.origen.prestaciones[indice];
        const reglaId = this.regla._id || this.regla.id;
        const prestacionId = prestacion._id;

        if (!reglaId) { // prestación aún no guardada
            this.regla.origen.prestaciones.splice(indice, 1);
            this.plex.toast('success', 'Prestación eliminada correctamente.');
            return;
        }

        this.plex.confirm('¿Está seguro de que desea eliminar esta prestación?', 'Atención')
            .then((respuesta) => {
                if (respuesta) {
                    this.servicioReglas.deletePrestacion(reglaId, prestacionId).subscribe({
                        next: () => {
                            this.regla.origen.prestaciones.splice(indice, 1);
                            this.plex.toast('success', 'Prestación eliminada correctamente.');
                        },
                        error: () => {
                            this.plex.toast('danger', 'Error al eliminar la prestación.');
                        }
                    });
                }
            });
    }


    disabledSave() {
        return !this.regla?.origen?.organizacion.id || !this.regla?.origen?.prestaciones?.length;
    }

    preSave() {
        const reglasSinOrganizacion = this.reglasIniciales?.length && !this.reglas?.length; // si se borraron las organizaciones origen existentes anteriormente
        const reglasSinPrestacion = this.reglas?.some(regla => regla.origen.organizacion && !regla.origen.prestaciones?.length);
        let mensaje = '';
        if (reglasSinOrganizacion) {
            mensaje += 'Existen reglas sin organización origen. Si continúa serán eliminadas.';
        }
        if (reglasSinPrestacion) {
            mensaje += 'Existen reglas sin prestación origen. Si continúa serán eliminadas.';
        }
        if (reglasSinOrganizacion || reglasSinPrestacion) {
            this.plex.confirm(mensaje, '¿Desea continuar?').then(respuesta => {
                if (respuesta) {
                    this.reglas = this.reglas?.filter(regla => regla.origen.organizacion && regla.origen.prestaciones?.length);
                    this.save();
                } else {
                    return;
                }
            });
        } else {
            this.save();
        }
    }

    save() {
        if (this.reglas.length) {
            if (this.reglaCorrecta()) {
                const data = {
                    reglas: this.reglas
                };
                const operation = this.servicioReglas.save(data);
                operation.subscribe(() => {
                    this.plex.toast('success', 'Las reglas se guardaron correctamente');
                    this.limpiarForm();
                    this.prestacionDestino = {};
                });
            } else {
                this.plex.info('info', 'Debe completar los datos de las reglas');
            }
        } else {
            this.servicioReglas.delete({ prestacionDestino: this.prestacionDestino.conceptId, organizacionDestino: this.organizacionDestino.id }).subscribe((resu) => {
                this.plex.toast('success', 'Las reglas se actualizaron correctamente');
            });
        }
    }

    volverASolicitudes() {
        this.volver.emit();
    }

}
