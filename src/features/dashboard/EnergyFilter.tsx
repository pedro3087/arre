import { useRef } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { Zap, Battery, BatteryCharging, BatteryFull } from 'lucide-react';
import styles from './EnergyFilter.module.css';

interface EnergyFilterProps {
  selected: 'all' | 'low' | 'neutral' | 'high';
  onSelect: (value: 'all' | 'low' | 'neutral' | 'high') => void;
}

export function EnergyFilter({ selected, onSelect }: EnergyFilterProps) {
  return (
    <div className={styles.filterBar}>
      <span className={styles.label}><Zap size={16} /> Filter by Energy:</span>
      
      <div className={styles.pills}>
        <FilterPill 
          active={selected === 'low'} 
          onClick={() => onSelect('low')} 
          color="low"
          label="Low Energy"
          icon={Battery}
        />
        <FilterPill 
          active={selected === 'neutral'} 
          onClick={() => onSelect('neutral')} 
          color="neutral"
          label="Neutral"
          icon={BatteryCharging}
        />
        <FilterPill 
          active={selected === 'high'} 
          onClick={() => onSelect('high')} 
          color="high"
          label="High Focus"
          icon={BatteryFull}
        />
        {(selected !== 'all') && (
           <button className={styles.clearButton} onClick={() => onSelect('all')}>Clear</button>
        )}
      </div>
     
      <button className={styles.filterSettings}>
         {/* Could implement other filters here */}
      </button>
    </div>
  );
}

function FilterPill({ active, onClick, color, label, icon: Icon }: any) {
  return (
    <motion.button 
      layout
      className={clsx(styles.pill, active && styles.active, styles[color])}
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
    >
      <div className={styles.dot} />
      <span className={styles.pillLabel}>{label}</span>
    </motion.button>
  );
}
