
import { Link } from "react-router-dom";
import {
  Zap,
  ShieldCheck,
  Users,
  Target,
  Eye,
  Award,
  Truck,
  Headphones,
  BadgeCheck,
  ArrowRight,
  CheckCircle,
  Lightbulb,
  Building2,
  HeartHandshake,
  PackageCheck,
} from "lucide-react";

const values = [
  {
    icon: ShieldCheck,
    title: "Quality First",
    description:
      "We aim to offer dependable electrical products that meet customers' needs for everyday use and business projects.",
  },
  {
    icon: Users,
    title: "Customer Focus",
    description:
      "We put customers first by making product discovery, enquiries and shopping straightforward.",
  },
  {
    icon: BadgeCheck,
    title: "Trust & Transparency",
    description:
      "We believe in clear product information, transparent pricing and honest communication.",
  },
  {
    icon: Lightbulb,
    title: "Continuous Improvement",
    description:
      "We keep looking for better ways to make electrical shopping simpler and more convenient.",
  },
];

const benefits = [
  {
    icon: PackageCheck,
    title: "Product Variety",
    description:
      "Explore electrical supplies across lighting, wiring, tools, appliances and more.",
  },
  {
    icon: ShieldCheck,
    title: "Quality-Focused Selection",
    description:
      "Find products selected with reliability, specifications and practical use in mind.",
  },
  {
    icon: Headphones,
    title: "Customer Assistance",
    description:
      "Get help with product questions, orders and general enquiries.",
  },
  {
    icon: Truck,
    title: "Convenient Ordering",
    description:
      "Browse products and place orders online from the comfort of your home or workplace.",
  },
];

