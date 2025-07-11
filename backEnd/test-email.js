const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmail() {
  console.log('Testing Mailtrap configuration...');
  console.log('Environment variables:');
  console.log('MAILTRAP_HOST:', process.env.MAILTRAP_HOST);
  console.log('MAILTRAP_PORT:', process.env.MAILTRAP_PORT);
  console.log('MAILTRAP_USER:', process.env.MAILTRAP_USER);
  console.log('MAILTRAP_PASS:', process.env.MAILTRAP_PASS ? '***SET***' : 'NOT SET');
  console.log('FROM_EMAIL:', process.env.FROM_EMAIL);

  const transporter = nodemailer.createTransporter({
    host: process.env.MAILTRAP_HOST,
    port: parseInt(process.env.MAILTRAP_PORT || '2525'),
    auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASS,
    },
    secure: false,
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 60000,
    greetingTimeout: 30000,
    socketTimeout: 60000,
  });

  try {
    console.log('Verifying connection...');
    await transporter.verify();
    console.log('✅ Connection verified successfully!');

    console.log('Sending test email...');
    const result = await transporter.sendMail({
      from: process.env.FROM_EMAIL || 'test@example.com',
      to: 'test@example.com',
      subject: 'Test Email from FindMySpot',
      html: '<h1>Test Email</h1><p>This is a test email from FindMySpot application.</p>'
    });

    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', result.messageId);
    console.log('Check your Mailtrap inbox for the test email.');

  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    console.error('Full error:', error);
  }
}

testEmail(); 