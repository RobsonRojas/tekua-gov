import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  TextField, 
  Stepper, 
  Step, 
  StepLabel,
  Alert
} from '@mui/material';

const steps = ['Auto-reflexão', 'Diálogo Direto', 'Mediação', 'Câmara Coletiva'];

const WizardFlow: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  // Form states to demonstrate inputs, but we will clean them up on unmount implicitly by not saving globally
  const [osnpObservacao, setOsnpObservacao] = useState('');
  const [osnpSentimento, setOsnpSentimento] = useState('');
  const [osnpNecessidade, setOsnpNecessidade] = useState('');
  const [osnpPedido, setOsnpPedido] = useState('');

  const nextStep = () => setActiveStep((prev) => prev + 1);
  const prevStep = () => setActiveStep((prev) => prev - 1);

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Passo 1: Auto-reflexão (O Jogo do Espelhamento)</Typography>
            <Typography variant="body1" paragraph>
              Antes de abordar a outra pessoa, é importante refletir:
              <br/>- Que sentimentos essa situação despertou em você (raiva, mágoa)?
              <br/>- Esse comportamento existe em você ou em alguém do seu passado?
            </Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
              Você já realizou essa auto-reflexão e sente necessidade de envolver a outra parte?
            </Alert>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button variant="outlined" onClick={() => alert('Ótimo! Às vezes, a auto-reflexão é suficiente. Se precisar, volte aqui.')}>
                Não, vou refletir mais
              </Button>
              <Button variant="contained" onClick={nextStep}>
                Sim, já refleti
              </Button>
            </Box>
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Passo 2: Diálogo Direto (CNV)</Typography>
            <Typography variant="body1" paragraph>
              Utilize a estrutura OSNP para abordar a pessoa de forma construtiva:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
              <TextField label="Observação (Fatos sem julgamento)" value={osnpObservacao} onChange={(e) => setOsnpObservacao(e.target.value)} fullWidth />
              <TextField label="Sentimento (Como me sinto)" value={osnpSentimento} onChange={(e) => setOsnpSentimento(e.target.value)} fullWidth />
              <TextField label="Necessidade (O que preciso)" value={osnpNecessidade} onChange={(e) => setOsnpNecessidade(e.target.value)} fullWidth />
              <TextField label="Pedido (Ação clara e positiva)" value={osnpPedido} onChange={(e) => setOsnpPedido(e.target.value)} fullWidth />
            </Box>
            <Alert severity="warning" sx={{ mb: 3 }}>
              O diálogo direto funcionou ou a outra pessoa não foi receptiva?
            </Alert>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
              <Button onClick={prevStep}>Voltar</Button>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="outlined" onClick={() => alert('Excelente! Conflito resolvido no Passo 2.')}>
                  Funcionou, resolvido
                </Button>
                <Button variant="contained" onClick={nextStep}>
                  Não funcionou
                </Button>
              </Box>
            </Box>
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Passo 3: Mediação Individual</Typography>
            <Typography variant="body1" paragraph>
              Se o diálogo direto não resolveu, você deve convidar um mediador neutro e de confiança para ajudar.
              Ele escutará ambos os lados sem viés antes de propor um acordo escrito.
            </Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
              Selecione um mediador e envie um convite sigiloso: "Preciso de mediação com [nome]. Você topa?"
            </Alert>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
              <Button onClick={prevStep}>Voltar</Button>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="outlined" onClick={() => alert('Aguardando a mediação. Volte se não funcionar.')}>
                  Vou buscar um mediador
                </Button>
                <Button variant="contained" onClick={nextStep}>
                  Já tentamos mediação e falhou
                </Button>
              </Box>
            </Box>
          </Box>
        );
      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Passo 4: Câmara de Justiça Restaurativa</Typography>
            <Typography variant="body1" paragraph>
              Para conflitos escalados ou com impacto coletivo. A Câmara é ativada via convite genérico no mural da comunidade.
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              - Requer pré-círculos individuais (preparação).<br/>
              - Participação 100% voluntária.<br/>
              - Foco em acordo regenerativo com ações SMART.
            </Typography>
            <Alert severity="warning" sx={{ mb: 3 }}>
              Você deseja convocar a Câmara? Poste no ponto de comunicação: "Convoco Círculo Restaurativo para [tema]. Quem se voluntaria?"
            </Alert>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
              <Button onClick={prevStep}>Voltar</Button>
              <Button variant="contained" onClick={() => alert('Procure a Equipe de Harmonia para organizar os pré-círculos.')}>
                Entendido, vou convocar
              </Button>
            </Box>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: '16px' }}>
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Box sx={{ minHeight: '300px' }}>
        {renderStepContent(activeStep)}
      </Box>
    </Paper>
  );
};

export default WizardFlow;
