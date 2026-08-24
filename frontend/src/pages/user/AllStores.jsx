import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api.js';

const AllStores = () => {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const res = await API.get('/stores?featured=false');
        setStores(res.data);
      } catch (error) {
        console.error('Failed to fetch stores:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStores();
  }, []);

  return (
    <div className="bg-[#f9fafb] min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <h1 className="text-3xl font-black text-gray-900 mb-8">All Stores</h1>
        
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {stores.length > 0 ? (
              stores.map(store => (
                <div key={store._id} className="bg-white rounded-[20px] p-4 flex gap-4 items-center cursor-pointer hover:shadow-md transition-shadow border border-gray-100">
                  <img src={store.bannerImage || store.image || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=300&q=80'} alt={store.name} className="w-16 h-16 rounded-full object-cover" />
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-800">{store.name}</span>
                    <span className="text-xs text-gray-500">{store.category || store.cuisineTypes?.[0] || 'Store'}</span>
                    <div className="flex items-center gap-1 mt-1 text-xs font-semibold text-gray-600">
                      <span className="text-yellow-500">★</span> {store.rating || '4.5'}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center text-slate-500 font-semibold bg-white rounded-3xl border border-slate-100">
                No stores found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllStores;
