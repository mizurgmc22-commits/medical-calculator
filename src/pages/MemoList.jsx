import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import './MemoList.css';

export default function MemoList() {
  const { user } = useAuth();
  const [memos, setMemos] = useState(() => {
    return JSON.parse(localStorage.getItem('saved_memos') || '[]');
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentMemo, setCurrentMemo] = useState({ id: null, title: '', content: '' });
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Firestoreからメモ一覧を取得
  useEffect(() => {
    const loadMemos = async () => {
      if (!user) {
        const localSaved = localStorage.getItem('saved_memos');
        setMemos(localSaved ? JSON.parse(localSaved) : []);
        setLoading(false);
        setIsSyncing(false);
        return;
      }

      try {
        const docRef = doc(db, 'users', user.uid, 'settings', 'memos');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const cloudMemos = docSnap.data().memos || [];
          setMemos(cloudMemos);
          localStorage.setItem('saved_memos', JSON.stringify(cloudMemos));
        } else {
          // Firestoreにない場合、ローカルから移行
          const localSaved = localStorage.getItem('saved_memos');
          const initialMemos = localSaved ? JSON.parse(localSaved) : [];
          setMemos(initialMemos);
          await setDoc(docRef, { memos: initialMemos });
        }
      } catch (error) {
        console.error('Firestore sync error:', error);
        // エラー時はローカルを優先
        const localSaved = localStorage.getItem('saved_memos');
        setMemos(localSaved ? JSON.parse(localSaved) : []);
      } finally {
        setLoading(false);
        setIsSyncing(false);
      }
    };

    loadMemos();
  }, [user]);

  // 変更時の保存
  useEffect(() => {
    if (isSyncing || loading) return;

    localStorage.setItem('saved_memos', JSON.stringify(memos));

    if (user) {
      const saveToCloud = async () => {
        try {
          const docRef = doc(db, 'users', user.uid, 'settings', 'memos');
          await setDoc(docRef, { memos: memos });
        } catch (error) {
          console.error('Failed to save to cloud:', error);
        }
      };
      saveToCloud();
    }
  }, [memos, user, isSyncing, loading]);

  const handleCreateNew = () => {
    setCurrentMemo({ id: null, title: '', content: '' });
    setIsEditing(true);
  };

  const handleEdit = (memo) => {
    setCurrentMemo({ id: memo.id, title: memo.title, content: memo.content });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!currentMemo.title.trim() && !currentMemo.content.trim()) {
      setIsEditing(false);
      return;
    }

    const memoTitle = currentMemo.title.trim() || '無題のメモ';
    const nowStr = new Date().toISOString();

    let updatedMemos = [...memos];
    if (currentMemo.id) {
      updatedMemos = updatedMemos.map(m => m.id === currentMemo.id ? { ...m, title: memoTitle, content: currentMemo.content, updatedAt: nowStr } : m);
    } else {
      updatedMemos.unshift({ id: Date.now().toString(), title: memoTitle, content: currentMemo.content, createdAt: nowStr, updatedAt: nowStr });
    }
    
    setMemos(updatedMemos);

    setIsEditing(false);
    setCurrentMemo({ id: null, title: '', content: '' });
  };

  const handleDeleteClick = (e, memoId) => {
    e.stopPropagation(); // 編集画面への遷移を防ぐ
    
    if (confirmDeleteId === memoId) {
      // 2回目のクリックで実際に削除
      setMemos(memos.filter(m => m.id !== memoId));
      setConfirmDeleteId(null);
    } else {
      // 1回目のクリックで確認表示にする
      setConfirmDeleteId(memoId);
      // 3秒後に元に戻す
      setTimeout(() => {
        setConfirmDeleteId((prev) => (prev === memoId ? null : prev));
      }, 3000);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    let date;
    if (timestamp.toDate) { // Firestore timestamp
      date = timestamp.toDate();
    } else { // ISO string
      date = new Date(timestamp);
    }
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
  };

  if (loading) {
    return <div className="memo-list-loading">読み込み中...</div>;
  }

  return (
    <div className="memo-list-page">
      <div className="memo-list-header">
        <h2 className="page-title">マイノート</h2>
        {!isEditing && (
          <button className="new-memo-btn" onClick={handleCreateNew}>
            ＋ 新規作成
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="memo-editor">
          <input
            type="text"
            className="memo-title-input"
            value={currentMemo.title}
            onChange={(e) => setCurrentMemo({ ...currentMemo, title: e.target.value })}
            placeholder="タイトル"
          />
          <textarea
            className="memo-content-textarea"
            value={currentMemo.content}
            onChange={(e) => setCurrentMemo({ ...currentMemo, content: e.target.value })}
            placeholder="メモの内容を入力..."
          />
          <div className="memo-editor-actions">
            <button className="memo-save-btn" onClick={handleSave}>保存</button>
            <button className="memo-cancel-btn" onClick={() => setIsEditing(false)}>キャンセル</button>
          </div>
        </div>
      ) : (
        <div className="memo-grid">
          {memos.length === 0 ? (
            <div className="empty-memos">
              <p>保存されたメモはありません。</p>
            </div>
          ) : (
            memos.map(memo => (
              <div key={memo.id} className="memo-card" onClick={() => handleEdit(memo)}>
                <h3 className="memo-card-title">{memo.title}</h3>
                <p className="memo-card-snippet">{memo.content}</p>
                <div className="memo-card-footer">
                  <span className="memo-card-date">{formatDate(memo.updatedAt)}</span>
                  <button 
                    className={`memo-card-delete ${confirmDeleteId === memo.id ? 'confirm' : ''}`} 
                    onClick={(e) => handleDeleteClick(e, memo.id)}
                  >
                    {confirmDeleteId === memo.id ? '削除？' : '🗑️'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
