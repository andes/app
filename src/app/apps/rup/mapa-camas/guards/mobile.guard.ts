import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { ActivatedRoute, CanActivate, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { MapaCamasService } from '../services/mapa-camas.service';

@Injectable()
export class MapaCamaMobileGuard implements CanActivate {
    constructor(
        private router: Router,
        private active: ActivatedRoute,
        private mapaCamaService: MapaCamasService,
        private location: Location
    ) { }

    canActivate() {
        // Prevención momentanea para el F5
        return this.mapaCamaService.selectedCama.pipe(
            map(cama => {
                if (cama.id) {
                    return true;
                } else {
                    const url = this.location.path();
                    const parts = url.split('/');
                    if (parts.length === 5) {
                        this.router.navigate([parts[1], parts[2], parts[3]]);
                        return false;
                    } else {
                        return true;
                    }
                }
            })
        );
    }
}
