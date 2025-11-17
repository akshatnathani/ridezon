# Ridezon Design System - Quick Reference

## 🎨 Color Tokens

### Primary
```typescript
theme.colors.primary        // #00C46A - Main green
theme.colors.primaryDark    // #00A657 - Pressed state
theme.colors.primaryLight   // #E6F9F1 - Backgrounds
```

### Neutrals
```typescript
theme.colors.black          // #050505 - Pure black
theme.colors.gray900        // #111827 - Primary text
theme.colors.gray700        // #374151
theme.colors.gray600        // #4B5563 - Secondary text
theme.colors.gray500        // #6B7280
theme.colors.gray400        // #9CA3AF - Tertiary text/placeholders
theme.colors.gray300        // #D1D5DB
theme.colors.gray200        // #E5E7EB - Borders
theme.colors.gray100        // #F3F4F6 - Card backgrounds
theme.colors.gray50         // #F9FAFB - Page backgrounds
theme.colors.white          // #FFFFFF
```

### Semantic
```typescript
theme.colors.success        // #00C46A
theme.colors.warning        // #F59E0B
theme.colors.error          // #EF4444
theme.colors.info           // #3B82F6
```

### Backgrounds
```typescript
theme.colors.background              // #FFFFFF - Main
theme.colors.backgroundSecondary     // #F9FAFB - Secondary
theme.colors.surface                 // #FFFFFF - Cards
theme.colors.surfaceElevated         // #FFFFFF - Elevated cards
```

### Text
```typescript
theme.colors.textPrimary    // #111827 - Headings, important text
theme.colors.textSecondary  // #4B5563 - Body text
theme.colors.textTertiary   // #9CA3AF - Captions, placeholders
theme.colors.textInverse    // #FFFFFF - Text on dark backgrounds
```

---

## 📏 Spacing Scale

```typescript
theme.spacing.xs      // 4px   - Very tight
theme.spacing.sm      // 8px   - Tight
theme.spacing.md      // 12px  - Comfortable
theme.spacing.base    // 16px  - Standard (most used)
theme.spacing.lg      // 20px  - Loose
theme.spacing.xl      // 24px  - Very loose (between sections)
theme.spacing.xxl     // 32px  - Extra loose
theme.spacing.xxxl    // 40px  - Very extra loose
theme.spacing.xxxxl   // 48px  - Maximum (header top padding on iOS)
```

### Common Usage
```typescript
// Screen padding
paddingHorizontal: theme.spacing.base    // 16px

// Between sections
marginBottom: theme.spacing.xl           // 24px

// Between components
marginBottom: theme.spacing.base         // 16px

// Card internal padding
padding: theme.spacing.base              // 16px

// Small gaps
gap: theme.spacing.sm                    // 8px
```

---

## 🔤 Typography

### Headings
```typescript
theme.typography.headingXL   // 28px, weight 600 - Screen titles
theme.typography.headingL    // 22px, weight 600 - Section titles
theme.typography.headingM    // 18px, weight 600 - Subsections
theme.typography.headingS    // 16px, weight 600 - Small headings
```

### Body
```typescript
theme.typography.bodyL       // 16px, weight 400 - Large body
theme.typography.bodyM       // 15px, weight 400 - Standard body (most used)
theme.typography.bodyS       // 14px, weight 400 - Small body
```

### Captions
```typescript
theme.typography.captionL    // 13px, weight 400 - Large captions
theme.typography.captionM    // 12px, weight 400 - Standard captions
theme.typography.captionS    // 11px, weight 400 - Tiny text
```

### Buttons
```typescript
theme.typography.button      // 16px, weight 600 - Standard buttons
theme.typography.buttonSmall // 14px, weight 600 - Small buttons
```

### Usage Example
```typescript
<Text style={theme.typography.headingXL}>Find your ride</Text>
<Text style={theme.typography.bodyM}>Regular text here</Text>
<Text style={{...theme.typography.captionL, color: theme.colors.textSecondary}}>
  Small caption
</Text>
```

---

## 🔘 Border Radius

```typescript
theme.radius.xs      // 4px
theme.radius.sm      // 8px
theme.radius.md      // 12px  - Most cards
theme.radius.lg      // 16px  - Large cards
theme.radius.xl      // 20px
theme.radius.xxl     // 24px
theme.radius.full    // 9999px - Pills, circular buttons
```

