export interface GeolocationData {
    status: 'success' | 'fail';
    country?: string;
    countryCode?: string;
    region?: string;
    regionName?: string;
    city?: string;
    zip?: string;
    lat?: number;
    lon?: number;
    timezone?: string;
    isp?: string;
    org?: string;
    as?: string;
    query: string;
    message?: string;
}

export interface ResolvedLocation {
    country: string;
    countryCode: string;
    region: string;
    city: string;
    lat: number | null;
    lon: number | null;
    timezone: string;
    isp: string;
}
