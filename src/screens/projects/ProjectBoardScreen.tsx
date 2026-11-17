import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { Screen } from '../../components/ui/Screen';
import { TaskCard } from '../../components/tasks/TaskCard';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { PriorityChip } from '../../components/ui/Chips';
import {radius,type ThemePalette} from '../../constants/theme';
import {useAppTheme} from '../../hooks/useAppTheme';
import { useProject } from '../../hooks/useProject';
import { useData } from '../../context/DataContext';
import { useAppNavigation } from '../../hooks/useAppNavigation';
import { canEdit } from '../../utils/permissions';
import { projectProgress } from '../../utils/taskMetrics';
import type { AppStackParamList } from '../../types/navigation';

const COLUMN_WIDTH = 286;
const EDGE_ZONE = 65;
const SCROLL_STEP = 18;
const SCROLL_INTERVAL_MS = 35;

type Rect = { x: number; y: number; width: number; height: number };
type ColumnLayout = { x: number; width: number };
type CardLayout = { y: number; height: number };
type DropLocation = { statusId: string; index: number };

export default function ProjectBoardScreen() {
 const {palette}=useAppTheme();
 const s=makeThemeStyles_s(palette);

  const { params } = useRoute<RouteProp<AppStackParamList, 'ProjectBoard'>>();
  const nav = useAppNavigation();
  const { project, statuses, tasks, members } = useProject(params.projectId);
  const { data, moveTask, roleFor } = useData();

  const orderedStatuses = useMemo(
    () => [...statuses].sort((a, b) => a.position - b.position),
    [statuses]
  );
  const firstStatus = orderedStatuses[0];
  const doneIds = orderedStatuses
    .filter(st => /termin|fini|done/i.test(st.name))
    .map(st => st.id);
  const canMove = !!project && canEdit(roleFor(project.id));

  const boardRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const pageScrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const pageViewportRef = useRef<Rect>({ x: 0, y: 0, width: 0, height: 0 });
  const pageScrollYRef = useRef(0);
  const pageContentHeightRef = useRef(0);
  const rootRef = useRef<React.ComponentRef<typeof View>>(null);
  const rootOriginRef = useRef({ x: 0, y: 0 });
  const viewportRef = useRef<Rect>({ x: 0, y: 0, width: 0, height: 0 });
  const columnsRef = useRef<Record<string, ColumnLayout>>({});
  const cardsRef = useRef<Record<string, Record<string, CardLayout>>>({});
  const scrollXRef = useRef(0);
  const contentWidthRef = useRef(0);
  const lastFingerRef = useRef({ x: 0, y: 0 });
  const draggingRef = useRef<string | null>(null);
  const activeScrollDirectionRef = useRef(0);
  const verticalDirectionRef = useRef(0);
  const autoScrollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const busyRef = useRef(false);

  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [drop, setDrop] = useState<DropLocation | null>(null);
  const [savingTaskId, setSavingTaskId] = useState<string | null>(null);
  const floating = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  const stopAutoScroll = () => {
    activeScrollDirectionRef.current = 0;
    verticalDirectionRef.current = 0;
    if (autoScrollRef.current !== null) {
      clearInterval(autoScrollRef.current);
      autoScrollRef.current = null;
    }
  };
  useEffect(() => () => stopAutoScroll(), []);

  const findDrop = (fingerX: number, fingerY: number): DropLocation | null => {
    const viewport = viewportRef.current;
    if (
      !viewport.width || !viewport.height ||
      fingerX < viewport.x || fingerX > viewport.x + viewport.width ||
      fingerY < viewport.y || fingerY > viewport.y + viewport.height
    ) return null;

    const contentX = fingerX - viewport.x + scrollXRef.current;
    const status = orderedStatuses.find(st => {
      const box = columnsRef.current[st.id];
      return !!box && contentX >= box.x && contentX <= box.x + box.width;
    });
    if (!status) return null;

    const otherCards = tasks.filter(
      task => task.statusId === status.id && task.id !== draggingRef.current
    );
    const insideY = fingerY - viewport.y;
    const rects = cardsRef.current[status.id] ?? {};
    let index = otherCards.length;
    for (let i = 0; i < otherCards.length; i++) {
      const rect = rects[otherCards[i].id];
      // Une carte pas encore mesuree ne bloque pas l'insertion.
      if (rect && insideY < rect.y + rect.height / 2) {
        index = i;
        break;
      }
    }
    return { statusId: status.id, index };
  };

  const updateDrop = (x: number, y: number) => {
    setDrop(findDrop(x, y));
  };

  const updateFloating = (x: number, y: number) => {
    floating.setValue({
      x: x - rootOriginRef.current.x - 92,
      y: y - rootOriginRef.current.y - 65,
    });
  };

  const startDrag = (taskId: string, x: number, y: number) => {
    if (!canMove || busyRef.current) return;
    draggingRef.current = taskId;
    lastFingerRef.current = { x, y };
    stopAutoScroll();

    // Le geste continue a etre capture par TaskCard ; le fantome
    // n'intercepte aucun toucher (pointerEvents="none").
    rootRef.current?.measureInWindow((rx, ry) => {
      rootOriginRef.current = { x: rx, y: ry };
      updateFloating(lastFingerRef.current.x, lastFingerRef.current.y);
      if (draggingRef.current === taskId) setDraggedId(taskId);
    });
    pageScrollRef.current?.measureInWindow((px, py, width, height) => {
      pageViewportRef.current = { x: px, y: py, width, height };
    });
    boardRef.current?.measureInWindow((bx, by, width, height) => {
      viewportRef.current = { x: bx, y: by, width, height };
      updateDrop(lastFingerRef.current.x, lastFingerRef.current.y);
    });

    autoScrollRef.current = setInterval(() => {
      if (!draggingRef.current || (activeScrollDirectionRef.current === 0 && verticalDirectionRef.current === 0)) return;
      const viewport = viewportRef.current;
      const maxX = Math.max(0, contentWidthRef.current - viewport.width);
      const nextX = Math.min(
        maxX,
        Math.max(0, scrollXRef.current + activeScrollDirectionRef.current * SCROLL_STEP)
      );
      if (nextX !== scrollXRef.current) {
        scrollXRef.current = nextX;
        boardRef.current?.scrollTo({ x: nextX, animated: false });
      }
      if (verticalDirectionRef.current !== 0) {
        const maxY = Math.max(0, pageContentHeightRef.current - pageViewportRef.current.height);
        const nextY = Math.min(maxY, Math.max(0, pageScrollYRef.current + verticalDirectionRef.current * SCROLL_STEP));
        if (nextY !== pageScrollYRef.current) {
          pageScrollYRef.current = nextY;
          pageScrollRef.current?.scrollTo({ y: nextY, animated: false });
          boardRef.current?.measureInWindow((bx, by, width, height) => {
            viewportRef.current = { x: bx, y: by, width, height };
            updateDrop(lastFingerRef.current.x, lastFingerRef.current.y);
          });
        }
      }
      updateDrop(lastFingerRef.current.x, lastFingerRef.current.y);
    }, SCROLL_INTERVAL_MS);
  };

  const updateDrag = (x: number, y: number) => {
    if (!draggingRef.current) return;
    lastFingerRef.current = { x, y };
    updateFloating(x, y);
    updateDrop(x, y);
    const vp = viewportRef.current;
    const yInside = y >= vp.y && y <= vp.y + vp.height;
    activeScrollDirectionRef.current = !yInside
      ? 0
      : x >= vp.x + vp.width - EDGE_ZONE
        ? 1
        : x <= vp.x + EDGE_ZONE
          ? -1
          : 0;
    const page = pageViewportRef.current;
    verticalDirectionRef.current = x >= page.x && x <= page.x + page.width
      ? y >= page.y + page.height - EDGE_ZONE ? 1
        : y <= page.y + EDGE_ZONE ? -1 : 0
      : 0;
  };

  const resetDrag = () => {
    stopAutoScroll();
    draggingRef.current = null;
    setDraggedId(null);
    setDrop(null);
  };

  const finishDrag = async (x: number, y: number) => {
    const taskId = draggingRef.current;
    const target = findDrop(x, y);
    const task = tasks.find(t => t.id === taskId);
    resetDrag();
    if (!task || !target || busyRef.current) return;

    const otherCards = tasks.filter(
      t => t.statusId === target.statusId && t.id !== task.id
    );
    const beforeTaskId = otherCards[target.index]?.id ?? null;

    // Eviter une operation inutile en cas de depot a la meme place.
    if (task.statusId === target.statusId) {
      const current = tasks.filter(t => t.statusId === target.statusId).map(t => t.id);
      const proposed = [...otherCards.map(t => t.id)];
      proposed.splice(target.index, 0, task.id);
      if (proposed.every((id, i) => id === current[i])) return;
    }

    busyRef.current = true;
    setSavingTaskId(task.id);
    try {
      const sourceStatus = orderedStatuses.find(
  st => st.id === task.statusId
);
const destinationStatus = orderedStatuses.find(
  st => st.id === target.statusId
);

if (!sourceStatus || !destinationStatus) {
  throw new Error('État source ou destination introuvable.');
}

if (sourceStatus.id !== destinationStatus.id) {
  const normalize = (name: string) =>
    name.normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();

  const from = normalize(sourceStatus.name);
  const to = normalize(destinationStatus.name);

  const allowed =
    (from === 'a faire' && to === 'en cours') ||
    (from === 'en cours' && to === 'a valider');

  if (!allowed) {
    throw new Error(
      'Transition interdite. Respectez les étapes du workflow. ' +
      'Pour approuver ou demander une correction, ' +
      'ouvrez les détails de la tâche.'
    );
  }
}

await moveTask(task.id, target.statusId, beforeTaskId);
    } catch (error) {
      Alert.alert(
        'Déplacement impossible',
        error instanceof Error ? error.message : "L'ordre de la tâche n'a pas été enregistré."
      );
    } finally {
      busyRef.current = false;
      setSavingTaskId(null);
    }
  };

  const draggedTask = tasks.find(task => task.id === draggedId);

  if (!project) {
    return <Screen title="Projet" back><EmptyState text="Projet introuvable." /></Screen>;
  }

  return (
    <View ref={rootRef} style={s.root}>
      <Screen title="Accueil" back scroll={false}>
        <ScrollView
          ref={pageScrollRef}
          style={s.pageScroll}
          scrollEnabled={!draggedId}
          onScroll={event => { pageScrollYRef.current = event.nativeEvent.contentOffset.y; }}
          onContentSizeChange={(_width, height) => { pageContentHeightRef.current = height; }}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.pageContent}
        >
        <View style={s.headerRow}>
          <Text style={s.kicker}>● SPRINT ACTIF • DEMO</Text>
          <Pressable onPress={() => nav.navigate('ProjectSettings', { projectId: project.id })}>
            <Ionicons name="ellipsis-horizontal-circle" size={30} color={palette.mutedDark} />
          </Pressable>
        </View>

        <Text style={s.heading}>{project.title}</Text>
        <View style={s.members}>
          <View style={s.avatarRow}>
            {members.slice(0, 3).map(member => (
              <Avatar key={member.userId} name={data?.users.find(user => user.id === member.userId)?.name ?? 'M'} size={34} />
            ))}
          </View>
          <Pressable onPress={() => nav.navigate('MembersPermissions', { projectId: project.id })}>
            <Text style={s.link}>{members.length} membres ▾</Text>
          </Pressable>
          <Text style={s.progress}>{projectProgress(tasks, doneIds)}%</Text>
        </View>

        <View style={s.controls}>
          <Text style={s.boardTitle}>▣ Tableau Kanban</Text>
          <Pressable onPress={() => nav.navigate('Search')}>
            <Ionicons name="search" size={25} color={palette.mutedDark} />
          </Pressable>
          <Pressable onPress={() => nav.navigate('StatusEditor', { projectId: project.id })}>
            <Ionicons name="options-outline" size={26} color={palette.mutedDark} />
          </Pressable>
        </View>
        <Text style={s.hint}>
          {canMove
            ? 'Maintenez une carte et glissez-la vers sa place, même dans une autre colonne.'
            : 'Consultation du tableau en lecture seule.'}
        </Text>

        <ScrollView
          ref={boardRef}
          horizontal
          scrollEnabled={!draggedId}
          onScroll={event => { scrollXRef.current = event.nativeEvent.contentOffset.x; }}
          onContentSizeChange={width => { contentWidthRef.current = width; }}
          scrollEventThrottle={16}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.boardContent}
        >
          {orderedStatuses.map(status => {
            const cards = tasks.filter(t => t.statusId === status.id);
            const highlighted = draggedId !== null && drop?.statusId === status.id;
            const others = cards.filter(t => t.id !== draggedId);
            const insertIndex = highlighted ? drop!.index : -1;

            const gap = (index: number) => highlighted && insertIndex === index ? (
              <View key={`gap-${status.id}-${index}`} pointerEvents="none" style={s.insertGap}>
                <View style={s.insertLine} />
                <Text style={s.insertText}>Déposer ici</Text>
              </View>
            ) : null;

            return (
              <View
                key={status.id}
                style={[s.column, highlighted && s.dropTarget]}
                onLayout={event => {
                  columnsRef.current[status.id] = {
                    x: event.nativeEvent.layout.x,
                    width: event.nativeEvent.layout.width,
                  };
                }}
              >
                <View style={s.colHeader}>
                  <View style={[s.dot, { backgroundColor: status.color }]} />
                  <Text style={s.colTitle}>{status.name}</Text>
                  <Text style={s.count}>{cards.length}</Text>
                </View>

                {/* Ordre reel des cartes, y compris celle en train d'etre deplacee. */}
                {cards.map((task) => {
                  const idx = others.findIndex(t => t.id === task.id);
                  const preceding = idx >= 0 ? gap(idx) : null;
                  return (
                    <React.Fragment key={task.id}>
                      {preceding}
                      <View
                        onLayout={event => {
                          if (!cardsRef.current[status.id]) cardsRef.current[status.id] = {};
                          cardsRef.current[status.id][task.id] = {
                            y: event.nativeEvent.layout.y,
                            height: event.nativeEvent.layout.height,
                          };
                        }}
                      >
                        <TaskCard
                          task={task}
                          onPress={() => nav.navigate('TaskDetails', { taskId: task.id })}
                          onDragStart={canMove ? (x, y) => startDrag(task.id, x, y) : undefined}
                          onDragMove={canMove ? updateDrag : undefined}
                          onDragEnd={canMove ? finishDrag : undefined}
                          onDragCancel={canMove ? resetDrag : undefined}
                          isDragging={draggedId === task.id}
                          disabled={savingTaskId !== null}
                        />
                      </View>
                    </React.Fragment>
                  );
                })}
                {gap(others.length)}

                {firstStatus?.id === status.id && canMove && (
                  <Pressable
                    style={s.add}
                    onPress={() => nav.navigate('NewTask', {
                      projectId: project.id,
                      statusId: firstStatus.id,
                    })}
                  >
                    <Text style={s.link}>＋ Nouvelle tâche</Text>
                  </Pressable>
                )}
              </View>
            );
          })}
        </ScrollView>

        <Button
          title="＋ Ajouter un état"
          variant="soft"
          onPress={() => nav.navigate('StatusEditor', { projectId: project.id })}
        />

        <View style={s.cadence}>
          <Ionicons name="trending-up" size={29} color={palette.primary} />
          <View style={{ flex: 1 }}>
            <Text style={s.cadenceTitle}>Cadence du Sprint</Text>
            <Text style={s.cadenceText}>
              {tasks.filter(task => doneIds.includes(task.statusId)).length} tâche(s) terminée(s) sur {tasks.length}
            </Text>
          </View>
        </View>
        {savingTaskId && (
          <View style={s.saving}>
            <ActivityIndicator color={palette.primary} />
            <Text style={s.hint}>Enregistrement du déplacement…</Text>
          </View>
        )}
        </ScrollView>
      </Screen>

      {/* Carte flottante. Les gestes restent controles par la carte d'origine. */}
      {draggedTask && (
        <Animated.View
          pointerEvents="none"
          style={[s.dragPreview, { transform: floating.getTranslateTransform() }]}
        >
          <PriorityChip priority={draggedTask.priority} />
          <Text style={s.dragTitle} numberOfLines={2}>{draggedTask.title}</Text>
          <Text style={s.dragDesc} numberOfLines={2}>{draggedTask.description || 'Aucune description'}</Text>
        </Animated.View>
      )}
    </View>
  );
}

