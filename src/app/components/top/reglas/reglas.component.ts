import { ProfesionalService } from './../../../services/profesional.service';
import { Component, Output, EventEmitter, HostBinding } from '@angular/core';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { ReglaService } from '../../../services/top/reglas.service';

@Component({
    selector: 'reglas',
    templateUrl: './reglas.component.html',
    styleUrls: ['./reglas.component.css']
})
export class ReglasComponent {
    @HostBinding('class.plex-layout') layout = true;
    organizacionDestino = this.auth.organizacion;
    prestacionDestino;
    prestacionOrigen;
    reglas: any = [];
    prestaciones = [];
    auditable = false;
    reglaActiva = -1;
    regla: any = {};
    prestacionActiva = -1;
    prestacion = {};
    organizacion;
    reglasIniciales: any = []; // reglas antes de de hacer cualquier modificación

    constructor(
        private auth: Auth,
        private plex: Plex,
        private servicioProfesional: ProfesionalService,
        private servicioReglas: ReglaService
    ) { }

    @Output() cancel: EventEmitter<any> = new EventEmitter<any>();

    loadProfesionales(event) {
        if (event.query) {
            const query = {
                nombreCompleto: event.query
            };
            this.servicioProfesional.get(query).subscribe(event.callback);
        } else {
            event.callback([]);
        }
    }


    cargarReglas() {
        const query: any = {};
        this.reglasIniciales = [];
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

    addOrganizacion() {
        if (this.organizacion && this.prestacionDestino) {
            if (this.reglas.some(r => r.origen.organizacion.id === this.organizacion.id)) {
                this.plex.info('warning', 'La organización ya fue seleccionada');
                this.organizacion = null;
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
                        nombre: this.organizacion.nombre,
                        id: this.organizacion.id
                    },
                };
                this.reglas.push({
                    destino: destino,
                    origen: origen
                });
                this.activarRegla(longitud);
                this.organizacion = null;
            }
        } else {
            const mensaje = this.prestacionDestino ? 'Debe seleccionar la organización de origen' : 'Debe seleccionar la prestación destino';
            this.plex.info('info', mensaje);
        }
    }

    deleteOrganizacion(indice) {
        this.reglas.splice(indice, 1);
        this.reglaActiva = -1;
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

    deletePrestacion(indice) {
        this.regla.origen.prestaciones.splice(indice, 1);
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

    limpiarForm() {
        this.reglas = [];
        this.reglaActiva = -1;
        this.regla = {};
    }

    cancelar() {
        this.cancel.emit();
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
}
