import Task from '../models/task';
import {AbstractControl, ValidatorFn} from "@angular/forms";

export function parentTaskValidator(tasks: Task[]): ValidatorFn {
  return (control: AbstractControl): {[key: string]: any} | null => {
    if (control.value === '') {
      return null;
    }
    const forbidden = !tasks.find(t => t.id === control.value.id);
    return forbidden ? {invalidParentTask: {value: control.value}} : null;
  };
}
