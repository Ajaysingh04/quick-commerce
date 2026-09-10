import React, { useEffect, useState } from 'react';
import API from '../../services/api.js';
import { CheckCircle2, XCircle, Clock3, Store, Mail, Phone } from 'lucide-react';

const StorePartnerManage = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchPartners = async () => {
    try {
      const res = await API.get('/stores/admin/partners');
      setPartners(res.data || []);
    } catch (err) {
      console.error('Failed to load store partner requests', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const updatePartnerStatus = async (storeId, status) => {
    setUpdating(true);
    try {
      await API.patch(`/stores/${storeId}/approve`, {
        status,
        approvalNotes: status === 'approved' ? 'Approved by admin.' : 'Rejected by admin.',
        kycStatus: status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'pending_review'
      });
      await fetchPartners();
    } catch (err) {
      console.error('Failed to update partner status', err);
    } finally {
      setUpdating(false);
    }
  };

  const statusStyles = {
    pending: 'bg-amber-100 text-amber-700 border border-amber-200',
    approved: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    rejected: 'bg-rose-100 text-rose-700 border border-rose-200',
  };

  const kycStatusStyles = {
    not_submitted: 'bg-slate-200 text-slate-700 border border-slate-300',
    pending_review: 'bg-amber-100 text-amber-700 border border-amber-200',
    approved: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    rejected: 'bg-rose-100 text-rose-700 border border-rose-200',
  };

  const documentEntries = [
    ['panCard', 'PAN Card'],
    ['gstCertificate', 'GST Certificate'],
    ['shopFrontPhoto', 'Shop Front'],
    ['addressProof', 'Address Proof'],
    ['bankProof', 'Bank Proof']
  ];

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading store partner requests...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-emerald-200/60 shadow-premium p-6">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-600">Store Partners</p>
            <h2 className="text-2xl font-black text-slate-900 mt-2">Partner Requests</h2>
          </div>
          <div className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-bold border border-emerald-200">
            {partners.length} requests
          </div>
        </div>

        <div className="space-y-4">
          {partners.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
              No partner requests yet.
            </div>
          ) : (
            partners.map((store) => (
              <div key={store._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                      <Store className="w-6 h-6" />
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-slate-900">{store.name}</h3>
                      <p className="text-sm text-slate-600 mt-1">{store.description || 'No description yet'}</p>
                      <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {store.owner?.email || 'No email'}</span>
                        <span className="inline-flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {store.owner?.phone || 'No phone'}</span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.14em] font-black text-slate-500">
                        <span className="rounded-full bg-slate-100 px-2 py-1 border border-slate-200">{store.franchisePurchaseStatus === 'paid' ? 'Franchise Paid' : 'Not Paid'}</span>
                        <span className="rounded-full bg-slate-100 px-2 py-1 border border-slate-200">{store.onboardingCompleted ? 'Onboarding Done' : 'Draft'}</span>
                        <span className="rounded-full bg-slate-100 px-2 py-1 border border-slate-200">{store.category || 'General'}</span>
                      </div>

                      {store.documents && Object.values(store.documents).some(Boolean) && (
                        <div className="mt-4 grid md:grid-cols-2 xl:grid-cols-3 gap-2">
                          {documentEntries.map(([key, label]) => {
                            const url = store.documents?.[key];
                            if (!url) return null;
                            return (
                              <a
                                key={key}
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center justify-between rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-700 hover:border-emerald-300"
                              >
                                <span className="truncate max-w-[120px]">{label}</span>
                                <span className="text-[10px] uppercase tracking-wide text-emerald-600">View</span>
                              </a>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-start lg:items-end gap-3">
                    <div className="flex gap-2 flex-wrap justify-end">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${statusStyles[store.status] || statusStyles.pending}`}>
                        {store.status === 'pending' && <Clock3 className="w-3.5 h-3.5" />}
                        {store.status === 'approved' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {store.status === 'rejected' && <XCircle className="w-3.5 h-3.5" />}
                        {store.status || 'pending'}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${kycStatusStyles[store.kycStatus] || kycStatusStyles.not_submitted}`}>
                        {store.kycStatus || 'not_submitted'}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        disabled={updating || store.status === 'approved'}
                        onClick={() => updatePartnerStatus(store._id, 'approved')}
                        className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        disabled={updating || store.status === 'rejected'}
                        onClick={() => updatePartnerStatus(store._id, 'rejected')}
                        className="px-3 py-2 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StorePartnerManage;
