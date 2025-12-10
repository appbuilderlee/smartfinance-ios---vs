import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

export interface BackupPayload {
  transactions?: any[];
  categories?: any[];
  budgets?: any[];
  subscriptions?: any[];
  currency?: string;
  creditCards?: any[];
  themeColor?: string;
}

export const backupToFirebase = async (data: BackupPayload) => {
  const user = auth.currentUser;
  if (!user) throw new Error('請先登入再執行雲端備份');
  const ref = doc(db, 'backups', user.uid);
  await setDoc(ref, { ...data, updatedAt: new Date().toISOString() }, { merge: true });
};

export const restoreFromFirebase = async (): Promise<BackupPayload> => {
  const user = auth.currentUser;
  if (!user) throw new Error('請先登入再執行雲端還原');
  const ref = doc(db, 'backups', user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('雲端尚無備份資料');
  return snap.data() as BackupPayload;
};