### Common Usage
```typescript
borderRadius: theme.radius.lg        // Cards
borderRadius: theme.radius.md        // Inputs
borderRadius: theme.radius.full      // Pills, avatars, circular buttons
```

---

## 🎭 Shadows

```typescript
theme.shadows.none   // No shadow
theme.shadows.sm     // Subtle shadow
theme.shadows.md     // Standard shadow (most cards)
theme.shadows.lg     // Elevated shadow (ride cards)
theme.shadows.xl     // Very elevated (FAB)
```

### Usage
```typescript
// Spread the shadow object
...theme.shadows.md

// Or use with Card component
<Card shadow="lg">
```

---

## 🧩 Component Library

### Button
```typescript
<Button 
  title="Search rides"
  variant="primary"     // primary | secondary | ghost | danger
  size="lg"             // sm | md | lg | xl
  onPress={handlePress}
  fullWidth
  leftIcon={<Icon />}
  isLoading={loading}
  disabled={false}
/>
```

### Card
```typescript
<Card shadow="md" style={customStyles} onPress={handleTap}>
  {children}
</Card>
```

### Badge
```typescript
<Badge 
  text="Active" 
  variant="success"     // success | warning | error | info | neutral
  size="md"             // sm | md
/>
```

### Tag (Chip)
```typescript
<Tag 
  text="Today"
  selected={isSelected}
  onPress={handleSelect}
  leftIcon={<Icon />}
/>
```

### SectionHeader
```typescript
<SectionHeader 
  title="Popular locations"
  subtitle="Tap to quickly fill"
  rightAction={{
    label: "See all",
    onPress: handleSeeAll
  }}
/>
```

### EmptyState
```typescript
<EmptyState
  icon={<Text style={styles.icon}>🚗</Text>}
  title="No rides available"
  subtitle="Be the first to create a ride"
  action={{
    label: "Create Ride",
    onPress: handleCreate
  }}
/>
```

### BottomActionBar
```typescript
<BottomActionBar>
  <Button title="Continue" variant="primary" size="lg" fullWidth />
</BottomActionBar>
```

---

## 📐 Layout Patterns

### Screen Structure
```typescript
<View style={styles.container}>
  {/* Header */}
  <View style={styles.header}>
    <Text style={theme.typography.headingXL}>Screen Title</Text>
  </View>

  {/* Content */}
  <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
    {/* Sections */}
  </ScrollView>

  {/* Fixed Bottom */}
  <BottomActionBar>
    <Button title="Action" variant="primary" size="lg" fullWidth />
  </BottomActionBar>
</View>
```

### Card Layout
```typescript
<Card shadow="md" style={styles.card}>
  {/* Header */}
  <View style={styles.cardHeader}>
    <Text style={theme.typography.headingM}>Card Title</Text>
  </View>

  {/* Body */}
  <View style={styles.cardBody}>
    <Text style={theme.typography.bodyM}>Content here</Text>
  </View>

  {/* Footer */}
  <View style={styles.cardFooter}>
    <Button title="Action" variant="primary" size="md" />
  </View>
</Card>
```

### Input Card
```typescript
<View style={styles.inputCard}>
  <View style={styles.inputRow}>
    <View style={styles.inputIcon}>
      {/* Icon */}
    </View>
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>Label</Text>
      <TextInput
        style={styles.input}
        placeholder="Placeholder"
        placeholderTextColor={theme.colors.textTertiary}
      />
    </View>
  </View>
</View>
```

---

## 🎯 Design Principles

### 1. Always Use Theme Tokens
❌ **Don't:**
```typescript
color: '#00C46A'
padding: 16
fontSize: 24
```

✅ **Do:**
```typescript
color: theme.colors.primary
padding: theme.spacing.base
...theme.typography.headingL
```

### 2. Use Primitive Components
❌ **Don't:**
```typescript
<TouchableOpacity style={customButtonStyle}>
  <Text style={customTextStyle}>Click me</Text>
</TouchableOpacity>
```

✅ **Do:**
```typescript
<Button title="Click me" variant="primary" size="lg" />
```

### 3. Consistent Spacing
❌ **Don't:**
```typescript
marginBottom: 20
gap: 15
paddingVertical: 10
```

✅ **Do:**
```typescript
marginBottom: theme.spacing.lg
gap: theme.spacing.base
paddingVertical: theme.spacing.md
```

