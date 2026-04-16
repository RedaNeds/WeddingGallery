'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import UploadButton from '@/components/UploadButton';
import styles from './gallery.module.css';

interface Photo {
  id: string;
  url: string;
  guest_name?: string;
  created_at: string;
}

export default function GalleryPage() {
  const router = useRouter();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const access = localStorage.getItem('wedding_access');
    if (!access) {
      router.push('/');
      return;
    }
    fetchPhotos();

    // Subscribe to new photos
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'photos',
        },
        (payload) => {
          setPhotos((current) => [payload.new as Photo, ...current]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (err) {
      console.error('Error fetching photos:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <h1 className={styles.logo}>S & M</h1>
        <div className="gold-line"></div>
        <p className={styles.tagline}>Mouvements, Éclats, Souvenirs</p>
      </header>

      <div className={styles.stickyAction}>
        <UploadButton onUploadSuccess={() => {}} />
      </div>

      <main className={styles.container}>
        {loading ? (
          <div className={styles.loading}>Chargement de la galerie...</div>
        ) : (
          <div className={styles.masonry}>
            <AnimatePresence>
              {photos.map((photo) => (
                <motion.div
                  key={photo.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={styles.item}
                >
                  <img src={photo.url} alt="Wedding moment" className={styles.image} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {photos.length === 0 && !loading && (
        <div className={styles.empty}>
          <p>Pas encore de photos. Soyez le premier à en partager une !</p>
        </div>
      )}
    </div>
  );
}
