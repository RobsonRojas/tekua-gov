import React, { useEffect, useState } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../lib/api';

export interface ProtocolOption {
  id: string;
  title: string;
}

interface Props {
  value: string | null;
  onChange: (id: string | null) => void;
  /** Protocolo já vinculado (pode estar arquivado): continua selecionável na edição. */
  current?: ProtocolOption | null;
}

/** Campo opcional de pesquisa e seleção de um protocolo/POP ativo (filtro local por título). */
const ProtocolSelect: React.FC<Props> = ({ value, onChange, current }) => {
  const { t } = useTranslation();
  const [options, setOptions] = useState<ProtocolOption[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data, error } = await apiClient.invoke('api-governance', 'listProtocols');
        if (!active || error) return;
        setOptions(((data as { protocols?: ProtocolOption[] })?.protocols || []).map((p) => ({ id: p.id, title: p.title })));
      } catch {
        /* campo opcional: sem lista, o membro segue sem protocolo */
      }
    })();
    return () => { active = false; };
  }, []);

  const all = current && !options.some((o) => o.id === current.id) ? [current, ...options] : options;

  return (
    <Autocomplete
      options={all}
      getOptionLabel={(o) => o.title}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      value={all.find((o) => o.id === value) || null}
      onChange={(_, option) => onChange(option ? option.id : null)}
      noOptionsText={t('protocols.noOptions', 'Nenhum protocolo encontrado')}
      renderInput={(params) => (
        <TextField
          {...params}
          label={t('protocols.selectLabel', 'Protocolo/POP (Opcional)')}
          placeholder={t('protocols.selectPlaceholder', 'Buscar protocolo...')}
        />
      )}
    />
  );
};

export default ProtocolSelect;
