describe('Navigation Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
    
    // Login
    await element(by.id('login-email-input')).typeText('demo@nutriscanvn.com');
    await element(by.id('login-password-input')).typeText('Demo123!@#');
    await element(by.id('login-submit-button')).tap();
    
    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should navigate between tabs', async () => {
    // Home tab
    await expect(element(by.id('home-screen'))).toBeVisible();
    
    // Scanner tab
    await element(by.id('scanner-tab')).tap();
    await expect(element(by.id('camera-screen'))).toBeVisible();
    
    // Food tab
    await element(by.id('food-tab')).tap();
    await expect(element(by.id('food-database-screen'))).toBeVisible();
    
    // Progress tab
    await element(by.id('progress-tab')).tap();
    await expect(element(by.id('progress-screen'))).toBeVisible();
    
    // Profile tab
    await element(by.id('profile-tab')).tap();
    await expect(element(by.id('profile-screen'))).toBeVisible();
  });

  it('should navigate to water tracker', async () => {
    await element(by.id('home-tab')).tap();
    await element(by.id('water-tracker-card')).tap();
    
    await expect(element(by.id('water-tracker-screen'))).toBeVisible();
  });

  it('should navigate to exercise tracker', async () => {
    await device.pressBack();
    await element(by.id('exercise-tracker-card')).tap();
    
    await expect(element(by.id('exercise-tracker-screen'))).toBeVisible();
  });

  it('should navigate to meal planner', async () => {
    await device.pressBack();
    await element(by.id('meal-planner-card')).tap();
    
    await expect(element(by.id('meal-planner-screen'))).toBeVisible();
  });

  it('should navigate to community', async () => {
    await device.pressBack();
    await element(by.id('community-card')).tap();
    
    await expect(element(by.id('community-screen'))).toBeVisible();
  });

  it('should navigate to chatbot', async () => {
    await device.pressBack();
    await element(by.id('chatbot-card')).tap();
    
    await expect(element(by.id('chatbot-screen'))).toBeVisible();
  });

  it('should open settings', async () => {
    await element(by.id('profile-tab')).tap();
    await element(by.id('settings-button')).tap();
    
    await expect(element(by.id('settings-screen'))).toBeVisible();
  });

  it('should logout', async () => {
    await element(by.id('logout-button')).tap();
    await element(by.text('Đăng xuất')).tap();
    
    await waitFor(element(by.id('login-screen')))
      .toBeVisible()
      .withTimeout(3000);
  });
});
