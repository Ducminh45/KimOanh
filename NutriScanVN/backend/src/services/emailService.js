import { logger } from './logger.js';

export async function sendEmail({ to, subject, html }) {
  // In production, integrate with a real email provider.
  logger.info('Sending email (stubbed)', { to, subject });
  logger.debug('Email body', { html });
}
