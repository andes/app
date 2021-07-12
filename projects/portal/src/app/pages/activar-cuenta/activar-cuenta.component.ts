import { Component, OnInit } from '@angular/core';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';
import { Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { map, catchError } from 'rxjs/operators';

@Component({
  selector: 'pdp-activar-cuenta',
  templateUrl: './activar-cuenta.component.html',
  styleUrls: ['./activar-cuenta.component.scss']
})
export class ActivarCuentaComponent implements OnInit {
  email: string;
  password: string;
  new_password: string;
  confirm_password: string;
  public loading = false;
  public formRegistro: any;
  constructor(private plex: Plex, private auth: Auth, private route: ActivatedRoute, private formBuilder: FormBuilder, private router: Router) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.email = params.email;
      this.password = params.password;

      this.formRegistro = this.formBuilder.group({
        new_password: ['', Validators.required],
        confirm_password: ['', Validators.required],
      });
    });
  }

  activarUsuario() {
    if (this.formRegistro.controls.new_password.value !== this.formRegistro.controls.confirm_password.value) {
      this.plex.info('warning', 'Las contraseñas no coinciden');
    } else {
      this.new_password = this.formRegistro.controls.new_password.value;
      this.auth.mobileLogin(this.email, this.password, this.new_password).pipe(
        catchError(err => {
          this.loading = false;
          this.plex.info('warning', err.error);
          return null;
        }),
        map(() => this.router.navigate(['/mis-familiares']))
      ).subscribe();
    }
  }

}
