"use client";

import { use, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Calendar,
  MapPin,
  CreditCard,
  Clock,
  Sparkles,
  Shield,
  Lock,
} from "lucide-react";
import { providers } from "@/data/dummy";
import { formatCurrency } from "@/lib/utils";
import { calculateFees } from "@/lib/stripe";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

type Step = 1 | 2 | 3 | 4;

const STEP_LABELS = ["Service Details", "Schedule", "Payment", "Confirmed"];

const TIME_SLOTS = [
  "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM",
];

function getDaysArray(count = 14) {
  const days = [];
  for (let i = 0; i < count; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    days.push(d);
  }
  return days;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function BookingPage({ params }: { params: Promise<{ serviceId: string }> }) {
  const { serviceId } = use(params);
  const provider = providers.find((p) => p.id === serviceId) ?? providers[0];

  const [step, setStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    description: "",
    address: "",
    selectedDate: null as Date | null,
    selectedTime: "",
    cardName: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
  });

  const days = getDaysArray(14);
  const price = provider.hourly_rate * 2;
  const fees = calculateFees(price);

  const nextStep = () => setStep((s) => Math.min(s + 1, 4) as Step);
  const prevStep = () => setStep((s) => Math.max(s - 1, 1) as Step);

  const handleConfirm = async () => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 2000));
    setIsLoading(false);
    nextStep();
    toast.success("Booking confirmed!");
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-20 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/providers/${provider.id}`}
            className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to profile
          </Link>

          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">
            Book {provider.full_name}
          </h1>

          {/* Step indicators */}
          <div className="flex items-center gap-0">
            {STEP_LABELS.map((label, i) => {
              const s = (i + 1) as Step;
              const isActive = step === s;
              const isDone = step > s;

              return (
                <div key={label} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                        isDone
                          ? "bg-emerald-500 text-white"
                          : isActive
                          ? "bg-brand-500 text-white ring-4 ring-brand-500/20"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                      )}
                    >
                      {isDone ? <Check className="h-4 w-4" /> : s}
                    </div>
                    <span
                      className={cn(
                        "text-[10px] font-medium whitespace-nowrap",
                        isActive
                          ? "text-brand-600 dark:text-brand-400"
                          : "text-zinc-400"
                      )}
                    >
                      {label}
                    </span>
                  </div>
                  {i < STEP_LABELS.length - 1 && (
                    <div
                      className={cn(
                        "flex-1 h-0.5 mt-[-12px] mx-1 rounded transition-colors",
                        isDone ? "bg-emerald-500" : "bg-zinc-200 dark:bg-zinc-700"
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-[1fr_280px]">
          {/* Main form */}
          <div>
            <AnimatePresence mode="wait">
              {/* Step 1: Service details */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6 space-y-5"
                >
                  <div>
                    <h2 className="font-semibold text-zinc-900 dark:text-white mb-1">
                      Describe your job
                    </h2>
                    <p className="text-sm text-zinc-500">
                      The more detail you provide, the better the quote.
                    </p>
                  </div>

                  <Textarea
                    label="What do you need done?"
                    placeholder="e.g. I need my kitchen and two bathrooms deep cleaned. Apartment is ~1,200 sqft..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={5}
                    fullWidth
                  />

                  {/* AI suggestion */}
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-brand-50 dark:bg-brand-900/10 border border-brand-100 dark:border-brand-800/30">
                    <Sparkles className="h-4 w-4 text-brand-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-brand-700 dark:text-brand-300">
                        AI Tip
                      </p>
                      <p className="text-xs text-brand-600/80 dark:text-brand-400/80 mt-0.5">
                        Include the size of your space, number of rooms, and any specific areas that need extra attention.
                      </p>
                    </div>
                  </div>

                  <Input
                    label="Service address"
                    placeholder="123 Main St, New York, NY 10001"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    leftIcon={<MapPin className="h-4 w-4" />}
                    fullWidth
                  />

                  <Button
                    fullWidth
                    size="lg"
                    onClick={nextStep}
                    disabled={!form.description || !form.address}
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    Continue to Schedule
                  </Button>
                </motion.div>
              )}

              {/* Step 2: Schedule */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6 space-y-6"
                >
                  <div>
                    <h2 className="font-semibold text-zinc-900 dark:text-white mb-1">
                      Choose a date & time
                    </h2>
                    <p className="text-sm text-zinc-500">
                      All times shown in your local timezone.
                    </p>
                  </div>

                  {/* Date picker */}
                  <div>
                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                      Available dates
                    </p>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                      {days.map((day) => {
                        const isSelected =
                          form.selectedDate?.toDateString() === day.toDateString();
                        return (
                          <button
                            key={day.toISOString()}
                            onClick={() =>
                              setForm({ ...form, selectedDate: day })
                            }
                            className={cn(
                              "flex-shrink-0 flex flex-col items-center gap-0.5 w-12 py-2.5 rounded-xl border text-xs font-medium transition-all",
                              isSelected
                                ? "bg-brand-500 border-brand-500 text-white shadow-sm"
                                : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-brand-300 dark:hover:border-brand-700 hover:text-brand-600"
                            )}
                          >
                            <span className="text-[10px] opacity-80">
                              {DAY_NAMES[day.getDay()]}
                            </span>
                            <span className="text-base font-bold">
                              {day.getDate()}
                            </span>
                            <span className="text-[10px] opacity-70">
                              {MONTH_NAMES[day.getMonth()]}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time picker */}
                  <div>
                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                      Available times
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {TIME_SLOTS.map((time) => (
                        <button
                          key={time}
                          onClick={() =>
                            setForm({ ...form, selectedTime: time })
                          }
                          className={cn(
                            "py-2 rounded-xl border text-xs font-medium transition-all",
                            form.selectedTime === time
                              ? "bg-brand-500 border-brand-500 text-white shadow-sm"
                              : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-brand-300 dark:hover:border-brand-700"
                          )}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="secondary" size="lg" onClick={prevStep} className="flex-1">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      size="lg"
                      className="flex-1"
                      onClick={nextStep}
                      disabled={!form.selectedDate || !form.selectedTime}
                      rightIcon={<ArrowRight className="h-4 w-4" />}
                    >
                      Continue
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Payment */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6 space-y-5"
                >
                  <div>
                    <h2 className="font-semibold text-zinc-900 dark:text-white mb-1">
                      Secure payment
                    </h2>
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <Lock className="h-3 w-3" />
                      256-bit SSL encrypted · Powered by Stripe
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Input
                      label="Name on card"
                      placeholder="John Doe"
                      value={form.cardName}
                      onChange={(e) => setForm({ ...form, cardName: e.target.value })}
                      fullWidth
                    />
                    <div className="relative">
                      <Input
                        label="Card number"
                        placeholder="1234 5678 9012 3456"
                        value={form.cardNumber}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, "").slice(0, 16);
                          const formatted = v.replace(/(.{4})/g, "$1 ").trim();
                          setForm({ ...form, cardNumber: formatted });
                        }}
                        fullWidth
                        rightIcon={<CreditCard className="h-4 w-4" />}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Expiry date"
                        placeholder="MM / YY"
                        value={form.cardExpiry}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, "").slice(0, 4);
                          const formatted = v.length > 2 ? `${v.slice(0, 2)} / ${v.slice(2)}` : v;
                          setForm({ ...form, cardExpiry: formatted });
                        }}
                        fullWidth
                      />
                      <Input
                        label="CVC"
                        placeholder="123"
                        value={form.cardCvc}
                        onChange={(e) =>
                          setForm({ ...form, cardCvc: e.target.value.replace(/\D/g, "").slice(0, 4) })
                        }
                        fullWidth
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-sm space-y-2">
                    <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                      <span>Service ({provider.hourly_rate}/hr × 2hr)</span>
                      <span>{formatCurrency(price)}</span>
                    </div>
                    <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                      <span>Platform fee (10%)</span>
                      <span>{formatCurrency(fees.platformFee)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-zinc-900 dark:text-white border-t border-zinc-200 dark:border-zinc-700 pt-2">
                      <span>Total</span>
                      <span>{formatCurrency(fees.total)}</span>
                    </div>
                    <p className="text-xs text-zinc-400 pt-1">
                      💡 Payment is held securely until job is complete.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="secondary" size="lg" onClick={prevStep} className="flex-1">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      size="lg"
                      className="flex-1"
                      isLoading={isLoading}
                      onClick={handleConfirm}
                      disabled={!form.cardName || !form.cardNumber || !form.cardExpiry || !form.cardCvc}
                      rightIcon={!isLoading ? <Lock className="h-4 w-4" /> : undefined}
                    >
                      Confirm & Pay
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Confirmation */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-8 text-center"
                >
                  <motion.div
                    className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-5"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  >
                    <Check className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                  </motion.div>

                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                    Booking Confirmed!
                  </h2>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">
                    {provider.full_name} has been notified and will confirm within{" "}
                    <strong>{provider.response_time}</strong>.
                  </p>

                  <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4 text-sm text-left space-y-2 mb-6">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Provider</span>
                      <span className="font-medium text-zinc-900 dark:text-white">{provider.full_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Date & Time</span>
                      <span className="font-medium text-zinc-900 dark:text-white">
                        {form.selectedDate?.toLocaleDateString()} at {form.selectedTime}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Total Paid</span>
                      <span className="font-bold text-zinc-900 dark:text-white">{formatCurrency(fees.total)}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Link href="/dashboard" className="flex-1">
                      <Button variant="secondary" fullWidth>
                        Go to Dashboard
                      </Button>
                    </Link>
                    <Link href="/dashboard/messages" className="flex-1">
                      <Button fullWidth>
                        Message Provider
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Summary sidebar */}
          <div className="hidden md:block">
            <div className="sticky top-24 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5">
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-4 text-sm">
                Booking Summary
              </h3>

              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <Image
                  src={provider.avatar_url}
                  alt={provider.full_name}
                  width={44}
                  height={44}
                  className="h-11 w-11 rounded-xl object-cover"
                />
                <div>
                  <p className="font-medium text-zinc-900 dark:text-white text-sm">
                    {provider.full_name}
                  </p>
                  <p className="text-xs text-zinc-400">{provider.tagline}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-zinc-500 dark:text-zinc-400">
                {form.selectedDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" />
                    {form.selectedDate.toLocaleDateString()} {form.selectedTime && `at ${form.selectedTime}`}
                  </div>
                )}
                {form.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{form.address}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5" />
                  ~2 hours estimated
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-1.5 text-xs">
                <div className="flex justify-between text-zinc-500">
                  <span>Service</span>
                  <span>{formatCurrency(price)}</span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>Fee</span>
                  <span>{formatCurrency(fees.platformFee)}</span>
                </div>
                <div className="flex justify-between font-bold text-zinc-900 dark:text-white border-t border-zinc-100 dark:border-zinc-800 pt-1.5">
                  <span>Total</span>
                  <span>{formatCurrency(fees.total)}</span>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-1.5 text-xs text-zinc-400">
                <Shield className="h-3 w-3 text-emerald-500" />
                $1M satisfaction guarantee
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
