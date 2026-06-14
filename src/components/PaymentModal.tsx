import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, 
  Sparkles, 
  Check, 
  CreditCard, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Smartphone, 
  X, 
  CheckCircle2, 
  Eye, 
  HelpCircle,
  Calculator
} from 'lucide-react';
import { CardDetails, MembershipPlan } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
  pendingCalculation: string;
}

const MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    id: 'session',
    name: 'Single Session Unlock',
    price: '$0.99',
    period: 'session',
    description: 'Unlock this current formula instantly',
    features: ['Unlock this equation on simulated ledger', 'Full immediate result visualization', 'Gold operation speed for active session']
  },
  {
    id: 'monthly',
    name: 'Premium Monthly Access',
    price: '$4.99',
    period: 'month',
    description: 'Unlimited formula solving subscription',
    features: [
      'Unlock instant = calculations',
      'Unlimited calculation formula history',
      'Gold glow active operational themes',
      'Export formulas to TXT/PDF',
      'Priority solver cloud execution',
      'No ads or calculation limits ever'
    ]
  },
  {
    id: 'lifetime',
    name: 'Ultimate Lifetime Pro',
    price: '$9.99',
    period: 'one-time',
    description: 'Universal math solver unlock forever',
    features: [
      'Universal calculation unlock forever',
      'Super-precision 32-decimal support',
      'Custom iOS retro custom audio skins',
      'Exclusive VIP badge in terminal header',
      'Direct contact mathematical helper line',
      'All future upgrades included'
    ]
  }
];

