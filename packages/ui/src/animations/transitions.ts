import type { Transition } from 'framer-motion';

export const springTransition: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
};

export const springBouncy: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 25,
};

export const springGentle: Transition = {
  type: 'spring',
  stiffness: 200,
  damping: 20,
};

export const easeInOut: Transition = {
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1],
};

export const easeOut: Transition = {
  duration: 0.2,
  ease: [0, 0, 0.2, 1],
};

export const easeIn: Transition = {
  duration: 0.2,
  ease: [0.4, 0, 1, 1],
};

export const fastTransition: Transition = {
  duration: 0.15,
  ease: 'linear',
};

export const slowTransition: Transition = {
  duration: 0.5,
  ease: [0.4, 0, 0.2, 1],
};
