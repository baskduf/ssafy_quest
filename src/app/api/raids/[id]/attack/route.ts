import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { checkProblemSolved } from '@/lib/solved-ac';
import { RaidStatus } from '@prisma/client';

const COOLDOWN_MS = 60 * 1000; // 1분 쿨타임

async function getSession() {
    const cookieStore = await cookies();
    return getIronSession<SessionData>(cookieStore, sessionOptions);
}

// POST: 보스 공격
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession();
    const { id: raidId } = await params;

    // Step 1: 로그인 확인
    if (!session.isLoggedIn || !session.userId || !session.bojHandle) {
        return NextResponse.json(
            { error: '로그인이 필요합니다.', code: 'NOT_LOGGED_IN' },
            { status: 401 }
        );
    }

    const userId = session.userId;
    const bojHandle = session.bojHandle;

    // Step 2: 레이드 상태 검증
    const raid = await prisma.raid.findUnique({
        where: { id: raidId },
    });

    if (!raid) {
        return NextResponse.json(
            { error: '레이드를 찾을 수 없습니다.', code: 'RAID_NOT_FOUND' },
            { status: 404 }
        );
    }

    if (raid.status !== RaidStatus.ACTIVE) {
        return NextResponse.json(
            { error: '현재 진행 중인 레이드가 아닙니다.', code: 'RAID_NOT_ACTIVE' },
            { status: 400 }
        );
    }

    const now = new Date();
    if (now < raid.startAt || now > raid.endAt) {
        return NextResponse.json(
            { error: '레이드 진행 시간이 아닙니다.', code: 'RAID_TIME_INVALID' },
            { status: 400 }
        );
    }

    // Step 3: 기존 참여 기록 확인
    let participation = await prisma.raidParticipation.findUnique({
        where: {
            raidId_userId: { raidId, userId }
        }
    });

    // 이미 공격 성공한 경우
    if (participation?.isSolved) {
        return NextResponse.json(
            { error: '이미 공격에 성공했습니다!', code: 'ALREADY_SOLVED' },
            { status: 400 }
        );
    }

    // Step 4: Rate limit 확인 (1분 쿨타임)
    if (participation?.lastAttemptAt) {
        const timeSinceLastAttempt = now.getTime() - participation.lastAttemptAt.getTime();
        if (timeSinceLastAttempt < COOLDOWN_MS) {
            const remainingSeconds = Math.ceil((COOLDOWN_MS - timeSinceLastAttempt) / 1000);
            return NextResponse.json(
                {
                    error: `${remainingSeconds}초 후에 다시 시도해주세요.`,
                    code: 'COOLDOWN',
                    remainingSeconds
                },
                { status: 429 }
            );
        }
    }

    // Step 5: solved.ac API 호출
    let isSolved: boolean;
    try {
        isSolved = await checkProblemSolved(bojHandle, raid.problemId);
    } catch (error) {
        console.error('Solved.ac API Error:', error);
        return NextResponse.json(
            { error: '백준 데이터를 가져올 수 없습니다. 잠시 후 다시 시도해주세요.', code: 'API_ERROR' },
            { status: 503 }
        );
    }

    // Step 6: 트랜잭션으로 DB 업데이트
    try {
        const result = await prisma.$transaction(async (tx) => {
            // 참여 기록 upsert
            participation = await tx.raidParticipation.upsert({
                where: {
                    raidId_userId: { raidId, userId }
                },
                create: {
                    raidId,
                    userId,
                    isSolved,
                    solvedAt: isSolved ? now : null,
                    lastAttemptAt: now,
                },
                update: {
                    isSolved: isSolved || undefined,
                    solvedAt: isSolved ? now : undefined,
                    lastAttemptAt: now,
                }
            });

            // 공격 성공 시 HP 차감
            if (isSolved) {
                const updatedRaid = await tx.raid.update({
                    where: { id: raidId },
                    data: {
                        currentHp: {
                            decrement: raid.damagePerHit
                        }
                    }
                });

                // HP가 0 이하면 SUCCESS로 변경 및 보상 지급
                if (updatedRaid.currentHp <= 0) {
                    await tx.raid.update({
                        where: { id: raidId },
                        data: {
                            status: RaidStatus.SUCCESS,
                            currentHp: 0
                        }
                    });

                    // 보상 지급: 모든 공격 성공 유저에게 bonusPoint 추가
                    if (raid.bonusPoint > 0) {
                        const participants = await tx.raidParticipation.findMany({
                            where: { raidId, isSolved: true, pointAwarded: false }
                        });

                        for (const p of participants) {
                            await tx.user.update({
                                where: { id: p.userId },
                                data: { totalPoint: { increment: raid.bonusPoint } }
                            });
                            await tx.raidParticipation.update({
                                where: { id: p.id },
                                data: { pointAwarded: true }
                            });
                        }
                    }
                }

                return { success: true, isSolved: true, damage: raid.damagePerHit, newHp: Math.max(0, updatedRaid.currentHp) };
            }

            return { success: true, isSolved: false };
        });

        if (result.isSolved) {
            return NextResponse.json({
                message: '공격 성공! 보스에게 데미지를 입혔습니다!',
                ...result
            });
        } else {
            return NextResponse.json({
                message: '문제를 아직 풀지 않았습니다. 백준에서 문제를 풀고 다시 시도하세요!',
                ...result
            });
        }
    } catch (error) {
        console.error('Transaction Error:', error);
        return NextResponse.json(
            { error: '공격 처리 중 오류가 발생했습니다.', code: 'TRANSACTION_ERROR' },
            { status: 500 }
        );
    }
}
