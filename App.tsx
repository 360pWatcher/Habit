import React, { useState, useEffect } from 'react';
import { 
  Home, BarChart2, Plus, Check, Trash2, 
  Moon, Sun, Activity, Book, Coffee, Droplet, Dumbbell, Headphones, 
  Heart, Zap, Briefcase, Code, Music, Smile, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addDays, isSameDay, startOfWeek, eachDayOfInterval } from 'date-fns';
import { Habit, HabitLogs, AppView, Frequency } from './types';
import { getStoredHabits, saveHabits, getStoredLogs, saveLogs, calculateStats } from './services/storageService';
import { COLORS } from './constants';

// --- Icon Mapping Helper ---
const IconMap: { [key: string]: React.ElementType } = {
  activity: Activity, book: Book, coffee: Coffee, droplet: Droplet,
  dumbbell: Dumbbell, headphones: Headphones, heart: Heart, moon: Moon,
  sun: Sun, zap: Zap, briefcase: Briefcase, code: Code, music: Music,
  smile: Smile, star: Star
};

// --- Components ---

const TopAppBar = ({ title, action }: { title: string, action?: React.ReactNode }) => (
  <div className="pt-12 pb-4 px-6 bg-[#f0f4f8] sticky top-0 z-10 flex justify-between items-center">
    <h1 className="text-3xl font-normal text-slate-800 tracking-tight">{title}</h1>
    {action}
  </div>
);

const FAB = ({ onClick, icon: Icon }: { onClick: () => void, icon: React.ElementType }) => (
  <motion.button
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className="absolute bottom-24 right-6 w-14 h-14 bg-[#d3e3fd] text-[#041e49] rounded-2xl shadow-lg flex items-center justify-center hover:shadow-xl active:bg-[#c4d7f8] transition-colors z-20"
  >
    <Icon size={24} />
  </motion.button>
);

const BottomNav = ({ currentView, setView }: { currentView: AppView, setView: (v: AppView) => void }) => {
  const items = [
    { id: AppView.HOME, icon: Home, label: 'Habits' },
    { id: AppView.STATS, icon: BarChart2, label: 'Stats' },
  ];

  return (
    <div className="h-20 bg-[#f0f4f8] border-t border-slate-200 flex items-center justify-around px-2 pb-2 fixed bottom-0 w-full max-w-[480px]">
      {items.map((item) => {
        const isActive = currentView === item.id;
        return (
          <div key={item.id} onClick={() => setView(item.id)} className="flex flex-col items-center flex-1 cursor-pointer">
            <div className={`mb-1 px-5 py-1 rounded-full transition-all duration-300 ${isActive ? 'bg-[#c2e7ff]' : 'bg-transparent'}`}>
              <item.icon size={24} className={`transition-colors ${isActive ? 'text-[#001d35]' : 'text-slate-500'}`} />
            </div>
            <span className={`text-xs font-medium ${isActive ? 'text-[#001d35]' : 'text-slate-500'}`}>{item.label}</span>
          </div>
        );
      })}
    </div>
  );
};

const DateStrip = ({ selectedDate, onSelectDate }: { selectedDate: Date, onSelectDate: (d: Date) => void }) => {
  const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start, end: addDays(start, 6) });

  return (
    <div className="flex justify-between px-4 mb-4">
      {days.map((date, i) => {
        const isSelected = isSameDay(date, selectedDate);
        const isToday = isSameDay(date, new Date());
        return (
          <div 
            key={i} 
            onClick={() => onSelectDate(date)}
            className={`flex flex-col items-center justify-center w-12 h-16 rounded-2xl cursor-pointer transition-colors ${isSelected ? 'bg-[#00639b] text-white' : 'bg-white text-slate-500 border border-slate-100'}`}
          >
            <span className="text-xs font-medium uppercase">{format(date, 'EEE')}</span>
            <span className={`text-lg font-bold ${isSelected ? 'text-white' : isToday ? 'text-[#00639b]' : 'text-slate-700'}`}>
              {format(date, 'd')}
            </span>
          </div>
        );
      })}
    </div>
  );
};

