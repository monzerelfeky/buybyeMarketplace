
import React from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import "../../styles/StaticPage.css";

export default function SellerFees() {
  return (
    <>
      <Header />
      <div className="static-page">
        <div className="page-container">
          <h1 className="page-title">Fees & Pricing</h1>
          <div className="page-content">
            <p style={{ fontSize: '18px', textAlign: 'center', marginBottom: '40px' }}>
              BuyBye keeps fees simple and transparent. No hidden costs, no surprises.
            </p>

            <div className="fees-grid">
              <div className="fee-card">
                <h3 style={{ color: '#0369a1', margin: '0 0 16px 0' }}>Commission Fee</h3>
                <div className="fee-amount">5%</div>
                <p style={{ margin: 0 }}>Charged only on successful sales</p>
              </div>
              <div className="fee-card">
                <h3 style={{ color: '#0369a1', margin: '0 0 16px 0' }}>Payment Processing</h3>
                <div className="fee-amount">2.9%</div>
                <p style={{ margin: 0 }}>Standard rate for secure transactions</p>
              </div>
            </div>

            <h2>What's Included (Free)</h2>
            <ul className="benefits-list">
              <li>✅ Account creation and setup</li>
              <li>✅ Unlimited listings</li>
              <li>✅ Store management dashboard</li>
              <li>✅ Customer messaging system</li>
              <li>✅ Basic analytics and reporting</li>
              <li>✅ Seller support access</li>
              <li>✅ Buyer protection participation</li>
            </ul>

            <h2>Fee Examples</h2>
            <div className="example-box">
              <h3 style={{ textAlign: 'center' }}>Example Calculation</h3>
              <div className="calc-row">
                <span>Item Sale Price:</span>
                <span><strong>EGP 1,000</strong></span>
              </div>
              <div className="calc-row">
                <span>Commission (5%):</span>
                <span>- EGP 50</span>
              </div>
              <div className="calc-row">
                <span>Processing (2.9%):</span>
                <span>- EGP 29</span>
              </div>
              <div className="calc-row total">
                <span><strong>You Receive:</strong></span>
                <span><strong>EGP 921</strong></span>
              </div>
            </div>

            <h2>More Examples</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Sale Price</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Total Fees</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>You Receive</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px' }}>EGP 500</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>EGP 40</td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>EGP 460</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px' }}>EGP 2,000</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>EGP 158</td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>EGP 1,842</td>
                </tr>
                <tr>
                  <td style={{ padding: '12px' }}>EGP 5,000</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>EGP 395</td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>EGP 4,605</td>
                </tr>
              </tbody>
            </table>

            <h2>When Are Fees Charged?</h2>
            <ul>
              <li><strong>At Sale Completion:</strong> Fees are deducted when the order is marked as delivered</li>
              <li><strong>No Upfront Costs:</strong> No fees for listing items or maintaining your store</li>
              <li><strong>Automatic Deduction:</strong> Fees are automatically calculated and deducted from your payout</li>
            </ul>

            <h2>Volume Discounts</h2>
            <p>
              High-volume sellers can qualify for reduced commission rates:
            </p>
            <ul>
              <li><strong>Gold Tier</strong> (100+ sales/month): 4.5% commission</li>
              <li><strong>Platinum Tier</strong> (500+ sales/month): 4% commission</li>
              <li><strong>Diamond Tier</strong> (1000+ sales/month): 3.5% commission</li>
            </ul>
            <p>Contact our seller support team to learn more about premium seller programs.</p>

            <h2>Payment Schedule</h2>
            <ul>
              <li>Payouts processed weekly (every Sunday)</li>
              <li>Minimum payout threshold: EGP 100</li>
              <li>Payments sent via bank transfer or BuyBye Wallet</li>
              <li>View payment history in your dashboard</li>
            </ul>

            <h2>Compare with Other Platforms</h2>
            <p>
              BuyBye offers one of the lowest fee structures in Egypt:
            </p>
            <ul>
              <li><strong>BuyBye:</strong> 5% + 2.9% = 7.9% total</li>
              <li>Competitor A: 10% + 3% = 13% total</li>
              <li>Competitor B: 8% + 3.5% + monthly fee = 11.5%+ total</li>
            </ul>

            <h2>Questions About Fees?</h2>
            <p>
              Contact our seller support team for clarification or assistance with fee calculations.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}