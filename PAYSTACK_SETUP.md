# Paystack Payment Integration Setup Guide

## Overview

This guide will help you complete the Paystack payment integration for Perpway. The integration allows users to pay GHS 2.00 to unlock driver contact information on the ride-sharing platform.

## What's Already Done 

1.  **Paystack Subaccount Created**: `ACCT_g9ti5pumjxq650f`
   - Linked to MTN MoMo: 0591765158
   - All payments will settle to this account

2.  **Backend Integration Complete**:
   - Payment routes created in `backend/routes/payments.js`
   - Verification endpoint implemented
   - Webhook handler ready
   - axios dependency installed

3.  **Frontend Integration Complete**:
   - PaymentModal updated with react-paystack
   - Beautiful UI with dark mode support
   - Mobile Money and Card payment options
   - react-paystack dependency installed

4.  **Environment Files Created**:
   - `backend/.env` - Ready for secret key
   - `frontend/.env` - Ready for public key
   - Both files ignored in git

## What You Need to Do <¯

### Step 1: Get Your Paystack API Keys

1. **Go to Paystack Dashboard**: https://dashboard.paystack.com

2. **Login** with your account credentials

3. **Navigate to Settings**:
   - Click **"Settings"** in the left sidebar
   - Click **"API Keys & Webhooks"** tab at the top

4. **Copy Your TEST Keys**:

   You'll see two keys on this page:

   - **Test Public Key**: Starts with `pk_test_...`
     - Example: `pk_test_abc123xyz456...`
     - This goes in `frontend/.env`

   - **Test Secret Key**: Starts with `sk_test_...`
     - Example: `sk_test_xyz789abc123...`
     - This goes in `backend/.env`

   **IMPORTANT**:
   - Start with TEST keys for development
   - NEVER share your secret key or commit it to git
   - Live keys come later after testing

### Step 2: Update Backend Environment Variables

1. **Open** `backend/.env` in your code editor

2. **Find this line** (around line 80):
   ```bash
   PAYSTACK_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
   ```

3. **Replace** `sk_test_YOUR_SECRET_KEY_HERE` with your actual Test Secret Key:
   ```bash
   PAYSTACK_SECRET_KEY=sk_test_xyz789abc123...
   ```

4. **Save the file**

### Step 3: Update Frontend Environment Variables

1. **Open** `frontend/.env` in your code editor

2. **Find this line** (around line 16):
   ```bash
   REACT_APP_PAYSTACK_PUBLIC_KEY=pk_test_YOUR_PUBLIC_KEY_HERE
   ```

3. **Replace** `pk_test_YOUR_PUBLIC_KEY_HERE` with your actual Test Public Key:
   ```bash
   REACT_APP_PAYSTACK_PUBLIC_KEY=pk_test_abc123xyz456...
   ```

4. **Save the file**

### Step 4: Test the Payment Flow

1. **Start the Backend**:
   ```bash
   cd backend
   node server.js
   ```

   You should see:
   ```
    MongoDB connected
    Server running on http://localhost:5000
   ```

2. **Start the Frontend** (in a new terminal):
   ```bash
   cd frontend
   npm start
   ```

   Browser should open to: http://localhost:2000

3. **Test Payment**:
   - Go to http://localhost:2000/drivers
   - Click **"View Contact"** on any driver
   - The payment modal will appear
   - **Choose a payment method**:
     - Mobile Money OR Card
   - Click **"Pay Now"** button
   - Paystack popup will open

4. **Use Test Payment Methods**:

   **For Card Payments**:
   - Card Number: `4084084084084081`
   - CVV: `408`
   - Expiry: Any future date (e.g., 12/26)
   - PIN: `0000`
   - OTP: `123456`

   **For Mobile Money** (Test Mode):
   - Phone: `0241234567`
   - Follow Paystack's test prompts
   - Payment will auto-succeed in test mode

5. **Verify Success**:
   - After payment, you should see:  "Payment Successful!"
   - Backend console should show: ` Payment verified successfully`
   - Driver contact should be unlocked and visible

## Troubleshooting ='

### Issue: Paystack Button Not Appearing

**Solutions**:
- Check that `REACT_APP_PAYSTACK_PUBLIC_KEY` is set correctly in `frontend/.env`
- Make sure the key starts with `pk_test_` (not `sk_test_`)
- Restart your frontend server: Stop (Ctrl+C) and run `npm start` again
- Check browser console (F12) for error messages

### Issue: Payment Verification Fails

**Solutions**:
- Check that `PAYSTACK_SECRET_KEY` is set correctly in `backend/.env`
- Make sure the key starts with `sk_test_` (not `pk_test_`)
- Verify backend is running on port 5000
- Check backend console for error messages
- Verify axios is installed: `cd backend && npm install axios`

