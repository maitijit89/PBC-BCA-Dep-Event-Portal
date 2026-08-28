/**
 * Lightweight In-Memory Sliding Window Rate Limiter
 */
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const ipMap = new Map<string, RateLimitRecord>();

// Cleanup stale entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of ipMap.entries()) {
      if (now > record.resetTime) {
        ipMap.delete(ip);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * Checks if a request from the given identifier exceeds the limit
 * @param identifier - e.g. IP address or email
 * @param limit - Maximum allowed requests in window
 * @param windowMs - Time window in milliseconds (default: 60,000ms = 1 minute)
 */
export function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60 * 1000
): { success: boolean; remaining: number; resetInMs: number } {
  const now = Date.now();
  const record = ipMap.get(identifier);

  if (!record || now > record.resetTime) {
    ipMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return { success: true, remaining: limit - 1, resetInMs: windowMs };
  }

  if (record.count >= limit) {
    return {
      success: false,
      remaining: 0,
      resetInMs: Math.max(0, record.resetTime - now),
    };
  }

  record.count += 1;
  return {
    success: true,
    remaining: limit - record.count,
    resetInMs: Math.max(0, record.resetTime - now),
  };
}

/**
 * Extracts client IP safely from Next.js request headers.
 * Prioritizes trusted reverse-proxy edge headers and sanitizes the output.
 */
export function getClientIp(req: Request): string {
  // 1. Check direct proxy headers provided by trusted cloud edge providers
  const cfConnectingIp = req.headers.get('cf-connecting-ip');
  if (cfConnectingIp && isValidIp(cfConnectingIp.trim())) {
    return cfConnectingIp.trim();
  }

  const xRealIp = req.headers.get('x-real-ip');
  if (xRealIp && isValidIp(xRealIp.trim())) {
    return xRealIp.trim();
  }

  // 2. Multi-hop X-Forwarded-For fallback
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const rawIp = forwarded.split(',')[0].trim();
    if (isValidIp(rawIp)) {
      return rawIp;
    }
  }

  return 'anonymous-client';
}

function isValidIp(ip: string): boolean {
  if (!ip || ip.length > 45) return false;
  // Basic IPv4 or IPv6 check
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/;
  const ipv6Regex = /^[0-9a-fA-F:]{2,39}$/;
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}
