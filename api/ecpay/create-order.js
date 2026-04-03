// Vercel Serverless Function - Create ECPay order
// ECPay (綠界) test environment integration
// MerchantID: 3002607 (test)
// HashKey: pwFHCqoQZGmho4w6 (test)
// HashIV: EkRm7iFT261dpevs (test)

import crypto from 'crypto';

const ECPAY_CONFIG = {
    MerchantID: '3002607',
    HashKey: 'pwFHCqoQZGmho4w6',
    HashIV: 'EkRm7iFT261dpevs',
    PaymentURL: 'https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5',
};

function generateCheckMacValue(params) {
    // Step 1: Sort by key
    const sorted = Object.keys(params).sort().reduce((acc, key) => {
        acc[key] = params[key];
        return acc;
    }, {});

    // Step 2: Build query string
    let raw = `HashKey=${ECPAY_CONFIG.HashKey}`;
    for (const [key, value] of Object.entries(sorted)) {
        raw += `&${key}=${value}`;
    }
    raw += `&HashIV=${ECPAY_CONFIG.HashIV}`;

    // Step 3: URL encode
    raw = encodeURIComponent(raw).toLowerCase();

    // Step 4: SHA256 hash
    const hash = crypto.createHash('sha256').update(raw).digest('hex').toUpperCase();
    return hash;
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { packageId, diamonds, amount } = req.body;

        const tradeNo = `TA${Date.now()}`;
        const tradeDate = new Date().toLocaleDateString('zh-TW', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
        }).replace(/\//g, '/');

        const params = {
            MerchantID: ECPAY_CONFIG.MerchantID,
            MerchantTradeNo: tradeNo,
            MerchantTradeDate: tradeDate,
            PaymentType: 'aio',
            TotalAmount: amount.toString(),
            TradeDesc: encodeURIComponent('台北覺醒者RPG鑽石充值'),
            ItemName: `鑽石x${diamonds}`,
            ReturnURL: `${process.env.VERCEL_URL || 'https://your-vercel-app.vercel.app'}/api/ecpay/callback`,
            ClientBackURL: `${process.env.GAME_URL || 'https://your-github-pages.github.io/taipei-awakener'}`,
            ChoosePayment: 'Credit',
            EncryptType: '1',
        };

        params.CheckMacValue = generateCheckMacValue(params);

        res.status(200).json({
            paymentUrl: ECPAY_CONFIG.PaymentURL,
            params,
            tradeNo,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
