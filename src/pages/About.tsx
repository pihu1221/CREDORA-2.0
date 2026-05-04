import { motion } from "motion/react";
import { Users, Target, Shield, Rocket } from "lucide-react";

export function About() {
  const team = [
    { name: "Rohit Kumar", role: "Founder & AI Architect", bio: "Visionary behind Credora's AI DNA mapping." },
    { name: "Om Mishra", role: "CTO", bio: "Leading the technical development and reverse hiring logic." },
    { name: "Pihu Jaiswal", role: "Head of Product", bio: "Crafting a seamless experience for students and recruiters." },
    { name: "Narayani Dixit", role: "Chief Content Officer", bio: "Curating world-class skill validation assessments." },
    { name: "Mimansa Saini", role: "Head of Mentorship", bio: "Building a global network of industry experts." }
  ];

  return (
    <div className="pt-32 pb-20 px-4 relative overflow-hidden">
      <div className="glow-indigo top-[-10%] right-[-10%] opacity-20" />
      
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-24">
            <h1 className="text-5xl md:text-8xl font-sans font-bold text-white mb-8 tracking-tighter uppercase leading-[0.9]">Beyond the <br /><span className="text-blue-500">Static Resume</span></h1>
            <p className="text-slate-400 max-w-3xl mx-auto text-xl leading-relaxed font-medium">
                We're building the infrastructure for a world where skills are verified, talent is liquid, and opportunity is distributed by merit.
            </p>
        </header>

        {/* Mission Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
            {[
                { icon: <Target className="w-6 h-6" />, title: "Our Mission", desc: "To democratize career opportunities by making skills the universal currency of hiring.", color: "text-blue-500", bg: "bg-blue-600/10" },
                { icon: <Shield className="w-6 h-6" />, title: "Our Vision", desc: "A world where every individual's potential is recognized and mapped to the right desk.", color: "text-indigo-500", bg: "bg-indigo-600/10" },
                { icon: <Rocket className="w-6 h-6" />, title: "Our Goal", desc: "Accelerate 1 million careers by 2030 through AI-driven validation.", color: "text-cyan-500", bg: "bg-cyan-600/10" }
            ].map(item => (
                <div key={item.title} className="bg-slate-900/40 p-10 rounded-[3rem] border border-white/10 backdrop-blur-md">
                    <div className={`w-12 h-12 ${item.bg} rounded-2xl flex items-center justify-center ${item.color} mb-8 border border-white/5`}>
                        {item.icon}
                    </div>
                    <h3 className="text-2xl font-bold mb-6 text-white uppercase tracking-tight">{item.title}</h3>
                    <p className="text-slate-400 leading-relaxed text-sm">
                        {item.desc}
                    </p>
                </div>
            ))}
        </div>

        {/* Problem/Solution */}
        <section className="mb-32 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="bg-slate-900/40 p-8 md:p-12 rounded-[2.5rem] border border-white/5">
                <h3 className="text-2xl font-sans font-bold mb-6 text-red-500 uppercase tracking-tighter italic">The Problem</h3>
                <ul className="space-y-4">
                    <li className="flex gap-3 text-slate-400 text-sm">
                        <span className="text-red-500 font-bold">•</span>
                        Traditional resumes are 80% fluff and rarely reflect true potential.
                    </li>
                    <li className="flex gap-3 text-slate-400 text-sm">
                        <span className="text-red-500 font-bold">•</span>
                        Companies spend billions on manual screening and bad hires.
                    </li>
                    <li className="flex gap-3 text-slate-400 text-sm">
                        <span className="text-red-500 font-bold">•</span>
                        Students don't know exactly what skills they need for the current market.
                    </li>
                </ul>
            </div>
            <div className="bg-slate-900/40 p-8 md:p-12 rounded-[2.5rem] border border-blue-500/20 bg-blue-500/5">
                <h3 className="text-2xl font-sans font-bold mb-6 text-blue-500 uppercase tracking-tighter italic">The Credora Solution</h3>
                <ul className="space-y-4">
                    <li className="flex gap-3 text-slate-300 text-sm">
                        <span className="text-blue-500 font-bold">•</span>
                        AI Skill DNA Mapping for scientific talent identification.
                    </li>
                    <li className="flex gap-3 text-slate-300 text-sm">
                        <span className="text-blue-500 font-bold">•</span>
                        Reverse Hiring where recruiters come to you with verified offers.
                    </li>
                    <li className="flex gap-3 text-slate-300 text-sm">
                        <span className="text-blue-500 font-bold">•</span>
                        Mentorship & Gamified tracks to close your specific gaps.
                    </li>
                </ul>
            </div>
        </section>

        {/* Team Section */}
        <section>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-sans font-bold mb-4 uppercase tracking-tighter text-white">The <span className="text-blue-500">Founding Circle</span></h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">The architects behind the intelligence engine.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-black/20 p-8 rounded-[2.5rem] border border-white/5 text-center group hover:bg-slate-900 transition-all"
              >
                <div className="w-20 h-20 bg-blue-600/10 rounded-2xl mx-auto mb-6 flex items-center justify-center font-bold text-3xl text-blue-500 border border-blue-500/10 group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:rotate-6">
                  {member.name[0]}
                </div>
                <h4 className="font-bold text-white mb-1 uppercase tracking-tight text-sm">{member.name}</h4>
                <p className="text-blue-500 text-[10px] font-bold uppercase tracking-widest leading-none mb-4">{member.role}</p>
                <p className="text-slate-500 text-[11px] leading-relaxed italic">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
