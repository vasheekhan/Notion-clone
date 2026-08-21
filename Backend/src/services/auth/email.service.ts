class EmailService {
  async sendOtp(email: string, otp: string) {
    console.log(`
==================================
📧 Sending OTP

To: ${email}

OTP: ${otp}
==================================
`);
  }
}

export default new EmailService();