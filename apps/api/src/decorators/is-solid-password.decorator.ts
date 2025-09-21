import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export const checkIsSolidPassword = (value: string): boolean => {
  if (!value) return false;

  // Adjust age if birthday hasn't occurred this year
  if (
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
      value,
    )
  ) {
    return true;
  }
  return false;
};

export function IsSolidPassword(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isSolidPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: string) {
          return checkIsSolidPassword(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be have Minimum eight characters, including at least one uppercase letter, one lowercase letter, one number, and one special character`;
        },
      },
    });
  };
}
