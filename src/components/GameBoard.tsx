import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { RotateCw, Zap } from 'lucide-react';
import { Card, CardBackStyle, CardSource, GameplayTheme, GameState, MoveHint, MoveTarget } from '../game/types';
import { canMoveToFoundation, canMoveToTableau } from '../game/solitaireEngine';
import { CardBackGraphic, PlayingCardView } from './CardArt';

interface GameBoardProps {
  gameState: GameState;
  cardBackStyle: CardBackStyle;
  gameplayTheme: GameplayTheme;
  hint: MoveHint | null;
  lastFlippedCardId: string | null;
  lastLandedCardIds: string[];
  shakingCardId: string | null;
  isNewDealAnim: boolean;
  autoCompleteAvailable: boolean;
  onTriggerAutoComplete: () => void;
  onStockClick: () => void;
  onExecuteMove: (source: CardSource, target: MoveTarget, coords: { x: number; y: number }) => boolean;
  onSmartTap: (source: CardSource, coords: { x: number; y: number }) => boolean;
  onDragStartSfx: () => void;
  onInvalidMoveSfx: () => void;
}

interface ActiveDragState {
  source: CardSource;
  cards: Card[];
  cardIds: Set<string>;
  offsetX: number;
  offsetY: number;
  cardStepY: number;
  initialX: number;
  initialY: number;
  currentX: number;
  currentY: number;
  tiltDeg: number;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  gameState,
  cardBackStyle,
  gameplayTheme,
  hint,
  lastFlippedCardId,
  lastLandedCardIds,
  shakingCardId,
  isNewDealAnim,
  autoCompleteAvailable,
  onTriggerAutoComplete,
  onStockClick,
  onExecuteMove,
  onSmartTap,
  onDragStartSfx,
  onInvalidMoveSfx,
}) => {
  const boardRef = useRef<HTMLDivElement | null>(null);
  const topRowRef = useRef<HTMLDivElement | null>(null);
  const stockSlotRef = useRef<HTMLDivElement | null>(null);
  const foundationRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tableauRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dragOverlayRef = useRef<HTMLDivElement | null>(null);

  // Measure board height dynamically for responsive tableau vertical compression
  const [boardMetrics, setBoardMetrics] = useState({
    availTableauHeight: 420,
    cardHeight: 112,
    cardWidth: 80,
  });

  useEffect(() => {
    const updateMetrics = () => {
      const boardH = boardRef.current?.clientHeight || window.innerHeight - 72;
      const topH = topRowRef.current?.clientHeight || 120;
      const cardH = stockSlotRef.current?.clientHeight || 112;
      const cardW = stockSlotRef.current?.clientWidth || 80;
      setBoardMetrics({
        availTableauHeight: Math.max(200, boardH - topH - 28),
        cardHeight: cardH,
        cardWidth: cardW,
      });
    };

    updateMetrics();
    const ro = new ResizeObserver(updateMetrics);
    if (boardRef.current) ro.observe(boardRef.current);
    window.addEventListener('resize', updateMetrics);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateMetrics);
    };
  }, []);

  // FLIP Glide Animation for smooth non-drag moves (smart tap, draw, undo, auto-complete)
  const prevPositionsRef = useRef<Map<string, DOMRect>>(new Map());
  const skipNextFlipRef = useRef<boolean>(false);

  const captureAllCardPositions = useCallback(() => {
    const map = new Map<string, DOMRect>();
    if (!boardRef.current) return map;
    const nodes = boardRef.current.querySelectorAll<HTMLElement>('[data-card-id]');
    nodes.forEach((node) => {
      const id = node.dataset.cardId;
      if (id) map.set(id, node.getBoundingClientRect());
    });
    return map;
  }, []);

  // Animate moved cards from their old bounding rect to their new bounding rect on GPU!
  useLayoutEffect(() => {
    const prevMap = prevPositionsRef.current;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!reducedMotion && !skipNextFlipRef.current && !isNewDealAnim && prevMap.size > 0 && boardRef.current) {
      const nodes = boardRef.current.querySelectorAll<HTMLElement>('[data-card-id]');
      nodes.forEach((node) => {
        const id = node.dataset.cardId;
        if (!id) return;
        const oldRect = prevMap.get(id);
        if (!oldRect) return;
        const newRect = node.getBoundingClientRect();
        const dx = oldRect.left - newRect.left;
        const dy = oldRect.top - newRect.top;

        if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
          node.animate(
            [
              { transform: `translate3d(${dx}px, ${dy}px, 0) scale(1.03)`, zIndex: 800 },
              { transform: 'translate3d(0, 0, 0) scale(1)', zIndex: 800 },
            ],
            {
              duration: 185,
              easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
            }
          );
        }
      });
    }

    skipNextFlipRef.current = false;
    prevPositionsRef.current = captureAllCardPositions();
  }, [gameState, isNewDealAnim, captureAllCardPositions]);

  // Drag-and-drop state (overlay position updated via ref transform for butter-smooth 60fps!)
  const [activeDrag, setActiveDrag] = useState<ActiveDragState | null>(null);
  const [hoverTarget, setHoverTarget] = useState<MoveTarget | null>(null);
  const dragStateRef = useRef<ActiveDragState | null>(null);

  const findDropTarget = useCallback(
    (x: number, y: number, leadCard: Card, stackCount: number): MoveTarget | null => {
      // Check foundations first (only single card allowed)
      if (stackCount === 1) {
        for (let i = 0; i < 4; i++) {
          const el = foundationRefs.current[i];
          if (!el) continue;
          const r = el.getBoundingClientRect();
          if (x >= r.left - 14 && x <= r.right + 14 && y >= r.top - 14 && y <= r.bottom + 14) {
            if (canMoveToFoundation(leadCard, gameState.foundations[i])) {
              return { type: 'foundation', index: i };
            }
          }
        }
      }

      // Check tableau columns (generous hit area across full column height)
      let bestCol: { index: number; dist: number } | null = null;
      for (let i = 0; i < 7; i++) {
        const el = tableauRefs.current[i];
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (x >= r.left - 12 && x <= r.right + 12 && y >= r.top - 16 && y <= r.bottom + 40) {
          if (canMoveToTableau(leadCard, gameState.tableau[i])) {
            const centerX = (r.left + r.right) / 2;
            const dist = Math.abs(x - centerX);
            if (!bestCol || dist < bestCol.dist) {
              bestCol = { index: i, dist };
            }
          }
        }
      }

      return bestCol ? { type: 'tableau', index: bestCol.index } : null;
    },
    [gameState.foundations, gameState.tableau]
  );

  const handleCardPointerDown = useCallback(
    (
      e: React.PointerEvent<HTMLDivElement>,
      source: CardSource,
      cardsToMove: Card[],
      cardStepY: number
    ) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      if (cardsToMove.length === 0 || !cardsToMove[0].faceUp) return;

      e.stopPropagation();
      const cardRect = e.currentTarget.getBoundingClientRect();
      const startX = e.clientX;
      const startY = e.clientY;
      const offsetX = startX - cardRect.left;
      const offsetY = startY - cardRect.top;

      let startedDrag = false;
      let lastPointerX = startX;

      const onPointerMove = (moveEvent: PointerEvent) => {
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;

        if (!startedDrag && Math.hypot(dx, dy) > 6) {
          startedDrag = true;
          onDragStartSfx();
          const initialDrag: ActiveDragState = {
            source,
            cards: cardsToMove,
            cardIds: new Set(cardsToMove.map((c) => c.id)),
            offsetX,
            offsetY,
            cardStepY,
            initialX: cardRect.left,
            initialY: cardRect.top,
            currentX: moveEvent.clientX - offsetX,
            currentY: moveEvent.clientY - offsetY,
            tiltDeg: 0,
          };
          dragStateRef.current = initialDrag;
          setActiveDrag(initialDrag);
        }

        if (startedDrag && dragStateRef.current) {
          const nextX = moveEvent.clientX - offsetX;
          const nextY = moveEvent.clientY - offsetY;
          const vx = moveEvent.clientX - lastPointerX;
          lastPointerX = moveEvent.clientX;
          const tilt = Math.max(-5, Math.min(5, vx * 0.45));

          dragStateRef.current.currentX = nextX;
          dragStateRef.current.currentY = nextY;
          dragStateRef.current.tiltDeg = tilt;

          if (dragOverlayRef.current) {
            dragOverlayRef.current.style.transform = `translate3d(${nextX}px, ${nextY}px, 0) rotate(${tilt}deg)`;
          }

          const target = findDropTarget(
            moveEvent.clientX,
            moveEvent.clientY,
            cardsToMove[0],
            cardsToMove.length
          );
          setHoverTarget((prev) => {
            if (prev?.type === target?.type && prev?.index === target?.index) return prev;
            return target;
          });
        }
      };

      const onPointerUp = (upEvent: PointerEvent) => {
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        window.removeEventListener('pointercancel', onPointerUp);

        if (startedDrag && dragStateRef.current) {
          const finalTarget = findDropTarget(
            upEvent.clientX,
            upEvent.clientY,
            cardsToMove[0],
            cardsToMove.length
          );

          setActiveDrag(null);
          setHoverTarget(null);
          dragStateRef.current = null;

          if (finalTarget) {
            // Skip FLIP jump on drag-drop since card was already dropped directly at destination
            skipNextFlipRef.current = true;
            const ok = onExecuteMove(source, finalTarget, {
              x: upEvent.clientX,
              y: upEvent.clientY,
            });
            if (!ok) {
              onInvalidMoveSfx();
            }
          } else {
            onInvalidMoveSfx();
          }
        } else {
          // Clean single tap / click: capture positions for smooth FLIP glide and smart auto-move!
          prevPositionsRef.current = captureAllCardPositions();
          const moved = onSmartTap(source, { x: upEvent.clientX, y: upEvent.clientY });
          if (!moved) {
            onInvalidMoveSfx();
          }
        }
      };

      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', onPointerUp);
    },
    [captureAllCardPositions, findDropTarget, onDragStartSfx, onExecuteMove, onInvalidMoveSfx, onSmartTap]
  );

  // Compute Waste fan layout for Draw 1 / Draw 3
  const wasteVisibleCount =
    gameState.drawMode === 3 ? Math.min(3, gameState.waste.length) : Math.min(1, gameState.waste.length);
  const wasteStartIdx = gameState.waste.length - wasteVisibleCount;
  const wasteFanStep = Math.min(22, Math.round(boardMetrics.cardWidth * 0.25));

  const hintedSet = new Set(hint?.cardIds ?? []);
  const landedSet = new Set(lastLandedCardIds);

  // Pre-compute tableau card vertical offsets so we also know the exact lowest card bottom for the Finish button
  const defaultFaceDownStep = Math.max(10, Math.min(18, boardMetrics.cardHeight * 0.145));
  const defaultFaceUpStep = Math.max(20, Math.min(34, boardMetrics.cardHeight * 0.275));

  let maxTableauBottomPx = 0;
  let totalTableauCards = 0;

  const tableauLayouts = gameState.tableau.map((col) => {
    totalTableauCards += col.length;
    let totalNeeded = boardMetrics.cardHeight;
    for (let k = 0; k < col.length - 1; k++) {
      totalNeeded += col[k].faceUp ? defaultFaceUpStep : defaultFaceDownStep;
    }

    const compression =
      totalNeeded > boardMetrics.availTableauHeight && totalNeeded > boardMetrics.cardHeight
        ? Math.max(
            0.42,
            (boardMetrics.availTableauHeight - boardMetrics.cardHeight) /
              (totalNeeded - boardMetrics.cardHeight)
          )
        : 1;

    const effectiveFaceUpStep = Math.round(defaultFaceUpStep * compression);
    const effectiveFaceDownStep = Math.round(defaultFaceDownStep * compression);

    let runningY = 0;
    const offsets = col.map((c) => {
      const y = runningY;
      runningY += c.faceUp ? effectiveFaceUpStep : effectiveFaceDownStep;
      return y;
    });

    if (col.length > 0) {
      const colBottom = offsets[col.length - 1] + boardMetrics.cardHeight;
      if (colBottom > maxTableauBottomPx) {
        maxTableauBottomPx = colBottom;
      }
    }

    return { offsets, effectiveFaceUpStep };
  });

  // Position Finish button: center of screen if no tableau cards remain, otherwise cleanly below lowest card line
  const finishButtonTopPx = Math.min(
    maxTableauBottomPx + 20,
    Math.max(24, boardMetrics.availTableauHeight - 68)
  );

  return (
    <main
      ref={boardRef}
      className="flex-1 w-full max-w-[1040px] mx-auto px-2 sm:px-4 pt-3 pb-2 flex flex-col gap-6 sm:gap-8 relative z-10 overflow-hidden"
    >
      {/* Top Row: Stock, Waste (with extra visual gap), Spacer, and 4 Foundations */}
      <section
        ref={topRowRef}
        className="grid grid-cols-7 justify-between items-start w-full"
        style={{ gridTemplateColumns: 'repeat(7, var(--card-w))' }}
        aria-label="Stock, Waste, and Foundation Piles"
      >
        {/* Stock Pile */}
        <div
          ref={stockSlotRef}
          onClick={() => {
            prevPositionsRef.current = captureAllCardPositions();
            onStockClick();
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              prevPositionsRef.current = captureAllCardPositions();
              onStockClick();
            }
          }}
          aria-label={
            gameState.stock.length > 0
              ? `Draw from stock (${gameState.stock.length} cards left)`
              : 'Recycle waste back to stock'
          }
          className={`card-slot relative flex items-center justify-center cursor-pointer hover:scale-[1.03] active:scale-[0.98] ${
            hint?.kind === 'draw' ? 'card-slot-target' : ''
          }`}
        >
          <RotateCw
            className="w-7 h-7 sm:w-10 sm:h-10 text-[#0D0D0D]/55 pointer-events-none"
            strokeWidth={3}
          />

          {gameState.stock.length > 0 && (
            <div
              className="playing-card absolute inset-0 cursor-pointer"
              style={{
                boxShadow:
                  gameState.stock.length > 10
                    ? '2px 2px 0 #FFFFFF, 4px 4px 0 #0D0D0D, 6px 6px 0 #FFE600, 8px 8px 0 #0D0D0D'
                    : '3.5px 3.5px 0 #0D0D0D',
              }}
            >
              <CardBackGraphic styleVariant={cardBackStyle} gameplayTheme={gameplayTheme} />
              {/* Stock card count badge in bottom corner */}
              <span className="absolute bottom-1 right-1 bg-[#FFE600] text-[#0D0D0D] border-2 border-[#0D0D0D] rounded px-1 font-bangers text-xs leading-tight tabular-nums shadow-[1px_1px_0_#0D0D0D]">
                {gameState.stock.length}
              </span>
            </div>
          )}
        </div>

        {/* Waste Pile (shifted slightly into spacer column for a crisp gap from Stock stack) */}
        <div className="card-slot relative translate-x-1.5 sm:translate-x-3" aria-label="Waste Pile">
          {gameState.waste.slice(wasteStartIdx).map((card, localIdx) => {
            const actualIndex = wasteStartIdx + localIdx;
            const isTop = actualIndex === gameState.waste.length - 1;
            const isHiddenByDrag = activeDrag?.cardIds.has(card.id) ?? false;

            return (
              <PlayingCardView
                key={card.id}
                card={card}
                gameplayTheme={gameplayTheme}
                isPlayable={isTop}
                isHinted={hintedSet.has(card.id)}
                isLandedAnim={landedSet.has(card.id)}
                isShaking={shakingCardId === card.id}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: `${localIdx * wasteFanStep}px`,
                  zIndex: localIdx + 2,
                  opacity: isHiddenByDrag ? 0 : 1,
                  pointerEvents: isHiddenByDrag ? 'none' : undefined,
                }}
                onPointerDown={(e) =>
                  handleCardPointerDown(
                    e,
                    { type: 'waste', colIndex: 0, cardIndex: actualIndex },
                    [card],
                    0
                  )
                }
              />
            );
          })}
        </div>

        {/* Spacer Column */}
        <div aria-hidden="true" />

        {/* 4 Foundation Piles */}
        {gameState.foundations.map((pile, fIdx) => {
          const isDropHighlighted =
            hoverTarget?.type === 'foundation' && hoverTarget.index === fIdx;
          const isHintTarget =
            hint?.target?.type === 'foundation' && hint.target.index === fIdx;
          const topCard = pile.length > 0 ? pile[pile.length - 1] : null;
          const secondCard = pile.length > 1 ? pile[pile.length - 2] : null;
          const isTopDragged = topCard ? activeDrag?.cardIds.has(topCard.id) : false;

          return (
            <div
              key={`foundation-${fIdx}`}
              ref={(el) => {
                foundationRefs.current[fIdx] = el;
              }}
              aria-label={`Foundation pile ${fIdx + 1}`}
              className={`card-slot relative flex items-center justify-center ${
                isDropHighlighted || isHintTarget ? 'card-slot-target' : ''
              }`}
            >
              <span className="font-bangers text-3xl sm:text-4xl text-[#0D0D0D]/28 pointer-events-none">
                A
              </span>

              {/* Render underlying card visibly when top foundation card is dragged */}
              {secondCard && isTopDragged && (
                <PlayingCardView
                  card={secondCard}
                  gameplayTheme={gameplayTheme}
                  isPlayable={false}
                  style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
                />
              )}

              {topCard && (
                <PlayingCardView
                  key={topCard.id}
                  card={topCard}
                  gameplayTheme={gameplayTheme}
                  isPlayable={true}
                  isHinted={hintedSet.has(topCard.id)}
                  isTargetHighlight={isDropHighlighted || isHintTarget}
                  isLandedAnim={landedSet.has(topCard.id)}
                  isShaking={shakingCardId === topCard.id}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    zIndex: 2,
                    opacity: isTopDragged ? 0 : 1,
                    pointerEvents: isTopDragged ? 'none' : undefined,
                  }}
                  onPointerDown={(e) =>
                    handleCardPointerDown(
                      e,
                      { type: 'foundation', colIndex: fIdx, cardIndex: pile.length - 1 },
                      [topCard],
                      0
                    )
                  }
                />
              )}
            </div>
          );
        })}
      </section>

      {/* Bottom Row: 7 Tableau Columns */}
      <section
        className="grid grid-cols-7 justify-between flex-1 w-full relative"
        style={{ gridTemplateColumns: 'repeat(7, var(--card-w))' }}
        aria-label="Tableau Columns"
      >
        {gameState.tableau.map((col, colIdx) => {
          const isDropHighlighted =
            hoverTarget?.type === 'tableau' && hoverTarget.index === colIdx;
          const isHintTarget =
            hint?.target?.type === 'tableau' && hint.target.index === colIdx;
          const { offsets: cardOffsets, effectiveFaceUpStep } = tableauLayouts[colIdx];

          return (
            <div
              key={`tableau-${colIdx}`}
              ref={(el) => {
                tableauRefs.current[colIdx] = el;
              }}
              className="relative h-full"
              style={{ width: 'var(--card-w)' }}
              aria-label={`Tableau column ${colIdx + 1}`}
            >
              {/* Empty Column King Slot */}
              <div
                className={`card-dimensions rounded-[var(--card-radius)] border-[length:var(--border-w)] border-dashed border-[#0D0D0D]/40 bg-white/25 absolute top-0 left-0 flex items-center justify-center transition-all ${
                  col.length === 0 && (isDropHighlighted || isHintTarget) ? 'card-slot-target !border-solid' : ''
                }`}
              >
                <span className="font-bangers text-2xl sm:text-3xl text-[#0D0D0D]/22 pointer-events-none">
                  K
                </span>
              </div>

              {/* Stacked Cards */}
              {col.map((card, cardIdx) => {
                const isHiddenByDrag = activeDrag?.cardIds.has(card.id) ?? false;
                const isLastCard = cardIdx === col.length - 1;
                const dealDelay = isNewDealAnim ? (colIdx * 3 + cardIdx) * 24 : null;

                return (
                  <PlayingCardView
                    key={`${gameState.dealId}-${card.id}`}
                    card={card}
                    cardBackStyle={cardBackStyle}
                    gameplayTheme={gameplayTheme}
                    isPlayable={card.faceUp}
                    isHinted={hintedSet.has(card.id)}
                    isTargetHighlight={isLastCard && (isDropHighlighted || isHintTarget)}
                    isFlippedAnim={lastFlippedCardId === card.id}
                    isLandedAnim={landedSet.has(card.id)}
                    isShaking={shakingCardId === card.id}
                    dealDelayMs={dealDelay}
                    style={{
                      position: 'absolute',
                      top: `${cardOffsets[cardIdx]}px`,
                      left: 0,
                      zIndex: cardIdx + 2,
                      opacity: isHiddenByDrag ? 0 : 1,
                      pointerEvents: isHiddenByDrag ? 'none' : undefined,
                    }}
                    onPointerDown={(e) =>
                      handleCardPointerDown(
                        e,
                        { type: 'tableau', colIndex: colIdx, cardIndex: cardIdx },
                        col.slice(cardIdx),
                        effectiveFaceUpStep
                      )
                    }
                  />
                );
              })}
            </div>
          );
        })}

        {/* Dynamic Auto-Complete FINISH! Button:
            Shows in the middle of the screen if no cards remain on tableau, or cleanly below the lowest card line */}
        {autoCompleteAvailable && (
          <div
            className="absolute left-1/2 z-[700] pointer-events-auto"
            style={
              totalTableauCards === 0
                ? { top: '42%', transform: 'translate(-50%, -50%)' }
                : { top: `${finishButtonTopPx}px`, transform: 'translateX(-50%)' }
            }
          >
            <button
              type="button"
              onClick={onTriggerAutoComplete}
              className="pop-btn play-btn-glow bg-[#00E676] hover:bg-[#19FF8C] text-[#0D0D0D] font-bangers text-2xl sm:text-3xl px-7 py-2.5 rounded-2xl tracking-wider flex items-center gap-2 whitespace-nowrap"
              title="Auto-complete remaining cards"
            >
              <Zap className="w-6 h-6 fill-[#0D0D0D] relative z-10" strokeWidth={2.6} />
              <span className="relative z-10">FINISH!</span>
            </button>
          </div>
        )}
      </section>

      {/* GPU-Composited Floating Drag Layer (zero React re-renders during pointermove!) */}
      {activeDrag && (
        <div
          ref={dragOverlayRef}
          className="fixed top-0 left-0 pointer-events-none z-[9999]"
          style={{
            transform: `translate3d(${activeDrag.currentX}px, ${activeDrag.currentY}px, 0) rotate(${activeDrag.tiltDeg}deg)`,
            willChange: 'transform',
          }}
        >
          {activeDrag.cards.map((card, idx) => (
            <PlayingCardView
              key={`drag-${card.id}`}
              card={card}
              gameplayTheme={gameplayTheme}
              isPlayable={false}
              isDragging={true}
              style={{
                position: 'absolute',
                top: `${idx * (activeDrag.cardStepY || 26)}px`,
                left: 0,
                zIndex: idx + 1,
              }}
            />
          ))}
        </div>
      )}
    </main>
  );
};
