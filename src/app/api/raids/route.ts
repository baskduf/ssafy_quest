import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { RaidStatus } from '@prisma/client';

const ADMIN_EMAIL = 'baskduf@gmail.com';

async function getSession() {
    const cookieStore = await cookies();
    return getIronSession<SessionData>(cookieStore, sessionOptions);
}

// GET: 레이드 목록 조회
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as RaidStatus | null;

    const where = status ? { status } : {};

    const raids = await prisma.raid.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
            _count: {
                select: { participations: true }
            }
        }
    });

    return NextResponse.json(raids);
}

// POST: 새 레이드 생성 (관리자 전용)
export async function POST(request: Request) {
    const session = await getSession();

    if (!session.isLoggedIn || session.ssafyId !== ADMIN_EMAIL) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const {
            title,
            description,
            imageUrl,
            problemId,
            maxHp,
            damagePerHit = 1,
            bonusPoint = 0,
            startAt,
            endAt,
        } = body;

        // Validation
        if (!title || !problemId || !maxHp || !startAt || !endAt) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const raid = await prisma.raid.create({
            data: {
                title,
                description,
                imageUrl,
                problemId: parseInt(problemId),
                maxHp: parseInt(maxHp),
                currentHp: parseInt(maxHp),
                damagePerHit: parseInt(damagePerHit),
                bonusPoint: parseInt(bonusPoint),
                startAt: new Date(startAt),
                endAt: new Date(endAt),
            },
        });

        return NextResponse.json(raid, { status: 201 });
    } catch (error) {
        console.error('Failed to create raid:', error);
        return NextResponse.json(
            { error: 'Failed to create raid' },
            { status: 500 }
        );
    }
}
