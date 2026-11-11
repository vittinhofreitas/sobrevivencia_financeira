/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  Coins,
  Heart,
  PiggyBank,
  Trophy,
  Skull,
  Award,
  Volume2,
  VolumeX,
  Play,
  Plus,
  Minus,
  RotateCcw,
  Download,
  Printer,
  Sparkles,
  AlertTriangle,
  ShieldCheck,
  Home,
  ShoppingCart,
  Car,
  Gamepad2,
  ChevronRight,
  BookOpen,
  Shirt,
  Plane,
  Scissors,
  FilePlus2,
  Users,
  User,
  GraduationCap,
  HandCoins,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import {
  PalcoSalaFamilia,
  EstadoHumorFamilia,
  ModoJogo,
  GeneroPersonagem,
  TipoNPC,
  ParticulaFlutuante,
} from './PalcoSalaFamilia';

// ============================================================================
// TIPOS E ESTRUTURAS DE DADOS DO JOGO ARCADE (100% EM PORTUGUÊS)
// ============================================================================

export type TelaJogo = 'selecao' | 'gameplay' | 'zeramento';

export interface ReceitasMensais {
  salarioMensal: number;
  bolsaFamilia: number; // Aplicado SOMENTE no Modo Família / Família Grande
  peDeMeia: number; // Aplicado SOMENTE no Modo Individual (Jovem Solo)
}

export interface DespesasEssenciais {
  gastoMoradia: number;
  gastoAlimentacao: number;
  gastoTransporte: number;
}

export interface DespesasEstiloVida {
  gastoRoupas: number;
  gastoViagens: number;
  gastoCuidadosPessoais: number;
  outrosGastos: number;
  nomeOutrosGastos: string;
}

export interface CartaAcaoArcade {
  codigo: '1' | '2' | '3';
  rotuloAcao: string;
  titulo: string;
  descricao: string;
  impactoMoedas: number;
  usaCofreReserva: boolean;
  parcelaCartaoFutura: number;
  mesesParcela: number;
  impactoCoracoes: number;
  tipoEscolha: 'planejada' | 'economica' | 'armadilha';
  falaReacaoFamilia: string;
  explicacaoMestre: string;
}

export type CategoriaGraficoEvento =
  | 'alimentacao'
  | 'moradia'
  | 'transporte'
  | 'roupas'
  | 'viagens'
  | 'cuidadosPessoais'
  | 'outros'
  | 'imprevistos'
  | 'rendaExtra';

export interface EventoNPC {
  id: number;
  titulo: string;
  categoria: string;
  grupoGrafico: CategoriaGraficoEvento;
  nomeNPC: string;
  cargoNPC: string;
  tipoNPC: TipoNPC;
  falaNPC: string;
  exclusivoPara?: 'familia_qualquer' | 'individual_mulher' | 'individual_homem' | 'individual_qualquer';
  cartas: [CartaAcaoArcade, CartaAcaoArcade, CartaAcaoArcade];
}

export interface LogDecisaoTurno {
  mes: number;
  nomeMes: string;
  eventoId: number;
  eventoTitulo: string;
  grupoGrafico: CategoriaGraficoEvento;
  acaoEscolhida: '1' | '2' | '3';
  tituloAcao: string;
  impactoCaixa: number;
  usouReserva: number;
  dividaFuturaGerada: number;
  impactoCoracoes: number;
  tipoEscolha: CartaAcaoArcade['tipoEscolha'];
  explicacaoMestre: string;
}

export interface RegistroFaseMensal {
  mes: number;
  nomeMes: string;
  saldoInicial: number;
  salarioBase: number;
  bolsaFamiliaMes: number;
  peDeMeiaMes: number;
  rendaExtraEventos: number;
  rendaTotalMes: number;
  gastoMoradiaMes: number;
  gastoAlimentacaoMes: number;
  gastoTransporteMes: number;
  gastoRoupasMes: number;
  gastoViagensMes: number;
  gastoCuidadosMes: number;
  gastoOutrosMes: number;
  gastosFixosEVidaTotal: number;
  parcelasCartaoAnteriores: number;
  gastosEventosDireto: number;
  jurosChequeEspecial: number;
  reservaGuardadaFimMes: number;
  saldoFinal: number;
  felicidadeFimMes: number;
  decisoes: LogDecisaoTurno[];
}

const NOMES_FASES_MESES = [
  'FASE 1/6 (JANEIRO)',
  'FASE 2/6 (FEVEREIRO)',
  'FASE 3/6 (MARÇO)',
  'FASE 4/6 (ABRIL)',
  'FASE 5/6 (MAIO)',
  'FASE 6/6 (JUNHO)',
];

const NOMES_CURTOS_MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho'];

// ============================================================================
// BANCO COMPLETO DE EVENTOS (COM EVENTOS DE GÊNERO, VIAGENS, ROUPAS,
// BOLSA FAMÍLIA EXCLUSIVO PARA FAMÍLIA E PÉ-DE-MEIA EXCLUSIVO PARA JOVEM)
// ============================================================================

