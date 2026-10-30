
import { useState, type FormEvent } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  Headphones,
  ShieldCheck,
  Zap,
  CheckCircle,
  LoaderCircle,
  ChevronDown,
  Package, // Add this line
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const initialForm: ContactForm = {
  name: "",
  email: "",
  phone: "",
  subject: "Product Inquiry",
  message: "",
};

const contactDetails = [
  {
    icon: Phone,
    title: "Call Us",
    description: "Talk to our customer support team.",
    value: "Add your business phone",
    href: "",
  },
  {
    icon: Mail,
    title: "Email Us",
    description: "Send us your questions anytime.",
    value: "Add your business email",
    href: "",
  },
  {
    icon: MapPin,
    title: "Visit Us",
    description: "Our store location.",
    value: "Add your business address",
    href: "",
  },
  {
    icon: Clock,
    title: "Business Hours",
    description: "Customer support availability.",
    value: "Monday – Saturday, 9 AM – 6 PM",
    href: "",
  },
];

const faqs = [
  {
    question: "How can I track my order?",
    answer:
      "Log in to your account and open My Orders to view your order status and details.",
  },
  {
    question: "Can I get help choosing an electrical product?",
    answer:
      "Yes. Contact our team with the product name, specifications and your requirements.",
  },
  {
    question: "How can I report a damaged or incorrect product?",
    answer:
      "Contact customer support with your order ID, product details and a description of the issue.",
  },
  {
    question: "Can I enquire about bulk orders?",
    answer:
      "Yes. Select Bulk Order / Business Inquiry in the contact form and mention your required quantities.",
  },
];

