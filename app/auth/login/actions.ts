'use server';

import { createClient } from '@/lib/supabase/server';
import { SessionLogService } from '@/lib/services/session-log.service';
import { headers } from 'next/headers';

export async function loginAction(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const supabase = await createClient();
    const headersList = await headers();

    const ip = headersList.get('x-forwarded-for')?.split(',')[0] || headersList.get('x-real-ip') || 'unknown';
    const userAgent = headersList.get('user-agent') || '';

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    // Log the attempt
    await SessionLogService.logSession({
        email,
        success: !error,
        ip,
        userAgent,
    });

    if (error) {
        return { error: error.message };
    }

    return { success: true };
}

export async function signUpAction(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const origin = (await headers()).get('origin');

    const supabase = await createClient();
    const headersList = await headers();

    const ip = headersList.get('x-forwarded-for')?.split(',')[0] || headersList.get('x-real-ip') || 'unknown';
    const userAgent = headersList.get('user-agent') || '';

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${origin}/auth/confirm`,
        },
    });

    // Log the attempt
    await SessionLogService.logSession({
        email,
        success: !error,
        ip,
        userAgent,
    });

    if (error) {
        return { error: error.message };
    }

    return { success: true };
}
