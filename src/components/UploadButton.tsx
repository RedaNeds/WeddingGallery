'use client';

import { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import styles from './UploadButton.module.css';

interface UploadButtonProps {
  onUploadSuccess: (url: string) => void;
}

export default function UploadButton({ onUploadSuccess }: UploadButtonProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      // 1. Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath);

      // 3. Save to database
      const { error: dbError } = await supabase
        .from('photos')
        .insert([{ url: publicUrl, storage_path: filePath }]);

      if (dbError) throw dbError;

      onUploadSuccess(publicUrl);
    } catch (error) {
      console.error('Error uploading:', error);
      alert('Erreur lors de l\'envoi. Vérifiez votre connexion.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className={styles.container}>
      <input
        type="file"
        accept="image/*,video/*"
        onChange={handleFileChange}
        ref={fileInputRef}
        className={styles.hiddenInput}
        id="photo-upload"
      />
      <label htmlFor="photo-upload" className={`${styles.uploadBtn} ${isUploading ? styles.disabled : ''}`}>
        {isUploading ? (
          <>
            <Loader2 className={styles.spinner} />
            <span>ENVOI EN COURS...</span>
          </>
        ) : (
          <>
            <Camera size={20} />
            <span>PARTAGER UN SOUVENIR</span>
          </>
        )}
      </label>
    </div>
  );
}