const ContactUs = () => {
  const [form, setForm] = useState<ContactForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm((current) => ({
      ...current,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Please complete all required fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      toast.error("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      setSubmitted(false);

      // Requires a matching backend contact API.
      const response = await axios.post(`${API_URL}/contact`, {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        subject: form.subject,
        message: form.message.trim(),
      });

      if (response.data?.success === false) {
        throw new Error(
          response.data.message || "Unable to send your message."
        );
      }

      setSubmitted(true);
      setForm(initialForm);
      toast.success("Your message has been submitted successfully.");
    } catch (error) {
      console.error("Contact form error:", error);

      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : error instanceof Error
          ? error.message
          : undefined;

      toast.error(
        message ||
          "Unable to submit your message. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF7F2] text-[#142D4E]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#142D4E] px-4 py-16 text-white sm:px-8 sm:py-20">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-sky-400/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold">
            <MessageCircle size={17} />
            We are here to help
          </div>

          <h1 className="mt-6 max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
            Let's Talk About Your
            <span className="text-amber-400"> Electrical Needs.</span>
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
            Need help choosing products, tracking an order or requesting a
            bulk quote? Send us a message and our team will assist you.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#contact-form"
              className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-3.5 font-bold text-[#142D4E] transition hover:bg-amber-300"
            >
              Contact Our Team
              <Send size={18} />
            </a>

            <a
              href="#contact-details"
              className="inline-flex items-center rounded-xl border border-white/30 px-6 py-3.5 font-bold text-white transition hover:bg-white/10"
            >
              Contact Information
            </a>
          </div>

          <div className="mt-10 flex flex-wrap gap-6 text-sm text-slate-200">
            <span className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-400" />
              Customer Support
            </span>
            <span className="flex items-center gap-2">
              <Zap size={18} className="text-amber-400" />
              Electrical Products
            </span>
            <span className="flex items-center gap-2">
              <Headphones size={18} className="text-sky-300" />
              Product Assistance
            </span>
          </div>
        </div>
      </section>

      {/* Contact details */}
      <section
        id="contact-details"
        className="scroll-mt-24 px-4 py-14 sm:px-8 lg:py-20"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-sky-700">
              Get in touch
            </p>

            <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
              How Can We Help You?
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              Reach out to us for product information, order assistance,
              business enquiries or general support.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {contactDetails.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                    <Icon size={24} />
                  </div>

                  <h3 className="mt-5 text-lg font-bold">{item.title}</h3>

                  <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">
                    {item.description}
                  </p>

                  <p className="mt-3 break-words text-sm font-semibold text-[#087EBC]">
                    {item.value}
                  </p>
                </article>
              );
            })}
          </div>

          <p className="mt-4 text-center text-xs text-slate-500">
            Replace the sample contact details above with your verified
            business information before publishing.
          </p>
        </div>
      </section>

      {/* Contact form */}
      <section
        id="contact-form"
        className="scroll-mt-24 px-4 pb-16 sm:px-8 lg:pb-20"
      >
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-5">
          <div className="rounded-3xl bg-[#142D4E] p-7 text-white sm:p-10 lg:col-span-2">
            <p className="text-sm font-bold uppercase tracking-widest text-emerald-300">
              Contact ElectroStore
            </p>

            <h2 className="mt-4 text-3xl font-extrabold leading-tight">
              Tell Us What You Need.
            </h2>

            <p className="mt-4 leading-7 text-slate-300">
              Share your question or requirement. Include your order ID
              when contacting us about an existing purchase.
            </p>

            <div className="mt-9 space-y-6">
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
                  <Package size={22} className="text-emerald-300" />
                </div>

                <div>
                  <h3 className="font-bold">Order Support</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-300">
                    Questions about an order, delivery or product.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
                  <Zap size={22} className="text-amber-300" />
                </div>

                <div>
                  <h3 className="font-bold">Product Enquiries</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-300">
                    Ask about product specifications and availability.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
                  <ShieldCheck size={22} className="text-sky-300" />
                </div>

                <div>
                  <h3 className="font-bold">Business & Bulk Orders</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-300">
                    Send your requirements for a business enquiry.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10 lg:col-span-3">
            <h2 className="text-2xl font-extrabold">
              Send Us a Message
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Fields marked with * are required.
            </p>

            {submitted && (
              <div
                role="status"
                className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800"
              >
                <CheckCircle size={22} className="mt-0.5 shrink-0" />

                <div>
                  <p className="font-bold">Message submitted</p>
                  <p className="mt-1 text-sm">
                    Thank you for contacting ElectroStore.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Full Name *
                  </label>

                  <input
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    autoComplete="name"
                    maxLength={100}
                    required
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-600 focus:ring-2 focus:ring-sky-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Email Address *
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    autoComplete="email"
                    maxLength={254}
                    required
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-600 focus:ring-2 focus:ring-sky-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Phone Number
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Your contact number"
                    autoComplete="tel"
                    maxLength={20}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-600 focus:ring-2 focus:ring-sky-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Enquiry Type *
                  </label>

                  <div className="relative">
                    <select
                      id="subject"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      required
                      className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 pr-10 outline-none transition focus:border-sky-600 focus:ring-2 focus:ring-sky-100"
                    >
                      <option>Product Inquiry</option>
                      <option>Order Support</option>
                      <option>Delivery Issue</option>
                      <option>Return or Warranty</option>
                      <option>Bulk Order / Business Inquiry</option>
                      <option>General Feedback</option>
                      <option>Other</option>
                    </select>

                    <ChevronDown
                      size={18}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block text-sm font-semibold"
                >
                  Your Message *
                </label>

                <textarea
                  id="message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Describe your question or requirements..."
                  rows={6}
                  minLength={5}
                  maxLength={3000}
                  required
                  className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-sky-600 focus:ring-2 focus:ring-sky-100"
                />

                <p className="mt-1 text-right text-xs text-slate-400">
                  {form.message.length}/3000 characters
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#087EBC] px-6 py-4 font-bold text-white transition hover:bg-[#06699D] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {loading ? (
                  <>
                    <LoaderCircle size={20} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Send Message
                    <Send size={18} />
                  </>
                )}
              </button>

              <p className="text-xs leading-5 text-slate-500">
                Please do not include passwords, payment card details or
                other sensitive information in your message.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="border-t border-slate-200 bg-white px-4 py-16 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-sky-700">
              FAQs
            </p>

            <h2 className="mt-3 text-3xl font-extrabold">
              Frequently Asked Questions
            </h2>

            <p className="mt-3 leading-7 text-slate-500">
              Quick answers to common customer questions.
            </p>
          </div>

          <div className="mt-9 space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={faq.question}
                className="overflow-hidden rounded-xl border border-slate-200"
              >
                <button
                  type="button"
                  aria-expanded={openFaq === index}
                  onClick={() =>
                    setOpenFaq((current) =>
                      current === index ? null : index
                    )
                  }
                  className="flex w-full items-center justify-between gap-4 p-5 text-left font-bold transition hover:bg-slate-50"
                >
                  <span>{faq.question}</span>

                  <ChevronDown
                    size={20}
                    className={`shrink-0 transition-transform ${
                      openFaq === index ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openFaq === index && (
                  <div className="border-t border-slate-100 px-5 py-4 text-sm leading-7 text-slate-600">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom banner */}
      <section className="px-4 py-12 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-5 rounded-3xl bg-amber-400 p-7 sm:flex-row sm:items-center sm:p-10">
          <div>
            <h2 className="text-2xl font-extrabold text-[#142D4E]">
              Need electrical products for your business?
            </h2>

            <p className="mt-2 leading-7 text-[#142D4E]/80">
              Tell us your product requirements and estimated quantities.
            </p>
          </div>

          <a
            href="#contact-form"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#142D4E] px-6 py-3.5 font-bold text-white transition hover:bg-[#203F68]"
          >
            Request a Quote
            <Send size={17} />
          </a>
        </div>
      </section>
    </main>
  );
};

export default ContactUs;
