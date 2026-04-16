'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import styles from './page.module.css';

export default function LandingPage() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctCode = process.env.NEXT_PUBLIC_GUEST_ACCESS_CODE || 'WEDDING2026';
    
    if (code.toUpperCase() === correctCode.toUpperCase()) {
      // In a real app,  description: "Partagez et célébrez notre union à travers vos yeux.",
      localStorage.setItem('wedding_access', 'true');
      router.push('/gallery');
    } else {
      setError('Oups ! Ce code ne semble pas être le bon.');
    }
  };

  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className={styles.content}
        >
          <h1 className={styles.title}>Reda & Rania</h1>
          <div className="gold-line"></div>
          <p className={styles.date}>12 JUIN 2026</p>
          
          <div className="glass-card">
            <h2 className={styles.subtitle}>Bienvenue sur notre galerie</h2>
            <p className={styles.description}>
              Entrez le code secret pour découvrir et partager les souvenirs de cette journée inoubliable.
            </p>
            
            <form onSubmit={handleJoin} className={styles.form}>
              <input
                type="text"
                placeholder="VOTRE CODE"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className={styles.input}
              />
              {error && <p className={styles.error}>{error}</p>}
              <button type="submit" className="btn-premium">
                REJOINDRE
              </button>
            </form>
          </div>
        </motion.div>
      </section>
      
      <div className={styles.overlay}></div>
    </main>
  );
}
