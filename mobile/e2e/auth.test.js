describe('Authentication Flow', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      permissions: { notifications: 'YES', camera: 'YES' }
    });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should show splash screen then login screen', async () => {
    await expect(element(by.id('splash-screen'))).toBeVisible();
    await waitFor(element(by.id('login-screen')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should show validation errors for invalid inputs', async () => {
    await element(by.id('login-email-input')).typeText('invalid-email');
    await element(by.id('login-password-input')).typeText('123');
    await element(by.id('login-submit-button')).tap();
    
    await expect(element(by.text('Email không hợp lệ'))).toBeVisible();
    await expect(element(by.text('Mật khẩu phải có ít nhất 8 ký tự'))).toBeVisible();
  });

  it('should navigate to register screen', async () => {
    await element(by.id('go-to-register-button')).tap();
    await expect(element(by.id('register-screen'))).toBeVisible();
  });

  it('should complete registration flow', async () => {
    await element(by.id('go-to-register-button')).tap();
    
    await element(by.id('register-email-input')).typeText('test@example.com');
    await element(by.id('register-password-input')).typeText('Test123!@#');
    await element(by.id('register-name-input')).typeText('Test User');
    await element(by.id('register-submit-button')).tap();
    
    // Should navigate to onboarding
    await waitFor(element(by.id('onboarding-screen')))
      .toBeVisible()
      .withTimeout(3000);
  });

  it('should complete onboarding flow', async () => {
    // Assuming logged in after registration
    await element(by.id('onboarding-gender-male')).tap();
    await element(by.id('onboarding-next-button')).tap();
    
    await element(by.id('onboarding-age-input')).typeText('25');
    await element(by.id('onboarding-next-button')).tap();
    
    await element(by.id('onboarding-height-input')).typeText('170');
    await element(by.id('onboarding-weight-input')).typeText('70');
    await element(by.id('onboarding-next-button')).tap();
    
    await element(by.id('onboarding-goal-lose')).tap();
    await element(by.id('onboarding-finish-button')).tap();
    
    // Should navigate to home
    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(3000);
  });

  it('should login with valid credentials', async () => {
    await element(by.id('login-email-input')).typeText('demo@nutriscanvn.com');
    await element(by.id('login-password-input')).typeText('Demo123!@#');
    await element(by.id('login-submit-button')).tap();
    
    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(5000);
  });
});
