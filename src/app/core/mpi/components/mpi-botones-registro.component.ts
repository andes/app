import { Component, Input } from '@angular/core';

@Component({
    selector: 'mpi-botones-registro',
    templateUrl: 'mpi-botones-registro.html',
    styleUrls: ['mpi-botones-registro.scss']
})
export class BotonesRegistroComponent {
    private toggler = false;
    @Input() disabled: boolean;
    routes = [
        { label: 'BEBÉ', route: '/apps/mpi/bebe' },
        { label: 'EXTRANJERO', route: '/apps/mpi/extranjero' },
        { label: 'CON DNI ARGENTINO', route: '/apps/mpi/paciente/con-dni' },
        { label: 'SIN DNI ARGENTINO', route: '/apps/mpi/paciente/sin-dni' },
    ];

    toggleMenu() {
        this.toggler = !this.toggler;
        return this.toggler;
    }
}

