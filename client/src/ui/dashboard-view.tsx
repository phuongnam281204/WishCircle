import { FormEvent, ReactElement, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createGroup, getMe, getToken, joinGroup, listGroups, listNotifications } from '../api';
import { Group, GroupMember, NotificationLog, User } from '../types';

type UpcomingBirthday = {
  readonly daysLeft: number;
  readonly groupName: string;
  readonly member: GroupMember;
};

/** Authenticated dashboard for groups and mock SMS messages. */
export function DashboardView(): ReactElement {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [groupName, setGroupName] = useState<string>('');
  const [inviteCode, setInviteCode] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isSavingGroup, setIsSavingGroup] = useState<boolean>(false);
  useEffect(() => {
    if (!getToken()) {
      navigate('/login');
      return;
    }
    void loadDashboard();
  }, [navigate]);
  const loadDashboard = async (): Promise<void> => {
    try {
      const [currentUser, userGroups, recentNotifications] = await Promise.all([getMe(), listGroups(), listNotifications()]);
      setUser(currentUser);
      setGroups(userGroups);
      setNotifications(recentNotifications);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Cannot load dashboard.');
    }
  };
  const submitCreateGroup = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setIsSavingGroup(true);
    try {
      await createGroup(groupName);
      setGroupName('');
      setMessage('');
      await loadDashboard();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Cannot create group.');
    } finally {
      setIsSavingGroup(false);
    }
  };
  const submitJoinGroup = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setIsSavingGroup(true);
    try {
      await joinGroup(inviteCode);
      setInviteCode('');
      setMessage('');
      await loadDashboard();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Cannot join group.');
    } finally {
      setIsSavingGroup(false);
    }
  };
  const upcomingBirthdays = getUpcomingBirthdays(groups).slice(0, 4);
  const totalMembers = groups.reduce((total, group) => total + group.members.length, 0);
  return (
    <section className="page-stack">
      <header className="page-hero dashboard-hero">
        <div>
          <span className="eyebrow">WishCircle dashboard</span>
          <h1 className="page-heading">Welcome back, {user?.name ?? user?.phone ?? 'friend'}!</h1>
          <p className="page-subtitle">Keep birthdays, wishes, and shared memories moving in one warm little command center.</p>
        </div>
        <div className="hero-stat-grid" aria-label="Dashboard summary">
          <article className="hero-stat">
            <span className="material-symbols-outlined">groups</span>
            <strong>{groups.length}</strong>
            <small>Groups</small>
          </article>
          <article className="hero-stat">
            <span className="material-symbols-outlined">diversity_3</span>
            <strong>{totalMembers}</strong>
            <small>People</small>
          </article>
          <article className="hero-stat">
            <span className="material-symbols-outlined">cake</span>
            <strong>{upcomingBirthdays.length}</strong>
            <small>Upcoming</small>
          </article>
        </div>
        {message ? <p className="status-message error">{message}</p> : null}
      </header>
      <section className="page-stack">
        <div className="section-header">
          <h2 className="section-title">My Groups</h2>
          <div className="section-actions">
            <form className="inline-form" onSubmit={submitJoinGroup}>
              <span className="input-shell">
                <span className="material-symbols-outlined">group_add</span>
                <input className="text-input" onChange={(event) => setInviteCode(event.target.value)} placeholder="Invite code" value={inviteCode} />
              </span>
              <button className="secondary-button" disabled={isSavingGroup || !inviteCode} type="submit">Join Group</button>
            </form>
            <form className="inline-form" onSubmit={submitCreateGroup}>
              <span className="input-shell">
                <span className="material-symbols-outlined">add</span>
                <input className="text-input" onChange={(event) => setGroupName(event.target.value)} placeholder="New group name" value={groupName} />
              </span>
              <button className="gradient-button" disabled={isSavingGroup || !groupName} type="submit">Create Group</button>
            </form>
          </div>
        </div>
        <div className="dashboard-grid">
          {groups.map((group) => (
            <Link className="glass-card group-card" key={group._id} to={`/groups/${group._id}`}>
              <div className="card-topline">
                <span className="group-initial">{getInitial(group.name)}</span>
                <span className="pill">{group.members.length} Members</span>
              </div>
              <div>
                <h3 className="card-title">{group.name}</h3>
                <p className="muted">Invite code {group.inviteCode}</p>
              </div>
              <div className="row-person">
                {group.members.slice(0, 3).map((member) => (
                  <span className="avatar" key={member._id}>{getInitial(getDisplayName(member))}</span>
                ))}
                {group.members.length > 3 ? <span className="avatar">+{group.members.length - 3}</span> : null}
              </div>
            </Link>
          ))}
          {groups.length === 0 ? <div className="glass-card empty-state">Create your first circle or join one with an invite code.</div> : null}
        </div>
      </section>
      <section className="page-stack">
        <h2 className="section-title">Upcoming Birthdays</h2>
        <div className="birthday-list">
          {upcomingBirthdays.map((birthday, index) => (
            <div className={`glass-card birthday-row ${index === 0 ? 'highlight' : ''}`} key={`${birthday.groupName}-${birthday.member._id}`}>
              <div className="row-person">
                <span className="avatar">{getInitial(getDisplayName(birthday.member))}</span>
                <div className="row-copy">
                  <strong>{getDisplayName(birthday.member)}</strong>
                  <span className="muted">{birthday.groupName} - {formatBirthday(birthday.member.birthday)}</span>
                </div>
              </div>
              <span className="pill">{birthday.daysLeft === 0 ? 'Today' : `${birthday.daysLeft} Days Left`}</span>
            </div>
          ))}
          {upcomingBirthdays.length === 0 ? <div className="glass-card empty-state">No birthdays to show yet.</div> : null}
        </div>
      </section>
      <section className="page-stack">
        <h2 className="section-title">Mock SMS log</h2>
        <div className="notification-list">
          {notifications.map((notification) => (
            <div className="glass-card notification-row" key={notification._id}>
              <div className="row-person">
                <span className="avatar"><span className="material-symbols-outlined">sms</span></span>
                <div className="row-copy">
                  <strong>{notification.recipientPhone}</strong>
                  <span className="muted">{notification.message}</span>
                </div>
              </div>
              <span className="pill">{notification.type}</span>
            </div>
          ))}
          {notifications.length === 0 ? <div className="glass-card empty-state">No messages yet.</div> : null}
        </div>
      </section>
    </section>
  );
}

function getUpcomingBirthdays(groups: readonly Group[]): UpcomingBirthday[] {
  return groups
    .flatMap((group) => group.members.filter((member) => Boolean(member.birthday)).map((member) => ({
      daysLeft: getDaysUntilBirthday(member.birthday ?? ''),
      groupName: group.name,
      member,
    })))
    .sort((left, right) => left.daysLeft - right.daysLeft);
}

function getDaysUntilBirthday(value: string): number {
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

function getDisplayName(member: GroupMember): string {
  return member.name ?? member.phone;
}

function getInitial(value: string): string {
  return value.trim().charAt(0).toUpperCase() || 'W';
}
