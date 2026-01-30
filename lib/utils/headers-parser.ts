export function parseUserAgent(ua: string) {
    let browser = 'Unknown';
    let os = 'Unknown';
    let deviceType = 'Desktop';

    // Basic Browser Detection
    if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('SamsungBrowser')) browser = 'Samsung Browser';
    else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';
    else if (ua.includes('Trident')) browser = 'Internet Explorer';
    else if (ua.includes('Edge')) browser = 'Edge';
    else if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Safari')) browser = 'Safari';

    // Basic OS Detection
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad') || ua.includes('iPod')) os = 'iOS';
    else if (ua.includes('Mac OS X')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';

    // Basic Device Type Detection
    if (/mobile/i.test(ua)) deviceType = 'Mobile';
    if (/tablet/i.test(ua)) deviceType = 'Tablet';
    if (/bot|crawler|spider|slurp|google|bing|yandex|baidu|duckduckgo/i.test(ua)) deviceType = 'Bot';

    return { browser, os, deviceType };
}

export function parseLanguage(acceptLanguage: string | null) {
    if (!acceptLanguage) return 'Unknown';
    return acceptLanguage.split(',')[0].split(';')[0];
}
