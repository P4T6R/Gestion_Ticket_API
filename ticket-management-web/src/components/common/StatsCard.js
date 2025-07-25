import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  useTheme
} from '@mui/material';
import { 
  TrendingUp, 
  TrendingDown, 
  Remove 
} from '@mui/icons-material';
import { formatNumber } from '../../utils/helpers';

const StatsCard = ({
  title,
  value,
  subtitle = null,
  icon: Icon,
  trend = null, // 'up', 'down', 'neutral'
  trendValue = null,
  color = 'primary',
  loading = false
}) => {
  const theme = useTheme();

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp fontSize="small" />;
      case 'down':
        return <TrendingDown fontSize="small" />;
      case 'neutral':
        return <Remove fontSize="small" />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'success.main';
      case 'down':
        return 'error.main';
      case 'neutral':
        return 'text.secondary';
      default:
        return 'text.secondary';
    }
  };

  if (loading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ flex: 1 }}>
              <Box 
                sx={{ 
                  height: 16, 
                  bgcolor: 'grey.200', 
                  borderRadius: 1, 
                  mb: 1,
                  width: '60%' 
                }} 
              />
              <Box 
                sx={{ 
                  height: 32, 
                  bgcolor: 'grey.200', 
                  borderRadius: 1, 
                  mb: 1,
                  width: '40%' 
                }} 
              />
              <Box 
                sx={{ 
                  height: 14, 
                  bgcolor: 'grey.200', 
                  borderRadius: 1,
                  width: '50%' 
                }} 
              />
            </Box>
            <Box 
              sx={{ 
                width: 56, 
                height: 56, 
                bgcolor: 'grey.200', 
                borderRadius: '50%' 
              }} 
            />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      sx={{ 
        height: '100%',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[8]
        }
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="subtitle2" 
              color="text.secondary" 
              gutterBottom
              sx={{ fontWeight: 'medium' }}
            >
              {title}
            </Typography>
            
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 'bold',
                color: `${color}.main`,
                mb: 1
              }}
            >
              {typeof value === 'number' ? formatNumber(value) : value}
            </Typography>

            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}

            {(trend || trendValue) && (
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 0.5, 
                  mt: 1,
                  color: getTrendColor()
                }}
              >
                {getTrendIcon()}
                {trendValue && (
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontWeight: 'medium',
                      color: 'inherit'
                    }}
                  >
                    {trendValue}
                  </Typography>
                )}
              </Box>
            )}
          </Box>

          {Icon && (
            <Avatar
              sx={{
                bgcolor: `${color}.light`,
                color: `${color}.main`,
                width: 56,
                height: 56
              }}
            >
              <Icon fontSize="large" />
            </Avatar>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