export default function PaymentModal({ 
  isOpen, 
  onClose, 
  onPaymentSuccess, 
  pendingCalculation 
}: PaymentModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>('monthly');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple_pay'>('card');
  const [ccDetails, setCcDetails] = useState<CardDetails>({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });
  const [isFlipped, setIsFlipped] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [focusedField, setFocusedField] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Formatting card number
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    let matches = value.match(/\d{4,16}/g);
    let match = (matches && matches[0]) || '';
    let parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      value = parts.join(' ');
    } else {
      value = value.substring(0, 19); // Limit to maximum 16 digits + 3 spaces
    }
    
    setCcDetails({ ...ccDetails, number: value });
    setFormError(null);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    setCcDetails({ ...ccDetails, expiry: value.substring(0, 5) });
    setFormError(null);
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    setCcDetails({ ...ccDetails, cvv: value.substring(0, 4) });
    setFormError(null);
  };

  const handleFocus = (field: string) => {
    setFocusedField(field);
    if (field === 'cvv') {
      setIsFlipped(true);
    } else {
      setIsFlipped(false);
    }
  };

  const autofillDemo = () => {
    setCcDetails({
      number: '4242 •••• •••• 4242',
      expiry: '12/29',
      cvv: '123',
      name: 'Kira Sync'
    });
    setFormError(null);
    setIsFlipped(false);
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check validation if credit card is used
    if (paymentMethod === 'card') {
      if (!ccDetails.number || ccDetails.number.length < 12) {
        setFormError('Please enter a valid credit card number');
        return;
      }
      if (!ccDetails.expiry || ccDetails.expiry.length < 5) {
        setFormError('Please enter card expiry date (MM/YY)');
        return;
      }
      if (!ccDetails.cvv || ccDetails.cvv.length < 3) {
        setFormError('Please enter a valid CVV code');
        return;
      }
      if (!ccDetails.name.trim()) {
        setFormError('Please enter the cardholder Full Name');
        return;
      }
    }

    triggerPaymentFulfillment();
  };

  const triggerPaymentFulfillment = () => {
    setIsProcessing(true);
    setFormError(null);
    setIsFlipped(false);

    // Simulate merchant server transaction loop
    setTimeout(() => {
      setIsProcessing(false);
      setIsDone(true);
      
      // Complete after visual congratulations check
      setTimeout(() => {
        onPaymentSuccess();
        onClose();
        setIsDone(false);
      }, 1500);
    }, 2000);
  };

  const activePlan = MEMBERSHIP_PLANS.find(p => p.id === selectedPlan) || MEMBERSHIP_PLANS[1];

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end bg-black/80 backdrop-blur-md overflow-hidden font-sans rounded-[48px]">
      
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 150 }}
        className="w-full h-[90%] bg-[#121212] rounded-t-[32px] border-t border-white/10 flex flex-col overflow-y-auto px-5 pb-8 relative text-white"
        id="payment-drawer"
      >
        {/* Drawer Drag handle */}
        <div className="w-full flex justify-center py-3 shrink-0">
          <div className="w-12 h-1.5 bg-[#333333] rounded-full" />
        </div>

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-[#1C1C1E] border border-white/5 hover:bg-neutral-800 rounded-full transition-colors cursor-pointer"
          id="btn-close-paywall"
        >
          <X size={18} className="text-neutral-400" />
        </button>

        {/* Header containing Lock Symbol & math notice */}
        <div className="text-center pt-8 pb-3">
          <div className="mx-auto w-12 h-12 bg-[#FF9F0A]/10 border border-[#FF9F0A]/20 rounded-full flex items-center justify-center mb-3">
            <Lock className="text-[#FF9F0A] animate-pulse" size={24} />
          </div>
          <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-amber-100 via-[#FF9F0A] to-amber-100 bg-clip-text text-transparent">
            结果被锁定 | Unlock Formula Value
          </h2>
          <p className="text-xs text-neutral-400 mt-1 max-w-[280px] mx-auto">
            You calculated: <code className="text-[#FF9F0A] bg-black/40 px-1.5 py-0.5 rounded font-mono text-[11px] font-semibold">{pendingCalculation}</code>
          </p>
          <p className="text-[11px] text-white/50 mt-0.5">
            Subscribe to Premium to compute and show results instantly
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!isProcessing && !isDone && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col"
              key="payment-main-form"
            >
              {/* Membership Plans Carousel / Switcher */}
              <div className="space-y-2 mb-4">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">
                  Select Unlock Option
                </span>
                <div className="space-y-1.5">
                  {MEMBERSHIP_PLANS.map((plan) => {
                    const isSel = selectedPlan === plan.id;
                    return (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => setSelectedPlan(plan.id)}
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-left flex items-center justify-between transition-all duration-200 cursor-pointer ${
                          isSel 
                            ? 'bg-[#FF9F0A]/10 border-[#FF9F0A] ring-1 ring-[#FF9F0A]' 
                            : 'bg-[#1C1C1E] border-white/5 text-white/60 hover:border-white/10'
                        }`}
                        id={`plan-${plan.id}`}
                      >
                        <div className="flex items-center gap-3">
                          {/* Circle indicator */}
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                            isSel ? 'border-[#FF9F0A]' : 'border-white/20'
                          }`}>
                            {isSel && <div className="w-2 h-2 rounded-full bg-[#FF9F0A]" />}
                          </div>
                          
                          <div>
                            <div className={`text-xs font-bold transition-colors ${isSel ? 'text-white' : 'text-white/85'}`}>
                              {plan.name}
                            </div>
                            <div className="text-[10px] text-white/45 leading-tight mt-0.5 max-w-[170px] truncate">
                              {plan.description}
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex flex-col justify-center">
                          <span className={`text-sm font-extrabold ${isSel ? 'text-[#FF9F0A]' : 'text-white/85'}`}>
                            {plan.price}
                          </span>
                          <span className="text-[8px] text-white/30 font-mono scale-95 origin-right mt-0.5">
                            {plan.period === 'one-time' ? 'lifetime' : plan.period === 'session' ? 'once' : 'monthly'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Benefits checklist */}
              <div className="bg-black/40 border border-white/5 rounded-xl p-3 mb-4 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 text-[#FF9F0A] font-semibold mb-1 text-[11px] uppercase tracking-wider">
                  <Calculator size={12} />
                  <span>Pro Member Privileges ({activePlan.name})</span>
                </div>
                {activePlan.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-[11px] text-white/70">
                    <Check size={12} className="text-[#FF9F0A] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              {/* Payment Selector Tabs */}
              <div className="flex bg-black border border-white/10 rounded-lg p-1 space-x-1 mb-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`flex-1 py-1.5 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === 'card' 
                      ? 'bg-[#1C1C1E] text-white shadow-sm border border-white/5' 
                      : 'text-white/40 hover:text-white/70'
                  }`}
                  id="tab-card-payment"
                >
                  <CreditCard size={13} />
                  <span>Credit Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('apple_pay')}
                  className={`flex-1 py-1.5 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === 'apple_pay' 
                      ? 'bg-[#1C1C1E] text-white shadow-sm border border-white/5' 
                      : 'text-white/40 hover:text-white/70'
                  }`}
                  id="tab-apple-pay"
                >
                  <Smartphone size={13} />
                  <span> Pay</span>
                </button>
              </div>

              {paymentMethod === 'card' ? (
                /* CREDIT CARD OPTION */
                <form onSubmit={handleSubmitPayment} className="space-y-4">
                  
                  {/* Dynamic Interactive Card Display */}
                  <div className="w-full flex justify-center [perspective:1000px]">
                    <div 
                      className={`relative w-64 h-36 rounded-xl transition-all duration-700 [transform-style:preserve-3d] select-none ${
                        isFlipped ? '[transform:rotateY(180deg)]' : ''
                      }`}
                    >
                      {/* CARD FRONT CONTAINER */}
                      <div className="absolute inset-0 w-full h-full rounded-xl bg-gradient-to-br from-gray-800 to-black p-4 flex flex-col justify-between border border-white/20 [backface-visibility:hidden] shadow-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-[8px] tracking-wider text-[#FF9F0A] font-bold uppercase">
                              VALUED MEMBER CARD
                            </div>
                            <div className="text-[10px] text-white/50">
                              Platinum Membership
                            </div>
                          </div>
                          {/* Emulated Chip */}
                          <div className="w-8 h-6 bg-amber-400/80 rounded-sm opacity-80 shadow shadow-amber-400/25" />
                        </div>

                        {/* Card Number display */}
                        <div className="font-mono text-base tracking-widest text-white/90 py-1 select-all hover:bg-white/5 px-1 rounded transition-colors text-center">
                          {ccDetails.number || '•••• •••• •••• 4290'}
                        </div>

                        <div className="flex justify-between items-end">
                          <div>
                            <div className="text-[7px] text-white/40 uppercase">Cardholder</div>
                            <div className="text-xs font-semibold tracking-wide text-white/80 truncate max-w-[130px] h-4">
                              {ccDetails.name || 'KIRA SYNC'}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-[7px] text-white/40 uppercase">Expires</div>
                            <div className="text-xs font-semibold font-mono text-white/80">
                              {ccDetails.expiry || '12/28'}
                            </div>
                          </div>
                          {/* VISA / Mastercard graphic indicator */}
                          <div className="text-[11px] font-bold italic text-white/80">
                            {ccDetails.number.startsWith('4') ? 'VISA' : 'MASTER'}
                          </div>
                        </div>
                      </div>

                      {/* CARD BACK CONTAINER */}
                      <div className="absolute inset-0 w-full h-full rounded-xl bg-gradient-to-tr from-neutral-900 to-black border border-white/10 [backface-visibility:hidden] [transform:rotateY(180deg)] p-4 flex flex-col justify-between shadow-lg">
                        {/* Magnetic Strip */}
                        <div className="absolute top-5 left-0 right-0 h-8 bg-neutral-950" />
                        <div className="h-6" /> {/* Spacer */}
                        
                        {/* CVV Stripe area */}
                        <div className="flex items-center justify-between gap-3 mt-1">
                          <div className="flex-1 h-7 bg-neutral-200/90 rounded px-2 flex items-center justify-end">
                            <span className="font-mono text-neutral-900 text-xs tracking-wider line-through decoration-neutral-400">
                              xxx xxx
                            </span>
                          </div>
                          <div className="bg-[#FF9F0A] text-black px-2 py-0.5 rounded text-xs font-mono font-bold">
                            {ccDetails.cvv || '***'}
                          </div>
                        </div>

                        <div className="text-[8px] text-white/40 leading-tight">
                          This is a secure checkout module associated with payment verification. Not a real banking link outside test mode.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Saved Card Quick Fill Block */}
                  <div className="flex justify-between items-center bg-black border border-[#FF9F0A]/20 rounded-lg p-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#FF9F0A] animate-pulse" />
                      <span className="text-[10px] text-white/40">Saved card available (ends in 4242)</span>
                    </div>
                    <button
                      type="button"
                      onClick={autofillDemo}
                      className="text-[10px] font-bold text-[#FF9F0A] bg-[#FF9F0A]/10 hover:bg-[#FF9F0A]/20 active:bg-[#FF9F0A]/30 px-2 py-1 rounded transition-colors cursor-pointer border border-[#FF9F0A]/20"
                      id="btn-use-saved-card"
                    >
                      Use Saved Card
                    </button>
                  </div>

                  {/* Form inputs */}
                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        name="cardholder-name"
                        value={ccDetails.name}
                        onChange={(e) => {
                          setCcDetails({ ...ccDetails, name: e.target.value });
                          setFormError(null);
                        }}
                        onFocus={() => handleFocus('name')}
                        placeholder="Kira Sync"
                        className="w-full bg-[#1C1C1E] border border-white/5 rounded-lg p-2 text-white focus:border-[#FF9F0A] focus:outline-none placeholder-white/20 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">
                        Card Number
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="card-number"
                          value={ccDetails.number}
                          onChange={handleCardNumberChange}
                          onFocus={() => handleFocus('number')}
                          placeholder="4242 4242 4242 4242"
                          maxLength={19}
                          className="w-full bg-[#1C1C1E] border border-white/5 rounded-lg p-2 pr-8 text-white focus:border-[#FF9F0A] focus:outline-none placeholder-white/20 transition-colors font-mono tracking-wider"
                        />
                        <CreditCard size={14} className="absolute right-2.5 top-3 text-white/30" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">
                          Expiry Date (MM/YY)
                        </label>
                        <input
                          type="text"
                          name="card-expiry"
                          value={ccDetails.expiry}
                          onChange={handleExpiryChange}
                          onFocus={() => handleFocus('expiry')}
                          placeholder="12/28"
                          maxLength={5}
                          className="w-full bg-[#1C1C1E] border border-white/5 rounded-lg p-2 text-white focus:border-[#FF9F0A] focus:outline-none placeholder-white/20 transition-colors font-mono text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">
                          CVV Code
                        </label>
                        <input
                          type="password"
                          name="card-cvv"
                          value={ccDetails.cvv}
                          onChange={handleCvvChange}
                          onFocus={() => handleFocus('cvv')}
                          placeholder="***"
                          maxLength={4}
                          className="w-full bg-[#1C1C1E] border border-white/5 rounded-lg p-2 text-white focus:border-[#FF9F0A] focus:outline-none placeholder-white/20 transition-colors font-mono text-center"
                        />
                      </div>
                    </div>
                  </div>

                  {formError && (
                    <div className="text-[11px] text-red-400 bg-red-400/10 border border-red-500/20 p-2 rounded-lg text-center font-medium">
                      {formError}
                    </div>
                  )}

                  <div className="text-[10px] text-white/30 flex justify-center items-center gap-1.5 py-1 text-center">
                    <ShieldCheck size={12} className="text-emerald-500 shrink-0" />
                    <span>Secure payment gateway. 256-bit SSL encrypted.</span>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full bg-[#FF9F0A] hover:bg-[#ffb03a] active:scale-[0.98] py-3.5 px-4 rounded-xl font-bold text-black flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#FF9F0A]/10 transition-all text-sm uppercase tracking-wider"
                    id="btn-submit-card"
                  >
                    <span>Pay and Show Result</span>
                    <ArrowRight size={14} />
                  </button>
                </form>
              ) : (
                /* APPLE PAY OPTION */
                <div className="flex-1 flex flex-col justify-center py-6 space-y-6">
                  <div className="text-center space-y-2">
                    <div className="mx-auto w-14 h-14 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                      <Smartphone size={28} className="text-white animate-bounce" />
                    </div>
                    <h3 className="text-sm font-bold text-neutral-200">Apple Pay Express Sandbox</h3>
                    <p className="text-[11px] text-neutral-400 max-w-[240px] mx-auto text-center">
                      Quick authorize using pre-linked iCloud payment card on your simulated secure enclave.
                    </p>
                  </div>

                  {/* Big Mock Apple Pay Button */}
                  <button
                    type="button"
                    onClick={triggerPaymentFulfillment}
                    className="w-full bg-white hover:bg-neutral-100 active:scale-[0.98] py-3.5 rounded-xl font-bold text-black flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all text-sm"
                    id="btn-apple-pay-simulate"
                  >
                    <span className="text-base font-semibold"> Pay with TouchID</span>
                  </button>

                  <div className="text-[9px] text-neutral-500 text-center max-w-[200px] mx-auto">
                    Simulates native Apple Pay sheet overlay calling device credentials.
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Processing Screen State UI */}
          {isProcessing && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center py-16 space-y-4"
              key="payment-processing"
            >
              {/* Spinner */}
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-neutral-800" />
                <div className="absolute inset-0 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
                <Lock className="absolute inset-0 m-auto text-amber-500 animate-pulse" size={18} />
              </div>
              <div className="text-center space-y-1">
                <h4 className="font-semibold text-sm text-neutral-100 uppercase tracking-widest animate-pulse">
                  Verifying Transaction
                </h4>
                <p className="text-[11px] text-neutral-400">
                  Requesting bank ledger authorization...
                </p>
                <p className="text-[9px] text-neutral-500 font-mono">
                  TxID: CALC_{Math.floor(Math.random() * 89999 + 10000)}
                </p>
              </div>
            </motion.div>
          )}

          {/* Success Approving State UI */}
          {isDone && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center py-16 text-center space-y-4"
              key="payment-success"
            >
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1.2 }}
                  transition={{ type: 'spring', duration: 0.5 }}
                >
                  <CheckCircle2 className="text-emerald-500" size={36} />
                </motion.div>
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-base text-emerald-400 uppercase tracking-wider">
                  Payment Successful!
                </h4>
                <p className="text-xs text-neutral-200">
                  Transaction Authenticated • Plan Activated
                </p>
                <p className="text-[11px] text-amber-400/90 font-mono mt-2 bg-neutral-950 px-2 py-1 rounded inline-block max-w-full">
                  Formula Unlocked: {pendingCalculation}
                </p>
              </div>

              {/* Secure notification sound / success note */}
              <div className="text-[10px] text-neutral-500">
                You are now a premium member. Unlocking results...
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Safe sandbox footer */}
        <div className="mt-auto pt-6 text-center text-[10px] text-neutral-600 border-t border-neutral-900">
          This is an interactive simulation of an iOS-style subscription model. No real money or credit transactions are captured.
        </div>
      </motion.div>
    </div>
  );
}
