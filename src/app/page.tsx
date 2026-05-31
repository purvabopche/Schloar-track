"use client";

import React from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, Variants } from "framer-motion";
import { FiArrowRight, FiShield, FiFileText, FiTarget, FiCpu, FiGlobe, FiTrendingUp, FiCheckCircle, FiPlay } from "react-icons/fi";

export default function Home() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black font-sans text-slate-200 selection:bg-cyan-500/30 overflow-hidden">
      
      {/* Premium Minimal Grid Background */}
      <div className="fixed inset-0 z-0 pointer-events-none flex items-center justify-center">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_40%,#000_70%,transparent_100%)]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[50vh] bg-cyan-900/20 blur-[120px] rounded-full mix-blend-screen"></div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 flex-grow flex flex-col items-center justify-center min-h-[100vh] px-4 sm:px-6 lg:px-8 mt-[-3rem] pb-32 pt-24">
        <motion.div style={{ opacity, scale }} className="w-full max-w-7xl mx-auto flex flex-col items-center mt-8">
          <motion.div
            className="text-center w-full max-w-5xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/50 border border-slate-700/50 backdrop-blur-md mb-8">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-widest">ScholarTrack 2.0 is Live</span>
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter mb-6 leading-[1.05] text-white">
              Empowering the <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600">Smart Scholar.</span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Experience the pinnacle of scholarship management. Streamlined workflows, AI-driven verification, and a world-class platform built for institutions and ambition.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-center gap-4 items-center">
              <Link
                href="/register"
                className="group relative px-8 py-4 bg-white text-black rounded-full font-semibold text-lg hover:scale-105 transition-all duration-300 flex items-center shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)]"
              >
                <span>Get Started</span>
                <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 bg-slate-900 text-white border border-slate-800 rounded-full font-semibold text-lg hover:bg-slate-800 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <FiPlay className="text-cyan-400" /> Watch Demo
              </Link>
            </motion.div>
          </motion.div>

          {/* Dashboard Preview Mockup */}
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
            className="w-full max-w-5xl mx-auto mt-20 relative hidden sm:block"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent z-10 bottom-[-20px] rounded-b-xl"></div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-2 shadow-2xl relative">
              <div className="flex items-center gap-2 px-4 py-3 bg-slate-900 rounded-t-xl border-b border-slate-800">
                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              </div>
              <div className="h-[400px] w-full bg-[#0a0a0a] rounded-b-xl relative overflow-hidden flex p-6 gap-6">
                {/* Mock Sidebar */}
                <div className="hidden md:flex flex-col w-64 h-full gap-4 border-r border-slate-800/50 pr-6">
                  <div className="h-8 w-32 bg-slate-800 rounded-md mb-8"></div>
                  {[1,2,3,4].map(i => <div key={i} className={`h-10 w-full rounded-md ${i===1 ? 'bg-cyan-900/30 border border-cyan-800/50 text-cyan-400 flex items-center px-4' : 'bg-slate-900/50'}`}></div>)}
                </div>
                {/* Mock Main Content */}
                <div className="flex-1 flex flex-col gap-6">
                  <div className="h-10 w-48 bg-slate-800/50 rounded-md mb-4"></div>
                  <div className="flex gap-4">
                    {[1,2,3].map(i => <div key={i} className="flex-1 h-32 bg-slate-800/30 rounded-xl border border-slate-800/50 relative overflow-hidden"><div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent"></div></div>)}
                  </div>
                  <div className="flex-1 bg-slate-800/20 rounded-xl border border-slate-800/50"></div>
                </div>
              </div>
            </div>
          </motion.div>

        </motion.div>
      </section>

      {/* Redesigned Features Section */}
      <section className="relative z-10 py-32 bg-black border-t border-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="md:flex justify-between items-end mb-20"
          >
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                Designed for <span className="text-cyan-400">Scale.</span>
              </h2>
              <p className="text-slate-400 text-lg">
                Complex processes simplified through elegant design and powerful integrations. Everything you need to manage the future of education.
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<FiTarget />}
              title="Intuitive Application"
              desc="A frictionless experience for students with auto-saving, document previews, and clear progress indicators."
            />
            <FeatureCard
              icon={<FiCpu />}
              title="AI-Assisted Processing"
              desc="Leverage intelligent algorithms to verify documents faster, reducing human error and manual workload by 40%."
            />
            <FeatureCard
              icon={<FiShield />}
              title="Enterprise Security"
              desc="Bank-grade encryption, role-based access control, and comprehensive audit logs protect sensitive student data."
            />
            <FeatureCard
              icon={<FiGlobe />}
              title="Global Accessibility"
              desc="Translated ready, GDPR compliant, and optimized for low-bandwidth connections across the globe."
            />
            <FeatureCard
              icon={<FiTrendingUp />}
              title="Real-time Analytics"
              desc="Gain profound insights with customizable dashboards and granular reporting on applicant demographics."
            />
            <FeatureCard
              icon={<FiFileText />}
              title="Automated Workflows"
              desc="Trigger emails, allocate funds, and update statuses automatically using our powerful logic engine."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 mb-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-slate-900 to-black rounded-[2.5rem] p-12 md:p-20 text-center border border-slate-800 relative overflow-hidden shadow-[0_0_80px_rgba(8,145,178,0.05)]">
            <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-700/10 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-700/10 rounded-full blur-[100px] pointer-events-none"></div>
            
            <h3 className="text-3xl md:text-5xl font-bold text-white mb-8 tracking-tight">
              Ready to redefine your workflow?
            </h3>
            <p className="text-slate-400 text-lg font-medium mb-10 max-w-xl mx-auto">
              Join thousands of institutions already using ScholarTrack to streamline their scholarship lifecycle.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/register" className="px-8 py-4 bg-cyan-500 text-black rounded-full font-bold text-lg hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/25">
                Create Free Account
              </Link>
              <Link href="/login" className="px-8 py-4 bg-slate-900 text-white rounded-full font-bold text-lg hover:bg-slate-800 border border-slate-700 transition-colors">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-black py-12 border-t border-slate-900 text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-black font-bold">ST</div>
            <span className="font-semibold text-slate-300">ScholarTrack</span>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} All rights reserved. Developed with Next.js.</p>
          <div className="flex gap-6 text-sm font-medium">
            <span className="hover:text-cyan-400 cursor-pointer transition-colors">Twitter</span>
            <span className="hover:text-cyan-400 cursor-pointer transition-colors">GitHub</span>
            <span className="hover:text-cyan-400 cursor-pointer transition-colors">Docs</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => {
  return (
    <motion.div
      variants={{
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.6 } }
      } as Variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{ y: -5 }}
      className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 hover:bg-slate-800/80 transition-all duration-300 relative group overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 group-hover:bg-cyan-950 transition-all duration-300 shadow-lg shadow-black/50">
        {React.cloneElement(icon as any, { size: 24 })}
      </div>
      <h3 className="text-xl font-bold text-slate-200 mb-3 group-hover:text-white transition-colors">{title}</h3>
      <p className="text-slate-400 leading-relaxed text-sm">{desc}</p>
    </motion.div>
  );
};

