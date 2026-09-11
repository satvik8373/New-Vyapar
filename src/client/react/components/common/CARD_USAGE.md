# Premium Card Component Usage Guide

## Overview
The enhanced `AppCard` component provides premium, floating card designs with luxurious aesthetics and smooth animations that maintain your theme style.

## Features
✨ **6 Premium Variants** - From standard to luxury glass effects  
🎨 **Theme Integration** - Seamlessly matches your design system  
✨ **Glow Effects** - Optional animated border glow  
🌟 **Shimmer Animation** - Elegant hover shimmer effect  
🎯 **Interactive States** - Smooth hover and active animations  
📱 **Fully Responsive** - Works on all screen sizes  

## Variants

### 1. Standard (`standard`)
```tsx
<AppCard variant="standard">
  <Typography>Clean minimal card</Typography>
</AppCard>
```
- Clean white background
- Subtle shadow
- Perfect for general content

### 2. Elevated (`elevated`)
```tsx
<AppCard variant="elevated" interactive>
  <Typography>Lifted card with gradient</Typography>
</AppCard>
```
- Gradient background
- Medium shadow lift
- Great for content cards

### 3. Premium (`premium`) ⭐
```tsx
<AppCard variant="premium" interactive glow shimmer>
  <Typography>Luxury floating card</Typography>
</AppCard>
```
- Multi-layer shadows
- Gradient background with blur
- Inset highlight
- Perfect for hero sections and featured content

### 4. Glass (`glass`)
```tsx
<AppCard variant="glass" interactive glow>
  <Typography>Glassmorphic design</Typography>
</AppCard>
```
- Frosted glass effect
- Backdrop blur
- Semi-transparent
- Modern and elegant

### 5. Outlined (`outlined`)
```tsx
<AppCard variant="outlined" interactive>
  <Typography>Border emphasis</Typography>
</AppCard>
```
- Clean border
- No shadow
- Minimal and crisp

### 6. Flat (`flat`)
```tsx
<AppCard variant="flat">
  <Typography>Minimal design</Typography>
</AppCard>
```
- No shadows
- Subtle border
- Ultra-minimal

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `AppCardVariant` | `'standard'` | Card style variant |
| `interactive` | `boolean` | `false` | Enable hover/active animations |
| `padded` | `boolean` | `true` | Add internal padding |
| `glow` | `boolean` | `false` | Add animated border glow on hover |
| `shimmer` | `boolean` | `false` | Add shimmer animation on hover |
| `sx` | `SxProps` | - | Material-UI style overrides |

## Examples

### Statistics Card
```tsx
<AppCard variant="premium" interactive>
  <Box>
    <Typography variant="body2" color="text.secondary" fontWeight={700}>
      TOTAL REVENUE
    </Typography>
    <Typography variant="h2" fontSize="32px" fontWeight={900}>
      ₹12,500
    </Typography>
    <Chip label="+12.5%" size="small" />
  </Box>
</AppCard>
```

### Property Card
```tsx
<AppCard variant="premium" interactive shimmer glow>
  <Box>
    <Box sx={{ height: 8, background: '#f59e0b', borderRadius: '6px', mb: 2 }} />
    <Typography variant="h4">Ahmedabad</Typography>
    <Typography variant="h3" color="#f59e0b">₹3,000</Typography>
    <AppButton variant="primary" size="small">Buy Property</AppButton>
  </Box>
</AppCard>
```

### Dashboard Widget
```tsx
<AppCard variant="glass" interactive glow>
  <Stack spacing={2}>
    <Box display="flex" alignItems="center" gap={1}>
      <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
      <Typography fontWeight={700}>Active Players</Typography>
    </Box>
    <Typography variant="h2">24</Typography>
  </Stack>
</AppCard>
```

### User Profile Card
```tsx
<AppCard variant="elevated" interactive sx={{ maxWidth: 400 }}>
  <Stack spacing={2} alignItems="center">
    <Box
      sx={{
        width: 80,
        height: 80,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography variant="h2" color="white">SK</Typography>
    </Box>
    <Typography variant="h4">Satvik Kumar</Typography>
    <Typography variant="body2" color="text.secondary">
      Level 15 Tycoon
    </Typography>
    <AppButton variant="primary" fullWidth>View Profile</AppButton>
  </Stack>
</AppCard>
```

## Animation Details

### Hover Effects
- **Premium/Glass**: `translateY(-4px) scale(1.01)` with enhanced shadows
- **Elevated/Standard**: `translateY(-2px)` with medium shadow
- **Transition**: `0.3s cubic-bezier(0.16, 1, 0.3, 1)` for smooth motion

### Glow Effect
- Animated gradient border on hover
- Colors: Blue → Purple → Green
- Only works with `premium` and `glass` variants
- Enable with `glow` prop

### Shimmer Effect
- Left-to-right shine animation on hover
- White gradient overlay
- Enable with `shimmer` prop
- Perfect for call-to-action cards

## Best Practices

### 1. Use Premium for Important Content
```tsx
// ✅ Good - Hero section
<AppCard variant="premium" interactive glow shimmer>
  <Typography variant="h2">Featured Property</Typography>
</AppCard>

// ❌ Avoid - Overusing premium style
<AppCard variant="premium">
  <Typography variant="body2">Small note</Typography>
</AppCard>
```

### 2. Combine Interactive with Variants
```tsx
// ✅ Good - Interactive cards
<AppCard variant="elevated" interactive>
  {/* Clickable content */}
</AppCard>

// ✅ Also Good - Static cards without interaction
<AppCard variant="standard">
  {/* Display-only content */}
</AppCard>
```

### 3. Match Variant to Context
```tsx
// Hero sections → premium, glass
<AppCard variant="premium" interactive glow shimmer />

// Content cards → elevated, standard
<AppCard variant="elevated" interactive />

// Subtle backgrounds → flat, outlined
<AppCard variant="flat" />
```

### 4. Don't Overuse Effects
```tsx
// ✅ Good - Selective effects
<AppCard variant="premium" glow> {/* Just glow */}

// ⚠️ Careful - All effects at once
<AppCard variant="premium" glow shimmer interactive>
  {/* Use only for very important cards */}
</AppCard>
```

## Responsive Behavior
All cards automatically adjust padding and sizing for mobile:
- `xs`: Smaller padding (16px)
- `sm+`: Standard padding (20px)

## Performance Tips
1. Use `interactive={false}` for static cards to reduce DOM overhead
2. Limit `glow` and `shimmer` to 3-5 cards per screen
3. Use lighter variants (`standard`, `flat`) for long lists

## Integration with Your Theme
All cards use your existing theme colors:
- Primary: `#0f172a` (Slate Velvet)
- Secondary: `#3b82f6` (Candy Azure Sky)
- Success: `#10b981` (Mint Emerald)
- Warning: `#f59e0b` (Honey Amber)

The cards automatically inherit your `Plus Jakarta Sans` font family and spacing system.

## Testing
View all variants in action:
```tsx
import { PremiumCardShowcase } from './components/common/PremiumCardShowcase';

// In your development route
<PremiumCardShowcase />
```

## Migration from Old Card
```tsx
// Before
<AppCard interactive padded>
  <Content />
</AppCard>

// After - Same behavior (default is 'standard')
<AppCard interactive padded>
  <Content />
</AppCard>

// Or upgrade to premium
<AppCard variant="premium" interactive padded>
  <Content />
</AppCard>
```
