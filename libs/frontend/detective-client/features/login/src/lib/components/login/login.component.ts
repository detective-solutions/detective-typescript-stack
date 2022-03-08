import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { EmailValidation, PasswordValidation } from '@detective.solutions/frontend/shared/utils';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subscription, combineLatest, filter } from 'rxjs';

import { AuthService } from '@detective.solutions/detective-client/features/auth';

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
  ) {
    this.subscriptions.add(
      this.route.paramMap.subscribe((params) => (this.redirectUrl = params.get('redirectUrl') ?? ''))
    );
  }

  ngOnInit() {
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
    this.subscriptions.add(this.authService.login(submittedForm.value.email, submittedForm.value.password).subscribe());
    this.subscriptions.add(
      combineLatest([this.authService.authStatus$, this.authService.currentUser$])
        .pipe(filter(([authStatus, user]) => authStatus.isAuthenticated && user?.email !== ''))
        .subscribe(() => this.router.navigateByUrl(this.redirectUrl))
    );
  }
}
