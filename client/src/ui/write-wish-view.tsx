import { ChangeEvent, FormEvent, ReactElement, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createWish, getGroup, getToken } from '../api';
import { Group, GroupMember } from '../types';

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

/** Wish writing form reached from reminders or group detail. */
export function WriteWishView(): ReactElement {
  const navigate = useNavigate();
  const { groupId, toUserId } = useParams<{ readonly groupId: string; readonly toUserId: string }>();
  const [group, setGroup] = useState<Group | null>(null);
  const [recipient, setRecipient] = useState<GroupMember | null>(null);
  const [message, setMessage] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('');
  useEffect(() => {
    if (!getToken()) {
      navigate('/login');
      return;
    }
    void loadRecipient();
  }, [groupId, navigate, toUserId]);
  const loadRecipient = async (): Promise<void> => {
    if (!groupId || !toUserId) {
      return;
    }
    const loadedGroup = await getGroup(groupId);
    setGroup(loadedGroup);
    setRecipient(loadedGroup.members.find((member) => member._id === toUserId) ?? null);
  };
  const submitWish = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!groupId || !toUserId) {
      return;
    }
    try {
      await createWish({
        groupId,
        isAnonymous,
        message,
        photoUrl: photoUrl || undefined,
        toUserId,
      });
      setStatus('Wish saved. You can update it until the birthday page is generated.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Cannot save wish.');
    }
  };
  const changePhoto = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) {
      setPhotoUrl('');
      return;
    }
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
      setStatus('Please choose a jpg, png, or webp image.');
      event.target.value = '';
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setStatus('Image must be 5MB or smaller.');
      event.target.value = '';
      return;
    }
    const dataUrl = await convertFileToDataUrl(file);
    setPhotoUrl(dataUrl);
    setStatus('');
  };
  return (
    <section className="page-stack">
      <Link className="link-button" to={group ? `/groups/${group._id}` : '/dashboard'}>Back</Link>
      <div className="glass-card auth-card">
        <div className="auth-header">
          <h1 className="brand-title brand-gradient">Write a birthday wish</h1>
          <p className="auth-copy">
            For {recipient?.name ?? recipient?.phone ?? 'friend'} in {group?.name ?? 'your group'}
          </p>
        </div>
        {status ? <p className={`status-message ${status.includes('Cannot') || status.includes('Please') || status.includes('must') ? 'error' : 'success'}`}>{status}</p> : null}
        <form className="form-stack" onSubmit={submitWish}>
          <label className="field">
            <span>Message</span>
            <span className="input-shell">
              <span className="material-symbols-outlined">edit_note</span>
              <textarea className="text-area" onChange={(event) => setMessage(event.target.value)} value={message} />
            </span>
          </label>
          <label className="field">
            <span>Photo</span>
            <span className="input-shell">
              <span className="material-symbols-outlined">image</span>
              <input accept="image/jpeg,image/png,image/webp" className="file-input" onChange={(event) => void changePhoto(event)} type="file" />
            </span>
          </label>
          {photoUrl ? <img alt="Selected wish" className="photo-preview" src={photoUrl} /> : null}
          <label className="checkbox-row">
            <input checked={isAnonymous} onChange={(event) => setIsAnonymous(event.target.checked)} type="checkbox" />
            Send anonymously
          </label>
          <button className="gradient-button" disabled={message.length < 2} type="submit">Save wish</button>
        </form>
      </div>
    </section>
  );
}

function convertFileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(String(reader.result)));
    reader.addEventListener('error', () => reject(new Error('Cannot read image file.')));
    reader.readAsDataURL(file);
  });
}
