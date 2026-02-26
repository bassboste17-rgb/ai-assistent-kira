import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Compass, 
  Mountain, 
  Wine, 
  Camera, 
  Phone, 
  Instagram, 
  Facebook, 
  ChevronRight, 
  Menu, 
  X,
  Star,
  Calendar,
  Users
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DESTINATIONS = [
  {
    id: 1,
    title: 'Тбилиси',
    description: 'Сердце Грузии, где история встречается с современностью.',
    image: 'https://picsum.photos/seed/tbilisi/800/600',
    tag: 'Культура',
    coords: { x: '65%', y: '65%' }
  },
  {
    id: 2,
    title: 'Казбеги',
    description: 'Величественные горы и легендарная церковь Гергети.',
    image: 'https://picsum.photos/seed/kazbegi/800/600',
    tag: 'Природа',
    coords: { x: '62%', y: '40%' }
  },
  {
    id: 3,
    title: 'Кахетия',
    description: 'Родина вина и бесконечных виноградников Алазанской долины.',
    image: 'https://picsum.photos/seed/kakheti/800/600',
    tag: 'Вино',
    coords: { x: '80%', y: '70%' }
  },
  {
    id: 4,
    title: 'Сванетия',
    description: 'Край тысячи башен и вечных ледников.',
    image: 'https://picsum.photos/seed/svaneti/800/600',
    tag: 'Приключения',
    coords: { x: '25%', y: '35%' }
  },
  {
    id: 5,
    title: 'Батуми',
    description: 'Черноморское побережье, современные небоскребы и субтропики.',
    image: 'https://picsum.photos/seed/batumi/800/600',
    tag: 'Море',
    coords: { x: '10%', y: '75%' }
  }
];

const TOURS = [
  {
    title: 'Легенды Сванетии',
    duration: '7 дней',
    price: '$850',
    image: 'https://picsum.photos/seed/svaneti-tour/1000/1200',
    category: 'Экспедиция',
    description: 'Путешествие в край тысячи башен и вечных ледников.'
  },
  {
    title: 'Винный путь Кахетии',
    duration: '3 дня',
    price: '$320',
    image: 'https://picsum.photos/seed/wine-tour/1000/1200',
    category: 'Гастро-тур',
    description: 'Погружение в традиции виноделия и грузинского застолья.'
  },
  {
    title: 'Душа Тбилиси',
    duration: '4 дня',
    price: '$280',
    image: 'https://picsum.photos/seed/tbilisi-tour/1000/1200',
    category: 'Городской тур',
    description: 'История старого города в каждом камне и каждом дворике.'
  }
];

const FEATURES = [
  {
    icon: <Mountain className="w-6 h-6" />,
    title: 'Уникальные маршруты',
    description: 'Мы возим туда, где не ступала нога обычного туриста.'
  },
  {
    icon: <Wine className="w-6 h-6" />,
    title: 'Гастро-туры',
    description: 'Настоящее грузинское гостеприимство и лучшие вина.'
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: 'Индивидуальный подход',
    description: 'Каждое путешествие создается под ваши желания.'
  }
];

