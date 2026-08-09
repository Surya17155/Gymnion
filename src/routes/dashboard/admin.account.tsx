import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { getGymDetails, updateAdminAccount } from '@/lib/auth.functions';
import { supabase } from '@/integrations/supabase/client';

export const Route = createFileRoute('/dashboard/admin/account')({
  component: AdminAccount,
});

function AdminAccount() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const getGymDetailsFn = useServerFn(getGymDetails);
  const updateAccountFn = useServerFn(updateAdminAccount);

  const { data: gym, isLoading } = useQuery({
    queryKey: ['admin-gym-details'],
    queryFn: () => getGymDetailsFn({ data: {} }),
  });

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    photo_url: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (gym) {
      setFormData({
        full_name: gym.owner_name || '',
        email: gym.owner_email || '',
        phone: gym.owner_phone || '',
        photo_url: gym.owner_photo_url || '',
      });
    }
  }, [gym]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateAccountFn({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gym-details'] });
      setMessage({ type: 'success', text: 'Account details updated successfully!' });
      setIsEditing(false);
    },
    onError: (err: any) => {
      setMessage({ type: 'error', text: err.message || 'Failed to update account' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="bg-[#121411] min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#B7FF1E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-[#121411] text-[#e3e3dd] antialiased min-h-screen font-['Poppins']">
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      
      <div 
        className="fixed top-0 left-0 right-0 h-[300px] z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(183, 255, 30, 0.15) 0%, rgba(12, 20, 17, 0) 70%)'
        }}
      />

      <div className="max-w-[480px] mx-auto relative z-10 flex flex-col min-h-screen pb-24">
        <header className="flex items-center px-[20px] h-[64px] sticky top-0 bg-[#121411]/80 backdrop-blur-md z-40">
          <Link to="/dashboard/admin/settings" className="w-10 h-10 rounded-full flex items-center justify-center bg-[#1e201d] border border-white/5 mr-4 text-[#C0C2B8]">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <h1 className="text-xl font-bold text-white">Account Settings</h1>
        </header>

        <main className="px-[20px] py-6 flex flex-col gap-8">
          {message.text && (
            <div className={`p-4 rounded-2xl text-xs border animate-in fade-in slide-in-from-top-2 ${
              message.type === 'success' ? 'bg-[#B7FF1E]/10 border-[#B7FF1E]/20 text-[#B7FF1E]' : 'bg-[#FF5964]/10 border-[#FF5964]/20 text-[#FF5964]'
            }`}>
              {message.text}
            </div>
          )}

          <section className="flex flex-col items-center">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-[#1e201d] border-2 border-[#B7FF1E]/20 flex items-center justify-center overflow-hidden">
                {formData.photo_url ? (
                  <img src={formData.photo_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-4xl text-[#B7FF1E]">person</span>
                )}
              </div>
              {isEditing && (
                <button 
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#B7FF1E] text-[#121411] flex items-center justify-center border-2 border-[#121411] disabled:opacity-50"
                >
                  {isUploading ? (
                    <div className="w-4 h-4 border-2 border-[#121411] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span className="material-symbols-outlined text-sm">edit</span>
                  )}
                </button>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  try {
                    setIsUploading(true);
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${gym?.id || 'admin'}-${Math.random()}.${fileExt}`;
                    const filePath = `owners/${fileName}`;

                    const { error: uploadError } = await supabase.storage
                      .from('gym-assets')
                      .upload(filePath, file);

                    if (uploadError) throw uploadError;

                    const { data: { publicUrl } } = supabase.storage
                      .from('gym-assets')
                      .getPublicUrl(filePath);

                    setFormData(prev => ({ ...prev, photo_url: publicUrl }));
                    setMessage({ type: 'success', text: 'Photo uploaded! Don\'t forget to save changes.' });
                  } catch (err: any) {
                    setMessage({ type: 'error', text: err.message || 'Failed to upload photo' });
                  } finally {
                    setIsUploading(false);
                  }
                }}
              />
            </div>
            <h2 className="text-xl font-bold mt-4 text-white">{formData.full_name}</h2>
            <p className="text-sm text-[#858A7D]">Gym Administrator</p>
          </section>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 bg-[#1e201d] p-6 rounded-2xl border border-white/5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold text-[#858A7D] ml-1">Full Name</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#858A7D] text-[20px]">person</span>
                  <input 
                    type="text" 
                    disabled={!isEditing}
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    className="w-full bg-[#121411] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:border-[#B7FF1E] focus:outline-none disabled:opacity-60 transition-all"
                    placeholder="Enter full name"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold text-[#858A7D] ml-1">Email Address</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#858A7D] text-[20px]">mail</span>
                  <input 
                    type="email" 
                    disabled={true}
                    value={formData.email}
                    className="w-full bg-[#121411] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none opacity-60 cursor-not-allowed"
                    placeholder="Email address"
                  />
                </div>
                <p className="text-[10px] text-[#858A7D] ml-1 italic">Email cannot be changed manually.</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-wider font-bold text-[#858A7D] ml-1">Phone Number</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#858A7D] text-[20px]">phone</span>
                  <input 
                    type="tel" 
                    disabled={!isEditing}
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-[#121411] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm focus:border-[#B7FF1E] focus:outline-none disabled:opacity-60 transition-all"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
            </div>

            {isEditing ? (
              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      full_name: gym.owner_name || '',
                      email: gym.owner_email || '',
                      phone: gym.owner_phone || '',
                      photo_url: gym.owner_photo_url || '',
                    });
                  }}
                  className="flex-1 h-12 rounded-full border border-white/10 text-white font-bold text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex-1 h-12 rounded-full bg-[#B7FF1E] text-[#121411] font-bold text-sm disabled:opacity-50"
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            ) : (
              <button 
                type="button"
                onClick={() => setIsEditing(true)}
                className="h-12 rounded-full bg-[#B7FF1E] text-[#121411] font-bold text-sm"
              >
                Edit Account Details
              </button>
            )}
          </form>
        </main>
      </div>
    </div>
  );
}