### Issue: "Invalid API Key" Error

**Solutions**:
- Double-check you copied the complete key (they're quite long!)
- Make sure no extra spaces before or after the key
- Verify you're using TEST keys (start with `pk_test_` or `sk_test_`)
- Try regenerating keys in Paystack dashboard if needed

### Issue: Payment Popup Not Opening

**Solutions**:
- Disable any popup blockers for localhost
- Check browser console for JavaScript errors
- Verify react-paystack is installed: `cd frontend && npm install react-paystack`
- Clear browser cache and try again

### Issue: Network Request Fails

**Solutions**:
- Ensure backend is running on port 5000
- Check CORS is configured correctly in backend
- Verify `REACT_APP_API_URL=http://localhost:5000` in `frontend/.env`
- Check firewall isn't blocking localhost connections

## How the Payment Flow Works =

1. **User Action**: User clicks "View Contact" on a driver
2. **Modal Opens**: PaymentModal component renders
3. **User Pays**: User clicks "Pay Now" ’ Paystack popup opens
4. **Paystack Handles**: User enters payment details and confirms
5. **Payment Success**: Paystack returns a reference code
6. **Frontend Verifies**: Frontend calls backend verification endpoint
7. **Backend Checks**: Backend calls Paystack API to verify payment
8. **Success Response**: Backend confirms payment was successful
9. **Unlock Content**: Frontend displays driver contact information
10. **Settlement**: Payment automatically settles to your MTN MoMo (0591765158)

## Payment Details =°

- **Amount**: GHS 2.00 per contact unlock
- **Split**: 100% to your Perpway subaccount
- **Paystack Fee**: 1.95% + GHS 0.50 per transaction
  - You receive: ~GHS 1.46 per transaction
- **Settlement**: Direct to MTN MoMo 0591765158
- **Settlement Time**: T+1 (next business day in test mode, instant in live mode with instant settlement)

## Going Live =€

Once testing is complete and you're ready for real payments:

1. **Complete Paystack Compliance**:
   - Go to Settings ’ Compliance
   - Complete all 5 steps:
     -  Profile
     -  Contact
     -  Owner
     -  Account
     -  Service Agreement

2. **Activate Your Account**:
   - Paystack will review (usually 1-2 business days)
   - You'll get an email when approved

3. **Switch to Live Keys**:
   - Go to Settings ’ API Keys & Webhooks
   - Toggle to **"Live"** mode
   - Copy **Live Public Key** (starts with `pk_live_`)
   - Copy **Live Secret Key** (starts with `sk_live_`)

4. **Update Environment Variables**:
   ```bash
   # backend/.env
   PAYSTACK_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY

   # frontend/.env
   REACT_APP_PAYSTACK_PUBLIC_KEY=pk_live_YOUR_LIVE_PUBLIC_KEY
   ```

5. **Deploy to Production**:
   - Update environment variables on your hosting platform (Render, Vercel, etc.)
   - Deploy and test with real payment
   - Monitor transactions in Paystack dashboard

## Webhook Configuration (Optional) =

Webhooks allow Paystack to notify your backend when payments happen:

1. **Go to**: Settings ’ API Keys & Webhooks ’ Webhooks
2. **Add Webhook URL**: `https://your-backend-url.com/api/payments/webhook/paystack`
3. **Events to Subscribe**:
   - `charge.success`
   - `charge.failed`
4. **Note Your Secret Hash**: You'll need this to verify webhook signatures

## Support & Resources =Ú

- **Paystack Documentation**: https://paystack.com/docs
- **Test Payments Guide**: https://paystack.com/docs/payments/test-payments
- **API Reference**: https://paystack.com/docs/api
- **React Paystack**: https://github.com/iamraphson/react-paystack
- **Paystack Support**: support@paystack.com

## Quick Reference Card =Ë

```bash
# Backend Environment (.env)
PAYSTACK_SECRET_KEY=sk_test_...
PAYSTACK_SUBACCOUNT_CODE=ACCT_g9ti5pumjxq650f

# Frontend Environment (.env)
REACT_APP_API_URL=http://localhost:5000
REACT_APP_PAYSTACK_PUBLIC_KEY=pk_test_...

# Test Card
Card: 4084084084084081
CVV: 408
PIN: 0000
OTP: 123456

# Test Phone
Phone: 0241234567

# Settlement Account
MTN MoMo: 0591765158
Name: ROSELINE DZIDZEME TSATSU
```

---

## Need Help?

If you encounter any issues:

1. Check the troubleshooting section above
2. Review backend console logs for error messages
3. Check browser console (F12) for frontend errors
4. Verify all environment variables are set correctly
5. Ensure both servers are running

**The integration is 100% complete and ready to test once you add your API keys!** <‰
