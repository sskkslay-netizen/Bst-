
import React, { useState, useEffect, useRef } from 'react';
import { UserState, ChatMessage, Card } from '../types';
import { getCharacterChatResponse } from '../services/geminiService';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

interface ChatViewProps {
  user: UserState;
}

const ChatView: React.FC<ChatViewProps> = ({ user }) => {
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMobileListOpen, setIsMobileListOpen] = useState(true);
  const [isDebateMode, setIsDebateMode] = useState(false);
  const [isRanpoThinking, setIsRanpoThinking] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Live API Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);

  const selectedCard = selectedInstanceId ? user.cardInstances[selectedInstanceId] : null;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (selectedInstanceId && window.innerWidth < 768) {
      setIsMobileListOpen(false);
    }
  }, [selectedInstanceId]);

  const handleSend = async (customMessage?: string) => {
    const textToSend = customMessage || input;
    if (!textToSend || !selectedCard) return;
    
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    
    setIsTyping(true);
    const response = await getCharacterChatResponse(
      selectedCard.name, 
      textToSend, 
      messages, 
      isDebateMode ? 'debate' : 'normal'
    );
    setMessages(prev => [...prev, { role: 'model', text: response }]);
    setIsTyping(false);
  };

  const handleAskRanpo = async () => {
    if (!selectedCard) return;
    setIsRanpoThinking(true);
    const prompt = "Ranpo-san, can you give me a Super Deduction about my study material? Explain it as simply as possible!";
    await handleSend(prompt);
    setIsRanpoThinking(false);
  };

  // --- LIVE CALL LOGIC ---
  const startCall = async () => {
    if (!selectedCard) return;
    setIsCalling(true);
    
    // Always initialize a fresh GoogleGenAI instance before making the call
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              // CRITICAL: Ensure data is streamed only after the session promise resolves.
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle model interruption
            const interrupted = message.serverContent?.interrupted;
            if (interrupted) {
              for (const source of sourcesRef.current.values()) {
                try { source.stop(); } catch(e) {}
                sourcesRef.current.delete(source);
              }
              nextStartTimeRef.current = 0;
            }

            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && audioContextRef.current) {
              const ctx = audioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              // Decodes raw PCM audio data returned by the API
              const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
              });
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }
          },
          onclose: () => setIsCalling(false),
          onerror: () => setIsCalling(false)
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: `You are ${selectedCard.name} from Bungou Stray Dogs. You are currently on a secure voice call with the Agency Commander. Speak in character. Keep responses brief and conversational for a voice interaction.`
        }
      });
      
      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Call failed:", err);
      setIsCalling(false);
    }
  };

  const endCall = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    sourcesRef.current.forEach(s => {
      try { s.stop(); } catch(e) {}
    });
    sourcesRef.current.clear();
    setIsCalling(false);
  };

  // Manual implementation of base64 decoding as per guideline
  function decode(base64: string) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  // Implementation for decoding raw PCM data streams
  async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }

  // Manual implementation of base64 encoding logic to safely handle byte arrays
  function encode(bytes: Uint8Array) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  function createBlob(data: Float32Array) {
    const int16 = new Int16Array(data.length);
    for (let i = 0; i < data.length; i++) {
      int16[i] = data[i] * 32768;
    }
    return { 
      data: encode(new Uint8Array(int16.buffer)), 
      mimeType: 'audio/pcm;rate=16000' 
    };
  }

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-160px)] md:h-[calc(100vh-140px)] flex flex-col md:flex-row gap-4 md:gap-6 relative">
      {/* Sidebar - Character List */}
      <div className={`${isMobileListOpen ? 'flex' : 'hidden md:flex'} w-full md:w-80 flex flex-col space-y-4 h-full bg-white/50 p-4 rounded-3xl border border-blue-100`}>
        <h2 className="text-2xl font-bebas text-blue-900 px-2 flex justify-between items-center">
          Agency Contacts
          <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-2 py-0.5 rounded">ENCRYPTED</span>
        </h2>
        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
          {user.inventory.map(instId => {
            const card = user.cardInstances[instId];
            return (
              <button 
                key={instId}
                onClick={() => {
                  setSelectedInstanceId(instId);
                  setMessages([]);
                }}
                className={`w-full flex items-center space-x-3 p-3 rounded-2xl border transition-all hover:scale-[1.02] ${
                  selectedInstanceId === instId ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-white border-blue-50 hover:bg-blue-50'
                }`}
              >
                <img src={card.image} className="w-12 h-12 rounded-full object-cover border-2 border-white/20" alt="" />
                <div className="text-left overflow-hidden">
                  <p className="font-bold text-sm truncate">{card.name}</p>
                  <p className={`text-[10px] uppercase font-bold opacity-60 truncate`}>{card.title}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`${!isMobileListOpen || selectedCard ? 'flex' : 'hidden md:flex'} flex-1 bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl flex flex-col border border-blue-200 overflow-hidden h-full relative`}>
        {selectedCard ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-blue-100 bg-blue-50/50 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setIsMobileListOpen(true)} 
                  className="md:hidden w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-md text-blue-600"
                >
                  ←
                </button>
                <div className="relative">
                  <img src={selectedCard.image} className="w-12 h-12 rounded-full border-2 border-blue-500 shadow-md object-cover" alt="" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-bold text-blue-900 flex items-center gap-2">
                    {selectedCard.name}
                    {isDebateMode && <span className="bg-red-500 text-white text-[8px] px-2 py-0.5 rounded-full uppercase tracking-tighter animate-pulse">Debate Active</span>}
                  </h3>
                  <p className="text-[10px] text-blue-400 uppercase font-bold tracking-widest leading-none">{selectedCard.title}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleAskRanpo} disabled={isRanpoThinking} className="hidden sm:block px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold hover:bg-blue-200 transition-all">👓 ASK RANPO</button>
                <button 
                  onClick={startCall}
                  className="p-2 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition-all shadow-sm" 
                  title="Secure Call"
                >
                  📞
                </button>
                <button 
                  onClick={() => setIsDebateMode(!isDebateMode)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${isDebateMode ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                >
                  DEBATE
                </button>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-6 relative custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed opacity-95">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-6">
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-4xl animate-bounce">📱</div>
                  <div>
                    <h4 className="text-xl font-bebas text-blue-900 mb-2">Encrypted Channel Established</h4>
                    <p className="text-xs text-slate-500 italic max-w-xs">
                      {isDebateMode ? "Ranpo is ready to tear your logic apart. Explain your study material to him." : `Awaiting your signal, Commander. ${selectedCard.name} is online.`}
                    </p>
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                  <div className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    {m.role === 'model' && <img src={selectedCard.image} className="w-8 h-8 rounded-full flex-shrink-0 self-end shadow-sm border border-blue-200" alt="" />}
                    <div className={`px-4 py-3 rounded-2xl text-sm shadow-sm ${
                      m.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-slate-800 border border-blue-100 rounded-bl-none'
                    }`}>
                      {m.text}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start items-center gap-2">
                  <img src={selectedCard.image} className="w-8 h-8 rounded-full opacity-50 grayscale" alt="" />
                  <div className="bg-slate-100 px-4 py-2 rounded-2xl text-[10px] font-bold text-slate-400 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-100"></span>
                    <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-200"></span>
                    Investigating...
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-blue-100">
              <div className="relative flex items-center gap-3">
                <input 
                  type="text" 
                  placeholder={isDebateMode ? "Present your study logic..." : "Send a message to the agency..."} 
                  className="flex-1 px-6 py-4 bg-slate-50 border border-slate-200 rounded-full focus:ring-4 focus:ring-blue-100 focus:bg-white outline-none text-sm transition-all"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                />
                <button 
                  onClick={() => handleSend()}
                  disabled={!input || isTyping}
                  className="w-12 h-12 bg-blue-600 text-white rounded-full flex-shrink-0 flex items-center justify-center shadow-lg hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  ➔
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-6 text-center">
            <div className="text-6xl mb-6 opacity-30">💬</div>
            <h3 className="text-2xl font-bebas text-blue-900 opacity-50 mb-2">Agency Offline</h3>
            <p className="text-sm max-w-xs">Select a character file to establish an encrypted communication line.</p>
          </div>
        )}
      </div>

      {/* CALL MODAL OVERLAY */}
      {isCalling && selectedCard && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl animate-fade-in">
           <div className="flex flex-col items-center space-y-12">
              <div className="relative">
                <div className="absolute inset-0 rounded-full border-4 border-blue-500 animate-ping opacity-20"></div>
                <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-pulse opacity-40"></div>
                <img src={selectedCard.image} className="w-48 h-48 rounded-full border-8 border-blue-600 shadow-2xl relative z-10" alt="" />
              </div>
              <div className="text-center">
                 <h2 className="text-4xl font-bebas text-white tracking-[0.2em]">{selectedCard.name}</h2>
                 <p className="text-blue-400 text-xs font-bold uppercase tracking-widest animate-pulse mt-2">Secure Link Established</p>
              </div>
              
              {/* Visualizer Mockup */}
              <div className="flex items-end gap-1 h-12">
                 {[1,2,3,4,5,6,7,8,7,6,5,4,3,2,1].map((h, i) => (
                   <div key={i} className="w-1 bg-blue-500 rounded-full animate-bounce" style={{ height: `${h * 10}%`, animationDelay: `${i * 0.1}s` }}></div>
                 ))}
              </div>

              <button 
                onClick={endCall}
                className="px-16 py-4 bg-red-600 text-white font-bebas text-2xl rounded-full shadow-2xl hover:bg-red-700 hover:scale-105 transition-all"
              >
                DISCONNECT
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default ChatView;
