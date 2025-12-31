import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const MAPPING = {
    'person.fill': 'account',
    'trophy.fill': 'trophy',
    'envelope.fill': 'email',
    'lock.fill': 'lock',
    'globe': 'globe-model',
};

export function IconSymbol({ name, size, color, style }) {
    const iconName = MAPPING[name] || 'help-circle';
    return <MaterialCommunityIcons name={iconName} size={size} color={color} style={style} />;
}
