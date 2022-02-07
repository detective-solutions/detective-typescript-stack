import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { EmailValidation, PasswordValidation } from '@detective.solutions/frontend/shared/utils';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subscription, catchError, combineLatest, filter, tap } from 'rxjs';

import { AuthService } from '../../services/auth.service';

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
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    route: ActivatedRoute
  ) {
    this.subscriptions.add(route.paramMap.subscribe((params) => (this.redirectUrl = params.get('redirectUrl') ?? '')));
  }

  ngOnInit() {
    this.authService.logout();
    this.buildLoginForm();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  buildLoginForm() {
    this.loginForm = this.formBuilder.group({
      email: ['', EmailValidation],
      password: ['', PasswordValidation],
    });
  }

  login(submittedForm: FormGroup) {
    this.authService
      .login(submittedForm.value.email, submittedForm.value.password)
      .pipe(catchError((err) => (this.loginError = err)));

    this.subscriptions.add(
      combineLatest([this.authService.authStatus$, this.authService.currentUser$])
        .pipe(
          filter(([authStatus, user]) => authStatus.isAuthenticated && user?.email !== ''),
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          tap(([authStatus, user]) => {
            // TODO: Show toast on successful/failed login
            this.router.navigate([this.redirectUrl]);
          })
        )
        .subscribe()
    );
  }
}
