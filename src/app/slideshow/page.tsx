'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import styles from './slideshow.module.css';

interface Photo {
  id: string;
  url: string;
}

export default function SlideshowPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchPhotos();
    
    // Subscribe to new photos
    const channel = supabase
      .channel('slideshow-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'photos' },
        (payload) => {
          setPhotos((current) => [payload.new as Photo, ...current]);
          setCurrentIndex(0); // Show newest photo immediately
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (photos.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length);
    }, 5000); // 5 seconds per photo

    return () => clearInterval(interval);
  }, [photos]);

  const fetchPhotos = async () => {
    const { data } = await supabase
      .from('photos')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setPhotos(data);
  };

  if (photos.length === 0) {
    return (
      <div className={styles.empty}>
        <h1>Attente de la première photo...</h1>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <AnimatePresence mode='wait'>
        <motion.img
          key={photos[currentIndex].id}
          src={photos[currentIndex].url}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1.5 }}
          className={styles.image}
        />
      </AnimatePresence>
      <div className={styles.overlay}>
        <div className={styles.footer}>
          <h3>Reda & Rania — 16.05.2026</h3>
        </div>
      </div>
    </div>
  );
}
