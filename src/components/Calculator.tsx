import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  History, 
  Volume2, 
  VolumeX, 
  Trash2, 
  Unlock, 
  Lock, 
  RotateCcw, 
  Settings, 
  Info,
  CheckCircle2,
  Calculator as CalculatorIcon
} from 'lucide-react';
import { Operator, CalculationState } from '../types';
import PaymentModal from './PaymentModal';

// Audio click simulation via standard Web Audio API syntactical notes
const playAudioClick = (type: 'button' | 'operator' | 'premium_unlocked') => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    if (type === 'button') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, audioCtx.currentTime); // Quick subtle pop
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.09);
    } else if (type === 'operator') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(450, audioCtx.currentTime); // Deeper toggle
      gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } else if (type === 'premium_unlocked') {
      // Golden chime sweep!
      const now = audioCtx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.4); // C6
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.start();
      osc.stop(now + 0.6);
    }
  } catch (e) {
    console.warn('Audio click not supported or blocked by user guest settings node:', e);
  }
};

export default function Calculator() {
  // Is premium user? Initialize from LocalStorage or simulate
  const [isPremium, setIsPremium] = useState<boolean>(() => {
    try {
      return localStorage.getItem('calc_is_premium') === 'true';
    } catch {
      return false;
    }
  });

  const [state, setState] = useState<CalculationState>({
    currentValue: '0',
    previousValue: null,
    operator: null,
    isFinished: false,
    expression: ''
  });

  const [activeOperator, setActiveOperator] = useState<Operator>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [glowingEffect, setGlowingEffect] = useState(false);

  // Auto-save premium state in localStorage
  useEffect(() => {
    try {
      localStorage.setItem('calc_is_premium', String(isPremium));
    } catch (e) {
      console.warn(e);
    }
  }, [isPremium]);

  // Handle calculator buttons
  const inputDigit = (digit: string) => {
    if (soundEnabled) playAudioClick('button');

    setState(prev => {
      // Reset if previous calculation just completed
      let nextValue = prev.currentValue;
      let nextIsFinished = prev.isFinished;

      if (prev.isFinished || nextValue === 'Error') {
        nextValue = '0';
        nextIsFinished = false;
      }

      // If operator was just clicked, clear display for second operand
      if (prev.operator && prev.currentValue === prev.previousValue) {
        nextValue = '0';
      }

      const updated = nextValue === '0' ? digit : nextValue + digit;
      
      // Keep operators active state highlighted properly
      return {
        ...prev,
        currentValue: updated.substring(0, 9), // Max 9 digits like iOS
        isFinished: nextIsFinished,
        expression: prev.operator 
          ? `${prev.previousValue} ${prev.operator} ${updated.substring(0, 9)}`
          : updated.substring(0, 9)
      };
    });

    // Reset operator active color highlighting if key inputted
    setActiveOperator(null);
  };

  const inputDecimal = () => {
    if (soundEnabled) playAudioClick('button');
    
    setState(prev => {
      if (prev.isFinished) {
        return {
          currentValue: '0.',
          previousValue: null,
          operator: null,
          isFinished: false,
          expression: '0.'
        };
      }
      if (prev.currentValue.includes('.')) {
        return prev;
      }
      return {
        ...prev,
        currentValue: prev.currentValue + '.',
        expression: prev.expression + '.'
      };
    });
  };

  const clearAll = () => {
    if (soundEnabled) playAudioClick('button');
    setState({
      currentValue: '0',
      previousValue: null,
      operator: null,
      isFinished: false,
      expression: ''
    });
    setActiveOperator(null);
  };

  const toggleSign = () => {
    if (soundEnabled) playAudioClick('button');
    setState(prev => {
      const toggled = (parseFloat(prev.currentValue) * -1).toString();
      return {
        ...prev,
        currentValue: toggled,
        expression: prev.operator 
          ? `${prev.previousValue} ${prev.operator} (${toggled})`
          : toggled
      };
    });
  };

  const applyPercent = () => {
    if (soundEnabled) playAudioClick('button');
    setState(prev => {
      const percentageValue = (parseFloat(prev.currentValue) / 100).toString();
      return {
        ...prev,
        currentValue: percentageValue,
        expression: prev.operator 
          ? `${prev.previousValue} ${prev.operator} ${percentageValue}`
          : percentageValue
      };
    });
  };

  const handleOperator = (nextOperator: Operator) => {
    if (soundEnabled) playAudioClick('operator');
    setActiveOperator(nextOperator);

    setState(prev => {
      const { currentValue, previousValue, operator } = prev;
      
      if (previousValue === null) {
        return {
          currentValue: currentValue,
          previousValue: currentValue,
          operator: nextOperator,
          isFinished: false,
          expression: `${currentValue} ${nextOperator}`
        };
      } else if (operator) {
        // If an operator is already active, compute the temporary outcome first
        const partialResult = calculateMathResult(previousValue, currentValue, operator);
        return {
          currentValue: partialResult,
          previousValue: partialResult,
          operator: nextOperator,
          isFinished: false,
          expression: `${partialResult} ${nextOperator}`
        };
      }
      
      return {
        ...prev,
        operator: nextOperator,
        previousValue: currentValue,
        expression: `${currentValue} ${nextOperator}`
      };
    });
  };

  const calculateMathResult = (valueA: string, valueB: string, op: Operator): string => {
    const a = parseFloat(valueA);
    const b = parseFloat(valueB);
    if (isNaN(a) || isNaN(b)) return '0';
    
    let res = 0;
    switch (op) {
      case '+': res = a + b; break;
      case '-': res = a - b; break;
      case '×': res = a * b; break;
      case '÷': 
        if (b === 0) return 'Error';
        res = a / b; 
        break;
      default: return valueB;
    }
    
    const stringRes = res.toString();
    if (stringRes.includes('.') && stringRes.split('.')[1].length > 6) {
      return parseFloat(res.toFixed(6)).toString(); // format floats nicely
    }
    return stringRes;
  };

  const evaluate = () => {
    if (soundEnabled) playAudioClick('operator');

    const { currentValue, previousValue, operator, expression } = state;
    if (!operator || previousValue === null) return;

    const mathExpression = `${previousValue} ${operator} ${currentValue}`;

    // INTERCEPT IF USER IS NOT PREMIUM
    if (!isPremium) {
      setIsPaymentOpen(true);
      return;
    }

    // Is Premium: Execute & Unlock standard result
    executeCalculation(mathExpression, previousValue, currentValue, operator);
  };

  const executeCalculation = (
    mathExpression: string, 
    valA: string, 
    valB: string, 
    op: Operator,
    highlightGlow = true
  ) => {
    const result = calculateMathResult(valA, valB, op);
    
    setState({
      currentValue: result,
      previousValue: null,
      operator: null,
      isFinished: true,
      expression: `${mathExpression} =`
    });
    setActiveOperator(null);

    // Save success calculation records
    setHistory(prev => [`${mathExpression} = ${result}`, ...prev].slice(0, 20));

    if (highlightGlow) {
      setGlowingEffect(true);
      setTimeout(() => setGlowingEffect(false), 1200);
    }
  };

  const handlePaymentFulfillment = () => {
    setIsPremium(true);
    if (soundEnabled) playAudioClick('premium_unlocked');

    // Instantly calculate the locked sequence
    const { currentValue, previousValue, operator } = state;
    if (operator && previousValue !== null) {
      const mathExpression = `${previousValue} ${operator} ${currentValue}`;
      executeCalculation(mathExpression, previousValue, currentValue, operator, true);
    }
  };

  // Backspace click deletion simulation
  const handleBackspace = () => {
    if (soundEnabled) playAudioClick('button');
    
    setState(prev => {
      if (prev.isFinished || prev.currentValue === '0') return prev;
      
      const nextValue = prev.currentValue.length > 1 
        ? prev.currentValue.slice(0, -1) 
        : '0';
        
      return {
        ...prev,
        currentValue: nextValue,
        expression: prev.operator 
          ? `${prev.previousValue} ${prev.operator} ${nextValue}`
          : nextValue
      };
    });
  };

  return (
    <div className="flex-1 flex flex-col justify-between h-full bg-[#1C1C1E] border border-white/5 relative select-none rounded-[48px] overflow-hidden p-6 pt-12">
      
      {/* Top App bar */}
      <div className="flex justify-between items-center text-xs text-neutral-400 z-10 px-2">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-1.5 p-1.5 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
          id="btn-settings-trigger"
        >
          <Settings size={15} />
          <span className="sr-only">Sandbox Configuration</span>
        </button>

        {/* Dynamic Glowing Premium Crown Badge */}
        <button 
          onClick={() => {
            if (soundEnabled) playAudioClick('button');
            setIsPaymentOpen(true);
          }}
          className={`px-3 py-1 rounded-full flex items-center gap-1.5 font-bold tracking-tight text-[11px] transition-all cursor-pointer ${
            isPremium 
              ? 'bg-amber-400 text-black border border-amber-300 shadow-md shadow-amber-400/20' 
              : 'bg-neutral-800/80 text-white/90 hover:bg-neutral-700/80 border border-neutral-700'
          }`}
          id="btn-membership-badge"
        >
          <CalculatorIcon size={11} className={isPremium ? 'text-black' : 'text-[#FF9F0A]'} />
          <span>{isPremium ? 'PREMIUM ACCESS' : 'UPGRADE PRO'}</span>
        </button>

        {/* History slider open action */}
        <button
          onClick={() => {
            if (soundEnabled) playAudioClick('button');
            setShowHistory(!showHistory);
          }}
          className={`p-1.5 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
            showHistory ? 'text-amber-400 bg-neutral-800' : ''
          }`}
          id="btn-history-trigger"
        >
          <History size={15} />
          <span className="text-[10px] hidden xs:inline">Log</span>
        </button>
      </div>

      {/* Main math viewport area */}
      <div className="flex-1 flex flex-col justify-end text-right pr-2 pl-2 py-4 relative">
        <AnimatePresence>
          {showHistory && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="absolute top-2 left-2 right-2 max-h-[160px] bg-neutral-900/90 backdrop-blur border border-neutral-800/80 rounded-2xl p-3 overflow-y-auto text-left z-20 shadow-xl"
              id="history-drawer-block"
            >
              <div className="flex justify-between items-center text-[10px] uppercase font-bold text-neutral-500 mb-1.5">
                <span>Formula Log History</span>
                {isPremium ? (
                  <button 
                    onClick={() => setHistory([])}
                    className="hover:text-red-400 flex items-center gap-1 text-[9px] cursor-pointer"
                  >
                    <Trash2 size={10} /> Clear
                  </button>
                ) : (
                  <span className="text-amber-500 flex items-center gap-0.5"><Lock size={8}/> PREMIUM ONLY</span>
                )}
              </div>
              
              {!isPremium ? (
                <div className="text-center py-4 text-xs space-y-2">
                  <p className="text-neutral-400">Your historical formula logs are currently protected by encryption.</p>
                  <button 
                    onClick={() => {
                      setIsPaymentOpen(true);
                      setShowHistory(false);
                    }}
                    className="text-[10px] font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full transition-colors cursor-pointer"
                  >
                    Unlock History Instantly
                  </button>
                </div>
              ) : history.length === 0 ? (
                <p className="text-center py-6 text-xs text-neutral-600">No recent calculations. Perform active maths!</p>
              ) : (
                <div className="space-y-1 font-mono text-[11px] divide-y divide-neutral-800/40">
                  {history.map((h, i) => (
                    <div key={i} className="py-1 text-neutral-300 flex justify-between gap-1 hover:bg-white/5 px-1 rounded transition-colors">
                      <span className="text-neutral-500 text-[10px]">#{history.length - i}</span>
                      <span className="font-semibold text-right truncate">{h}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Previous Equation Expression Helper */}
        <div className="h-6 overflow-hidden">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={state.expression}
              initial={{ y: 5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -5, opacity: 0 }}
              className="text-amber-500/70 font-mono text-sm tracking-wide break-all"
            >
              {state.expression || '\u00A0'}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Primary Digital Display output digits */}
        <div className="relative">
          <div 
            onClick={handleBackspace}
            title="Click or swipe display backspace deleting digit"
            className={`font-sans tracking-tight text-white select-all cursor-pointer transition-all duration-300 select-none pb-2 break-all justify-end flex items-center ${
              glowingEffect ? 'text-amber-400 scale-102 drop-shadow-[0_0_15px_rgba(255,159,10,0.4)]' : ''
            } ${
              state.currentValue.length > 7 ? 'text-4xl' : state.currentValue.length > 5 ? 'text-5xl' : 'text-7xl font-light'
            }`}
            style={{ minHeight: '90px' }}
            id="display-value"
          >
            {state.currentValue}
          </div>
          
          <div className="absolute right-0 bottom-0 text-[9px] text-neutral-600 font-medium select-none pointer-events-none flex items-center gap-1 uppercase">
            <span>iOS Simulator</span>
            <span>•</span>
            <span className="cursor-pointer pointer-events-auto hover:text-neutral-400" onClick={handleBackspace}>
              [Back]
            </span>
          </div>
        </div>
      </div>

      {/* Button Keyboard Grid (The core iOS interactive surface) */}
      <div className="grid grid-cols-4 gap-3.5 mb-1 z-10" id="calculator-keyboard">
        
        {/* ROW 1: top rows (AC/C, +/- , %, ÷) */}
        <button
          onClick={clearAll}
          className="aspect-square rounded-full flex items-center justify-center text-[22px] font-medium bg-[#a5a5a5] hover:bg-[#d4d4d4] active:bg-[#e0e0e0] text-black transition-colors cursor-pointer"
          id="btn-clear"
        >
          {state.currentValue !== '0' ? 'C' : 'AC'}
        </button>
        <button
          onClick={toggleSign}
          className="aspect-square rounded-full flex items-center justify-center text-[22px] font-medium bg-[#a5a5a5] hover:bg-[#d4d4d4] active:bg-[#e0e0e0] text-black transition-colors cursor-pointer"
          id="btn-negate"
        >
          +/-
        </button>
        <button
          onClick={applyPercent}
          className="aspect-square rounded-full flex items-center justify-center text-[22px] font-medium bg-[#a5a5a5] hover:bg-[#d4d4d4] active:bg-[#e0e0e0] text-black transition-colors cursor-pointer"
          id="btn-percent"
        >
          %
        </button>
        <button
          onClick={() => handleOperator('÷')}
          className={`aspect-square rounded-full flex items-center justify-center text-[28px] font-bold transition-all duration-200 cursor-pointer ${
            activeOperator === '÷'
              ? 'bg-white text-[#ff9f0a]'
              : 'bg-[#ff9f0a] hover:bg-[#f3bc67] active:bg-white active:text-[#ff9f0a] text-white'
          }`}
          id="btn-divide"
        >
          ÷
        </button>

        {/* ROW 2: (7, 8, 9, ×) */}
        <button
          onClick={() => inputDigit('7')}
          className="aspect-square rounded-full flex items-center justify-center text-[26px] font-normal bg-[#333333] hover:bg-[#555555] active:bg-[#6c6c6c] text-white transition-colors cursor-pointer font-sans"
          id="btn-digit-7"
        >
          7
        </button>
        <button
          onClick={() => inputDigit('8')}
          className="aspect-square rounded-full flex items-center justify-center text-[26px] font-normal bg-[#333333] hover:bg-[#555555] active:bg-[#6c6c6c] text-white transition-colors cursor-pointer font-sans"
          id="btn-digit-8"
        >
          8
        </button>
        <button
          onClick={() => inputDigit('9')}
          className="aspect-square rounded-full flex items-center justify-center text-[26px] font-normal bg-[#333333] hover:bg-[#555555] active:bg-[#6c6c6c] text-white transition-colors cursor-pointer font-sans"
          id="btn-digit-9"
        >
          9
        </button>
        <button
          onClick={() => handleOperator('×')}
          className={`aspect-square rounded-full flex items-center justify-center text-[26px] font-bold transition-all duration-200 cursor-pointer ${
            activeOperator === '×'
              ? 'bg-white text-[#ff9f0a]'
              : 'bg-[#ff9f0a] hover:bg-[#f3bc67] active:bg-white active:text-[#ff9f0a] text-white'
          }`}
          id="btn-multiply"
        >
          ×
        </button>

        {/* ROW 3: (4, 5, 6, -) */}
        <button
          onClick={() => inputDigit('4')}
          className="aspect-square rounded-full flex items-center justify-center text-[26px] font-normal bg-[#333333] hover:bg-[#555555] active:bg-[#6c6c6c] text-white transition-colors cursor-pointer font-sans"
          id="btn-digit-4"
        >
          4
        </button>
        <button
          onClick={() => inputDigit('5')}
          className="aspect-square rounded-full flex items-center justify-center text-[26px] font-normal bg-[#333333] hover:bg-[#555555] active:bg-[#6c6c6c] text-white transition-colors cursor-pointer font-sans"
          id="btn-digit-5"
        >
          5
        </button>
        <button
          onClick={() => inputDigit('6')}
          className="aspect-square rounded-full flex items-center justify-center text-[26px] font-normal bg-[#333333] hover:bg-[#555555] active:bg-[#6c6c6c] text-white transition-colors cursor-pointer font-sans"
          id="btn-digit-6"
        >
          6
        </button>
        <button
          onClick={() => handleOperator('-')}
          className={`aspect-square rounded-full flex items-center justify-center text-[30px] font-bold transition-all duration-200 cursor-pointer ${
            activeOperator === '-'
              ? 'bg-white text-[#ff9f0a]'
              : 'bg-[#ff9f0a] hover:bg-[#f3bc67] active:bg-white active:text-[#ff9f0a] text-white'
          }`}
          id="btn-subtract"
        >
          -
        </button>

        {/* ROW 4: (1, 2, 3, +) */}
        <button
          onClick={() => inputDigit('1')}
          className="aspect-square rounded-full flex items-center justify-center text-[26px] font-normal bg-[#333333] hover:bg-[#555555] active:bg-[#6c6c6c] text-white transition-colors cursor-pointer font-sans"
          id="btn-digit-1"
        >
          1
        </button>
        <button
          onClick={() => inputDigit('2')}
          className="aspect-square rounded-full flex items-center justify-center text-[26px] font-normal bg-[#333333] hover:bg-[#555555] active:bg-[#6c6c6c] text-white transition-colors cursor-pointer font-sans"
          id="btn-digit-2"
        >
          2
        </button>
        <button
          onClick={() => inputDigit('3')}
          className="aspect-square rounded-full flex items-center justify-center text-[26px] font-normal bg-[#333333] hover:bg-[#555555] active:bg-[#6c6c6c] text-white transition-colors cursor-pointer font-sans"
          id="btn-digit-3"
        >
          3
        </button>
        <button
          onClick={() => handleOperator('+')}
          className={`aspect-square rounded-full flex items-center justify-center text-[28px] font-bold transition-all duration-200 cursor-pointer ${
            activeOperator === '+'
              ? 'bg-white text-[#ff9f0a]'
              : 'bg-[#ff9f0a] hover:bg-[#f3bc67] active:bg-white active:text-[#ff9f0a] text-white'
          }`}
          id="btn-add"
        >
          +
        </button>

        {/* ROW 5: (0, . , =) */}
        {/* iOS 0 takes up double width, styled as rounded pill, alignment left-padded */}
        <button
          onClick={() => inputDigit('0')}
          className="col-span-2 h-14 rounded-full flex items-center px-6 text-[26px] font-normal bg-[#333333] hover:bg-[#555555] active:bg-[#6c6c6c] text-white transition-colors cursor-pointer text-left"
          id="btn-digit-0"
        >
          0
        </button>
        <button
          onClick={inputDecimal}
          className="aspect-square rounded-full flex items-center justify-center text-[26px] font-normal bg-[#333333] hover:bg-[#555555] active:bg-[#6c6c6c] text-white transition-colors cursor-pointer"
          id="btn-decimal"
        >
          .
        </button>
        <button
          onClick={evaluate}
          className={`aspect-square rounded-full flex items-center justify-center text-[28px] font-bold transition-all duration-200 cursor-pointer ${
            isPremium
              ? 'bg-[#ff5100]/25 text-[#ff9f0a] hover:bg-[#ff9f0a]/30 ring-2 ring-[#ff9f0a]'
              : 'bg-[#ff9f0a] hover:bg-[#f3bc67] active:bg-white text-white active:text-[#ff9f0a]'
          }`}
          id="btn-equals"
        >
          {isPremium ? '=' : <Lock size={15} className="animate-pulse" />}
        </button>
      </div>

      {/* Sandbox Config overlay settings panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-x-6 top-12 bottom-6 bg-neutral-900 border border-neutral-800 rounded-[32px] p-5 flex flex-col justify-between z-30 shadow-2xl"
            id="settings-panel-overlay"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-neutral-800">
                <div className="flex items-center gap-1.5 font-bold text-amber-500">
                  <Settings size={16} />
                  <span>Interactive Playground Config</span>
                </div>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-xs bg-neutral-800 px-2.5 py-1 rounded-full text-neutral-400 hover:text-white cursor-pointer"
                >
                  Done
                </button>
              </div>

              {/* Setting details */}
              <div className="space-y-3.5 text-xs">
                {/* Simulated subscription state */}
                <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800/80 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-neutral-300">Simulate Premium Level</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      isPremium ? 'bg-amber-500/20 text-amber-400' : 'bg-neutral-800 text-neutral-500'
                    }`}>
                      {isPremium ? 'ENABLED' : 'LOCKED'}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500">
                    If locked, pressing calculations <code className="text-amber-400 font-mono">=</code > triggers the Membership checkout drawer. Turn off premium below to re-experience the lock gating!
                  </p>
                  
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsPremium(true);
                        if (soundEnabled) playAudioClick('premium_unlocked');
                      }}
                      className={`flex-1 py-1.5 rounded-lg text-center font-bold text-[10px] uppercase transition-colors cursor-pointer ${
                        isPremium 
                          ? 'bg-amber-500 text-black' 
                          : 'bg-neutral-800 hover:bg-neutral-700 text-white'
                      }`}
                      id="sim-enable-premium"
                    >
                      Enable Premium
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsPremium(false);
                      }}
                      className={`flex-1 py-1.5 rounded-lg text-center font-bold text-[10px] uppercase transition-colors cursor-pointer ${
                        !isPremium 
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                          : 'bg-neutral-800 hover:bg-neutral-700 text-white'
                      }`}
                      id="sim-disable-premium"
                    >
                      Revoke / Reset
                    </button>
                  </div>
                </div>

                {/* Simulated haptic audios switch */}
                <div className="flex justify-between items-center py-1">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-neutral-300">App Sound Responses</span>
                    <p className="text-[10px] text-neutral-500">Simulates real tactile click haptics</p>
                  </div>
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`p-2 rounded-full cursor-pointer transition-colors ${
                      soundEnabled ? 'bg-amber-400 text-black shadow-md' : 'bg-neutral-800 text-neutral-500'
                    }`}
                    id="btn-toggle-sound"
                  >
                    {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
                  </button>
                </div>

                {/* Simulated usage warning */}
                <div className="bg-neutral-950/50 p-2.5 rounded-xl border border-neutral-900 flex items-start gap-2 text-[10px] text-neutral-400">
                  <Info size={14} className="text-amber-500 shrink-0 mt-0.5" />
                  <p>
                    This is built to illustrate a smart, highly aesthetic paywall inside a beautiful product. No real credentials or finances are checked. Use the "Autofill" button inside the payment form to proceed efficiently!
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-800 flex justify-between items-center text-[10px] text-neutral-500">
              <span>Core Calculation Engine</span>
              <span>v1.0.0 alphabuild</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Drawer Modal Component */}
      <AnimatePresence>
        {isPaymentOpen && (
          <PaymentModal
            isOpen={isPaymentOpen}
            onClose={() => setIsPaymentOpen(false)}
            onPaymentSuccess={handlePaymentFulfillment}
            pendingCalculation={
              state.operator 
                ? `${state.previousValue} ${state.operator} ${state.currentValue}`
                : state.currentValue
            }
          />
        )}
      </AnimatePresence>
    </div>
  );
}
