import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  InputAdornment,
  MenuItem,
  Stack,
  Breadcrumbs,
  Link,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  Search, 
  Filter, 
  Home as HomeIcon,
  ChevronRight
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useDocuments } from '../hooks/useDocuments';
import DocumentList from '../components/admin/DocumentList';

const Documentation: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { documents, loading, error, fetchDocuments, getDownloadUrl } = useDocuments();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const categories = [
    { id: 'all', label: t('common.all', 'Todos') },
    { id: 'estatuto', label: t('docs.categories.estatuto', 'Estatuto') },
    { id: 'atas', label: t('docs.categories.atas', 'Atas') },
    { id: 'relatorios', label: t('docs.categories.relatorios', 'Relatórios') },
    { id: 'financeiro', label: t('docs.categories.financeiro', 'Financeiro') },
    { id: 'outros', label: t('docs.categories.outros', 'Outros') },
  ];

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = 
      doc.title.pt.toLowerCase().includes(searchTerm.toLowerCase()) || 
      doc.title.en.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs 
          separator={<ChevronRight size={16} />} 
          sx={{ mb: 2, '& .MuiBreadcrumbs-ol': { alignItems: 'center' } }}
        >
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate('/')}
            sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', textDecoration: 'none', gap: 0.5 }}
          >
            <HomeIcon size={16} />
            {t('layout.dashboard')}
          </Link>
          <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>
            {t('docs.docsTitle')}
          </Typography>
        </Breadcrumbs>
        
        <Typography variant="h2" color="primary.main" gutterBottom>
          {t('docs.docsTitle')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('home.cardDocDesc')}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Stack 
        direction={{ xs: 'column', md: 'row' }} 
        spacing={2} 
        sx={{ mb: 4 }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder={t('admin.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={20} color="#94a3b8" />
              </InputAdornment>
            ),
          }}
          sx={{ bgcolor: 'background.paper', borderRadius: '12px' }}
        />
        <TextField
          select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          sx={{ minWidth: 200, bgcolor: 'background.paper', borderRadius: '12px' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Filter size={20} color="#94a3b8" />
              </InputAdornment>
            ),
          }}
        >
          {categories.map((option) => (
            <MenuItem key={option.id} value={option.id}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      {/* Content */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <DocumentList 
          documents={filteredDocuments}
          onView={getDownloadUrl}
          onDelete={async () => false} // Regular members cannot delete
          loading={loading}
        />
      )}
    </Box>
  );
};

export default Documentation;
