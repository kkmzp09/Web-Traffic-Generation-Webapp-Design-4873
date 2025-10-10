// scripts/traffic-simulator.js
const { chromium } = require('playwright');
const { v4: uuidv4 } = require('uuid');

const jobs = {}; // Store job status in memory

// Helper to simulate natural scrolling
async function naturalScroll(page) {
  await page.evaluate(async () => {
    const distance = document.body.scrollHeight * (Math.random() * 0.4 + 0.3); // Scroll 30-70%
    const delay = 10 + Math.random() * 10;
    const steps = Math.floor(distance / 5);

    for (let i = 0; i < distance; i += steps) {
      window.scrollBy(0, steps);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  });
}

// Helper to simulate random mouse movements
async function naturalMouseMovement(page) {
  await page.mouse.move(Math.random() * 800, Math.random() * 600);
  await page.waitForTimeout(100 + Math.random() * 200);
  await page.mouse.down();
  await page.waitForTimeout(100 + Math.random() * 100);
  await page.mouse.up();
}

// Function to execute a series of actions on a page
async function executeActions(page, actions) {
  for (const action of actions) {
    try {
      if (action.type === 'waitForSelector') {
        await page.waitForSelector(action.selector, { timeout: 5000 });
      } else if (action.type === 'click') {
        await page.click(action.selector, { timeout: 5000 });
      }
      await page.waitForTimeout(500 + Math.random() * 1000); // Wait after action
    } catch (error) {
      console.log(`Action failed (selector: ${action.selector}): ${error.message}`);
      // Continue to the next action even if one fails
    }
  }
}

// Main function to run a single traffic task
async function runTask(url, dwellMs, scroll, actions, userAgent) {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ userAgent });
    const page = await context.newPage();
    
    await page.goto(url, { waitUntil: 'networkidle' });

    // Simulate pre-interaction behavior
    await naturalMouseMovement(page);
    
    if (actions && actions.length > 0) {
      await executeActions(page, actions);
    }

    if (scroll) {
      await naturalScroll(page);
    }
    
    // Main dwell time
    await page.waitForTimeout(dwellMs);

    await browser.close();
    return { ok: true, url };
  } catch (error) {
    if (browser) await browser.close();
    return { ok: false, url, error: error.message };
  }
}

// Function to start a new campaign
function startCampaign(urls, dwellMs, scroll, actions, userAgent) {
  const id = uuidv4();
  jobs[id] = {
    id,
    status: 'running',
    progress: 0,
    results: [],
    total: urls.length,
    startTime: Date.now(),
  };

  (async () => {
    for (let i = 0; i < urls.length; i++) {
      const result = await runTask(urls[i], dwellMs, scroll, actions, userAgent);
      jobs[id].results.push(result);
      jobs[id].progress = ((i + 1) / jobs[id].total) * 100;
    }
    jobs[id].status = 'completed';
    jobs[id].endTime = Date.now();
  })();

  return { id, status: 'running' };
}

// Functions to get campaign status and results
function getStatus(id) {
  return jobs[id] ? { id, status: jobs[id].status, progress: jobs[id].progress } : null;
}

function getResults(id) {
  return jobs[id] && jobs[id].status === 'completed' ? { id, results: jobs[id].results } : null;
}

module.exports = { startCampaign, getStatus, getResults };