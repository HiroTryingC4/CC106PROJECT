import {
  BellIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  CreditCardIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  UserIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { format, formatDistanceToNow } from 'date-fns';

const USER_PRESETS = [
  {
    match: (type) => type.includes('booking'),
    value: {
      icon: CalendarDaysIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      priority: 'high',
      actionRequired: true
    }
  },
  {
    match: (type) => type.includes('payment'),
    value: {
      icon: CreditCardIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      priority: 'medium',
      actionRequired: true
    }
  },
  {
    match: (type) => type.includes('message'),
    value: {
      icon: ChatBubbleLeftRightIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      priority: 'medium',
      actionRequired: true
    }
  },
  {
    match: (type) => type.includes('review'),
    value: {
      icon: UserIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      priority: 'low',
      actionRequired: false
    }
  },
  {
    match: (type) => type.includes('system'),
    value: {
      icon: InformationCircleIcon,
      color: 'text-slate-600',
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-200',
      priority: 'low',
      actionRequired: false
    }
  }
];

const ADMIN_PRESETS = [
  {
    match: (type) => type.includes('security') || type.includes('verification'),
    value: {
      icon: ExclamationTriangleIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      priority: 'high',
      actionRequired: true
    }
  },
  {
    match: (type) => type.includes('user'),
    value: {
      icon: UserIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      priority: 'medium',
      actionRequired: false
    }
  },
  {
    match: (type) => type.includes('financial') || type.includes('payment'),
    value: {
      icon: CreditCardIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      priority: 'medium',
      actionRequired: true
    }
  },
  {
    match: (type) => type.includes('message') || type.includes('chat'),
    value: {
      icon: ChatBubbleLeftRightIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      priority: 'medium',
      actionRequired: false
    }
  },
  {
    match: (type) => type.includes('chatbot'),
    value: {
      icon: CheckCircleIcon,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      borderColor: 'border-cyan-200',
      priority: 'low',
      actionRequired: false
    }
  },
  {
    match: (type) => type.includes('system'),
    value: {
      icon: InformationCircleIcon,
      color: 'text-slate-600',
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-200',
      priority: 'low',
      actionRequired: false
    }
  }
];

const DEFAULT_PRESET = {
  icon: BellIcon,
  color: 'text-green-600',
  bgColor: 'bg-green-50',
  borderColor: 'border-green-200',
  priority: 'medium',
  actionRequired: false
};

const findPreset = (type, presets) => {
  const normalizedType = String(type || '').toLowerCase();
  const preset = presets.find((entry) => entry.match(normalizedType));
  return preset ? preset.value : DEFAULT_PRESET;
};

export const getNotificationPresentation = (notification, scope = 'user') => {
  const type = String(notification.type || 'general').toLowerCase();
  const preset = scope === 'admin' ? findPreset(type, ADMIN_PRESETS) : findPreset(type, USER_PRESETS);
  const isRead = Boolean(notification.isRead ?? notification.read ?? false);
  const createdAt = notification.createdAt || notification.timestamp || null;

  return {
    ...preset,
    isRead,
    actionRequired: Boolean(preset.actionRequired && !isRead),
    priority: notification.priority || preset.priority || 'medium',
    dateLabel: createdAt ? format(new Date(createdAt), 'M/d/yyyy') : '',
    timeLabel: createdAt ? formatDistanceToNow(new Date(createdAt), { addSuffix: true }) : ''
  };
};
