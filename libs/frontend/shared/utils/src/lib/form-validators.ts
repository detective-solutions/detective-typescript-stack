import { Validators } from '@angular/forms';

export const OptionalTextValidation = [Validators.minLength(2), Validators.maxLength(50)];
export const RequiredTextValidation = OptionalTextValidation.concat([Validators.required]);
export const OneCharValidation = [Validators.minLength(1), Validators.maxLength(1)];
export const EmailValidation = [Validators.required, Validators.email, Validators.maxLength(254)];
export const PasswordValidation = [Validators.required, Validators.minLength(8), Validators.maxLength(64)];
