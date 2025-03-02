import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Generic validator to ensure two form controls have matching values
 *
 * @param controlName The name of the control to match from
 * @param matchingControlName The name of the control to match against
 * @param errorKey The error key to use in validation errors (default: 'mismatch')
 * @returns A validator function that returns null if values match, or an error object if they do not
 */
export function matchValidator(
    controlName: string,
    matchingControlName: string,
    errorKey: string = 'mismatch',
): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
        const control = formGroup.get(controlName);
        const matchingControl = formGroup.get(matchingControlName);

        if (!control || !matchingControl) {
            return null;
        }

        if (matchingControl.errors && !matchingControl.errors[errorKey]) {
            return null;
        }

        if (control.value !== matchingControl.value) {
            const error = { [errorKey]: true };
            matchingControl.setErrors(error);

            return error;
        } else {
            if (matchingControl.errors?.[errorKey]) {
                const { [errorKey]: _, ...errors } = matchingControl.errors;
                matchingControl.setErrors(Object.keys(errors).length > 0 ? errors : null);
            }
            return null;
        }
    };
}
