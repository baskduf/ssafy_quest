/**
 * SSAFY 로그인 검증 유틸리티
 * Python ssafy_login.py를 TypeScript로 변환
 */

import * as cheerio from 'cheerio';

interface SSAFYLoginResult {
    success: boolean;
    message: string;
}

export async function verifySsafyLogin(
    userId: string,
    userPwd: string
): Promise<SSAFYLoginResult> {
    try {
        // 1. 로그인 페이지 접속 → 세션 쿠키 + CSRF 토큰 획득
        const loginPageUrl = 'https://edu.ssafy.com/comm/login/SecurityLoginForm.do';

        const headers = {
            'User-Agent':
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        };

        const pageResponse = await fetch(loginPageUrl, {
            method: 'GET',
            headers,
        });

        if (!pageResponse.ok) {
            return { success: false, message: '로그인 페이지 접속 실패' };
        }

        // 쿠키 추출
        const cookies = pageResponse.headers.get('set-cookie') || '';

        const pageHtml = await pageResponse.text();
        const $ = cheerio.load(pageHtml);

        // CSRF 토큰 파싱
        let csrfToken: string | null = null;

        // meta 태그에서 찾기
        const csrfMeta = $('meta[name="_csrf"]').attr('content');
        if (csrfMeta) {
            csrfToken = csrfMeta;
        } else {
            // hidden input에서 찾기
            const csrfInput = $('input[name="_csrf"]').val();
            if (csrfInput) {
                csrfToken = csrfInput as string;
            }
        }

        // 2. 로그인 요청
        const loginUrl = 'https://edu.ssafy.com/comm/login/SecurityLoginCheck.do';

        const loginHeaders: Record<string, string> = {
            Accept: 'application/json, text/javascript, */*; q=0.01',
            'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'X-Requested-With': 'XMLHttpRequest',
            'User-Agent':
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
            Referer: loginPageUrl,
            Origin: 'https://edu.ssafy.com',
            Cookie: cookies,
        };

        if (csrfToken) {
            loginHeaders['X-CSRF-TOKEN'] = csrfToken;
        }

        const loginData = new URLSearchParams({
            userId,
            userPwd,
            idSave: 'on',
        });

        const loginResponse = await fetch(loginUrl, {
            method: 'POST',
            headers: loginHeaders,
            body: loginData.toString(),
        });

        if (!loginResponse.ok) {
            return {
                success: false,
                message: `로그인 요청 실패 (status: ${loginResponse.status})`,
            };
        }

        // 3. 응답 파싱
        const result = await loginResponse.json();

        if (result.status === 'success') {
            return { success: true, message: result.message || '로그인 성공' };
        } else {
            return { success: false, message: result.message || '로그인 실패' };
        }
    } catch (error) {
        console.error('SSAFY login error:', error);
        return {
            success: false,
            message: `로그인 처리 중 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
        };
    }
}
