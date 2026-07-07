import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OtpService {
  private resend: Resend;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    const apiKey = this.config.get('RESEND_API_KEY');
    if (!apiKey) {
      console.warn('⚠️  RESEND_API_KEY not configured - OTP emails will not be sent');
      // Utiliser une clé dummy pour éviter l'erreur Resend
      this.resend = new Resend('re_dummy_key_development');
    } else {
      this.resend = new Resend(apiKey);
    }
  }

  async sendOTP(email: string): Promise<{ sent: boolean; message: string }> {
    // Générer code 6 chiffres
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Vérifier si un OTP non utilisé existe déjà
    const existingOtp = await this.prisma.otpCode.findFirst({
      where: {
        email,
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (existingOtp) {
      // Renvoyer le même code si toujours valide (moins de 2 min)
      const age = Date.now() - existingOtp.createdAt.getTime();
      if (age < 2 * 60 * 1000) {
        throw new BadRequestException('Un code OTP a déjà été envoyé. Veuillez patienter 2 minutes.');
      }
    }

    // Invalider les anciens codes
    await this.prisma.otpCode.updateMany({
      where: { email, used: false },
      data: { used: true },
    });

    // Créer nouveau code
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await this.prisma.otpCode.create({
      data: {
        email,
        code,
        expiresAt,
      },
    });

    // Envoyer email
    try {
      const fromEmail = this.config.get('FROM_EMAIL') || "C'PRO <noreply@cpro.local>";

      await this.resend.emails.send({
        from: fromEmail,
        to: email,
        subject: "Code de vérification C'PRO",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .otp-code { font-size: 32px; font-weight: bold; color: #667eea; text-align: center; letter-spacing: 8px; margin: 20px 0; padding: 15px; background: white; border-radius: 8px; border: 2px dashed #667eea; }
              .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔐 C'PRO</h1>
                <p>Code de Vérification</p>
              </div>
              <div class="content">
                <p>Bonjour,</p>
                <p>Voici votre code de vérification pour activer votre compte C'PRO :</p>
                <div class="otp-code">${code}</div>
                <p><strong>Ce code expire dans 10 minutes.</strong></p>
                <p>Si vous n'avez pas demandé ce code, ignorez simplement cet email.</p>
                <p>Cordialement,<br>L'équipe C'PRO</p>
              </div>
              <div class="footer">
                <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      console.log(`✅ OTP envoyé à ${email}: ${code}`);
      return { sent: true, message: 'Code envoyé par email' };
    } catch (error) {
      console.error('❌ Erreur envoi OTP:', error);

      // En dev, on log le code
      if (this.config.get('NODE_ENV') === 'development') {
        console.log(`🔐 CODE OTP (dev): ${code} pour ${email}`);
        return { sent: true, message: `Code généré (dev mode): ${code}` };
      }

      throw new BadRequestException('Erreur lors de l\'envoi du code de vérification');
    }
  }

  async verifyOTP(email: string, code: string): Promise<{ verified: boolean; message: string }> {
    const otp = await this.prisma.otpCode.findFirst({
      where: {
        email,
        code,
        expiresAt: { gt: new Date() },
        used: false,
      },
    });

    if (!otp) {
      throw new UnauthorizedException('Code invalide ou expiré');
    }

    // Marquer comme utilisé
    await this.prisma.otpCode.update({
      where: { id: otp.id },
      data: { used: true },
    });

    // Activer l'email du user
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      await this.prisma.user.update({
        where: { email },
        data: { emailVerified: true },
      });
    }

    console.log(`✅ Email vérifié: ${email}`);
    return { verified: true, message: 'Email vérifié avec succès' };
  }

  async resendOTP(email: string): Promise<{ sent: boolean; message: string }> {
    return this.sendOTP(email);
  }
}
