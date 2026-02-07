import React from 'react';

const Contact = () => {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = `Project Inquiry from ${formData.name}`;
    const body = `Name: ${formData.name}%0D%0AEmail: ${formData.email}%0D%0A%0D%0AMessage:%0D%0A${formData.message}`;
    window.location.href = `mailto:sanjaya@ristek.cs.ui.ac.id?subject=${encodeURIComponent(subject)}&body=${body}`;
  };

  return (
    <div className="glass-card-strong bento-hover rounded-3xl p-6 md:p-8 md:col-span-4 lg:col-span-6 flex flex-col md:flex-row items-center justify-between relative overflow-hidden bg-white" id="contact">
      <div className="w-full md:w-1/2 pr-0 md:pr-10 mb-8 md:mb-0 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-200 text-[#0066cc] text-[11px] font-semibold uppercase tracking-wider mb-4 shadow-sm">
          <span className="material-symbols-outlined text-[16px]">mail</span>
          Get in Touch
        </div>
        <h3 className="text-3xl md:text-4xl font-bold text-text-main mb-4">Let's build something <span className="text-[#86868b]">amazing together.</span></h3>
        <p className="text-text-secondary text-base leading-relaxed mb-8">
          I'm currently available for projects and opportunities. Whether you have a question or just want to say hi, I'll try my best to get back to you!
        </p>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-gray-200 shadow-sm">
              <span className="material-symbols-outlined text-gray-500 group-hover:text-[#0066cc] transition-colors">alternate_email</span>
            </div>
            <a href="mailto:sanjaya@ristek.cs.ui.ac.id" className="text-text-main font-medium group-hover:text-[#0066cc] transition-colors">sanjaya@ristek.cs.ui.ac.id</a>
          </div>
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-gray-200 shadow-sm">
              <span className="material-symbols-outlined text-gray-500 group-hover:text-[#0066cc] transition-colors">calendar_month</span>
            </div>
            <span className="text-text-main font-medium group-hover:text-[#0066cc] transition-colors">Schedule a call</span>
          </div>
        </div>
      </div>
      <div className="w-full md:w-1/2 relative z-10">
        <form onSubmit={handleSubmit} className="p-5 md:p-6 rounded-2xl bg-white/50 border border-white/60 shadow-inner">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase ml-1" htmlFor="name">Name</label>
              <input value={formData.name} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#0066cc] focus:ring-0 transition-all outline-none text-sm placeholder:text-gray-400 shadow-sm" id="name" placeholder="John Doe" type="text" required />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase ml-1" htmlFor="email">Email</label>
              <input value={formData.email} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#0066cc] focus:ring-0 transition-all outline-none text-sm placeholder:text-gray-400 shadow-sm" id="email" placeholder="john@example.com" type="email" required />
            </div>
          </div>
          <div className="space-y-1 mb-6">
            <label className="text-xs font-semibold text-gray-500 uppercase ml-1" htmlFor="message">Message</label>
            <textarea value={formData.message} onChange={handleChange} className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-[#0066cc] focus:ring-0 transition-all outline-none text-sm placeholder:text-gray-400 resize-none h-32 shadow-sm" id="message" placeholder="Tell me about your project..." required></textarea>
          </div>
          <button type="submit" className="w-full py-3.5 px-6 bg-[#0066cc] text-white rounded-xl font-medium hover:bg-[#0077ed] transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 group-hover:gap-3">
            <span>Send Message</span>
            <span className="material-symbols-outlined text-sm">send</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;