const AboutUs = () => {
  return (
    <main className="min-h-screen bg-[#FAF7F2] text-[#142D4E]">
      {/* Hero section */}
      <section className="relative overflow-hidden bg-[#142D4E] px-4 py-16 text-white sm:px-8 sm:py-24">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-sky-400/10 blur-3xl" />
        <div className="absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-amber-400/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-sky-100">
              <Zap size={17} className="text-amber-400" />
              About ElectroStore
            </span>

            <h1 className="mt-6 text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
              Powering Everyday Life with
              <span className="text-amber-400"> Better Choices.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-slate-200 sm:text-lg">
              ElectroStore is an online destination for electrical supplies,
              designed to make discovering and ordering electrical products
              easier for homes, professionals and businesses.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-3.5 font-bold text-[#142D4E] transition hover:bg-amber-300"
              >
                Explore Products
                <ArrowRight size={18} />
              </Link>

              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-6 py-3.5 font-bold text-white transition hover:bg-white/10"
              >
                Contact Us
              </Link>
            </div>
          </div>

          {/* Decorative visual */}
          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute inset-4 rounded-[2rem] bg-sky-400/20 blur-2xl" />

            <div className="relative rounded-[2rem] border border-white/15 bg-white/5 p-6 shadow-2xl backdrop-blur-sm sm:p-10">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex min-h-40 flex-col justify-between rounded-2xl bg-amber-400 p-5 text-[#142D4E]">
                  <Zap size={34} />
                  <div>
                    <h2 className="text-lg font-extrabold">
                      Electrical
                    </h2>
                    <p className="mt-1 text-sm font-medium">
                      Everyday essentials
                    </p>
                  </div>
                </div>

                <div className="flex min-h-40 flex-col justify-between rounded-2xl bg-white p-5 text-[#142D4E]">
                  <ShieldCheck size={34} className="text-emerald-600" />
                  <div>
                    <h2 className="text-lg font-extrabold">
                      Reliability
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      Quality-focused choices
                    </p>
                  </div>
                </div>

                <div className="col-span-2 rounded-2xl border border-white/10 bg-[#203F68] p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                      <Building2
                        size={30}
                        className="text-amber-400"
                      />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold">
                        For Homes & Businesses
                      </h2>
                      <p className="mt-1 text-sm leading-6 text-slate-300">
                        Electrical products for everyday needs and projects.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="px-4 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-sky-700">
              Who We Are
            </p>

            <h2 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">
              Making Electrical Shopping More Convenient
            </h2>

            <p className="mt-5 leading-8 text-slate-600">
              Finding the right electrical product should be simple.
              ElectroStore brings product discovery, shopping and customer
              enquiries together in one convenient online experience.
            </p>

            <p className="mt-4 leading-8 text-slate-600">
              Whether you are looking for lighting for your home, tools for
              a project or electrical supplies for your business, our goal
              is to help you explore your options and make informed choices.
            </p>

            <div className="mt-7 space-y-3">
              {[
                "Browse electrical products by category.",
                "Review product details before ordering.",
                "Contact our team for product and order assistance.",
                "Explore options for business and bulk enquiries.",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle
                    size={21}
                    className="mt-0.5 shrink-0 text-emerald-600"
                  />
                  <p className="leading-6 text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-9">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
              <Zap size={34} />
            </div>

            <h3 className="mt-6 text-2xl font-extrabold">
              One Place for Electrical Essentials
            </h3>

            <p className="mt-4 leading-7 text-slate-600">
              Our store is designed around the things that matter when
              shopping for electrical products: useful product information,
              a convenient browsing experience and accessible customer support.
            </p>

            <div className="mt-7 grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-[#FAF7F2] p-5">
                <Lightbulb
                  size={27}
                  className="text-amber-500"
                />
                <p className="mt-3 font-bold">Lighting</p>
                <p className="mt-1 text-sm text-slate-500">
                  Everyday illumination
                </p>
              </div>

              <div className="rounded-2xl bg-[#FAF7F2] p-5">
                <Building2
                  size={27}
                  className="text-sky-700"
                />
                <p className="mt-3 font-bold">Business</p>
                <p className="mt-1 text-sm text-slate-500">
                  Project enquiries
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission and vision */}
      <section className="bg-white px-4 py-16 sm:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-sky-700">
              Our Direction
            </p>

            <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">
              Our Mission & Vision
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              The principles that guide the experience we want to create
              for our customers.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <article className="rounded-3xl bg-[#142D4E] p-7 text-white sm:p-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-amber-400">
                <Target size={30} />
              </div>

              <h3 className="mt-6 text-2xl font-extrabold">
                Our Mission
              </h3>

              <p className="mt-4 leading-8 text-slate-200">
                To make electrical product shopping more accessible and
                convenient by bringing useful product choices, clear
                information and customer support into one online platform.
              </p>
            </article>

            <article className="rounded-3xl bg-[#EAF5FC] p-7 sm:p-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-sky-700">
                <Eye size={30} />
              </div>

              <h3 className="mt-6 text-2xl font-extrabold">
                Our Vision
              </h3>

              <p className="mt-4 leading-8 text-slate-700">
                To build a trusted destination for electrical supplies
                where households, professionals and businesses can
                confidently explore products and find solutions for their needs.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="px-4 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-sky-700">
              What Matters to Us
            </p>

            <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">
              Our Core Values
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              The values we aim to reflect in every customer interaction.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => {
              const Icon = value.icon;

              return (
                <article
                  key={value.title}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                    <Icon size={25} />
                  </div>

                  <h3 className="mt-5 text-lg font-extrabold">
                    {value.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {value.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-white px-4 py-16 sm:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-sky-700">
              The ElectroStore Experience
            </p>

            <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">
              Why Shop With Us?
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              A convenient way to explore electrical products and get
              assistance when you need it.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;

              return (
                <article
                  key={benefit.title}
                  className="flex gap-5 rounded-2xl border border-slate-200 p-6 sm:p-7"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#FAF7F2] text-sky-700">
                    <Icon size={28} />
                  </div>

                  <div>
                    <h3 className="text-lg font-extrabold">
                      {benefit.title}
                    </h3>

                    <p className="mt-2 leading-7 text-slate-600">
                      {benefit.description}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Business CTA */}
      <section className="px-4 py-16 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 rounded-3xl bg-amber-400 p-7 sm:p-10 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-widest text-[#142D4E]/75">
              <HeartHandshake size={19} />
              For Business Customers
            </div>

            <h2 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">
              Planning a Project or Bulk Purchase?
            </h2>

            <p className="mt-4 max-w-xl leading-7 text-[#142D4E]/80">
              Tell us which products you need and your estimated quantities.
              Our contact team can help you with your enquiry.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-xl bg-[#142D4E] px-6 py-3.5 font-bold text-white transition hover:bg-[#203F68]"
            >
              Contact Our Team
              <ArrowRight size={18} />
            </Link>

            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-[#142D4E]/20 px-6 py-3.5 font-bold text-[#142D4E] transition hover:bg-amber-300"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </section>

      {/* Final trust section */}
      <section className="border-t border-slate-200 bg-white px-4 py-12 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
            <Award size={30} />
          </div>

          <h2 className="text-2xl font-extrabold">
            Thank You for Choosing ElectroStore
          </h2>

          <p className="max-w-2xl leading-7 text-slate-600">
            We appreciate your interest in our store. We aim to make your
            electrical shopping experience convenient, clear and helpful.
          </p>

          <Link
            to="/products"
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#087EBC] px-6 py-3.5 font-bold text-white transition hover:bg-[#06699D]"
          >
            Start Shopping
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
};

export default AboutUs;