const makeThemeStyles_s = (palette:ThemePalette)=>StyleSheet.create({
  root: { flex: 1 },
  pageScroll: { flex: 1 },
  pageContent: { paddingBottom: 64 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  kicker: { color: palette.mutedDark, letterSpacing: 1 },
  heading: { fontSize: 29, fontWeight: '800', color: palette.ink, marginTop: 12 },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  members: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 22 },
  link: { color: palette.primaryDark, fontWeight: '700', fontSize: 14 },
  progress: { marginLeft: 'auto', color: palette.ink, fontWeight: '800' },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 22, marginBottom: 16 },
  boardTitle: { backgroundColor: palette.lilac, borderRadius: radius.pill, padding: 13, fontWeight: '700', color: palette.ink, flex: 1, textAlign: 'center' },
  hint: { color: palette.mutedDark, fontSize: 12, marginBottom: 12 },
  boardContent: { gap: 14, paddingBottom: 14 },
  column: { width: COLUMN_WIDTH, backgroundColor: palette.subtle, padding: 13, borderRadius: radius.lg, minHeight: 240, borderWidth: 2, borderColor: 'transparent' },
  dropTarget: { borderColor: palette.primary, backgroundColor: palette.lilac },
  colHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 13 },
  dot: { width: 13, height: 13, borderRadius: 7 },
  colTitle: { fontSize: 16, color: palette.ink, fontWeight: '700', flexShrink: 1 },
  count: { color: palette.mutedDark, backgroundColor: palette.white, borderRadius: 20, paddingHorizontal: 9, paddingVertical: 4 },
  add: { backgroundColor: '#EBE8E8', borderRadius: radius.md, alignItems: 'center', padding: 15, marginTop: 9 },
  insertGap: { height: 34, borderRadius: radius.md, marginVertical: 5, justifyContent: 'center', alignItems: 'center' },
  insertLine: { position: 'absolute', left: 0, right: 0, height: 3, borderRadius: 2, backgroundColor: palette.primary },
  insertText: { color: palette.primaryDark, backgroundColor: palette.lilac, paddingHorizontal: 8, fontSize: 12, fontWeight: '700' },
  cadence: { flexDirection: 'row', gap: 15, padding: 19, alignItems: 'center', backgroundColor: palette.white, borderRadius: radius.lg, marginTop: 17 },
  cadenceTitle: { fontWeight: '700', color: palette.ink },
  cadenceText: { color: palette.mutedDark },
  saving: { flexDirection: 'row', gap: 12, alignItems: 'center', marginTop: 12 },
  dragPreview: { position: 'absolute', left: 0, top: 0, width: 245, padding: 14, borderRadius: radius.lg, borderWidth: 2, borderColor: palette.primary, backgroundColor: palette.white, elevation: 16, zIndex: 1000 },
  dragTitle: { color: palette.ink, fontSize: 17, fontWeight: '800', marginTop: 8 },
  dragDesc: { color: palette.mutedDark, fontSize: 13, marginTop: 6 },
});
