import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Generic validator to ensure two form controls have different values
 * This is useful for scenarios like ensuring a new password is different from the current password
 *
 * @param controlName The name of the control to check against
 * @param matchingControlName The name of the control that should be different
 * @param errorKey The error key to use in validation errors (default: 'same')
 * @returns A validator function that returns null if values are different, or an error object if they match
 */
export function notMatchValidator(
    controlName: string,
    matchingControlName: string,
    errorKey: string = 'match',
): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
        const control = formGroup.get(controlName);
        const matchingControl = formGroup.get(matchingControlName);

        if (!control || !matchingControl) {
            return null;
        }

        // Skip validation if controls don't have values
        if (!control.value || !matchingControl.value) {
            return null;
        }

        // If matchingControl already has errors other than our error, don't overwrite them
        if (matchingControl.errors && !matchingControl.errors[errorKey]) {
            return null;
        }

        // The key difference: check if values DO match instead of don't match
        if (control.value === matchingControl.value) {
            const error = { [errorKey]: true };
            matchingControl.setErrors(error);
            return error;
        } else {
            // Clear only our error if values don't match
            if (matchingControl.errors?.[errorKey]) {
                const { [errorKey]: _, ...errors } = matchingControl.errors;
                matchingControl.setErrors(Object.keys(errors).length > 0 ? errors : null);
            }
            return null;
        }
    };
}
