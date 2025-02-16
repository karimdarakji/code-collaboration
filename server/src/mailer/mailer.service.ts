import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private transporter;
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendInvitationEmail(email: string, invitationLink: string) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'You are invited to join a code collaboration session',
      text: `Hi,\n\nYou have been invited to join a code collaboration session. Please click the link below to join:\n\n${invitationLink}\n\nIf you did not expect this invitation, please ignore this email.`,
    };
    return this.transporter.sendMail(mailOptions);
  }
}
