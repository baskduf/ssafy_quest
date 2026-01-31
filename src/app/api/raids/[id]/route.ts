import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { prisma } from '@/lib/prisma';

const ADMIN_EMAIL = 'baskduf@gmail.com';

async function getSession() {
    const cookieStore = await cookies();
    return getIronSession<SessionData>(cookieStore, sessionOptions);
}

// GET: 특정 레이드 상세 조회
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const raid = await prisma.raid.findUnique({
        where: { id },
        include: {
            participations: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            bojHandle: true,
                            campus: true,
                            classNum: true,
                            profileImage: true,
                        }
                    }
                },
                orderBy: { solvedAt: 'asc' }
            },
            _count: {
                select: { participations: true }
            }
        }
    });

    if (!raid) {
        return NextResponse.json({ error: 'Raid not found' }, { status: 404 });
    }

    // 퍼스트 블러드 찾기
    const firstBlood = raid.participations.find(p => p.isSolved);

    return NextResponse.json({
        ...raid,
        firstBlood: firstBlood ? {
            userId: firstBlood.userId,
            userName: firstBlood.user.name,
            solvedAt: firstBlood.solvedAt,
        } : null,
        solvedCount: raid.participations.filter(p => p.isSolved).length,
    });
}

// PATCH: 레이드 수정 (관리자 전용)
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession();
    const { id } = await params;

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
            currentHp,
            damagePerHit,
            status,
            startAt,
            endAt,
        } = body;

        const updateData: Record<string, unknown> = {};

        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
        if (problemId !== undefined) updateData.problemId = parseInt(problemId);
        if (maxHp !== undefined) updateData.maxHp = parseInt(maxHp);
        if (currentHp !== undefined) updateData.currentHp = parseInt(currentHp);
        if (damagePerHit !== undefined) updateData.damagePerHit = parseInt(damagePerHit);
        if (status !== undefined) updateData.status = status;
        if (startAt !== undefined) updateData.startAt = new Date(startAt);
        if (endAt !== undefined) updateData.endAt = new Date(endAt);

        // Check if status is being changed to SUCCESS, need to distribute rewards
        if (status === 'SUCCESS') {
            const currentRaid = await prisma.raid.findUnique({
                where: { id },
                select: { status: true, bonusPoint: true }
            });

            // Only distribute rewards if status is actually changing to SUCCESS
            if (currentRaid && currentRaid.status !== 'SUCCESS' && currentRaid.bonusPoint > 0) {
                // Get all participants who solved but haven't been awarded
                const participants = await prisma.raidParticipation.findMany({
                    where: { raidId: id, isSolved: true, pointAwarded: false }
                });

                for (const p of participants) {
                    await prisma.user.update({
                        where: { id: p.userId },
                        data: { totalPoint: { increment: currentRaid.bonusPoint } }
                    });
                    await prisma.raidParticipation.update({
                        where: { id: p.id },
                        data: { pointAwarded: true }
                    });
                }
            }
        }

        const raid = await prisma.raid.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json(raid);
    } catch (error) {
        console.error('Failed to update raid:', error);
        return NextResponse.json(
            { error: 'Failed to update raid' },
            { status: 500 }
        );
    }
}

// DELETE: 레이드 삭제 (관리자 전용)
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession();
    const { id } = await params;

    if (!session.isLoggedIn || session.ssafyId !== ADMIN_EMAIL) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await prisma.raid.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete raid:', error);
        return NextResponse.json(
            { error: 'Failed to delete raid' },
            { status: 500 }
        );
    }
}
