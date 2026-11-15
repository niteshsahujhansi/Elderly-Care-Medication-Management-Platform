'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Smile,
  Heart,
  Activity,
  Flame,
  Droplets,
  Laugh,
  Lightbulb,
  Newspaper,
  DollarSign,
  Briefcase,
  Users2,
  CalendarCheck,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  Star,
  MessageCircle,
  RefreshCw,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useActiveProfile } from '../../context/ActiveProfileContext';

interface MoodReaction {
  emoji: string;
  label: string;
  hiLabel: string;
  responseEn: string;
  responseHi: string;
}

const MOODS: MoodReaction[] = [
  {
    emoji: '🌟',
    label: 'Fantastic',
    hiLabel: 'शानदार',
    responseEn: 'Incredible energy! Taking your morning walk and celebrating this bright day with loved ones.',
    responseHi: 'अद्भुत ऊर्जा! आज का दिन बहुत मंगलमय है। सुबह की ताज़ा हवा और सैर का आनंद लें।',
  },
  {
    emoji: '😊',
    label: 'Peaceful',
    hiLabel: 'प्रसन्न व शांत',
    responseEn: 'A calm heart is the best medicine. Remember to stay hydrated and take medicines on time.',
    responseHi: 'शांत मन ही सर्वोत्तम स्वास्थ्य है। समय पर पानी और दवाइयाँ लेना न भूलें।',
  },
  {
    emoji: '😐',
    label: 'Just Okay',
    hiLabel: 'ठीक-ठाक',
    responseEn: 'Every day brings a fresh rhythm. How about reading today’s joke or sipping warm herbal tea?',
    responseHi: 'हर दिन एक नया अवसर है। आज का चुटकुला पढ़ें या हल्की गुनगुनी चाय का आनंद लें।',
  },
  {
    emoji: '🥱',
    label: 'A Bit Tired',
    hiLabel: 'थोड़ी थकान',
    responseEn: 'Rest is golden for longevity. Take an easy afternoon nap and stay comfortable.',
    responseHi: 'आराम करना स्वास्थ्य के लिए बहुत आवश्यक है। दोपहर में थोड़ी देर विश्राम करें।',
  },
  {
    emoji: '😟',
    label: 'Need Support',
    hiLabel: 'चिंता या उदासी',
    responseEn: 'You are never alone. Sarah and Elena are in your Care Circle—feel free to give them a quick call.',
    responseHi: 'आप अकेले नहीं हैं। आपकी बेटी सारा और केयर सर्कल हमेशा आपके साथ हैं। उनसे बात करें।',
  },
];

