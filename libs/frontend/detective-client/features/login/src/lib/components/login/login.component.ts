import { ActivatedRoute, Router } from '@angular/router';
import { LoginEmailValidation, LoginPasswordValidation } from '@detective.solutions/frontend/shared/utils';
import { filter, take } from 'rxjs';

import { AuthService } from '@detective.solutions/frontend/shared/auth';
import { Component } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  hidePassword = true;
  readonly loginForm = this.formBuilder.group({
    email: ['', LoginEmailValidation],
    password: ['', LoginPasswordValidation],
  });

  private readonly redirectUrl = this.route.snapshot.queryParams['redirectUrl'] ?? '';

  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly authService: AuthService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  login() {
    if (this.loginForm.valid) {
      this.authService
        .login(this.loginForm.value.email, this.loginForm.value.password)
        .pipe(
          take(1),
          filter((authStatus) => authStatus.isAuthenticated)
        )
        .subscribe(() => this.router.navigateByUrl(this.redirectUrl));
    } else {
      this.loginForm.markAsDirty();
    }
  }
}
