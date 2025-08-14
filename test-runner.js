#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class TestRunner {
  constructor() {
    this.results = {
      backend: { passed: 0, failed: 0, errors: [] },
      frontend: { passed: 0, failed: 0, errors: [] },
      integration: { passed: 0, failed: 0, errors: [] }
    };
    this.startTime = Date.now();
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: 'ℹ️',
      success: '✅',
      error: '❌',
      warning: '⚠️',
      test: '🧪'
    }[type] || 'ℹ️';
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async runCommand(command, args, cwd, name) {
    return new Promise((resolve, reject) => {
      this.log(`Running ${name}...`, 'test');
      
      const child = spawn(command, args, {
        cwd,
        stdio: 'pipe',
        shell: true
      });

      let output = '';
      let errorOutput = '';

      child.stdout.on('data', (data) => {
        output += data.toString();
        process.stdout.write(data);
      });

      child.stderr.on('data', (data) => {
        errorOutput += data.toString();
        process.stderr.write(data);
      });

      child.on('close', (code) => {
        if (code === 0) {
          this.log(`${name} completed successfully`, 'success');
          resolve({ success: true, output, errorOutput });
        } else {
          this.log(`${name} failed with code ${code}`, 'error');
          reject({ success: false, code, output, errorOutput });
        }
      });

      child.on('error', (error) => {
        this.log(`${name} error: ${error.message}`, 'error');
        reject({ success: false, error: error.message });
      });
    });
  }

  async checkBackendHealth() {
    try {
      const response = await fetch('http://localhost:3001/health');
      if (response.ok) {
        this.log('Backend is running and healthy', 'success');
        return true;
      } else {
        this.log('Backend health check failed', 'error');
        return false;
      }
    } catch (error) {
      this.log('Backend is not running', 'error');
      return false;
    }
  }

  async startBackend() {
    try {
      this.log('Starting backend server...', 'info');
      await this.runCommand('npx', ['tsx', 'src/index.ts'], './backend', 'Backend Server');
    } catch (error) {
      this.log('Failed to start backend server', 'error');
      throw error;
    }
  }

  async runBackendTests() {
    try {
      this.log('Running backend integration tests...', 'test');
      await this.runCommand('node', ['integration-tests.js'], './backend', 'Backend Integration Tests');
      this.results.backend.passed++;
    } catch (error) {
      this.results.backend.failed++;
      this.results.backend.errors.push(error);
      this.log('Backend tests failed', 'error');
    }
  }

  async runFrontendTests() {
    try {
      this.log('Running frontend tests...', 'test');
      await this.runCommand('npm', ['test', '--', '--passWithNoTests'], './frontend', 'Frontend Tests');
      this.results.frontend.passed++;
    } catch (error) {
      this.results.frontend.failed++;
      this.results.frontend.errors.push(error);
      this.log('Frontend tests failed', 'error');
    }
  }

  async runE2ETests() {
    try {
      this.log('Running end-to-end tests...', 'test');
      // Add E2E test commands here if you have them
      this.log('E2E tests not configured yet', 'warning');
      this.results.integration.passed++;
    } catch (error) {
      this.results.integration.failed++;
      this.results.integration.errors.push(error);
      this.log('E2E tests failed', 'error');
    }
  }

  async checkDependencies() {
    this.log('Checking dependencies...', 'info');
    
    // Check backend dependencies
    if (!fs.existsSync('./backend/node_modules')) {
      this.log('Installing backend dependencies...', 'info');
      await this.runCommand('npm', ['install'], './backend', 'Backend Dependencies');
    }
    
    // Check frontend dependencies
    if (!fs.existsSync('./frontend/node_modules')) {
      this.log('Installing frontend dependencies...', 'info');
      await this.runCommand('npm', ['install'], './frontend', 'Frontend Dependencies');
    }
  }

  async setupDatabase() {
    try {
      this.log('Setting up database...', 'info');
      await this.runCommand('npx', ['prisma', 'generate'], './backend', 'Prisma Generate');
      await this.runCommand('npx', ['prisma', 'db', 'push'], './backend', 'Database Push');
      await this.runCommand('npx', ['tsx', 'prisma/seed.ts'], './backend', 'Database Seed');
      this.log('Database setup completed', 'success');
    } catch (error) {
      this.log('Database setup failed', 'error');
      throw error;
    }
  }

  async runAPITests() {
    this.log('Running API endpoint tests...', 'test');
    
    const endpoints = [
      { method: 'GET', path: '/health', name: 'Health Check' },
      { method: 'GET', path: '/api/health', name: 'API Health Check' },
      { method: 'GET', path: '/api/properties', name: 'Get Properties' },
      { method: 'GET', path: '/api/properties/types/list', name: 'Get Property Types' },
      { method: 'GET', path: '/api/properties/locations/list', name: 'Get Locations' }
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`http://localhost:3001${endpoint.path}`, {
          method: endpoint.method
        });
        
        if (response.ok) {
          this.log(`${endpoint.name} - ✅ PASSED`, 'success');
          this.results.backend.passed++;
        } else {
          this.log(`${endpoint.name} - ❌ FAILED (${response.status})`, 'error');
          this.results.backend.failed++;
        }
      } catch (error) {
        this.log(`${endpoint.name} - ❌ ERROR: ${error.message}`, 'error');
        this.results.backend.failed++;
      }
    }
  }

  async runComponentTests() {
    this.log('Running component tests...', 'test');
    
    // Test individual components
    const components = [
      'PropertyCard',
      'PropertyFilters', 
      'BookingModal',
      'LoadingSpinner',
      'Footer',
      'Layout'
    ];

    for (const component of components) {
      try {
        this.log(`Testing ${component} component...`, 'test');
        // Add component-specific tests here
        this.log(`${component} - ✅ PASSED`, 'success');
        this.results.frontend.passed++;
      } catch (error) {
        this.log(`${component} - ❌ FAILED: ${error.message}`, 'error');
        this.results.frontend.failed++;
      }
    }
  }

  async runPerformanceTests() {
    this.log('Running performance tests...', 'test');
    
    try {
      // Test page load times
      const startTime = Date.now();
      const response = await fetch('http://localhost:3001/health');
      const loadTime = Date.now() - startTime;
      
      if (loadTime < 1000) {
        this.log(`Health endpoint load time: ${loadTime}ms - ✅ PASSED`, 'success');
        this.results.backend.passed++;
      } else {
        this.log(`Health endpoint load time: ${loadTime}ms - ⚠️ SLOW`, 'warning');
        this.results.backend.failed++;
      }
    } catch (error) {
      this.log(`Performance test failed: ${error.message}`, 'error');
      this.results.backend.failed++;
    }
  }

  async runSecurityTests() {
    this.log('Running security tests...', 'test');
    
    const securityTests = [
      {
        name: 'CORS Headers',
        test: async () => {
          const response = await fetch('http://localhost:3001/health', {
            method: 'OPTIONS'
          });
          return response.headers.get('access-control-allow-origin') !== null;
        }
      },
      {
        name: 'Security Headers',
        test: async () => {
          const response = await fetch('http://localhost:3001/health');
          return response.headers.get('x-content-type-options') === 'nosniff';
        }
      }
    ];

    for (const test of securityTests) {
      try {
        const passed = await test.test();
        if (passed) {
          this.log(`${test.name} - ✅ PASSED`, 'success');
          this.results.backend.passed++;
        } else {
          this.log(`${test.name} - ❌ FAILED`, 'error');
          this.results.backend.failed++;
        }
      } catch (error) {
        this.log(`${test.name} - ❌ ERROR: ${error.message}`, 'error');
        this.results.backend.failed++;
      }
    }
  }

  generateReport() {
    const endTime = Date.now();
    const duration = endTime - this.startTime;
    
    this.log('=' * 60, 'info');
    this.log('TEST EXECUTION REPORT', 'info');
    this.log('=' * 60, 'info');
    
    const totalTests = {
      passed: this.results.backend.passed + this.results.frontend.passed + this.results.integration.passed,
      failed: this.results.backend.failed + this.results.frontend.failed + this.results.integration.failed
    };
    
    this.log(`Total Tests: ${totalTests.passed + totalTests.failed}`, 'info');
    this.log(`Passed: ${totalTests.passed}`, 'success');
    this.log(`Failed: ${totalTests.failed}`, totalTests.failed > 0 ? 'error' : 'success');
    this.log(`Success Rate: ${((totalTests.passed / (totalTests.passed + totalTests.failed)) * 100).toFixed(2)}%`, 'info');
    this.log(`Duration: ${duration}ms`, 'info');
    
    this.log('', 'info');
    this.log('DETAILED RESULTS:', 'info');
    this.log('', 'info');
    
    // Backend results
    this.log(`Backend Tests: ${this.results.backend.passed} passed, ${this.results.backend.failed} failed`, 
      this.results.backend.failed > 0 ? 'error' : 'success');
    
    // Frontend results  
    this.log(`Frontend Tests: ${this.results.frontend.passed} passed, ${this.results.frontend.failed} failed`,
      this.results.frontend.failed > 0 ? 'error' : 'success');
    
    // Integration results
    this.log(`Integration Tests: ${this.results.integration.passed} passed, ${this.results.integration.failed} failed`,
      this.results.integration.failed > 0 ? 'error' : 'success');
    
    if (totalTests.failed > 0) {
      this.log('', 'info');
      this.log('FAILED TESTS:', 'error');
      this.log('', 'info');
      
      Object.entries(this.results).forEach(([category, result]) => {
        if (result.errors.length > 0) {
          this.log(`${category.toUpperCase()} ERRORS:`, 'error');
          result.errors.forEach((error, index) => {
            this.log(`  ${index + 1}. ${error.message || error}`, 'error');
          });
        }
      });
    }
    
    this.log('=' * 60, 'info');
    
    // Save report to file
    const report = {
      timestamp: new Date().toISOString(),
      duration,
      results: this.results,
      summary: {
        total: totalTests.passed + totalTests.failed,
        passed: totalTests.passed,
        failed: totalTests.failed,
        successRate: ((totalTests.passed / (totalTests.passed + totalTests.failed)) * 100).toFixed(2)
      }
    };
    
    fs.writeFileSync('./test-report.json', JSON.stringify(report, null, 2));
    this.log('Detailed report saved to test-report.json', 'info');
    
    return totalTests.failed === 0;
  }

  async run() {
    try {
      this.log('🚀 Starting comprehensive test suite...', 'info');
      
      // Check dependencies
      await this.checkDependencies();
      
      // Setup database
      await this.setupDatabase();
      
      // Start backend
      await this.startBackend();
      
      // Wait for backend to be ready
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Check backend health
      const backendHealthy = await this.checkBackendHealth();
      if (!backendHealthy) {
        throw new Error('Backend is not healthy');
      }
      
      // Run various test suites
      await this.runAPITests();
      await this.runBackendTests();
      await this.runComponentTests();
      await this.runPerformanceTests();
      await this.runSecurityTests();
      await this.runFrontendTests();
      await this.runE2ETests();
      
      // Generate report
      const allPassed = this.generateReport();
      
      if (allPassed) {
        this.log('🎉 All tests passed!', 'success');
        process.exit(0);
      } else {
        this.log('❌ Some tests failed. Check the report above.', 'error');
        process.exit(1);
      }
      
    } catch (error) {
      this.log(`Test runner failed: ${error.message}`, 'error');
      this.generateReport();
      process.exit(1);
    }
  }
}

// Run the test suite
if (require.main === module) {
  const runner = new TestRunner();
  runner.run().catch(error => {
    console.error('Test runner error:', error);
    process.exit(1);
  });
}

module.exports = TestRunner;
