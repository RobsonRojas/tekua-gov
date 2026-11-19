import React from 'react';
import { Box, Typography } from '@mui/material';
import { CheckCircle2, Circle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ConfirmRequirement } from '../../utils/confirmRequirements';

const DEFAULTS: Record<ConfirmRequirement['key'], string> = {
  notExecutor: 'Outra pessoa que não executou a tarefa precisa confirmar',
  notConfirmedYet: 'Você ainda não confirmou esta tarefa',
};

const ConfirmRequirementsList: React.FC<{ requirements: ConfirmRequirement[] }> = ({ requirements }) => {
  const { t } = useTranslation();
  return (
    <Box component="section" aria-label={t('work.confirmRequirements.title', 'Para confirmar esta tarefa') as string} sx={{ px: 1 }}>
      <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
        {t('work.confirmRequirements.title', 'Para confirmar esta tarefa')}
      </Typography>
      <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
        {requirements.map(r => (
          <Box
            component="li"
            key={r.key}
            data-testid={`confirm-requirement-${r.key}`}
            data-met={r.met}
            sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.25, opacity: r.met ? 0.6 : 1 }}
          >
            {r.met
              ? <CheckCircle2 size={16} color="#2e7d32" aria-label={t('work.confirmRequirements.met', 'Atendido') as string} />
              : <Circle size={16} color="#ed6c02" aria-label={t('work.confirmRequirements.unmet', 'Pendente') as string} />}
            <Typography variant="body2" sx={{ fontWeight: r.met ? 400 : 600 }}>
              {t(`work.confirmRequirements.${r.key}`, DEFAULTS[r.key])}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default ConfirmRequirementsList;
