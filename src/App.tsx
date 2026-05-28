import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Sparkles, Check, ChevronRight, ChevronLeft, MapPin, Smile, MessageSquare, Download, Copy, RefreshCw, Star, Info } from 'lucide-react';
import { Step, DateOrderState } from './types';
import { ACTIVITIES_OPTIONS, FOOD_OPTIONS, EXTRAS_OPTIONS } from './data';
import { RunawayButton } from './components/RunawayButton';

// Play sound helper using the Web Audio API for an exquisite polished touch.
const playSound = (type: 'pop' | 'sparkle' | 'fail' | 'slide') => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    if (type === 'pop') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1100, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } else if (type === 'sparkle') {
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C E G C E arpeggio
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);
        gain.gain.setValueAtTime(0.08, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.25);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.25);
      });
    } else if (type === 'slide') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(450, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'fail') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(90, ctx.currentTime + 0.22);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.22);
      osc.start();
      osc.stop(ctx.currentTime + 0.22);
    }
  } catch (err) {
    // Safe browser restriction bypass
  }
};

export default function App() {
  const [currentStep, setCurrentStep] = useState<Step>('WELCOME');
  const [orderState, setOrderState] = useState<DateOrderState>({
    activities: [],
    foods: [],
    suggestion: '',
    extras: [],
  });

  const [suggestionError, setSuggestionError] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [showFoodLesson, setShowFoodLesson] = useState(false);
  const [pendingFoodSelection, setPendingFoodSelection] = useState<string | null>(null);
  const [showActivityLesson, setShowActivityLesson] = useState(false);
  const [pendingActivitySelection, setPendingActivitySelection] = useState<string | null>(null);

  // Simple progress steps mapping for indicators
  const stepList: { key: Step; label: string }[] = [
    { key: 'WELCOME', label: 'Convite' },
    { key: 'ACTIVITIES', label: 'Atividades' },
    { key: 'FOOD', label: 'Cardápio' },
    { key: 'SUGGESTION', label: 'Detalhes' },
    { key: 'EXTRAS', label: 'Mimos Extras' },
    { key: 'CHECKOUT', label: 'Passe Especial' },
  ];

  const getStepIndex = (step: Step) => stepList.findIndex((s) => s.key === step);

  // Navigation Logic
  const handleWelcomeYes = () => {
    playSound('sparkle');
    setCurrentStep('ACTIVITIES');
  };

  const handleActivitiesToggle = (id: string) => {
    playSound('pop');
    setOrderState((prev) => {
      const isAlreadySelected = prev.activities.includes(id);
      const otherSelected = prev.activities.filter((actId) => actId !== id);

      if (!isAlreadySelected && otherSelected.length > 0) {
        // Blatantly trying to choose more than one option! Inform her of her adorable mistake!
        playSound('fail');
        setPendingActivitySelection(id);
        setShowActivityLesson(true);
        return prev;
      }

      const activities = isAlreadySelected ? [] : [id];
      
      // Reset details if deselected
      let foods = prev.foods;
      let suggestion = prev.suggestion;
      if (!activities.includes('EAT_OUT')) foods = [];
      if (!activities.includes('NEW_PLACE')) suggestion = '';

      return { ...prev, activities, foods, suggestion };
    });
  };

  const handleActivitiesNext = () => {
    playSound('slide');
    if (orderState.activities.includes('EAT_OUT')) {
      setCurrentStep('FOOD');
    } else if (orderState.activities.includes('NEW_PLACE')) {
      setCurrentStep('SUGGESTION');
    } else {
      setCurrentStep('EXTRAS');
    }
  };

  const handleFoodToggle = (id: string) => {
    playSound('pop');
    if (id === 'NOT_EAT') {
      playSound('fail');
      return;
    }
    setOrderState((prev) => {
      const isAlreadySelected = prev.foods.includes(id);
      const otherSelected = prev.foods.filter((foodId) => foodId !== id);

      if (!isAlreadySelected && otherSelected.length > 0) {
        // Blatantly trying to choose more than one option! Inform her of her adorable mistake!
        playSound('fail');
        setPendingFoodSelection(id);
        setShowFoodLesson(true);
        return prev;
      }

      return {
        ...prev,
        foods: isAlreadySelected ? [] : [id], // Strict single selection!
      };
    });
  };

  const handleFoodNext = () => {
    playSound('slide');
    if (orderState.activities.includes('NEW_PLACE')) {
      setCurrentStep('SUGGESTION');
    } else {
      setCurrentStep('EXTRAS');
    }
  };

  const handleSuggestionChange = (val: string) => {
    setOrderState((prev) => ({ ...prev, suggestion: val }));
    if (val.trim()) setSuggestionError(false);
  };

  const handleSuggestionNext = () => {
    if (!orderState.suggestion.trim()) {
      playSound('fail');
      setSuggestionError(true);
      return;
    }
    playSound('slide');
    setCurrentStep('EXTRAS');
  };

  const handleExtrasToggle = (id: string) => {
    playSound('pop');
    if (id === 'NO_HOLDING') {
      playSound('fail');
      return;
    }
    setOrderState((prev) => {
      const extras = prev.extras.includes(id)
        ? prev.extras.filter((extId) => extId !== id)
        : [...prev.extras, id];
      return { ...prev, extras };
    });
  };

  const handleExtrasNext = () => {
    playSound('sparkle');
    setCurrentStep('CHECKOUT');
  };

  const goBack = () => {
    playSound('slide');
    if (currentStep === 'ACTIVITIES') {
      setCurrentStep('WELCOME');
    } else if (currentStep === 'FOOD') {
      setCurrentStep('ACTIVITIES');
    } else if (currentStep === 'SUGGESTION') {
      if (orderState.activities.includes('EAT_OUT')) {
        setCurrentStep('FOOD');
      } else {
        setCurrentStep('ACTIVITIES');
      }
    } else if (currentStep === 'EXTRAS') {
      if (orderState.activities.includes('NEW_PLACE')) {
        setCurrentStep('SUGGESTION');
      } else if (orderState.activities.includes('EAT_OUT')) {
        setCurrentStep('FOOD');
      } else {
        setCurrentStep('ACTIVITIES');
      }
    } else if (currentStep === 'CHECKOUT') {
      setCurrentStep('EXTRAS');
    }
  };

  const resetAll = () => {
    playSound('slide');
    setOrderState({
      activities: [],
      foods: [],
      suggestion: '',
      extras: [],
    });
    setCopiedText(false);
    setCurrentStep('WELCOME');
  };

  // Helper to wrap text for drawing in standard HTML Canvas
  const wrapText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ) => {
    const words = text.split(' ');
    let line = '';
    let currentY = y;
    
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line.trim(), x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), x, currentY);
    return currentY;
  };

  // Canvas-based beautiful download of the customized date receipt
  const generateAndDownloadTicket = () => {
    playSound('sparkle');
    const canvas = document.createElement('canvas');
    const scale = 2; // For crisp high-res downloads
    const width = 420;
    const height = 620;
    
    canvas.width = width * scale;
    canvas.height = height * scale;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Scale drawings for Retina screen sharpness
    ctx.scale(scale, scale);
    
    // Background style
    ctx.fillStyle = '#fffafc'; 
    ctx.fillRect(0, 0, width, height);
 
    // Warm pink framing lines
    ctx.strokeStyle = '#fbcfe8'; // rose-200
    ctx.lineWidth = 4;
    ctx.strokeRect(8, 8, width - 16, height - 16);
 
    ctx.strokeStyle = '#fca5a5'; // rose-300
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(14, 14, width - 28, height - 28);
    ctx.setLineDash([]); // clear dash
 
    // Header Title
    ctx.textAlign = 'center';
    ctx.font = 'bold 22px "Quicksand", sans-serif';
    ctx.fillStyle = '#ec4899'; // border-pink-500
    ctx.fillText('🎫 PASSE DE ENCONTRO OFICIAL 🎫', width / 2, 50);
 
    ctx.font = '12px "Quicksand", sans-serif';
    ctx.fillStyle = '#f43f5e';
    ctx.fillText('Código #LOVE-PASS-ONLINE', width / 2, 70);
 
    // Grid divider line
    ctx.strokeStyle = '#fca5a5';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(30, 85);
    ctx.lineTo(width - 30, 85);
    ctx.stroke();
 
    // Data lists
    ctx.textAlign = 'left';
    let currentY = 115;
 
    // Date Accepted
    ctx.font = 'bold 13px "Quicksand", sans-serif';
    ctx.fillStyle = '#db2777';
    ctx.fillText('💌 CONVITE ACEITO:', 35, currentY);
    ctx.font = '13px "Quicksand", sans-serif';
    ctx.fillStyle = '#111827';
    ctx.fillText('SIM, 100%! 💖', 185, currentY);
    currentY += 32;
 
    // Activities Selection
    ctx.font = 'bold 13px "Quicksand", sans-serif';
    ctx.fillStyle = '#db2777';
    ctx.fillText('🎒 ATIVIDADES SELECIONADAS:', 35, currentY);
    currentY += 18;
 
    ctx.font = '13px "Quicksand", sans-serif';
    ctx.fillStyle = '#374151';
    
    const activityNames = orderState.activities.length > 0 
      ? orderState.activities
          .map((id) => {
            const o = ACTIVITIES_OPTIONS.find((opt) => opt.id === id);
            return o ? `${o.emoji} ${o.label}` : '';
          })
          .filter(Boolean)
          .join(', ')
      : 'Sem planos específicos, vamos deixar rolar! ✨';
    currentY = wrapText(ctx, activityNames, 35, currentY, width - 70, 18);
    currentY += 32;
 
    // Selected Foods
    if (orderState.activities.includes('EAT_OUT')) {
      ctx.font = 'bold 13px "Quicksand", sans-serif';
      ctx.fillStyle = '#db2777';
      ctx.fillText('🍔 COMIDAS SELECIONADAS:', 35, currentY);
      currentY += 18;
 
      ctx.font = '13px "Quicksand", sans-serif';
      ctx.fillStyle = '#374151';
      const foodNames = orderState.foods.length > 0
        ? orderState.foods
            .map((id) => {
              const o = FOOD_OPTIONS.find((opt) => opt.id === id);
              return o ? `${o.emoji} ${o.label}` : '';
            })
            .filter(Boolean)
            .join(', ')
        : 'Surpresa de doce de colher! 🍧';
      currentY = wrapText(ctx, foodNames, 35, currentY, width - 70, 18);
      currentY += 32;
    }
 
    // Suggestions for new places
    if (orderState.activities.includes('NEW_PLACE') && orderState.suggestion) {
      ctx.font = 'bold 13px "Quicksand", sans-serif';
      ctx.fillStyle = '#db2777';
      ctx.fillText('🗺️ SUGESTÕES DE LUGAR:', 35, currentY);
      currentY += 18;
 
      ctx.font = 'italic 12px "Quicksand", sans-serif';
      ctx.fillStyle = '#4b5563';
      currentY = wrapText(ctx, `"${orderState.suggestion}"`, 35, currentY, width - 70, 16);
      currentY += 32;
    }
 
    // Extras
    ctx.font = 'bold 13px "Quicksand", sans-serif';
    ctx.fillStyle = '#db2777';
    ctx.fillText('🍬 MIMOS EXTRAS ADICIONADOS:', 35, currentY);
    currentY += 18;
 
    ctx.font = '13px "Quicksand", sans-serif';
    ctx.fillStyle = '#374151';
    const extrasNames = orderState.extras.length > 0
      ? orderState.extras
          .map((id) => {
            const o = EXTRAS_OPTIONS.find((opt) => opt.id === id);
            return o ? `${o.emoji} ${o.label}` : '';
          })
          .filter(Boolean)
          .join(', ')
      : 'Muito carinho e dengo na vida real! 💞';
    currentY = wrapText(ctx, extrasNames, 35, currentY, width - 70, 18);
    currentY += 45;
 
    // Divider
    ctx.strokeStyle = '#fca5a5';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(30, currentY);
    ctx.lineTo(width - 30, currentY);
    ctx.stroke();
    currentY += 28;
 
    // Total cost declaration
    ctx.textAlign = 'center';
    ctx.font = 'bold 15px "Caveat", cursive';
    ctx.fillStyle = '#e11d48'; // rose-600
    ctx.fillText('Custo Total: 100% Amor & Sorrisos para Sempre! 🥰', width / 2, currentY);
    currentY += 24;
 
    ctx.font = '11px "Quicksand", sans-serif';
    ctx.fillStyle = '#4b5563';
    ctx.fillText('Apresente este passaporte para receber beijinhos na testa ilimitados.', width / 2, currentY);
    currentY += 34;
 
    // Draw interactive barcode pass
    ctx.fillStyle = '#111827';
    const startBarcodeX = width / 2 - 95;
    const barcodePattern = [3, 1, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 3, 2, 1, 4, 1];
    let offsetW = 0;
    for (let i = 0; i < barcodePattern.length; i++) {
      const w = barcodePattern[i];
      if (i % 2 === 0) {
        ctx.fillRect(startBarcodeX + offsetW, currentY, w, 22);
      }
      offsetW += w;
    }
 
    ctx.font = '9px "Quicksand", sans-serif';
    ctx.fillStyle = '#9ca3af';
    ctx.fillText('E N V I A R - P A R A - O - M E U - A M O R', width / 2, currentY + 33);
 
    // Save/Download link action
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'ingresso_do_encontro.png';
    link.href = dataURL;
    link.click();
  };
 
  const getReceiptText = () => {
    const actListStr = orderState.activities
      .map((id) => {
        const o = ACTIVITIES_OPTIONS.find((opt) => opt.id === id);
        return o ? `• ${o.emoji} ${o.label}` : '';
      })
      .filter(Boolean)
      .join('\n') || '• Escolha surpresa de aventura!';
 
    const foodListStr = orderState.activities.includes('EAT_OUT')
      ? '\n🍔 Comidas Escolhidas:\n' +
        (orderState.foods
          .map((id) => {
            const o = FOOD_OPTIONS.find((opt) => opt.id === id);
            return o ? `  - ${o.emoji} ${o.label}` : '';
          })
          .filter(Boolean)
          .join('\n') || '  - Surpresa doce misteriosa! 🍧')
      : '';
 
    const sugPhrase = orderState.activities.includes('NEW_PLACE') && orderState.suggestion
      ? `\n🗺️ Sugestão de Lugar Novo:\n  "${orderState.suggestion}"`
      : '';
 
    const extListStr = '\n🍬 Adicionais Personalizados:\n' +
      (orderState.extras
        .map((id) => {
          const o = EXTRAS_OPTIONS.find((opt) => opt.id === id);
          return o ? `  - ${o.emoji} ${o.label} (${o.cost})` : '';
        })
        .filter(Boolean)
        .join('\n') || '  - Carinho e xodó sem limites! 💞');
 
    return `🎟️ MEU PASSE OFICIAL DE ENCONTRO 🎟️\n\n💘 convite de encontro: ACEITO!\n\n🎒 Atividades Planejadas:\n${actListStr}${foodListStr}${sugPhrase}${extListStr}\n\n💸 Custo: 100% Amor & Abraços Ilimitados!\n\n👉 Envie de volta para resgatar imediatamente! 💝`;
  };

  const handleCopyClipboard = () => {
    playSound('sparkle');
    navigator.clipboard.writeText(getReceiptText());
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  return (
    <div id="main-container" className="min-h-screen w-full bg-pink-50/70 py-6 px-4 md:py-12 flex items-center justify-center font-sans text-gray-800 transition-colors duration-500 overflow-x-hidden kawaii-grid">
      
      {/* Floating Kawaii Hearts Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
        <div className="absolute top-1/4 left-1/10 text-pink-300 opacity-20 text-4xl animate-kawaii-float">💖</div>
        <div className="absolute top-1/3 right-1/10 text-pink-300 opacity-20 text-5xl animate-kawaii-float" style={{ animationDelay: '1s' }}>💕</div>
        <div className="absolute bottom-1/4 left-1/5 text-pink-300 opacity-15 text-3xl animate-kawaii-float" style={{ animationDelay: '2.5s' }}>💝</div>
        <div className="absolute bottom-1/3 right-1/5 text-pink-300 opacity-20 text-4xl animate-kawaii-float" style={{ animationDelay: '1.5s' }}>🧁</div>
        <div className="absolute top-10 right-1/4 text-pink-300 opacity-15 text-3xl animate-kawaii-float" style={{ animationDelay: '3s' }}>✨</div>
      </div>

      <div className="w-full max-w-md bg-white border-4 border-pink-200 shadow-xl rounded-3xl overflow-hidden relative flex flex-col z-10 transition-shadow duration-300 hover:shadow-2xl">
        
        {/* Soft pastel header block with simple heart progress bar */}
        {currentStep !== 'WELCOME' && (
          <div id="header-progress" className="bg-pink-50 px-4 pt-5 pb-3 border-b-2 border-pink-100 flex flex-col items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-pink-500 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Passo {getStepIndex(currentStep)} de {stepList.length - 2}</span>
              <Sparkles className="w-3.5 h-3.5" />
            </div>

            {/* Custom Dot / Heart Progress Chain lines */}
            <div className="w-full max-w-xs flex items-center justify-between relative mt-1.5">
              <div className="absolute h-1 bg-pink-150 top-1/2 left-0 right-0 -translate-y-1/2 rounded z-0" />
              {stepList.slice(1, -1).map((s, idx) => {
                const isActive = getStepIndex(currentStep) >= idx + 1;
                const isCurrent = currentStep === s.key;
                return (
                  <div key={s.key} className="relative z-10">
                    <motion.div
                      animate={{ scale: isCurrent ? 1.25 : 1 }}
                      className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors duration-250 ${
                        isCurrent
                          ? 'bg-rose-500 border-rose-600 text-white shadow-sm shadow-rose-200'
                          : isActive
                          ? 'bg-pink-300 border-pink-400 text-white'
                          : 'bg-white border-pink-200 text-pink-300'
                      }`}
                    >
                      <Heart className={`w-3 h-3 fill-current ${isCurrent ? 'animate-pulse-heart' : ''}`} />
                    </motion.div>
                    <span className="hidden leading-none absolute top-7 left-1/2 -translate-x-1/2 text-[9px] font-bold tracking-tight text-pink-400 whitespace-nowrap">
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Dynamic transition screen flow container */}
        <div id="content-container" className="p-6 md:p-8 flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -25 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="flex-1 flex flex-col"
            >
              
              {/* PAGE 1: DECORATIVE WELCOME INVITATION */}
              {currentStep === 'WELCOME' && (
                <div id="welcome-step" className="flex-1 flex flex-col items-center justify-center text-center py-4">
                  {/* Kawaii expression pulsing heart */}
                  <div className="relative mb-6">
                    <motion.div
                      animate={{
                        scale: [1, 1.05, 1],
                        rotate: [0, 1, -1, 0]
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 2.2,
                        ease: 'easeInOut'
                      }}
                      className="w-36 h-36 flex items-center justify-center text-rose-500 fill-rose-500"
                    >
                      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
                        <path
                          d="M 10,30 A 20,20 0 0,1 50,30 A 20,20 0 0,1 90,30 Q 90,60 50,90 Q 10,60 10,30 z"
                          fill="#fda4af"
                          stroke="#f43f5e"
                          strokeWidth="3.5"
                        />
                        {/* Cutest anime eyes inside the heart */}
                        <circle cx="36" cy="38" r="4" fill="#1e293b" />
                        <circle cx="64" cy="38" r="4" fill="#1e293b" />
                        {/* Eye reflections */}
                        <circle cx="38" cy="36" r="1.5" fill="#ffffff" />
                        <circle cx="66" cy="36" r="1.5" fill="#ffffff" />
                        {/* Blushing cheeks! */}
                        <ellipse cx="28" cy="46" rx="5" ry="3.2" fill="#ec4899" opacity="0.6" />
                        <ellipse cx="72" cy="46" rx="5" ry="3.2" fill="#ec4899" opacity="0.6" />
                        {/* Cute happy kitten curve mouth */}
                        <path
                          d="M 45,46 Q 50,49 55,46"
                          stroke="#1e293b"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          fill="none"
                        />
                      </svg>
                    </motion.div>
                    
                    {/* Tiny adorable floating star badges */}
                    <div className="absolute -top-1 -right-3 text-yellow-400 text-2xl animate-bounce">⭐</div>
                    <div className="absolute bottom-1 -left-4 text-purple-400 text-xl animate-pulse">✨</div>
                  </div>

                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-rose-600 mb-2 font-sans leading-snug">
                    Quer ir a um encontro comigo? 🥺👉👈
                  </h1>
                  <p className="text-sm text-pink-400 mb-8 max-w-sm font-semibold leading-relaxed">
                    Por favor, por favor, por favor sai comigo eu nunca te pedi nada 🥺
                  </p>

                  {/* Dual options: Yes and Runaway No */}
                  <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-4 py-4 relative min-h-[140px]">
                    <motion.button
                      id="welcome-yes-btn"
                      whileHover={{ scale: 1.12 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleWelcomeYes}
                      className="px-8 py-3 rounded-full font-bold text-lg cursor-pointer bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-md shadow-rose-200 transition-shadow hover:shadow-lg active:scale-95 border border-rose-500/20 z-10"
                    >
                      Sim, claro! 😍
                    </motion.button>

                    {/* No button bounds inside parent layout absolute or relative */}
                    <RunawayButton id="welcome-no-btn" onClick={() => playSound('fail')}>
                      Não 😢
                    </RunawayButton>
                  </div>
                </div>
              )}


              {/* PAGE 2: WHAT TO DO ON THE DATE */}
              {currentStep === 'ACTIVITIES' && (
                <div id="activities-step" className="flex-1 flex flex-col">
                  <div className="text-center mb-6">
                    <Smile className="w-8 h-8 text-pink-400 mx-auto mb-1 animate-bounce" />
                    <h2 className="text-xl md:text-2xl font-bold text-rose-600">
                      EBA! O que você quer fazer? 💖
                    </h2>
                    <p className="text-xs text-pink-400 mt-1 font-semibold">
                      Escolha a sua atividade favorita para o nosso encontro especial!
                    </p>
                  </div>

                  {/* Grid of cute kawaii activies options */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {ACTIVITIES_OPTIONS.map((opt) => {
                      const isSelected = orderState.activities.includes(opt.id);
                      return (
                        <motion.button
                          key={opt.id}
                          id={`activity-option-${opt.id}`}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleActivitiesToggle(opt.id)}
                          className={`p-4 rounded-2xl border-2 cursor-pointer flex flex-col items-center justify-center text-center gap-2 transition-all relative ${
                            isSelected
                              ? 'bg-rose-50 border-rose-400 text-rose-600 shadow-sm shadow-rose-100'
                              : 'bg-white border-pink-100/80 text-gray-700 hover:border-pink-300'
                          }`}
                        >
                          <span className="text-3xl filter drop-shadow-sm leading-none">{opt.emoji}</span>
                          <span className="text-xs font-bold leading-tight tracking-wide">{opt.label}</span>
                          
                          {/* Checked Status Badge */}
                          {isSelected && (
                            <div className="absolute top-2 right-2 bg-rose-500 text-white rounded-full p-0.5">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Flow control footer */}
                  <div className="mt-auto pt-4 flex items-center justify-between gap-4">
                    <button
                      id="activity-back-btn"
                      onClick={goBack}
                      className="px-4 py-2 text-xs font-bold text-pink-400 hover:text-pink-600 flex items-center gap-1.5 cursor-pointer bg-pink-50/50 rounded-lg hover:bg-pink-50"
                    >
                      <ChevronLeft className="w-4 h-4" /> Voltar
                    </button>
                    
                    <button
                      id="activity-next-btn"
                      disabled={orderState.activities.length === 0}
                      onClick={handleActivitiesNext}
                      className={`px-5 py-2.5 rounded-full font-extrabold text-sm flex items-center gap-1 cursor-pointer transition-all shadow-md active:scale-95 ${
                        orderState.activities.length === 0
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                          : 'bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-rose-100 hover:shadow-lg'
                      }`}
                    >
                      Próximo Passo <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}


              {/* CONDITIONAL PAGE 3: FOOD/EAT-OUT OPTIONS */}
              {currentStep === 'FOOD' && (
                <div id="food-step" className="flex-1 flex flex-col">
                  <div className="text-center mb-5">
                    <span className="text-3xl leading-none">🍕</span>
                    <h2 className="text-xl md:text-2xl font-bold text-rose-600 mt-1">
                      Hum! Escolha nossas comidas! 🍝
                    </h2>
                    <p className="text-xs text-pink-400 font-semibold">
                      Por favor, escolha as delícias que vamos saborear!
                    </p>
                  </div>

                  {/* Grid layout of meals */}
                  <div className="grid grid-cols-2 gap-3 mb-6 max-h-[330px] overflow-y-auto pr-1">
                    {FOOD_OPTIONS.map((opt) => {
                      const isSelected = orderState.foods.includes(opt.id);

                      if (opt.id === 'NOT_EAT') {
                        return (
                          <div key={opt.id} className="relative w-full h-24">
                            <RunawayButton
                              id="food-not-eat-btn"
                              colorType="custom"
                              onClick={() => {
                                playSound('fail');
                                handleFoodToggle(opt.id);
                              }}
                              className={`absolute left-0 top-0 w-full h-full p-3 rounded-2xl border-2 flex flex-col items-center justify-center text-center gap-1.5 transition-all ${
                                isSelected
                                  ? 'bg-rose-50 border-rose-400 text-rose-600 shadow-sm shadow-rose-100'
                                  : 'bg-white border-pink-100 text-gray-700 hover:border-pink-300'
                              }`}
                            >
                              <span className="text-3xl filter drop-shadow-sm leading-none">{opt.emoji}</span>
                              <span className="text-xs font-bold leading-none">{opt.label}</span>
                              {isSelected && (
                                <div className="absolute top-2 right-2 bg-rose-500 text-white rounded-full p-0.5">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                </div>
                              )}
                            </RunawayButton>
                          </div>
                        );
                      }

                      return (
                        <motion.button
                          key={opt.id}
                          id={`food-option-${opt.id}`}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleFoodToggle(opt.id)}
                          className={`p-3 h-24 rounded-2xl border-2 cursor-pointer flex flex-col items-center justify-center text-center gap-1.5 transition-all relative ${
                            isSelected
                              ? 'bg-rose-50 border-rose-400 text-rose-600 shadow-sm shadow-rose-105'
                              : 'bg-white border-pink-100 text-gray-700 hover:border-pink-300'
                          }`}
                        >
                          <span className="text-3xl filter drop-shadow-sm leading-none">{opt.emoji}</span>
                          <span className="text-xs font-bold leading-none">{opt.label}</span>
                          
                          {isSelected && (
                            <div className="absolute top-2 right-2 bg-rose-500 text-white rounded-full p-0.5">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Navigation footer */}
                  <div className="mt-auto pt-4 flex items-center justify-between gap-4">
                    <button
                      id="food-back-btn"
                      onClick={goBack}
                      className="px-4 py-2 text-xs font-bold text-pink-400 hover:text-pink-600 flex items-center gap-1.5 cursor-pointer bg-pink-50/50 rounded-lg"
                    >
                      <ChevronLeft className="w-4 h-4" /> Voltar
                    </button>
                    
                    <button
                      id="food-next-btn"
                      onClick={handleFoodNext}
                      className="px-5 py-2.5 rounded-full font-extrabold text-sm flex items-center gap-1 cursor-pointer bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-md shadow-rose-100 hover:shadow-lg active:scale-95"
                    >
                      Escolher Extras <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}


              {/* CONDITIONAL PAGE 4: SUGGESTIONS BOX */}
              {currentStep === 'SUGGESTION' && (
                <div id="suggestion-step" className="flex-1 flex flex-col">
                  <div className="text-center mb-5">
                    <MapPin className="w-8 h-8 text-pink-400 mx-auto mb-1 animate-pulse" />
                    <h2 className="text-xl md:text-2xl font-bold text-rose-600">
                      Visitar um lugar novo! 🗺️✨
                    </h2>
                    <p className="text-xs text-pink-400 font-semibold mt-1">
                      Onde você gostaria de explorar comigo?
                    </p>
                  </div>

                  {/* Handwritten custom text area block representation */}
                  <div className="relative mb-3 flex-1 min-h-[160px] flex flex-col">
                    <div className="absolute top-2 right-3 z-10 text-xl pointer-events-none">⭐</div>
                    <textarea
                      id="suggestion-textarea"
                      value={orderState.suggestion}
                      onChange={(e) => handleSuggestionChange(e.target.value)}
                      placeholder="Ex: Aquele café secreto cheio de plantinhas no centro, ou o píer à beira-mar! 🌊"
                      className={`w-full flex-1 min-h-[150px] p-5 rounded-2xl border-2 text-sm bg-rose-50/20 font-medium placeholder-pink-300 focus:outline-none focus:ring-2 focus:ring-rose-300 transition-all ${
                        suggestionError ? 'border-rose-400 bg-rose-50/20' : 'border-pink-200'
                      }`}
                    />
                  </div>

                  {/* Shaky animation alert in case they blanked out suggestion */}
                  {suggestionError && (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 mb-4"
                    >
                      <Info className="w-4 h-4 shrink-0 shrink" />
                      <span>A sugestão não pode ficar vazia! Compartilhe um lugar legal onde queira ir! 💖</span>
                    </motion.div>
                  )}

                  {/* Navigation footer */}
                  <div className="mt-auto pt-4 flex items-center justify-between gap-4">
                    <button
                      id="suggestion-back-btn"
                      onClick={goBack}
                      className="px-4 py-2 text-xs font-bold text-pink-400 hover:text-pink-600 flex items-center gap-1.5 cursor-pointer bg-pink-50/50 rounded-lg"
                    >
                      <ChevronLeft className="w-4 h-4" /> Voltar
                    </button>
                    
                    <button
                      id="suggestion-next-btn"
                      onClick={handleSuggestionNext}
                      className="px-5 py-2.5 rounded-full font-extrabold text-sm flex items-center gap-1 cursor-pointer bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-md shadow-rose-100 hover:shadow-lg active:scale-95"
                    >
                      Escolher Mimos Extras <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}


              {/* PAGE 5: ANY EXTRAS IN THE CART? */}
              {currentStep === 'EXTRAS' && (
                <div id="extras-step" className="flex-1 flex flex-col">
                  <div className="text-center mb-5">
                    <MessageSquare className="w-8 h-8 text-pink-400 mx-auto mb-1" />
                    <h2 className="text-xl md:text-2xl font-bold text-rose-600">
                      Mais algum adicional fofo? 🍭
                    </h2>
                    <p className="text-xs text-pink-400 font-semibold mt-1">
                      Personalize seu cupom especial com mimos incríveis.
                    </p>
                  </div>

                  {/* List of custom additions checkboxes */}
                  <div className="space-y-2 mb-5">
                    {EXTRAS_OPTIONS.map((opt) => {
                      const isSelected = orderState.extras.includes(opt.id);

                      if (opt.id === 'NO_HOLDING') {
                        return (
                          <div key={opt.id} className="relative w-full h-[72px]">
                            <RunawayButton
                              id="extra-no-holding-btn"
                              colorType="custom"
                              onClick={() => {
                                playSound('fail');
                                handleExtrasToggle(opt.id);
                              }}
                              className={`absolute left-0 top-0 w-full h-[72px] p-3.5 rounded-2xl border-2 text-left flex items-center justify-between transition-all ${
                                isSelected
                                  ? 'bg-rose-50 border-rose-400 text-rose-600 shadow-sm'
                                  : 'bg-white border-pink-100 text-gray-700 hover:border-pink-300'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-2xl filter drop-shadow-sm leading-none">{opt.emoji}</span>
                                <div className="text-left">
                                  <p className="text-xs font-bold leading-tight">{opt.label}</p>
                                  <span className="text-[10px] text-pink-400 font-semibold mt-0.5 block">
                                    💔 Opção de Cancelamento (Proibido)
                                  </span>
                                </div>
                              </div>
                              
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center font-bold ${
                                isSelected ? 'bg-rose-500 border-rose-600 text-white' : 'border-pink-200 bg-white'
                              }`}>
                                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </div>
                            </RunawayButton>
                          </div>
                        );
                      }

                      return (
                        <motion.button
                          key={opt.id}
                          id={`extra-option-${opt.id}`}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => handleExtrasToggle(opt.id)}
                          className={`w-full h-[72px] p-3.5 rounded-2xl border-2 text-left flex items-center justify-between cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-rose-50 border-rose-400 text-rose-600'
                              : 'bg-white border-pink-100 text-gray-700 hover:border-pink-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl filter drop-shadow-sm leading-none">{opt.emoji}</span>
                            <div>
                              <p className="text-xs font-bold leading-tight">{opt.label}</p>
                              <span className="text-[10px] text-pink-400 font-semibold mt-0.5 block">
                                {opt.requiresReturn ? '⚠️ Tem que dar um de volta' : '🌟 Totalmente Grátis'}
                              </span>
                            </div>
                          </div>
                          
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center font-bold ${
                            isSelected ? 'bg-rose-500 border-rose-600 text-white' : 'border-pink-200 bg-white'
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Checkout flow navigation footer */}
                  <div className="mt-auto pt-4 flex items-center justify-between gap-4">
                    <button
                      id="extras-back-btn"
                      onClick={goBack}
                      className="px-4 py-2 text-xs font-bold text-pink-400 hover:text-pink-600 flex items-center gap-1.5 cursor-pointer bg-pink-50/50 rounded-lg"
                    >
                      <ChevronLeft className="w-4 h-4" /> Voltar
                    </button>
                    
                    <button
                      id="extras-next-btn"
                      onClick={handleExtrasNext}
                      className="px-5 py-2.5 rounded-full font-extrabold text-sm flex items-center gap-1 cursor-pointer bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-md shadow-rose-100 hover:shadow-lg active:scale-95"
                    >
                      Confirmar Passe do Encontro <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}


              {/* PAGE 6: HIGH POLISHED CHECKOUT TICKET SUMMARY */}
              {currentStep === 'CHECKOUT' && (
                <div id="checkout-step" className="flex-1 flex flex-col">
                  {/* Title card header */}
                  <div className="text-center mb-5">
                    <Star className="w-8 h-8 text-yellow-400 fill-yellow-300 mx-auto mb-1 animate-spin" style={{ animationDuration: '6s' }} />
                    <h2 className="text-xl md:text-2xl font-bold text-rose-600">
                      Seu Passe do Encontro! 🎟️💖
                    </h2>
                    <p className="text-xs text-pink-400 font-semibold mt-1">
                      Confira o seu recibo abaixo e envie para o seu amor!
                    </p>
                  </div>

                  {/* The paper receipts ticket with torn edge look */}
                  <div className="bg-[#fffdfd] border-2 border-pink-100 rounded-2xl shadow-inner p-5 mb-5 relative overflow-hidden text-gray-700">
                    {/* Pink decorative border rails */}
                    <div className="absolute inset-y-0 left-2 w-0.5 border-l border-dashed border-rose-300" />
                    <div className="absolute inset-y-0 right-2 w-0.5 border-r border-dashed border-rose-300" />

                    <div className="px-3">
                      <div className="text-center pb-3 border-b border-rose-200 border-dashed mb-4">
                        <p className="text-xs uppercase font-extrabold tracking-wider text-rose-500">Recibo Oficial de Cupom</p>
                        <span className="text-[10px] text-pink-400 font-medium">Validado: Maio de 2026</span>
                      </div>

                      <div className="space-y-4 text-xs">
                        {/* Invitation status */}
                        <div className="flex justify-between items-start gap-1">
                          <span className="font-extrabold text-gray-500 select-none">💌 Status do Convite</span>
                          <span className="font-bold text-rose-600 text-right">Sim, 100% Aceito! 💖</span>
                        </div>

                        {/* Activities included */}
                        <div>
                          <span className="font-extrabold text-gray-500 select-none block mb-1">🎒 Atividades Selecionadas</span>
                          <div className="pl-2 space-y-1">
                            {orderState.activities.length > 0 ? (
                              orderState.activities.map((id) => {
                                const opt = ACTIVITIES_OPTIONS.find((o) => o.id === id);
                                return (
                                  <p key={id} className="font-semibold text-gray-700">
                                    {opt?.emoji} {opt?.label}
                                  </p>
                                );
                              })
                            ) : (
                              <p className="font-semibold text-gray-400 italic">Nenhuma atividade selecionada</p>
                            )}
                          </div>
                        </div>

                        {/* Food Menu selections */}
                        {orderState.activities.includes('EAT_OUT') && (
                          <div>
                            <span className="font-extrabold text-gray-500 select-none block mb-1">🍔 Escolha de Comida</span>
                            <div className="pl-2 space-y-1">
                              {orderState.foods.length > 0 ? (
                                orderState.foods.map((id) => {
                                  const opt = FOOD_OPTIONS.find((o) => o.id === id);
                                  return (
                                    <p key={id} className="font-semibold text-gray-700">
                                      {opt?.emoji} {opt?.label}
                                    </p>
                                  );
                                })
                              ) : (
                                <p className="font-semibold text-gray-400 italic">Surpresa doce de colher!</p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Visit places suggestions */}
                        {orderState.activities.includes('NEW_PLACE') && orderState.suggestion && (
                          <div className="bg-pink-50/30 p-2.5 rounded-xl border border-pink-100/50">
                            <span className="font-extrabold text-gray-500 select-none block mb-1">🗺️ Sugestão de Destino</span>
                            <p className="font-bold text-rose-500 italic text-xs leading-relaxed">
                              "{orderState.suggestion}"
                            </p>
                          </div>
                        )}

                        {/* Selected extras */}
                        <div>
                          <span className="font-extrabold text-gray-500 select-none block mb-1">🍬 Adicionais Personalizados</span>
                          <div className="pl-2 space-y-1">
                            {orderState.extras.length > 0 ? (
                              orderState.extras.map((id) => {
                                const opt = EXTRAS_OPTIONS.find((o) => o.id === id);
                                return (
                                  <div key={id} className="flex justify-between font-semibold">
                                    <span className="text-gray-700">
                                      {opt?.emoji} {opt?.label}
                                    </span>
                                    <span className="text-[10px] text-pink-500 font-bold bg-pink-100 px-1.5 py-0.5 rounded-md self-center leading-none">
                                      {opt?.requiresReturn ? 'Exige Beijo de Volta' : 'Grátis'}
                                    </span>
                                  </div>
                                );
                              })
                            ) : (
                              <p className="font-semibold text-gray-400 italic">Nenhum mimo extra selecionado</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Receipt total footer stamp */}
                      <div className="border-t border-rose-200 border-dashed mt-5 pt-3 text-center">
                        <span className="font-handwritten text-2xl font-bold text-rose-500 block leading-tight">
                          Total: Amor Ilimitado ❤️
                        </span>
                        <p className="text-[9px] text-gray-400 font-medium tracking-tight mt-1">
                          Abrace bem forte na vida real para validar seu passe.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Instructing messages */}
                  <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-4 text-center mb-6">
                    <p className="text-xs text-rose-600 font-bold leading-relaxed">
                      🎁 Instruções: Baixe este passe como uma imagem incrível ou copie o resumo do ingresso em texto, depois envie para seu amor para resgatar o encontro!
                    </p>
                  </div>

                  {/* Actions Row */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <motion.button
                        id="copy-text-btn"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCopyClipboard}
                        className="p-3 bg-white border-2 border-pink-200 text-pink-500 font-bold text-xs rounded-2xl cursor-pointer flex items-center justify-center gap-2 hover:bg-pink-50 active:scale-95 transition-all"
                      >
                        {copiedText ? (
                          <>
                            <Check className="w-4 h-4 text-green-500 stroke-[3]" /> Plano Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" /> Copiar Resumo
                          </>
                        )}
                      </motion.button>

                      <motion.button
                        id="download-ticket-btn"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={generateAndDownloadTicket}
                        className="p-3 bg-gradient-to-r from-rose-400 to-pink-500 text-white font-bold text-xs rounded-2xl cursor-pointer flex items-center justify-center gap-2 hover:opacity-95 shadow-md shadow-rose-100 active:scale-95 transition-all"
                      >
                        <Download className="w-4 h-4" /> Salvar Cupom PNG
                      </motion.button>
                    </div>

                    <button
                      id="reset-restart-btn"
                      onClick={resetAll}
                      className="w-full py-2.5 text-xs font-bold text-pink-400 hover:text-pink-600 cursor-pointer text-center flex items-center justify-center gap-1 bg-pink-50/50 hover:bg-pink-50 rounded-xl"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Recomeçar & Planejar Outro Encontro!
                    </button>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
        
      </div>

      <AnimatePresence>
        {showFoodLesson && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-pink-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none"
          >
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              className="w-full max-w-sm bg-white border-4 border-pink-300 rounded-3xl p-6 shadow-2xl relative text-center"
            >
              <span className="text-4xl block mb-2 animate-bounce">👩‍🏫🌸</span>
              <h3 className="text-lg font-extrabold text-rose-600 mb-2">Espere! Hora de Aprender! 📚💖</h3>
              <p className="text-xs text-gray-600 leading-relaxed font-semibold mb-4">
                Princesas devem escolher apenas <span className="text-pink-500 font-bold">UMA</span> refeição favorita por vez! 
                Vamos garantir que nosso encontro seja delicioso focando no seu prato preferido de hoje! 🥰✨
              </p>
              
              {/* Cute blush decor */}
              <div className="flex justify-center gap-16 text-rose-300 mb-4 h-2 font-bold select-none text-xl leading-none">
                <span>◌ ◌</span>
                <span>◌ ◌</span>
              </div>

              <div className="flex flex-col gap-2">
                <button
                   type="button"
                  onClick={() => {
                    playSound('sparkle');
                    if (pendingFoodSelection) {
                      setOrderState((prev) => ({
                        ...prev,
                        foods: [pendingFoodSelection],
                      }));
                    }
                    setShowFoodLesson(false);
                    setPendingFoodSelection(null);
                  }}
                  className="w-full py-2.5 bg-gradient-to-r from-rose-400 to-pink-500 text-white font-bold text-xs rounded-full hover:opacity-95 shadow-md shadow-rose-100 transition-all cursor-pointer"
                >
                  Tudo bem! Mudar para o meu novo prato favorito! 😋
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playSound('pop');
                    setShowFoodLesson(false);
                    setPendingFoodSelection(null);
                  }}
                  className="w-full py-2.5 bg-pink-50 text-pink-500 border border-pink-200 font-bold text-xs rounded-full hover:bg-pink-100/50 transition-all cursor-pointer"
                >
                  Manter a minha escolha anterior! ✨
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showActivityLesson && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-pink-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none"
          >
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              className="w-full max-w-sm bg-white border-4 border-pink-300 rounded-3xl p-6 shadow-2xl relative text-center"
            >
              <span className="text-4xl block mb-2 animate-bounce">👩‍🏫✨</span>
              <h3 className="text-lg font-extrabold text-rose-600 mb-2">Espere! Hora de Aprender! 📚💖</h3>
              <p className="text-xs text-gray-600 leading-relaxed font-semibold mb-4">
                Princesas devem escolher apenas <span className="text-pink-500 font-bold">UMA</span> atividade favorita por vez! 
                Vamos garantir que nosso encontro flua perfeitamente focando em uma aventura espetacular primeiro! 🥰🎡
              </p>
              
              {/* Cute blush decor */}
              <div className="flex justify-center gap-16 text-rose-300 mb-4 h-2 font-bold select-none text-xl leading-none">
                <span>◌ ◌</span>
                <span>◌ ◌</span>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    playSound('sparkle');
                    if (pendingActivitySelection) {
                      setOrderState((prev) => {
                        const activities = [pendingActivitySelection];
                        // Reset sub-selections depending on what main activity is active
                        let foods = prev.foods;
                        let suggestion = prev.suggestion;
                        if (!activities.includes('EAT_OUT')) foods = [];
                        if (!activities.includes('NEW_PLACE')) suggestion = '';
                        return { ...prev, activities, foods, suggestion };
                      });
                    }
                    setShowActivityLesson(false);
                    setPendingActivitySelection(null);
                  }}
                  className="w-full py-2.5 bg-gradient-to-r from-rose-400 to-pink-500 text-white font-bold text-xs rounded-full hover:opacity-95 shadow-md shadow-rose-100 transition-all cursor-pointer"
                >
                  Tudo bem! Mudar para a nova aventura! 🚀
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playSound('pop');
                    setShowActivityLesson(false);
                    setPendingActivitySelection(null);
                  }}
                  className="w-full py-2.5 bg-pink-50 text-pink-500 border border-pink-200 font-bold text-xs rounded-full hover:bg-pink-100/50 transition-all cursor-pointer"
                >
                  Manter nossa escolha anterior! 🌟
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
