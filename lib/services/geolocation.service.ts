import { GeolocationData, ResolvedLocation } from '../types/geolocation';

export class GeolocationService {
    private static readonly API_URL = 'http://ip-api.com/json';

    /**
     * Detects if an IP is private or local
     */
    private static isPrivateIp(ip: string): boolean {
        return (
            ip === 'localhost' ||
            ip === '127.0.0.1' ||
            ip === '::1' ||
            ip.startsWith('192.168.') ||
            ip.startsWith('10.') ||
            ip.startsWith('172.16.') || // Simplification of 172.16.0.0/12
            ip === 'unknown'
        );
    }

    /**
     * Resolves geolocation for a given IP
     */
    static async getGeolocation(ip: string): Promise<ResolvedLocation> {
        const unknownLocation: ResolvedLocation = {
            country: 'Unknown',
            countryCode: 'Unknown',
            region: 'Unknown',
            city: 'Unknown',
            lat: null,
            lon: null,
            timezone: 'Unknown',
            isp: 'Unknown',
        };

        if (this.isPrivateIp(ip)) {
            return unknownLocation;
        }

        try {
            const response = await fetch(`${this.API_URL}/${ip}`);
            if (!response.ok) return unknownLocation;

            const data: GeolocationData = await response.json();

            if (data.status === 'fail') {
                return unknownLocation;
            }

            return {
                country: data.country || 'Unknown',
                countryCode: data.countryCode || 'Unknown',
                region: data.regionName || 'Unknown',
                city: data.city || 'Unknown',
                lat: data.lat ?? null,
                lon: data.lon ?? null,
                timezone: data.timezone || 'Unknown',
                isp: data.isp || 'Unknown',
            };
        } catch (error) {
            console.error('Geolocation lookup failed:', error);
            return unknownLocation;
        }
    }
}
