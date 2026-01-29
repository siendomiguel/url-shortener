import { createClient } from '../supabase/server';
import { GeolocationService } from './geolocation.service';

export interface LogSessionParams {
    email: string;
    success: boolean;
    ip: string;
    userAgent: string;
}

export class SessionLogService {
    /**
     * Logs an authentication attempt with geolocation data
     */
    static async logSession({ email, success, ip, userAgent }: LogSessionParams) {
        const supabase = await createClient();

        // Resolve location
        const location = await GeolocationService.getGeolocation(ip);

        const { error } = await supabase.from('session_logs').insert({
            email,
            success,
            ip,
            user_agent: userAgent,
            country: location.country,
            country_code: location.countryCode,
            city: location.city,
            region: location.region,
            isp: location.isp,
            lat: location.lat,
            lon: location.lon,
            timezone: location.timezone,
        });

        if (error) {
            console.error('Failed to log session:', error);
        }
    }
}
