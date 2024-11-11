export class AuthErrorResponseDto {
    errorCode: 'nameTaken' | 'wrongOldPassword' | 'userNotFound' | 'forbidden' | 'wrongPassword' | 'passwordMatchesOld';
}