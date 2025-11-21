import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
    Platform,
    ScrollView,
} from 'react-native';
import { theme } from '@/constants/theme';
import { Button } from './primitives';

interface DateTimePickerProps {
    visible: boolean;
    mode: 'date' | 'time';
    value?: Date;
    onClose: () => void;
    onSelect: (date: Date) => void;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
    visible,
    mode,
    value = new Date(),
    onClose,
    onSelect,
}) => {
    const [selectedDate, setSelectedDate] = useState(value);

    // Generate next 30 days for date picker
    const dates = useMemo(() => {
        const result = [];
        const today = new Date();
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            result.push(date);
        }
        return result;
    }, []);

    // Generate hours and minutes for time picker
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

    const handleDateSelect = (date: Date) => {
        const newDate = new Date(selectedDate);
        newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
        setSelectedDate(newDate);
    };

    const handleTimeSelect = (type: 'hour' | 'minute', val: number) => {
        const newDate = new Date(selectedDate);
        if (type === 'hour') {
            newDate.setHours(val);
        } else {
            newDate.setMinutes(val);
        }
        setSelectedDate(newDate);
    };

    const handleConfirm = () => {
        onSelect(selectedDate);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
                <TouchableOpacity activeOpacity={1} style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.title}>
                            Select {mode === 'date' ? 'Date' : 'Time'}
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.closeText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {mode === 'date' ? (
                        <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
                            {dates.map((date, index) => {
                                const isSelected =
                                    date.getDate() === selectedDate.getDate() &&
                                    date.getMonth() === selectedDate.getMonth();

                                const isToday = new Date().toDateString() === date.toDateString();
                                const isTomorrow = new Date(new Date().setDate(new Date().getDate() + 1)).toDateString() === date.toDateString();

                                let label = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                                if (isToday) label = 'Today';
                                if (isTomorrow) label = 'Tomorrow';

                                return (
                                    <TouchableOpacity
                                        key={index}
                                        style={[styles.option, isSelected && styles.optionSelected]}
                                        onPress={() => handleDateSelect(date)}
                                    >
                                        <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                                            {label}
                                        </Text>
                                        {isSelected && <Text style={styles.checkmark}>✓</Text>}
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    ) : (
                        <View style={styles.timeContainer}>
                            <View style={styles.timeColumn}>
                                <Text style={styles.timeLabel}>Hour</Text>
                                <ScrollView style={styles.timeList} showsVerticalScrollIndicator={false}>
                                    {hours.map((h) => (
                                        <TouchableOpacity
                                            key={h}
                                            style={[
                                                styles.timeOption,
                                                selectedDate.getHours() === h && styles.timeOptionSelected,
                                            ]}
                                            onPress={() => handleTimeSelect('hour', h)}
                                        >
                                            <Text
                                                style={[
                                                    styles.timeText,
                                                    selectedDate.getHours() === h && styles.timeTextSelected,
                                                ]}
                                            >
                                                {h.toString().padStart(2, '0')}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                            <Text style={styles.timeSeparator}>:</Text>
                            <View style={styles.timeColumn}>
                                <Text style={styles.timeLabel}>Minute</Text>
                                <ScrollView style={styles.timeList} showsVerticalScrollIndicator={false}>
                                    {minutes.map((m) => (
                                        <TouchableOpacity
                                            key={m}
                                            style={[
                                                styles.timeOption,
                                                selectedDate.getMinutes() === m && styles.timeOptionSelected,
                                            ]}
                                            onPress={() => handleTimeSelect('minute', m)}
                                        >
                                            <Text
                                                style={[
                                                    styles.timeText,
                                                    selectedDate.getMinutes() === m && styles.timeTextSelected,
                                                ]}
                                            >
                                                {m.toString().padStart(2, '0')}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        </View>
                    )}

                    <View style={styles.footer}>
                        <Button title="Confirm" onPress={handleConfirm} fullWidth />
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    content: {
        backgroundColor: theme.colors.white,
        borderTopLeftRadius: theme.radius.xl,
        borderTopRightRadius: theme.radius.xl,
        padding: theme.spacing.lg,
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
    },
    title: {
        ...theme.typography.headingS,
        color: theme.colors.textPrimary,
    },
    closeText: {
        fontSize: 24,
        color: theme.colors.textSecondary,
        padding: theme.spacing.xs,
    },
    listContainer: {
        maxHeight: 300,
    },
    option: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    optionSelected: {
        backgroundColor: theme.colors.primaryLight,
        borderRadius: theme.radius.md,
        borderBottomWidth: 0,
    },
    optionText: {
        ...theme.typography.bodyM,
        color: theme.colors.textPrimary,
    },
    optionTextSelected: {
        color: theme.colors.primaryDark,
        fontWeight: '600',
    },
    checkmark: {
        color: theme.colors.primary,
        fontWeight: 'bold',
    },
    timeContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 200,
        gap: theme.spacing.md,
    },
    timeColumn: {
        flex: 1,
        height: '100%',
        alignItems: 'center',
    },
    timeLabel: {
        ...theme.typography.captionM,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.sm,
    },
    timeList: {
        width: '100%',
    },
    timeOption: {
        paddingVertical: theme.spacing.sm,
        alignItems: 'center',
        borderRadius: theme.radius.md,
    },
    timeOptionSelected: {
        backgroundColor: theme.colors.primary,
    },
    timeText: {
        fontSize: 24,
        color: theme.colors.textPrimary,
    },
    timeTextSelected: {
        color: theme.colors.white,
        fontWeight: '700',
    },
    timeSeparator: {
        fontSize: 32,
        fontWeight: '700',
        color: theme.colors.textPrimary,
        marginBottom: 20,
    },
    footer: {
        marginTop: theme.spacing.lg,
    },
});