export const bancoDeEventosNPC: EventoNPC[] = [
  // --- EVENTOS EXCLUSIVOS DO MODO INDIVIDUAL: MULHER (PINK TAX, SALÃO, SEGURANÇA) ---
  {
    id: 101,
    titulo: '"Pink Tax" na Farmácia e Autocuidado!',
    categoria: 'Cuidados Pessoais (Mulher)',
    grupoGrafico: 'cuidadosPessoais',
    nomeNPC: 'Clara da Farmácia',
    cargoNPC: 'Consultora de Cosméticos',
    tipoNPC: 'esteticista',
    exclusivoPara: 'individual_mulher',
    falaNPC:
      'Acabaram seus itens básicos de higiene, absorventes, protetor solar e creme capilar! Reparou que os produtos femininos custam até 25% mais caro por causa da "Pink Tax"?',
    cartas: [
      {
        codigo: '1',
        rotuloAcao: 'Ação 1 · Compra Consciente à Vista',
        titulo: 'Comparar Princípio Ativo e Comprar Refil no PIX',
        descricao:
          'Foge das embalagens "cor-de-rosa" caras, leva versões neutras/refil no atacado por R$ 130.',
        impactoMoedas: -130,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 8,
        tipoEscolha: 'planejada',
        falaReacaoFamilia: 'Driblamos a Pink Tax olhando os ingredientes e economizamos muito!',
        explicacaoMestre:
          'A "Pink Tax" (Taxa Rosa) encarece itens femininos idênticos aos masculinos. Comparar rótulos e comprar refis protege seu salário!',
      },
      {
        codigo: '2',
        rotuloAcao: 'Ação 2 · Alternativa Econômica',
        titulo: 'Levar Apenas o Básico Essencial da Lista',
        descricao: 'Compra somente o indispensável de higiene em promoção por R$ 75.',
        impactoMoedas: -75,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 3,
        tipoEscolha: 'economica',
        falaReacaoFamilia: 'Focamos apenas no essencial deste mês sem estourar o orçamento!',
        explicacaoMestre:
          'Separar itens de saúde/higiene indispensáveis de dermocosméticos de impulso mantém as contas sob controle.',
      },
      {
        codigo: '3',
        rotuloAcao: 'Ação 3 · Kit Skincare Viral Parcelado',
        titulo: 'Levar Kit Completo de Blogueira em 3x no Cartão',
        descricao: 'Gasta R$ 180 hoje + 2 parcelas de R$ 150 em cremes importados.',
        impactoMoedas: -180,
        usaCofreReserva: false,
        parcelaCartaoFutura: 150,
        mesesParcela: 2,
        impactoCoracoes: 2,
        tipoEscolha: 'armadilha',
        falaReacaoFamilia: 'R$ 480 em potinhos na farmácia! O cartão ficou pesado!',
        explicacaoMestre:
          'O marketing de beleza nas redes sociais incentiva rotinas de 10 produtos caros que drenam a renda jovem.',
      },
    ],
  },
  {
    id: 102,
    titulo: 'Manutenção do Cabelo / Tranças / Salão!',
    categoria: 'Estética e Apresentação (Mulher)',
    grupoGrafico: 'cuidadosPessoais',
    nomeNPC: 'Bia Trancista & Hair',
    cargoNPC: 'Salão Beleza Real',
    tipoNPC: 'esteticista',
    exclusivoPara: 'individual_mulher',
    falaNPC:
      'Amiga, chegou a hora da manutenção do cabelo e sobrancelha para trabalhar e estudar com autoestima lá no alto! Qual pacote vamos fazer hoje?',
    cartas: [
      {
        codigo: '1',
        rotuloAcao: 'Ação 1 · Agendamento Planejado à Vista',
        titulo: 'Manutenção Completa Agendada com Desconto no PIX',
        descricao: 'Faz o procedimento planejado no salão de confiança por R$ 170 à vista.',
        impactoMoedas: -170,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 11,
        tipoEscolha: 'planejada',
        falaReacaoFamilia: 'Autoestima renovada e tudo pago à vista dentro do planejado!',
        explicacaoMestre:
          'Quando o salão já está previsto na categoria de Cuidados Pessoais, você cuida de si sem culpa e sem dívida.',
      },
      {
        codigo: '2',
        rotuloAcao: 'Ação 2 · Faça em Casa / Parceria com Amiga',
        titulo: 'Hidratação e Finalização Caseira com Amiga',
        descricao: 'Compra os produtos profissionais por R$ 65 e faz o cuidado em casa.',
        impactoMoedas: -65,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 7,
        tipoEscolha: 'economica',
        falaReacaoFamilia: 'Ficou lindo fazendo em casa e economizamos mais de R$ 100!',
        explicacaoMestre:
          'Intercalar idas ao salão com cronograma capilar caseiro reduz o gasto anual pela metade.',
      },
      {
        codigo: '3',
        rotuloAcao: 'Ação 3 · Pacote VIP de Salão no Cartão',
        titulo: 'Fazer Combo Química + Unhas de Gel + Cílios em 3x',
        descricao: 'Paga R$ 210 hoje + 2x de R$ 175 no cartão de crédito.',
        impactoMoedas: -210,
        usaCofreReserva: false,
        parcelaCartaoFutura: 175,
        mesesParcela: 2,
        impactoCoracoes: 4,
        tipoEscolha: 'armadilha',
        falaReacaoFamilia: 'Ainda nem cresceu o cabelo e já temos R$ 350 de parcelas para pagar!',
        explicacaoMestre:
          'Parcelar serviços que exigem nova manutenção todo mês cria sobreposição de parcelas no cartão.',
      },
    ],
  },
  {
    id: 103,
    titulo: 'Volta Tarde da Aula/Trabalho: Uber ou Ônibus?',
    categoria: 'Segurança e Transporte (Mulher)',
    grupoGrafico: 'transporte',
    nomeNPC: 'Motorista de App',
    cargoNPC: 'Tarifa Dinâmica Noturna',
    tipoNPC: 'mecanico',
    exclusivoPara: 'individual_mulher',
    falaNPC:
      'São 22h30 e o ponto de ônibus está deserto! Por segurança, muitas mulheres precisam usar carro de aplicativo à noite, mas a tarifa dinâmica subiu!',
    cartas: [
      {
        codigo: '1',
        rotuloAcao: 'Ação 1 · Carona Solidária / Rachar Corrida',
        titulo: 'Dividir Corrida de App com 2 Colegas da Mesma Rua',
        descricao: 'Volta em segurança até a porta de casa dividindo o valor (R$ 110 no mês).',
        impactoMoedas: -110,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 9,
        tipoEscolha: 'planejada',
        falaReacaoFamilia: 'Voltamos seguras para casa e pagando 1/3 da corrida!',
        explicacaoMestre:
          'O custo com segurança no deslocamento feminino é real; organizar grupos de rota compartilhada reduz o peso no bolso.',
      },
      {
        codigo: '2',
        rotuloAcao: 'Ação 2 · Alternativa Combinada',
        titulo: 'Ir até Estação Movimentada e Pegar App Só no Trecho Final',
        descricao: 'Usa integração até a avenida principal e app curto de R$ 60 no mês.',
        impactoMoedas: -60,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 5,
        tipoEscolha: 'economica',
        falaReacaoFamilia: 'Combinar transporte público com corrida curta economizou bastante!',
        explicacaoMestre:
          'Usar o aplicativo apenas na "última milha" noturna equilibra segurança pessoal e orçamento.',
      },
      {
        codigo: '3',
        rotuloAcao: 'Ação 3 · Pedir App Sozinha Todo Dia no Crédito',
        titulo: 'Pegar Carro de App na Tarifa Dinâmica Ida e Volta',
        descricao: 'Gasta R$ 280 agora + R$ 180 acumulados na fatura do cartão do próximo mês!',
        impactoMoedas: -280,
        usaCofreReserva: false,
        parcelaCartaoFutura: 180,
        mesesParcela: 1,
        impactoCoracoes: -2,
        tipoEscolha: 'armadilha',
        falaReacaoFamilia: 'R$ 460 só de corridas no aplicativo! Quase um aluguel!',
        explicacaoMestre:
          'Corridas individuais em horário de pico no cartão de crédito somam centenas de reais sem perceber.',
      },
    ],
  },

  // --- EVENTOS EXCLUSIVOS DO MODO INDIVIDUAL: HOMEM (BARBEARIA, GAMES/FUTEBOL, SUPLEMENTOS) ---
  {
    id: 201,
    titulo: 'Barbearia Toda Semana: Degradê na Régua!',
    categoria: 'Cuidados Pessoais (Homem)',
    grupoGrafico: 'cuidadosPessoais',
    nomeNPC: 'Barbeiro Du Corte',
    cargoNPC: 'Barbearia Retrô VIP',
    tipoNPC: 'barbeiro',
    exclusivoPara: 'individual_homem',
    falaNPC:
      'E aí, parceiro! Vai mandar aquele degradê navalhado + barba + pigmentação toda sexta-feira e levar a pomada importada?',
    cartas: [
      {
        codigo: '1',
        rotuloAcao: 'Ação 1 · Frequência Equilibrada à Vista',
        titulo: 'Cortar a Cada 20 Dias e Cuidar da Barba em Casa',
        descricao: 'Mantém o visual alinhado gastando R$ 90 no mês à vista.',
        impactoMoedas: -90,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 8,
        tipoEscolha: 'planejada',
        falaReacaoFamilia: 'Visual na régua e dinheiro sobrando na carteira!',
        explicacaoMestre:
          'Espaçar o corte para cada 3 semanas e aparar a barba em casa economiza mais de R$ 1.200 por ano.',
      },
      {
        codigo: '2',
        rotuloAcao: 'Ação 2 · Alternativa Econômica',
        titulo: 'Comprar Maquininha Própria e Cortar Simples',
        descricao: 'Investe R$ 55 para manter o corte básico sem depender de salão toda semana.',
        impactoMoedas: -55,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 5,
        tipoEscolha: 'economica',
        falaReacaoFamilia: 'Prático demais! A maquininha já se pagou no primeiro mês!',
        explicacaoMestre:
          'Pequenos equipamentos de cuidado pessoal doméstico têm retorno financeiro imediato.',
      },
      {
        codigo: '3',
        rotuloAcao: 'Ação 3 · Clube VIP + Produtos no Cartão',
        titulo: 'Ir Toda Sexta + Combo Pomada/Óleo/Toalha Quente no Crédito',
        descricao: 'Gasta R$ 220 neste mês + R$ 140 na fatura do mês seguinte.',
        impactoMoedas: -220,
        usaCofreReserva: false,
        parcelaCartaoFutura: 140,
        mesesParcela: 1,
        impactoCoracoes: 3,
        tipoEscolha: 'armadilha',
        falaReacaoFamilia: 'R$ 360 de barbearia e produtos! Foi quase metade do Pé-de-Meia!',
        explicacaoMestre:
          'Ir à barbearia toda semana somado a consumos extras no local transforma um cuidado simples em gasto pesado.',
      },
    ],
  },
  {
    id: 202,
    titulo: 'Lançamento de Game + Futebol Pay-Per-View!',
    categoria: 'Entretenimento & Amigos (Homem)',
    grupoGrafico: 'viagens',
    nomeNPC: 'Juninho Gamer',
    cargoNPC: 'Parceiro do Squad',
    tipoNPC: 'streaming_bot',
    exclusivoPara: 'individual_homem',
    falaNPC:
      'Mano! Saiu o jogo novo de R$ 350 na pré-venda, tem o Passe de Batalha e o pacote do Campeonato de Futebol pra assistir com a galera!',
    cartas: [
      {
        codigo: '1',
        rotuloAcao: 'Ação 1 · Lazer Consciente',
        titulo: 'Jogar Títulos Gratuitos / Promoção Antiga e Ver Jogo na TV Aberta',
        descricao: 'Diverte-se com os amigos gastando apenas R$ 65 com petiscos à vista.',
        impactoMoedas: -65,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 9,
        tipoEscolha: 'planejada',
        falaReacaoFamilia: 'Jogamos a noite toda e rimos demais sem gastar quase nada!',
        explicacaoMestre:
          'Esperar alguns meses após o lançamento faz o preço dos jogos cair até 60% nas promoções sazonais.',
      },
      {
        codigo: '2',
        rotuloAcao: 'Ação 2 · Dividir Assinatura',
        titulo: 'Rachar Assinatura Mensal com Amigo (R$ 35)',
        descricao: 'Divide o catálogo de jogos com o melhor amigo sem comprar no impulso.',
        impactoMoedas: -35,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 7,
        tipoEscolha: 'economica',
        falaReacaoFamilia: 'Catálogo gigante de jogos por apenas R$ 35!',
        explicacaoMestre:
          'Compartilhar planos ou aguardar promoções evita que microtransações levem seu salário.',
      },
      {
        codigo: '3',
        rotuloAcao: 'Ação 3 · Comprar Edição Deluxe + Skins no Cartão',
        titulo: 'Passar Jogo Deluxe + Moedas Virtuais + Pay-Per-View em 3x',
        descricao: 'Gasta R$ 210 agora + 2 parcelas de R$ 160 no cartão!',
        impactoMoedas: -210,
        usaCofreReserva: false,
        parcelaCartaoFutura: 160,
        mesesParcela: 2,
        impactoCoracoes: 3,
        tipoEscolha: 'armadilha',
        falaReacaoFamilia: 'Gastamos R$ 530 em jogo e skins virtuais! Que rombo na conta!',
        explicacaoMestre:
          'Microtransações, passes de batalha e compras no lançamento são desenhados para drenar o orçamento masculino jovem.',
      },
    ],
  },
  {
    id: 203,
    titulo: 'Combo Suplementos, Academia e Resenha!',
    categoria: 'Estilo de Vida (Homem)',
    grupoGrafico: 'cuidadosPessoais',
    nomeNPC: 'Coach Bombado',
    cargoNPC: 'Loja de Suplementos',
    tipoNPC: 'vendedor_shopping',
    exclusivoPara: 'individual_homem',
    falaNPC:
      'Bora ficar monstro! Tenho aqui o combo Whey Isolado Importado + Pré-Treino + Creatina + Camisa Dry-Fit em 3x no cartão!',
    cartas: [
      {
        codigo: '1',
        rotuloAcao: 'Ação 1 · Nutrição Inteligente à Vista',
        titulo: 'Comprar Ovos, Frango, Banana e Creatina Básica no PIX',
        descricao: 'Foca na alimentação natural eficiente gastando R$ 110 à vista.',
        impactoMoedas: -110,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 9,
        tipoEscolha: 'planejada',
        falaReacaoFamilia: 'Saúde em dia com comida de verdade e sem cair em conversa de marketing!',
        explicacaoMestre:
          'Comida de verdade (ovos, frango, arroz, frutas) entrega excelente resultado nutricional por uma fração do preço de suplementos importados.',
      },
      {
        codigo: '2',
        rotuloAcao: 'Ação 2 · Treino ao Ar Livre / Calistenia',
        titulo: 'Treinar no Parque Público e Manter Dieta Caseira (R$ 45)',
        descricao: 'Usa as barras da praça pública com os amigos e economiza na mensalidade.',
        impactoMoedas: -45,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 7,
        tipoEscolha: 'economica',
        falaReacaoFamilia: 'Treinão ao ar livre de graça e saúde nota 10!',
        explicacaoMestre:
          'Parques públicos e calistenia mantêm o condicionamento físico com custo zero de mensalidade.',
      },
      {
        codigo: '3',
        rotuloAcao: 'Ação 3 · Levar o Combo Importado no Cartão',
        titulo: 'Comprar Kit Completo de Potes Caros em 3x',
        descricao: 'Gasta R$ 190 hoje + 2 parcelas de R$ 165 no cartão!',
        impactoMoedas: -190,
        usaCofreReserva: false,
        parcelaCartaoFutura: 165,
        mesesParcela: 2,
        impactoCoracoes: 1,
        tipoEscolha: 'armadilha',
        falaReacaoFamilia: 'R$ 520 em potes de suplemento! O salário derreteu!',
        explicacaoMestre:
          'Suplementos caros sem necessidade real são um dos maiores gastos por impulso entre jovens homens.',
      },
    ],
  },

  // --- EVENTO EXCLUSIVO DO MODO INDIVIDUAL (JOVEM): INCENTIVO PÉ-DE-MEIA ESTUDANTIL ---
  {
    id: 301,
    titulo: 'Incentivo Pé-de-Meia: Frequência Escolar e Bônus!',
    categoria: 'Educação e Renda Jovem',
    grupoGrafico: 'rendaExtra',
    nomeNPC: 'Orientadora Helena',
    cargoNPC: 'Programa Pé-de-Meia MEC',
    tipoNPC: 'diretora_escola',
    exclusivoPara: 'individual_qualquer',
    falaNPC:
      'Atenção, estudante! Sua frequência escolar passou de 80% neste bimestre e saiu a parcela extra de incentivo do Pé-de-Meia! O que você vai fazer com esse recurso?',
    cartas: [
      {
        codigo: '1',
        rotuloAcao: 'Ação 1 · Multiplicar o Futuro',
        titulo: 'Guardar Bônus (+R$ 250) e Fazer Curso Técnico Rápido',
        descricao: 'Garante a frequência, recebe +R$ 250 extras líquidos e fortalece o currículo!',
        impactoMoedas: 250,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 10,
        tipoEscolha: 'planejada',
        falaReacaoFamilia: 'Frequência exemplar na escola e +R$ 250 do Pé-de-Meia somados na conta!',
        explicacaoMestre:
          'O Pé-de-Meia existe para garantir sua permanência nos estudos e construir sua primeira reserva financeira!',
      },
      {
        codigo: '2',
        rotuloAcao: 'Ação 2 · Reforçar o Caixa do Mês',
        titulo: 'Usar o Bônus (+R$ 200) para Quitar Contas à Vista',
        descricao: 'Mantém a frequência em dia e soma +R$ 200 direto no saldo do mês.',
        impactoMoedas: 200,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 6,
        tipoEscolha: 'economica',
        falaReacaoFamilia: 'Esses R$ 200 a mais salvaram as contas desta semana!',
        explicacaoMestre:
          'Manter a frequência escolar acima de 80% evita o bloqueio do benefício mensal de R$ 200.',
      },
      {
        codigo: '3',
        rotuloAcao: 'Ação 3 · Faltar às Aulas / Bloqueio do Benefício',
        titulo: 'Faltar na Semana de Provas e Ter a Parcela Bloqueada (-R$ 200)',
        descricao: 'Perde o incentivo do mês por excesso de faltas (-R$ 200) e fica frustrado.',
        impactoMoedas: -200,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: -10,
        tipoEscolha: 'armadilha',
        falaReacaoFamilia: 'Perdemos a parcela do Pé-de-Meia deste mês por faltar às aulas!',
        explicacaoMestre:
          'Se a frequência mensal cair abaixo de 80%, o pagamento do Pé-de-Meia é suspenso naquele mês!',
      },
    ],
  },

  // --- EVENTO EXCLUSIVO DOS MODOS FAMÍLIA E FAMÍLIA GRANDE: BOLSA FAMÍLIA / CADÚNICO ---
  {
    id: 401,
    titulo: 'Convocação do CadÚnico: Atualização do Bolsa Família!',
    categoria: 'Benefício Social Familiar',
    grupoGrafico: 'rendaExtra',
    nomeNPC: 'Assistente Social Lúcia',
    cargoNPC: 'CRAS / Cadastro Único',
    tipoNPC: 'assistente_social',
    exclusivoPara: 'familia_qualquer',
    falaNPC:
      'Olá, família! Chegou o aviso no aplicativo para atualizar o CadÚnico, o cartão de vacinação e a frequência escolar das crianças para manter o Bolsa Família e o Benefício Primeira Infância!',
    cartas: [
      {
        codigo: '1',
        rotuloAcao: 'Ação 1 · Cadastro e Vacinas 100% em Dia',
        titulo: 'Comparecer ao CRAS no Prazo e Garantir Adicional (+R$ 150)',
        descricao:
          'Leva todos os documentos, comprova vacinação/escola e libera +R$ 150 de adicional familiar!',
        impactoMoedas: 150,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 9,
        tipoEscolha: 'planejada',
        falaReacaoFamilia: 'Cadastro atualizado no CRAS e benefício garantido com adicional!',
        explicacaoMestre:
          'Manter o CadÚnico atualizado, vacinas em dia e frequência escolar garante a proteção da renda familiar.',
      },
      {
        codigo: '2',
        rotuloAcao: 'Ação 2 · Agendamento pelo Aplicativo',
        titulo: 'Regularizar Documentos na Semana Seguinte (Custo Transporte R$ 20)',
        descricao: 'Gasta apenas R$ 20 de passagem até o posto e mantém o benefício normal.',
        impactoMoedas: -20,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 4,
        tipoEscolha: 'economica',
        falaReacaoFamilia: 'Tudo regularizado sem fila e sem risco de bloqueio!',
        explicacaoMestre:
          'Acompanhar o aplicativo oficial evita cair em boatos ou perder prazos de recadastramento.',
      },
      {
        codigo: '3',
        rotuloAcao: 'Ação 3 · Ignorar o Prazo de Atualização',
        titulo: 'Esquecer de Ir ao CRAS e Ter o Benefício Bloqueado no Mês (-R$ 300)',
        descricao: 'Perde R$ 300 de receita no mês até conseguir desbloquear o cadastro!',
        impactoMoedas: -300,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: -12,
        tipoEscolha: 'armadilha',
        falaReacaoFamilia: 'O benefício foi bloqueado porque esquecemos de atualizar o cadastro!',
        explicacaoMestre:
          'Deixar de atualizar o CadÚnico ou descumprir condicionalidades de saúde e educação bloqueia o Bolsa Família.',
      },
    ],
  },

  // --- NOVOS EVENTOS DIRETAMENTE LIGADOS AOS CAMPOS DE VIAGENS E ROUPAS ---
  {
    id: 501,
    titulo: 'Promoção de Pacote de Viagem para o Feriadão!',
    categoria: 'Viagens e Lazer',
    grupoGrafico: 'viagens',
    nomeNPC: 'Beto Turismo',
    cargoNPC: 'Agência Sol & Praia',
    tipoNPC: 'agente_viagem',
    falaNPC:
      'Olha o feriadão chegando! Tenho pacote com pousada e passeio de barco em oferta relâmpago! Vamos viajar planejado ou parcelar tudo no impulso?',
    cartas: [
      {
        codigo: '1',
        rotuloAcao: 'Ação 1 · Passeio Bate-e-Volta Planejado',
        titulo: 'Fazer Passeio Regional à Vista Dentro da Meta (R$ 190)',
        descricao: 'Aproveita a praia/parque próximo levando lanche de casa e pagando à vista.',
        impactoMoedas: -190,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 12,
        tipoEscolha: 'planejada',
        falaReacaoFamilia: 'Que fim de semana maravilhoso! Descansamos sem trazer dívida na mala!',
        explicacaoMestre:
          'Turismo regional planejado à vista renova as energias sem comprometer os meses seguintes.',
      },
      {
        codigo: '2',
        rotuloAcao: 'Ação 2 · Lazer Econômico na Cidade',
        titulo: 'Programação Cultural Gratuita + Piquenique (R$ 60)',
        descricao: 'Aproveita shows gratuitos, museus e parques da própria cidade por R$ 60.',
        impactoMoedas: -60,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 8,
        tipoEscolha: 'economica',
        falaReacaoFamilia: 'Descobrimos lugares incríveis na nossa própria cidade gastando R$ 60!',
        explicacaoMestre:
          'Lazer de qualidade não exige viajar longe quando o orçamento do mês está apertado.',
      },
      {
        codigo: '3',
        rotuloAcao: 'Ação 3 · Pacote Completo no Cartão em 4x',
        titulo: 'Fechar Hotel Caro + Passeios Extras no Cartão',
        descricao: 'Gasta R$ 320 na viagem hoje + 3 parcelas de R$ 240 na volta!',
        impactoMoedas: -320,
        usaCofreReserva: false,
        parcelaCartaoFutura: 240,
        mesesParcela: 3,
        impactoCoracoes: 5,
        tipoEscolha: 'armadilha',
        falaReacaoFamilia: 'O feriado durou 3 dias, mas vamos pagar R$ 1.040 até o fim do semestre!',
        explicacaoMestre:
          'Viajar sem ter guardado o dinheiro antes transforma o descanso em meses de aperto financeiro.',
      },
    ],
  },
  {
    id: 502,
    titulo: 'Precisa de Roupa e Calçado Novo para Evento / Trabalho!',
    categoria: 'Vestuário e Calçados',
    grupoGrafico: 'roupas',
    nomeNPC: 'Vendedora Bia',
    cargoNPC: 'Shopping Moda Center',
    tipoNPC: 'vendedor_shopping',
    falaNPC:
      'Surgiu uma ocasião importante neste mês e o calçado antigo abriu o bico! Na vitrine tem desde o básico elegante até o look completo parcelado no cartão da loja!',
    cartas: [
      {
        codigo: '1',
        rotuloAcao: 'Ação 1 · Compra Objetiva à Vista',
        titulo: 'Levar Peça Versátil (Cor Neutra) com Desconto no PIX',
        descricao: 'Compra apenas a peça necessária que combina com tudo por R$ 160 à vista.',
        impactoMoedas: -160,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 7,
        tipoEscolha: 'planejada',
        falaReacaoFamilia: 'Peça linda, durável e comprada com 15% de desconto à vista!',
        explicacaoMestre:
          'Roupas curingas de boa qualidade duram anos e evitam compras repetidas por impulso.',
      },
      {
        codigo: '2',
        rotuloAcao: 'Ação 2 · Garimpo em Brechó / Outlet',
        titulo: 'Garimpar Peça Seminova Impecável em Brechó (R$ 75)',
        descricao: 'Encontra roupa de marca praticamente nova em brechó curado por R$ 75.',
        impactoMoedas: -75,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 8,
        tipoEscolha: 'economica',
        falaReacaoFamilia: 'Achado incrível no brechó! Estilo nota 10 gastando menos da metade!',
        explicacaoMestre:
          'A moda circular e os brechós permitem vestir-se muito bem economizando até 70%.',
      },
      {
        codigo: '3',
        rotuloAcao: 'Ação 3 · Cartão da Loja em "8x"',
        titulo: 'Levar 4 Sacolas Cheias + Calçado Caro no Cartão da Loja',
        descricao: 'Paga R$ 240 hoje + 3 parcelas de R$ 190 com anuidade do cartão!',
        impactoMoedas: -240,
        usaCofreReserva: false,
        parcelaCartaoFutura: 190,
        mesesParcela: 3,
        impactoCoracoes: 1,
        tipoEscolha: 'armadilha',
        falaReacaoFamilia: 'Saímos cheios de sacolas e com R$ 810 de dívida no cartão da loja!',
        explicacaoMestre:
          'O cartão próprio de loja de departamentos é uma das maiores fontes de endividamento no Brasil.',
      },
    ],
  },

  // --- EVENTOS CLÁSSICOS DA VIDA REAL (UNIVERSAIS PARA TODOS OS PERFIS) ---
  {
    id: 1,
    titulo: 'Geladeira Queimou de Madrugada!',
    categoria: 'Emergência Doméstica',
    grupoGrafico: 'imprevistos',
    nomeNPC: 'Zé do Gelo',
    cargoNPC: 'Técnico de Refrigeração',
    tipoNPC: 'tecnico',
    falaNPC:
      'Eita! O motor da geladeira pifou de madrugada! Se não trocar a peça hoje, os alimentos da semana vão estragar todinhos!',
    cartas: [
      {
        codigo: '1',
        rotuloAcao: 'Ação 1 · Pagar à Vista / Usar Reserva',
        titulo: 'Consertar na Hora no PIX',
        descricao: 'Paga R$ 450 à vista (usa o Cofre de Reserva se tiver) com garantia total.',
        impactoMoedas: -450,
        usaCofreReserva: true,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 6,
        tipoEscolha: 'planejada',
        falaReacaoFamilia: 'Ufa! A geladeira voltou a gelar e salvamos toda a comida do mês!',
        explicacaoMestre:
          'Pagar imprevistos à vista usando a Reserva de Emergência evita juros e impede perdas em cascata.',
      },
      {
        codigo: '2',
        rotuloAcao: 'Ação 2 · Gambiarra / Alternativa Econômica',
        titulo: 'Peça Recondicionada + Isopor no Vizinho',
        descricao: 'Negocia peça usada por R$ 260 e guarda os perecíveis no vizinho por 2 dias.',
        impactoMoedas: -260,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: -3,
        tipoEscolha: 'economica',
        falaReacaoFamilia: 'Deu trabalho carregar o isopor, mas economizamos R$ 190!',
        explicacaoMestre:
          'Alternativas econômicas e negociação reduzem o impacto no caixa sem criar dívidas futuras.',
      },
      {
        codigo: '3',
        rotuloAcao: 'Ação 3 · Passar no Cartão / Cheque Especial',
        titulo: 'Comprar Geladeira Nova Cara Parcelada',
        descricao: 'Perde comida estragada + R$ 340 agora e assume 4x de R$ 250 no cartão!',
        impactoMoedas: -340,
        usaCofreReserva: false,
        parcelaCartaoFutura: 250,
        mesesParcela: 4,
        impactoCoracoes: -8,
        tipoEscolha: 'armadilha',
        falaReacaoFamilia: 'Essa parcela de R$ 250 vai perseguir nosso orçamento por 4 meses!',
        explicacaoMestre:
          'Usar uma urgência como desculpa para fazer dívida longa no cartão compromete os salários futuros.',
      },
    ],
  },
  {
    id: 3,
    titulo: 'Conta de Luz Bandeira Vermelha!',
    categoria: 'Moradia e Contas',
    grupoGrafico: 'moradia',
    nomeNPC: 'Seu Barriga da Luz',
    cargoNPC: 'Leiturista de Energia',
    tipoNPC: 'cobrador_luz',
    falaNPC:
      'Onda de calor e bandeira vermelha patamar 2! O ventilador e o chuveiro fizeram a fatura de energia subir R$ 195 acima do esperado!',
    cartas: [
      {
        codigo: '1',
        rotuloAcao: 'Ação 1 · Pagar à Vista / Usar Reserva',
        titulo: 'Quitar em Dia e Trocar Lâmpadas por LED',
        descricao: 'Paga os R$ 210 à vista e instala LED para economizar nos próximos meses.',
        impactoMoedas: -210,
        usaCofreReserva: true,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 4,
        tipoEscolha: 'planejada',
        falaReacaoFamilia: 'Conta paga sem multa e casa iluminada gastando menos energia!',
        explicacaoMestre:
          'Quitar contas essenciais em dia evita juros e multas pesadas das concessionárias.',
      },
      {
        codigo: '2',
        rotuloAcao: 'Ação 2 · Corte de Gastos / Mutirão',
        titulo: 'Banho Rápido e Tirar Aparelhos do Stand-by',
        descricao: 'Reduz o consumo na semana para absorver a alta (custo líquido R$ 120).',
        impactoMoedas: -120,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: -2,
        tipoEscolha: 'economica',
        falaReacaoFamilia: 'Apagar luzes e desligar aparelhos da tomada salvou nosso mês!',
        explicacaoMestre:
          'O consumo fantasma (aparelhos em stand-by) pode representar até 12% da conta de luz.',
      },
      {
        codigo: '3',
        rotuloAcao: 'Ação 3 · Ignorar / Atrasar Fatura',
        titulo: 'Atrasar a Conta e Parcelar com Multa no Cartão',
        descricao: 'Paga R$ 110 agora + 2 parcelas de R$ 100 com multa e juros de atraso.',
        impactoMoedas: -110,
        usaCofreReserva: false,
        parcelaCartaoFutura: 100,
        mesesParcela: 2,
        impactoCoracoes: -9,
        tipoEscolha: 'armadilha',
        falaReacaoFamilia: 'Quase cortaram nossa luz e ainda pagamos multa cara!',
        explicacaoMestre:
          'Empurrar contas de água e luz com a barriga gera multa imediata e bola de neve.',
      },
    ],
  },
  {
    id: 4,
    titulo: 'Promoção Relâmpago: Smartphone em 12x!',
    categoria: 'Tentação / Impulso',
    grupoGrafico: 'outros',
    nomeNPC: 'Léo Vendedor VIP',
    cargoNPC: 'Mestre da Lábia',
    tipoNPC: 'vendedor_shopping',
    falaNPC:
      'Olha esse celular lançamento brilhando! O seu atual funciona bem, mas hoje você leva esse topo de linha "sem entrada pesada"!',
    cartas: [
      {
        codigo: '1',
        rotuloAcao: 'Ação 1 · Consciência Financeira',
        titulo: 'Aplicar Regra das 48h e Seguir com o Atual',
        descricao: 'Recusa a tentação porque o celular atual está ótimo! Gasto: R$ 0.',
        impactoMoedas: 0,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 5,
        tipoEscolha: 'planejada',
        falaReacaoFamilia: 'Orgulho! Não caímos no papo do vendedor e o saldo segue intacto!',
        explicacaoMestre:
          'Resistir à troca de aparelhos que ainda funcionam perfeitamente é o segredo para acumular reserva.',
      },
      {
        codigo: '2',
        rotuloAcao: 'Ação 2 · Alternativa Econômica',
        titulo: 'Trocar Só a Capinha e Película por R$ 40',
        descricao: 'Deixa o celular atual com cara de novo gastando apenas R$ 40.',
        impactoMoedas: -40,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 6,
        tipoEscolha: 'economica',
        falaReacaoFamilia: 'Capinha nova colocada! Parece celular novo por apenas R$ 40!',
        explicacaoMestre:
          'Pequenas manutenções matam o desejo de novidade por menos de 3% do preço de um aparelho novo.',
      },
      {
        codigo: '3',
        rotuloAcao: 'Ação 3 · Passar no Cartão Parcelado',
        titulo: 'Levar o Celular Novo + Seguro no Cartão',
        descricao: 'Paga R$ 280 hoje + 4 parcelas pesadas de R$ 240!',
        impactoMoedas: -280,
        usaCofreReserva: false,
        parcelaCartaoFutura: 240,
        mesesParcela: 4,
        impactoCoracoes: 2,
        tipoEscolha: 'armadilha',
        falaReacaoFamilia: 'A euforia durou 2 dias, mas a fatura de R$ 240/mês ficou!',
        explicacaoMestre:
          'O famoso "cabe na parcela" é a armadilha número 1 que faz o salário sumir todo início de mês.',
      },
    ],
  },
  {
    id: 5,
    titulo: 'Imprevisto no Transporte / Pneu e Freio!',
    categoria: 'Transporte Diário',
    grupoGrafico: 'transporte',
    nomeNPC: 'Mecânico Tião',
    cargoNPC: 'Oficina Auto & Moto',
    tipoNPC: 'mecanico',
    falaNPC:
      'Problema no transporte da semana! Precisamos fazer o reparo urgente ou gastar o dobro com deslocamento de última hora.',
    cartas: [
      {
        codigo: '1',
        rotuloAcao: 'Ação 1 · Pagar à Vista / Usar Reserva',
        titulo: 'Manutenção Completa à Vista com Desconto',
        descricao: 'Paga R$ 360 à vista (usa Reserva se tiver) e resolve com segurança.',
        impactoMoedas: -360,
        usaCofreReserva: true,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 6,
        tipoEscolha: 'planejada',
        falaReacaoFamilia: 'Transporte seguro e resolvido à vista sem juros!',
        explicacaoMestre:
          'Manutenção preventiva e corretiva à vista evita acidentes e gastos maiores depois.',
      },
      {
        codigo: '2',
        rotuloAcao: 'Ação 2 · Pesquisar Preço / Alternativa',
        titulo: 'Cotar 3 Oficinas e Comprar Peça no Distribuidor (R$ 210)',
        descricao: 'Pesquisa preço antes de fechar e economiza R$ 150.',
        impactoMoedas: -210,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 3,
        tipoEscolha: 'economica',
        falaReacaoFamilia: 'Pesquisar 3 orçamentos salvou R$ 150 do nosso bolso!',
        explicacaoMestre:
          'Nunca aprove o primeiro orçamento sem pesquisar: comparar 3 lugares economiza até 40%.',
      },
      {
        codigo: '3',
        rotuloAcao: 'Ação 3 · Adiar Conserto / Usar Cartão',
        titulo: 'Deixar Quebrar Mais e Parcelar no Cartão',
        descricao: 'Gasta R$ 260 agora + 3x de R$ 180 quando o problema agrava.',
        impactoMoedas: -260,
        usaCofreReserva: false,
        parcelaCartaoFutura: 180,
        mesesParcela: 3,
        impactoCoracoes: -9,
        tipoEscolha: 'armadilha',
        falaReacaoFamilia: 'Gastamos R$ 800 no total só porque adiamos a manutenção!',
        explicacaoMestre:
          'Adiar manutenção necessária sempre multiplica o prejuízo mecânico e financeiro.',
      },
    ],
  },
  {
    id: 6,
    titulo: 'Oportunidade de Trabalho Extra no Fim de Semana',
    categoria: 'Renda Extra vs. Descanso',
    grupoGrafico: 'rendaExtra',
    nomeNPC: 'Chefe Pacheco',
    cargoNPC: 'Coordenador de Eventos',
    tipoNPC: 'chefe',
    falaNPC:
      'Surgiu um trabalho extra neste fim de semana! Paga em dinheiro vivo no domingo, mas exige abrir mão de parte do descanso.',
    cartas: [
      {
        codigo: '1',
        rotuloAcao: 'Ação 1 · Equilíbrio Planejado',
        titulo: 'Pegar 1 Turno Extra (+R$ 300) e Descansar no Domingo',
        descricao: 'Ganha +R$ 300 extras e preserva o descanso.',
        impactoMoedas: 300,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 3,
        tipoEscolha: 'planejada',
        falaReacaoFamilia: 'Entrou +R$ 300 na conta e ainda descansamos no domingo!',
        explicacaoMestre:
          'Renda extra com equilíbrio aumenta o poder de poupança sem esgotar a saúde.',
      },
      {
        codigo: '2',
        rotuloAcao: 'Ação 2 · Foco Total no Caixa',
        titulo: 'Trabalhar os 2 Fins de Semana Inteiros (+R$ 520)',
        descricao: 'Recebe +R$ 520 na hora, mas o cansaço tira 8 Corações.',
        impactoMoedas: 520,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: -8,
        tipoEscolha: 'economica',
        falaReacaoFamilia: 'Baita reforço de +R$ 520 no caixa, mas que cansaço!',
        explicacaoMestre:
          'Fazer caixa rápido ajuda em meses difíceis, mas fique atento à barra de Corações (HP).',
      },
      {
        codigo: '3',
        rotuloAcao: 'Ação 3 · Recusar e Gastar na Rua',
        titulo: 'Recusar o Extra e Sair para Gastar (-R$ 150)',
        descricao: 'Abre mão da renda extra e gasta R$ 150 no fim de semana.',
        impactoMoedas: -150,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 5,
        tipoEscolha: 'armadilha',
        falaReacaoFamilia: 'O passeio foi bom, mas deixamos de ganhar até R$ 520!',
        explicacaoMestre:
          'Trocar uma receita extra por uma despesa gera um custo de oportunidade alto.',
      },
    ],
  },
  {
    id: 7,
    titulo: 'Inflação de 15% nos Alimentos do Supermercado!',
    categoria: 'Alimentação',
    grupoGrafico: 'alimentacao',
    nomeNPC: 'Dona Cleide',
    cargoNPC: 'Caixa do Supermercado',
    tipoNPC: 'caixa_mercado',
    falaNPC:
      'Bip! Bip! O arroz, o café, o leite e a carne subiram 15% neste mês! Como vamos passar a compra do mês sem estourar o orçamento?',
    cartas: [
      {
        codigo: '1',
        rotuloAcao: 'Ação 1 · Compra Planejada com Lista',
        titulo: 'Atacarejo com Cardápio Semanal Fechado (R$ 100)',
        descricao: 'Compra com lista planejada e zero desperdício.',
        impactoMoedas: -100,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 4,
        tipoEscolha: 'planejada',
        falaReacaoFamilia: 'Ir ao atacarejo com lista pronta segurou a inflação!',
        explicacaoMestre:
          'Planejar o cardápio semanal e seguir uma lista fechada reduz a conta de alimentação em até 25%.',
      },
      {
        codigo: '2',
        rotuloAcao: 'Ação 2 · Alternativa Econômica',
        titulo: 'Substituir Marcas Caras e Comprar na Feira (R$ 35)',
        descricao: 'Escolhe frutas/legumes da estação e marcas próprias de qualidade.',
        impactoMoedas: -35,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 5,
        tipoEscolha: 'economica',
        falaReacaoFamilia: 'Mesa farta com produtos da estação gastando quase nada a mais!',
        explicacaoMestre:
          'Alimentos da época são mais baratos e nutritivos do que industrializados de marca famosa.',
      },
      {
        codigo: '3',
        rotuloAcao: 'Ação 3 · Parcelar Mercado no Cartão',
        titulo: 'Pegar Tudo Sem Olhar Preço e Parcelar em 2x',
        descricao: 'Gasta R$ 180 agora + R$ 165 na fatura do mês que vem!',
        impactoMoedas: -180,
        usaCofreReserva: false,
        parcelaCartaoFutura: 165,
        mesesParcela: 1,
        impactoCoracoes: -4,
        tipoEscolha: 'armadilha',
        falaReacaoFamilia: 'Parcelamos a comida deste mês! No mês que vem teremos duas compras juntas!',
        explicacaoMestre:
          'Jamais parcele supermercado: a comida acaba em 30 dias, mas a dívida soma com a compra do mês seguinte.',
      },
    ],
  },
  {
    id: 8,
    titulo: 'Dor de Dente Forte Exigindo Dentista Urgente!',
    categoria: 'Saúde e Bem-Estar',
    grupoGrafico: 'cuidadosPessoais',
    nomeNPC: 'Dra. Sofia',
    cargoNPC: 'Cirurgiã-Dentista',
    tipoNPC: 'dentista',
    falaNPC:
      'Essa dor de dente precisa de tratamento imediato! Se cuidar hoje é simples; se adiar tomando só analgésico, vira canal caro!',
    cartas: [
      {
        codigo: '1',
        rotuloAcao: 'Ação 1 · Pagar à Vista / Usar Reserva',
        titulo: 'Fazer o Tratamento Agora Usando Reserva/Saldo',
        descricao: 'Paga R$ 390 à vista (usa o Cofre se tiver) e elimina a dor na hora.',
        impactoMoedas: -390,
        usaCofreReserva: true,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 10,
        tipoEscolha: 'planejada',
        falaReacaoFamilia: 'Que alívio! Saúde tratada na hora e com desconto à vista!',
        explicacaoMestre:
          'A Reserva de Emergência protege sua saúde sem precisar recorrer a empréstimos caros.',
      },
      {
        codigo: '2',
        rotuloAcao: 'Ação 2 · Alternativa Econômica',
        titulo: 'Atendimento na Clínica Odontológica da Universidade (R$ 140)',
        descricao: 'Realiza o procedimento supervisionado pagando apenas a taxa de material.',
        impactoMoedas: -140,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 5,
        tipoEscolha: 'economica',
        falaReacaoFamilia: 'Excelente atendimento universitário pagando super pouco!',
        explicacaoMestre:
          'Clínicas-escola de faculdades de odontologia oferecem ótimo tratamento por custo reduzido.',
      },
      {
        codigo: '3',
        rotuloAcao: 'Ação 3 · Adiar Tratamento / Cartão',
        titulo: 'Tomar Só Remédio Agora e Pagar Cirurgia Cara Depois',
        descricao: 'Gasta R$ 85 agora + 3 parcelas de R$ 220 quando inflama mais!',
        impactoMoedas: -85,
        usaCofreReserva: false,
        parcelaCartaoFutura: 220,
        mesesParcela: 3,
        impactoCoracoes: -15,
        tipoEscolha: 'armadilha',
        falaReacaoFamilia: 'Ficamos com dor o mês inteiro e a conta subiu para R$ 745!',
        explicacaoMestre:
          'Adiar cuidados de saúde derruba a qualidade de vida e multiplica o preço do tratamento.',
      },
    ],
  },
  {
    id: 9,
    titulo: 'Assinaturas Esquecidas Cobrando no Cartão!',
    categoria: 'Desperdício Invisível',
    grupoGrafico: 'outros',
    nomeNPC: 'Robô da Fatura',
    cargoNPC: 'Cobrança Recorrente',
    tipoNPC: 'streaming_bot',
    falaNPC:
      'BEEP! Debitando 4 streamings, 1 app de música e 1 clube de descontos que você nem lembrava que tinha assinado: R$ 175!',
    cartas: [
      {
        codigo: '1',
        rotuloAcao: 'Ação 1 · Faxina Financeira',
        titulo: 'Cancelar Assinaturas Inativas e Estornar Cobrança (+R$ 100)',
        descricao: 'Cancela tudo o que não usa e recupera +R$ 100 de estorno no mês!',
        impactoMoedas: 100,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 5,
        tipoEscolha: 'planejada',
        falaReacaoFamilia: 'Eliminamos os gastos fantasmas e recuperamos R$ 100!',
        explicacaoMestre:
          'Conferir o extrato mensalmente caça pequenos débitos automáticos que somam mais de R$ 1.800 no ano.',
      },
      {
        codigo: '2',
        rotuloAcao: 'Ação 2 · Alternativa Econômica',
        titulo: 'Manter Apenas 1 Plano Compartilhado (R$ 30)',
        descricao: 'Corta os repetidos e mantém 1 opção barata de entretenimento.',
        impactoMoedas: -30,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 4,
        tipoEscolha: 'economica',
        falaReacaoFamilia: 'Cortamos 80% do gasto com assinaturas sem perder a diversão!',
        explicacaoMestre:
          'Assinar apenas 1 serviço por vez evita pagar por catálogos que ficam parados.',
      },
      {
        codigo: '3',
        rotuloAcao: 'Ação 3 · Deixar no Automático',
        titulo: 'Pensar "Depois Eu Cancelo" e Continuar Pagando',
        descricao: 'Perde R$ 175 agora + R$ 175 nos próximos 2 meses sem usar!',
        impactoMoedas: -175,
        usaCofreReserva: false,
        parcelaCartaoFutura: 175,
        mesesParcela: 2,
        impactoCoracoes: -3,
        tipoEscolha: 'armadilha',
        falaReacaoFamilia: 'R$ 525 desperdiçados em apps que ninguém abriu!',
        explicacaoMestre:
          'A preguiça de cancelar serviços recorrentes é um dos maiores ralos do salário moderno.',
      },
    ],
  },
  {
    id: 12,
    titulo: 'Vazamento Oculto Aumentando a Conta de Água!',
    categoria: 'Manutenção Doméstica',
    grupoGrafico: 'moradia',
    nomeNPC: 'Mário Encanador',
    cargoNPC: 'Caça-Vazamentos',
    tipoNPC: 'encanador',
    falaNPC:
      'O hidrômetro não para de girar! Tem um cano trincado na parede da lavanderia desperdiçando água 24 horas por dia!',
    cartas: [
      {
        codigo: '1',
        rotuloAcao: 'Ação 1 · Consertar Hoje / Reserva',
        titulo: 'Reparo Imediato à Vista + Revisão da Tarifa (R$ 250)',
        descricao: 'Resolve o vazamento no ato e solicita revisão da fatura na companhia.',
        impactoMoedas: -250,
        usaCofreReserva: true,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 5,
        tipoEscolha: 'planejada',
        falaReacaoFamilia: 'Cano consertado e fatura de água revisada sem susto!',
        explicacaoMestre:
          'Consertar vazamentos no primeiro dia protege a estrutura da casa e abate multas de consumo.',
      },
      {
        codigo: '2',
        rotuloAcao: 'Ação 2 · Faça Você Mesmo',
        titulo: 'Comprar Conexão PVC e Veda-Rosca e Arrumar no Sábado (R$ 85)',
        descricao: 'Fecha o registro, compra a peça no depósito e faz o reparo por R$ 85.',
        impactoMoedas: -85,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 3,
        tipoEscolha: 'economica',
        falaReacaoFamilia: 'Consertamos nós mesmos no sábado e economizamos R$ 165!',
        explicacaoMestre:
          'Saber realizar reparos básicos de casa gera uma economia enorme ao longo do ano.',
      },
      {
        codigo: '3',
        rotuloAcao: 'Ação 3 · Ignorar a Umidade',
        titulo: 'Deixar para o Mês que Vem',
        descricao: 'O cano estoura: R$ 200 de conta de água agora + 2x de R$ 210 de reforma!',
        impactoMoedas: -200,
        usaCofreReserva: false,
        parcelaCartaoFutura: 210,
        mesesParcela: 2,
        impactoCoracoes: -10,
        tipoEscolha: 'armadilha',
        falaReacaoFamilia: 'A parede infiltrou toda e o conserto custou R$ 620!',
        explicacaoMestre:
          'Vazamento ignorado é dinheiro indo literalmente pelo ralo.',
      },
    ],
  },
  {
    id: 13,
    titulo: 'Desapego Online: Objetos Parados em Casa!',
    categoria: 'Estratégia de Economia',
    grupoGrafico: 'rendaExtra',
    nomeNPC: 'Lucas do Desapego',
    cargoNPC: 'Comprador Online',
    tipoNPC: 'comprador_web',
    falaNPC:
      'Vocês têm aparelhos sem uso, roupas ótimas e itens guardados pegando poeira! Vamos anunciar na internet e fazer dinheiro vivo?',
    cartas: [
      {
        codigo: '1',
        rotuloAcao: 'Ação 1 · Venda Direta no PIX',
        titulo: 'Fotografar e Vender Tudo Online (+R$ 360)',
        descricao: 'Faz anúncios caprichados e recebe +R$ 360 direto na conta!',
        impactoMoedas: 360,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 7,
        tipoEscolha: 'planejada',
        falaReacaoFamilia: 'Liberamos espaço em casa e ganhamos +R$ 360 à vista!',
        explicacaoMestre:
          'Vender o que não usa mais transforma objetos parados em fôlego para a Reserva de Emergência.',
      },
      {
        codigo: '2',
        rotuloAcao: 'Ação 2 · Venda Rápida + Doação',
        titulo: 'Vender Lote em Brechó/Usados (+R$ 190) e Doar o Resto',
        descricao: 'Recebe +R$ 190 na hora e pratica solidariedade.',
        impactoMoedas: 190,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 9,
        tipoEscolha: 'economica',
        falaReacaoFamilia: 'Entrou +R$ 190 rápido e ajudamos quem precisava!',
        explicacaoMestre:
          'A economia circular gera renda rápida e evita o desperdício.',
      },
      {
        codigo: '3',
        rotuloAcao: 'Ação 3 · Comprar Organizadores Caros',
        titulo: 'Desistir de Vender e Comprar Caixas Plásticas (-R$ 120)',
        descricao: 'Gasta R$ 120 para continuar guardando o que não usa.',
        impactoMoedas: -120,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: -2,
        tipoEscolha: 'armadilha',
        falaReacaoFamilia: 'Deixamos de ganhar R$ 360 e ainda gastamos R$ 120!',
        explicacaoMestre:
          'Guardar coisas sem utilidade ocupa espaço e impede você de gerar caixa extra.',
      },
    ],
  },
  {
    id: 15,
    titulo: 'Tentação de Pedir Delivery Várias Vezes na Semana!',
    categoria: 'Hábito e Alimentação',
    grupoGrafico: 'alimentacao',
    nomeNPC: 'Flash Motoboy',
    cargoNPC: 'App de Entrega',
    tipoNPC: 'entregador',
    falaNPC:
      'Cupom na tela na hora do cansaço! "Pede lanche, açaí e pizza aí! São só R$ 75 cada pedido, 4 vezes por semana!"',
    cartas: [
      {
        codigo: '1',
        rotuloAcao: 'Ação 1 · Marmitas Planejadas',
        titulo: 'Deixar Refeições Prontas no Freezer + 1 Lanche no Mês (R$ 80)',
        descricao: 'Organiza a comida da semana no domingo e curte 1 delivery sem culpa.',
        impactoMoedas: -80,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 7,
        tipoEscolha: 'planejada',
        falaReacaoFamilia: 'Comida caseira pronta em 5 minutos salvou nosso salário!',
        explicacaoMestre:
          'Ter marmitas saborosas prontas no congelador vence a preguiça dos dias corridos.',
      },
      {
        codigo: '2',
        rotuloAcao: 'Ação 2 · Alternativa Rápida em Casa',
        titulo: 'Desativar Notificações do App e Fazer Lanches Caseiros (R$ 30)',
        descricao: 'Prepara omelete, tapioca e sanduíche natural rápido em casa.',
        impactoMoedas: -30,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 4,
        tipoEscolha: 'economica',
        falaReacaoFamilia: 'Silenciar os cupons do celular economizou centenas de reais!',
        explicacaoMestre:
          'Notificações no horário do jantar são gatilhos emocionais para gastos não planejados.',
      },
      {
        codigo: '3',
        rotuloAcao: 'Ação 3 · Pedir Delivery Toda Semana no Cartão',
        titulo: 'Pedir Entrega 4x por Semana no Crédito',
        descricao: 'Gasta R$ 320 neste mês + R$ 160 acumulados para a próxima fatura!',
        impactoMoedas: -320,
        usaCofreReserva: false,
        parcelaCartaoFutura: 160,
        mesesParcela: 1,
        impactoCoracoes: 1,
        tipoEscolha: 'armadilha',
        falaReacaoFamilia: 'R$ 480 só em taxas e lanches de aplicativo! O salário sumiu aqui!',
        explicacaoMestre:
          'Pequenos pedidos frequentes no delivery costumam superar o valor de toda a feira do mês.',
      },
    ],
  },
];

