import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import './QuickMemo.css';

export default function QuickMemo() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [memoText, setMemoText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  // ローカルまたはFirestoreからメモを読み込む
  useEffect(() => {
    const loadMemo = async () => {
      if (!user) {
        const localSaved = localStorage.getItem('quick_memo');
        if (localSaved) setMemoText(localSaved);
        return;
      }

      try {
        const docRef = doc(db, 'users', user.uid, 'settings', 'quickMemo');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const text = docSnap.data().text || '';
          setMemoText(text);
          localStorage.setItem('quick_memo', text);
        } else {
          // Firestoreにない場合、ローカルから移行
          const localSaved = localStorage.getItem('quick_memo') || '';
          setMemoText(localSaved);
          await setDoc(docRef, { text: localSaved, updatedAt: new Date().toISOString() });
        }
      } catch (error) {
        console.error('QuickMemo load error:', error);
        const localSaved = localStorage.getItem('quick_memo');
        if (localSaved) setMemoText(localSaved);
      }
    };

    if (isOpen) {
      loadMemo();
    }
  }, [user, isOpen]);

  // デバウンスで自動保存
  useEffect(() => {
    if (!isOpen) return;

    localStorage.setItem('quick_memo', memoText);

    const handler = setTimeout(async () => {
      if (user) {
        setIsSaving(true);
        try {
          const docRef = doc(db, 'users', user.uid, 'settings', 'quickMemo');
          await setDoc(docRef, { text: memoText, updatedAt: new Date().toISOString() }, { merge: true });
          setSaveStatus('クラウドに保存しました');
        } catch (error) {
          console.error('QuickMemo save error:', error);
          setSaveStatus('保存エラー (ローカルには保存済)');
        } finally {
          setIsSaving(false);
          setTimeout(() => setSaveStatus(''), 3000);
        }
      } else {
        setSaveStatus('ローカルに保存しました');
        setTimeout(() => setSaveStatus(''), 3000);
      }
    }, 1000);

    return () => clearTimeout(handler);
  }, [memoText, user, isOpen]);

  return (
    <>
      {/* フローティングボタン */}
      <button 
        className="quick-memo-fab" 
        onClick={() => setIsOpen(true)}
        aria-label="メモを開く"
        title="クイックメモ"
      >
        📝
      </button>

      {/* モーダル/ドロワー */}
      <div className={`quick-memo-overlay ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(false)}>
        <div className={`quick-memo-container ${isOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
          <div className="quick-memo-header">
            <h3 className="quick-memo-title">📝 クイックメモ</h3>
            <div className="quick-memo-status">
              {isSaving ? '保存中...' : saveStatus}
            </div>
            <button className="quick-memo-close" onClick={() => setIsOpen(false)}>
              ✕
            </button>
          </div>
          <div className="quick-memo-body">
            <textarea
              className="quick-memo-textarea"
              placeholder="一時的な数値などを自由にメモできます。入力すると自動的に保存されます。"
              value={memoText}
              onChange={(e) => setMemoText(e.target.value)}
            />
          </div>
        </div>
      </div>
    </>
  );
}