export function AiCompanionSection() {
  const { t, language } = useLanguage();
  const { activeProfile } = useActiveProfile();

  const seniorName = activeProfile?.name || 'Grandpa Robert';
  const storageKey = `carecircle_companion_${activeProfile?.id || 'demo'}_${new Date().toISOString().slice(0, 10)}`;

  // State
  const [selectedMood, setSelectedMood] = useState<MoodReaction | null>(null);
  const [walkDone, setWalkDone] = useState(false);
  const [yogaDone, setYogaDone] = useState(false);
  const [waterGlasses, setWaterGlasses] = useState(5);
  const [activeTab, setActiveTab] = useState<'jokes' | 'quote' | 'health' | 'outing' | 'finance' | 'work' | 'connect'>('quote');
  const [callRatings, setCallRatings] = useState<Record<string, string>>({
    'Sarah (Daughter)': 'loved',
    'Nurse Elena': 'good',
  });

  // Load from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.selectedMoodEmoji) {
          const m = MOODS.find((item) => item.emoji === parsed.selectedMoodEmoji);
          if (m) setSelectedMood(m);
        }
        if (parsed.walkDone !== undefined) setWalkDone(parsed.walkDone);
        if (parsed.yogaDone !== undefined) setYogaDone(parsed.yogaDone);
        if (parsed.waterGlasses !== undefined) setWaterGlasses(parsed.waterGlasses);
        if (parsed.callRatings) setCallRatings(parsed.callRatings);
      } else {
        // default initial mood
        setSelectedMood(MOODS[1]);
      }
    } catch {
      // ignore
    }
  }, [storageKey]);

  // Save to local storage
  const saveState = (updates: any) => {
    try {
      const current = localStorage.getItem(storageKey);
      const data = current ? JSON.parse(current) : {};
      const next = { ...data, ...updates };
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const handleSelectMood = (mood: MoodReaction) => {
    setSelectedMood(mood);
    saveState({ selectedMoodEmoji: mood.emoji });
  };

  const handleToggleWalk = () => {
    const next = !walkDone;
    setWalkDone(next);
    saveState({ walkDone: next });
  };

  const handleToggleYoga = () => {
    const next = !yogaDone;
    setYogaDone(next);
    saveState({ yogaDone: next });
  };

  const handleWater = (delta: number) => {
    const next = Math.max(0, Math.min(12, waterGlasses + delta));
    setWaterGlasses(next);
    saveState({ waterGlasses: next });
  };

  const handleRateCall = (person: string, rating: string) => {
    const next = { ...callRatings, [person]: rating };
    setCallRatings(next);
    saveState({ callRatings: next });
  };

  return (
    <div className="space-y-6">
      {/* Hero AI Banner */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-violet-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-purple-900/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner animate-bounce">
              ✨
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full text-purple-100">
                {language === 'hi' ? 'दैनिक एआई साथी' : 'AI Senior Wellness Companion'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
                {language === 'hi' ? `नमस्ते, ${seniorName} जी!` : `Good Day, ${seniorName}!`}
              </h2>
              <p className="text-xs text-purple-100 mt-1 max-w-xl">
                {language === 'hi'
                  ? 'आपका दैनिक स्वास्थ्य, प्रेरक विचार, नियमित व्यायाम और मनपसंद गतिविधियाँ।'
                  : 'Your daily emotional check-in, healthcare exercise tracker, and personalized AI wellness digest.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: HOW ARE YOU FEELING TODAY? */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Smile className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-black text-gray-900">
            {language === 'hi' ? 'आज आप कैसा महसूस कर रहे हैं?' : 'How are you feeling today?'}
          </h3>
        </div>

        {/* Emojis row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {MOODS.map((mood) => {
            const isSelected = selectedMood?.emoji === mood.emoji;
            return (
              <button
                key={mood.emoji}
                type="button"
                onClick={() => handleSelectMood(mood)}
                className={`p-4 rounded-2xl border-2 transition text-center flex flex-col items-center gap-2 ${
                  isSelected
                    ? 'border-purple-600 bg-purple-50/80 shadow-md scale-105'
                    : 'border-gray-200 hover:border-purple-300 bg-white hover:bg-purple-50/20'
                }`}
              >
                <span className="text-3xl">{mood.emoji}</span>
                <span className="text-xs font-bold text-gray-800">
                  {language === 'hi' ? mood.hiLabel : mood.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* AI Personalized Response Box */}
        {selectedMood && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-purple-900">
                {language === 'hi' ? 'एआई साथी का संदेश:' : 'AI Companion Response:'}
              </p>
              <p className="text-sm text-gray-800 mt-0.5 font-medium">
                {language === 'hi' ? selectedMood.responseHi : selectedMood.responseEn}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: REGULAR EXERCISES TRACKER (Satisfies Healthcare Routines) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-lg font-black text-gray-900">
                {language === 'hi' ? 'नियमित व्यायाम और स्वास्थ्य दिनचर्या' : 'Regular Healthcare Exercise & Wellness'}
              </h3>
              <p className="text-xs text-gray-500">
                {language === 'hi' ? 'दैनिक हल्के व्यायाम और जलयोजन' : 'Daily geriatric exercise & hydration routine'}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
            {walkDone && yogaDone ? '100% Completed' : 'In Progress'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Exercise 1: Morning Walk */}
          <div
            onClick={handleToggleWalk}
            className={`cursor-pointer p-4 rounded-2xl border-2 transition flex items-center justify-between ${
              walkDone
                ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                : 'bg-white border-gray-200 hover:border-emerald-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${walkDone ? 'bg-emerald-600 text-white' : 'bg-gray-100'}`}>
                🚶‍♂️
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-gray-900">
                  {language === 'hi' ? '20-मिनट सुबह की सैर' : '20-Min Morning Walk'}
                </h4>
                <p className="text-xs text-gray-500">
                  {walkDone ? (language === 'hi' ? '✅ पूर्ण' : '✅ Completed') : (language === 'hi' ? 'क्लिक करके पूर्ण करें' : 'Tap to mark done')}
                </p>
              </div>
            </div>
            {walkDone && <CheckCircle2 className="w-6 h-6 text-emerald-600" />}
          </div>

          {/* Exercise 2: Light Chair Yoga */}
          <div
            onClick={handleToggleYoga}
            className={`cursor-pointer p-4 rounded-2xl border-2 transition flex items-center justify-between ${
              yogaDone
                ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                : 'bg-white border-gray-200 hover:border-emerald-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${yogaDone ? 'bg-emerald-600 text-white' : 'bg-gray-100'}`}>
                🧘
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-gray-900">
                  {language === 'hi' ? 'चेयर योग और प्राणायाम' : 'Light Chair Yoga & Breathing'}
                </h4>
                <p className="text-xs text-gray-500">
                  {yogaDone ? (language === 'hi' ? '✅ पूर्ण' : '✅ Completed') : (language === 'hi' ? 'क्लिक करके पूर्ण करें' : 'Tap to mark done')}
                </p>
              </div>
            </div>
            {yogaDone && <CheckCircle2 className="w-6 h-6 text-emerald-600" />}
          </div>

          {/* Exercise 3: Hydration */}
          <div className="p-4 rounded-2xl border-2 border-blue-200 bg-blue-50/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                <Droplets className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-gray-900">
                  {language === 'hi' ? 'जल सेवन (पानी)' : 'Daily Hydration'}
                </h4>
                <p className="text-xs text-blue-700 font-bold">
                  {waterGlasses} / 8 {language === 'hi' ? 'गिलास पिए' : 'glasses'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleWater(-1)}
                className="w-8 h-8 rounded-lg bg-white border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 flex items-center justify-center"
              >
                -
              </button>
              <button
                type="button"
                onClick={() => handleWater(1)}
                className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 flex items-center justify-center shadow-sm"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: DAILY MOOD REFRESHMENTS & AI ADVICE */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-black text-gray-900">
              {language === 'hi' ? 'दैनिक ताजगी और प्रेरक सुझाव' : 'Daily Mood Refreshments & AI Digest'}
            </h3>
          </div>
          <span className="text-xs text-gray-400 font-mono">Offline-ready fallback</span>
        </div>

        {/* Tab pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'quote', label: '💡 Motivation', hi: '💡 प्रेरक विचार' },
            { id: 'jokes', label: '😄 Daily Joke', hi: '😄 आज का चुटकुला' },
            { id: 'health', label: '🍎 Health Tip', hi: '🍎 स्वास्थ्य सुझाव' },
            { id: 'outing', label: '🌳 Group Outing', hi: '🌳 समूह भ्रमण' },
            { id: 'finance', label: '💰 Financial Tip', hi: '💰 पेंशन व वित्तीय सलाह' },
            { id: 'work', label: '💼 Light Volunteering', hi: '💼 स्वैच्छिक कार्य' },
            { id: 'connect', label: '🤝 Age-Group Club', hi: '🤝 हमउम्र मित्र क्लब' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {language === 'hi' ? tab.hi : tab.label}
            </button>
          ))}
        </div>

        {/* Tab contents */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-gray-200">
          {activeTab === 'quote' && (
            <div className="space-y-2">
              <span className="text-xs font-black text-purple-700 uppercase tracking-widest">
                {language === 'hi' ? 'आज का सुविचार' : 'Quote of the Day'}
              </span>
              <p className="text-base font-bold text-gray-900 italic">
                {language === 'hi'
                  ? '“उम्र सिर्फ एक संख्या है; सच्चा जीवन आपके मन के उत्साह और स्नेह में बसता है।”'
                  : '“You don’t stop laughing because you grow old. You grow old because you stop laughing.” — George Bernard Shaw'}
              </p>
              <p className="text-xs text-gray-500">
                {language === 'hi' ? 'हर दिन एक सुंदर उपहार है।' : 'Take every morning as a fresh celebration of life.'}
              </p>
            </div>
          )}

          {activeTab === 'jokes' && (
            <div className="space-y-2">
              <span className="text-xs font-black text-amber-700 uppercase tracking-widest">
                {language === 'hi' ? 'हँसी का फव्वारा' : 'Smile of the Day'}
              </span>
              <p className="text-sm font-bold text-gray-900">
                {language === 'hi'
                  ? 'डॉक्टर: दादाजी, चश्मा लगाने के बाद आप कैसा महसूस कर रहे हैं?\nदादाजी: डॉक्टर साहब, सब कुछ बहुत साफ़ दिख रहा है... सिवाय मेरी पेंशन के कागज़ों के!'
                  : 'Doctor: “Robert, how does the new reading prescription feel?”\nGrandpa: “Wonderful doctor! Now I can clearly read all the pill bottles I’m supposed to take!” 😄'}
              </p>
              <p className="text-xs text-amber-700 font-semibold">
                {language === 'hi' ? 'मुस्कुराइए, हँसी सबसे अच्छी दवा है!' : 'A good laugh reduces blood pressure and lifts heart health!'}
              </p>
            </div>
          )}

          {activeTab === 'health' && (
            <div className="space-y-2">
              <span className="text-xs font-black text-emerald-700 uppercase tracking-widest">
                {language === 'hi' ? 'डॉक्टर का सुझाव' : 'Geriatric Clinical Advice'}
              </span>
              <p className="text-sm font-bold text-gray-900">
                {language === 'hi'
                  ? 'सुबह की हल्की धूप में 15 मिनट बैठें। यह प्राकृतिक विटामिन-D हड्डियों और जोड़ों को मज़बूती देता है।'
                  : 'Enjoy 15 minutes of gentle morning sunlight. Natural Vitamin D supports bone density, joint mobility, and melatonin regulation for peaceful sleep.'}
              </p>
              <p className="text-xs text-gray-500">
                {language === 'hi' ? 'डॉ. सारा एडम्स द्वारा अनुशंसित' : 'Curated by Dr. Sarah Adams (City Memorial)'}
              </p>
            </div>
          )}

          {activeTab === 'outing' && (
            <div className="space-y-2">
              <span className="text-xs font-black text-blue-700 uppercase tracking-widest">
                {language === 'hi' ? 'सामुदायिक भ्रमण' : 'Community Outing & Nature Walk'}
              </span>
              <h4 className="text-base font-extrabold text-gray-900">
                {language === 'hi' ? 'रविवार सुबह की शांति वॉक • लोधी गार्डन' : 'Sunday Gentle Morning Nature Walk • Botanical Garden'}
              </h4>
              <p className="text-xs text-gray-600">
                {language === 'hi'
                  ? 'इस रविवार सुबह 7:30 बजे हमउम्र साथियों के साथ चाय और खुली हवा का आनंद लें। व्हीलचेयर सुलभ पथ उपलब्ध हैं।'
                  : 'Join fellow seniors this Sunday at 7:30 AM for a gentle walk, birdwatching, and morning herbal tea. Wheelchair accessible pathways.'}
              </p>
            </div>
          )}

          {activeTab === 'finance' && (
            <div className="space-y-2">
              <span className="text-xs font-black text-green-700 uppercase tracking-widest">
                {language === 'hi' ? 'वित्तीय सुरक्षा' : 'Senior Pension & Banking Protection'}
              </span>
              <h4 className="text-base font-extrabold text-gray-900">
                {language === 'hi' ? 'वरिष्ठ नागरिक एफडी दरें (8.15% तक)' : 'Senior Citizen Term Deposits (Up to 8.15% APY)'}
              </h4>
              <p className="text-xs text-gray-600">
                {language === 'hi'
                  ? 'सुरक्षा टिप: कभी भी फोन पर बैंक ओटीपी या पिन साझा न करें। डिजिटल जीवन प्रमाण पत्र निकटतम डाकघर से आसानी से बनवाएं।'
                  : 'Safety Reminder: Never share bank OTP or PIN over phone calls. Your Digital Life Certificate (Jeevan Pramaan) can be verified from home.'}
              </p>
            </div>
          )}

          {activeTab === 'work' && (
            <div className="space-y-2">
              <span className="text-xs font-black text-indigo-700 uppercase tracking-widest">
                {language === 'hi' ? 'सक्रिय समाज सेवा' : 'Engaging Senior Volunteering'}
              </span>
              <h4 className="text-base font-extrabold text-gray-900">
                {language === 'hi' ? 'बच्चों को कहानी सुनाना और पुस्तकालय सहायता' : 'Community Storytelling & Library Reading Mentor'}
              </h4>
              <p className="text-xs text-gray-600">
                {language === 'hi'
                  ? 'स्थानीय पुस्तकालय में सप्ताह में 2 घंटे बच्चों को अपनी पसंदीदा कहानियाँ सुनाएँ और ज्ञान साझा करें।'
                  : 'Share your wisdom and stories with young readers 2 hours a week at the local community library.'}
              </p>
            </div>
          )}

          {activeTab === 'connect' && (
            <div className="space-y-2">
              <span className="text-xs font-black text-rose-700 uppercase tracking-widest">
                {language === 'hi' ? 'हमउम्र मित्र' : 'Golden Age Peer Social Club'}
              </span>
              <h4 className="text-base font-extrabold text-gray-900">
                {language === 'hi' ? '65+ वरिष्ठ नागरिक चर्चा मंडल' : 'Active 65+ Circle: Chess, Gardening & Music'}
              </h4>
              <p className="text-xs text-gray-600">
                {language === 'hi'
                  ? 'अपने पड़ोस के 18 अन्य वरिष्ठ नागरिकों से जुड़ें। हर मंगलवार शाम 5 बजे ऑनलाइन/ऑफ़लाइन चौपाल।'
                  : 'Connect with 18 nearby peers sharing passions for gardening, classic music, and chess.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 4: DAILY CALL & MEETING RATING (Likes / Dislikes) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-indigo-600" />
          <div>
            <h3 className="text-lg font-black text-gray-900">
              {language === 'hi' ? 'दैनिक बातचीत और मुलाक़ात अनुभव' : 'Daily Call & Meeting Experience'}
            </h3>
            <p className="text-xs text-gray-500">
              {language === 'hi' ? 'आज जिनसे बात हुई, उनका अनुभव कैसा रहा?' : 'How was your conversation with family & caretakers today?'}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { name: 'Sarah (Daughter)', role: 'Family Caregiver', defaultStatus: 'Loved it' },
            { name: 'Nurse Elena', role: 'Visiting Nurse', defaultStatus: 'Helpful' },
            { name: 'Neighbor Tom', role: 'Supportive Friend', defaultStatus: 'Friendly' },
          ].map((person) => {
            const currentRating = callRatings[person.name] || 'loved';
            return (
              <div
                key={person.name}
                className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <h4 className="text-sm font-extrabold text-gray-900">{person.name}</h4>
                  <p className="text-xs text-gray-500">{person.role}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleRateCall(person.name, 'loved')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                      currentRating === 'loved'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-rose-50'
                    }`}
                  >
                    ❤️ {language === 'hi' ? 'बहुत अच्छा लगा' : 'Loved it'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRateCall(person.name, 'good')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                      currentRating === 'good'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-emerald-50'
                    }`}
                  >
                    👍 {language === 'hi' ? 'संतोषजनक' : 'Good'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRateCall(person.name, 'dislike')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                      currentRating === 'dislike'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-amber-50'
                    }`}
                  >
                    😐 {language === 'hi' ? 'तनावपूर्ण' : 'Tiring'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 5: UPCOMING INNOVATION ROADMAP */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-400/30">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <span className="text-[11px] font-mono tracking-wider uppercase text-purple-300 font-bold">
                {language === 'hi' ? 'भविष्य की तकनीक' : 'Future Innovation Roadmap'}
              </span>
              <h3 className="text-xl font-black tracking-tight text-white mt-0.5">
                {language === 'hi' ? 'आगामी सुविधाएँ (Upcoming Features)' : 'Upcoming AI & Safety Features'}
              </h3>
            </div>
          </div>
          <span className="text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 px-3 py-1 rounded-full w-fit">
            🚀 In Active Development
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Upcoming 1: AI Voice Companion for Mental Health */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center text-xl">
                🎙️
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-500/30 text-purple-200 px-2.5 py-0.5 rounded-full border border-purple-400/30">
                Mental Health AI
              </span>
            </div>
            <div>
              <h4 className="text-base font-extrabold text-white">
                {language === 'hi' ? 'एआई वॉयस साथी (बातचीत और मानसिक स्वास्थ्य)' : 'AI Companion To Just Talk (Mental Health & Loneliness)'}
              </h4>
              <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                {language === 'hi'
                  ? 'अकेलेपन को दूर करने के लिए प्राकृतिक आवाज़ में 24/7 बातचीत करने वाला एआई साथी। यह वरिष्ठजनों की भावनाएँ समझता है, पुरानी यादें साझा करता है और अवसाद का शीघ्र पता लगाता है।'
                  : 'An empathetic, voice-first AI companion for seniors to converse, reminisce, and reduce loneliness with active cognitive engagement and sentiment-based mental wellness monitoring.'}
              </p>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-purple-300 font-medium">
              <span>Status: Natural Voice LLM Pilot</span>
              <span className="font-mono">v2.1 Coming Soon</span>
            </div>
          </div>

          {/* Upcoming 2: Geofencing Safe Zone Perimeter Alert */}
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/50 transition space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-xl">
                📍
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/30 text-emerald-200 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                Safety & Wandering Alert
              </span>
            </div>
            <div>
              <h4 className="text-base font-extrabold text-white">
                {language === 'hi' ? 'स्मार्ट जियो-फेंसिंग (तय क्षेत्र से बाहर जाने पर अलर्ट)' : 'Alert If Person Goes Beyond Fixed Area (Geo-Fencing)'}
              </h4>
              <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                {language === 'hi'
                  ? 'यदि डिमेंशिया या भूलने की बीमारी से पीड़ित बुज़ुर्ग अपने तय सुरक्षित दायरे (घर या पार्क) से बाहर निकलते हैं, तो तुरंत परिवार और केयरगिवर्स को जीपीएस अलर्ट भेजा जाता है।'
                  : 'Proactive GPS & Wi-Fi perimeter alerts instantly dispatched to family members if an elderly individual with dementia or cognitive impairment wanders beyond their designated safe boundary.'}
              </p>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-emerald-300 font-medium">
              <span>Status: Safe-Zone Engine Testing</span>
              <span className="font-mono">v2.2 Coming Soon</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
