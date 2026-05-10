import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Mail, Briefcase, Award, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import api from '../../services/axios';
import { useToast } from '../../components/ui/Toast';

const PAGE_SIZE = 6;

const MentorApprovalsPage = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [page, setPage] = useState(0);

  const { data: mentorsData, isLoading } = useQuery({
    queryKey: ['admin', 'mentors', 'pending', page],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('size', String(PAGE_SIZE));
      params.append('sort', 'id,asc');
      const { data } = await api.get(`/api/admin/mentors/pending?${params.toString()}`);
      return data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.post(`/api/admin/mentors/${id}/approve`);
    },
    onSuccess: () => {
      showToast({ message: 'Identity Authorized.', type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['admin', 'mentors', 'pending'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
    onError: () => showToast({ message: 'Authorization Failed.', type: 'error' }),
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.post(`/api/admin/mentors/${id}/reject?reason=Rejected+by+admin`);
    },
    onSuccess: () => {
      showToast({ message: 'Identity Purged.', type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['admin', 'mentors', 'pending'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
    onError: () => showToast({ message: 'Purge Failed.', type: 'error' }),
  });

  const pendingMentors = mentorsData?.content || mentorsData || [];
  const mentorsList = Array.isArray(pendingMentors)
    ? [...pendingMentors].sort((a: any, b: any) => Number(a?.id || 0) - Number(b?.id || 0))
    : [];
  const totalElements = Array.isArray(mentorsData?.content)
    ? Number(mentorsData?.totalElements || mentorsList.length || 0)
    : mentorsList.length;
  const totalPages = Array.isArray(mentorsData?.content)
    ? Math.max(1, Number(mentorsData?.totalPages || 1))
    : 1;
  const currentPage = Array.isArray(mentorsData?.content)
    ? Number(mentorsData?.number ?? page)
    : 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  } as const;

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', damping: 25, stiffness: 300 } }
  } as const;

  return (
    <PageLayout>
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-12">
        {/* Header */}
        <motion.section variants={itemVariants} className="relative py-4">
          <div className="absolute -left-12 -top-12 w-64 h-64 bg-primary/10 blur-[100px] -z-10" />
          <h1 className="text-6xl font-display font-black text-white tracking-tighter leading-[0.9]">
            Intel <span className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">Verification</span>.
          </h1>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mt-8">
            <p className="text-lg text-white/40 font-bold uppercase tracking-[0.3em] flex items-center gap-4">
              <span className="w-12 h-[2px] bg-primary/30" />
              Pending Network Clearances
            </p>
            {!isLoading && (
              <div className="flex items-center gap-3 px-6 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">{totalElements} Unresolved Applications</span>
              </div>
            )}
          </div>
        </motion.section>

        {isLoading ? (
          <div className="flex items-center justify-center h-[40vh]">
            <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em] animate-pulse italic">Scanning Registry...</div>
          </div>
        ) : mentorsList.length === 0 ? (
          <motion.div variants={itemVariants} className="glass-card rounded-[3rem] p-24 text-center flex flex-col items-center">
            <div className="w-24 h-24 rounded-[2rem] bg-white/5 flex items-center justify-center mb-8 border border-white/5">
              <ShieldCheck className="text-white/10" size={48} />
            </div>
            <h3 className="text-2xl font-display font-black text-white uppercase tracking-tighter mb-4 italic">Registry Clear</h3>
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">All pending mentor nodes have been successfully processed.</p>
          </motion.div>
        ) : (
          <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <AnimatePresence mode="popLayout">
              {mentorsList.map((mentor: any) => (
                <motion.div
                  layout
                  key={mentor.id}
                  variants={itemVariants}
                  whileHover={{ y: -8 }}
                  className="glass-card rounded-[3rem] p-10 border-white/5 group relative overflow-hidden flex flex-col"
                >
                  <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/5 blur-[60px] group-hover:bg-primary/5 transition-colors duration-700" />
                  
                  <div className="flex justify-between items-start mb-8 relative">
                    <div className="space-y-1">
                      <h3 className="text-2xl font-display font-black text-white tracking-tighter uppercase italic group-hover:text-primary transition-colors">
                        {mentor.firstName} {mentor.lastName}
                      </h3>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest flex items-center gap-1.5">
                           <Mail size={12} /> {mentor.email || `ID: ${mentor.userId}`}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-white/10" />
                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Awaiting Command</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-white/20 italic font-black text-sm">
                       #{mentor.id}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-8 relative">
                    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                      <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                        <Briefcase size={12} className="text-primary" /> Seniority
                      </p>
                      <p className="text-xl font-black text-white tracking-tighter italic">{mentor.experienceYears || 0} Cycles</p>
                    </div>
                    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                      <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                        <Award size={12} className="text-primary" /> Credit Value
                      </p>
                      <p className="text-xl font-black text-white tracking-tighter italic">₹{mentor.hourlyRate || '0'}<span className="text-[10px] ml-1">/HR</span></p>
                    </div>
                  </div>

                  <div className="space-y-6 flex-1 relative">
                    <div className="space-y-3">
                      <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] ml-2">Mission Intelligence</p>
                      <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 text-[11px] text-white/40 font-bold leading-relaxed uppercase tracking-widest italic min-h-[80px]">
                        {mentor.bio || 'Initial bio data stream empty...'}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] ml-2">Module Competencies</p>
                      <div className="flex flex-wrap gap-2">
                        {(mentor.skills || []).map((skill: any, index: number) => (
                          <span key={index} className="px-4 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[9px] font-black text-white/40 uppercase tracking-widest">
                            {typeof skill === 'string' ? skill : skill.name || 'Module'}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-10 mt-auto relative">
                    <button
                      onClick={() => approveMutation.mutate(mentor.id)}
                      disabled={approveMutation.isPending}
                      className="flex-1 h-14 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:brightness-110 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      <CheckCircle size={18} /> Authorize Node
                    </button>
                    <button
                      onClick={() => rejectMutation.mutate(mentor.id)}
                      disabled={rejectMutation.isPending}
                      className="w-14 h-14 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center disabled:opacity-50"
                    >
                      <XCircle size={22} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div variants={itemVariants} className="flex justify-center items-center gap-6 pt-12">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={currentPage <= 0}
              className="w-12 h-12 glass-card rounded-2xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all disabled:opacity-20"
            >
              <ArrowLeft size={20} />
            </button>
            <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Registry Sector {currentPage + 1} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={currentPage >= totalPages - 1}
              className="w-12 h-12 glass-card rounded-2xl flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all disabled:opacity-20"
            >
              <ArrowRight size={20} />
            </button>
          </motion.div>
        )}
      </motion.div>
    </PageLayout>
  );
};

export default MentorApprovalsPage;
