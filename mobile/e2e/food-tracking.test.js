describe('Food Tracking Flow', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      permissions: { camera: 'YES' }
    });
    
    // Login first
    await element(by.id('login-email-input')).typeText('demo@nutriscanvn.com');
    await element(by.id('login-password-input')).typeText('Demo123!@#');
    await element(by.id('login-submit-button')).tap();
    
    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should navigate to food scanner', async () => {
    await element(by.id('scanner-tab')).tap();
    await expect(element(by.id('camera-screen'))).toBeVisible();
  });

  it('should open food database', async () => {
    await element(by.id('food-tab')).tap();
    await expect(element(by.id('food-database-screen'))).toBeVisible();
  });

  it('should search for food', async () => {
    await element(by.id('food-search-input')).typeText('phở');
    await element(by.id('food-search-button')).tap();
    
    await waitFor(element(by.id('food-list')))
      .toBeVisible()
      .withTimeout(3000);
    
    await expect(element(by.text('Phở Bò'))).toBeVisible();
  });

  it('should log food entry', async () => {
    await element(by.text('Phở Bò')).tap();
    
    await element(by.id('meal-type-lunch')).tap();
    await element(by.id('serving-size-input')).typeText('1');
    await element(by.id('log-food-button')).tap();
    
    await expect(element(by.text('Đã thêm vào nhật ký'))).toBeVisible();
  });

  it('should view daily nutrition summary', async () => {
    await element(by.id('home-tab')).tap();
    
    await expect(element(by.id('nutrition-summary'))).toBeVisible();
    await expect(element(by.id('calories-consumed'))).toBeVisible();
    await expect(element(by.id('macros-chart'))).toBeVisible();
  });

  it('should view food logs', async () => {
    await element(by.id('view-food-logs-button')).tap();
    
    await expect(element(by.id('food-logs-list'))).toBeVisible();
    await expect(element(by.text('Phở Bò'))).toBeVisible();
  });

  it('should delete food log', async () => {
    await element(by.id('food-log-item-0')).swipe('left');
    await element(by.id('delete-food-log-button')).tap();
    
    await expect(element(by.text('Đã xóa khỏi nhật ký'))).toBeVisible();
  });
});
