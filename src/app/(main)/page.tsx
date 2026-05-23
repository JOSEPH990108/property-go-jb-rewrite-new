// src\app\(main)\page.tsx
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, Building2, TrendingUp, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="bg-background relative min-h-screen overflow-hidden">
      {/* ===== ANIMATED BACKGROUND ===== */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <div className="bg-primary/30 absolute top-1/4 -left-20 h-96 w-96 animate-pulse rounded-full blur-[120px]" />
        <div
          className="bg-accent/30 absolute -right-20 bottom-1/4 h-96 w-96 animate-pulse rounded-full blur-[120px]"
          style={{ animationDelay: "1s" }}
        />
        <div className="from-primary/10 to-accent/10 absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r blur-[150px]" />

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: `linear-gradient(var(--accent) 1px, transparent 1px), linear-gradient(90deg, var(--accent) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Radial gradient overlay */}
        <div className="via-background/50 to-background absolute inset-0 bg-gradient-to-b from-transparent" />
      </div>

      {/* ===== HERO SECTION ===== */}
      <section className="relative z-10 flex min-h-screen items-center justify-center px-6">
        <div className="mx-auto max-w-6xl text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="border-accent/30 bg-accent/5 mb-8 inline-flex items-center gap-2 rounded-full border px-4 py-2 backdrop-blur-sm"
          >
            <Sparkles className="text-accent h-4 w-4" />
            <span className="text-accent text-sm font-medium">Premium Real Estate Platform</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl"
          >
            <span className="text-foreground">Discover Your</span>
            <br />
            <span className="from-primary via-accent to-primary animate-gradient bg-gradient-to-r bg-[length:200%_auto] bg-clip-text text-transparent">
              Dream Property
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-muted-foreground mx-auto mb-12 max-w-2xl text-lg sm:text-xl"
          >
            Experience the future of real estate in Johor Bahru. Premium properties, cutting-edge
            technology, exceptional service.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link
              href="/projects"
              className="group from-primary to-accent text-primary-foreground shadow-primary/25 hover:shadow-primary/30 relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r px-8 py-4 text-lg font-semibold shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
            >
              <span>Explore Properties</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              {/* Glow effect */}
              <div className="from-primary to-accent absolute inset-0 rounded-full bg-gradient-to-r opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-50" />
            </Link>

            <Link
              href="/tools"
              className="group border-border hover:border-accent bg-background/50 text-foreground hover:shadow-accent/10 inline-flex items-center gap-2 rounded-full border-2 px-8 py-4 text-lg font-semibold backdrop-blur-sm transition-all duration-300 hover:shadow-lg"
            >
              <span>Financial Tools</span>
              <TrendingUp className="h-5 w-5 transition-transform group-hover:scale-110" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="relative z-10 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              Why Choose <span className="gradient-text">PropertyGoJB</span>
            </h2>
            <p className="text-muted-foreground mx-auto max-w-xl">
              Powered by technology, driven by excellence
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Building2,
                title: "Premium Properties",
                description:
                  "Curated selection of high-end developments in prime locations across Johor Bahru.",
                delay: 0,
              },
              {
                icon: TrendingUp,
                title: "Smart Analytics",
                description:
                  "Advanced market insights and financial tools to make informed investment decisions.",
                delay: 0.1,
              },
              {
                icon: Shield,
                title: "Trusted Service",
                description:
                  "Professional agents with deep local expertise and commitment to excellence.",
                delay: 0.2,
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: feature.delay }}
                className="group border-border bg-card/50 hover:border-accent/50 hover:shadow-accent/5 relative rounded-2xl border p-8 backdrop-blur-sm transition-all duration-500 hover:shadow-xl"
              >
                {/* Gradient border on hover */}
                <div className="from-primary/10 to-accent/10 absolute inset-0 rounded-2xl bg-gradient-to-r opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                <div className="relative">
                  {/* Icon */}
                  <div className="from-primary/10 to-accent/10 border-accent/20 group-hover:shadow-accent/20 mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl border bg-gradient-to-br transition-all duration-300 group-hover:shadow-lg">
                    <feature.icon className="text-accent h-7 w-7" />
                  </div>

                  <h3 className="mb-3 text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STATS SECTION ===== */}
      <section className="relative z-10 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="border-border from-card via-card to-accent/5 relative overflow-hidden rounded-3xl border bg-gradient-to-br p-12">
            {/* Background glow */}
            <div className="bg-accent/10 absolute top-0 right-0 h-96 w-96 rounded-full blur-[100px]" />
            <div className="bg-primary/10 absolute bottom-0 left-0 h-96 w-96 rounded-full blur-[100px]" />

            <div className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { value: "500+", label: "Premium Properties" },
                { value: "10K+", label: "Happy Clients" },
                { value: "15+", label: "Years Experience" },
                { value: "98%", label: "Client Satisfaction" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="from-primary to-accent mb-2 bg-gradient-to-r bg-clip-text text-4xl font-bold text-transparent sm:text-5xl">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="relative z-10 px-6 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="mb-6 text-3xl font-bold sm:text-4xl lg:text-5xl">
              Ready to Find Your
              <br />
              <span className="gradient-text">Perfect Home?</span>
            </h2>
            <p className="text-muted-foreground mx-auto mb-8 max-w-xl text-lg">
              Connect with our expert team and start your property journey today.
            </p>
            <Link
              href="/contact"
              className="bg-foreground text-background hover:bg-foreground/90 inline-flex items-center gap-2 rounded-full px-8 py-4 text-lg font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
            >
              Get Started
              <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
