import { ReactElement, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { generateBirthdayPage, getGroup, getMe, getToken } from '../api';
import { BirthdayPage, Group, GroupMember, User } from '../types';

type ActiveGroupTab = 'members' | 'calendar';

/** Group detail screen with members and birthday actions. */
export function GroupView(): ReactElement {
  const navigate = useNavigate();
  const { groupId } = useParams<{ readonly groupId: string }>();
  const [group, setGroup] = useState<Group | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [page, setPage] = useState<BirthdayPage | null>(null);
  const [message, setMessage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<ActiveGroupTab>('members');
  useEffect(() => {
    if (!getToken()) {
      navigate('/login');
      return;
    }
    void loadGroup();
  }, [groupId, navigate]);
  const loadGroup = async (): Promise<void> => {
    if (!groupId) {
      return;
    }
    try {
      const [currentUser, currentGroup] = await Promise.all([getMe(), getGroup(groupId)]);
      setUser(currentUser);
      setGroup(currentGroup);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Cannot load group.');
    }
  };
  const clickGeneratePage = async (toUserId: string): Promise<void> => {
    if (!groupId) {
      return;
    }
    try {
      const generatedPage = await generateBirthdayPage(groupId, toUserId);
      setPage(generatedPage);
      setMessage(`Birthday page ready: ${window.location.origin}/b/${generatedPage.token}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Cannot generate birthday page.');
    }
  };
  const members = group?.members ?? [];
  const calendarMembers = [...members].filter((member) => Boolean(member.birthday)).sort(compareMembersByBirthday);
  return (
    <section className="page-stack">
      <Link className="link-button" to="/dashboard">Back to dashboard</Link>
      <header className="group-header">
        <div className="page-hero">
          <h1 className="page-heading">{group?.name ?? 'Group'}</h1>
          <p className="page-subtitle">
            <span className="material-symbols-outlined">group</span> {members.length} Members - invite {group?.inviteCode ?? '...'}
          </p>
        </div>
        <div className="section-actions">
          <button className="secondary-button" type="button">
            <span className="material-symbols-outlined">person_add</span>
            Invite
          </button>
          <button className="gradient-button" type="button">
            <span className="material-symbols-outlined">settings</span>
            Manage
          </button>
        </div>
      </header>
      {message ? <p className={`status-message ${page ? 'success' : 'error'}`}>{message}</p> : null}
      {page ? <Link className="gradient-button" to={`/b/${page.token}`}>Open birthday page</Link> : null}
      <div className="tabs">
        <button className={`tab-button ${activeTab === 'members' ? 'active' : ''}`} onClick={() => setActiveTab('members')} type="button">Members</button>
        <button className={`tab-button ${activeTab === 'calendar' ? 'active' : ''}`} onClick={() => setActiveTab('calendar')} type="button">Birthday Calendar</button>
      </div>
      {activeTab === 'members' ? (
        <section className="member-grid">
          {members.map((member) => (
            <article className="glass-card member-card" key={member._id}>
              {member.birthday ? <span className="pill">{getDaysUntilBirthday(member.birthday)} Days</span> : null}
              <span className="member-avatar">{getInitial(getDisplayName(member))}</span>
              <div>
                <h3 className="card-title">{getDisplayName(member)}</h3>
                <p className="muted"><span className="material-symbols-outlined">cake</span> {formatBirthday(member.birthday)}</p>
              </div>
              {member._id !== user?._id && group ? (
                <div className="member-actions">
                  <Link className="secondary-button" to={`/write-wish/${group._id}/${member._id}`}>Plan Wish</Link>
                  <button className="ghost-button" onClick={() => void clickGeneratePage(member._id)} type="button">Generate</button>
                </div>
              ) : (
                <p className="muted">This is you.</p>
              )}
            </article>
          ))}
          <button className="glass-card member-card" type="button">
            <span className="member-avatar"><span className="material-symbols-outlined">add</span></span>
            <h3 className="card-title">Add Member</h3>
          </button>
        </section>
      ) : (
        <section className="calendar-timeline">
          {calendarMembers.map((member) => (
            <article className="glass-card timeline-row" key={member._id}>
              <span className="date-chip">
                <span>{formatDay(member.birthday)}</span>
                <span>{formatMonth(member.birthday)}</span>
              </span>
              <span className="avatar">{getInitial(getDisplayName(member))}</span>
              <div className="row-copy">
                <strong>{getDisplayName(member)}</strong>
                <span className="muted">{getDaysUntilBirthday(member.birthday ?? '')} days left</span>
              </div>
            </article>
          ))}
          {calendarMembers.length === 0 ? <div className="glass-card empty-state">No birthdays in this group yet.</div> : null}
        </section>
      )}
    </section>
  );
}

function compareMembersByBirthday(left: GroupMember, right: GroupMember): number {
  return getDaysUntilBirthday(left.birthday ?? '') - getDaysUntilBirthday(right.birthday ?? '');
}

function getDaysUntilBirthday(value: string): number {
  if (!value) {
    return 0;
  }
  const today = new Date();
  const birthday = new Date(value);
  const nextBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
  if (nextBirthday < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
    nextBirthday.setFullYear(today.getFullYear() + 1);
  }
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  return Math.ceil((nextBirthday.getTime() - today.getTime()) / millisecondsPerDay);
}

function formatBirthday(value: string | undefined): string {
  if (!value) {
    return 'Birthday not set';
  }
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short' }).format(new Date(value));
}

function formatDay(value: string | undefined): string {
  if (!value) {
    return '--';
  }
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit' }).format(new Date(value));
}

function formatMonth(value: string | undefined): string {
  if (!value) {
    return '---';
  }
  return new Intl.DateTimeFormat('en-GB', { month: 'short' }).format(new Date(value));
}

function getDisplayName(member: GroupMember): string {
  return member.name ?? member.phone;
}

function getInitial(value: string): string {
  return value.trim().charAt(0).toUpperCase() || 'W';
}
