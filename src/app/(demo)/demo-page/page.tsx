// src\app\(demo)\demo-page\page.tsx
"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, BedDouble, Bath, Star, Check, Shield, Ruler, LogIn } from "lucide-react";

// --- Components Imports ---

// Carousels
import { Carousel as RotateCarousel } from "@/components/carousel/3DRotateCarousel";
import { FanCarousel } from "@/components/carousel/FanCarousel";
import GeneralCarousel from "@/components/carousel/GeneralCarousel";
import { ScrollCarousel } from "@/components/carousel/ScrollCarousel";
import { SimpleCardCarousel } from "@/components/carousel/SimpleCardCarousel";

// Auth
import SignInForm from "@/components/auth/SignInForm";
import SignUpForm from "@/components/auth/SignUpForm";
import { useUIStore } from "@/stores/ui-store";

// Features & Tools
import DsrCalculatorLive from "@/components/custom/feature/tools/DSRCalculator";
import MortgageCalculator from "@/components/custom/feature/tools/MortgageCalculator";
import PropertyMatcher from "@/components/custom/feature/tools/PropertyMatcher";
import RealEstateCard from "@/components/custom/feature/RealEstateCard";
import VerticalTabs from "@/components/custom/ui/VerticalTabs";

// Shared & Layout
import { Navbar } from "@/components/layout/NavBar";
import { CollapsibleContainer } from "@/components/shared/CollapsibleContainer";
import { SwipeWrapper } from "@/components/shared/SwipeWrapper";
import { MotionSection } from "@/components/shared/MotionSection";

// UI Components (just Button for triggers)
import { Button } from "@/components/ui/button";
import { TabItem } from "@/types";

/* =========================================================================
   MOCK DATA
   ========================================================================= */

// --- Property Data for Cards ---
const MOCK_PROPERTIES = [
  {
    id: 1,
    title: "Eco Spring Luxury Villa",
    price: "RM 2,500,000",
    location: "Tebrau, Johor Bahru",
    beds: 5,
    baths: 4,
    size: "3,200 sqft",
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    title: "Horizon Hills Mansion",
    price: "RM 3,800,000",
    location: "Iskandar Puteri, Johor",
    beds: 6,
    baths: 6,
    size: "4,500 sqft",
    rating: 5.0,
    image:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    title: "Princess Cove Condo",
    price: "RM 850,000",
    location: "JB City Centre",
    beds: 3,
    baths: 2,
    size: "1,100 sqft",
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1567496898905-af413988d4d2?auto=format&fit=crop&w=800&q=80",
  },
];

// --- Carousel Images/Items ---
const CAROUSEL_IMAGES = [
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2653&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=2670&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=2670&auto=format&fit=crop",
];

// --- Vertical Tabs Mock Content ---
const ArchitectureContent = () => (
  <div className="space-y-6">
    <div className="relative h-64 w-full overflow-hidden rounded-xl">
      <img
        src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2653&auto=format&fit=crop"
        alt="Modern Architecture"
        className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
      />
      <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-6">
        <p className="font-serif text-lg text-white italic">
          "A silhouette that defines the skyline."
        </p>
      </div>
    </div>
    <div className="prose prose-zinc dark:prose-invert max-w-none">
      <h3 className="text-foreground font-serif text-2xl">The Glass Monolith</h3>
      <p className="text-muted-foreground leading-relaxed">
        Designed by award-winning architects, the façade features a signature double-glazed curtain
        wall system that maximizes natural light while ensuring thermal comfort.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-muted/30 border-border rounded-lg border p-4">
          <span className="text-accent mb-1 block text-xs tracking-widest uppercase">Height</span>
          <span className="text-xl font-bold">45 Stories</span>
        </div>
        <div className="bg-muted/30 border-border rounded-lg border p-4">
          <span className="text-accent mb-1 block text-xs tracking-widest uppercase">Style</span>
          <span className="text-xl font-bold">Neo-Futurist</span>
        </div>
      </div>
    </div>
  </div>
);

