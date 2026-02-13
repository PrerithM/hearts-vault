/**
 * Hearts Vault API Worker
 * 
 * Production-grade Cloudflare Worker for Hearts Vault SaaS platform.
 * Handles submission validation, security, and D1 database operations.
 * 
 * @version 1.0.0
 * @license MIT
 */

// ===================================================================
// Configuration
// ===================================================================

const ALLOWED_ORIGIN = 'https://prerithm.github.io';
const ALLOWED_RESULTS = ['Friends', 'Love', 'Affection', 'Marriage', 'Enemies', 'Siblings'];
const MAX_NAME_LENGTH = 200;

// ===================================================================
// Security: IP Hashing
// ===================================================================

/**
 * Hash IP address using SHA-256 for privacy-preserving storage
 * @param {string} ip - IP address to hash
 * @returns {Promise<string>} - Hex-encoded SHA-256 hash
 */
async function hashIP(ip) {
  if (!ip) return 'unknown';
  
  const encoder = new TextEncoder();
  const data = encoder.encode(ip);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ===================================================================
// Validation
// ===================================================================

/**
 * Validate submission data
 * @param {Object} data - Submission data
 * @returns {Object} - { valid: boolean, error?: string }
 */
function validateSubmission(data) {
  // Check required fields exist
  if (!data.name || !data.crush || !data.result) {
    return { valid: false, error: 'Missing required fields: name, crush, result' };
  }

  // Validate name lengths
  if (data.name.length > MAX_NAME_LENGTH) {
    return { valid: false, error: `Name exceeds ${MAX_NAME_LENGTH} characters` };
  }
  if (data.crush.length > MAX_NAME_LENGTH) {
    return { valid: false, error: `Crush name exceeds ${MAX_NAME_LENGTH} characters` };
  }

  // Validate name is not empty after trimming
  if (data.name.trim().length === 0) {
    return { valid: false, error: 'Name cannot be empty' };
  }
  if (data.crush.trim().length === 0) {
    return { valid: false, error: 'Crush name cannot be empty' };
  }

  // Validate result is in allowed list
  if (!ALLOWED_RESULTS.includes(data.result)) {
    return { valid: false, error: `Invalid result. Must be one of: ${ALLOWED_RESULTS.join(', ')}` };
  }

  return { valid: true };
}

// ===================================================================
// CORS Handling
// ===================================================================

/**
 * Create CORS headers
 * @param {string} origin - Request origin
 * @returns {Object} - Headers object
 */
function corsHeaders(origin) {
  // Only allow GitHub Pages origin
  if (origin && origin.toLowerCase() === ALLOWED_ORIGIN) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    };
  }
  
  // Block all other origins
  return {};
}

/**
 * Handle OPTIONS preflight request
 * @param {Request} request
 * @returns {Response}
 */
function handleOptions(request) {
  const origin = request.headers.get('Origin');
  
  if (origin && origin.toLowerCase() === ALLOWED_ORIGIN) {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(origin),
    });
  }
  
  // Reject preflight from non-allowed origins
  return new Response('Forbidden', { status: 403 });
}

// ===================================================================
// Database Operations
// ===================================================================

/**
 * Insert submission into D1 database
 * @param {D1Database} db - D1 database instance
 * @param {Object} submission - Submission data
 * @returns {Promise<Object>} - Database result
 */
async function insertSubmission(db, submission) {
  const query = `
    INSERT INTO submissions (
      id, timestamp, user_name, crush_name, result,
      device, screen, language, browser, os,
      country, city, ip_hash,
      session_id, referrer, page
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    submission.id,
    submission.timestamp,
    submission.user_name,
    submission.crush_name,
    submission.result,
    submission.device,
    submission.screen,
    submission.language,
    submission.browser,
    submission.os,
    submission.country,
    submission.city,
    submission.ip_hash,
    submission.session_id,
    submission.referrer,
    submission.page,
  ];

  return await db.prepare(query).bind(...params).run();
}

/**
 * Increment stats counter
 * @param {D1Database} db - D1 database instance
 * @param {string} key - Stats key to increment
 * @returns {Promise<Object>} - Database result
 */
async function incrementStat(db, key) {
  const query = `
    UPDATE stats
    SET value = value + 1
    WHERE key = ?
  `;
  
  return await db.prepare(query).bind(key).run();
}

// ===================================================================
// Main Request Handler
// ===================================================================

/**
 * Handle POST /submit endpoint
 * @param {Request} request
 * @param {Object} env - Worker environment (includes DB binding)
 * @returns {Promise<Response>}
 */
async function handleSubmit(request, env) {
  const origin = request.headers.get('Origin');
  
  // CORS check
  if (!origin || origin.toLowerCase() !== ALLOWED_ORIGIN) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Origin not allowed' 
    }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Parse request body
    const data = await request.json();

    // Validate submission
    const validation = validateSubmission(data);
    if (!validation.valid) {
      return new Response(JSON.stringify({
        success: false,
        error: validation.error,
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders(origin),
        },
      });
    }

    // Get client IP and hash it
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    const ipHash = await hashIP(clientIP);

    // Get geolocation from Cloudflare
    const country = request.cf?.country || 'unknown';
    const city = request.cf?.city || 'unknown';

    // Generate unique submission ID
    const submissionId = `evt_${Date.now()}`;
    
    // Generate ISO-8601 timestamp
    const timestamp = new Date().toISOString();

    // Build submission object
    const submission = {
      id: submissionId,
      timestamp: timestamp,
      user_name: data.name.trim(),
      crush_name: data.crush.trim(),
      result: data.result,
      device: data.client?.device || null,
      screen: data.client?.screen || null,
      language: data.client?.language || null,
      browser: data.client?.browser || null,
      os: data.client?.os || null,
      country: country,
      city: city,
      ip_hash: ipHash,
      session_id: data.session?.sessionId || null,
      referrer: data.session?.referrer || null,
      page: data.session?.page || '/',
    };

    // Insert into database
    await insertSubmission(env.DB, submission);
    
    // Increment stats
    await incrementStat(env.DB, 'totalSubmissions');

    // Return success response
    return new Response(JSON.stringify({
      success: true,
      submissionId: submissionId,
      timestamp: timestamp,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders(origin),
      },
    });

  } catch (error) {
    console.error('Error processing submission:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error',
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders(origin),
      },
    });
  }
}

// ===================================================================
// Worker Entry Point
// ===================================================================

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Handle OPTIONS preflight
    if (request.method === 'OPTIONS') {
      return handleOptions(request);
    }

    // Handle POST /submit
    if (request.method === 'POST' && url.pathname === '/submit') {
      return handleSubmit(request, env);
    }

    // Handle all other requests
    return new Response(JSON.stringify({
      success: false,
      error: 'Not found',
    }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders(request.headers.get('Origin')),
      },
    });
  },
};