// ============================================================================
// CONFIGURAÇÕES PADRÃO POR MODO E GÊNERO (DIVERGÊNCIA REALISTA DE GASTOS)
// ============================================================================

interface PresetPerfilOrcamento {
  titulo: string;
  subtitulo: string;
  dicaEducativa: string;
  receitas: ReceitasMensais;
  essenciais: DespesasEssenciais;
  estiloVida: DespesasEstiloVida;
  metaReserva: number;
}

const PRESETS_ORCAMENTO: Record<string, PresetPerfilOrcamento> = {
  familia: {
    titulo: 'Modo Família (Casal + Filho + Pet)',
    subtitulo: '3 Pessoas · Salário + Benefício Bolsa Família',
    dicaEducativa:
      'No Modo Família, a renda conta com o complemento do Bolsa Família, mas os gastos essenciais de supermercado, moradia e cuidados com a criança exigem forte planejamento coletivo.',
    receitas: {
      salarioMensal: 2800,
      bolsaFamilia: 600, // Exclusivo Modo Família
      peDeMeia: 0,
    },
    essenciais: {
      gastoMoradia: 1050,
      gastoAlimentacao: 850,
      gastoTransporte: 280,
    },
    estiloVida: {
      gastoRoupas: 160,
      gastoViagens: 200,
      gastoCuidadosPessoais: 160,
      outrosGastos: 100,
      nomeOutrosGastos: 'Ração do Pet Caramelo e Escola',
    },
    metaReserva: 250,
  },
  familia_grande: {
    titulo: 'Modo Família Grande (Casal + 2 Filhos + Vovó + Pet)',
    subtitulo: '5 Pessoas · Renda Familiar + Bolsa Família',
    dicaEducativa:
      'Na Família Grande (5 pessoas), as contas de alimentação, água/luz e farmácia da Vovó são mais elevadas. Qualquer desperdício multiplica por 5 no fim do mês!',
    receitas: {
      salarioMensal: 4200,
      bolsaFamilia: 750, // Exclusivo Modo Família
      peDeMeia: 0,
    },
    essenciais: {
      gastoMoradia: 1550,
      gastoAlimentacao: 1350,
      gastoTransporte: 420,
    },
    estiloVida: {
      gastoRoupas: 240,
      gastoViagens: 260,
      gastoCuidadosPessoais: 260,
      outrosGastos: 160,
      nomeOutrosGastos: 'Farmácia da Vovó e Pet',
    },
    metaReserva: 380,
  },
  individual_mulher: {
    titulo: 'Modo Individual / Jovem Solo (Mulher)',
    subtitulo: '1 Pessoa · Salário/Estágio + Incentivo Pé-de-Meia Estudantil',
    dicaEducativa:
      'Divergência Realista (Mulher): Estudos econômicos mostram que mulheres enfrentam a "Pink Tax" (produtos de higiene e cuidado pessoal até 25% mais caros), manutenção capilar/salão e maior necessidade de transporte por aplicativo à noite por segurança.',
    receitas: {
      salarioMensal: 2100,
      bolsaFamilia: 0,
      peDeMeia: 200, // Exclusivo Modo Individual Jovem
    },
    essenciais: {
      gastoMoradia: 780,
      gastoAlimentacao: 480,
      gastoTransporte: 250, // Maior peso por segurança noturna (app vs ônibus)
    },
    estiloVida: {
      gastoRoupas: 150,
      gastoViagens: 140,
      gastoCuidadosPessoais: 190, // Pink Tax, higiene feminina, cabelo/salão
      outrosGastos: 70,
      nomeOutrosGastos: 'Material de Estudo / Internet Móvel',
    },
    metaReserva: 180,
  },
  individual_homem: {
    titulo: 'Modo Individual / Jovem Solo (Homem)',
    subtitulo: '1 Pessoa · Salário/Estágio + Incentivo Pé-de-Meia Estudantil',
    dicaEducativa:
      'Divergência Realista (Homem): No perfil jovem masculino, os maiores ralos financeiros costumam vir do hábito de barbearia toda semana, gastos com jogos/assinaturas esportivas, suplementos/academia e lanches/saídas de fim de semana.',
    receitas: {
      salarioMensal: 2100,
      bolsaFamilia: 0,
      peDeMeia: 200, // Exclusivo Modo Individual Jovem
    },
    essenciais: {
      gastoMoradia: 780,
      gastoAlimentacao: 520,
      gastoTransporte: 210,
    },
    estiloVida: {
      gastoRoupas: 120,
      gastoViagens: 180, // Jogos, futebol, resenhas e passeios
      gastoCuidadosPessoais: 130, // Barbearia e academia/suplementos
      outrosGastos: 80,
      nomeOutrosGastos: 'Assinaturas Gamer / Esportes',
    },
    metaReserva: 180,
  },
};