const InteriorsContent = () => (
  <div className="space-y-6">
    <h3 className="text-foreground font-serif text-2xl">Bespoke Elegance</h3>
    <p className="text-muted-foreground">
      Every inch is meticulously crafted. From the imported Italian marble flooring to the gold-leaf
      ceiling accents, the interiors whisper quiet luxury.
    </p>
    <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {[
        "Italian Statuario Marble",
        "Walnut Veneer Cabinetry",
        "Smart Home Integration",
        "Hansgrohe Sanitary Ware",
        "Double Volume Ceilings",
        "Private Lift Lobby",
      ].map((item) => (
        <li key={item} className="text-foreground/80 flex items-center gap-3 text-sm">
          <div className="bg-accent/10 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full">
            <Check className="text-accent h-3 w-3" />
          </div>
          {item}
        </li>
      ))}
    </ul>
    <div className="grid h-40 grid-cols-2 gap-4">
      <img
        src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2600&auto=format&fit=crop"
        className="h-full w-full rounded-lg object-cover"
        alt="Interior 1"
      />
      <img
        src="https://images.unsplash.com/photo-1616486338812-3dadae4b4f9d?q=80&w=2670&auto=format&fit=crop"
        className="h-full w-full rounded-lg object-cover"
        alt="Interior 2"
      />
    </div>
  </div>
);

const AmenitiesContent = () => (
  <div className="space-y-8">
    <div className="flex items-start gap-4">
      <div className="bg-accent/10 text-accent rounded-lg p-3">
        <Shield className="h-6 w-6" />
      </div>
      <div>
        <h4 className="text-foreground text-lg font-bold">Concierge Service</h4>
        <p className="text-muted-foreground text-sm">
          24/7 white-glove service for all your needs.
        </p>
      </div>
    </div>
    <div className="flex items-start gap-4">
      <div className="bg-accent/10 text-accent rounded-lg p-3">
        <MapPin className="h-6 w-6" />
      </div>
      <div>
        <h4 className="text-foreground text-lg font-bold">Prime Location</h4>
        <p className="text-muted-foreground text-sm">Direct access to RTS Link and Marina Bay.</p>
      </div>
    </div>
    <div className="rounded-xl bg-gradient-to-br from-zinc-900 to-black p-6 text-white shadow-2xl">
      <h4 className="text-accent mb-2 font-serif text-xl">The Sky Deck</h4>
      <p className="mb-4 text-sm text-white/70">
        An infinity pool suspended 200m in the air, offering panoramic views.
      </p>
      <button className="border-accent hover:text-accent border-b pb-1 text-xs font-bold tracking-widest uppercase transition-colors">
        View Gallery
      </button>
    </div>
  </div>
);

const TAB_ITEMS: TabItem[] = [
  { id: "arch", label: "Architecture", content: <ArchitectureContent /> },
  { id: "interior", label: "Interiors", content: <InteriorsContent /> },
  { id: "amenities", label: "Amenities", content: <AmenitiesContent /> },
  {
    id: "plans",
    label: "Floor Plans",
    content: (
      <div className="border-border bg-muted/20 flex h-64 flex-col items-center justify-center rounded-xl border-2 border-dashed">
        <Ruler className="text-muted-foreground mb-3 h-10 w-10" />
        <p className="text-muted-foreground font-medium">Interactive Plans Loading...</p>
      </div>
    ),
  },
];

// --- Real Estate Card Mock Data (Featured Collection) ---
const FEATURED_COLLECTION_TABS: TabItem[] = [
  {
    id: "penthouse",
    label: "The Royal Penthouse",
    content: (
      <RealEstateCard
        label="The Royal Penthouse"
        images={[
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=2560&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop",
        ]}
        description="Experience the pinnacle of luxury living in our exclusive Royal Penthouse. Featuring panoramic city views and a private infinity pool."
        specs={{
          area: "4,500 sqft",
          rooms: 4,
          bathrooms: 5,
          Floor: "52nd (Top)",
        }}
        actions={{ primary: "Private Tour" }}
      />
    ),
  },
  {
    id: "villa",
    label: "Oceanfront Villa",
    content: (
      <RealEstateCard
        label="Oceanfront Villa"
        images={[
          "https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=2670&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop",
        ]}
        description="A sanctuary of calm, this Oceanfront Villa merges indoor and outdoor living with direct beach access."
        specs={{
          area: "6,200 sqft",
          rooms: 6,
          bathrooms: 7,
          Exterior: "Private Beach",
        }}
      />
    ),
  },
];

/* =========================================================================
   PAGE COMPONENT
   ========================================================================= */

