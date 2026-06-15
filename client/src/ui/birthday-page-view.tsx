import { ReactElement, useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { useParams } from 'react-router-dom';
import { getBirthdayPage } from '../api';
import { BirthdayPage, PublicWish } from '../types';

const MAX_ORBIT_WISH_COUNT = 14;
const ORBIT_SETTINGS = [
  { depth: 0, duration: 22, orbSize: 3.7, size: 23, tiltX: 66, tiltY: -10 },
  { depth: 2.5, duration: 28, orbSize: 4.15, size: 27, tiltX: 71, tiltY: 34 },
  { depth: -2.5, duration: 34, orbSize: 3.9, size: 31, tiltX: 63, tiltY: -48 },
  { depth: 4.5, duration: 42, orbSize: 4.7, size: 35, tiltX: 78, tiltY: 62 },
  { depth: -4.5, duration: 52, orbSize: 3.55, size: 39, tiltX: 55, tiltY: -70 },
  { depth: 6, duration: 62, orbSize: 4.25, size: 43, tiltX: 84, tiltY: 18 },
  { depth: -6, duration: 74, orbSize: 3.65, size: 47, tiltX: 49, tiltY: 74 },
] as const;
const ORBIT_GLOWS = ['#43e8ff', '#f9a8d4', '#c4b5fd', '#7dd3fc', '#ffd8ea'] as const;
const MAX_ROTATE_X = 82;
const MIN_ROTATE_X = -82;

type DragState = {
  readonly pointerId: number;
  readonly rotateX: number;
  readonly rotateY: number;
  readonly startX: number;
  readonly startY: number;
};

type SwipeState = {
  readonly pointerId: number;
  readonly startX: number;
};

type OrbitStyle = CSSProperties & {
  readonly '--orb-glow': string;
  readonly '--orb-size': string;
  readonly '--orbit-counter-x': string;
  readonly '--orbit-counter-y': string;
  readonly '--orbit-depth': string;
  readonly '--orbit-duration': string;
  readonly '--orbit-height': string;
  readonly '--orbit-tilt-x': string;
  readonly '--orbit-tilt-y': string;
  readonly '--orbit-width': string;
};

type SceneRotation = {
  readonly x: number;
  readonly y: number;
};

type SceneStyle = CSSProperties & {
  readonly '--scene-rotate-x': string;
  readonly '--scene-rotate-y': string;
};

/** Public birthday surprise page. */
export function BirthdayPageView(): ReactElement {
  const { token } = useParams<{ readonly token: string }>();
  const [page, setPage] = useState<BirthdayPage | null>(null);
  const [message, setMessage] = useState<string>('Loading birthday surprise...');
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [previewWish, setPreviewWish] = useState<PublicWish | null>(null);
  const [selectedWishIndex, setSelectedWishIndex] = useState<number>(0);
  const [sceneRotation, setSceneRotation] = useState<SceneRotation>({ x: -10, y: -14 });
  const [swipeState, setSwipeState] = useState<SwipeState | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    void loadPage();
  }, [token]);
  const loadPage = async (): Promise<void> => {
    if (!token) {
      setMessage('Missing birthday page token.');
      return;
    }
    try {
      const birthdayPage = await getBirthdayPage(token);
      setPage(birthdayPage);
      setMessage('');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Cannot load birthday page.');
    }
  };
  const startOrbitDrag = (event: PointerEvent<HTMLDivElement>): void => {
    stageRef.current?.setPointerCapture(event.pointerId);
    setDragState({
      pointerId: event.pointerId,
      rotateX: sceneRotation.x,
      rotateY: sceneRotation.y,
      startX: event.clientX,
      startY: event.clientY,
    });
  };
  const moveOrbitDrag = (event: PointerEvent<HTMLDivElement>): void => {
    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }
    const deltaX = event.clientX - dragState.startX;
    const deltaY = event.clientY - dragState.startY;
    setSceneRotation({
      x: clamp(dragState.rotateX - deltaY * 0.22, MIN_ROTATE_X, MAX_ROTATE_X),
      y: dragState.rotateY + deltaX * 0.42,
    });
  };
  const stopOrbitDrag = (event: PointerEvent<HTMLDivElement>): void => {
    if (dragState?.pointerId === event.pointerId) {
      stageRef.current?.releasePointerCapture(event.pointerId);
      setDragState(null);
    }
  };
  const selectWish = (index: number): void => {
    setSelectedWishIndex(index);
  };
  const openWishPreview = (wish: PublicWish, index: number): void => {
    setSelectedWishIndex(index);
    if (wish.photoUrl) {
      setPreviewWish(wish);
    }
  };
  const closeWishPreview = (): void => {
    setPreviewWish(null);
  };
  const navigateWish = (direction: number): void => {
    if (!page || page.wishes.length === 0) {
      return;
    }
    setSelectedWishIndex((currentIndex) => (currentIndex + direction + page.wishes.length) % page.wishes.length);
  };
  const startWishSwipe = (event: PointerEvent<HTMLElement>): void => {
    if (!page || page.wishes.length < 2) {
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    setSwipeState({ pointerId: event.pointerId, startX: event.clientX });
  };
  const stopWishSwipe = (event: PointerEvent<HTMLElement>): void => {
    if (!swipeState || swipeState.pointerId !== event.pointerId) {
      return;
    }
    const swipeDistance = event.clientX - swipeState.startX;
    if (Math.abs(swipeDistance) > 45) {
      navigateWish(swipeDistance < 0 ? 1 : -1);
    }
    event.currentTarget.releasePointerCapture(event.pointerId);
    setSwipeState(null);
  };
  if (!page) {
    return <section className="glass-card empty-state"><p>{message}</p></section>;
  }
  const orbitWishes = page.wishes.slice(0, MAX_ORBIT_WISH_COUNT);
  const selectedWish = page.wishes[selectedWishIndex] ?? null;
  return (
    <section className="birthday-public">
      <section className="birthday-hero">
        <div className="birthday-hero-content">
          <div
            aria-label="Orbiting birthday wishes. Drag to rotate."
            className={`birthday-orbit-stage ${dragState ? 'orbit-stage-dragging' : ''}`}
            onPointerCancel={stopOrbitDrag}
            onPointerDown={startOrbitDrag}
            onPointerLeave={stopOrbitDrag}
            onPointerMove={moveOrbitDrag}
            onPointerUp={stopOrbitDrag}
            ref={stageRef}
            style={getSceneStyle(sceneRotation)}
          >
            <div className="atom-scene">
              <div className="orbit-halo orbit-halo-one" />
              <div className="orbit-halo orbit-halo-two" />
              <div className="orbit-halo orbit-halo-three" />
              <div className="atom-ring atom-ring-one" />
              <div className="atom-ring atom-ring-two" />
              <div className="atom-ring atom-ring-three" />
              <div className="atom-ring atom-ring-four" />
              {orbitWishes.map((wish, index) => (
                <div className={`orbit-path ${index % 2 === 0 ? '' : 'orbit-path-reverse'}`} key={wish._id} style={getOrbitStyle(index)}>
                  <button
                    aria-label={`Open wish from ${wish.fromName}`}
                    className={`orbit-planet ${selectedWishIndex === index ? 'orbit-planet-active' : ''}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      openWishPreview(wish, index);
                    }}
                    onPointerDown={(event) => event.stopPropagation()}
                    title={`Wish from ${wish.fromName}`}
                    type="button"
                  >
                    {wish.photoUrl ? <img alt={`Wish from ${wish.fromName}`} src={wish.photoUrl} /> : <span>{getWishInitials(wish)}</span>}
                  </button>
                </div>
              ))}
              {orbitWishes.length === 0 ? (
                <div className="orbit-empty">
                  <span className="material-symbols-outlined">auto_awesome</span>
                </div>
              ) : null}
            </div>
            <span className="birthday-avatar orbit-center">{getInitials(page.recipientName)}</span>
          </div>
          <div className="birthday-hero-copy">
            <h1>Happy Birthday,</h1>
            <h2 className="gradient-text">{page.recipientName}!</h2>
            <p className="page-subtitle">{page.groupName} gathered {page.wishes.length} wishes for you.</p>
            <p className="orbit-hint">Tap a planet to open a wish. Swipe the card to browse every memory.</p>
          </div>
          {selectedWish ? (
            <article
              className="orbit-wish-viewer"
              onPointerCancel={stopWishSwipe}
              onPointerDown={startWishSwipe}
              onPointerUp={stopWishSwipe}
            >
              <div className="orbit-wish-media">
                {selectedWish.photoUrl ? (
                  <button
                    aria-label={`Open photo from ${selectedWish.fromName}`}
                    className="orbit-wish-photo-button"
                    onClick={() => setPreviewWish(selectedWish)}
                    onPointerDown={(event) => event.stopPropagation()}
                    type="button"
                  >
                    <img alt={`Memory from ${selectedWish.fromName}`} src={selectedWish.photoUrl} />
                  </button>
                ) : (
                  <span>{getWishInitials(selectedWish)}</span>
                )}
              </div>
              <div className="orbit-wish-copy">
                <div>
                  <p className="orbit-wish-kicker">Wish {selectedWishIndex + 1} of {page.wishes.length}</p>
                  <h3>From {selectedWish.fromName}</h3>
                </div>
                <p>{selectedWish.message}</p>
                <div className="orbit-wish-actions">
                  <button aria-label="Previous wish" className="icon-button" onClick={() => navigateWish(-1)} type="button">
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  <div className="orbit-wish-dots" aria-label="Wish position">
                    {page.wishes.map((wish, index) => (
                      <button
                        aria-label={`Open wish ${index + 1}`}
                        className={selectedWishIndex === index ? 'active' : ''}
                        key={wish._id}
                        onClick={() => selectWish(index)}
                        type="button"
                      />
                    ))}
                  </div>
                  <button aria-label="Next wish" className="icon-button" onClick={() => navigateWish(1)} type="button">
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              </div>
            </article>
          ) : null}
        </div>
      </section>
      {previewWish?.photoUrl ? (
        <div className="image-preview-backdrop" onClick={closeWishPreview} role="presentation">
          <div className="image-preview-dialog" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label={`Photo from ${previewWish.fromName}`}>
            <img alt={`Memory from ${previewWish.fromName}`} src={previewWish.photoUrl} />
            <div className="image-preview-caption">
              <strong>From {previewWish.fromName}</strong>
              <span>{previewWish.message}</span>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function getWishInitials(wish: PublicWish): string {
  if (wish.isAnonymous) {
    return '?';
  }
  return getInitials(wish.fromName);
}

function getInitials(value: string): string {
  const initials = value.trim().split(/\s+/).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join('');
  return initials || 'WC';
}

function getOrbitStyle(index: number): OrbitStyle {
  const setting = ORBIT_SETTINGS[index % ORBIT_SETTINGS.length];
  return {
    '--orb-glow': ORBIT_GLOWS[index % ORBIT_GLOWS.length],
    '--orb-size': `${setting.orbSize}rem`,
    '--orbit-counter-x': `${setting.tiltX * -1}deg`,
    '--orbit-counter-y': `${setting.tiltY * -1}deg`,
    '--orbit-depth': `${setting.depth}rem`,
    '--orbit-duration': `${setting.duration}s`,
    '--orbit-height': `${setting.size}rem`,
    '--orbit-tilt-x': `${setting.tiltX}deg`,
    '--orbit-tilt-y': `${setting.tiltY}deg`,
    '--orbit-width': `${setting.size}rem`,
    animationDelay: `-${index * 4.2}s`,
  };
}

function getSceneStyle(rotation: SceneRotation): SceneStyle {
  return {
    '--scene-rotate-x': `${rotation.x}deg`,
    '--scene-rotate-y': `${rotation.y}deg`,
  };
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}
