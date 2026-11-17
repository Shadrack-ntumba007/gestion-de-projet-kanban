import React, { useEffect, useRef } from 'react';
import { PanResponder, StyleSheet, Text, View } from 'react-native';
import type { Task } from '../../types/models';
import {radius,type ThemePalette} from '../../constants/theme';
import {useAppTheme} from '../../hooks/useAppTheme';
import { PriorityChip } from '../ui/Chips';
import { formatShortDate } from '../../utils/taskMetrics';

type Props = {
  task: Task;
  onPress: () => void;
  onLongPress?: () => void;
  onDragStart?: (x: number, y: number) => void;
  onDragMove?: (x: number, y: number) => void;
  onDragEnd?: (x: number, y: number) => void;
  onDragCancel?: () => void;
  isDragging?: boolean;
  disabled?: boolean;
};

export function TaskCard(props: Props) {
 const {palette}=useAppTheme();
 const s=makeThemeStyles_s(palette);

  // Les callbacks sont actualises sans recréer le gestionnaire tactile.
  const callbacks = useRef(props);
  callbacks.current = props;

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPress = useRef(false);
  const movedBeforeLongPress = useRef(false);
  const lastPoint = useRef({ x: 0, y: 0 });

  const clearLongPressTimer = () => {
    if (timer.current !== null) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  useEffect(() => () => clearLongPressTimer(), []);

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => false,

      onPanResponderGrant: event => {
        clearLongPressTimer();
        longPress.current = false;
        movedBeforeLongPress.current = false;
        lastPoint.current = {
          x: event.nativeEvent.pageX,
          y: event.nativeEvent.pageY,
        };

        if (callbacks.current.disabled) return;
        if (!callbacks.current.onDragStart && !callbacks.current.onLongPress) {
          return;
        }

        timer.current = setTimeout(() => {
          timer.current = null;
          if (movedBeforeLongPress.current) return;
          longPress.current = true;
          callbacks.current.onLongPress?.();
          callbacks.current.onDragStart?.(
            lastPoint.current.x,
            lastPoint.current.y
          );
        }, 400);
      },

      onPanResponderMove: (event, gesture) => {
        const x = event.nativeEvent.pageX;
        const y = event.nativeEvent.pageY;
        lastPoint.current = { x, y };

        if (!longPress.current) {
          if (Math.hypot(gesture.dx, gesture.dy) > 10) {
            movedBeforeLongPress.current = true;
            clearLongPressTimer();
          }
          return;
        }
        callbacks.current.onDragMove?.(x, y);
      },

      onPanResponderRelease: event => {
        clearLongPressTimer();
        const wasDragging = longPress.current;
        longPress.current = false;

        if (callbacks.current.disabled) return;
        if (wasDragging) {
          callbacks.current.onDragEnd?.(
            event.nativeEvent.pageX,
            event.nativeEvent.pageY
          );
        } else if (!movedBeforeLongPress.current) {
          callbacks.current.onPress();
        }
      },

      onPanResponderTerminate: () => {
        clearLongPressTimer();
        if (longPress.current) callbacks.current.onDragCancel?.();
        longPress.current = false;
        movedBeforeLongPress.current = false;
      },

      // Laisser defiler le tableau avant l'appui long, bloquer
      // la reprise du geste par le ScrollView pendant le drag.
      onPanResponderTerminationRequest: () => !longPress.current,
      onShouldBlockNativeResponder: () => longPress.current,
    })
  ).current;

  return (
    <View
      {...responder.panHandlers}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`Tâche : ${props.task.title}`}
      accessibilityHint="Touchez pour voir les détails. Maintenez pour déplacer."
      onAccessibilityTap={props.onPress}
      style={[
        s.card,
        props.isDragging && s.dragging,
        props.disabled && s.disabled,
      ]}
    >
      <PriorityChip priority={props.task.priority} />
      <Text style={s.title}>{props.task.title}</Text>
      <Text style={s.desc} numberOfLines={2}>
        {props.task.description || 'Aucune description'}
      </Text>
      <Text style={s.date}>▢ {formatShortDate(props.task.dueDate)}</Text>
    </View>
  );
}

const makeThemeStyles_s = (palette:ThemePalette)=>StyleSheet.create({
  card: {
    backgroundColor: palette.white,
    padding: 14,
    borderRadius: radius.lg,
    marginVertical: 7,
    borderWidth: 1,
    borderColor: palette.border,
  },
  dragging: { opacity: 0.3 },
  disabled: { opacity: 0.5 },
  title: {
    fontSize: 17,
    color: palette.ink,
    fontWeight: '700',
    marginTop: 11,
  },
  desc: {
    color: palette.mutedDark,
    lineHeight: 21,
    marginTop: 7,
  },
  date: {
    textAlign: 'right',
    color: palette.muted,
    marginTop: 14,
    fontSize: 13,
  },
});