export default function DemoPage() {
  const { setLoginOpen } = useUIStore();

  return (
    <div className="bg-background text-foreground min-h-screen pb-40">
      {/* 1. LAYOUT COMPONENTS: NavBar (Visual Representation) */}
      {/* Because (demo) might not have the main layout nav, we render it here */}
      <Navbar />

      {/* Hero Section */}
      <section className="bg-brand-950 relative flex h-[60vh] items-center justify-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1920&q=80"
          alt="Hero"
          fill
          className="object-cover opacity-40"
        />
        <div className="relative z-10 px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 font-serif text-5xl font-bold text-white md:text-7xl"
          >
            Component Gallery
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto max-w-2xl text-xl text-white/80"
          >
            Comprehensive showcase of all custom components, tools, and features.
          </motion.p>
        </div>
      </section>

      <div className="container mx-auto space-y-32 px-4 py-20">
        {/* =======================================================
            SECTION: CAROUSELS
           ======================================================= */}
        <section>
          <SectionHeader title="01. Carousels" description="Interactive media showcases." />

          <div className="space-y-16">
            {/* 3D Rotate Carousel */}
            <div>
              <h3 className="mb-6 text-xl font-bold">3D Rotate Carousel</h3>
              <div className="relative h-[400px] w-full overflow-hidden rounded-2xl bg-zinc-900/5 dark:bg-zinc-900/50">
                <RotateCarousel radius={300} duration={30}>
                  {CAROUSEL_IMAGES.slice(0, 4).map((src, i) => (
                    <div
                      key={i}
                      className="h-[280px] w-[200px] overflow-hidden rounded-xl border-2 border-white/20"
                    >
                      <img src={src} className="h-full w-full object-cover" alt={`Slide ${i}`} />
                    </div>
                  ))}
                </RotateCarousel>
              </div>
            </div>

            {/* Fan Carousel */}
            <div>
              <h3 className="mb-6 text-xl font-bold">Fan Carousel</h3>
              <FanCarousel className="h-[500px]">
                {CAROUSEL_IMAGES.map((src, i) => (
                  <div
                    key={i}
                    className="h-full w-full overflow-hidden rounded-xl bg-black shadow-2xl"
                  >
                    <img src={src} className="h-full w-full object-cover" alt={`Fan ${i}`} />
                    <div className="absolute bottom-4 left-4 text-xl font-bold text-white drop-shadow-md">
                      Residence {i + 1}
                    </div>
                  </div>
                ))}
              </FanCarousel>
            </div>

            {/* Scroll Carousel */}
            <div>
              <h3 className="mb-6 text-xl font-bold">Scroll Carousel</h3>
              <div className="flex justify-center">
                <ScrollCarousel autoScroll interval={4000} className="max-w-xl">
                  {CAROUSEL_IMAGES.slice(0, 3).map((src, i) => (
                    <div key={i} className="relative h-64 w-full overflow-hidden rounded-xl">
                      <img src={src} className="h-full w-full object-cover" alt="Scroll Item" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <h4 className="font-serif text-2xl text-white">Feature {i + 1}</h4>
                      </div>
                    </div>
                  ))}
                </ScrollCarousel>
              </div>
            </div>

            {/* Simple Card Carousel */}
            <div>
              <h3 className="mb-6 text-xl font-bold">Simple Card Carousel (Draggable)</h3>
              <SimpleCardCarousel
                items={MOCK_PROPERTIES}
                renderItem={(item) => (
                  <div className="bg-card border-border h-full w-full overflow-hidden rounded-xl border shadow-sm transition-shadow hover:shadow-md">
                    <div className="relative h-48">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute top-2 right-2 flex items-center gap-1 rounded bg-yellow-400 px-2 py-1 text-xs font-bold text-black">
                        <Star size={10} /> {item.rating}
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="truncate text-lg font-bold">{item.title}</h4>
                      <p className="text-muted-foreground text-sm">{item.location}</p>
                      <p className="text-accent mt-2 font-bold">{item.price}</p>
                    </div>
                  </div>
                )}
              />
            </div>

            {/* General Carousel */}
            <div>
              <h3 className="mb-6 text-xl font-bold">General Carousel (Button Navigation)</h3>
              <GeneralCarousel>
                {MOCK_PROPERTIES.map((prop) => (
                  <div
                    key={prop.id}
                    className="bg-card border-border flex h-96 w-80 shrink-0 flex-col items-center justify-center rounded-2xl border p-6 text-center shadow-sm"
                  >
                    <div className="relative mb-4 h-32 w-32 overflow-hidden rounded-full">
                      <Image src={prop.image} fill className="object-cover" alt={prop.title} />
                    </div>
                    <h4 className="font-serif text-xl font-bold">{prop.title}</h4>
                    <p className="text-muted-foreground mt-2 text-sm">{prop.location}</p>
                    <div className="text-foreground/70 mt-6 flex gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <BedDouble size={14} /> {prop.beds}
                      </span>
                      <span className="flex items-center gap-1">
                        <Bath size={14} /> {prop.baths}
                      </span>
                    </div>
                  </div>
                ))}
              </GeneralCarousel>
            </div>
          </div>
        </section>

        {/* =======================================================
            SECTION: FEATURES & TOOLS
           ======================================================= */}
        <section>
          <SectionHeader
            title="02. Calculators & Tools"
            description="Functional tools for real estate."
          />

          <div className="grid grid-cols-1 gap-12 xl:grid-cols-2">
            <div className="space-y-8">
              <h3 className="border-b pb-2 text-xl font-bold">Mortgage Calculator</h3>
              <MortgageCalculator />
            </div>
            <div className="space-y-8">
              <h3 className="border-b pb-2 text-xl font-bold">DSR Calculator</h3>
              <DsrCalculatorLive />
            </div>
          </div>

          <div className="mt-20">
            <h3 className="mb-8 border-b pb-2 text-xl font-bold">Property Matcher</h3>
            {/* Note: This component might manage its own height */}
            <div className="border-border min-h-[600px] overflow-hidden rounded-3xl border">
              <PropertyMatcher />
            </div>
          </div>
        </section>

        {/* =======================================================
            SECTION: UI COMPONENTS (COMPLEX)
           ======================================================= */}
        <section>
          <SectionHeader title="03. Complex UI" description="Advanced interface elements." />

          <div className="space-y-16">
            {/* Vertical Tabs */}
            <div>
              <h3 className="mb-6 text-xl font-bold">Vertical Tabs (Content Switcher)</h3>
              <div className="bg-muted/10 border-border overflow-hidden rounded-3xl border">
                <VerticalTabs items={TAB_ITEMS} />
              </div>
            </div>

            {/* Feature Tabs (using VerticalTabs with RealEstateCard) */}
            <div>
              <h3 className="mb-6 text-xl font-bold">Real Estate Card Integration</h3>
              <div className="bg-muted/10 border-border overflow-hidden rounded-3xl border p-4">
                <VerticalTabs items={FEATURED_COLLECTION_TABS} />
              </div>
            </div>
          </div>
        </section>

        {/* =======================================================
            SECTION: AUTH & SHARED
           ======================================================= */}
        <section>
          <SectionHeader
            title="04. Auth & Shared"
            description="Authentication forms and utilities."
          />

          <div className="mb-16 grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Isolated Auth Forms */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold">Sign In Form (Isolated)</h3>
              <div className="border-border bg-card rounded-xl border p-8 shadow-sm">
                <SignInForm />
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-bold">Sign Up Form (Isolated)</h3>
              <div className="border-border bg-card rounded-xl border p-8 shadow-sm">
                <SignUpForm />
              </div>
            </div>
          </div>

          {/* Interactive Triggers & Utilities */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Login Modal Trigger */}
            <div className="border-border bg-card flex flex-col items-center justify-center gap-4 rounded-xl border p-6 text-center">
              <div className="bg-primary/10 text-primary rounded-full p-4">
                <LogIn size={24} />
              </div>
              <h4 className="font-bold">Global Login Modal</h4>
              <p className="text-muted-foreground text-sm">Controlled via global theme store.</p>
              <Button onClick={() => setLoginOpen(true)}>Open Modal</Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  useUIStore.getState().resetDismissed();
                  alert("Login trigger reset! Refresh or scroll to test.");
                }}
              >
                Reset Trigger State
              </Button>
            </div>

            {/* Collapsible Container Demo */}
            <div className="col-span-1 md:col-span-2">
              <CollapsibleContainer title="Collapsible Utility" defaultOpen>
                <div className="space-y-4 p-4">
                  <p className="text-muted-foreground text-sm">
                    This container uses Framer Motion for smooth height transitions. It also
                    includes a <code>DraggableScrollArea</code> inside.
                  </p>
                  <div className="bg-muted border-muted-foreground/20 flex h-32 items-center justify-center rounded-lg border-2 border-dashed">
                    Scrollable Content Area
                  </div>
                </div>
              </CollapsibleContainer>
            </div>

            {/* Swipe Wrapper Demo */}
            <div className="col-span-1 md:col-span-3">
              <SwipeWrapper
                className="bg-accent/10 border-accent/20 cursor-ew-resize rounded-xl border p-12 text-center"
                onNext={() => alert("Swiped Next!")}
                onPrev={() => alert("Swiped Prev!")}
              >
                <p className="text-accent font-bold">Swipe Me (Left/Right)</p>
                <p className="text-muted-foreground mt-2 text-xs">Uses useSwipe hook</p>
              </SwipeWrapper>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

// --- Helper Components ---

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <MotionSection className="border-border mb-12 border-b pb-6">
      <h2 className="mb-2 font-serif text-3xl font-bold md:text-4xl">{title}</h2>
      <p className="text-muted-foreground text-lg">{description}</p>
    </MotionSection>
  );
}
