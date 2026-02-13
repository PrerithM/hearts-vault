/**
 * Hearts Vault - Frontend Logic
 * 
 * Implements FLAMES calculator, client metadata collection,
 * API integration, and UI state management.
 * 
 * @version 1.0.0
 */

// ===================================================================
// Configuration
// ===================================================================

const API_ENDPOINT = 'https://hearts-vault-api.prerithm87.workers.dev';

// ===================================================================
// FLAMES Algorithm
// ===================================================================

/**
 * Calculate FLAMES result from two names
 * @param {string} name1 - First person's name
 * @param {string} name2 - Second person's name
 * @returns {string} - FLAMES result
 */
function calculateFLAMES(name1, name2) {
  // Normalize names (lowercase, remove spaces)
  const n1 = name1.toLowerCase().replace(/\s+/g, '');
  const n2 = name2.toLowerCase().replace(/\s+/g, '');
  
  // Create frequency maps
  const freq1 = {};
  const freq2 = {};
  
  for (let char of n1) {
    freq1[char] = (freq1[char] || 0) + 1;
  }
  
  for (let char of n2) {
    freq2[char] = (freq2[char] || 0) + 1;
  }
  
  // Count remaining letters after crossing out common ones
  let remainingCount = 0;
  
  // Add unique letters from name1
  for (let char in freq1) {
    const commonCount = Math.min(freq1[char], freq2[char] || 0);
    remainingCount += freq1[char] - commonCount;
  }
  
  // Add unique letters from name2
  for (let char in freq2) {
    const commonCount = Math.min(freq2[char], freq1[char] || 0);
    remainingCount += freq2[char] - commonCount;
  }
  
  // FLAMES options
  const flames = ['Friends', 'Love', 'Affection', 'Marriage', 'Enemies', 'Siblings'];
  
  // If no remaining letters, default to Love
  if (remainingCount === 0) {
    return 'Love';
  }
  
  // Calculate result using modulo
  const index = (remainingCount - 1) % flames.length;
  return flames[index];
}

// ===================================================================
// Client Metadata Collection
// ===================================================================

/**
 * Detect device type
 * @returns {string} - 'mobile', 'tablet', or 'desktop'
 */
function detectDevice() {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

/**
 * Get screen resolution
 * @returns {string} - Screen resolution (e.g., "1920x1080")
 */
function getScreenResolution() {
  return `${window.screen.width}x${window.screen.height}`;
}

/**
 * Get browser name
 * @returns {string} - Browser name
 */
function getBrowserName() {
  const ua = navigator.userAgent;
  if (ua.indexOf('Firefox') > -1) return 'Firefox';
  if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) return 'Opera';
  if (ua.indexOf('Trident') > -1) return 'IE';
  if (ua.indexOf('Edge') > -1) return 'Edge';
  if (ua.indexOf('Chrome') > -1) return 'Chrome';
  if (ua.indexOf('Safari') > -1) return 'Safari';
  return 'Unknown';
}

/**
 * Get OS name
 * @returns {string} - Operating system name
 */
function getOSName() {
  const ua = navigator.userAgent;
  if (ua.indexOf('Win') > -1) return 'Windows';
  if (ua.indexOf('Mac') > -1) return 'MacOS';
  if (ua.indexOf('Linux') > -1) return 'Linux';
  if (ua.indexOf('Android') > -1) return 'Android';
  if (ua.indexOf('iOS') > -1 || ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) return 'iOS';
  return 'Unknown';
}

/**
 * Collect all client metadata
 * @returns {Object} - Client metadata object
 */
function collectClientMetadata() {
  return {
    device: detectDevice(),
    screen: getScreenResolution(),
    language: navigator.language || 'en',
    browser: getBrowserName(),
    os: getOSName(),
  };
}

/**
 * Generate simple session ID
 * @returns {string} - Session ID
 */
