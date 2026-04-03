// Vercel Serverless Function - ECPay payment callback
// This endpoint is called by ECPay after payment completion

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).send('Method not allowed');
    }

    try {
        const {
            MerchantTradeNo,
            RtnCode,
            RtnMsg,
            TradeAmt,
            PaymentDate,
            CheckMacValue,
        } = req.body;

        // RtnCode === '1' means payment successful
        if (RtnCode === '1') {
            console.log(`Payment success: ${MerchantTradeNo}, Amount: ${TradeAmt}`);

            // In production, you would:
            // 1. Verify CheckMacValue
            // 2. Update database with diamond balance
            // 3. Return '1|OK' to ECPay

            // For now, log the successful payment
            // The game client will poll for order status
        } else {
            console.log(`Payment failed: ${MerchantTradeNo}, Reason: ${RtnMsg}`);
        }

        // ECPay expects '1|OK' response
        res.status(200).send('1|OK');
    } catch (error) {
        console.error('ECPay callback error:', error);
        res.status(200).send('0|Error');
    }
}