export default function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMapPoint, setActiveMapPoint] = useState<typeof DESTINATIONS[0] | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen font-sans selection:bg-orange-100 selection:text-orange-900">
      {/* Navigation */}
      <nav 
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 py-4",
          isScrolled ? "bg-white/80 backdrop-blur-lg shadow-sm py-3" : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div 
              initial={{ rotate: -10 }}
              animate={{ rotate: 0 }}
              className="bg-orange-600 text-white p-1.5 rounded-lg shadow-lg"
            >
              <Compass className="w-6 h-6" />
            </motion.div>
            <span className={cn(
              "text-2xl font-serif font-bold tracking-tighter",
              isScrolled ? "text-slate-900" : "text-white"
            )}>
              DAMQ <span className="text-orange-600">TRAVEL</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {['Главная', 'Туры', 'Карта', 'О нас', 'Контакты'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase()}`}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-orange-600",
                  isScrolled ? "text-slate-600" : "text-white/90"
                )}
              >
                {item}
              </a>
            ))}
            <button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-full text-sm font-semibold transition-all shadow-lg hover:shadow-orange-200 active:scale-95">
              Забронировать
            </button>
          </div>

          <button 
            className="md:hidden text-white"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className={cn("w-6 h-6", isScrolled ? "text-slate-900" : "text-white")} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-[60] bg-white p-8 flex flex-col"
          >
            <div className="flex justify-end">
              <button onClick={() => setMobileMenuOpen(false)}>
                <X className="w-8 h-8 text-slate-900" />
              </button>
            </div>
            <div className="flex flex-col gap-8 mt-12">
              {['Главная', 'Туры', 'Карта', 'О нас', 'Контакты'].map((item) => (
                <a 
                  key={item} 
                  href={`#${item.toLowerCase()}`} 
                  className="text-3xl font-serif font-bold text-slate-900"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
              <button className="bg-orange-600 text-white py-4 rounded-2xl text-lg font-bold mt-4">
                Забронировать тур
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden" id="главная">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://picsum.photos/seed/georgia-mountains/1920/1080" 
            alt="Georgia Landscape" 
            className="w-full h-full object-cover scale-105 animate-slow-zoom"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs font-bold uppercase tracking-[0.2em] mb-6">
              Добро пожаловать в Грузию
            </span>
            <h1 className="text-5xl md:text-8xl font-serif font-bold mb-8 leading-[1.1] text-balance">
              Откройте Душу <br /> <span className="italic text-orange-400">Кавказа</span> с DAMQ
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10 font-light leading-relaxed">
              Мы создаем не просто туры, а незабываемые истории. Почувствуйте настоящую Грузию: от заснеженных вершин до древних винных погребов.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="w-full sm:w-auto bg-white text-slate-900 px-10 py-4 rounded-full font-bold text-lg hover:bg-orange-600 hover:text-white transition-all shadow-2xl active:scale-95">
                Выбрать тур
              </button>
              <button className="w-full sm:w-auto bg-white/10 backdrop-blur-md border border-white/30 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition-all active:scale-95 flex items-center justify-center gap-2">
                Смотреть видео <Camera className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50 animate-bounce">
          <span className="text-[10px] uppercase tracking-widest font-bold">Листайте вниз</span>
          <div className="w-px h-12 bg-gradient-to-b from-white/50 to-transparent" />
        </div>
      </section>

      {/* Stats/Trust Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Довольных клиентов', value: '5000+' },
              { label: 'Уникальных маршрутов', value: '45' },
              { label: 'Лет опыта', value: '12' },
              { label: 'Рейтинг в Google', value: '4.9/5' },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-serif font-bold text-orange-600 mb-2">{stat.value}</div>
                <div className="text-xs uppercase tracking-wider text-slate-500 font-bold">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Map Section */}
      <section className="py-24 bg-slate-50 overflow-hidden" id="карта">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-orange-600 font-bold text-sm uppercase tracking-widest mb-4 block">Исследуйте Грузию</span>
            <h2 className="text-4xl md:text-6xl font-serif font-bold text-slate-900 mb-6">Ваш маршрут по <span className="italic text-slate-400">легендам</span></h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Нажмите на точки на карте, чтобы узнать больше о самых знаковых местах страны.</p>
          </div>

          <div className="relative aspect-[16/9] md:aspect-[21/9] bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden group">
            {/* Stylized Map Background */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <svg viewBox="0 0 1000 500" className="w-full h-full fill-slate-900">
                <path d="M150,350 L200,300 L300,320 L400,280 L500,300 L600,250 L750,280 L850,220 L900,250 L950,200 L950,450 L150,450 Z" />
              </svg>
            </div>

            {/* Map Points */}
            {DESTINATIONS.map((dest) => (
              <div 
                key={dest.id}
                className="absolute cursor-pointer z-20"
                style={{ left: dest.coords.x, top: dest.coords.y }}
                onMouseEnter={() => setActiveMapPoint(dest)}
                onMouseLeave={() => setActiveMapPoint(null)}
              >
                <motion.div 
                  animate={{ scale: activeMapPoint?.id === dest.id ? 1.5 : 1 }}
                  className="relative"
                >
                  <div className="w-4 h-4 bg-orange-600 rounded-full shadow-[0_0_20px_rgba(234,88,12,0.6)]" />
                  <div className="absolute inset-0 w-4 h-4 bg-orange-600 rounded-full animate-ping opacity-40" />
                </motion.div>

                <AnimatePresence>
                  {activeMapPoint?.id === dest.id && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: -10, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.9 }}
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-64 bg-white rounded-2xl shadow-2xl p-4 z-30 pointer-events-none"
                    >
                      <img src={dest.image} alt={dest.title} className="w-full h-32 object-cover rounded-xl mb-3" />
                      <h4 className="font-serif font-bold text-slate-900 text-lg mb-1">{dest.title}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">{dest.description}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-orange-600 tracking-widest">{dest.tag}</span>
                        <ChevronRight className="w-4 h-4 text-orange-600" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}

            {/* Map UI Overlay */}
            <div className="absolute top-8 left-8 bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-white/50 shadow-xl hidden md:block">
              <h3 className="font-serif font-bold text-xl mb-2">Где вы хотите побывать?</h3>
              <p className="text-sm text-slate-500 mb-4">Выберите регион для просмотра туров</p>
              <div className="space-y-2">
                {DESTINATIONS.map(d => (
                  <div key={d.id} className="flex items-center gap-3 text-sm font-medium text-slate-700 hover:text-orange-600 cursor-pointer transition-colors">
                    <div className="w-1.5 h-1.5 bg-orange-600 rounded-full" />
                    {d.title}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tour Packages Section - Minimalist Redesign */}
      <section className="py-32 bg-[#0a0a0a] text-white" id="туры">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-12">
            <div className="max-w-3xl">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex items-center gap-4 mb-6"
              >
                <div className="w-12 h-px bg-orange-600" />
                <span className="text-orange-600 font-bold text-sm uppercase tracking-[0.4em]">Наши предложения</span>
              </motion.div>
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-6xl md:text-8xl font-serif font-bold leading-[0.9] tracking-tighter"
              >
                Выбери свой <br /> <span className="text-orange-600">маршрут</span>
              </motion.h2>
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="md:text-right"
            >
              <p className="text-white/40 max-w-xs text-lg font-light leading-snug mb-8">
                Только проверенные гиды и эксклюзивные локации.
              </p>
              <button className="text-white font-bold text-sm uppercase tracking-widest border-b-2 border-orange-600 pb-2 hover:text-orange-600 transition-colors">
                Все туры (12)
              </button>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10 border border-white/10 rounded-[3rem] overflow-hidden">
            {TOURS.map((tour, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="group relative bg-[#0a0a0a] p-10 flex flex-col min-h-[600px] border-r border-white/10 last:border-r-0 overflow-hidden"
              >
                {/* Background Image on Hover - Now more prominent */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-60 transition-all duration-700 pointer-events-none scale-110 group-hover:scale-100">
                  <img src={tour.image} alt="" className="w-full h-full object-cover transition-all duration-1000" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/20 to-transparent" />
                </div>

                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-12">
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-orange-600 bg-orange-600/10 px-3 py-1 rounded-full">
                      {tour.category}
                    </span>
                  </div>

                  <h3 className="text-4xl font-serif font-bold mb-6 leading-tight group-hover:text-orange-400 transition-colors duration-500">
                    {tour.title}
                  </h3>
                  
                  <p className="text-white/40 text-sm leading-relaxed mb-auto group-hover:text-white transition-colors duration-500">
                    {tour.description}
                  </p>

                  <div className="mt-12 pt-12 border-t border-white/10 flex items-end justify-between">
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Длительность</div>
                      <div className="text-xl font-bold">{tour.duration}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Стоимость</div>
                      <div className="text-4xl font-serif italic text-orange-600">{tour.price}</div>
                    </div>
                  </div>

                  <button className="mt-10 w-full py-5 bg-white text-black font-bold text-xs uppercase tracking-[0.2em] rounded-2xl opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                    Забронировать
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Immersive Gallery */}
      <section className="py-24 bg-[#fdfcfb]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-orange-600 font-bold text-sm uppercase tracking-widest mb-4 block">Галерея</span>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900">Мгновения, которые <span className="italic text-slate-400">остаются навсегда</span></h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 h-[600px] md:h-[800px]">
            <div className="col-span-2 row-span-2 rounded-[32px] overflow-hidden relative group">
              <img src="https://picsum.photos/seed/geo1/1200/1200" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
            </div>
            <div className="rounded-[32px] overflow-hidden relative group">
              <img src="https://picsum.photos/seed/geo2/600/600" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
            </div>
            <div className="rounded-[32px] overflow-hidden relative group">
              <img src="https://picsum.photos/seed/geo3/600/600" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
            </div>
            <div className="col-span-2 rounded-[32px] overflow-hidden relative group">
              <img src="https://picsum.photos/seed/geo4/1200/600" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-slate-900 overflow-hidden relative" id="о нас">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-500 to-transparent blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-orange-500 font-bold text-sm uppercase tracking-widest mb-4 block">Почему мы?</span>
              <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-8 leading-tight">
                Ваше идеальное <br /> приключение начинается <br /> <span className="italic text-orange-400">здесь</span>
              </h2>
              <p className="text-slate-400 text-lg mb-12 font-light leading-relaxed">
                DAMQ — это не просто агентство. Мы команда влюбленных в свою страну профессионалов, которые знают каждый уголок Грузии. Мы заботимся о каждой детали вашего отдыха.
              </p>
              
              <div className="space-y-8">
                {FEATURES.map((feature, i) => (
                  <div key={i} className="flex gap-6">
                    <div className="flex-shrink-0 w-12 h-12 bg-orange-600/20 text-orange-500 rounded-2xl flex items-center justify-center">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white mb-2">{feature.title}</h4>
                      <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-[40px] overflow-hidden rotate-3 shadow-2xl">
                <img 
                  src="https://picsum.photos/seed/georgia-culture/1000/1000" 
                  alt="Culture" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-10 -left-10 bg-orange-600 p-8 rounded-[32px] shadow-2xl max-w-[240px] -rotate-6 hidden md:block">
                <div className="flex items-center gap-1 mb-2">
                  {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-white text-white" />)}
                </div>
                <p className="text-white font-bold text-lg mb-1">"Лучший опыт в моей жизни!"</p>
                <p className="text-white/70 text-sm">— Анна, Москва</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-orange-600 rounded-[48px] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
               <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
               <div className="absolute bottom-0 left-0 w-64 h-64 bg-black rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            </div>
            
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-8">
                Готовы влюбиться в Грузию?
              </h2>
              <p className="text-white/80 text-lg mb-12 font-light">
                Оставьте заявку сегодня, и мы подберем для вас идеальный маршрут со скидкой 10% на первое бронирование.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <input 
                  type="text" 
                  placeholder="Ваш номер телефона" 
                  className="w-full sm:w-80 bg-white/10 border border-white/30 rounded-full px-8 py-4 text-white placeholder:text-white/50 focus:outline-none focus:bg-white/20 transition-all"
                />
                <button className="w-full sm:w-auto bg-white text-orange-600 px-10 py-4 rounded-full font-bold text-lg hover:shadow-xl active:scale-95 transition-all">
                  Хочу поехать
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-white pt-24 pb-12" id="контакты">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
            <div className="col-span-1 lg:col-span-1">
              <div className="flex items-center gap-2 mb-8">
                <div className="bg-orange-600 text-white p-1.5 rounded-lg">
                  <Compass className="w-6 h-6" />
                </div>
                <span className="text-2xl font-serif font-bold tracking-tighter">
                  DAMQ <span className="text-orange-600">TRAVEL</span>
                </span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed mb-8">
                Ваш надежный проводник по самым красивым и загадочным местам Грузии. Мы открываем двери в мир настоящих приключений.
              </p>
              <div className="flex items-center gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-orange-600 transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-orange-600 transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-8">Компания</h4>
              <ul className="space-y-4 text-slate-500 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">О нас</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Наши гиды</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Отзывы</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Блог</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-8">Услуги</h4>
              <ul className="space-y-4 text-slate-500 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Групповые туры</a></li>
                <li><a href="#" className="hover:text-white transition-colors">VIP туры</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Трансфер</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Аренда авто</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-8">Контакты</h4>
              <ul className="space-y-4 text-slate-500 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-orange-600 flex-shrink-0" />
                  <span>Тбилиси, ул. Шота Руставели 12, Грузия</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-orange-600 flex-shrink-0" />
                  <span>+995 555 123 456</span>
                </li>
                <li className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-orange-600 flex-shrink-0" />
                  <span>Пн-Вс: 09:00 - 20:00</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-12 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-600 text-xs">
            <p>© 2026 DAMQ TRAVEL. Все права защищены.</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-white">Политика конфиденциальности</a>
              <a href="#" className="hover:text-white">Условия использования</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom Animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slow-zoom {
          0% { transform: scale(1); }
          100% { transform: scale(1.1); }
        }
        .animate-slow-zoom {
          animation: slow-zoom 20s ease-in-out infinite alternate;
        }
      `}} />
    </div>
  );
}
