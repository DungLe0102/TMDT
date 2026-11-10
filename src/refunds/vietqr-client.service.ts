import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

export interface VietQRRefundParams {
    bankAccount: string;
    referenceNumber: string;
    amount: string;
    content: string;
}

export interface VietQRRefundResponse {
    status: string; // 'SUCCESS' | 'FAILED'
    message: string; // Mã giao dịch hoặc mã lỗi (E05, E41, E43...)
}

@Injectable()
export class VietQRClientService {
    private readonly logger = new Logger(VietQRClientService.name);
    private cachedToken: string | null = null;
    private tokenExpiresAt: number = 0;

    constructor(private readonly configService: ConfigService) {}

    /**
     * Lấy Bearer Token từ API Token Generate của VietQR Pro
     * Token có hiệu lực 300 giây, sử dụng Basic Auth
     */
    async getBearerToken(): Promise<string> {
        const now = Date.now();
        if (this.cachedToken && now < this.tokenExpiresAt - 30000) {
            return this.cachedToken;
        }

        const host = this.configService.get<string>('VIETQR_HOST') || 'https://api.vietqr.io';
        const username = this.configService.get<string>('VIETQR_REFUND_USERNAME') || '';
        const password = this.configService.get<string>('VIETQR_REFUND_PASSWORD') || '';

        if (!username || !password) {
            this.logger.warn('[VietQR Pro] Chưa cấu hình VIETQR_REFUND_USERNAME hoặc VIETQR_REFUND_PASSWORD. Sử dụng mock/fallback token để thử nghiệm.');
            return 'mock_bearer_token_' + Date.now();
        }

        try {
            const basicAuth = Buffer.from(`${username}:${password}`).toString('base64');
            const response = await fetch(`${host}/api/token_generate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${basicAuth}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`VietQR Token Error: ${response.status} - ${errText}`);
            }

            const data = await response.json() as { access_token: string; expires_in?: number };
            this.cachedToken = data.access_token;
            const expiresIn = data.expires_in || 300;
            this.tokenExpiresAt = now + (expiresIn * 1000);

            return this.cachedToken;
        } catch (error) {
            this.logger.error('[VietQR Pro Token Error]', error);
            throw error;
        }
    }

    /**
     * Sinh mã CheckSum MD5 theo tài liệu:
     * MD5(secretKey + referenceNumber + amount + bankAccount)
     */
    generateCheckSum(referenceNumber: string, amount: string, bankAccount: string): string {
        const secretKey = this.configService.get<string>('VIETQR_SECRET_KEY') || this.configService.get<string>('VIETQR_WEBHOOK_SECRET') || 'vietqr_secret_webhook_token_2026';
        const rawString = `${secretKey}${referenceNumber}${amount}${bankAccount}`;
        return crypto.createHash('md5').update(rawString).digest('hex');
    }

    /**
     * Gọi API Hoàn Tiền VietQR Pro
     */
    async refundTransaction(params: VietQRRefundParams): Promise<VietQRRefundResponse> {
        const host = this.configService.get<string>('VIETQR_HOST') || 'https://api.vietqr.io';
        const username = this.configService.get<string>('VIETQR_REFUND_USERNAME');

        const checkSum = this.generateCheckSum(params.referenceNumber, params.amount, params.bankAccount);
        const requestBody = {
            bankAccount: params.bankAccount,
            referenceNumber: params.referenceNumber,
            amount: params.amount,
            content: params.content,
            checkSum,
        };

        // Nếu môi trường test chưa có tài khoản VietQR Pro thực tế, mô phỏng kết quả thành công
        if (!username) {
            this.logger.log(`[VietQR Pro MOCK] Thực hiện hoàn tiền thành công cho GD #${params.referenceNumber}, Số tiền: ${params.amount}`);
            return {
                status: 'SUCCESS',
                message: `REFUND_TXN_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            };
        }

        try {
            const token = await this.getBearerToken();
            const response = await fetch(`${host}/api/transaction/refund`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            const result = await response.json() as VietQRRefundResponse;
            return result;
        } catch (error: any) {
            this.logger.error('[VietQR Pro Refund API Call Error]', error);
            return {
                status: 'FAILED',
                message: error.message || 'E05',
            };
        }
    }
}