interface HabitCardProps {
  habit: Habit;
  isCompleted: boolean;
  onToggle: () => void;
}

const HabitCard: React.FC<HabitCardProps> = ({ habit, isCompleted, onToggle }) => {
  const Icon = IconMap[habit.icon] || Star;
  
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mx-4 mb-3 p-4 rounded-[20px] flex items-center justify-between transition-colors duration-300 ${isCompleted ? 'bg-[#c2e7ff]/30' : 'bg-white'}`}
    >
      <div className="flex items-center gap-4">
        <div 
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: isCompleted ? '#c2e7ff' : `${habit.color}20` }}
        >
          <Icon size={24} style={{ color: isCompleted ? '#001d35' : habit.color }} />
        </div>
        <div>
          <h3 className={`font-medium text-lg ${isCompleted ? 'text-slate-500 line-through decoration-2 decoration-slate-300' : 'text-slate-800'}`}>{habit.name}</h3>
          {habit.description && <p className="text-xs text-slate-400">{habit.description}</p>}
        </div>
      </div>
      
      <motion.div 
        whileTap={{ scale: 0.8 }}
        onClick={onToggle}
        className={`w-8 h-8 rounded-xl flex items-center justify-center border-2 transition-all cursor-pointer ${isCompleted ? 'bg-[#00639b] border-[#00639b]' : 'border-slate-300 bg-transparent'}`}
      >
        {isCompleted && <Check size={18} className="text-white" strokeWidth={3} />}
      </motion.div>
    </motion.div>
  );
};

// --- Main App Logic ---

export default function App() {
  // State
  const [view, setView] = useState<AppView>(AppView.HOME);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLogs>({});
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // UI State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');

  // --- Effects ---

  useEffect(() => {
    setHabits(getStoredHabits());
    setLogs(getStoredLogs());
  }, []);

  useEffect(() => {
    saveHabits(habits);
  }, [habits]);

  useEffect(() => {
    saveLogs(logs);
  }, [logs]);

  // --- Handlers ---

  const toggleHabit = (habitId: string) => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    setLogs(prev => ({
      ...prev,
      [habitId]: {
        ...prev[habitId],
        [dateStr]: !prev[habitId]?.[dateStr]
      }
    }));
  };

  const deleteHabit = (habitId: string) => {
    if (confirm('Are you sure you want to delete this habit?')) {
      setHabits(prev => prev.filter(h => h.id !== habitId));
    }
  };

  const addNewHabit = (habitData: Partial<Habit>) => {
    const newHabit: Habit = {
      id: Date.now().toString(),
      name: habitData.name || 'New Habit',
      description: habitData.description || '',
      icon: habitData.icon || 'star',
      color: habitData.color || COLORS[Math.floor(Math.random() * COLORS.length)],
      frequency: habitData.frequency || Frequency.DAILY,
      createdAt: Date.now(),
    };
    setHabits(prev => [...prev, newHabit]);
    setIsModalOpen(false);
    setNewHabitName('');
  };

  // --- Views ---

  const HomeView = () => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    // Filter habits based on frequency (simplified logic)
    const todaysHabits = habits.filter(h => {
        if(h.frequency === Frequency.DAILY) return true;
        const day = selectedDate.getDay();
        if(h.frequency === Frequency.MON_FRI) return day >= 1 && day <= 5;
        if(h.frequency === Frequency.WEEKLY) return true; // Show weekly every day for simplicity in this demo
        return true;
    });

    return (
      <div className="pb-24 animate-fade-in">
        <DateStrip selectedDate={selectedDate} onSelectDate={setSelectedDate} />
        <div className="px-6 mb-4">
          <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Your Habits</h2>
        </div>
        
        {todaysHabits.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20 text-slate-400">
            <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4">
              <Moon size={32} />
            </div>
            <p>No habits scheduled for today.</p>
          </div>
        ) : (
          todaysHabits.map(habit => (
            <HabitCard 
              key={habit.id} 
              habit={habit} 
              isCompleted={!!logs[habit.id]?.[dateStr]} 
              onToggle={() => toggleHabit(habit.id)}
            />
          ))
        )}
      </div>
    );
  };

  const StatsView = () => (
    <div className="px-4 pb-24 overflow-y-auto h-full">
      <div className="grid grid-cols-2 gap-4 mt-2">
      {habits.map(habit => {
        const stats = calculateStats(habit, logs);
        const Icon = IconMap[habit.icon] || Star;
        return (
          <div key={habit.id} className="bg-white p-4 rounded-[24px] flex flex-col justify-between aspect-square">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-xl bg-[#f0f4f8] flex items-center justify-center text-slate-600">
                <Icon size={20} />
              </div>
              <div className="text-2xl font-bold text-slate-800">{stats.currentStreak} <span className="text-xs font-normal text-slate-400">streak</span></div>
            </div>
            <div>
              <h3 className="font-bold text-slate-700 leading-tight">{habit.name}</h3>
              <div className="mt-2 text-xs text-slate-400">Total: {stats.totalCompletions} times</div>
              {/* Simple progress bar simulation */}
              <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                <div 
                   className="h-full rounded-full" 
                   style={{ width: `${Math.min(stats.totalCompletions * 5, 100)}%`, backgroundColor: habit.color }} 
                />
              </div>
            </div>
            <button 
                onClick={() => deleteHabit(habit.id)}
                className="self-end mt-2 p-1 text-slate-300 hover:text-red-400 transition-colors"
            >
                <Trash2 size={14} />
            </button>
          </div>
        );
      })}
      </div>
      {habits.length === 0 && (
         <div className="mt-20 text-center text-slate-400">
            <BarChart2 className="mx-auto mb-4 opacity-50" size={48} />
            <p>Add habits to see your stats grow!</p>
         </div>
      )}
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden">
      <TopAppBar 
         title={view === AppView.HOME ? "Today" : "Progress"} 
         action={
            view === AppView.HOME && (
              <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-300">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
              </div>
            )
         }
      />

      <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
        <AnimatePresence mode="wait">
          {view === AppView.HOME && <motion.div key="home" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="h-full"><HomeView /></motion.div>}
          {view === AppView.STATS && <motion.div key="stats" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="h-full"><StatsView /></motion.div>}
        </AnimatePresence>
      </div>

      {view === AppView.HOME && (
        <FAB onClick={() => setIsModalOpen(true)} icon={Plus} />
      )}

      <BottomNav currentView={view} setView={setView} />

      {/* Add Habit Modal (Simulated Bottom Sheet) */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="absolute inset-0 bg-black/40 z-40 backdrop-blur-sm"
               onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-[#f0f4f8] rounded-t-[28px] p-6 z-50 shadow-2xl h-2/3 max-w-[480px] mx-auto"
            >
              <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-8" />
              <h2 className="text-2xl font-normal text-slate-800 mb-6">New Habit</h2>
              
              <div className="space-y-6">
                <div>
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Name</label>
                   <input 
                     autoFocus
                     value={newHabitName}
                     onChange={(e) => setNewHabitName(e.target.value)}
                     placeholder="e.g. Read 10 pages"
                     className="w-full bg-white p-4 rounded-xl text-lg outline-none border border-transparent focus:border-[#00639b]"
                   />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => addNewHabit({ name: newHabitName, frequency: Frequency.DAILY })}
                    className="bg-[#c2e7ff] text-[#001d35] p-4 rounded-xl font-medium"
                  >
                    Daily
                  </button>
                  <button 
                     onClick={() => addNewHabit({ name: newHabitName, frequency: Frequency.WEEKLY })}
                    className="bg-white text-slate-600 p-4 rounded-xl font-medium border border-slate-200"
                  >
                    Weekly
                  </button>
                </div>

                 <button 
                    onClick={() => addNewHabit({ name: newHabitName })}
                    disabled={!newHabitName}
                    className="w-full bg-[#00639b] text-white py-4 rounded-full font-medium text-lg mt-4 disabled:opacity-50"
                  >
                    Create Habit
                  </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}