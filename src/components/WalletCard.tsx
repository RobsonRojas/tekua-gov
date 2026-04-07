import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  CircularProgress, 
  Button,
  useTheme
} from '@mui/material';
import { Wallet as WalletIcon, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const WalletCard: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { user } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('wallets')
          .select('balance')
          .eq('profile_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        setBalance(data?.balance || 0);
      } catch (err) {
        console.error('Error fetching dashboard balance:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, [user]);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: '24px',
        backgroundColor: 'background.paper',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          borderColor: 'primary.main'
        }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box sx={{ 
          p: 1.5, 
          borderRadius: '16px', 
          bgcolor: 'rgba(99, 102, 241, 0.1)', 
          color: 'primary.main',
          display: 'flex',
          alignItems: 'center'
        }}>
          <WalletIcon size={24} />
        </Box>
        <Typography variant="caption" sx={{ color: 'secondary.main', fontWeight: 600, bgcolor: 'rgba(16, 185, 129, 0.1)', px: 1.5, py: 0.5, borderRadius: '100px' }}>
          LIVE
        </Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, mb: 1 }}>
          {t('wallet.balance')}
        </Typography>
        {loading ? (
          <CircularProgress size={20} />
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
            <Typography variant="h2" sx={{ fontWeight: 800, fontSize: '2.5rem', color: theme.palette.mode === 'dark' ? '#fff' : '#1e293b' }}>
              {balance?.toLocaleString()}
            </Typography>
            <Typography variant="h4" color="primary.main" sx={{ ml: 1, fontWeight: 700 }}>
              $S
            </Typography>
          </Box>
        )}
      </Box>

      <Button
        component={Link}
        to="/wallet"
        variant="text"
        color="primary"
        endIcon={<ArrowRight size={18} />}
        sx={{ 
          justifyContent: 'flex-start', 
          p: 0, 
          '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' } 
        }}
      >
        {t('home.access')}
      </Button>
    </Paper>
  );
};

export default WalletCard;
