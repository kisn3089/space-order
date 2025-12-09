import { signInFormSchema } from '@spaceorder/auth';
import { createZodDto } from 'nestjs-zod';

export class SignInDto extends createZodDto(signInFormSchema) {}