### 4. Typography Hierarchy
❌ **Don't:**
```typescript
<Text style={{fontSize: 28, fontWeight: 'bold'}}>Title</Text>
<Text style={{fontSize: 15}}>Body</Text>
```

✅ **Do:**
```typescript
<Text style={theme.typography.headingXL}>Title</Text>
<Text style={theme.typography.bodyM}>Body</Text>
```

### 5. Color Semantic Usage
❌ **Don't:**
```typescript
color: '#00C46A'  // For any text
backgroundColor: '#000000'  // For any background
```

✅ **Do:**
```typescript
// For primary actions
backgroundColor: theme.colors.primary

// For text
color: theme.colors.textPrimary  // Headings
color: theme.colors.textSecondary  // Body
color: theme.colors.textTertiary  // Captions
```

---

## 📱 Platform-Specific Styles

### iOS vs Android
```typescript
// Header top padding
paddingTop: Platform.OS === 'ios' ? theme.spacing.xxxxl : theme.spacing.base

// Shadows (prefer theme.shadows)
...Platform.select({
  ios: theme.shadows.md,
  android: { elevation: 2 }
})
```

---

## 🚀 Quick Start Templates

### New Screen Template
```typescript
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { theme } from '@/constants/theme';
import { Button, Card, BottomActionBar } from '@/components/ui/primitives';

export default function NewScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Screen Title</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Card shadow="md">
          <Text style={theme.typography.bodyM}>Content</Text>
        </Card>
      </ScrollView>

      <BottomActionBar>
        <Button title="Action" variant="primary" size="lg" fullWidth />
      </BottomActionBar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  header: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.base,
    paddingTop: theme.spacing.xxxxl,
    paddingBottom: theme.spacing.base,
  },
  headerTitle: {
    ...theme.typography.headingXL,
    color: theme.colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.base,
    paddingBottom: 120,
  },
});
```

---

## 🎨 Color Usage Guide

### When to Use Each Color

**Primary Green (#00C46A)**
- ✅ Primary CTA buttons
- ✅ Selected states
- ✅ Important badges
- ✅ Links
- ❌ Not for large backgrounds
- ❌ Not for all text

**Gray Scale**
- **gray900**: Primary text, headings
- **gray600**: Secondary text, body copy
- **gray400**: Tertiary text, placeholders
- **gray200**: Borders, dividers
- **gray100**: Card backgrounds, button secondary
- **gray50**: Page backgrounds

**White**
- Surface backgrounds
- Card backgrounds
- Button text on green
- Icons on dark backgrounds

**Black (#050505)**
- Only for very bold text where needed
- Not the default for text (use gray900)

---

## ✨ Best Practices

### Spacing
- Use `theme.spacing.base` (16px) as the default
- Use `theme.spacing.xl` (24px) between major sections
- Use `theme.spacing.sm` (8px) for tight groups
- Use `theme.spacing.md` (12px) for internal card padding

### Typography
- Always use theme typography presets
- Don't mix font weights (use 400 or 600 only)
- Use line height from presets
- Adjust color separately: `{...theme.typography.bodyM, color: theme.colors.textSecondary}`

### Components
- Prefer primitive components over custom TouchableOpacity/View combos
- Extend primitives with style props, don't recreate
- Keep component-specific styles minimal
- Use Card for all container elements

### Performance
- Avoid inline styles where possible
- Use StyleSheet.create
- Memoize expensive components
- Keep shadow usage minimal (only where needed)

---

## 📊 Checklist for New Screens

- [ ] Import theme from `@/constants/theme`
- [ ] Import primitives from `@/components/ui/primitives`
- [ ] Use `theme.colors.*` for all colors
- [ ] Use `theme.spacing.*` for all spacing
- [ ] Use `theme.typography.*` for all text
- [ ] Use `theme.radius.*` for border radius
- [ ] Use `theme.shadows.*` for shadows
- [ ] Use Button component for CTAs
- [ ] Use Card component for containers
- [ ] Use BottomActionBar for fixed buttons
- [ ] No magic numbers in styles
- [ ] Platform-specific handling where needed
- [ ] TypeScript types for props
- [ ] Test on both iOS and Android

---

This design system ensures:
✅ Visual consistency across all screens
✅ Fast development with reusable components
✅ Easy maintenance with centralized tokens
✅ Premium, investor-ready UI quality