function generateSessionId() {
  return `s_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ===================================================================
// API Integration
// ===================================================================

/**
 * Submit data to backend API
 * @param {Object} data - Submission data
 * @returns {Promise<Object>} - API response
 */
async function submitToAPI(data) {
  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(result.error || 'Submission failed');
  }
  
  return result;
}

// ===================================================================
// UI State Management
// ===================================================================

/**
 * Show loading overlay
 */
function showLoading() {
  const overlay = document.getElementById('loadingOverlay');
  overlay.style.display = 'flex';
}

/**
 * Hide loading overlay
 */
function hideLoading() {
  const overlay = document.getElementById('loadingOverlay');
  overlay.style.display = 'none';
}

/**
 * Show error message
 * @param {string} message - Error message to display
 */
function showError(message) {
  const errorElement = document.getElementById('errorMessage');
  const errorText = document.getElementById('errorText');
  errorText.textContent = message;
  errorElement.style.display = 'flex';
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    errorElement.style.display = 'none';
  }, 5000);
}

/**
 * Show result section
 * @param {string} result - FLAMES result
 * @param {string} userName - User's name
 * @param {string} crushName - Crush's name
 */
function showResult(result, userName, crushName) {
  const resultSection = document.getElementById('resultSection');
  const resultValue = document.getElementById('resultValue');
  const resultNames = document.getElementById('resultNames');
  
  resultValue.textContent = result;
  resultNames.textContent = `${userName} & ${crushName}`;
  
  resultSection.style.display = 'block';
  
  // Scroll to result
  resultSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/**
 * Hide result section
 */
function hideResult() {
  const resultSection = document.getElementById('resultSection');
  resultSection.style.display = 'none';
}

/**
 * Reset form
 */
function resetForm() {
  const form = document.getElementById('flamesForm');
  form.reset();
  hideResult();
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===================================================================
// Form Handler
// ===================================================================

/**
 * Handle form submission
 * @param {Event} event - Form submit event
 */
async function handleFormSubmit(event) {
  event.preventDefault();
  
  // Get form values
  const userName = document.getElementById('userName').value.trim();
  const crushName = document.getElementById('crushName').value.trim();
  
  // Validate inputs
  if (!userName || !crushName) {
    showError('Please enter both names');
    return;
  }
  
  if (userName.length > 200 || crushName.length > 200) {
    showError('Names must be 200 characters or less');
    return;
  }
  
  try {
    // Show loading state
    showLoading();
    
    // Calculate FLAMES result
    const result = calculateFLAMES(userName, crushName);
    
    // Collect client metadata
    const clientMetadata = collectClientMetadata();
    
    // Generate session ID
    const sessionId = generateSessionId();
    
    // Prepare submission data
    const submissionData = {
      name: userName,
      crush: crushName,
      result: result,
      client: clientMetadata,
      session: {
        sessionId: sessionId,
        referrer: document.referrer || 'direct',
        page: window.location.pathname,
      },
    };
    
    // Submit to API
    await submitToAPI(submissionData);
    
    // Hide loading
    hideLoading();
    
    // Show result
    showResult(result, userName, crushName);
    
  } catch (error) {
    console.error('Submission error:', error);
    hideLoading();
    showError(error.message || 'Something went wrong. Please try again.');
  }
}

// ===================================================================
// Event Listeners & Initialization
// ===================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Form submission
  const form = document.getElementById('flamesForm');
  form.addEventListener('submit', handleFormSubmit);
  
  // Calculate again button
  const calculateAgainBtn = document.getElementById('calculateAgain');
  calculateAgainBtn.addEventListener('click', resetForm);
  
  // Add smooth focus effects
  const inputs = document.querySelectorAll('.input-field');
  inputs.forEach(input => {
    input.addEventListener('focus', () => {
      input.parentElement.classList.add('focused');
    });
    
    input.addEventListener('blur', () => {
      input.parentElement.classList.remove('focused');
    });
  });
  
  // Prevent double submission
  form.addEventListener('submit', (e) => {
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    setTimeout(() => {
      submitBtn.disabled = false;
    }, 2000);
  });
});
