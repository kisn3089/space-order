import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * local.strategy 파일의 LocalStrategy가 실행되도록 한다.
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
