'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trash2, ShieldCheck, LogOut, Download, ExternalLink, Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import styles from './admin.module.css';

interface Photo {
  id: string;
  url: string;
  storage_path: string;
  created_at: string;
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  // Constants - should be in env
  const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin2026';

  useEffect(() => {
    const auth = localStorage.getItem('wedding_admin_auth');
    if (auth === 'true') {
      setIsAuthorized(true);
      fetchPhotos();
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem('wedding_admin_auth', 'true');
      setIsAuthorized(true);
      fetchPhotos();
    } else {
      alert('Mot de passe incorrect');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('wedding_admin_auth');
    setIsAuthorized(false);
  };

  const fetchPhotos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) setPhotos(data);
    setLoading(false);
  };

  const downloadAll = async () => {
    if (photos.length === 0) return;
    setIsDownloading(true);
    const zip = new JSZip();
    
    try {
      const promises = photos.map(async (photo, index) => {
        const response = await fetch(photo.url);
        const blob = await response.blob();
        const extension = photo.url.split('.').pop()?.split('?')[0] || 'jpg';
        zip.file(`photo-${index + 1}.${extension}`, blob);
      });

      await Promise.all(promises);
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'photos-mariage.zip');
    } catch (err) {
      console.error(err);
      alert('Erreur lors du téléchargement');
    } finally {
      setIsDownloading(false);
    }
  };

  const deletePhoto = async (id: string, storagePath: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cette photo ?')) return;

    try {
      // 1. Delete from storage
      await supabase.storage.from('photos').remove([storagePath]);
      // 2. Delete from DB
      await supabase.from('photos').delete().eq('id', id);
      
      setPhotos(photos.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la suppression');
    }
  };

  if (!isAuthorized) {
    return (
      <div className={styles.loginContainer}>
        <div className="glass-card">
          <h1>Espace Administration</h1>
          <form onSubmit={handleLogin} className={styles.loginForm}>
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
            />
            <button type="submit" className="btn-premium">Connexion</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.adminWrapper}>
      <nav className={styles.navbar}>
        <div className={styles.navContent}>
          <div className={styles.navLeft}>
            <Link href="/gallery" className={styles.backLink}>
              <ArrowLeft size={18} />
              <span>Galerie</span>
            </Link>
            <h2>Admin Panel</h2>
          </div>
          <div className={styles.navActions}>
            <button onClick={handleLogout} className={styles.logoutBtn}>
              <LogOut size={18} /> Quitter
            </button>
          </div>
        </div>
      </nav>

      <main className={styles.content}>
        <header className={styles.stats}>
          <div className={styles.statCard}>
            <span>TOTAL PHOTOS</span>
            <strong>{photos.length}</strong>
          </div>
          <div className={styles.actionsGroup}>
             <button 
               onClick={downloadAll} 
               disabled={isDownloading || photos.length === 0}
               className={styles.downloadBtn}
             >
               {isDownloading ? <Loader2 className="spinner" size={16} /> : <Download size={16} />} 
               TÉLÉCHARGER TOUT (.ZIP)
             </button>
             <a href="/slideshow" target="_blank" className="btn-premium">
               LANCER LE DIAPORAMA <ExternalLink size={16} />
             </a>
          </div>
        </header>

        <section className={styles.grid}>
          {loading ? (
            <p>Chargement...</p>
          ) : (
            photos.map((photo) => (
              <div key={photo.id} className={styles.photoCard}>
                <img src={photo.url} alt="Admin thumb" className={styles.thumb} />
                <div className={styles.cardOverlay}>
                  <button 
                    onClick={() => deletePhoto(photo.id, photo.storage_path)}
                    className={styles.deleteBtn}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
}
