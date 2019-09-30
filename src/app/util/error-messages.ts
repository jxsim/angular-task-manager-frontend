export const fetchErrorMessage = (errors: object) => {
  let message = '';
  Object.entries(errors).forEach(([k,v]) => {
    message = getError(k);
  });

  return message;
};

export const getError = (errorType: any) => {
  const errors = {
    required: 'This field is required.',
    ngbDate: 'Please select a date from the date picker.',
    invalidParentTask: 'Please select a parent task from the predefined list.'
  };
  const defaultError = 'This field is invalid';

  return errors[errorType] || defaultError;
};
