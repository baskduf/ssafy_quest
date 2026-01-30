import { NextResponse } from "next/server";
import { verifySsafyLogin } from "@/lib/ssafy-auth";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, userPwd } = body;

        if (!userId || !userPwd) {
            return NextResponse.json(
                { success: false, message: "SSAFY ID와 비밀번호를 입력해주세요." },
                { status: 400 }
            );
        }

        const result = await verifySsafyLogin(userId, userPwd);

        if (result.success) {
            return NextResponse.json({ success: true, message: result.message });
        } else {
            return NextResponse.json(
                { success: false, message: result.message },
                { status: 401 }
            );
        }
    } catch (error) {
        console.error("SSAFY auth API error:", error);
        return NextResponse.json(
            { success: false, message: "서버 오류가 발생했습니다." },
            { status: 500 }
        );
    }
}
