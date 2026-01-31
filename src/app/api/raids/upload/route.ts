import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';

const ADMIN_EMAIL = 'baskduf@gmail.com';

async function getSession() {
    const cookieStore = await cookies();
    return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export async function POST(request: Request) {
    const session = await getSession();

    if (!session.isLoggedIn || session.ssafyId !== ADMIN_EMAIL) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
        }

        // Upload to Vercel Blob
        const blob = await put(`raids/${Date.now()}-${file.name}`, file, {
            access: 'public',
        });

        return NextResponse.json({ url: blob.url });
    } catch (error) {
        console.error('Failed to upload image:', error);
        return NextResponse.json(
            { error: 'Failed to upload image' },
            { status: 500 }
        );
    }
}
