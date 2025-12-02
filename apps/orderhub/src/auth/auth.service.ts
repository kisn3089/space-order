import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/signin.dto';
import { AdminService } from '../admin/admin.service';
import { comparePassword } from '@spaceorder/orderhub/utils/lib/crypt';

@Injectable()
export class AuthService {
  constructor(private readonly adminService: AdminService) {}

  async login(loginDto: LoginDto) {
    try {
      const { email, password } = loginDto;
      const admin = await this.adminService.findByEmail(email);
      if (!admin.isActive) {
        throw new UnauthorizedException('관리자 계정이 비활성화 상태입니다.');
      }
      console.log('admin: ', admin);
      const authenticated = await comparePassword(password, admin.password);
      console.log('authenticated: ', authenticated);
      if (!authenticated) {
        throw new UnauthorizedException(
          '이메일 또는 비밀번호가 올바르지 않습니다.',
        );
      }
      await this.adminService.updateLastSignin(admin.publicId);
    } catch {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    }
  }
}
