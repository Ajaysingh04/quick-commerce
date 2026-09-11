import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api.js';
import { CheckCircle2, CreditCard, ShieldCheck, Sparkles, Loader2, ArrowRight, Store, MapPin, Building2, Clock3, BadgeCheck } from 'lucide-react';

const plans = [
  {
    id: 'starter',
    name: 'Starter Franchise',
    price: '₹4,999',
    summary: 'Perfect for a single-store launch',
    features: ['1 store setup', 'Basic inventory tools', 'Order dashboard', 'Support access']
  },
  {
    id: 'growth',
    name: 'Growth Franchise',
    price: '₹9,999',
    summary: 'For scaling multi-store partners',
    features: ['Everything in Starter', 'Advanced analytics', 'Priority support', 'Custom promos']
  }
];

const requiredKycDocs = [
  'PAN Card',
  'GST Certificate',
  'Shop Front Photo',
  'Address Proof',
  'Bank Proof'
];

const CANONICAL_CATEGORY_OPTIONS = [
  'Fruits & Vegetables',
  'Dairy & Breakfast',
  'Munchies',
  'Cold Drinks',
  'Sweet Cravings',
  'Chicken & Eggs',
  'Cleaning',
  'Home & Office',
  'Personal Care',
  'Dry Fruits & Nuts',
  'Edible Oils',
  'Flours',
  'Rice & Rice Products',
  'Frozen & Instant Food',
  'Fish, Prawns & Seafood',
  'Mutton, Duck & Lamb',
  'Sauces & Seasoning',
  'Masala, Salt & Sugar',
  'Grocery & Essentials',
  'Bakery',
  'Electronics',
  'Pharmacy',
  'Organic',
  'Snacks'
];

