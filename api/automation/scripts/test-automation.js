#!/usr/bin/env node

/**
 * Test Script for Web Automation System
 * 
 * This script tests the multi-agent automation system by:
 * 1. Initializing the scheduler
 * 2. Running a manual trigger of the weekly analytics workflow
 * 3. Displaying the results
 * 
 * Usage:
 *   node api/automation/scripts/test-automation.js
 * 
 * With email recipient:
 *   node api/automation/scripts/test-automation.js your-email@example.com
 */

const WeeklyScheduler = require('../scheduler/weekly-scheduler');

async function runTest() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 TESTING WEB AUTOMATION SYSTEM');
  console.log('='.repeat(60));

  // Get recipient from command line or use default
  const recipient = process.argv[2] || '';
  const recipients = recipient ? [recipient] : [];

  console.log(`\n📧 Recipients: ${recipients.length ? recipients.join(', ') : 'None (console output only)'}`);

  // Initialize the scheduler
  console.log('\n📅 Initializing scheduler...');
  
  const scheduler = new WeeklyScheduler({
    platforms: ['instagram', 'twitter', 'linkedin', 'facebook'],
    recipients,
    emailService: 'console' // Use console for testing
  });

  try {
    await scheduler.initialize();
    console.log('✅ Scheduler initialized successfully');

    // Show available workflows
    console.log('\n📋 Available workflows:');
    const workflows = scheduler.orchestrator.getWorkflows();
    for (const [name, info] of Object.entries(workflows)) {
      console.log(`   - ${name}: ${info.steps} steps`);
      info.description.forEach((desc, i) => {
        console.log(`     ${i + 1}. ${desc}`);
      });
    }

    // Show agent status
    console.log('\n🤖 Registered agents:');
    const agentStatus = scheduler.orchestrator.getAgentStatus();
    for (const [name, info] of Object.entries(agentStatus)) {
      console.log(`   - ${name}: ${info.status} (${info.capabilities.length} capabilities)`);
    }

    // Trigger the workflow manually
    console.log('\n🚀 Triggering weekly analytics workflow...');
    const result = await scheduler.triggerNow(recipients);

    // Display results
    console.log('\n' + '='.repeat(60));
    console.log('📊 EXECUTION RESULTS');
    console.log('='.repeat(60));
    console.log(`Success: ${result.success}`);
    console.log(`Duration: ${result.duration}ms`);
    console.log(`Steps completed: ${result.steps?.length || 0}`);

    if (result.steps) {
      console.log('\nStep details:');
      result.steps.forEach(step => {
        const icon = step.success ? '✅' : '❌';
        console.log(`   ${icon} Step ${step.step}: ${step.agentName} (${step.role}) - ${step.duration}ms`);
      });
    }

    if (result.error) {
      console.log(`\n❌ Error: ${result.error}`);
    }

    // Cleanup
    await scheduler.cleanup();
    console.log('\n🧹 Cleanup complete');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ TEST COMPLETE');
  console.log('='.repeat(60) + '\n');
}

// Run the test
runTest().catch(console.error);

