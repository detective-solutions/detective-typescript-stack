import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { LoginEmailValidation, LoginPasswordValidation } from '@detective.solutions/frontend/shared/utils';
import { Subscription, debounceTime, filter, take } from 'rxjs';

import { AuthService } from '@detective.solutions/frontend/shared/auth';

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  redirectUrl!: string;
  loginForm!: FormGroup;
  loginError = '';
  hidePassword = true;

  private readonly subscriptions = new Subscription();

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.redirectUrl = this.route.snapshot.queryParams['redirectUrl'] ?? '';
    this.buildLoginForm();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  buildLoginForm() {
    this.loginForm = this.formBuilder.group({
      email: ['', LoginEmailValidation],
      password: ['', LoginPasswordValidation],
    });
  }

  login() {
    if (this.loginForm.valid) {
      this.authService
        .login(this.loginForm.value.email, this.loginForm.value.password)
        .pipe(debounceTime(1000), take(1))
        .subscribe();

      this.authService.authStatus$
        .pipe(
          filter((authStatus) => authStatus.isAuthenticated),
          take(1)
        )
        .subscribe(() => this.router.navigateByUrl(this.redirectUrl));
    } else {
      this.loginForm.markAsDirty();
    }
  }
}
