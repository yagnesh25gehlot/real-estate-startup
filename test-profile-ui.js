const puppeteer = require('puppeteer');

async function testProfileUI() {
  console.log('🧪 Testing Profile UI Functionality');
  console.log('===================================');

  let browser;
  try {
    // Launch browser
    browser = await puppeteer.launch({ 
      headless: false, 
      slowMo: 1000,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Enable console logging
    page.on('console', msg => console.log('Browser Console:', msg.text()));
    
    console.log('\n1. Navigating to profile page...');
    await page.goto('http://localhost:5173/profile', { waitUntil: 'networkidle0' });
    
    console.log('\n2. Checking if page loaded...');
    const title = await page.title();
    console.log('Page title:', title);
    
    console.log('\n3. Looking for login form or profile content...');
    const loginForm = await page.$('input[type="email"]');
    const profileContent = await page.$('h1');
    
    if (loginForm) {
      console.log('✅ Login form found - need to login first');
      
      console.log('\n4. Logging in...');
      await page.type('input[type="email"]', 'user1@test.com');
      await page.type('input[type="password"]", 'AnotherPass123!');
      await page.click('button[type="submit"]');
      
      // Wait for redirect
      await page.waitForNavigation({ waitUntil: 'networkidle0' });
      console.log('✅ Login completed');
    } else if (profileContent) {
      console.log('✅ Profile page loaded directly');
    }
    
    console.log('\n5. Looking for Edit Profile button...');
    const editButton = await page.$('button:has-text("Edit Profile")');
    
    if (editButton) {
      console.log('✅ Edit Profile button found');
      
      console.log('\n6. Clicking Edit Profile button...');
      await editButton.click();
      await page.waitForTimeout(1000);
      
      console.log('\n7. Looking for input fields...');
      const nameInput = await page.$('input[name="name"]');
      const mobileInput = await page.$('input[name="mobile"]');
      const aadhaarInput = await page.$('input[name="aadhaar"]');
      
      console.log('Name input found:', !!nameInput);
      console.log('Mobile input found:', !!mobileInput);
      console.log('Aadhaar input found:', !!aadhaarInput);
      
      if (mobileInput) {
        console.log('\n8. Testing mobile input...');
        await mobileInput.click();
        await mobileInput.type('9876543210');
        await page.waitForTimeout(500);
        
        const mobileValue = await mobileInput.evaluate(el => el.value);
        console.log('Mobile input value:', mobileValue);
      }
      
      if (aadhaarInput) {
        console.log('\n9. Testing aadhaar input...');
        await aadhaarInput.click();
        await aadhaarInput.type('123456789012');
        await page.waitForTimeout(500);
        
        const aadhaarValue = await aadhaarInput.evaluate(el => el.value);
        console.log('Aadhaar input value:', aadhaarValue);
      }
      
      console.log('\n10. Looking for debug info...');
      const debugInfo = await page.$('.bg-gray-100');
      if (debugInfo) {
        const debugText = await debugInfo.evaluate(el => el.textContent);
        console.log('Debug info found:', debugText);
      }
      
    } else {
      console.log('❌ Edit Profile button not found');
      
      // Take screenshot for debugging
      await page.screenshot({ path: 'profile-page-debug.png' });
      console.log('Screenshot saved as profile-page-debug.png');
    }
    
    console.log('\n🎯 Test completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Check if puppeteer is available
try {
  require('puppeteer');
  testProfileUI();
} catch (error) {
  console.log('Puppeteer not available, skipping UI test');
  console.log('Please test manually at: http://localhost:5173/profile');
  console.log('Login with: user1@test.com / AnotherPass123!');
}
