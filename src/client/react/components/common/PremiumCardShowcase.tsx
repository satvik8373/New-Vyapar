import React from 'react';
import { Box, Typography, Stack, Chip } from '@mui/material';
import { AppCard } from './AppCard';
import { AppButton } from './AppButton';

/**
 * Premium Card Showcase Component
 * Demonstrates all card variants with real-world examples
 */
export const PremiumCardShowcase: React.FC = () => {
  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #f6f8fb 0%, #e8eef5 100%)',
        p: { xs: 3, sm: 4, md: 6 },
      }}
    >
      <Stack spacing={4} maxWidth="1200px" margin="0 auto">
        {/* Header */}
        <Box textAlign="center" mb={2}>
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '32px', md: '42px' },
              fontWeight: 900,
              background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1,
            }}
          >
            Premium Card Designs
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Luxury floating cards with premium feel
          </Typography>
        </Box>

        {/* Premium Cards Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
            gap: 3,
          }}
        >
          {/* Premium Card - Main Hero */}
          <AppCard
            variant="premium"
            interactive
            glow
            shimmer
            sx={{ gridColumn: { lg: 'span 2' } }}
          >
            <Box>
              <Chip
                label="PREMIUM"
                size="small"
                sx={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '10px',
                  height: 22,
                  mb: 2,
                }}
              />
              <Typography variant="h3" gutterBottom>
                Premium Floating Card
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Luxury gradient background with multiple shadow layers, inset highlight, 
                blur effects, and smooth hover animations. Perfect for hero sections and 
                featured content.
              </Typography>
              <Stack direction="row" spacing={1.5} mt={2}>
                <AppButton variant="primary" size="medium">
                  Take Action
                </AppButton>
                <AppButton variant="outlined" size="medium">
                  Learn More
                </AppButton>
              </Stack>
            </Box>
          </AppCard>

          {/* Glass Card */}
          <AppCard variant="glass" interactive glow>
            <Box>
              <Chip
                label="GLASS"
                size="small"
                sx={{
                  background: 'rgba(59, 130, 246, 0.15)',
                  color: '#2563eb',
                  fontWeight: 800,
                  fontSize: '10px',
                  height: 22,
                  mb: 2,
                  backdropFilter: 'blur(8px)',
                }}
              />
              <Typography variant="h4" gutterBottom>
                Glassmorphic Design
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Frosted glass effect with backdrop blur and semi-transparent background.
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mt: 2,
                  p: 1.5,
                  background: 'rgba(255, 255, 255, 0.6)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: '#10b981',
                  }}
                />
                <Typography variant="body2" fontWeight={700}>
                  Active Status
                </Typography>
              </Box>
            </Box>
          </AppCard>

          {/* Elevated Card */}
          <AppCard variant="elevated" interactive>
            <Box>
              <Typography
                variant="overline"
                sx={{
                  color: '#64748b',
                  fontWeight: 800,
                  letterSpacing: '0.8px',
                  fontSize: '10px',
                }}
              >
                ELEVATED
              </Typography>
              <Typography variant="h4" gutterBottom>
                Elevated Card
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Subtle shadow lift with gradient background. Perfect for content cards.
              </Typography>
              <Box
                sx={{
                  mt: 2,
                  display: 'flex',
                  gap: 1,
                  flexWrap: 'wrap',
                }}
              >
                {['Design', 'Premium', 'Modern'].map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    sx={{
                      height: 24,
                      fontSize: '11px',
                      fontWeight: 700,
                    }}
                  />
                ))}
              </Box>
            </Box>
          </AppCard>

          {/* Standard Card */}
          <AppCard variant="standard" interactive>
            <Box>
              <Typography
                variant="overline"
                sx={{
                  color: '#64748b',
                  fontWeight: 800,
                  letterSpacing: '0.8px',
                  fontSize: '10px',
                }}
              >
                STANDARD
              </Typography>
              <Typography variant="h4" gutterBottom>
                Standard Card
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Clean minimal design with subtle shadow. Great for general use cases.
              </Typography>
            </Box>
          </AppCard>

          {/* Outlined Card */}
          <AppCard variant="outlined" interactive>
            <Box>
              <Typography
                variant="overline"
                sx={{
                  color: '#64748b',
                  fontWeight: 800,
                  letterSpacing: '0.8px',
                  fontSize: '10px',
                }}
              >
                OUTLINED
              </Typography>
              <Typography variant="h4" gutterBottom>
                Outlined Card
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Border emphasis with no shadow. Clean and crisp appearance.
              </Typography>
            </Box>
          </AppCard>

          {/* Flat Card */}
          <AppCard variant="flat">
            <Box>
              <Typography
                variant="overline"
                sx={{
                  color: '#64748b',
                  fontWeight: 800,
                  letterSpacing: '0.8px',
                  fontSize: '10px',
                }}
              >
                FLAT
              </Typography>
              <Typography variant="h4" gutterBottom>
                Flat Card
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Minimal style with no shadows. Perfect for subtle backgrounds.
              </Typography>
            </Box>
          </AppCard>
        </Box>

        {/* Feature Cards with Statistics */}
        <Box mt={4}>
          <Typography variant="h3" gutterBottom textAlign="center" mb={3}>
            Statistics Dashboard
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
              gap: 2,
            }}
          >
            {[
              { label: 'Total Revenue', value: '₹12,500', change: '+12.5%', color: '#10b981' },
              { label: 'Active Users', value: '1,284', change: '+8.2%', color: '#3b82f6' },
              { label: 'Properties', value: '24', change: '+3', color: '#f59e0b' },
              { label: 'Win Rate', value: '68%', change: '+5.4%', color: '#8b5cf6' },
            ].map((stat, index) => (
              <AppCard
                key={stat.label}
                variant="premium"
                interactive
                sx={{
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  transitionDelay: `${index * 50}ms`,
                }}
              >
                <Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    fontWeight={700}
                    fontSize="11px"
                    textTransform="uppercase"
                    letterSpacing="0.5px"
                    mb={1}
                  >
                    {stat.label}
                  </Typography>
                  <Typography
                    variant="h2"
                    sx={{
                      fontSize: '32px',
                      fontWeight: 900,
                      mb: 0.5,
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.5,
                      px: 1,
                      py: 0.5,
                      borderRadius: '6px',
                      background: `${stat.color}15`,
                      border: `1px solid ${stat.color}30`,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: stat.color,
                        fontWeight: 800,
                        fontSize: '11px',
                      }}
                    >
                      {stat.change}
                    </Typography>
                  </Box>
                </Box>
              </AppCard>
            ))}
          </Box>
        </Box>

        {/* Interactive Card Grid */}
        <Box mt={4}>
          <Typography variant="h3" gutterBottom textAlign="center" mb={3}>
            Property Cards
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
              gap: 3,
            }}
          >
            {[
              {
                city: 'Ahmedabad',
                price: '₹3,000',
                color: '#f59e0b',
                status: 'Available',
              },
              {
                city: 'Surat',
                price: '₹2,500',
                color: '#3b82f6',
                status: 'Owned',
              },
              {
                city: 'Vadodara',
                price: '₹2,000',
                color: '#8b5cf6',
                status: 'Available',
              },
            ].map((property) => (
              <AppCard
                key={property.city}
                variant="premium"
                interactive
                shimmer
                glow
              >
                <Box>
                  {/* Color Header */}
                  <Box
                    sx={{
                      height: 8,
                      width: '100%',
                      background: `linear-gradient(90deg, ${property.color}, ${property.color}cc)`,
                      borderRadius: '6px',
                      mb: 2,
                    }}
                  />
                  
                  <Typography variant="h4" gutterBottom>
                    {property.city}
                  </Typography>
                  
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: 0.5,
                      mb: 2,
                    }}
                  >
                    <Typography
                      variant="h3"
                      sx={{
                        color: property.color,
                        fontSize: '28px',
                        fontWeight: 900,
                      }}
                    >
                      {property.price}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      pt: 2,
                      borderTop: '1px solid #e2e8f0',
                    }}
                  >
                    <Chip
                      label={property.status}
                      size="small"
                      sx={{
                        height: 22,
                        fontSize: '11px',
                        fontWeight: 800,
                        background: property.status === 'Available' ? '#f0fdf4' : '#eff6ff',
                        color: property.status === 'Available' ? '#059669' : '#2563eb',
                        border: property.status === 'Available' 
                          ? '1px solid #86efac' 
                          : '1px solid #93c5fd',
                      }}
                    />
                    <AppButton variant="primary" size="small">
                      View Details
                    </AppButton>
                  </Box>
                </Box>
              </AppCard>
            ))}
          </Box>
        </Box>
      </Stack>
    </Box>
  );
};