const PartnerOnboarding = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState('starter');
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [missingRequirement, setMissingRequirement] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [kycStatus, setKycStatus] = useState('not_submitted');
  const [kycFiles, setKycFiles] = useState({
    panCard: null,
    gstCertificate: null,
    shopFrontPhoto: null,
    addressProof: null,
    bankProof: null
  });
  const [details, setDetails] = useState({
    name: '',
    description: '',
    category: 'Grocery & Essentials',
    address: { street: '', city: '', state: '', zipCode: '' },
    bankDetails: { bankName: '', accountHolderName: '', accountNumber: '', ifscCode: '' },
    gstDetails: { gstNumber: '', panNumber: '' },
    openingHours: { open: '09:00', close: '22:00' },
    distance: 5,
    deliveryTime: 30,
    costForTwo: 499,
    bannerImage: '/assets/res_default.jpg'
  });

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const { data } = await API.get('/partner/access-status');
        setStatus(data);
        setKycStatus(data.kycStatus || 'not_submitted');
        if (data.canAccessDashboard && window.location.pathname === '/partner/onboarding') {
          const redirectTimer = setTimeout(() => {
            navigate('/partner/dashboard', { replace: true });
          }, 5000);
          return () => clearTimeout(redirectTimer);
        }
      } catch (err) {
        console.error('Access status failed', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const { data } = await API.get('/products/categories?all=true');
        const fetchedValues = (data || [])
          .map((item) => item?.name)
          .filter(Boolean);

        const categoryOptions = CANONICAL_CATEGORY_OPTIONS.filter((name) =>
          fetchedValues.includes(name) || fetchedValues.length === 0
        );

        setCategories(categoryOptions);

        if (!details.category && categoryOptions.length > 0) {
          setDetails((prev) => ({ ...prev, category: categoryOptions[0] }));
        }
      } catch (err) {
        console.error('Categories fetch failed', err);
        setCategories(CANONICAL_CATEGORY_OPTIONS);
      }
    };

    fetchStatus();
    fetchCategories();
  }, [navigate]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePurchase = async () => {
    const requiredFields = Object.keys(kycFiles);
    const missingDoc = requiredKycDocs.find((doc, index) => !kycFiles[requiredFields[index]]);

    if (missingDoc) {
      setMissingRequirement(missingDoc);
      setError(`Please complete the required document: ${missingDoc}. You cannot buy the franchise until this requirement is uploaded.`);
      setMessage('');
      return;
    }

    setPurchasing(true);
    setError('');
    setMessage('');
    setMissingRequirement(null);

    try {
      const plan = plans.find((item) => item.id === selectedPlan);
      const baseAmount = Number(plan.price.replace(/[^\d]/g, ''));
      const gst = Number((baseAmount * 0.05).toFixed(2));
      const total = Number((baseAmount + gst).toFixed(2));

      const razorpayReady = await loadRazorpayScript();
      if (!razorpayReady) {
        setError('Razorpay checkout could not load. Please refresh and try again.');
        return;
      }

      const paymentReference = `franchise-${Date.now()}`;
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TIs1FsoZoPKlhY';

      const options = {
        key: razorpayKey,
        amount: Math.round(total * 100),
        currency: 'INR',
        name: 'Quick Commerce',
        description: `${plan.name} Registration`,
        handler: async function (response) {
          try {
            const res = await API.post('/partner/purchase', {
              plan: plan.id,
              amount: baseAmount,
              paymentReference,
              paymentMethod: 'razorpay',
              paymentIntentId: response.razorpay_payment_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature
            });

            const invoice = res.data.invoice || {
              invoiceNumber: `FR-${Date.now()}`,
              planName: plan.name,
              termMonths: 12,
              amount: baseAmount,
              gst,
              total,
              currency: 'INR',
              paidAt: new Date().toISOString(),
              paymentMethod: 'razorpay'
            };

            setInvoiceData(invoice);
            setShowInvoice(true);
            setStatus((prev) => ({
              ...(prev || {}),
              purchaseStatus: 'paid',
              approvalStatus: 'pending',
              canAccessDashboard: true,
              needsPurchase: false,
              needsApproval: true,
              message: 'Franchise locked in. Admin review is in progress.'
            }));
            setKycStatus('pending_review');
            setMessage('Payment successful. Your professional invoice is ready and admin review has started.');
          } catch (purchaseError) {
            setError(purchaseError.response?.data?.message || 'Payment succeeded but invoice creation failed. Please contact support.');
          }
        },
        prefill: {
          name: details.name || 'Partner',
          email: 'partner@example.com'
        },
        theme: {
          color: '#10b981'
        },
        modal: {
          ondismiss: function () {
            setError('Payment was not completed. Please try again to unlock your franchise access.');
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to complete purchase. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  const handleFieldChange = (section, field, value) => {
    setDetails((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] || {}),
        [field]: value
      }
    }));
  };

  const kycProgress = Object.values(kycFiles).filter(Boolean).length;

  const handleSubmitOnboarding = async () => {
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('name', details.name || '');
      formData.append('description', details.description || '');
      formData.append('category', details.category || '');
      formData.append('distance', String(Number(details.distance || 0)));
      formData.append('deliveryTime', String(Number(details.deliveryTime || 0)));
      formData.append('costForTwo', String(Number(details.costForTwo || 0)));
      formData.append('address', JSON.stringify(details.address));
      formData.append('bankDetails', JSON.stringify(details.bankDetails));
      formData.append('gstDetails', JSON.stringify(details.gstDetails));
      formData.append('openingHours', JSON.stringify(details.openingHours));
      formData.append('bannerImage', details.bannerImage || '/assets/res_default.jpg');

      Object.entries(kycFiles).forEach(([field, file]) => {
        if (file) formData.append(field, file);
      });

      const res = await API.post('/partner/onboarding', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const allDocsDone = Object.values(kycFiles).every(Boolean);
      setKycStatus(allDocsDone ? 'pending_review' : 'not_submitted');
      setMessage(res.data.message || 'Store details submitted successfully. Update your documents anytime before approval.');
      setStatus((prev) => ({
        ...prev,
        approvalStatus: 'pending',
        needsApproval: true,
        onboardingCompleted: true
      }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit onboarding details.');
    } finally {
      setSaving(false);
    }
  };

  const handleKycFileChange = (field, file) => {
    setKycFiles((prev) => ({ ...prev, [field]: file }));
    if (missingRequirement && file) {
      setMissingRequirement(null);
      setError('');
    }
  };

  const downloadInvoice = () => {
    if (!invoiceData) return;
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) return;

    const html = `
      <html>
        <head>
          <title>Franchise Invoice</title>
          <style>
            body { font-family: Arial, sans-serif; background: linear-gradient(135deg, #fff1f2 0%, #fff7ed 100%); padding: 32px; color: #0f172a; }
            .card {
              position: relative; max-width: 840px; margin: 0 auto; background: rgba(255,255,255,0.92);
              border: 1px solid rgba(251,113,133,0.2); border-radius: 22px; padding: 28px; box-shadow: 0 24px 60px rgba(244,114,182,0.12);
              overflow: hidden;
            }
            .watermark {
              position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
              font-size: 160px; font-weight: 800; letter-spacing: 10px; color: rgba(251,113,133,0.08); transform: rotate(-22deg); pointer-events: none;
            }
            .header { position: relative; z-index: 1; display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #fecdd3; padding-bottom: 18px; margin-bottom: 20px; }
            .brand { font-size: 30px; font-weight: 800; color: #be123c; }
            .muted { color: #475569; font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; }
            .row { position: relative; z-index: 1; display: flex; justify-content: space-between; gap: 24px; margin-bottom: 12px; }
            table { position: relative; z-index: 1; width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border-bottom: 1px solid #ffe4e6; padding: 12px 10px; text-align: left; }
            th { background: #fff1f2; color: #475569; font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; }
            .total { font-size: 20px; font-weight: 800; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="watermark">ROSE</div>
            <div class="header">
              <div>
                <div class="brand">Quick Commerce</div>
                <div class="muted">Franchise Purchase Receipt</div>
              </div>
              <div style="text-align:right;">
                <div class="muted">Invoice No.</div>
                <div style="font-weight:800; color: #111827;">${invoiceData.invoiceNumber || 'FR-INV'}</div>
              </div>
            </div>
            <div class="row">
              <div>
                <div class="muted">Customer</div>
                <div>${details.name || 'Partner'}</div>
              </div>
              <div>
                <div class="muted">Date</div>
                <div>${new Date(invoiceData.paidAt || Date.now()).toLocaleDateString('en-IN')}</div>
              </div>
            </div>
            <div class="row">
              <div>
                <div class="muted">Plan</div>
                <div>${invoiceData.planName || 'Starter Franchise'}</div>
              </div>
              <div>
                <div class="muted">Payment Mode</div>
                <div>Razorpay</div>
              </div>
            </div>
            <table>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Term</th>
                <th>Amount</th>
              </tr>
              <tr>
                <td>${invoiceData.planName || 'Starter Franchise'}</td>
                <td>1</td>
                <td>${invoiceData.termMonths || 12} months</td>
                <td>₹${Number(invoiceData.amount || 0).toLocaleString('en-IN')}</td>
              </tr>
            </table>
            <div class="row" style="margin-top:20px;">
              <div></div>
              <div style="width:280px;">
                <div class="row"><span>Sub Total</span><span>₹${Number(invoiceData.amount || 0).toLocaleString('en-IN')}</span></div>
                <div class="row"><span>GST 5%</span><span>₹${Number(invoiceData.gst || 0).toLocaleString('en-IN')}</span></div>
                <div class="row total"><span>Total</span><span>₹${Number(invoiceData.total || 0).toLocaleString('en-IN')}</span></div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 600);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-600 font-semibold">
          <Loader2 className="w-6 h-6 animate-spin" />
          Checking partner access...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em]">
            <Sparkles className="w-3.5 h-3.5" />
            Partner onboarding
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mt-4">Buy your franchise and unlock your store</h1>
          <p className="mt-3 text-slate-600 text-sm md:text-base max-w-2xl mx-auto">
            Complete the purchase, then wait for admin approval before your store dashboard becomes active.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 text-rose-600 px-4 py-3 text-sm font-medium">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-700 px-4 py-3 text-sm font-medium">
            {message}
          </div>
        )}

        <div className="mb-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">Approval checklist</p>
              <h3 className="text-lg font-black text-slate-900 mt-2">{kycProgress}/5 KYC documents uploaded</h3>
            </div>
            <div className="text-sm text-slate-600">
              {kycProgress === 0 ? 'Upload your business and identity docs to speed up review.' : 'KYC upload in progress. Submit once all needed documents are ready.'}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {requiredKycDocs.map((doc, index) => {
              const key = Object.keys(kycFiles)[index];
              const done = Boolean(kycFiles[key]);
              const isMissing = missingRequirement === doc;
              return (
                <span
                  key={doc}
                  className={`inline-flex items-center rounded-full px-2.5 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] ${
                    done
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      : isMissing
                        ? 'bg-rose-100 text-rose-700 border border-rose-300 ring-2 ring-rose-200'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}
                >
                  {doc}
                </span>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {plans.map((plan) => (
            <button
              key={plan.id}
              type="button"
              onClick={() => setSelectedPlan(plan.id)}
              className={`text-left rounded-[28px] border p-6 transition-all ${
                selectedPlan === plan.id
                  ? 'border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-100'
                  : 'border-slate-200 bg-white hover:border-emerald-200'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">Plan</p>
                  <h2 className="text-2xl font-black text-slate-900 mt-1">{plan.name}</h2>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-emerald-600">{plan.price}</div>
                </div>
              </div>

              <p className="text-sm text-slate-600 mb-5">{plan.summary}</p>

              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    {feature}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>

        <div className="bg-white border border-slate-200 rounded-[32px] p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">Current status</p>
              <h3 className="text-xl font-black text-slate-900 mt-2">
                {status?.canAccessDashboard ? 'Store active' : 'Purchase + approval required'}
              </h3>
            </div>

            <button
              type="button"
              onClick={handlePurchase}
              disabled={purchasing || status?.canAccessDashboard}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {purchasing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Opening Razorpay...
                </>
              ) : (
                <>
                  {(kycStatus === 'pending_review' || kycStatus === 'approved' || status?.kycStatus === 'pending_review' || status?.kycStatus === 'approved')
                    ? 'Update your documents'
                    : `Buy ${plans.find((p) => p.id === selectedPlan)?.name}`}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          <div className="mt-8 grid md:grid-cols-3 gap-4 text-sm">
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-slate-500 font-bold uppercase tracking-wide text-[10px]">
                <CreditCard className="w-4 h-4" />
                Purchase
              </div>
              <p className="mt-3 font-black text-slate-900">
                {status?.purchaseStatus === 'paid' ? 'Paid' : 'Not started'}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-slate-500 font-bold uppercase tracking-wide text-[10px]">
                <ShieldCheck className="w-4 h-4" />
                Approval
              </div>
              <p className="mt-3 font-black text-slate-900">
                {status?.approvalStatus === 'approved' ? 'Approved' : 'Pending'}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
              <div className="flex items-center gap-2 text-slate-500 font-bold uppercase tracking-wide text-[10px]">
                <CheckCircle2 className="w-4 h-4" />
                Dashboard
              </div>
              <p className="mt-3 font-black text-slate-900">
                {status?.canAccessDashboard ? 'Unlocked' : 'Locked'}
              </p>
            </div>
          </div>
        </div>

        {showInvoice && invoiceData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
            <div className="relative w-full max-w-5xl overflow-hidden rounded-[32px] border border-rose-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.18)]">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(251,113,133,0.18),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.12),_transparent_30%)]" />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-[170px] font-black tracking-[0.5em] text-rose-200/75 select-none">ROSE</div>

              <div className="relative bg-gradient-to-r from-rose-500 via-pink-500 to-emerald-500 px-6 py-5 text-white">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] font-black text-rose-100">Payment receipt</p>
                    <h3 className="text-2xl md:text-3xl font-black mt-2">Franchise invoice</h3>
                  </div>
                  <button type="button" onClick={() => setShowInvoice(false)} className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold ring-1 ring-white/20">Close</button>
                </div>
              </div>

              <div className="relative p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 border-b border-rose-100 pb-5 mb-6">
                  <div>
                    <div className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-rose-600">Quick Commerce</div>
                    <h4 className="mt-4 text-2xl font-black text-slate-900">{invoiceData.planName || 'Starter Franchise'}</h4>
                    <p className="mt-2 text-sm text-slate-600">Invoice No: {invoiceData.invoiceNumber || 'FR-INV'}</p>
                  </div>

                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-left md:text-right">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-emerald-700 font-black">Paid successfully</p>
                    <p className="mt-2 text-sm font-bold text-emerald-700">{new Date(invoiceData.paidAt || Date.now()).toLocaleDateString('en-IN')}</p>
                    <p className="mt-1 text-xs text-slate-600">Mode: Razorpay</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5 text-sm text-slate-700 mb-6">
                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500 font-black mb-2">Customer</p>
                    <p className="font-bold text-slate-800">{details.name || 'Store Partner'}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500 font-black mb-2">Billing term</p>
                    <p className="font-bold text-slate-800">{invoiceData.termMonths || 12} months</p>
                  </div>
                </div>

                <div className="overflow-hidden rounded-[24px] border border-rose-100 bg-white">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gradient-to-r from-rose-50 to-pink-50">
                      <tr>
                        <th className="px-4 py-3 font-black text-slate-600">Item</th>
                        <th className="px-4 py-3 font-black text-slate-600">Quantity</th>
                        <th className="px-4 py-3 font-black text-slate-600">Term</th>
                        <th className="px-4 py-3 font-black text-slate-600 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="px-4 py-4 font-semibold text-slate-800">{invoiceData.planName || 'Starter Franchise'}</td>
                        <td className="px-4 py-4 text-slate-700">1</td>
                        <td className="px-4 py-4 text-slate-700">{invoiceData.termMonths || 12} months</td>
                        <td className="px-4 py-4 text-right font-bold text-slate-900">₹{Number(invoiceData.amount || 0).toLocaleString('en-IN')}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 grid md:grid-cols-[1fr_280px] gap-6 items-end">
                  <div className="rounded-2xl border border-dashed border-rose-200 bg-rose-50/70 p-4 text-sm text-slate-600">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-rose-500 font-black mb-2">Notes</p>
                    <p>This invoice confirms your franchise purchase and secures your onboarding review. Your store will be activated after admin approval.</p>
                  </div>

                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex justify-between"><span>Sub total</span><span>₹{Number(invoiceData.amount || 0).toLocaleString('en-IN')}</span></div>
                    <div className="flex justify-between"><span>GST 5%</span><span>₹{Number(invoiceData.gst || 0).toLocaleString('en-IN')}</span></div>
                    <div className="flex justify-between items-center font-black text-lg text-slate-900 border-t border-rose-100 pt-2"><span>Total</span><span>₹{Number(invoiceData.total || 0).toLocaleString('en-IN')}</span></div>
                  </div>
                </div>

                <div className="mt-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-t border-rose-100 pt-6">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500 font-black mb-2">Authorized by</p>
                    <div className="h-10 w-40 rounded-md border border-dashed border-slate-300 bg-slate-50" />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button type="button" onClick={downloadInvoice} className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm">Download / Print</button>
                    <button type="button" onClick={() => setShowInvoice(false)} className="rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-emerald-500/20">Continue</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 bg-white border border-slate-200 rounded-[32px] p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">Store details</p>
              <h3 className="text-xl font-black text-slate-900">Complete your storefront profile</h3>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <label className="md:col-span-2">
              <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Store Name</span>
              <input value={details.name} onChange={(e) => setDetails((prev) => ({ ...prev, name: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" placeholder="RoseBite Mart" />
            </label>

            <label className="md:col-span-2">
              <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Store Description</span>
              <textarea rows={3} value={details.description} onChange={(e) => setDetails((prev) => ({ ...prev, description: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" placeholder="Fresh groceries, snacks, essentials and daily needs." />
            </label>

            <label>
              <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Category</span>
              <select
                value={details.category || ''}
                onChange={(e) => setDetails((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
              >
                {categories.length === 0 ? (
                  <option value="Grocery & Essentials">Grocery & Essentials</option>
                ) : (
                  categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))
                )}
              </select>
            </label>

            <label>
              <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Delivery Time (mins)</span>
              <input type="number" value={details.deliveryTime} onChange={(e) => setDetails((prev) => ({ ...prev, deliveryTime: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
            </label>

            <label>
              <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Delivery Radius (km)</span>
              <input type="number" value={details.distance} onChange={(e) => setDetails((prev) => ({ ...prev, distance: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
            </label>

            <label>
              <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Min Order / Cost for Two</span>
              <input type="number" value={details.costForTwo} onChange={(e) => setDetails((prev) => ({ ...prev, costForTwo: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
            </label>

            <div className="md:col-span-2 mt-2">
              <div className="flex items-center gap-2 mb-3 text-slate-700 font-bold">
                <MapPin className="w-4 h-4 text-emerald-600" />
                Address Details
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <input value={details.address.street} onChange={(e) => handleFieldChange('address', 'street', e.target.value)} placeholder="Street" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
                <input value={details.address.city} onChange={(e) => handleFieldChange('address', 'city', e.target.value)} placeholder="City" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
                <input value={details.address.state} onChange={(e) => handleFieldChange('address', 'state', e.target.value)} placeholder="State" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
                <input value={details.address.zipCode} onChange={(e) => handleFieldChange('address', 'zipCode', e.target.value)} placeholder="ZIP code" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
              </div>
            </div>

            <div className="md:col-span-2 mt-2">
              <div className="flex items-center gap-2 mb-3 text-slate-700 font-bold">
                <Clock3 className="w-4 h-4 text-amber-600" />
                Opening Hours
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <input type="time" value={details.openingHours.open} onChange={(e) => handleFieldChange('openingHours', 'open', e.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
                <input type="time" value={details.openingHours.close} onChange={(e) => handleFieldChange('openingHours', 'close', e.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
              </div>
            </div>

            <div className="md:col-span-2 mt-2">
              <div className="flex items-center gap-2 mb-3 text-slate-700 font-bold">
                <Building2 className="w-4 h-4 text-sky-600" />
                Banking & Tax
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <input value={details.bankDetails.bankName} onChange={(e) => handleFieldChange('bankDetails', 'bankName', e.target.value)} placeholder="Bank Name" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
                <input value={details.bankDetails.accountHolderName} onChange={(e) => handleFieldChange('bankDetails', 'accountHolderName', e.target.value)} placeholder="Account Holder Name" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
                <input value={details.bankDetails.accountNumber} onChange={(e) => handleFieldChange('bankDetails', 'accountNumber', e.target.value)} placeholder="Account Number" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm" />
                <input value={details.bankDetails.ifscCode} onChange={(e) => handleFieldChange('bankDetails', 'ifscCode', e.target.value)} placeholder="IFSC Code" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm uppercase" />
                <input value={details.gstDetails.gstNumber} onChange={(e) => handleFieldChange('gstDetails', 'gstNumber', e.target.value)} placeholder="GST Number" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm uppercase" />
                <input value={details.gstDetails.panNumber} onChange={(e) => handleFieldChange('gstDetails', 'panNumber', e.target.value)} placeholder="PAN Number" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm uppercase" />
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-[28px] border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-2 mb-4 text-slate-700 font-black">
              <ShieldCheck className="w-4 h-4 text-rose-500" />
              KYC & business documents
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                ['panCard', 'PAN Card'],
                ['gstCertificate', 'GST Certificate'],
                ['shopFrontPhoto', 'Shop Front Photo'],
                ['addressProof', 'Address Proof'],
                ['bankProof', 'Bank Proof']
              ].map(([field, label]) => (
                <label key={field} className="block rounded-2xl border border-slate-200 bg-white p-3">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">{label}</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleKycFileChange(field, e.target.files?.[0] || null)}
                    className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-xl file:border-0 file:bg-emerald-600 file:px-3 file:py-2 file:text-white"
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={handleSubmitOnboarding}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-black text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <BadgeCheck className="w-4 h-4" />}
              {saving ? 'Submitting...' : 'Submit for Approval'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerOnboarding;