function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

const CORES_GRAFICO_CATEGORIAS = [
  '#0284c7', // Alimentação (Sky)
  '#0d9488', // Moradia/Contas (Teal)
  '#f59e0b', // Transporte (Amber)
  '#ec4899', // Roupas (Pink)
  '#8b5cf6', // Viagens/Lazer (Violet)
  '#db2777', // Cuidados Pessoais (Rose/Fuchsia)
  '#6366f1', // Outros (Indigo)
  '#f97316', // Imprevistos (Orange)
  '#ef4444', // Juros (Red)
  '#10b981', // Cofre Reserva (Emerald)
];

// ============================================================================
// COMPONENTE PRINCIPAL DO JOGO ARCADE
// ============================================================================

export default function App() {
  // 1. Estados de Modo de Jogo e Gênero
  const [telaJogo, setTelaJogo] = useState<TelaJogo>('selecao');
  const [modoJogo, setModoJogo] = useState<ModoJogo>('familia');
  const [generoPersonagem, setGeneroPersonagem] = useState<GeneroPersonagem>('mulher');

  // 2. Estados Exatos de Receitas e Despesas (em português)
  const [salarioMensal, setSalarioMensal] = useState<number>(2800);
  const [bolsaFamilia, setBolsaFamilia] = useState<number>(600);
  const [peDeMeia, setPeDeMeia] = useState<number>(0);

  const [gastoMoradia, setGastoMoradia] = useState<number>(1050);
  const [gastoAlimentacao, setGastoAlimentacao] = useState<number>(850);
  const [gastoTransporte, setGastoTransporte] = useState<number>(280);

  const [gastoRoupas, setGastoRoupas] = useState<number>(160);
  const [gastoViagens, setGastoViagens] = useState<number>(200);
  const [gastoCuidadosPessoais, setGastoCuidadosPessoais] = useState<number>(160);
  const [outrosGastos, setOutrosGastos] = useState<number>(100);
  const [nomeOutrosGastos, setNomeOutrosGastos] = useState<string>(
    'Ração do Pet Caramelo e Escola'
  );

  const [metaReserva, setMetaReserva] = useState<number>(250);

  // 3. Estados da Simulação de 6 Meses (Fases 1 a 6)
  const [mesAtual, setMesAtual] = useState<number>(1);
  const [indiceTurnoNoMes, setIndiceTurnoNoMes] = useState<number>(0);
  const [eventosDaPartida, setEventosDaPartida] = useState<EventoNPC[]>([]);
  const [saldoAtual, setSaldoAtual] = useState<number>(0);
  const [reservaEmergencia, setReservaEmergencia] = useState<number>(0);
  const [felicidadeFamilia, setFelicidadeFamilia] = useState<number>(85);
  const [totalJurosPagos, setTotalJurosPagos] = useState<number>(0);
  const [historicoMensal, setHistoricoMensal] = useState<RegistroFaseMensal[]>([]);

  const [filaParcelasCartao, setFilaParcelasCartao] = useState<number[]>([0, 0, 0, 0, 0, 0]);
  const [dividaCartaoResidual, setDividaCartaoResidual] = useState<number>(0);

  const [faseEmAndamento, setFaseEmAndamento] = useState<RegistroFaseMensal | null>(null);
  const [decisaoDoTurno, setDecisaoDoTurno] = useState<LogDecisaoTurno | null>(null);
  const [falaFamiliaPalco, setFalaFamiliaPalco] = useState<string>('');
  const [particulasFlutuantes, setParticulasFlutuantes] = useState<ParticulaFlutuante[]>([]);
  const [tremeTela, setTremeTela] = useState<boolean>(false);
  const [somAtivo, setSomAtivo] = useState<boolean>(true);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const contadorParticulaRef = useRef<number>(1);

  // ============================================================================
  // SINTETIZADOR DE EFEITOS SONOROS ARCADE (WEB AUDIO API)
  // ============================================================================

  const tocarSomArcade = useCallback(
    (tipo: 'moeda' | 'dano' | 'clique' | 'vitoria' | 'gameover' | 'start') => {
      if (!somAtivo) return;
      try {
        if (!audioCtxRef.current) {
          const AudioContextClass =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          audioCtxRef.current = new AudioContextClass();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
        const t = ctx.currentTime;

        if (tipo === 'moeda') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(987.77, t);
          osc.frequency.setValueAtTime(1318.51, t + 0.075);
          gain.gain.setValueAtTime(0.11, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.32);
        } else if (tipo === 'dano') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(190, t);
          osc.frequency.linearRampToValueAtTime(65, t + 0.28);
          gain.gain.setValueAtTime(0.15, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.3);
        } else if (tipo === 'clique') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(520, t);
          osc.frequency.setValueAtTime(680, t + 0.03);
          gain.gain.setValueAtTime(0.08, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.07);
        } else if (tipo === 'start') {
          const notas = [261.63, 329.63, 392.0, 523.25];
          notas.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, t + i * 0.06);
            gain.gain.setValueAtTime(0.09, t + i * 0.06);
            gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.06 + 0.12);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(t + i * 0.06);
            osc.stop(t + i * 0.06 + 0.12);
          });
        } else if (tipo === 'vitoria') {
          const notas = [523.25, 659.25, 783.99, 1046.5];
          notas.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, t + i * 0.09);
            gain.gain.setValueAtTime(0.11, t + i * 0.09);
            gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.09 + 0.22);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(t + i * 0.09);
            osc.stop(t + i * 0.09 + 0.22);
          });
        } else if (tipo === 'gameover') {
          const notas = [392.0, 349.23, 329.63, 261.63];
          notas.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, t + i * 0.14);
            gain.gain.setValueAtTime(0.11, t + i * 0.14);
            gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.14 + 0.22);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(t + i * 0.14);
            osc.stop(t + i * 0.14 + 0.22);
          });
        }
      } catch {
        // Ignora silenciosamente
      }
    },
    [somAtivo]
  );

  const dispararParticulas = useCallback(
    (novas: Array<{ texto: string; cor: ParticulaFlutuante['cor']; xPercent?: number; yPercent?: number }>) => {
      const geradas: ParticulaFlutuante[] = novas.map((item, idx) => {
        contadorParticulaRef.current += 1;
        return {
          id: contadorParticulaRef.current + idx,
          texto: item.texto,
          cor: item.cor,
          xPercent: item.xPercent ?? 18 + idx * 23 + Math.floor(Math.random() * 8),
          yPercent: item.yPercent ?? 40 + (idx % 2) * 14,
        };
      });

      setParticulasFlutuantes((antigas) => [...antigas, ...geradas]);
      window.setTimeout(() => {
        setParticulasFlutuantes((atuais) =>
          atuais.filter((p) => !geradas.some((g) => g.id === p.id))
        );
      }, 1550);
    },
    []
  );

  const acionarScreenShake = useCallback(() => {
    setTremeTela(true);
    window.setTimeout(() => setTremeTela(false), 500);
  }, []);

  // ============================================================================
  // TROCA DE MODO (FAMÍLIA / INDIVIDUAL / FAMÍLIA GRANDE) E GÊNERO (HOMEM / MULHER)
  // ============================================================================

  const aplicarPresetPerfil = useCallback(
    (novoModo: ModoJogo, novoGenero: GeneroPersonagem) => {
      tocarSomArcade('clique');
      setModoJogo(novoModo);
      setGeneroPersonagem(novoGenero);

      const chavePreset =
        novoModo === 'individual'
          ? novoGenero === 'mulher'
            ? 'individual_mulher'
            : 'individual_homem'
          : novoModo;

      const preset = PRESETS_ORCAMENTO[chavePreset];
      if (!preset) return;

      setSalarioMensal(preset.receitas.salarioMensal);
      // Regra estrita: Bolsa Família somente no modo família; Pé-de-Meia somente no modo individual
      setBolsaFamilia(novoModo === 'individual' ? 0 : preset.receitas.bolsaFamilia);
      setPeDeMeia(novoModo === 'individual' ? preset.receitas.peDeMeia : 0);

      setGastoMoradia(preset.essenciais.gastoMoradia);
      setGastoAlimentacao(preset.essenciais.gastoAlimentacao);
      setGastoTransporte(preset.essenciais.gastoTransporte);

      setGastoRoupas(preset.estiloVida.gastoRoupas);
      setGastoViagens(preset.estiloVida.gastoViagens);
      setGastoCuidadosPessoais(preset.estiloVida.gastoCuidadosPessoais);
      setOutrosGastos(preset.estiloVida.outrosGastos);
      setNomeOutrosGastos(preset.estiloVida.nomeOutrosGastos);

      setMetaReserva(preset.metaReserva);
    },
    [tocarSomArcade]
  );

  const chavePresetAtivo =
    modoJogo === 'individual'
      ? generoPersonagem === 'mulher'
        ? 'individual_mulher'
        : 'individual_homem'
      : modoJogo;
  const presetAtivo = PRESETS_ORCAMENTO[chavePresetAtivo];

  // ============================================================================
  // CÁLCULOS DE RECEITAS E DESPESAS PLANEJADAS (TELA 1)
  // ============================================================================

  // Garante a regra: Bolsa Família só conta se for família; Pé-de-Meia só conta se for individual
  const bolsaFamiliaEfetivo = modoJogo === 'individual' ? 0 : bolsaFamilia;
  const peDeMeiaEfetivo = modoJogo === 'individual' ? peDeMeia : 0;

  const receitasMensaisTotais = useMemo(() => {
    return salarioMensal + bolsaFamiliaEfetivo + peDeMeiaEfetivo;
  }, [salarioMensal, bolsaFamiliaEfetivo, peDeMeiaEfetivo]);

  const totalDespesasEssenciais = useMemo(() => {
    return gastoMoradia + gastoAlimentacao + gastoTransporte;
  }, [gastoMoradia, gastoAlimentacao, gastoTransporte]);

  const totalDespesasEstiloVida = useMemo(() => {
    return gastoRoupas + gastoViagens + gastoCuidadosPessoais + outrosGastos;
  }, [gastoRoupas, gastoViagens, gastoCuidadosPessoais, outrosGastos]);

  const totalGastosMensaisPlanejados = useMemo(() => {
    return totalDespesasEssenciais + totalDespesasEstiloVida;
  }, [totalDespesasEssenciais, totalDespesasEstiloVida]);

  const percentualComprometidoFixosEVida = useMemo(() => {
    if (receitasMensaisTotais <= 0) return 100;
    return Math.round((totalGastosMensaisPlanejados / receitasMensaisTotais) * 100);
  }, [totalGastosMensaisPlanejados, receitasMensaisTotais]);

  const moedasLivresParaImprevistos = useMemo(() => {
    return receitasMensaisTotais - totalGastosMensaisPlanejados - metaReserva;
  }, [receitasMensaisTotais, totalGastosMensaisPlanejados, metaReserva]);

  // Estado de Humor em tempo real dos personagens no palco
  const humorFamiliaAtual: EstadoHumorFamilia = useMemo(() => {
    if (telaJogo === 'selecao') {
      if (
        percentualComprometidoFixosEVida > 85 ||
        moedasLivresParaImprevistos < 0 ||
        gastoAlimentacao < receitasMensaisTotais * 0.12
      ) {
        return 'panico';
      }
      if (
        percentualComprometidoFixosEVida > 72 ||
        gastoViagens + gastoCuidadosPessoais < receitasMensaisTotais * 0.05
      ) {
        return 'preocupado';
      }
      return 'feliz';
    }

    if (saldoAtual < 0 || felicidadeFamilia < 35) return 'panico';
    if (saldoAtual < receitasMensaisTotais * 0.08 || felicidadeFamilia < 60) return 'preocupado';
    return 'feliz';
  }, [
    telaJogo,
    percentualComprometidoFixosEVida,
    moedasLivresParaImprevistos,
    gastoAlimentacao,
    receitasMensaisTotais,
    gastoViagens,
    gastoCuidadosPessoais,
    saldoAtual,
    felicidadeFamilia,
  ]);

  const falaDinamicaSelecao = useMemo(() => {
    if (moedasLivresParaImprevistos < 0) {
      return 'SOCORRO! Os gastos planejados já passam da nossa Renda Total! Vamos começar no Cheque Especial!';
    }
    if (gastoAlimentacao < receitasMensaisTotais * 0.12) {
      return 'Com tão pouco dinheiro para Alimentação, vamos passar fome antes do fim do mês!';
    }
    if (percentualComprometidoFixosEVida > 78) {
      return 'PERIGO DE DÍVIDA! Mais de 78% da renda está comprometida antes mesmo dos imprevistos!';
    }
    if (metaReserva === 0) {
      return 'Sem nenhuma moeda na Meta de Reserva, qualquer emergência vai nos jogar nas dívidas!';
    }
    if (modoJogo === 'individual' && generoPersonagem === 'mulher') {
      return 'Orçamento Solo Feminino pronto! Lembre-se da Pink Tax e do Pé-de-Meia estudantil!';
    }
    if (modoJogo === 'individual' && generoPersonagem === 'homem') {
      return 'Orçamento Solo Masculino pronto! Cuidado com impulsos em jogos, barbearia e lanches!';
    }
    if (modoJogo === 'familia_grande') {
      return 'Família Grande reunida na sala! Com 5 pessoas + Pet, cada moeda bem planejada vale ouro!';
    }
    return 'Família Silva pronta! Salário + Bolsa Família configurados para enfrentar os 6 meses!';
  }, [
    moedasLivresParaImprevistos,
    gastoAlimentacao,
    receitasMensaisTotais,
    percentualComprometidoFixosEVida,
    metaReserva,
    modoJogo,
    generoPersonagem,
  ]);

  // ============================================================================
  // INÍCIO DO JOGO E VIRADA DE MÊS (FASE 1 A FASE 6)
  // ============================================================================

  const iniciarFaseMensal = useCallback(
    (
      numeroMes: number,
      saldoVindoMesAnterior: number,
      reservaVindaMesAnterior: number,
      felicidadeVinda: number,
      parcelasAgendadas: number[],
      jurosAcumulados: number
    ) => {
      // 1. Cobra 8% de juros se terminou o mês anterior no vermelho (Cheque Especial)
      const jurosDoMes =
        saldoVindoMesAnterior < 0 ? Math.round(Math.abs(saldoVindoMesAnterior) * 0.08) : 0;

      // 2. Parcelas de cartão contratadas em meses anteriores
      const faturaCartaoMes = parcelasAgendadas[numeroMes - 1] || 0;

      // 3. Soma das Fontes de Renda Mensal (salarioMensal + bolsaFamiliaEfetivo + peDeMeiaEfetivo)
      const rendaEntradaMes = salarioMensal + bolsaFamiliaEfetivo + peDeMeiaEfetivo;

      let novoSaldo =
        saldoVindoMesAnterior -
        jurosDoMes +
        rendaEntradaMes -
        totalGastosMensaisPlanejados -
        faturaCartaoMes;

      // 4. Guarda no Cofre de Reserva se houver saldo positivo
      let guardadoNesteMes = 0;
      if (metaReserva > 0 && novoSaldo >= metaReserva) {
        novoSaldo -= metaReserva;
        guardadoNesteMes = metaReserva;
      } else if (metaReserva > 0 && novoSaldo > 0) {
        guardadoNesteMes = novoSaldo;
        novoSaldo = 0;
      }

      const novaReserva = reservaVindaMesAnterior + guardadoNesteMes;

      // 5. Impacto na felicidade base do mês
      let variacaoCoracoes = 0;
      if (gastoViagens + gastoRoupas + gastoCuidadosPessoais < rendaEntradaMes * 0.06) {
        variacaoCoracoes -= 5;
      } else {
        variacaoCoracoes += 2;
      }
      if (gastoAlimentacao < rendaEntradaMes * 0.14) variacaoCoracoes -= 6;
      if (jurosDoMes > 0) variacaoCoracoes -= 8;

      const novaFelicidade = Math.max(0, Math.min(100, felicidadeVinda + variacaoCoracoes));

      const novoRegistroFase: RegistroFaseMensal = {
        mes: numeroMes,
        nomeMes: NOMES_CURTOS_MESES[numeroMes - 1],
        saldoInicial: saldoVindoMesAnterior,
        salarioBase: salarioMensal,
        bolsaFamiliaMes: bolsaFamiliaEfetivo,
        peDeMeiaMes: peDeMeiaEfetivo,
        rendaExtraEventos: 0,
        rendaTotalMes: rendaEntradaMes,
        gastoMoradiaMes: gastoMoradia,
        gastoAlimentacaoMes: gastoAlimentacao,
        gastoTransporteMes: gastoTransporte,
        gastoRoupasMes: gastoRoupas,
        gastoViagensMes: gastoViagens,
        gastoCuidadosMes: gastoCuidadosPessoais,
        gastoOutrosMes: outrosGastos,
        gastosFixosEVidaTotal: totalGastosMensaisPlanejados,
        parcelasCartaoAnteriores: faturaCartaoMes,
        gastosEventosDireto: 0,
        jurosChequeEspecial: jurosDoMes,
        reservaGuardadaFimMes: novaReserva,
        saldoFinal: novoSaldo,
        felicidadeFimMes: novaFelicidade,
        decisoes: [],
      };

      setSaldoAtual(novoSaldo);
      setReservaEmergencia(novaReserva);
      setFelicidadeFamilia(novaFelicidade);
      setTotalJurosPagos(jurosAcumulados + jurosDoMes);
      setFaseEmAndamento(novoRegistroFase);
      setIndiceTurnoNoMes(0);
      setDecisaoDoTurno(null);

      // Partículas de entrada de renda (mostrando Salário + Bolsa Família ou Pé-de-Meia!)
      const listaParticulas: Array<{ texto: string; cor: ParticulaFlutuante['cor'] }> = [
        {
          texto: `+${formatarMoeda(rendaEntradaMes)} RENDA DO MÊS!`,
          cor: 'verde',
        },
        {
          texto: `-${formatarMoeda(totalGastosMensaisPlanejados)} DESPESAS DO MÊS`,
          cor: 'amarelo',
        },
      ];

      if (bolsaFamiliaEfetivo > 0) {
        listaParticulas.push({
          texto: `BOLSA FAMÍLIA: +${formatarMoeda(bolsaFamiliaEfetivo)}`,
          cor: 'azul',
        });
      }
      if (peDeMeiaEfetivo > 0) {
        listaParticulas.push({
          texto: `PÉ-DE-MEIA: +${formatarMoeda(peDeMeiaEfetivo)}`,
          cor: 'azul',
        });
      }
      if (jurosDoMes > 0) {
        listaParticulas.push({
          texto: `-${formatarMoeda(jurosDoMes)} JUROS 8%!`,
          cor: 'vermelho',
        });
        acionarScreenShake();
        tocarSomArcade('dano');
      } else {
        tocarSomArcade('moeda');
      }

      dispararParticulas(listaParticulas);
    },
    [
      salarioMensal,
      bolsaFamiliaEfetivo,
      peDeMeiaEfetivo,
      totalGastosMensaisPlanejados,
      metaReserva,
      gastoViagens,
      gastoRoupas,
      gastoCuidadosPessoais,
      gastoAlimentacao,
      gastoMoradia,
      gastoTransporte,
      outrosGastos,
      acionarScreenShake,
      tocarSomArcade,
      dispararParticulas,
    ]
  );

  const apertarStartJogo = () => {
    // Filtra os eventos elegíveis para o Modo e Gênero escolhidos!
    const elegiveis = bancoDeEventosNPC.filter((ev) => {
      if (!ev.exclusivoPara) return true;
      if (ev.exclusivoPara === 'familia_qualquer') {
        return modoJogo === 'familia' || modoJogo === 'familia_grande';
      }
      if (ev.exclusivoPara === 'individual_qualquer') {
        return modoJogo === 'individual';
      }
      if (ev.exclusivoPara === 'individual_mulher') {
        return modoJogo === 'individual' && generoPersonagem === 'mulher';
      }
      if (ev.exclusivoPara === 'individual_homem') {
        return modoJogo === 'individual' && generoPersonagem === 'homem';
      }
      return true;
    });

    // Prioriza colocar os eventos exclusivos do perfil escolhido entre os 12 sorteados dos 6 meses!
    const exclusivosDoPerfil = elegiveis.filter((e) => Boolean(e.exclusivoPara));
    const universais = elegiveis.filter((e) => !e.exclusivoPara);

    const embaralhar = <T,>(arr: T[]): T[] => {
      const copia = [...arr];
      for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
      }
      return copia;
    };

    const selecionados = embaralhar([
      ...embaralhar(exclusivosDoPerfil),
      ...embaralhar(universais),
    ].slice(0, 12));

    const coracoesIniciais =
      percentualComprometidoFixosEVida > 82 || gastoAlimentacao < receitasMensaisTotais * 0.13
        ? 65
        : 85;
    const filaZerada = [0, 0, 0, 0, 0, 0];

    setEventosDaPartida(selecionados);
    setHistoricoMensal([]);
    setFilaParcelasCartao(filaZerada);
    setDividaCartaoResidual(0);
    setMesAtual(1);
    setTelaJogo('gameplay');

    tocarSomArcade('start');
    iniciarFaseMensal(1, 0, 0, coracoesIniciais, filaZerada, 0);
  };

  const eventoAtualNPC: EventoNPC | undefined = useMemo(() => {
    const idx = (mesAtual - 1) * 2 + indiceTurnoNoMes;
    return eventosDaPartida[idx];
  }, [eventosDaPartida, mesAtual, indiceTurnoNoMes]);

  // ============================================================================
  // PROCESSAR DECISÃO NAS CARTAS DE AÇÃO ARCADE
  // ============================================================================

  const processarDecisao = useCallback(
    (carta: CartaAcaoArcade) => {
      if (!eventoAtualNPC || !faseEmAndamento || decisaoDoTurno) return;

      let variacaoCaixa = carta.impactoMoedas;
      let valorTiradoDoCofre = 0;
      let novaReserva = reservaEmergencia;

      if (carta.usaCofreReserva && variacaoCaixa < 0 && novaReserva > 0) {
        const custo = Math.abs(variacaoCaixa);
        if (novaReserva >= custo) {
          valorTiradoDoCofre = custo;
          novaReserva -= custo;
          variacaoCaixa = 0;
        } else {
          valorTiradoDoCofre = novaReserva;
          variacaoCaixa = -(custo - novaReserva);
          novaReserva = 0;
        }
      }

      const novoSaldo = saldoAtual + variacaoCaixa;
      const novaFelicidade = Math.max(
        0,
        Math.min(100, felicidadeFamilia + carta.impactoCoracoes)
      );

      const novaFilaParcelas = [...filaParcelasCartao];
      let novoResidualPosJogo = dividaCartaoResidual;
      if (carta.parcelaCartaoFutura > 0 && carta.mesesParcela > 0) {
        for (let m = 1; m <= carta.mesesParcela; m++) {
          const indiceAlvo = mesAtual - 1 + m;
          if (indiceAlvo < 6) {
            novaFilaParcelas[indiceAlvo] += carta.parcelaCartaoFutura;
          } else {
            novoResidualPosJogo += carta.parcelaCartaoFutura;
          }
        }
      }

      const dividaTotalCriada = carta.parcelaCartaoFutura * carta.mesesParcela;

      const logTurno: LogDecisaoTurno = {
        mes: mesAtual,
        nomeMes: NOMES_CURTOS_MESES[mesAtual - 1],
        eventoId: eventoAtualNPC.id,
        eventoTitulo: eventoAtualNPC.titulo,
        grupoGrafico: eventoAtualNPC.grupoGrafico,
        acaoEscolhida: carta.codigo,
        tituloAcao: carta.titulo,
        impactoCaixa: variacaoCaixa,
        usouReserva: valorTiradoDoCofre,
        dividaFuturaGerada: dividaTotalCriada,
        impactoCoracoes: carta.impactoCoracoes,
        tipoEscolha: carta.tipoEscolha,
        explicacaoMestre: carta.explicacaoMestre,
      };

      const ganhoExtra = carta.impactoMoedas > 0 ? carta.impactoMoedas : 0;
      const gastoDireto = carta.impactoMoedas < 0 ? Math.abs(carta.impactoMoedas) : 0;

      const faseAtualizada: RegistroFaseMensal = {
        ...faseEmAndamento,
        rendaExtraEventos: faseEmAndamento.rendaExtraEventos + ganhoExtra,
        gastosEventosDireto: faseEmAndamento.gastosEventosDireto + gastoDireto,
        reservaGuardadaFimMes: novaReserva,
        saldoFinal: novoSaldo,
        felicidadeFimMes: novaFelicidade,
        decisoes: [...faseEmAndamento.decisoes, logTurno],
      };

      setSaldoAtual(novoSaldo);
      setReservaEmergencia(novaReserva);
      setFelicidadeFamilia(novaFelicidade);
      setFilaParcelasCartao(novaFilaParcelas);
      setDividaCartaoResidual(novoResidualPosJogo);
      setFaseEmAndamento(faseAtualizada);
      setDecisaoDoTurno(logTurno);
      setFalaFamiliaPalco(carta.falaReacaoFamilia);

      const popups: Array<{ texto: string; cor: ParticulaFlutuante['cor'] }> = [];
      if (valorTiradoDoCofre > 0) {
        popups.push({
          texto: `COFRE PROTEGEU: ${formatarMoeda(valorTiradoDoCofre)}!`,
          cor: 'azul',
        });
      }
      if (variacaoCaixa > 0) {
        popups.push({ texto: `+${formatarMoeda(variacaoCaixa)}`, cor: 'verde' });
      } else if (variacaoCaixa < 0) {
        popups.push({ texto: `${formatarMoeda(variacaoCaixa)}`, cor: 'vermelho' });
      }
      if (dividaTotalCriada > 0) {
        popups.push({
          texto: `CARTÃO: ${carta.mesesParcela}x R$ ${carta.parcelaCartaoFutura}`,
          cor: 'amarelo',
        });
      }
      if (carta.impactoCoracoes !== 0) {
        popups.push({
          texto: `${carta.impactoCoracoes > 0 ? '+' : ''}${carta.impactoCoracoes} Corações`,
          cor: 'rosa',
        });
      }

      dispararParticulas(popups);

      if (carta.tipoEscolha === 'armadilha' || novoSaldo < 0) {
        tocarSomArcade('dano');
        acionarScreenShake();
      } else if (variacaoCaixa > 0 || carta.tipoEscolha === 'planejada') {
        tocarSomArcade('moeda');
      } else {
        tocarSomArcade('clique');
      }
    },
    [
      eventoAtualNPC,
      faseEmAndamento,
      decisaoDoTurno,
      reservaEmergencia,
      saldoAtual,
      felicidadeFamilia,
      filaParcelasCartao,
      dividaCartaoResidual,
      mesAtual,
      dispararParticulas,
      tocarSomArcade,
      acionarScreenShake,
    ]
  );

  const avancarProximoTurno = useCallback(() => {
    if (!faseEmAndamento || !decisaoDoTurno) return;

    if (indiceTurnoNoMes === 0) {
      setIndiceTurnoNoMes(1);
      setDecisaoDoTurno(null);
      tocarSomArcade('clique');
      return;
    }

    const novoHistorico = [...historicoMensal, faseEmAndamento];
    setHistoricoMensal(novoHistorico);

    if (mesAtual < 6) {
      const proximo = mesAtual + 1;
      setMesAtual(proximo);
      iniciarFaseMensal(
        proximo,
        saldoAtual,
        reservaEmergencia,
        felicidadeFamilia,
        filaParcelasCartao,
        totalJurosPagos
      );
    } else {
      setTelaJogo('zeramento');
      if (saldoAtual >= 0 && totalJurosPagos === 0) {
        tocarSomArcade('vitoria');
      } else {
        tocarSomArcade('gameover');
      }
    }
  }, [
    faseEmAndamento,
    decisaoDoTurno,
    indiceTurnoNoMes,
    historicoMensal,
    mesAtual,
    iniciarFaseMensal,
    saldoAtual,
    reservaEmergencia,
    felicidadeFamilia,
    filaParcelasCartao,
    totalJurosPagos,
    tocarSomArcade,
  ]);

  useEffect(() => {
    if (telaJogo !== 'gameplay') return;
    const aoPressionarTecla = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (!decisaoDoTurno && eventoAtualNPC) {
        if (e.key === '1') {
          e.preventDefault();
          processarDecisao(eventoAtualNPC.cartas[0]);
        } else if (e.key === '2') {
          e.preventDefault();
          processarDecisao(eventoAtualNPC.cartas[1]);
        } else if (e.key === '3') {
          e.preventDefault();
          processarDecisao(eventoAtualNPC.cartas[2]);
        }
      } else if (decisaoDoTurno && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        avancarProximoTurno();
      }
    };
    window.addEventListener('keydown', aoPressionarTecla);
    return () => window.removeEventListener('keydown', aoPressionarTecla);
  }, [telaJogo, decisaoDoTurno, eventoAtualNPC, processarDecisao, avancarProximoTurno]);

  // ============================================================================
  // CONSOLIDAÇÃO FINAL PARA A TELA 3 (GRÁFICO DETALHADO + PLANILHA + RANKING)
  // ============================================================================

  const relatorioFinal = useMemo(() => {
    const rendaTotal6Meses = historicoMensal.reduce(
      (acc, m) => acc + m.rendaTotalMes + m.rendaExtraEventos,
      0
    );
    const patrimonioFinal = saldoAtual + reservaEmergencia - dividaCartaoResidual;

    let somaAlimentacao = gastoAlimentacao * 6;
    let somaMoradia = gastoMoradia * 6;
    let somaTransporte = gastoTransporte * 6;
    let somaRoupas = gastoRoupas * 6;
    let somaViagens = gastoViagens * 6;
    let somaCuidados = gastoCuidadosPessoais * 6;
    let somaOutros = outrosGastos * 6;
    let somaImprevistos = 0;

    const todasDecisoes = historicoMensal.flatMap((m) => m.decisoes);
    todasDecisoes.forEach((d) => {
      const custoTotalDecisao =
        (d.impactoCaixa < 0 ? Math.abs(d.impactoCaixa) : 0) +
        d.usouReserva +
        d.dividaFuturaGerada;
      if (custoTotalDecisao > 0) {
        if (d.grupoGrafico === 'alimentacao') somaAlimentacao += custoTotalDecisao;
        else if (d.grupoGrafico === 'moradia') somaMoradia += custoTotalDecisao;
        else if (d.grupoGrafico === 'transporte') somaTransporte += custoTotalDecisao;
        else if (d.grupoGrafico === 'roupas') somaRoupas += custoTotalDecisao;
        else if (d.grupoGrafico === 'viagens') somaViagens += custoTotalDecisao;
        else if (d.grupoGrafico === 'cuidadosPessoais') somaCuidados += custoTotalDecisao;
        else if (d.grupoGrafico === 'outros') somaOutros += custoTotalDecisao;
        else if (d.grupoGrafico === 'imprevistos') somaImprevistos += custoTotalDecisao;
      }
    });

    const rotuloOutros = nomeOutrosGastos.trim()
      ? `Outros (${nomeOutrosGastos.trim().slice(0, 18)})`
      : 'Outros Gastos';

    const dadosPizza = [
      { name: 'Alimentação', value: somaAlimentacao, cor: CORES_GRAFICO_CATEGORIAS[0] },
      { name: 'Moradia/Contas', value: somaMoradia, cor: CORES_GRAFICO_CATEGORIAS[1] },
      { name: 'Transporte', value: somaTransporte, cor: CORES_GRAFICO_CATEGORIAS[2] },
      { name: 'Roupas', value: somaRoupas, cor: CORES_GRAFICO_CATEGORIAS[3] },
      { name: 'Viagens/Lazer', value: somaViagens, cor: CORES_GRAFICO_CATEGORIAS[4] },
      { name: 'Cuidados Pessoais', value: somaCuidados, cor: CORES_GRAFICO_CATEGORIAS[5] },
      { name: rotuloOutros, value: somaOutros, cor: CORES_GRAFICO_CATEGORIAS[6] },
      { name: 'Imprevistos', value: somaImprevistos, cor: CORES_GRAFICO_CATEGORIAS[7] },
      { name: 'Juros Pagos', value: totalJurosPagos, cor: CORES_GRAFICO_CATEGORIAS[8] },
      { name: 'Cofre Reserva', value: Math.max(0, reservaEmergencia), cor: CORES_GRAFICO_CATEGORIAS[9] },
    ].filter((i) => i.value > 0);

    const dadosBarras = historicoMensal.map((m) => ({
      mes: m.nomeMes,
      SaldoFinal: m.saldoFinal,
      CofreReserva: m.reservaGuardadaFimMes,
      JurosPagos: m.jurosChequeEspecial,
    }));

    const armadilhasEscolhidas = todasDecisoes.filter((d) => d.tipoEscolha === 'armadilha');
    const totalDesperdicadoArmadilhas = armadilhasEscolhidas.reduce(
      (acc, d) =>
        acc + (d.impactoCaixa < 0 ? Math.abs(d.impactoCaixa) : 0) + d.dividaFuturaGerada,
      0
    );

    let ranking: {
      rank: string;
      titulo: string;
      subtitulo: string;
      corBg: string;
      icone: 'trofeu' | 'medalha' | 'caveira';
    };

    if (
      saldoAtual >= 0 &&
      totalJurosPagos === 0 &&
      patrimonioFinal >= receitasMensaisTotais * 0.3 &&
      felicidadeFamilia >= 60
    ) {
      ranking = {
        rank: 'RANK S',
        titulo: 'Mestre das Finanças - Rank S',
        subtitulo:
          'Pontuação Máxima! Vocês equilibraram todas as categorias de despesas, usaram o Cofre de Reserva e zeraram sem pagar juros!',
        corBg: 'bg-emerald-400 text-slate-950',
        icone: 'trofeu',
      };
    } else if (saldoAtual < 0 || totalJurosPagos > receitasMensaisTotais * 0.15 || patrimonioFinal < 0) {
      ranking = {
        rank: 'GAME OVER',
        titulo: 'Engolido pelos Juros - Game Over',
        subtitulo:
          'O Monstro do Cheque Especial (8% a.m.) e as parcelas acumuladas no cartão devoraram a renda mensal!',
        corBg: 'bg-rose-500 text-white',
        icone: 'caveira',
      };
    } else {
      ranking = {
        rank: 'RANK B',
        titulo: 'Sobrevivente no Limite - Rank B',
        subtitulo:
          'Vocês chegaram ao fim de Junho, mas passaram aperto no orçamento ou sacrificaram corações de bem-estar!',
        corBg: 'bg-amber-300 text-slate-950',
        icone: 'medalha',
      };
    }

    return {
      rendaTotal6Meses,
      patrimonioFinal,
      dadosPizza,
      dadosBarras,
      armadilhasEscolhidas,
      totalDesperdicadoArmadilhas,
      ranking,
    };
  }, [
    historicoMensal,
    saldoAtual,
    reservaEmergencia,
    dividaCartaoResidual,
    gastoAlimentacao,
    gastoMoradia,
    gastoTransporte,
    gastoRoupas,
    gastoViagens,
    gastoCuidadosPessoais,
    outrosGastos,
    nomeOutrosGastos,
    totalJurosPagos,
    receitasMensaisTotais,
    felicidadeFamilia,
  ]);

  const exportarPlanilhaCSV = () => {
    const cabecalho = [
      'Fase/Mes',
      'Salario (R$)',
      'Bolsa Familia (R$)',
      'Pe-de-Meia (R$)',
      'Renda Extra Eventos (R$)',
      'Renda Total (R$)',
      'Alimentacao (R$)',
      'Moradia e Transporte (R$)',
      'Roupas (R$)',
      'Viagens e Lazer (R$)',
      'Cuidados Pessoais e Outros (R$)',
      'Eventos e Parcelas Cartao (R$)',
      'Juros Pagos (R$)',
      'Cofre Reserva (R$)',
      'Saldo Final (R$)',
    ];
    const linhas = historicoMensal.map((m) => [
      m.nomeMes,
      m.salarioBase.toFixed(2),
      m.bolsaFamiliaMes.toFixed(2),
      m.peDeMeiaMes.toFixed(2),
      m.rendaExtraEventos.toFixed(2),
      (m.rendaTotalMes + m.rendaExtraEventos).toFixed(2),
      m.gastoAlimentacaoMes.toFixed(2),
      (m.gastoMoradiaMes + m.gastoTransporteMes).toFixed(2),
      m.gastoRoupasMes.toFixed(2),
      m.gastoViagensMes.toFixed(2),
      (m.gastoCuidadosMes + m.gastoOutrosMes).toFixed(2),
      (m.gastosEventosDireto + m.parcelasCartaoAnteriores).toFixed(2),
      m.jurosChequeEspecial.toFixed(2),
      m.reservaGuardadaFimMes.toFixed(2),
      m.saldoFinal.toFixed(2),
    ]);
    const csv = '\uFEFF' + [cabecalho.join(';'), ...linhas.map((l) => l.join(';'))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'planilha_orcamento_sobrevivencia_financeira.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const reiniciarFliperama = () => {
    tocarSomArcade('clique');
    setTelaJogo('selecao');
    setHistoricoMensal([]);
    setDecisaoDoTurno(null);
    setMesAtual(1);
    setIndiceTurnoNoMes(0);
    setSaldoAtual(0);
    setReservaEmergencia(0);
    setTotalJurosPagos(0);
  };

  // ============================================================================
  // RENDERIZAÇÃO PRINCIPAL DO JOGO ARCADE
  // ============================================================================

  return (
    <div
      className={`min-h-screen bg-amber-100 text-slate-900 flex flex-col justify-between ${
        tremeTela ? 'animate-screen-shake' : ''
      }`}
    >
      {/* CABEÇALHO DE FLIPERAMA / ARCADE TOP BAR (3 ZONAS) */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white border-b-4 border-slate-950 px-4 sm:px-8 py-3 no-print">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
          <button
            type="button"
            onClick={reiniciarFliperama}
            className="flex items-center gap-2.5 text-left cursor-pointer group whitespace-nowrap shrink-0"
          >
            <span className="p-1.5 rounded-xl bg-amber-400 text-slate-950 border-2 border-white shadow-[2px_2px_0px_0px_#10b981]">
              <Gamepad2 className="w-5 h-5" />
            </span>
            <span className="font-display font-black text-base sm:text-xl tracking-tight text-amber-300 group-hover:text-emerald-300 transition-colors">
              SOBREVIVÊNCIA FINANCEIRA: O SALÁRIO SUMIU!
            </span>
          </button>

          <nav className="hidden lg:flex items-center gap-5 text-xs font-mono font-bold">
            <span
              className={
                telaJogo === 'selecao'
                  ? 'text-emerald-400 underline underline-offset-4 decoration-2'
                  : 'text-slate-400'
              }
            >
              1. PERFIL & ORÇAMENTO RPG
            </span>
            <span className="text-slate-600">►</span>
            <span
              className={
                telaJogo === 'gameplay'
                  ? 'text-emerald-400 underline underline-offset-4 decoration-2'
                  : 'text-slate-400'
              }
            >
              2. SOBREVIVER 6 MESES
            </span>
            <span className="text-slate-600">►</span>
            <span
              className={
                telaJogo === 'zeramento'
                  ? 'text-emerald-400 underline underline-offset-4 decoration-2'
                  : 'text-slate-400'
              }
            >
              3. HIGH SCORE & PLANILHA
            </span>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setSomAtivo((s) => !s)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 text-xs font-mono font-bold flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
            >
              {somAtivo ? (
                <>
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">SOM 8-BIT ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-rose-400" />
                  <span className="text-slate-400">MUDO</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================================
          TELA 1: SELEÇÃO DE MODO, GÊNERO E ORÇAMENTO COMPLETO (RPG)
         ===================================================================== */}
      {telaJogo === 'selecao' && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6">
          {/* Banner Superior estilo Fliperama */}
          <div className="arcade-card rounded-3xl bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white p-5 sm:p-6 flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 text-xs font-mono font-extrabold text-amber-300 uppercase tracking-widest">
                <Sparkles className="w-4 h-4" />
                <span>ARCADE LIFE-SIM · EDUCAÇÃO FINANCEIRA</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black font-display tracking-tight text-white">
                ESCOLHA SEU MODO E MONTE O ORÇAMENTO!
              </h1>
              <p className="text-xs sm:text-sm text-indigo-200 max-w-2xl">
                Jogue com a Família Silva, com a Família Grande (com Bolsa Família) ou no Modo
                Jovem Individual (Homem ou Mulher, com incentivo Pé-de-Meia)!
              </p>
            </div>

            <button
              type="button"
              onClick={apertarStartJogo}
              className="arcade-btn px-7 py-4 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-display font-black text-lg sm:text-xl tracking-wide flex items-center gap-3 cursor-pointer shrink-0 animate-bounce"
            >
              <Play className="w-6 h-6 fill-slate-950" />
              <span>PRESS START (6 MESES)</span>
            </button>
          </div>

          {/* Grid Principal da Tela 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Coluna Esquerda (5 cols): Palco 2D Reativo + Seleção de Modo e Gênero */}
            <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-20">
              {/* 1. Seletor de Modo de Jogo e Gênero */}
              <div className="arcade-card rounded-3xl bg-white p-5 space-y-4">
                <h2 className="font-display font-black text-base sm:text-lg text-slate-900 uppercase">
                  1. Escolha quem vai morar na Sala (Modo de Jogo)
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Botão Modo Família (3 pessoas + Pet) */}
                  <button
                    type="button"
                    onClick={() => aplicarPresetPerfil('familia', generoPersonagem)}
                    className={`p-3 rounded-2xl border-3 border-slate-900 text-left transition-all cursor-pointer flex flex-col justify-between ${
                      modoJogo === 'familia'
                        ? 'bg-amber-300 shadow-[4px_4px_0px_0px_#0f172a] -translate-y-0.5'
                        : 'bg-slate-50 hover:bg-amber-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Users className="w-5 h-5 text-slate-900" />
                      <span className="px-1.5 py-0.5 rounded bg-slate-900 text-amber-300 font-mono text-[9px] font-black">
                        3 PESSOAS
                      </span>
                    </div>
                    <div className="mt-2">
                      <div className="font-display font-black text-sm text-slate-900 leading-tight">
                        Modo Família
                      </div>
                      <div className="text-[11px] font-semibold text-slate-700 mt-0.5">
                        Pai, Mãe, Filho + Pet (Com Bolsa Família)
                      </div>
                    </div>
                  </button>

                  {/* Botão Modo Individual / Jovem Solo (1 pessoa: Homem ou Mulher) */}
                  <button
                    type="button"
                    onClick={() => aplicarPresetPerfil('individual', generoPersonagem)}
                    className={`p-3 rounded-2xl border-3 border-slate-900 text-left transition-all cursor-pointer flex flex-col justify-between ${
                      modoJogo === 'individual'
                        ? 'bg-pink-300 shadow-[4px_4px_0px_0px_#0f172a] -translate-y-0.5'
                        : 'bg-slate-50 hover:bg-pink-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <User className="w-5 h-5 text-slate-900" />
                      <span className="px-1.5 py-0.5 rounded bg-slate-900 text-pink-300 font-mono text-[9px] font-black">
                        1 PESSOA
                      </span>
                    </div>
                    <div className="mt-2">
                      <div className="font-display font-black text-sm text-slate-900 leading-tight">
                        Jovem Solo
                      </div>
                      <div className="text-[11px] font-semibold text-slate-700 mt-0.5">
                        Homem ou Mulher (Com Pé-de-Meia)
                      </div>
                    </div>
                  </button>

                  {/* Botão Modo Família Grande (5 pessoas + Pet) */}
                  <button
                    type="button"
                    onClick={() => aplicarPresetPerfil('familia_grande', generoPersonagem)}
                    className={`p-3 rounded-2xl border-3 border-slate-900 text-left transition-all cursor-pointer flex flex-col justify-between ${
                      modoJogo === 'familia_grande'
                        ? 'bg-emerald-300 shadow-[4px_4px_0px_0px_#0f172a] -translate-y-0.5'
                        : 'bg-slate-50 hover:bg-emerald-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Users className="w-5 h-5 text-slate-900" />
                      <span className="px-1.5 py-0.5 rounded bg-slate-900 text-emerald-300 font-mono text-[9px] font-black">
                        5 PESSOAS
                      </span>
                    </div>
                    <div className="mt-2">
                      <div className="font-display font-black text-sm text-slate-900 leading-tight">
                        Família Grande
                      </div>
                      <div className="text-[11px] font-semibold text-slate-700 mt-0.5">
                        Casal, 2 Filhos, Vovó + Pet (Bolsa Família)
                      </div>
                    </div>
                  </button>
                </div>

                {/* SELETOR OBRIGATÓRIO DE GÊNERO QUANDO ESTIVER NO MODO INDIVIDUAL */}
                {modoJogo === 'individual' && (
                  <div className="p-3.5 rounded-2xl bg-slate-900 text-white space-y-2.5 border-3 border-slate-950">
                    <div className="text-xs font-mono font-extrabold text-amber-300 uppercase">
                      ★ Escolha o Gênero do Personagem Solo (Altera Gastos e Eventos):
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => aplicarPresetPerfil('individual', 'mulher')}
                        className={`py-2.5 px-3 rounded-xl border-2 font-display font-black text-sm flex items-center justify-center gap-2 cursor-pointer transition-all ${
                          generoPersonagem === 'mulher'
                            ? 'bg-pink-500 text-white border-white shadow-[3px_3px_0px_0px_#facc15]'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        <span>👩 MULHER (SOLO)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => aplicarPresetPerfil('individual', 'homem')}
                        className={`py-2.5 px-3 rounded-xl border-2 font-display font-black text-sm flex items-center justify-center gap-2 cursor-pointer transition-all ${
                          generoPersonagem === 'homem'
                            ? 'bg-sky-500 text-white border-white shadow-[3px_3px_0px_0px_#facc15]'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        <span>👨 HOMEM (SOLO)</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Dica Educativa sobre o Perfil / Divergência por Gênero */}
                <div className="p-3.5 rounded-2xl bg-amber-50 border-2 border-slate-900 flex items-start gap-2.5">
                  <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-800 space-y-0.5">
                    <div className="font-display font-black text-slate-900">
                      {presetAtivo.titulo}
                    </div>
                    <p className="leading-relaxed font-medium">{presetAtivo.dicaEducativa}</p>
                  </div>
                </div>
              </div>

              {/* Palco 2D Interativo ao Vivo na Tela Inicial */}
              <PalcoSalaFamilia
                modoJogo={modoJogo}
                generoPersonagem={generoPersonagem}
                humor={humorFamiliaAtual}
                saldoAtual={moedasLivresParaImprevistos}
                felicidadeFamilia={
                  humorFamiliaAtual === 'feliz' ? 90 : humorFamiliaAtual === 'preocupado' ? 58 : 30
                }
                mesNome="FASE DE PREPARAÇÃO"
                falaFamilia={falaDinamicaSelecao}
                particulas={particulasFlutuantes}
                modoCompacto={true}
              />
            </div>

            {/* Coluna Direita (7 cols): Novos Campos Exatos de Renda, Despesas e Poupança */}
            <div className="lg:col-span-7 space-y-5">
              {/* GRUPO A: FONTES DE RENDA MENSAL (receitasMensais) */}
              <section className="arcade-card rounded-3xl bg-white p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b-3 border-slate-900 pb-3">
                  <div>
                    <h2 className="font-display font-black text-base sm:text-lg text-slate-900 uppercase">
                      A) Fontes de Renda Mensal (Entradas)
                    </h2>
                    <p className="text-xs text-slate-600 font-medium">
                      Somam automaticamente no início de cada um dos 6 meses
                    </p>
                  </div>
                  <div className="px-3.5 py-1.5 rounded-xl bg-emerald-400 border-2 border-slate-900 text-slate-950 font-mono text-sm font-black tabular-nums">
                    RENDA TOTAL: {formatarMoeda(receitasMensaisTotais)}/mês
                  </div>
                </div>

                <div className="space-y-3.5">
                  {/* 1. salarioMensal */}
                  <div className="p-3.5 rounded-2xl bg-emerald-50/70 border-2 border-slate-900 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 font-display font-black text-xs sm:text-sm text-slate-900">
                        <Coins className="w-4 h-4 text-emerald-700" />
                        <span>Salário do Trabalho / Estágio (salarioMensal)</span>
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono font-bold text-slate-500">R$</span>
                        <input
                          type="number"
                          min={0}
                          max={25000}
                          step={50}
                          value={salarioMensal}
                          onChange={(e) =>
                            setSalarioMensal(Math.max(0, Number(e.target.value) || 0))
                          }
                          aria-label="Salário Mensal"
                          className="w-28 px-2.5 py-1 rounded-lg border-2 border-slate-900 bg-white font-mono font-black text-sm text-right tabular-nums"
                        />
                      </div>
                    </div>
                    <input
                      type="range"
                      min={600}
                      max={10000}
                      step={50}
                      value={Math.min(10000, salarioMensal)}
                      onChange={(e) => setSalarioMensal(Number(e.target.value))}
                      aria-label="Controle Salário Mensal"
                      className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                    />
                  </div>

                  {/* 2. bolsaFamilia (SOMENTE NO MODO FAMÍLIA OU FAMÍLIA GRANDE) */}
                  {(modoJogo === 'familia' || modoJogo === 'familia_grande') && (
                    <div className="p-3.5 rounded-2xl bg-sky-50 border-2 border-slate-900 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2 font-display font-black text-xs sm:text-sm text-slate-900">
                          <HandCoins className="w-4 h-4 text-sky-700" />
                          <span>Benefício Bolsa Família (Exclusivo Modo Família)</span>
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-mono font-bold text-slate-500">R$</span>
                          <input
                            type="number"
                            min={0}
                            max={1500}
                            step={50}
                            value={bolsaFamilia}
                            onChange={(e) =>
                              setBolsaFamilia(Math.max(0, Number(e.target.value) || 0))
                            }
                            aria-label="Benefício Bolsa Família"
                            className="w-24 px-2.5 py-1 rounded-lg border-2 border-slate-900 bg-white font-mono font-black text-sm text-right tabular-nums"
                          />
                        </div>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={1200}
                        step={50}
                        value={Math.min(1200, bolsaFamilia)}
                        onChange={(e) => setBolsaFamilia(Number(e.target.value))}
                        aria-label="Controle Bolsa Família"
                        className="w-full accent-sky-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                      />
                      <div className="text-[11px] text-slate-600 font-medium">
                        Dica: Base de R$ 600 + R$ 150 por criança pequena / R$ 50 por estudante.
                      </div>
                    </div>
                  )}

                  {/* 3. peDeMeia (SOMENTE NO MODO INDIVIDUAL / JOVEM SOLO) */}
                  {modoJogo === 'individual' && (
                    <div className="p-3.5 rounded-2xl bg-purple-50 border-2 border-slate-900 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2 font-display font-black text-xs sm:text-sm text-slate-900">
                          <GraduationCap className="w-4 h-4 text-purple-700" />
                          <span>Incentivo Pé-de-Meia Estudantil (Exclusivo Jovem Solo)</span>
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-mono font-bold text-slate-500">R$</span>
                          <input
                            type="number"
                            min={0}
                            max={600}
                            step={50}
                            value={peDeMeia}
                            onChange={(e) =>
                              setPeDeMeia(Math.max(0, Number(e.target.value) || 0))
                            }
                            aria-label="Incentivo Pé-de-Meia"
                            className="w-24 px-2.5 py-1 rounded-lg border-2 border-slate-900 bg-white font-mono font-black text-sm text-right tabular-nums"
                          />
                        </div>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={400}
                        step={50}
                        value={Math.min(400, peDeMeia)}
                        onChange={(e) => setPeDeMeia(Number(e.target.value))}
                        aria-label="Controle Pé-de-Meia"
                        className="w-full accent-purple-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                      />
                      <div className="text-[11px] text-slate-600 font-medium">
                        Dica: R$ 200 mensais por frequência escolar + bônus de aprovação/ENEM!
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* GRUPO B: DESPESAS FIXAS E ESSENCIAIS (despesasEssenciais) */}
              <section className="arcade-card rounded-3xl bg-white p-5 space-y-4">
                <div className="flex items-center justify-between border-b-3 border-slate-900 pb-2.5">
                  <div>
                    <h2 className="font-display font-black text-base sm:text-lg text-slate-900 uppercase">
                      B) Despesas Fixas e Essenciais
                    </h2>
                    <p className="text-xs text-slate-600 font-medium">
                      Moradia/Contas, Alimentação do Mês e Transporte Diário
                    </p>
                  </div>
                  <span className="font-mono font-black text-sm text-slate-900">
                    {formatarMoeda(totalDespesasEssenciais)}/mês
                  </span>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      label: 'Moradia (Aluguel, Água, Luz, Internet)',
                      variavel: 'gastoMoradia',
                      valor: gastoMoradia,
                      setter: setGastoMoradia,
                      max: Math.round(receitasMensaisTotais * 0.65),
                      cor: 'bg-teal-500',
                      icone: <Home className="w-4 h-4 text-teal-700" />,
                    },
                    {
                      label: 'Alimentação (Supermercado e Feira do Mês)',
                      variavel: 'gastoAlimentacao',
                      valor: gastoAlimentacao,
                      setter: setGastoAlimentacao,
                      max: Math.round(receitasMensaisTotais * 0.6),
                      cor: 'bg-sky-500',
                      icone: <ShoppingCart className="w-4 h-4 text-sky-700" />,
                    },
                    {
                      label: 'Transporte (Ônibus, Combustível, App Noturno)',
                      variavel: 'gastoTransporte',
                      valor: gastoTransporte,
                      setter: setGastoTransporte,
                      max: Math.round(receitasMensaisTotais * 0.4),
                      cor: 'bg-amber-500',
                      icone: <Car className="w-4 h-4 text-amber-700" />,
                    },
                  ].map((item) => {
                    const pct =
                      item.max > 0 ? Math.min(100, (item.valor / item.max) * 100) : 0;
                    return (
                      <div
                        key={item.variavel}
                        className="p-3 rounded-2xl bg-slate-50 border-2 border-slate-900 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-2 font-display font-black text-xs sm:text-sm text-slate-900">
                            {item.icone}
                            <span>{item.label}</span>
                          </span>
                          <span className="font-mono font-black text-sm text-slate-900 tabular-nums">
                            {formatarMoeda(item.valor)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              tocarSomArcade('clique');
                              item.setter(Math.max(0, item.valor - 30));
                            }}
                            className="w-7 h-7 rounded-lg bg-rose-200 border-2 border-slate-900 flex items-center justify-center cursor-pointer shrink-0"
                            aria-label={`Diminuir ${item.label}`}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>

                          <div className="flex-1 h-4 bg-slate-200 rounded-lg border-2 border-slate-900 overflow-hidden relative">
                            <div
                              className={`h-full ${item.cor} transition-all duration-150`}
                              style={{ width: `${pct}%` }}
                            />
                            <input
                              type="range"
                              min={0}
                              max={item.max}
                              step={20}
                              value={item.valor}
                              onChange={(e) => {
                                tocarSomArcade('clique');
                                item.setter(Number(e.target.value));
                              }}
                              aria-label={item.label}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              tocarSomArcade('clique');
                              item.setter(item.valor + 30);
                            }}
                            className="w-7 h-7 rounded-lg bg-emerald-200 border-2 border-slate-900 flex items-center justify-center cursor-pointer shrink-0"
                            aria-label={`Aumentar ${item.label}`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* GRUPO C: DESPESAS VARIÁVEIS PLANEJADAS E ESTILO DE VIDA (despesasEstiloVida) */}
              <section className="arcade-card rounded-3xl bg-white p-5 space-y-4">
                <div className="flex items-center justify-between border-b-3 border-slate-900 pb-2.5">
                  <div>
                    <h2 className="font-display font-black text-base sm:text-lg text-slate-900 uppercase">
                      C) Despesas Variáveis e Estilo de Vida
                    </h2>
                    <p className="text-xs text-slate-600 font-medium">
                      Roupas, Viagens/Passeios, Cuidados Pessoais (Pink Tax / Barbearia) e Outros
                    </p>
                  </div>
                  <span className="font-mono font-black text-sm text-slate-900">
                    {formatarMoeda(totalDespesasEstiloVida)}/mês
                  </span>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      label: 'Roupas, Calçados e Acessórios (gastoRoupas)',
                      variavel: 'gastoRoupas',
                      valor: gastoRoupas,
                      setter: setGastoRoupas,
                      max: Math.round(receitasMensaisTotais * 0.35),
                      cor: 'bg-pink-500',
                      icone: <Shirt className="w-4 h-4 text-pink-600" />,
                    },
                    {
                      label: 'Viagens, Passeios e Lazer de Fim de Semana (gastoViagens)',
                      variavel: 'gastoViagens',
                      valor: gastoViagens,
                      setter: setGastoViagens,
                      max: Math.round(receitasMensaisTotais * 0.35),
                      cor: 'bg-purple-500',
                      icone: <Plane className="w-4 h-4 text-purple-600" />,
                    },
                    {
                      label:
                        modoJogo === 'individual' && generoPersonagem === 'mulher'
                          ? 'Cuidados Pessoais: Higiene, Salão, Skincare / Pink Tax'
                          : modoJogo === 'individual' && generoPersonagem === 'homem'
                          ? 'Cuidados Pessoais: Barbearia, Higiene e Suplementos'
                          : 'Cuidados Pessoais: Higiene, Farmácia e Salão/Barbearia',
                      variavel: 'gastoCuidadosPessoais',
                      valor: gastoCuidadosPessoais,
                      setter: setGastoCuidadosPessoais,
                      max: Math.round(receitasMensaisTotais * 0.35),
                      cor: 'bg-rose-500',
                      icone: <Scissors className="w-4 h-4 text-rose-600" />,
                    },
                  ].map((item) => {
                    const pct =
                      item.max > 0 ? Math.min(100, (item.valor / item.max) * 100) : 0;
                    return (
                      <div
                        key={item.variavel}
                        className="p-3 rounded-2xl bg-slate-50 border-2 border-slate-900 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-2 font-display font-black text-xs sm:text-sm text-slate-900">
                            {item.icone}
                            <span>{item.label}</span>
                          </span>
                          <span className="font-mono font-black text-sm text-slate-900 tabular-nums">
                            {formatarMoeda(item.valor)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              tocarSomArcade('clique');
                              item.setter(Math.max(0, item.valor - 20));
                            }}
                            className="w-7 h-7 rounded-lg bg-rose-200 border-2 border-slate-900 flex items-center justify-center cursor-pointer shrink-0"
                            aria-label={`Diminuir ${item.label}`}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>

                          <div className="flex-1 h-4 bg-slate-200 rounded-lg border-2 border-slate-900 overflow-hidden relative">
                            <div
                              className={`h-full ${item.cor} transition-all duration-150`}
                              style={{ width: `${pct}%` }}
                            />
                            <input
                              type="range"
                              min={0}
                              max={item.max}
                              step={15}
                              value={item.valor}
                              onChange={(e) => {
                                tocarSomArcade('clique');
                                item.setter(Number(e.target.value));
                              }}
                              aria-label={item.label}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              tocarSomArcade('clique');
                              item.setter(item.valor + 20);
                            }}
                            className="w-7 h-7 rounded-lg bg-emerald-200 border-2 border-slate-900 flex items-center justify-center cursor-pointer shrink-0"
                            aria-label={`Aumentar ${item.label}`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Campo Outros / Etc com Nome Personalizado e Valor */}
                  <div className="p-3.5 rounded-2xl bg-indigo-50/70 border-2 border-slate-900 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 font-display font-black text-xs sm:text-sm text-slate-900">
                        <FilePlus2 className="w-4 h-4 text-indigo-700" />
                        <span>Outros Gastos / Etc (Personalizável)</span>
                      </span>
                      <span className="font-mono font-black text-sm text-indigo-900 tabular-nums">
                        {formatarMoeda(outrosGastos)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                      <div className="sm:col-span-8">
                        <input
                          type="text"
                          placeholder="Digite o nome do gasto extra (ex: Curso, Pet, Streaming)"
                          value={nomeOutrosGastos}
                          onChange={(e) => setNomeOutrosGastos(e.target.value)}
                          aria-label="Nome do gasto personalizado"
                          className="w-full px-3 py-1.5 rounded-xl border-2 border-slate-900 bg-white text-xs sm:text-sm font-semibold"
                        />
                      </div>
                      <div className="sm:col-span-4 flex items-center gap-1.5">
                        <span className="text-xs font-mono font-bold text-slate-600">R$</span>
                        <input
                          type="number"
                          min={0}
                          max={5000}
                          step={15}
                          value={outrosGastos}
                          onChange={(e) =>
                            setOutrosGastos(Math.max(0, Number(e.target.value) || 0))
                          }
                          aria-label="Valor de Outros Gastos"
                          className="w-full px-2.5 py-1.5 rounded-xl border-2 border-slate-900 bg-white font-mono font-black text-sm text-right tabular-nums"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* GRUPO D: POUPANÇA (metaReserva) + BOTÃO START */}
              <section className="arcade-card rounded-3xl bg-white p-5 space-y-4">
                <div className="p-3.5 rounded-2xl bg-emerald-50 border-3 border-slate-900 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 font-display font-black text-xs sm:text-sm text-emerald-950">
                      <PiggyBank className="w-4 h-4 text-emerald-700" />
                      <span>D) Poupança: Meta de Reserva de Emergência Mensal (metaReserva)</span>
                    </span>
                    <span className="font-mono font-black text-sm sm:text-base text-emerald-800 tabular-nums">
                      {formatarMoeda(metaReserva)}/mês
                    </span>
                  </div>

                  <input
                    type="range"
                    min={0}
                    max={Math.round(receitasMensaisTotais * 0.35)}
                    step={20}
                    value={metaReserva}
                    onChange={(e) => {
                      tocarSomArcade('clique');
                      setMetaReserva(Number(e.target.value));
                    }}
                    aria-label="Meta de Reserva de Emergência Mensal"
                    className="w-full accent-emerald-600 cursor-pointer h-2.5 bg-white rounded-lg border border-slate-900"
                  />
                </div>

                {/* Termômetro Final e Botão Iniciar */}
                <div
                  className={`p-4 rounded-2xl border-3 border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 ${
                    percentualComprometidoFixosEVida > 80 || moedasLivresParaImprevistos < 0
                      ? 'bg-rose-500 text-white'
                      : percentualComprometidoFixosEVida > 68
                      ? 'bg-amber-300 text-slate-950'
                      : 'bg-emerald-300 text-slate-950'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {percentualComprometidoFixosEVida > 80 || moedasLivresParaImprevistos < 0 ? (
                      <AlertTriangle className="w-8 h-8 shrink-0 animate-bounce" />
                    ) : (
                      <ShieldCheck className="w-8 h-8 shrink-0" />
                    )}
                    <div>
                      <div className="font-display font-black text-sm sm:text-base uppercase">
                        {percentualComprometidoFixosEVida > 80 || moedasLivresParaImprevistos < 0
                          ? '⚠ PERIGO DE DÍVIDA! ORÇAMENTO ACIMA DO LIMITE!'
                          : `Gastos Planejados: ${percentualComprometidoFixosEVida}% da Renda Total`}
                      </div>
                      <p className="text-xs font-semibold opacity-95">
                        Moedas livres por mês para imprevistos:{' '}
                        <span className="font-mono font-black underline">
                          {formatarMoeda(moedasLivresParaImprevistos)}
                        </span>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={apertarStartJogo}
                    className="arcade-btn px-6 py-3.5 rounded-xl bg-slate-900 text-amber-300 font-display font-black text-sm uppercase tracking-wider cursor-pointer whitespace-nowrap shrink-0"
                  >
                    INICIAR JOGO ►
                  </button>
                </div>
              </section>
            </div>
          </div>
        </main>
      )}

      {/* =====================================================================
          TELA 2: GAMEPLAY PRINCIPAL (6 MESES / 6 FASES NO PALCO 2D)
         ===================================================================== */}
      {telaJogo === 'gameplay' && eventoAtualNPC && faseEmAndamento && (
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-5 space-y-5">
          {/* HUD SUPERIOR DE VIDEOGAME ARCADE */}
          <section className="arcade-card rounded-3xl bg-slate-900 text-white p-4 sm:p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 items-center">
              {/* 1. Fase Atual */}
              <div className="p-3 rounded-2xl bg-indigo-950 border-3 border-indigo-400">
                <div className="text-[11px] font-mono font-bold text-indigo-300 uppercase">
                  EVENTO {indiceTurnoNoMes + 1} DE 2 NO MÊS
                </div>
                <div className="font-display font-black text-base sm:text-lg text-amber-300 tracking-wide">
                  {NOMES_FASES_MESES[mesAtual - 1]}
                </div>
                <div className="flex gap-1.5 mt-1.5">
                  {[1, 2, 3, 4, 5, 6].map((m) => (
                    <div
                      key={m}
                      className={`h-2 flex-1 rounded-sm border border-slate-950 ${
                        m < mesAtual
                          ? 'bg-emerald-400'
                          : m === mesAtual
                          ? 'bg-amber-400 animate-pulse'
                          : 'bg-slate-700'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* 2. Contador Gigante de Moedas + Fontes de Renda */}
              <div
                className={`p-3 rounded-2xl border-3 ${
                  saldoAtual >= 0
                    ? 'bg-emerald-950 border-emerald-400'
                    : 'bg-rose-950 border-rose-500 animate-pulse'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-mono font-bold">
                  <span className={saldoAtual >= 0 ? 'text-emerald-300' : 'text-rose-300'}>
                    MOEDAS NA CONTA
                  </span>
                  <Coins className="w-4 h-4 text-amber-300" />
                </div>
                <div
                  className={`font-mono font-black text-xl sm:text-2xl tabular-nums ${
                    saldoAtual >= 0 ? 'text-emerald-300' : 'text-rose-400'
                  }`}
                >
                  {formatarMoeda(saldoAtual)}
                </div>
                <div className="text-[10px] font-mono text-slate-300 truncate">
                  {saldoAtual < 0
                    ? '🚨 CHEQUE ESPECIAL (8% JUROS/MÊS)'
                    : modoJogo === 'individual'
                    ? `Salário R$${salarioMensal} + Pé-de-Meia R$${peDeMeiaEfetivo}`
                    : `Salário R$${salarioMensal} + Bolsa Fam. R$${bolsaFamiliaEfetivo}`}
                </div>
              </div>

              {/* 3. Cofre de Reserva de Emergência */}
              <div className="p-3 rounded-2xl bg-sky-950 border-3 border-sky-400">
                <div className="flex items-center justify-between text-[11px] font-mono font-bold text-sky-300">
                  <span>COFRE DE RESERVA</span>
                  <PiggyBank className="w-4 h-4 text-sky-300" />
                </div>
                <div className="font-mono font-black text-xl sm:text-2xl text-white tabular-nums">
                  {formatarMoeda(reservaEmergencia)}
                </div>
                <div className="text-[10px] font-mono text-sky-200">
                  Fatura Cartão no Mês: -{formatarMoeda(faseEmAndamento.parcelasCartaoAnteriores)}
                </div>
              </div>

              {/* 4. Barra de Vida / HP */}
              <div className="p-3 rounded-2xl bg-purple-950 border-3 border-rose-400">
                <div className="flex items-center justify-between text-[11px] font-mono font-bold text-rose-300">
                  <span>VIDA / BEM-ESTAR (HP)</span>
                  <span className="font-mono font-black text-white">{felicidadeFamilia}/100</span>
                </div>
                <div className="flex items-center gap-1 my-1">
                  {[20, 40, 60, 80, 100].map((limite) => (
                    <Heart
                      key={limite}
                      className={`w-5 h-5 transition-transform ${
                        felicidadeFamilia >= limite
                          ? 'fill-rose-500 text-rose-400 scale-105'
                          : felicidadeFamilia >= limite - 10
                          ? 'fill-rose-500/50 text-rose-400'
                          : 'text-slate-600'
                      }`}
                    />
                  ))}
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-950">
                  <div
                    className={`h-full transition-all duration-300 ${
                      felicidadeFamilia >= 65
                        ? 'bg-emerald-400'
                        : felicidadeFamilia >= 40
                        ? 'bg-amber-400'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${felicidadeFamilia}%` }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* PALCO VISUAL 2D DA SALA DE ESTAR (RENDERIZA FAMÍLIA, FAMÍLIA GRANDE OU JOVEM SOLO H/M) */}
          <PalcoSalaFamilia
            modoJogo={modoJogo}
            generoPersonagem={generoPersonagem}
            humor={humorFamiliaAtual}
            saldoAtual={saldoAtual}
            felicidadeFamilia={felicidadeFamilia}
            mesNome={NOMES_FASES_MESES[mesAtual - 1]}
            npcAtivo={
              decisaoDoTurno
                ? null
                : {
                    nome: eventoAtualNPC.nomeNPC,
                    cargo: eventoAtualNPC.cargoNPC,
                    tipo: eventoAtualNPC.tipoNPC,
                    fala: eventoAtualNPC.falaNPC,
                    tituloEvento: eventoAtualNPC.titulo,
                    categoria: eventoAtualNPC.categoria,
                  }
            }
            falaFamilia={decisaoDoTurno ? falaFamiliaPalco : undefined}
            jurosCobradosNoMes={faseEmAndamento.jurosChequeEspecial}
            particulas={particulasFlutuantes}
          />

          {/* 3 CARTAS DE AÇÃO ARCADE */}
          {!decisaoDoTurno ? (
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {eventoAtualNPC.cartas.map((carta, index) => {
                const coresTopo =
                  index === 0
                    ? 'bg-emerald-400 text-slate-950'
                    : index === 1
                    ? 'bg-amber-300 text-slate-950'
                    : 'bg-rose-400 text-white';

                return (
                  <button
                    key={carta.codigo}
                    type="button"
                    onClick={() => processarDecisao(carta)}
                    className="arcade-btn rounded-3xl bg-white overflow-hidden flex flex-col justify-between text-left cursor-pointer group"
                  >
                    <div>
                      <div
                        className={`px-4 py-2 border-b-3 border-slate-900 font-mono text-xs font-black uppercase flex items-center justify-between ${coresTopo}`}
                      >
                        <span>{carta.rotuloAcao}</span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-900 text-white text-[10px]">
                          [{carta.codigo}]
                        </span>
                      </div>

                      <div className="p-4 space-y-2">
                        <h3 className="font-display font-black text-base sm:text-lg text-slate-900 group-hover:text-indigo-700 transition-colors">
                          {carta.titulo}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                          {carta.descricao}
                        </p>
                      </div>
                    </div>

                    <div className="p-3.5 bg-slate-100 border-t-3 border-slate-900 space-y-1 font-mono text-xs font-bold">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">MOEDAS AGORA:</span>
                        <span
                          className={
                            carta.impactoMoedas > 0
                              ? 'text-emerald-700 font-black'
                              : carta.impactoMoedas === 0
                              ? 'text-slate-800'
                              : 'text-rose-600 font-black'
                          }
                        >
                          {carta.impactoMoedas > 0
                            ? `+${formatarMoeda(carta.impactoMoedas)}`
                            : carta.impactoMoedas === 0
                            ? 'R$ 0'
                            : formatarMoeda(carta.impactoMoedas)}
                          {carta.usaCofreReserva && reservaEmergencia > 0 ? ' (Usa Cofre!)' : ''}
                        </span>
                      </div>

                      {carta.parcelaCartaoFutura > 0 && (
                        <div className="flex items-center justify-between text-amber-800">
                          <span>CARTÃO FUTURO:</span>
                          <span className="font-black">
                            {carta.mesesParcela}x de {formatarMoeda(carta.parcelaCartaoFutura)}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">CORAÇÕES (HP):</span>
                        <span
                          className={
                            carta.impactoCoracoes >= 0 ? 'text-emerald-700' : 'text-rose-600'
                          }
                        >
                          {carta.impactoCoracoes > 0
                            ? `+${carta.impactoCoracoes} HP`
                            : `${carta.impactoCoracoes} HP`}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </section>
          ) : (
            <section className="arcade-card rounded-3xl bg-amber-300 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-lg bg-slate-900 text-amber-300 font-mono text-xs font-black uppercase">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>LIÇÃO DO TURNO · ESCOLHA [{decisaoDoTurno.acaoEscolhida}]</span>
                </div>
                <h3 className="font-display font-black text-lg sm:text-xl text-slate-950">
                  {decisaoDoTurno.tituloAcao}
                </h3>
                <p className="text-xs sm:text-sm font-bold text-slate-900 max-w-2xl">
                  {decisaoDoTurno.explicacaoMestre}
                </p>
                {decisaoDoTurno.usouReserva > 0 && (
                  <p className="text-xs font-mono font-black text-emerald-900">
                    ★ SEU COFRE DE RESERVA COBRIU {formatarMoeda(decisaoDoTurno.usouReserva)} DESTE
                    IMPREVISTO!
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={avancarProximoTurno}
                className="arcade-btn px-7 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-black text-base sm:text-lg uppercase flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>
                  {indiceTurnoNoMes === 0
                    ? 'PRÓXIMO VISITANTE (2/2)'
                    : mesAtual < 6
                    ? `IR PARA FASE ${mesAtual + 1}/6`
                    : 'VER TELA DE ZERAMENTO!'}
                </span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </section>
          )}
        </main>
      )}

      {/* =====================================================================
          TELA 3: ZERAMENTO / HIGH SCORE + PAINEL PEDAGÓGICO E PLANILHA
         ===================================================================== */}
      {telaJogo === 'zeramento' && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6">
          {/* BANNER DE TROFÉU / RANK FINAL ARCADE */}
          <section
            className={`arcade-card rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 ${relatorioFinal.ranking.corBg}`}
          >
            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
              <div className="w-24 h-24 rounded-3xl bg-slate-900 text-amber-300 border-4 border-white flex items-center justify-center shrink-0 animate-bounce shadow-[4px_4px_0px_0px_#0f172a]">
                {relatorioFinal.ranking.icone === 'trofeu' ? (
                  <Trophy className="w-12 h-12 text-yellow-300" />
                ) : relatorioFinal.ranking.icone === 'caveira' ? (
                  <Skull className="w-12 h-12 text-rose-400" />
                ) : (
                  <Award className="w-12 h-12 text-amber-300" />
                )}
              </div>

              <div className="space-y-1.5">
                <div className="inline-block px-3 py-0.5 rounded-lg bg-slate-900 text-amber-300 font-mono text-xs font-black">
                  FIM DAS 6 FASES · {relatorioFinal.ranking.rank} · {presetAtivo.titulo}
                </div>
                <h1 className="text-2xl sm:text-4xl font-display font-black tracking-tight">
                  {relatorioFinal.ranking.titulo}
                </h1>
                <p className="text-sm sm:text-base font-bold opacity-90 max-w-2xl">
                  {relatorioFinal.ranking.subtitulo}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0 no-print">
              <button
                type="button"
                onClick={exportarPlanilhaCSV}
                className="arcade-btn px-4 py-3 rounded-2xl bg-white text-slate-900 font-display font-black text-xs sm:text-sm flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>EXPORTAR CSV</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="arcade-btn px-4 py-3 rounded-2xl bg-white text-slate-900 font-display font-black text-xs sm:text-sm flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>IMPRIMIR</span>
              </button>

              <button
                type="button"
                onClick={reiniciarFliperama}
                className="arcade-btn px-6 py-3 rounded-2xl bg-slate-900 text-amber-300 font-display font-black text-sm sm:text-base flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-5 h-5" />
                <span>JOGAR NOVAMENTE (INSERT COIN)</span>
              </button>
            </div>
          </section>

          {/* 4 CARDS DE SCORE DA PARTIDA */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="arcade-card-sm rounded-2xl bg-white p-4">
              <div className="text-xs font-mono font-bold text-slate-500">
                PATRIMÔNIO LÍQUIDO FINAL
              </div>
              <div
                className={`text-2xl font-mono font-black tabular-nums mt-1 ${
                  relatorioFinal.patrimonioFinal >= 0 ? 'text-emerald-700' : 'text-rose-600'
                }`}
              >
                {formatarMoeda(relatorioFinal.patrimonioFinal)}
              </div>
              <div className="text-xs text-slate-600 font-semibold mt-1">
                Conta: {formatarMoeda(saldoAtual)} · Cofre: {formatarMoeda(reservaEmergencia)}
              </div>
            </div>

            <div className="arcade-card-sm rounded-2xl bg-white p-4">
              <div className="text-xs font-mono font-bold text-slate-500">
                RENDA TOTAL ACUMULADA (6 MESES)
              </div>
              <div className="text-2xl font-mono font-black text-slate-900 tabular-nums mt-1">
                {formatarMoeda(relatorioFinal.rendaTotal6Meses)}
              </div>
              <div className="text-xs text-slate-600 font-semibold mt-1">
                {modoJogo === 'individual'
                  ? 'Salário + Pé-de-Meia + Extras'
                  : 'Salário + Bolsa Família + Extras'}
              </div>
            </div>

            <div className="arcade-card-sm rounded-2xl bg-white p-4">
              <div className="text-xs font-mono font-bold text-slate-500">
                MOEDAS COMIDAS PELOS JUROS
              </div>
              <div
                className={`text-2xl font-mono font-black tabular-nums mt-1 ${
                  totalJurosPagos > 0 ? 'text-rose-600' : 'text-emerald-700'
                }`}
              >
                {formatarMoeda(totalJurosPagos)}
              </div>
              <div className="text-xs text-slate-600 font-semibold mt-1">
                {dividaCartaoResidual > 0
                  ? `+ ${formatarMoeda(dividaCartaoResidual)} em parcelas futuras`
                  : 'Zero dívidas pendentes!'}
              </div>
            </div>

            <div className="arcade-card-sm rounded-2xl bg-white p-4">
              <div className="text-xs font-mono font-bold text-slate-500">
                BEM-ESTAR / FELICIDADE FINAL
              </div>
              <div className="text-2xl font-mono font-black text-rose-600 tabular-nums mt-1">
                {felicidadeFamilia}% HP
              </div>
              <div className="text-xs text-slate-600 font-semibold mt-1">
                {felicidadeFamilia >= 70 ? 'Bem-estar preservado!' : 'Atenção ao cansaço'}
              </div>
            </div>
          </section>

          {/* GRÁFICOS VISUAIS RECHARTS ATUALIZADOS COM TODAS AS NOVAS CATEGORIAS */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 arcade-card rounded-3xl bg-white p-5 flex flex-col justify-between">
              <div>
                <h2 className="font-display font-black text-lg text-slate-900 uppercase">
                  Para Onde Foi o Dinheiro? (6 Meses)
                </h2>
                <p className="text-xs text-slate-600 font-medium">
                  Alimentação, Moradia, Transporte, Roupas, Viagens, Cuidados Pessoais, Outros e
                  Juros
                </p>
              </div>

              <div className="h-76 w-full mt-3">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={relatorioFinal.dadosPizza}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={86}
                      paddingAngle={2}
                    >
                      {relatorioFinal.dadosPizza.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.cor}
                          stroke="#0f172a"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(valor) => formatarMoeda(Number(valor ?? 0))}
                    />
                    <Legend verticalAlign="bottom" height={48} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-7 arcade-card rounded-3xl bg-white p-5 flex flex-col justify-between">
              <div>
                <h2 className="font-display font-black text-lg text-slate-900 uppercase">
                  Evolução do Saldo e Cofre Mês a Mês
                </h2>
                <p className="text-xs text-slate-600 font-medium">
                  Acompanhe o desempenho da Fase 1 (Janeiro) até a Fase 6 (Junho)
                </p>
              </div>

              <div className="h-76 w-full mt-3">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={relatorioFinal.dadosBarras}
                    margin={{ top: 10, right: 15, left: 5, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                    <XAxis dataKey="mes" tick={{ fontSize: 12, fontWeight: 700 }} />
                    <YAxis tick={{ fontSize: 12, fontWeight: 700 }} />
                    <RechartsTooltip
                      formatter={(valor, nome) => [
                        formatarMoeda(Number(valor ?? 0)),
                        String(nome ?? ''),
                      ]}
                    />
                    <Legend />
                    <ReferenceLine y={0} stroke="#0f172a" strokeWidth={2} />
                    <Bar
                      dataKey="SaldoFinal"
                      name="Saldo em Conta"
                      fill="#10b981"
                      stroke="#0f172a"
                      strokeWidth={2}
                      radius={[6, 6, 0, 0]}
                    />
                    <Bar
                      dataKey="CofreReserva"
                      name="Cofre de Reserva"
                      fill="#0284c7"
                      stroke="#0f172a"
                      strokeWidth={2}
                      radius={[6, 6, 0, 0]}
                    />
                    <Bar
                      dataKey="JurosPagos"
                      name="Juros Pagos"
                      fill="#ef4444"
                      stroke="#0f172a"
                      strokeWidth={2}
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* PLANILHA DOMÉSTICA CONSOLIDADA DETALHANDO RENDA E CATEGORIAS */}
          <section className="arcade-card rounded-3xl bg-white p-5 sm:p-6 space-y-4 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-display font-black text-lg sm:text-xl text-slate-900 uppercase">
                  Log da Partida (Planilha de Orçamento Doméstico Consolidada)
                </h2>
                <p className="text-xs text-slate-600 font-medium">
                  Detalhando Renda Total (Salário +{' '}
                  {modoJogo === 'individual' ? 'Pé-de-Meia' : 'Bolsa Família'} + Extras),
                  Alimentação, Roupas, Viagens, Cuidados e Eventos
                </p>
              </div>
            </div>

            <div className="overflow-x-auto -mx-5 px-5">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-900 text-amber-300 font-mono uppercase text-[11px]">
                    <th className="py-3 px-2.5">Mês</th>
                    <th className="py-3 px-2.5 text-right">
                      Renda ({modoJogo === 'individual' ? 'Sal.+Pé-de-Meia' : 'Sal.+Bolsa Fam.'})
                    </th>
                    <th className="py-3 px-2.5 text-right">Alimentação</th>
                    <th className="py-3 px-2.5 text-right">Moradia & Transp.</th>
                    <th className="py-3 px-2.5 text-right">Roupas & Viagens</th>
                    <th className="py-3 px-2.5 text-right">Cuidados & Outros</th>
                    <th className="py-3 px-2.5 text-right">Eventos & Cartão</th>
                    <th className="py-3 px-2.5 text-right">Juros (8%)</th>
                    <th className="py-3 px-2.5 text-right">Saldo Final</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-200 font-mono font-bold tabular-nums text-xs">
                  {historicoMensal.map((m) => (
                    <tr key={m.mes} className="hover:bg-amber-50/70">
                      <td className="py-3 px-2.5 font-sans font-black text-slate-900">
                        <div>{m.nomeMes}</div>
                        <div className="text-[10px] font-normal text-slate-500">
                          {m.decisoes.map((d) => `[${d.acaoEscolhida}] ${d.eventoTitulo}`).join(' · ')}
                        </div>
                      </td>
                      <td className="py-3 px-2.5 text-right text-emerald-700">
                        +{formatarMoeda(m.rendaTotalMes + m.rendaExtraEventos)}
                      </td>
                      <td className="py-3 px-2.5 text-right text-slate-700">
                        -{formatarMoeda(m.gastoAlimentacaoMes)}
                      </td>
                      <td className="py-3 px-2.5 text-right text-slate-700">
                        -{formatarMoeda(m.gastoMoradiaMes + m.gastoTransporteMes)}
                      </td>
                      <td className="py-3 px-2.5 text-right text-purple-700">
                        -{formatarMoeda(m.gastoRoupasMes + m.gastoViagensMes)}
                      </td>
                      <td className="py-3 px-2.5 text-right text-pink-700">
                        -{formatarMoeda(m.gastoCuidadosMes + m.gastoOutrosMes)}
                      </td>
                      <td className="py-3 px-2.5 text-right text-amber-700">
                        -{formatarMoeda(m.gastosEventosDireto + m.parcelasCartaoAnteriores)}
                      </td>
                      <td
                        className={`py-3 px-2.5 text-right ${
                          m.jurosChequeEspecial > 0 ? 'text-rose-600 font-black' : 'text-slate-400'
                        }`}
                      >
                        {m.jurosChequeEspecial > 0
                          ? `-${formatarMoeda(m.jurosChequeEspecial)}`
                          : 'R$ 0'}
                      </td>
                      <td
                        className={`py-3 px-2.5 text-right font-black ${
                          m.saldoFinal >= 0 ? 'text-emerald-700' : 'text-rose-600'
                        }`}
                      >
                        {formatarMoeda(m.saldoFinal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* CONSELHOS DO MESTRE FINANCEIRO + 6 CARDS ILUSTRADOS */}
          <section className="arcade-card rounded-3xl bg-indigo-950 text-white p-6 space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b-2 border-indigo-800 pb-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 text-xs font-mono font-extrabold text-amber-300 uppercase">
                  <BookOpen className="w-4 h-4" />
                  <span>DIAGNÓSTICO PERSONALIZADO DA SUA PARTIDA</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-display font-black text-white">
                  CONSELHOS DO MESTRE FINANCEIRO
                </h2>
              </div>

              <div className="px-4 py-2 rounded-2xl bg-indigo-900 border-2 border-indigo-400 text-xs font-mono">
                Armadilhas escolhidas na partida:{' '}
                <strong className="text-amber-300">
                  {relatorioFinal.armadilhasEscolhidas.length} de 12 decisões
                </strong>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-indigo-900/90 border-2 border-indigo-400 space-y-1.5">
                <h3 className="font-display font-black text-amber-300 text-base">
                  1. Análise de Juros, Cartão e Estilo de Vida
                </h3>
                {totalJurosPagos > 0 || dividaCartaoResidual > 0 ? (
                  <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed">
                    Cuidado! Vocês perderam{' '}
                    <strong className="text-rose-300">{formatarMoeda(totalJurosPagos)}</strong> para
                    o Monstro dos Juros (8% a.m.) e acumularam{' '}
                    <strong className="text-amber-300">
                      {formatarMoeda(relatorioFinal.totalDesperdicadoArmadilhas)}
                    </strong>{' '}
                    em escolhas de impulso em roupas, viagens ou parcelamentos. Quando parcelamos
                    várias compras ao mesmo tempo, o salário do mês seguinte desaparece!
                  </p>
                ) : (
                  <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed">
                    Jogada de Mestre! Vocês passaram os 6 meses com{' '}
                    <strong className="text-emerald-300">R$ 0 de juros pagos</strong> ao banco e sem
                    estourar o cartão!
                  </p>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-indigo-900/90 border-2 border-indigo-400 space-y-1.5">
                <h3 className="font-display font-black text-emerald-300 text-base">
                  2. Lição do Perfil Jogado ({presetAtivo.titulo})
                </h3>
                <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed">
                  {presetAtivo.dicaEducativa}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {[
                {
                  num: '01',
                  icone: '🛡️',
                  titulo: 'Pague-se Primeiro (Cofre)',
                  texto:
                    'Guarde a Reserva de Emergência no dia em que a renda cai. Nunca espere "sobrar" no fim do mês.',
                },
                {
                  num: '02',
                  icone: '🔍',
                  titulo: 'Atenção à Pink Tax e Rótulos',
                  texto:
                    'Compare o preço por volume e o princípio ativo em itens de higiene e farmácia para não pagar mais caro só pela embalagem.',
                },
                {
                  num: '03',
                  icone: '🎓',
                  titulo: 'Proteja Benefícios e Incentivos',
                  texto:
                    'No Jovem Solo, mantenha mais de 80% de presença para receber o Pé-de-Meia; na Família, mantenha o CadÚnico em dia para o Bolsa Família.',
                },
                {
                  num: '04',
                  icone: '✈️',
                  titulo: 'Viagens e Roupas à Vista',
                  texto:
                    'Planeje passeios e compras de vestuário com antecedência para negociar descontos no PIX sem criar parcelas longas.',
                },
                {
                  num: '05',
                  icone: '🥦',
                  titulo: 'Feira da Estação e Marmitas',
                  texto:
                    'Vá ao mercado com lista fechada e deixe refeições prontas no freezer para vencer a tentação do delivery.',
                },
                {
                  num: '06',
                  icone: '🔧',
                  titulo: 'Manutenção Não Se Adia',
                  texto:
                    'Consertar um vazamento, freio ou dor de dente no início custa 3x menos do que esperar agravar.',
                },
              ].map((card) => (
                <div
                  key={card.num}
                  className="p-4 rounded-2xl bg-white text-slate-900 border-3 border-slate-950 shadow-[4px_4px_0px_0px_#0f172a] space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{card.icone}</span>
                    <span className="px-2 py-0.5 rounded bg-amber-300 border border-slate-900 font-mono text-xs font-black">
                      PODER #{card.num}
                    </span>
                  </div>
                  <h3 className="font-display font-black text-base text-slate-900">
                    {card.titulo}
                  </h3>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">{card.texto}</p>
                </div>
              ))}
            </div>
          </section>
        </main>
      )}

      {/* RODAPÉ ARCADE */}
      <footer className="bg-slate-900 text-slate-400 border-t-4 border-slate-950 py-3 px-4 sm:px-8 text-xs font-mono no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>SOBREVIVÊNCIA FINANCEIRA: O SALÁRIO SUMIU! · ARCADE LIFE-SIM 2D</span>
          <span>USE O MOUSE OU AS TECLAS [1] [2] [3] E [ENTER] PARA JOGAR</span>
        </div>
      </footer>
    </div>
  );
}
