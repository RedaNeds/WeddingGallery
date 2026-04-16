'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
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
    } catch (err: any) {
      console.error('Error fetching photos:', JSON.stringify(err, null, 2) || err);
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
          <div className={styles.loading}>
            <Loader2 className="spinner" size={40} color="var(--gold)" />
            <p>Chargement de vos précieux souvenirs...</p>
          </div>
        ) : (
          <div className={styles.masonry}>
            <AnimatePresence>
              {photos.map((photo) => (
                <motion.div
                  key={photo.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={styles.item}
                >
                  <img src={photo.url} alt="Wedding moment" className={styles.image} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {!loading && photos.length === 0 && (
          <div className={styles.empty}>
            <p>La galerie est encore vide.</p>
            <p className={styles.subEmpty}>Soyez la première personne à immortaliser un instant !</p>
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        <div className="gold-line"></div>
        <div className={styles.footerContent}>
          <p>© 2026 Sarah & Marc</p>
          <a href="/admin" className={styles.adminLink}>Espace Privé</a>
        </div>
      </footer>
    </div>
  );
}
