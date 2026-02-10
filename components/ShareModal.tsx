
import React, { useState } from 'react';
import { Article } from '../types';
import { IconX, IconWhatsApp, IconFacebook, IconTelegram, IconX as IconTwitter, IconCopy, IconCheck } from './Icons';
import { Tooltip } from './Tooltip';

interface ShareModalProps {
  article: Article;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ article, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(article.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(article.title + " " + article.url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(article.url)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(article.url)}&text=${encodeURIComponent(article.title)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(article.url)}`
  };

  const platforms = [
    { name: 'WhatsApp', icon: <IconWhatsApp />, color: 'from-emerald-400 to-emerald-600', shadow: 'shadow-emerald-200', link: shareLinks.whatsapp },
    { name: 'Facebook', icon: <IconFacebook />, color: 'from-blue-500 to-blue-700', shadow: 'shadow-blue-200', link: shareLinks.facebook },
    { name: 'Telegram', icon: <IconTelegram />, color: 'from-sky-400 to-sky-600', shadow: 'shadow-sky-200', link: shareLinks.telegram },
    { name: 'X', icon: <IconTwitter className="w-4 h-4" />, color: 'from-slate-700 to-slate-900', shadow: 'shadow-slate-300', link: shareLinks.twitter },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-900/75 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-500 sm:animate-[bounce_0.5s_ease-out]">
        
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-joy-50 to-white">
          <div className="flex flex-col">
            <h3 className="font-display font-bold text-slate-800 text-xl">Diffondi la gioia</h3>
            <span className="text-[10px] text-joy-600 font-bold uppercase tracking-[0.2em] -mt-1">Condividi positività</span>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-joy-500">
            <IconX className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8">
          <div className="flex gap-4 items-center mb-8 p-4 bg-slate-50/50 rounded-3xl border border-slate-100 shadow-inner overflow-hidden group">
             <div className="relative w-20 h-20 flex-shrink-0">
                 <img src={article.imageUrl || `https://picsum.photos/seed/${encodeURIComponent(article.title)}/150/150`} className="w-full h-full rounded-2xl object-cover shadow-md group-hover:scale-110 transition-transform duration-700" alt="" />
                 <div className="absolute inset-0 bg-gradient-to-tr from-joy-500/10 to-transparent rounded-2xl"></div>
             </div>
             <div className="flex-1">
                 <p className="text-sm font-bold text-slate-800 line-clamp-2 leading-tight mb-1 group-hover:text-joy-600 transition-colors">
                   {article.title}
                 </p>
                 <span className="text-[10px] font-bold text-joy-500/70 uppercase tracking-widest">{article.source}</span>
             </div>
          </div>

          <div className="grid grid-cols-4 gap-6 mb-10">
            {platforms.map(p => (
              <a key={p.name} href={p.link} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-3 group">
                <div className={`w-14 h-14 bg-gradient-to-br ${p.color} text-white rounded-2xl flex items-center justify-center shadow-lg ${p.shadow} transform group-hover:-translate-y-2 group-active:scale-95 transition-all duration-300`}>
                  <div className="group-hover:scale-110 transition-transform">{p.icon}</div>
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-joy-600 transition-colors">{p.name}</span>
              </a>
            ))}
          </div>

          <div className="relative">
            <div className={`flex items-center gap-2 p-2 bg-slate-50 rounded-2xl border transition-all ${copied ? 'border-emerald-300 ring-4 ring-emerald-50' : 'border-slate-200'}`}>
               <div className="flex-1 truncate text-xs text-slate-400 px-4 font-mono select-all">
                 {article.url}
               </div>
               <button onClick={handleCopyLink} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all transform active:scale-95 ${copied ? 'bg-emerald-500 text-white' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'}`}>
                 {copied ? <IconCheck className="w-4 h-4" /> : <IconCopy className="w-4 h-4" />}
                 {copied ? 'Copiato' : 'Copia'}
               </button>
            </div>
          </div>
        </div>

        <div className="p-5 bg-joy-50/50 flex items-center justify-center gap-3">
            <div className="w-2 h-2 rounded-full bg-joy-400 animate-ping"></div>
            <p className="text-[10px] font-bold text-joy-600 uppercase tracking-[0.3em]">Il mondo ha bisogno di questo</p>
            <div className="w-2 h-2 rounded-full bg-joy-400 animate-ping"></div>
        </div>
      </div>
    </div>
  );
};
