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
  Music,
  Play,
  Plus,
  Minus,
  RotateCcw,
  Download,
  Printer,
  AlertTriangle,
  ShieldCheck,
  Home,
  ShoppingCart,
  Car,
  Gamepad2,
  ChevronRight,
  ChevronLeft,
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
  HelpCircle,
  X,
  CheckCircle2,
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
// TIPOS E ESTRUTURAS DE DADOS DO JOGO
// ============================================================================

export type TelaJogo = 'selecao' | 'gameplay' | 'zeramento';
export type AbaOrcamento = 'renda' | 'essenciais' | 'estilo_reserva';

export interface ReceitasMensais {
  salarioMensal: number;
  bolsaFamilia: number; // Aplicado somente nos modos Família e Família Grande
  peDeMeia: number; // Aplicado somente no modo Individual (Jovem)
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
  'Mês 1/6 · Janeiro',
  'Mês 2/6 · Fevereiro',
  'Mês 3/6 · Março',
  'Mês 4/6 · Abril',
  'Mês 5/6 · Maio',
  'Mês 6/6 · Junho',
];

const NOMES_CURTOS_MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho'];

const PASSOS_TUTORIAL = [
  {
    numero: 'Passo 1 de 4',
    titulo: 'Escolha quem mora na casa',
    resumo:
      'Na coluna da esquerda, selecione se quer jogar com a Família (3 pessoas), no modo Jovem Solo (Mulher ou Homem) ou com a Família Grande (5 pessoas).',
    destaque:
      'O benefício Bolsa Família aparece apenas nos modos familiares, enquanto o incentivo estudantil Pé-de-Meia aparece exclusivamente no modo Jovem Solo.',
  },
  {
    numero: 'Passo 2 de 4',
    titulo: 'Monte o orçamento nas 3 abas rápidas',
    resumo:
      'Na direita, você ajusta a Renda, as Contas Fixas e o Lazer/Reserva sem precisar rolar a página. Os personagens na sala reagem na hora se o orçamento ficar apertado.',
    destaque:
      'Tente deixar pelo menos uma folga no mês e guardar um valor na Reserva de Emergência para não depender do cartão quando surgir um imprevisto.',
  },
  {
    numero: 'Passo 3 de 4',
    titulo: 'Enfrente 2 situações por mês (Janeiro a Junho)',
    resumo:
      'Durante o jogo, a sala fica à esquerda e as 3 opções de decisão aparecem à direita na mesma tela. Você pode clicar na opção desejada ou usar as teclas 1, 2 e 3.',
    destaque:
      'Se você tiver dinheiro guardado na Reserva, ela cobre automaticamente consertos urgentes de casa, saúde e transporte.',
  },
  {
    numero: 'Passo 4 de 4',
    titulo: 'Cuidado com as parcelas e com o cheque especial',
    resumo:
      'Parcelar compras no cartão joga a conta para os meses seguintes. Se o saldo da conta ficar negativo na virada do mês, o banco cobra 8% de juros.',
    destaque:
      'Ao final de junho, você vê o gráfico completo de para onde foi o dinheiro e pode baixar a planilha CSV ou imprimir o relatório.',
  },
];

// ============================================================================
// BANCO DE EVENTOS (TEXTOS NATURAIS E DIRETOS)
// ============================================================================

export const bancoDeEventosNPC: EventoNPC[] = [
  // --- MODO INDIVIDUAL: MULHER ---
  {
    id: 101,
    titulo: 'Compras de farmácia e higiene pessoal',
    categoria: 'Cuidados pessoais',
    grupoGrafico: 'cuidadosPessoais',
    nomeNPC: 'Clara',
    cargoNPC: 'Atendente da farmácia',
    tipoNPC: 'esteticista',
    exclusivoPara: 'individual_mulher',
    falaNPC:
      'Acabaram seus itens básicos de higiene, absorventes, protetor solar e creme de cabelo. Reparou como as versões voltadas ao público feminino costumam custar bem mais caro na prateleira?',
    cartas: [
      {
        codigo: '1',
        rotuloAcao: 'Opção 1',
        titulo: 'Comparar rótulos e levar refil à vista',
        descricao:
          'Ignora as embalagens mais caras, escolhe versões neutras ou refil e paga R$ 130 no PIX.',
        impactoMoedas: -130,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 8,
        tipoEscolha: 'planejada',
        falaReacaoFamilia: 'Olhar os ingredientes e pegar refil fez uma baita diferença no preço.',
        explicacaoMestre:
          'Muitos produtos femininos sofrem a chamada "taxa rosa", custando mais caro pela embalagem. Comparar a fórmula e usar refis protege seu bolso.',
      },
      {
        codigo: '2',
        rotuloAcao: 'Opção 2',
        titulo: 'Comprar só o indispensável da lista',
        descricao: 'Leva apenas o básico de higiene em promoção por R$ 75.',
        impactoMoedas: -75,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 3,
        tipoEscolha: 'economica',
        falaReacaoFamilia: 'Levamos só o que precisava mesmo para este mês.',
        explicacaoMestre:
          'Ir à farmácia com uma lista fechada evita colocar itens extras na cestinha por impulso.',
      },
      {
        codigo: '3',
        rotuloAcao: 'Opção 3',
        titulo: 'Parcelar kit completo de pele e cabelo em 3x',
        descricao: 'Paga R$ 180 hoje e assume mais 2 parcelas de R$ 150 no cartão.',
        impactoMoedas: -180,
        usaCofreReserva: false,
        parcelaCartaoFutura: 150,
        mesesParcela: 2,
        impactoCoracoes: 2,
        tipoEscolha: 'armadilha',
        falaReacaoFamilia: 'Quase quinhentos reais em farmácia... a fatura do mês que vem já ficou pesada.',
        explicacaoMestre:
          'Parcelar cosméticos de uso diário faz a parcela se juntar com a reposição dos próximos meses.',
      },
    ],
  },
  {
    id: 102,
    titulo: 'Manutenção do cabelo e salão',
    categoria: 'Cuidados pessoais',
    grupoGrafico: 'cuidadosPessoais',
    nomeNPC: 'Bia',
    cargoNPC: 'Cabeleireira e trancista',
    tipoNPC: 'esteticista',
    exclusivoPara: 'individual_mulher',
    falaNPC:
      'Chegou a época de fazer a manutenção do cabelo e da sobrancelha para trabalhar e estudar se sentindo bem. Como você prefere fazer neste mês?',
    cartas: [
      {
        codigo: '1',
        rotuloAcao: 'Opção 1',
        titulo: 'Fazer a manutenção agendada à vista',
        descricao: 'Paga R$ 170 no PIX com desconto no salão de confiança.',
        impactoMoedas: -170,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 11,
        tipoEscolha: 'planejada',
        falaReacaoFamilia: 'Cabelo arrumado e tudo pago à vista como estava planejado.',
        explicacaoMestre:
          'Quando o cuidado pessoal já está previsto no orçamento do mês, você se cuida sem gerar dívida.',
      },
      {
        codigo: '2',
        rotuloAcao: 'Opção 2',
        titulo: 'Cuidar em casa com ajuda de uma amiga',
        descricao: 'Compra os produtos por R$ 65 e faz a hidratação e finalização em casa.',
        impactoMoedas: -65,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 7,
        tipoEscolha: 'economica',
        falaReacaoFamilia: 'Deu super certo fazer em casa e sobrou mais de cem reais.',
        explicacaoMestre:
          'Intercalar idas ao salão com cuidados feitos em casa reduz bastante a despesa ao longo do ano.',
      },
      {
        codigo: '3',
        rotuloAcao: 'Opção 3',
        titulo: 'Fazer pacote completo no cartão em 3x',
        descricao: 'Gasta R$ 210 hoje mais 2 parcelas de R$ 175 no crédito.',
        impactoMoedas: -210,
        usaCofreReserva: false,
        parcelaCartaoFutura: 175,
        mesesParcela: 2,
        impactoCoracoes: 4,
        tipoEscolha: 'armadilha',
        falaReacaoFamilia: 'Quando precisar retocar o cabelo de novo, ainda estaremos pagando essas parcelas.',
        explicacaoMestre:
          'Parcelar serviços que precisam de manutenção todo mês acumula uma parcela em cima da outra.',
      },
    ],
  },
  {
    id: 103,
    titulo: 'Volta tarde da aula ou trabalho',
    categoria: 'Transporte e segurança',
    grupoGrafico: 'transporte',
    nomeNPC: 'Ronaldo',
    cargoNPC: 'Motorista de aplicativo',
    tipoNPC: 'mecanico',
    exclusivoPara: 'individual_mulher',
    falaNPC:
      'Já passa das 22h e o ponto de ônibus está vazio. Para voltar em segurança à noite, muita gente prefere pedir carro por aplicativo, mas o preço dinâmico subiu.',
    cartas: [
      {
        codigo: '1',
        rotuloAcao: 'Opção 1',
        titulo: 'Dividir a corrida com colegas do mesmo bairro',
        descricao: 'Volta em segurança até em casa rachando o valor com duas colegas (R$ 110 no mês).',
        impactoMoedas: -110,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 9,
        tipoEscolha: 'planejada',
        falaReacaoFamilia: 'Combinar a volta com as meninas deixou a corrida muito mais em conta.',
        explicacaoMestre:
          'O gasto extra com segurança no transporte noturno pesa no orçamento feminino; dividir rota reduz o custo a um terço.',
      },
      {
        codigo: '2',
        rotuloAcao: 'Opção 2',
        titulo: 'Ir até a estação principal e pedir carro só no trecho final',
        descricao: 'Faz a parte movimentada de transporte público e usa o app só perto de casa (R$ 60).',
        impactoMoedas: -60,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 5,
        tipoEscolha: 'economica',
        falaReacaoFamilia: 'Usar o aplicativo só no trecho final funcionou bem e custou pouco.',
        explicacaoMestre:
          'Combinar transporte público até um ponto seguro com uma corrida curta equilibra proteção e economia.',
      },
      {
        codigo: '3',
        rotuloAcao: 'Opção 3',
        titulo: 'Pedir corrida individual todo dia no cartão',
        descricao: 'Gasta R$ 280 neste mês e acumula mais R$ 180 na fatura do próximo.',
        impactoMoedas: -280,
        usaCofreReserva: false,
        parcelaCartaoFutura: 180,
        mesesParcela: 1,
        impactoCoracoes: -2,
        tipoEscolha: 'armadilha',
        falaReacaoFamilia: 'Somando corrida por corrida, deu quase metade de um aluguel.',
        explicacaoMestre:
          'Corridas diárias na tarifa dinâmica pagas no crédito viram uma bola de neve silenciosa no fim do mês.',
      },
    ],
  },

  // --- MODO INDIVIDUAL: HOMEM ---
  {
    id: 201,
    titulo: 'Barbearia toda semana',
    categoria: 'Cuidados pessoais',
    grupoGrafico: 'cuidadosPessoais',
    nomeNPC: 'Du Corte',
    cargoNPC: 'Barbeiro',
    tipoNPC: 'barbeiro',
    exclusivoPara: 'individual_homem',
    falaNPC:
      'E aí, parceiro! Vai querer fechar o pacote pra cortar toda sexta-feira, alinhar a barba na navalha e levar a pomada modeladora?',
    cartas: [
      {
        codigo: '1',
        rotuloAcao: 'Opção 1',
        titulo: 'Cortar a cada três semanas e aparar a barba em casa',
        descricao: 'Mantém o corte em dia gastando R$ 90 no mês à vista.',
        impactoMoedas: -90,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 8,
        tipoEscolha: 'planejada',
        falaReacaoFamilia: 'Cabelo alinhado e uma boa grana economizada no mês.',
        explicacaoMestre:
          'Espaçar o corte para cada 20 dias e cuidar da barba em casa economiza mais de R$ 1.200 por ano.',
      },
      {
        codigo: '2',
        rotuloAcao: 'Opção 2',
        titulo: 'Comprar uma maquininha simples para manter em casa',
        descricao: 'Gasta R$ 55 numa máquina básica para aparar nas semanas intermediárias.',
        impactoMoedas: -55,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 5,
        tipoEscolha: 'economica',
        falaReacaoFamilia: 'A maquininha já se pagou logo no primeiro mês.',
        explicacaoMestre:
          'Ter equipamento básico em casa reduz bastante a frequência de gastos no salão ou barbearia.',
      },
      {
        codigo: '3',
        rotuloAcao: 'Opção 3',
        titulo: 'Ir toda sexta e levar produtos no cartão',
        descricao: 'Gasta R$ 220 neste mês e joga R$ 140 para a fatura seguinte.',
        impactoMoedas: -220,
        usaCofreReserva: false,
        parcelaCartaoFutura: 140,
        mesesParcela: 1,
        impactoCoracoes: 3,
        tipoEscolha: 'armadilha',
        falaReacaoFamilia: 'Trezentos e sessenta reais só de barbearia e pomada neste mês.',
        explicacaoMestre:
          'Ir toda semana e consumir extras no local transforma um cuidado simples num gasto alto.',
      },
    ],
  },
  {
    id: 202,
    titulo: 'Jogo novo no lançamento e futebol com a turma',
    categoria: 'Lazer e amigos',
    grupoGrafico: 'viagens',
    nomeNPC: 'Juninho',
    cargoNPC: 'Amigo da turma',
    tipoNPC: 'streaming_bot',
    exclusivoPara: 'individual_homem',
    falaNPC:
      'Cara, saiu aquele jogo novo na pré-venda por R$ 350! Também tem o pacote do campeonato de futebol pra gente assinar. Bora pegar tudo hoje?',
    cartas: [
      {
        codigo: '1',
        rotuloAcao: 'Opção 1',
        titulo: 'Esperar promoção e reunir a galera em casa',
        descricao: 'Joga o que já tem na biblioteca e divide os petiscos por R$ 65 à vista.',
        impactoMoedas: -65,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 9,
        tipoEscolha: 'planejada',
        falaReacaoFamilia: 'Nos divertimos a noite inteira gastando muito pouco.',
        explicacaoMestre:
          'Esperar alguns meses após o lançamento costuma derrubar o preço dos jogos pela metade.',
      },
      {
        codigo: '2',
        rotuloAcao: 'Opção 2',
        titulo: 'Dividir assinatura mensal com um amigo',
        descricao: 'Racha o plano de catálogo de jogos por R$ 35 sem comprar lançamento.',
        impactoMoedas: -35,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 7,
        tipoEscolha: 'economica',
        falaReacaoFamilia: 'Vários jogos liberados por trinta e cinco reais.',
        explicacaoMestre:
          'Dividir assinaturas ou usar catálogos mensais evita gastos pesados com compras por impulso.',
      },
      {
        codigo: '3',
        rotuloAcao: 'Opção 3',
        titulo: 'Comprar versão especial e moedas virtuais em 3x',
        descricao: 'Paga R$ 210 agora mais 2 parcelas de R$ 160 no cartão.',
        impactoMoedas: -210,
        usaCofreReserva: false,
        parcelaCartaoFutura: 160,
        mesesParcela: 2,
        impactoCoracoes: 3,
        tipoEscolha: 'armadilha',
        falaReacaoFamilia: 'Mais de quinhentos reais em jogo e itens virtuais...',
        explicacaoMestre:
          'Compras no lançamento somadas a itens dentro do jogo drenam rapidamente a renda de quem está começando.',
      },
    ],
  },
  {
    id: 203,
    titulo: 'Combo de suplementos e academia',
    categoria: 'Saúde e rotina',
    grupoGrafico: 'cuidadosPessoais',
    nomeNPC: 'Rodrigo',
    cargoNPC: 'Vendedor de suplementos',
    tipoNPC: 'vendedor_shopping',
    exclusivoPara: 'individual_homem',
    falaNPC:
      'Para acelerar o resultado no treino, montei um kit com whey importado, pré-treino, creatina e camiseta térmica. Faço tudo em 3x no cartão!',
    cartas: [
      {
        codigo: '1',
        rotuloAcao: 'Opção 1',
        titulo: 'Focar na alimentação do dia a dia e creatina básica',
        descricao: 'Compra ovos, frango, frutas e o básico à vista por R$ 110.',
        impactoMoedas: -110,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 9,
        tipoEscolha: 'planejada',
        falaReacaoFamilia: 'Comida de verdade resolveu super bem sem estourar a conta.',
        explicacaoMestre:
          'Uma boa alimentação natural entrega ótimos resultados por uma fração do preço de suplementos importados.',
      },
      {
        codigo: '2',
        rotuloAcao: 'Opção 2',
        titulo: 'Treinar ao ar livre na praça e manter refeição caseira',
        descricao: 'Usa os equipamentos públicos do parque e gasta R$ 45 reforçando a feira.',
        impactoMoedas: -45,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 7,
        tipoEscolha: 'economica',
        falaReacaoFamilia: 'Treino em dia e sem mensalidade pesando no bolso.',
        explicacaoMestre:
          'Atividades ao ar livre mantêm a saúde em dia quando o orçamento está curto.',
      },
      {
        codigo: '3',
        rotuloAcao: 'Opção 3',
        titulo: 'Levar o kit importado completo em 3x no cartão',
        descricao: 'Gasta R$ 190 hoje mais 2 parcelas de R$ 165.',
        impactoMoedas: -190,
        usaCofreReserva: false,
        parcelaCartaoFutura: 165,
        mesesParcela: 2,
        impactoCoracoes: 1,
        tipoEscolha: 'armadilha',
        falaReacaoFamilia: 'Mais de quinhentos reais em potes que acabam em poucas semanas.',
        explicacaoMestre:
          'Comprar combos caros de suplementos por impulso compromete o salário por vários meses.',
      },
    ],
  },

  // --- MODO INDIVIDUAL (JOVEM): PÉ-DE-MEIA ---
  {
    id: 301,
    titulo: 'Parcela e frequência do Pé-de-Meia',
    categoria: 'Estudos e incentivo',
    grupoGrafico: 'rendaExtra',
    nomeNPC: 'Helena',
    cargoNPC: 'Orientadora da escola',
    tipoNPC: 'diretora_escola',
    exclusivoPara: 'individual_qualquer',
    falaNPC:
      'Sua presença nas aulas ficou acima de 80% neste bimestre e caiu um valor extra do incentivo estudantil. Como você pretende organizar os estudos e esse dinheiro neste mês?',
    cartas: [
      {
        codigo: '1',
        rotuloAcao: 'Opção 1',
        titulo: 'Manter a frequência firme e guardar o bônus (+R$ 250)',
        descricao: 'Garante a presença nas aulas, recebe +R$ 250 extras e faz um curso livre gratuito.',
        impactoMoedas: 250,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 10,
        tipoEscolha: 'planejada',
        falaReacaoFamilia: 'Presença garantida e duzentos e cinquenta reais a mais na conta.',
        explicacaoMestre:
          'O Pé-de-Meia premia a frequência escolar e ajuda a formar sua primeira reserva financeira.',
      },
      {
        codigo: '2',
        rotuloAcao: 'Opção 2',
        titulo: 'Usar a parcela (+R$ 200) para aliviar as contas do mês',
        descricao: 'Mantém a frequência em dia e soma +R$ 200 direto no caixa.',
        impactoMoedas: 200,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 6,
        tipoEscolha: 'economica',
        falaReacaoFamilia: 'Esse valor ajudou a fechar as contas da semana no azul.',
        explicacaoMestre:
          'Manter a presença acima de 80% garante o pagamento regular do incentivo todo mês.',
      },
      {
        codigo: '3',
        rotuloAcao: 'Opção 3',
        titulo: 'Faltar às aulas na semana de provas (-R$ 200)',
        descricao: 'A frequência cai abaixo do mínimo e a parcela do mês é bloqueada.',
        impactoMoedas: -200,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: -10,
        tipoEscolha: 'armadilha',
        falaReacaoFamilia: 'Por causa das faltas, o pagamento deste mês ficou retido.',
        explicacaoMestre:
          'Quando a frequência escolar fica abaixo de 80%, o incentivo do mês é suspenso.',
      },
    ],
  },

  // --- MODOS FAMÍLIA E FAMÍLIA GRANDE: BOLSA FAMÍLIA ---
  {
    id: 401,
    titulo: 'Atualização do CadÚnico e vacinação',
    categoria: 'Benefício familiar',
    grupoGrafico: 'rendaExtra',
    nomeNPC: 'Lúcia',
    cargoNPC: 'Assistente social do CRAS',
    tipoNPC: 'assistente_social',
    exclusivoPara: 'familia_qualquer',
    falaNPC:
      'Chegou um aviso no aplicativo para atualizar o cadastro da família e apresentar a carteira de vacinação e a frequência escolar das crianças para manter o Bolsa Família.',
    cartas: [
      {
        codigo: '1',
        rotuloAcao: 'Opção 1',
        titulo: 'Levar os documentos no prazo e liberar adicional (+R$ 150)',
        descricao:
          'Atualiza os dados no CRAS com vacinas em dia e garante +R$ 150 de benefício complementar.',
        impactoMoedas: 150,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 9,
        tipoEscolha: 'planejada',
        falaReacaoFamilia: 'Cadastro atualizado a tempo e benefício garantido.',
        explicacaoMestre:
          'Manter o CadÚnico, a vacinação e a frequência escolar em dia protege essa fonte importante da renda familiar.',
      },
      {
        codigo: '2',
        rotuloAcao: 'Opção 2',
        titulo: 'Agendar atendimento para a semana seguinte (R$ 20)',
        descricao: 'Gasta apenas R$ 20 de passagem até o posto e mantém o benefício regularizado.',
        impactoMoedas: -20,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 4,
        tipoEscolha: 'economica',
        falaReacaoFamilia: 'Tudo resolvido com hora marcada e sem dor de cabeça.',
        explicacaoMestre:
          'Acompanhar os avisos oficiais pelo aplicativo evita filas e bloqueios inesperados.',
      },
      {
        codigo: '3',
        rotuloAcao: 'Opção 3',
        titulo: 'Deixar passar o prazo de recadastramento (-R$ 300)',
        descricao: 'O benefício sofre bloqueio temporário no mês até regularizar a situação.',
        impactoMoedas: -300,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: -12,
        tipoEscolha: 'armadilha',
        falaReacaoFamilia: 'Perdemos o prazo e o pagamento ficou bloqueado justo neste mês.',
        explicacaoMestre:
          'Ignorar a convocação do CadÚnico ou as exigências de saúde e escola suspende o recebimento do benefício.',
      },
    ],
  },

  // --- EVENTOS DE VIAGENS E ROUPAS ---
  {
    id: 501,
    titulo: 'Convite para viajar no feriado prolongado',
    categoria: 'Viagens e lazer',
    grupoGrafico: 'viagens',
    nomeNPC: 'Beto',
    cargoNPC: 'Agente de turismo',
    tipoNPC: 'agente_viagem',
    falaNPC:
      'Vem aí um feriado prolongado! Tem pacote completo de hotel parcelado no cartão e também opções de bate-e-volta aqui perto. O que vamos fazer?',
    cartas: [
      {
        codigo: '1',
        rotuloAcao: 'Opção 1',
        titulo: 'Fazer passeio bate-e-volta pagando à vista (R$ 190)',
        descricao: 'Passa o dia numa cidade próxima levando lanche de casa e sem fazer dívida.',
        impactoMoedas: -190,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 12,
        tipoEscolha: 'planejada',
        falaReacaoFamilia: 'Descansamos bastante e voltamos pra casa sem boleto pendurado.',
        explicacaoMestre:
          'Passeios planejados à vista renovam o ânimo sem comprometer os próximos meses.',
      },
      {
        codigo: '2',
        rotuloAcao: 'Opção 2',
        titulo: 'Aproveitar programação gratuita na cidade (R$ 60)',
        descricao: 'Faz piquenique no parque e vai a eventos culturais abertos gastando R$ 60.',
        impactoMoedas: -60,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 8,
        tipoEscolha: 'economica',
        falaReacaoFamilia: 'O feriado no parque rendeu boas risadas e quase não gastamos.',
        explicacaoMestre:
          'Quando o caixa está curto, opções gratuitas na própria cidade garantem lazer sem aperto.',
      },
      {
        codigo: '3',
        rotuloAcao: 'Opção 3',
        titulo: 'Fechar hotel e passeios caros em 4x no cartão',
        descricao: 'Gasta R$ 320 na viagem agora e volta com 3 parcelas de R$ 240.',
        impactoMoedas: -320,
        usaCofreReserva: false,
        parcelaCartaoFutura: 240,
        mesesParcela: 3,
        impactoCoracoes: 5,
        tipoEscolha: 'armadilha',
        falaReacaoFamilia: 'O feriado durou três dias, mas a conta vai durar quatro meses.',
        explicacaoMestre:
          'Viajar no impulso usando o limite do cartão transforma alguns dias de folga em meses de aperto.',
      },
    ],
  },
  {
    id: 502,
    titulo: 'Roupa e calçado para compromisso importante',
    categoria: 'Roupas e calçados',
    grupoGrafico: 'roupas',
    nomeNPC: 'Camila',
    cargoNPC: 'Vendedora de loja',
    tipoNPC: 'vendedor_shopping',
    falaNPC:
      'Surgiu um compromisso importante neste mês e o sapato antigo descolou. Se quiser fazer o cartão da loja hoje, você leva quatro peças e começa a pagar depois!',
    cartas: [
      {
        codigo: '1',
        rotuloAcao: 'Opção 1',
        titulo: 'Comprar só a peça necessária com desconto no PIX (R$ 160)',
        descricao: 'Escolhe um modelo neutro que combina com tudo e paga à vista.',
        impactoMoedas: -160,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 7,
        tipoEscolha: 'planejada',
        falaReacaoFamilia: 'Levamos exatamente o que precisava e ainda conseguimos desconto.',
        explicacaoMestre:
          'Comprar apenas o item necessário à vista evita cair nas taxas embutidas dos cartões de loja.',
      },
      {
        codigo: '2',
        rotuloAcao: 'Opção 2',
        titulo: 'Garimpar peça seminova em brechó (R$ 75)',
        descricao: 'Encontra roupa e calçado em ótimo estado pagando menos da metade.',
        impactoMoedas: -75,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 8,
        tipoEscolha: 'economica',
        falaReacaoFamilia: 'Achamos uma peça impecável no brechó por setenta e cinco reais.',
        explicacaoMestre:
          'Brechós e bazares organizados são ótimas alternativas para economizar até 70% em vestuário.',
      },
      {
        codigo: '3',
        rotuloAcao: 'Opção 3',
        titulo: 'Fazer o cartão da loja e parcelar sacolas cheias',
        descricao: 'Paga R$ 240 hoje e assume 3 parcelas de R$ 190 com taxas do cartão.',
        impactoMoedas: -240,
        usaCofreReserva: false,
        parcelaCartaoFutura: 190,
        mesesParcela: 3,
        impactoCoracoes: 1,
        tipoEscolha: 'armadilha',
        falaReacaoFamilia: 'Entramos para comprar um calçado e saímos com oitocentos reais de dívida.',
        explicacaoMestre:
          'Cartões de loja costumam cobrar anuidades e seguros que encarecem muito a compra final.',
      },
    ],
  },

  // --- EVENTOS GERAIS DA VIDA REAL ---
  {
    id: 1,
    titulo: 'A geladeira parou de gelar de madrugada',
    categoria: 'Imprevisto em casa',
    grupoGrafico: 'imprevistos',
    nomeNPC: 'Seu Zé',
    cargoNPC: 'Técnico de refrigeração',
    tipoNPC: 'tecnico',
    falaNPC:
      'O motor da geladeira queimou. Se não trocar a peça logo, as coisas que estão no congelador vão estragar.',
    cartas: [
      {
        codigo: '1',
        rotuloAcao: 'Opção 1',
        titulo: 'Consertar hoje à vista ou usando a reserva (R$ 450)',
        descricao: 'Troca a peça original com garantia (usa a reserva se tiver saldo guardado).',
        impactoMoedas: -450,
        usaCofreReserva: true,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 6,
        tipoEscolha: 'planejada',
        falaReacaoFamilia: 'Ainda bem que consertamos na hora e não perdemos a compra do mês.',
        explicacaoMestre:
          'É exatamente para situações assim que serve a reserva de emergência: resolver o problema à vista e sem juros.',
      },
      {
        codigo: '2',
        rotuloAcao: 'Opção 2',
        titulo: 'Colocar peça recondicionada e guardar comida no vizinho (R$ 260)',
        descricao: 'Negocia uma peça usada com garantia menor para gastar menos.',
        impactoMoedas: -260,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: -3,
        tipoEscolha: 'economica',
        falaReacaoFamilia: 'Deu um pouco de trabalho, mas a geladeira voltou a funcionar.',
        explicacaoMestre:
          'Quando não há reserva suficiente, negociar alternativas mais baratas evita entrar no rotativo do cartão.',
      },
      {
        codigo: '3',
        rotuloAcao: 'Opção 3',
        titulo: 'Comprar uma geladeira nova parcelada no cartão',
        descricao: 'Perde alimentos + R$ 340 hoje e assume 4 parcelas de R$ 250.',
        impactoMoedas: -340,
        usaCofreReserva: false,
        parcelaCartaoFutura: 250,
        mesesParcela: 4,
        impactoCoracoes: -8,
        tipoEscolha: 'armadilha',
        falaReacaoFamilia: 'Em vez de apenas consertar, arrumamos uma prestação pesada por quatro meses.',
        explicacaoMestre:
          'Trocar um conserto simples por uma compra cara parcelada compromete a renda dos meses seguintes.',
      },
    ],
  },
  {
    id: 3,
    titulo: 'Conta de luz veio mais alta neste mês',
    categoria: 'Contas da casa',
    grupoGrafico: 'moradia',
    nomeNPC: 'Marcos',
    cargoNPC: 'Leiturista',
    tipoNPC: 'cobrador_luz',
    falaNPC:
      'Com o calor forte e a tarifa em bandeira vermelha, a conta de energia veio R$ 210 acima do normal.',
    cartas: [
      {
        codigo: '1',
        rotuloAcao: 'Opção 1',
        titulo: 'Pagar em dia e trocar lâmpadas antigas por LED (R$ 210)',
        descricao: 'Quita a fatura sem multa (usa a reserva se tiver) e reduz o gasto futuro.',
        impactoMoedas: -210,
        usaCofreReserva: true,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 4,
        tipoEscolha: 'planejada',
        falaReacaoFamilia: 'Conta paga em dia e lâmpadas trocadas para o próximo mês vir menor.',
        explicacaoMestre:
          'Pagar contas essenciais dentro do vencimento evita multas e juros na fatura seguinte.',
      },
      {
        codigo: '2',
        rotuloAcao: 'Opção 2',
        titulo: 'Reduzir tempo de banho e tirar aparelhos da tomada (R$ 120)',
        descricao: 'Faz economia de consumo em casa para compensar parte do aumento.',
        impactoMoedas: -120,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: -2,
        tipoEscolha: 'economica',
        falaReacaoFamilia: 'Todo mundo colaborou nos banhos e desligando aparelhos em espera.',
        explicacaoMestre:
          'Chuveiro elétrico e aparelhos ligados sem uso respondem por boa parte da conta de luz.',
      },
      {
        codigo: '3',
        rotuloAcao: 'Opção 3',
        titulo: 'Atrasar o pagamento e parcelar com multa no cartão',
        descricao: 'Paga R$ 110 agora e joga 2 parcelas de R$ 100 para frente.',
        impactoMoedas: -110,
        usaCofreReserva: false,
        parcelaCartaoFutura: 100,
        mesesParcela: 2,
        impactoCoracoes: -9,
        tipoEscolha: 'armadilha',
        falaReacaoFamilia: 'A conta atrasada ganhou multa e se juntou com a luz do mês que vem.',
        explicacaoMestre:
          'Parcelar contas mensais como água e luz faz você pagar duas contas ao mesmo tempo no mês seguinte.',
      },
    ],
  },
  {
    id: 4,
    titulo: 'Oferta de celular novo no shopping',
    categoria: 'Consumo por impulso',
    grupoGrafico: 'outros',
    nomeNPC: 'Léo',
    cargoNPC: 'Vendedor de eletrônicos',
    tipoNPC: 'vendedor_shopping',
    falaNPC:
      'Seu celular atual ainda funciona direitinho, mas acabou de chegar esse modelo novo com câmera tripla. Quer levar parcelado hoje?',
    cartas: [
      {
        codigo: '1',
        rotuloAcao: 'Opção 1',
        titulo: 'Continuar com o celular atual (R$ 0)',
        descricao: 'Espera passar a empolgação do momento e mantém o dinheiro na conta.',
        impactoMoedas: 0,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 5,
        tipoEscolha: 'planejada',
        falaReacaoFamilia: 'O aparelho atual atende super bem, não tinha por que entrar em dívida.',
        explicacaoMestre:
          'Esperar dois dias antes de comprar algo caro ajuda a perceber se é necessidade real ou só impulso.',
      },
      {
        codigo: '2',
        rotuloAcao: 'Opção 2',
        titulo: 'Trocar apenas a película e a capinha (R$ 40)',
        descricao: 'Renova a proteção do aparelho atual gastando bem pouco.',
        impactoMoedas: -40,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 6,
        tipoEscolha: 'economica',
        falaReacaoFamilia: 'Com capinha e película novas, o celular ficou ótimo por quarenta reais.',
        explicacaoMestre:
          'Cuidar bem do que já temos prolonga a vida útil e poupa milhares de reais.',
      },
      {
        codigo: '3',
        rotuloAcao: 'Opção 3',
        titulo: 'Levar o celular novo com seguro no cartão',
        descricao: 'Paga R$ 280 hoje e assume 4 parcelas de R$ 240.',
        impactoMoedas: -280,
        usaCofreReserva: false,
        parcelaCartaoFutura: 240,
        mesesParcela: 4,
        impactoCoracoes: 2,
        tipoEscolha: 'armadilha',
        falaReacaoFamilia: 'A novidade passou rápido, mas a parcela de R$ 240 ficou todo mês.',
        explicacaoMestre:
          'Trocar aparelhos que ainda funcionam bem por meio de parcelamentos longos trava o orçamento.',
      },
    ],
  },
  {
    id: 5,
    titulo: 'Manutenção urgente no transporte',
    categoria: 'Transporte',
    grupoGrafico: 'transporte',
    nomeNPC: 'Tião',
    cargoNPC: 'Mecânico da oficina',
    tipoNPC: 'mecanico',
    falaNPC:
      'O freio e o pneu chegaram no limite. Dá para resolver tudo hoje ou ir rodando assim mais um tempo, mas pode ficar mais caro depois.',
    cartas: [
      {
        codigo: '1',
        rotuloAcao: 'Opção 1',
        titulo: 'Fazer o conserto completo à vista (R$ 360)',
        descricao: 'Usa a reserva ou o saldo para resolver com segurança e desconto.',
        impactoMoedas: -360,
        usaCofreReserva: true,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 6,
        tipoEscolha: 'planejada',
        falaReacaoFamilia: 'Resolvido na hora, com segurança e sem prestação.',
        explicacaoMestre:
          'Resolver manutenções necessárias à vista evita que um defeito pequeno vire um prejuízo maior.',
      },
      {
        codigo: '2',
        rotuloAcao: 'Opção 2',
        titulo: 'Pesquisar preço em três oficinas antes (R$ 210)',
        descricao: 'Compara orçamentos e compra a peça direto no distribuidor.',
        impactoMoedas: -210,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 3,
        tipoEscolha: 'economica',
        falaReacaoFamilia: 'Só de pesquisar em outras oficinas, economizamos R$ 150.',
        explicacaoMestre:
          'Comparar pelo menos três orçamentos antes de autorizar um serviço costuma gerar boa economia.',
      },
      {
        codigo: '3',
        rotuloAcao: 'Opção 3',
        titulo: 'Adiar o conserto e parcelar quando quebrar de vez',
        descricao: 'Gasta R$ 260 agora mais 3 parcelas de R$ 180 com o dano maior.',
        impactoMoedas: -260,
        usaCofreReserva: false,
        parcelaCartaoFutura: 180,
        mesesParcela: 3,
        impactoCoracoes: -9,
        tipoEscolha: 'armadilha',
        falaReacaoFamilia: 'Deixamos para depois e o conserto acabou saindo mais que o dobro.',
        explicacaoMestre:
          'Adiar manutenção preventiva quase sempre multiplica o valor final da oficina.',
      },
    ],
  },
  {
    id: 6,
    titulo: 'Chamado para trabalho extra no fim de semana',
    categoria: 'Renda extra',
    grupoGrafico: 'rendaExtra',
    nomeNPC: 'Pacheco',
    cargoNPC: 'Coordenador de eventos',
    tipoNPC: 'chefe',
    falaNPC:
      'Apareceu uma vaga para trabalhar num evento neste fim de semana. O pagamento sai na hora no domingo, mas exige abrir mão do descanso.',
    cartas: [
      {
        codigo: '1',
        rotuloAcao: 'Opção 1',
        titulo: 'Trabalhar no sábado (+R$ 300) e descansar no domingo',
        descricao: 'Garante um bom reforço no caixa sem abrir mão de todo o descanso.',
        impactoMoedas: 300,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 3,
        tipoEscolha: 'planejada',
        falaReacaoFamilia: 'Entraram trezentos reais extras e ainda deu para descansar no domingo.',
        explicacaoMestre:
          'Conciliar trabalhos extras pontuais com descanso ajuda a reforçar a reserva sem esgotar a saúde.',
      },
      {
        codigo: '2',
        rotuloAcao: 'Opção 2',
        titulo: 'Pegar todos os turnos do fim de semana (+R$ 520)',
        descricao: 'Aumenta bastante o saldo do mês, mas gera cansaço (-8 de bem-estar).',
        impactoMoedas: 520,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: -8,
        tipoEscolha: 'economica',
        falaReacaoFamilia: 'O dinheiro ajudou muito nas contas, mas a semana começou no cansaço.',
        explicacaoMestre:
          'Fazer mais horas ajuda a sair do aperto, mas é importante cuidar para não desgastar a saúde.',
      },
      {
        codigo: '3',
        rotuloAcao: 'Opção 3',
        titulo: 'Recusar o trabalho e sair para gastar (-R$ 150)',
        descricao: 'Deixa de ganhar o extra e gasta R$ 150 no passeio.',
        impactoMoedas: -150,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 5,
        tipoEscolha: 'armadilha',
        falaReacaoFamilia: 'O fim de semana foi ótimo, mas fez falta aquele dinheiro extra no caixa.',
        explicacaoMestre:
          'Quando o orçamento está apertado, trocar uma oportunidade de renda por um gasto extra pesa em dobro.',
      },
    ],
  },
  {
    id: 7,
    titulo: 'Alta nos preços do supermercado',
    categoria: 'Alimentação',
    grupoGrafico: 'alimentacao',
    nomeNPC: 'Dona Cleide',
    cargoNPC: 'Caixa do mercado',
    tipoNPC: 'caixa_mercado',
    falaNPC:
      'O arroz, o café, o leite e a carne subiram neste mês. Como você vai organizar a compra para não estourar o orçamento?',
    cartas: [
      {
        codigo: '1',
        rotuloAcao: 'Opção 1',
        titulo: 'Ir ao atacarejo com lista fechada (R$ 100)',
        descricao: 'Planeja o cardápio da semana antes de sair de casa para evitar desperdício.',
        impactoMoedas: -100,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 4,
        tipoEscolha: 'planejada',
        falaReacaoFamilia: 'Comprar no atacarejo seguindo a lista segurou bem a subida dos preços.',
        explicacaoMestre:
          'Ir ao mercado com lista pronta e sem fome evita compras por impulso nos corredores.',
      },
      {
        codigo: '2',
        rotuloAcao: 'Opção 2',
        titulo: 'Trocar marcas caras e comprar legumes da época na feira (R$ 35)',
        descricao: 'Substitui itens caros por produtos da estação e marcas mais em conta.',
        impactoMoedas: -35,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 5,
        tipoEscolha: 'economica',
        falaReacaoFamilia: 'A feira de fim de manhã rendeu muita coisa boa e barata.',
        explicacaoMestre:
          'Frutas, verduras e legumes da estação são mais baratos e nutritivos que produtos industrializados.',
      },
      {
        codigo: '3',
        rotuloAcao: 'Opção 3',
        titulo: 'Colocar tudo no carrinho e parcelar em 2x no cartão',
        descricao: 'Gasta R$ 180 agora e deixa R$ 165 para a fatura do mês que vem.',
        impactoMoedas: -180,
        usaCofreReserva: false,
        parcelaCartaoFutura: 165,
        mesesParcela: 1,
        impactoCoracoes: -4,
        tipoEscolha: 'armadilha',
        falaReacaoFamilia: 'A comida acaba neste mês, mas metade da conta ficou para o próximo.',
        explicacaoMestre:
          'Parcelar compras de mercado é perigoso porque no mês seguinte você terá que comprar comida de novo.',
      },
    ],
  },
  {
    id: 8,
    titulo: 'Dor de dente precisando de atendimento',
    categoria: 'Saúde',
    grupoGrafico: 'cuidadosPessoais',
    nomeNPC: 'Dra. Sofia',
    cargoNPC: 'Dentista',
    tipoNPC: 'dentista',
    falaNPC:
      'Essa cárie está funda. Se tratar hoje, uma restauração resolve; se deixar passar mais tempo, pode virar tratamento de canal.',
    cartas: [
      {
        codigo: '1',
        rotuloAcao: 'Opção 1',
        titulo: 'Fazer o tratamento hoje à vista ou usando a reserva (R$ 390)',
        descricao: 'Resolve o problema na hora sem deixar agravar.',
        impactoMoedas: -390,
        usaCofreReserva: true,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 10,
        tipoEscolha: 'planejada',
        falaReacaoFamilia: 'Que alívio resolver essa dor logo no começo.',
        explicacaoMestre:
          'Cuidar da saúde assim que o problema surge sai muito mais barato do que tratar complicações.',
      },
      {
        codigo: '2',
        rotuloAcao: 'Opção 2',
        titulo: 'Buscar atendimento na clínica-escola da faculdade (R$ 140)',
        descricao: 'Faz o procedimento supervisionado por professores pagando apenas o material.',
        impactoMoedas: -140,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 5,
        tipoEscolha: 'economica',
        falaReacaoFamilia: 'O atendimento na faculdade foi muito bem feito e coube no bolso.',
        explicacaoMestre:
          'Unidades básicas de saúde e clínicas universitárias oferecem ótimas opções de tratamento acessível.',
      },
      {
        codigo: '3',
        rotuloAcao: 'Opção 3',
        titulo: 'Tomar só analgésico agora e tratar depois no cartão',
        descricao: 'Gasta R$ 85 em remédios e depois assume 3x de R$ 220 pelo canal.',
        impactoMoedas: -85,
        usaCofreReserva: false,
        parcelaCartaoFutura: 220,
        mesesParcela: 3,
        impactoCoracoes: -15,
        tipoEscolha: 'armadilha',
        falaReacaoFamilia: 'Além de sofrer com dor o mês todo, o tratamento ficou muito mais caro.',
        explicacaoMestre:
          'Adiar cuidados de saúde prejudica o bem-estar e multiplica o custo do tratamento.',
      },
    ],
  },
  {
    id: 9,
    titulo: 'Assinaturas cobrando no cartão sem uso',
    categoria: 'Gastos invisíveis',
    grupoGrafico: 'outros',
    nomeNPC: 'Aviso da Fatura',
    cargoNPC: 'Cobrança automática',
    tipoNPC: 'streaming_bot',
    falaNPC:
      'Foram cobrados R$ 175 no cartão referentes a serviços de filmes, música e clubes de benefícios que quase ninguém usou no mês.',
    cartas: [
      {
        codigo: '1',
        rotuloAcao: 'Opção 1',
        titulo: 'Cancelar o que não usa e pedir estorno no dia (+R$ 100)',
        descricao: 'Faz uma limpa nas assinaturas paradas e recupera parte do valor.',
        impactoMoedas: 100,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 5,
        tipoEscolha: 'planejada',
        falaReacaoFamilia: 'Cancelamos o que estava parado e recuperamos cem reais.',
        explicacaoMestre:
          'Revisar a fatura todo mês ajuda a cortar pequenos gastos automáticos que somam muito no ano.',
      },
      {
        codigo: '2',
        rotuloAcao: 'Opção 2',
        titulo: 'Manter apenas um serviço por vez (R$ 30)',
        descricao: 'Cancela os repetidos e deixa só o que realmente assiste.',
        impactoMoedas: -30,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 4,
        tipoEscolha: 'economica',
        falaReacaoFamilia: 'Ficamos só com um aplicativo e cortamos o desperdício.',
        explicacaoMestre:
          'Assinar apenas um serviço por vez evita pagar mensalidades de plataformas que ficam sem uso.',
      },
      {
        codigo: '3',
        rotuloAcao: 'Opção 3',
        titulo: 'Deixar para cancelar depois e continuar pagando',
        descricao: 'Desconta R$ 175 neste mês e continua cobrando nos próximos 2 meses.',
        impactoMoedas: -175,
        usaCofreReserva: false,
        parcelaCartaoFutura: 175,
        mesesParcela: 2,
        impactoCoracoes: -3,
        tipoEscolha: 'armadilha',
        falaReacaoFamilia: 'Mais de quinhentos reais indo embora em assinaturas esquecidas.',
        explicacaoMestre:
          'Pequenas cobranças automáticas esquecidas no cartão são um dos maiores ralos do orçamento.',
      },
    ],
  },
  {
    id: 12,
    titulo: 'Vazamento no cano da lavanderia',
    categoria: 'Manutenção da casa',
    grupoGrafico: 'moradia',
    nomeNPC: 'Mário',
    cargoNPC: 'Encanador',
    tipoNPC: 'encanador',
    falaNPC:
      'O relógio de água não para de girar porque tem um cano trincado na parede da lavanderia.',
    cartas: [
      {
        codigo: '1',
        rotuloAcao: 'Opção 1',
        titulo: 'Chamar o encanador hoje e pedir revisão da conta (R$ 250)',
        descricao: 'Conserta na hora (usa a reserva se tiver) e evita conta alta.',
        impactoMoedas: -250,
        usaCofreReserva: true,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 5,
        tipoEscolha: 'planejada',
        falaReacaoFamilia: 'Vazamento resolvido no mesmo dia e conta revisada.',
        explicacaoMestre:
          'Consertar vazamentos rapidamente evita infiltração e permite pedir revisão da fatura de água.',
      },
      {
        codigo: '2',
        rotuloAcao: 'Opção 2',
        titulo: 'Comprar a conexão e o veda-rosca e arrumar no sábado (R$ 85)',
        descricao: 'Fecha o registro e faz o reparo por conta própria gastando só o material.',
        impactoMoedas: -85,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 3,
        tipoEscolha: 'economica',
        falaReacaoFamilia: 'Arrumamos o cano no sábado e economizamos a mão de obra.',
        explicacaoMestre:
          'Aprender pequenos reparos domésticos gera uma ótima economia ao longo do ano.',
      },
      {
        codigo: '3',
        rotuloAcao: 'Opção 3',
        titulo: 'Deixar o conserto para o mês que vem',
        descricao: 'Gasta R$ 200 de água extra agora mais 2x de R$ 210 com a infiltração.',
        impactoMoedas: -200,
        usaCofreReserva: false,
        parcelaCartaoFutura: 210,
        mesesParcela: 2,
        impactoCoracoes: -10,
        tipoEscolha: 'armadilha',
        falaReacaoFamilia: 'A umidade estragou o reboco e o conserto triplicou de preço.',
        explicacaoMestre:
          'Ignorar vazamentos aumenta a conta de água e estraga a pintura e a alvenaria.',
      },
    ],
  },
  {
    id: 13,
    titulo: 'Itens parados ocupando espaço em casa',
    categoria: 'Renda extra',
    grupoGrafico: 'rendaExtra',
    nomeNPC: 'Lucas',
    cargoNPC: 'Comprador da internet',
    tipoNPC: 'comprador_web',
    falaNPC:
      'Tem aparelhos, roupas em bom estado e objetos que ninguém usa mais guardados no armário. Que tal anunciar na internet?',
    cartas: [
      {
        codigo: '1',
        rotuloAcao: 'Opção 1',
        titulo: 'Tirar boas fotos e vender pela internet (+R$ 360)',
        descricao: 'Vende os itens parados e recebe o pagamento no PIX.',
        impactoMoedas: 360,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 7,
        tipoEscolha: 'planejada',
        falaReacaoFamilia: 'Liberamos espaço no armário e ainda entraram R$ 360 na conta.',
        explicacaoMestre:
          'Vender o que está sem uso transforma coisas paradas em dinheiro para reforçar sua reserva.',
      },
      {
        codigo: '2',
        rotuloAcao: 'Opção 2',
        titulo: 'Vender um lote para loja de usados (+R$ 190) e doar o resto',
        descricao: 'Recebe rápido na hora e ajuda quem precisa.',
        impactoMoedas: 190,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 9,
        tipoEscolha: 'economica',
        falaReacaoFamilia: 'A casa ficou organizada e ainda entrou um bom dinheiro.',
        explicacaoMestre:
          'Desapegar do que não usa libera espaço e traz dinheiro rápido para o caixa.',
      },
      {
        codigo: '3',
        rotuloAcao: 'Opção 3',
        titulo: 'Desistir de vender e comprar caixas organizadoras (-R$ 120)',
        descricao: 'Gasta R$ 120 para continuar guardando coisas sem uso.',
        impactoMoedas: -120,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: -2,
        tipoEscolha: 'armadilha',
        falaReacaoFamilia: 'Além de não ganhar nada, gastamos comprando caixas.',
        explicacaoMestre:
          'Acumular objetos sem utilidade faz você perder a chance de recuperar parte do que gastou.',
      },
    ],
  },
  {
    id: 15,
    titulo: 'Vontade de pedir entrega várias vezes na semana',
    categoria: 'Alimentação e rotina',
    grupoGrafico: 'alimentacao',
    nomeNPC: 'Henrique',
    cargoNPC: 'Entregador de aplicativo',
    tipoNPC: 'entregador',
    falaNPC:
      'Bateu cansaço à noite e chegou cupom no celular. Mas pedir lanche três ou quatro vezes por semana pesa rápido na conta.',
    cartas: [
      {
        codigo: '1',
        rotuloAcao: 'Opção 1',
        titulo: 'Deixar refeições prontas no freezer e pedir só uma vez (R$ 80)',
        descricao: 'Organiza marmitas caseiras no fim de semana e curte um lanche sem exagero.',
        impactoMoedas: -80,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 7,
        tipoEscolha: 'planejada',
        falaReacaoFamilia: 'Ter comida pronta no congelador salvou a semana corrida.',
        explicacaoMestre:
          'Deixar refeições congeladas evita pedir entrega cara só porque você chegou cansado em casa.',
      },
      {
        codigo: '2',
        rotuloAcao: 'Opção 2',
        titulo: 'Desativar notificações do app e fazer lanche em casa (R$ 30)',
        descricao: 'Prepara sanduíche, tapioca ou omelete rápido gastando pouco.',
        impactoMoedas: -30,
        usaCofreReserva: false,
        parcelaCartaoFutura: 0,
        mesesParcela: 0,
        impactoCoracoes: 4,
        tipoEscolha: 'economica',
        falaReacaoFamilia: 'Silenciar os alertas do aplicativo evitou muita compra por impulso.',
        explicacaoMestre:
          'Notificações de cupons no fim da tarde funcionam como gatilho para gastos fora do planejado.',
      },
      {
        codigo: '3',
        rotuloAcao: 'Opção 3',
        titulo: 'Pedir entrega toda semana no cartão de crédito',
        descricao: 'Gasta R$ 320 neste mês e acumula R$ 160 para a próxima fatura.',
        impactoMoedas: -320,
        usaCofreReserva: false,
        parcelaCartaoFutura: 160,
        mesesParcela: 1,
        impactoCoracoes: 1,
        tipoEscolha: 'armadilha',
        falaReacaoFamilia: 'Quase quinhentos reais só em entregas e taxas neste mês.',
        explicacaoMestre:
          'Vários pedidos pequenos ao longo do mês costumam custar mais caro que toda a feira da casa.',
      },
    ],
  },
];

// ============================================================================
// PERFIS PADRÃO POR MODO E GÊNERO
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
    titulo: 'Família Silva (Casal, filho e pet)',
    subtitulo: '3 pessoas · Salário + Bolsa Família',
    dicaEducativa:
      'Na família de três pessoas, o Bolsa Família complementa a renda, mas mercado, contas da casa e despesas da criança exigem atenção para sobrar uma reserva todo mês.',
    receitas: {
      salarioMensal: 2800,
      bolsaFamilia: 600,
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
      nomeOutrosGastos: 'Ração do Caramelo e material escolar',
    },
    metaReserva: 250,
  },
  familia_grande: {
    titulo: 'Família Grande (Casal, 2 filhos, vovó e pet)',
    subtitulo: '5 pessoas · Renda familiar + Bolsa Família',
    dicaEducativa:
      'Com cinco pessoas morando juntas, alimentação, luz, água e remédios da vovó pesam bastante. Qualquer gasto fora de hora se multiplica rápido.',
    receitas: {
      salarioMensal: 4200,
      bolsaFamilia: 750,
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
      nomeOutrosGastos: 'Farmácia da vovó e ração do pet',
    },
    metaReserva: 380,
  },
  individual_mulher: {
    titulo: 'Jovem Solo (Mulher)',
    subtitulo: '1 pessoa · Salário/estágio + Pé-de-Meia',
    dicaEducativa:
      'No dia a dia das mulheres, itens de higiene e farmácia costumam ser mais caros (a chamada "taxa rosa"), além dos gastos com cabelo/salão e corridas de aplicativo à noite por segurança.',
    receitas: {
      salarioMensal: 2100,
      bolsaFamilia: 0,
      peDeMeia: 200,
    },
    essenciais: {
      gastoMoradia: 780,
      gastoAlimentacao: 480,
      gastoTransporte: 250,
    },
    estiloVida: {
      gastoRoupas: 150,
      gastoViagens: 140,
      gastoCuidadosPessoais: 190,
      outrosGastos: 70,
      nomeOutrosGastos: 'Celular e material de estudo',
    },
    metaReserva: 180,
  },
  individual_homem: {
    titulo: 'Jovem Solo (Homem)',
    subtitulo: '1 pessoa · Salário/estágio + Pé-de-Meia',
    dicaEducativa:
      'No perfil jovem masculino, os gastos que mais costumam fugir do controle são idas semanais à barbearia, jogos e assinaturas de esporte, suplementos e lanches com a turma.',
    receitas: {
      salarioMensal: 2100,
      bolsaFamilia: 0,
      peDeMeia: 200,
    },
    essenciais: {
      gastoMoradia: 780,
      gastoAlimentacao: 520,
      gastoTransporte: 210,
    },
    estiloVida: {
      gastoRoupas: 120,
      gastoViagens: 180,
      gastoCuidadosPessoais: 130,
      outrosGastos: 80,
      nomeOutrosGastos: 'Jogos e internet do celular',
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
  '#0284c7', // Alimentação
  '#0d9488', // Moradia
  '#f59e0b', // Transporte
  '#ec4899', // Roupas
  '#8b5cf6', // Viagens/Lazer
  '#db2777', // Cuidados Pessoais
  '#6366f1', // Outros
  '#f97316', // Imprevistos
  '#ef4444', // Juros
  '#10b981', // Reserva
];

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function App() {
  // 1. Estados de Modo de Jogo, Gênero, Aba Compacta e Tutorial
  const [telaJogo, setTelaJogo] = useState<TelaJogo>('selecao');
  const [modoJogo, setModoJogo] = useState<ModoJogo>('familia');
  const [generoPersonagem, setGeneroPersonagem] = useState<GeneroPersonagem>('mulher');
  const [abaOrcamento, setAbaOrcamento] = useState<AbaOrcamento>('renda');
  const [tutorialAberto, setTutorialAberto] = useState<boolean>(false);
  const [passoTutorial, setPassoTutorial] = useState<number>(0);

  // 2. Estados de Receitas e Despesas (em português)
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
    'Ração do Caramelo e material escolar'
  );

  const [metaReserva, setMetaReserva] = useState<number>(250);

  // 3. Estados da Simulação de 6 Meses
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

  // 4. Estados de Áudio: Música de Fundo e Efeitos Sonoros
  const [musicaAtiva, setMusicaAtiva] = useState<boolean>(true);
  const [somAtivo, setSomAtivo] = useState<boolean>(true);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervaloMusicaRef = useRef<number | null>(null);
  const passoMusicaRef = useRef<number>(0);
  const contadorParticulaRef = useRef<number>(1);

  const obterAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  // ============================================================================
  // TRILHA SONORA DE FUNDO SUAVE (WEB AUDIO API)
  // ============================================================================

  const tocarPassoMusica = useCallback(() => {
    if (!musicaAtiva) return;
    try {
      const ctx = obterAudioContext();
      const t = ctx.currentTime;

      const sequenciaMelodia = [
        523.25, 659.25, 783.99, 659.25,
        440.0,  523.25, 659.25, 523.25,
        349.23, 440.0,  523.25, 440.0,
        392.0,  493.88, 587.33, 493.88,
      ];

      const sequenciaBaixo = [
        130.81, 0, 196.0, 0,
        110.0,  0, 164.81, 0,
        174.61, 0, 130.81, 0,
        196.0,  0, 146.83, 0,
      ];

      const idx = passoMusicaRef.current % sequenciaMelodia.length;
      passoMusicaRef.current += 1;

      const notaMelodia = sequenciaMelodia[idx];
      const notaBaixo = sequenciaBaixo[idx];

      if (notaMelodia > 0) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(notaMelodia, t);
        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.026, t + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0008, t + 0.36);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.38);
      }

      if (notaBaixo > 0) {
        const oscBaixo = ctx.createOscillator();
        const gainBaixo = ctx.createGain();
        oscBaixo.type = 'sine';
        oscBaixo.frequency.setValueAtTime(notaBaixo, t);
        gainBaixo.gain.setValueAtTime(0.001, t);
        gainBaixo.gain.linearRampToValueAtTime(0.03, t + 0.05);
        gainBaixo.gain.exponentialRampToValueAtTime(0.0008, t + 0.42);
        oscBaixo.connect(gainBaixo);
        gainBaixo.connect(ctx.destination);
        oscBaixo.start(t);
        oscBaixo.stop(t + 0.44);
      }
    } catch {
      // Ignora caso o navegador ainda aguarde interação do usuário
    }
  }, [musicaAtiva, obterAudioContext]);

  useEffect(() => {
    if (!musicaAtiva) {
      if (intervaloMusicaRef.current !== null) {
        window.clearInterval(intervaloMusicaRef.current);
        intervaloMusicaRef.current = null;
      }
      return;
    }

    const iniciarSeInteragir = () => {
      if (intervaloMusicaRef.current === null && musicaAtiva) {
        tocarPassoMusica();
        intervaloMusicaRef.current = window.setInterval(tocarPassoMusica, 420);
      }
    };

    if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
      iniciarSeInteragir();
    }

    window.addEventListener('pointerdown', iniciarSeInteragir, { once: true });
    window.addEventListener('keydown', iniciarSeInteragir, { once: true });

    return () => {
      window.removeEventListener('pointerdown', iniciarSeInteragir);
      window.removeEventListener('keydown', iniciarSeInteragir);
      if (intervaloMusicaRef.current !== null) {
        window.clearInterval(intervaloMusicaRef.current);
        intervaloMusicaRef.current = null;
      }
    };
  }, [musicaAtiva, tocarPassoMusica]);

  const alternarMusicaFundo = () => {
    setMusicaAtiva((ativa) => {
      const novoEstado = !ativa;
      if (novoEstado) {
        obterAudioContext();
      }
      return novoEstado;
    });
  };

  // ============================================================================
  // EFEITOS SONOROS DE INTERAÇÃO
  // ============================================================================

  const tocarSomArcade = useCallback(
    (tipo: 'moeda' | 'dano' | 'clique' | 'vitoria' | 'gameover' | 'start') => {
      if (!somAtivo) return;
      try {
        const ctx = obterAudioContext();
        const t = ctx.currentTime;

        if (tipo === 'moeda') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(987.77, t);
          osc.frequency.setValueAtTime(1318.51, t + 0.075);
          gain.gain.setValueAtTime(0.09, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.3);
        } else if (tipo === 'dano') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(180, t);
          osc.frequency.linearRampToValueAtTime(65, t + 0.25);
          gain.gain.setValueAtTime(0.11, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.28);
        } else if (tipo === 'clique') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(520, t);
          osc.frequency.setValueAtTime(660, t + 0.025);
          gain.gain.setValueAtTime(0.06, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.06);
        } else if (tipo === 'start') {
          const notas = [261.63, 329.63, 392.0, 523.25];
          notas.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, t + i * 0.06);
            gain.gain.setValueAtTime(0.08, t + i * 0.06);
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
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, t + i * 0.09);
            gain.gain.setValueAtTime(0.09, t + i * 0.09);
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
            gain.gain.setValueAtTime(0.09, t + i * 0.14);
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
    [somAtivo, obterAudioContext]
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
    window.setTimeout(() => setTremeTela(false), 450);
  }, []);

  // ============================================================================
  // TROCA DE MODO E GÊNERO
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
  // CÁLCULOS DE RECEITAS E DESPESAS PLANEJADAS
  // ============================================================================

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
      return 'As despesas planejadas já passam da renda do mês. Assim vamos começar no vermelho.';
    }
    if (gastoAlimentacao < receitasMensaisTotais * 0.12) {
      return 'Separamos muito pouco para alimentação. Vai faltar comida antes do fim do mês.';
    }
    if (percentualComprometidoFixosEVida > 78) {
      return 'Quase toda a renda já está comprometida. Qualquer imprevisto pode complicar.';
    }
    if (metaReserva === 0) {
      return 'Sem guardar nada na reserva, o primeiro conserto de urgência vai virar dívida.';
    }
    if (modoJogo === 'individual' && generoPersonagem === 'mulher') {
      return 'Tudo pronto por aqui. Vamos encarar os próximos 6 meses com o orçamento organizado.';
    }
    if (modoJogo === 'individual' && generoPersonagem === 'homem') {
      return 'Orçamento ajustado. Agora é segurar os gastos por impulso durante os 6 meses.';
    }
    if (modoJogo === 'familia_grande') {
      return 'Casa cheia! Com cinco pessoas, cada escolha faz diferença no fim do mês.';
    }
    return 'Contas planejadas. Vamos ver como a família se sai ao longo dos 6 meses.';
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
  // INÍCIO DO JOGO E VIRADA DE MÊS
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
      const jurosDoMes =
        saldoVindoMesAnterior < 0 ? Math.round(Math.abs(saldoVindoMesAnterior) * 0.08) : 0;

      const faturaCartaoMes = parcelasAgendadas[numeroMes - 1] || 0;
      const rendaEntradaMes = salarioMensal + bolsaFamiliaEfetivo + peDeMeiaEfetivo;

      let novoSaldo =
        saldoVindoMesAnterior -
        jurosDoMes +
        rendaEntradaMes -
        totalGastosMensaisPlanejados -
        faturaCartaoMes;

      let guardadoNesteMes = 0;
      if (metaReserva > 0 && novoSaldo >= metaReserva) {
        novoSaldo -= metaReserva;
        guardadoNesteMes = metaReserva;
      } else if (metaReserva > 0 && novoSaldo > 0) {
        guardadoNesteMes = novoSaldo;
        novoSaldo = 0;
      }

      const novaReserva = reservaVindaMesAnterior + guardadoNesteMes;

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

      const listaParticulas: Array<{ texto: string; cor: ParticulaFlutuante['cor'] }> = [
        {
          texto: `+${formatarMoeda(rendaEntradaMes)} renda do mês`,
          cor: 'verde',
        },
        {
          texto: `-${formatarMoeda(totalGastosMensaisPlanejados)} contas do mês`,
          cor: 'amarelo',
        },
      ];

      if (bolsaFamiliaEfetivo > 0) {
        listaParticulas.push({
          texto: `Bolsa Família: +${formatarMoeda(bolsaFamiliaEfetivo)}`,
          cor: 'azul',
        });
      }
      if (peDeMeiaEfetivo > 0) {
        listaParticulas.push({
          texto: `Pé-de-Meia: +${formatarMoeda(peDeMeiaEfetivo)}`,
          cor: 'azul',
        });
      }
      if (jurosDoMes > 0) {
        listaParticulas.push({
          texto: `-${formatarMoeda(jurosDoMes)} juros (8%)`,
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
  // PROCESSAR DECISÃO NAS CARTAS DE AÇÃO
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
          texto: `Reserva cobriu ${formatarMoeda(valorTiradoDoCofre)}`,
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
          texto: `Cartão: ${carta.mesesParcela}x R$ ${carta.parcelaCartaoFutura}`,
          cor: 'amarelo',
        });
      }
      if (carta.impactoCoracoes !== 0) {
        popups.push({
          texto: `${carta.impactoCoracoes > 0 ? '+' : ''}${carta.impactoCoracoes}% bem-estar`,
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
  // CONSOLIDAÇÃO FINAL PARA A TELA 3
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
      : 'Outros gastos';

    const dadosPizza = [
      { name: 'Alimentação', value: somaAlimentacao, cor: CORES_GRAFICO_CATEGORIAS[0] },
      { name: 'Moradia e contas', value: somaMoradia, cor: CORES_GRAFICO_CATEGORIAS[1] },
      { name: 'Transporte', value: somaTransporte, cor: CORES_GRAFICO_CATEGORIAS[2] },
      { name: 'Roupas', value: somaRoupas, cor: CORES_GRAFICO_CATEGORIAS[3] },
      { name: 'Passeios e lazer', value: somaViagens, cor: CORES_GRAFICO_CATEGORIAS[4] },
      { name: 'Cuidados pessoais', value: somaCuidados, cor: CORES_GRAFICO_CATEGORIAS[5] },
      { name: rotuloOutros, value: somaOutros, cor: CORES_GRAFICO_CATEGORIAS[6] },
      { name: 'Imprevistos', value: somaImprevistos, cor: CORES_GRAFICO_CATEGORIAS[7] },
      { name: 'Juros pagos', value: totalJurosPagos, cor: CORES_GRAFICO_CATEGORIAS[8] },
      { name: 'Reserva guardada', value: Math.max(0, reservaEmergencia), cor: CORES_GRAFICO_CATEGORIAS[9] },
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
        rank: 'Ótimo resultado',
        titulo: 'Contas em dia e reserva formada',
        subtitulo:
          'Você fechou os 6 meses no azul, não pagou juros ao banco e manteve a qualidade de vida.',
        corBg: 'bg-emerald-300 text-slate-950',
        icone: 'trofeu',
      };
    } else if (saldoAtual < 0 || totalJurosPagos > receitasMensaisTotais * 0.15 || patrimonioFinal < 0) {
      ranking = {
        rank: 'Orçamento no vermelho',
        titulo: 'As parcelas e os juros tomaram conta',
        subtitulo:
          'Os parcelamentos acumulados e os juros de 8% ao mês no cheque especial consumiram a renda.',
        corBg: 'bg-rose-500 text-white',
        icone: 'caveira',
      };
    } else {
      ranking = {
        rank: 'No limite',
        titulo: 'Sobreviveu aos 6 meses, mas no aperto',
        subtitulo:
          'As contas fecharam por pouco ou foi preciso abrir mão de bastante bem-estar para não se endividar.',
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
      'Mes',
      'Salario (R$)',
      'Bolsa Familia (R$)',
      'Pe-de-Meia (R$)',
      'Renda Extra (R$)',
      'Renda Total (R$)',
      'Alimentacao (R$)',
      'Moradia e Transporte (R$)',
      'Roupas (R$)',
      'Passeios e Lazer (R$)',
      'Cuidados Pessoais e Outros (R$)',
      'Imprevistos e Cartao (R$)',
      'Juros Pagos (R$)',
      'Reserva Acumulada (R$)',
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
    a.download = 'resumo_orcamento_6_meses.csv';
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
  // RENDERIZAÇÃO PRINCIPAL (LAYOUT COMPACTO EM TELA ÚNICA + TUTORIAL)
  // ============================================================================

  return (
    <div
      className={`min-h-screen bg-[#f6f3ec] text-slate-900 flex flex-col justify-between ${
        tremeTela ? 'animate-screen-shake' : ''
      }`}
    >
      {/* BARRA SUPERIOR COMPACTA */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white border-b-2 border-slate-950 px-4 sm:px-6 py-2.5 no-print">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={reiniciarFliperama}
            className="flex items-center gap-2 text-left cursor-pointer group shrink-0"
          >
            <span className="p-1.5 rounded-lg bg-amber-300 text-slate-950 border border-slate-950">
              <Gamepad2 className="w-4 h-4" />
            </span>
            <span className="font-display font-bold text-sm sm:text-base tracking-tight text-white group-hover:text-amber-300 transition-colors">
              Para Onde Vai o Salário?
            </span>
          </button>

          <nav className="hidden lg:flex items-center gap-3 text-xs font-medium">
            <span
              className={
                telaJogo === 'selecao'
                  ? 'text-amber-300 font-bold underline underline-offset-4'
                  : 'text-slate-400'
              }
            >
              1. Montar orçamento
            </span>
            <span className="text-slate-600">→</span>
            <span
              className={
                telaJogo === 'gameplay'
                  ? 'text-amber-300 font-bold underline underline-offset-4'
                  : 'text-slate-400'
              }
            >
              2. Viver 6 meses
            </span>
            <span className="text-slate-600">→</span>
            <span
              className={
                telaJogo === 'zeramento'
                  ? 'text-amber-300 font-bold underline underline-offset-4'
                  : 'text-slate-400'
              }
            >
              3. Resultado
            </span>
          </nav>

          {/* Botão Tutorial + Controles de Música e Efeitos */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                tocarSomArcade('clique');
                setPassoTutorial(0);
                setTutorialAberto(true);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-amber-300 hover:bg-amber-200 text-slate-950 font-display font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Como jogar</span>
            </button>

            <button
              type="button"
              onClick={alternarMusicaFundo}
              title={musicaAtiva ? 'Silenciar música de fundo' : 'Ativar música de fundo'}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors ${
                musicaAtiva
                  ? 'bg-slate-800 hover:bg-slate-700 border-emerald-500/60 text-emerald-300'
                  : 'bg-slate-800/70 hover:bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{musicaAtiva ? 'Música: ON' : 'Música: Muda'}</span>
            </button>

            <button
              type="button"
              onClick={() => setSomAtivo((s) => !s)}
              title={somAtivo ? 'Silenciar efeitos sonoros' : 'Ativar efeitos sonoros'}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors ${
                somAtivo
                  ? 'bg-slate-800 hover:bg-slate-700 border-amber-400/60 text-amber-200'
                  : 'bg-slate-800/70 hover:bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              {somAtivo ? (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Efeitos: ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Efeitos: OFF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================================
          MODAL DE TUTORIAL PASSO A PASSO ("COMO JOGAR")
         ===================================================================== */}
      {tutorialAberto && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="arcade-card rounded-2xl bg-white max-w-lg w-full p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-amber-200 border border-slate-900 font-mono text-xs font-bold text-slate-900">
                  {PASSOS_TUTORIAL[passoTutorial].numero}
                </span>
                <span className="font-display font-bold text-base text-slate-900">
                  Como funciona o simulador
                </span>
              </div>
              <button
                type="button"
                onClick={() => setTutorialAberto(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
                aria-label="Fechar tutorial"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 py-1">
              <h3 className="font-display font-bold text-lg sm:text-xl text-slate-900">
                {PASSOS_TUTORIAL[passoTutorial].titulo}
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                {PASSOS_TUTORIAL[passoTutorial].resumo}
              </p>
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-xs sm:text-sm text-emerald-950 leading-relaxed">
                <strong>Dica prática:</strong> {PASSOS_TUTORIAL[passoTutorial].destaque}
              </div>
            </div>

            {/* Indicadores de passo */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <div className="flex gap-1.5">
                {PASSOS_TUTORIAL.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPassoTutorial(idx)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      idx === passoTutorial ? 'w-6 bg-slate-900' : 'w-2 bg-slate-300'
                    }`}
                    aria-label={`Ir para passo ${idx + 1}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                {passoTutorial > 0 && (
                  <button
                    type="button"
                    onClick={() => setPassoTutorial((p) => p - 1)}
                    className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Anterior</span>
                  </button>
                )}

                {passoTutorial < PASSOS_TUTORIAL.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setPassoTutorial((p) => p + 1)}
                    className="arcade-btn px-4 py-2 rounded-lg bg-slate-900 text-amber-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Próximo</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setTutorialAberto(false)}
                    className="arcade-btn px-4 py-2 rounded-lg bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Entendi, vamos jogar</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TELA 1: SELEÇÃO DE MODO, GÊNERO E ORÇAMENTO (CABE EM 1 TELA!)
         ===================================================================== */}
      {telaJogo === 'selecao' && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 flex flex-col justify-center">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* COLUNA ESQUERDA (5 cols): Quem mora na casa + Palco da Sala */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-3.5">
              <div className="arcade-card rounded-2xl bg-white p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-bold text-sm sm:text-base text-slate-900">
                    1. Quem vai morar na casa?
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      setPassoTutorial(0);
                      setTutorialAberto(true);
                    }}
                    className="text-xs font-semibold text-indigo-700 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Dúvidas? Veja o tutorial</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {/* Modo Família */}
                  <button
                    type="button"
                    onClick={() => aplicarPresetPerfil('familia', generoPersonagem)}
                    className={`p-2.5 rounded-xl border-2 border-slate-900 text-left transition-all cursor-pointer flex flex-col justify-between ${
                      modoJogo === 'familia'
                        ? 'bg-amber-200 shadow-[2px_2px_0px_0px_#0f172a]'
                        : 'bg-slate-50 hover:bg-amber-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Users className="w-4 h-4 text-slate-800" />
                      <span className="px-1.5 py-0.5 rounded bg-slate-900 text-amber-200 font-mono text-[9px] font-semibold">
                        3 pessoas
                      </span>
                    </div>
                    <div className="mt-1.5">
                      <div className="font-display font-bold text-xs sm:text-sm text-slate-900">
                        Família
                      </div>
                      <div className="text-[10px] text-slate-600 leading-tight">
                        Com Bolsa Família
                      </div>
                    </div>
                  </button>

                  {/* Modo Jovem Solo */}
                  <button
                    type="button"
                    onClick={() => aplicarPresetPerfil('individual', generoPersonagem)}
                    className={`p-2.5 rounded-xl border-2 border-slate-900 text-left transition-all cursor-pointer flex flex-col justify-between ${
                      modoJogo === 'individual'
                        ? 'bg-pink-200 shadow-[2px_2px_0px_0px_#0f172a]'
                        : 'bg-slate-50 hover:bg-pink-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <User className="w-4 h-4 text-slate-800" />
                      <span className="px-1.5 py-0.5 rounded bg-slate-900 text-pink-200 font-mono text-[9px] font-semibold">
                        1 pessoa
                      </span>
                    </div>
                    <div className="mt-1.5">
                      <div className="font-display font-bold text-xs sm:text-sm text-slate-900">
                        Jovem Solo
                      </div>
                      <div className="text-[10px] text-slate-600 leading-tight">
                        Com Pé-de-Meia
                      </div>
                    </div>
                  </button>

                  {/* Modo Família Grande */}
                  <button
                    type="button"
                    onClick={() => aplicarPresetPerfil('familia_grande', generoPersonagem)}
                    className={`p-2.5 rounded-xl border-2 border-slate-900 text-left transition-all cursor-pointer flex flex-col justify-between ${
                      modoJogo === 'familia_grande'
                        ? 'bg-emerald-200 shadow-[2px_2px_0px_0px_#0f172a]'
                        : 'bg-slate-50 hover:bg-emerald-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Users className="w-4 h-4 text-slate-800" />
                      <span className="px-1.5 py-0.5 rounded bg-slate-900 text-emerald-200 font-mono text-[9px] font-semibold">
                        5 pessoas
                      </span>
                    </div>
                    <div className="mt-1.5">
                      <div className="font-display font-bold text-xs sm:text-sm text-slate-900">
                        Família Grande
                      </div>
                      <div className="text-[10px] text-slate-600 leading-tight">
                        Com Bolsa Família
                      </div>
                    </div>
                  </button>
                </div>

                {/* Seletor de Gênero no Modo Jovem Solo */}
                {modoJogo === 'individual' && (
                  <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-300 flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-700">
                      Personagem solo:
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => aplicarPresetPerfil('individual', 'mulher')}
                        className={`py-1 px-3 rounded-lg border font-display font-bold text-xs cursor-pointer transition-all ${
                          generoPersonagem === 'mulher'
                            ? 'bg-pink-600 text-white border-slate-900'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        Mulher
                      </button>

                      <button
                        type="button"
                        onClick={() => aplicarPresetPerfil('individual', 'homem')}
                        className={`py-1 px-3 rounded-lg border font-display font-bold text-xs cursor-pointer transition-all ${
                          generoPersonagem === 'homem'
                            ? 'bg-sky-600 text-white border-slate-900'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        Homem
                      </button>
                    </div>
                  </div>
                )}

                <div className="p-2.5 rounded-xl bg-amber-50/90 border border-amber-200 flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-slate-700 leading-snug">
                    <strong className="text-slate-900">{presetAtivo.titulo}:</strong>{' '}
                    {presetAtivo.dicaEducativa}
                  </p>
                </div>
              </div>

              {/* Palco 2D Interativo Compacto */}
              <PalcoSalaFamilia
                modoJogo={modoJogo}
                generoPersonagem={generoPersonagem}
                humor={humorFamiliaAtual}
                saldoAtual={moedasLivresParaImprevistos}
                felicidadeFamilia={
                  humorFamiliaAtual === 'feliz' ? 90 : humorFamiliaAtual === 'preocupado' ? 58 : 30
                }
                mesNome="Planejamento"
                falaFamilia={falaDinamicaSelecao}
                particulas={particulasFlutuantes}
                modoCompacto={true}
              />
            </div>

            {/* COLUNA DIREITA (7 cols): Orçamento organizado em 3 Abas Rápidas + Barra de Início */}
            <div className="lg:col-span-7 flex flex-col justify-between gap-3.5">
              <div className="arcade-card rounded-2xl bg-white p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                {/* Cabeçalho + Seletor de Abas para caber tudo sem rolar */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h2 className="font-display font-bold text-base sm:text-lg text-slate-900">
                        2. Distribua o orçamento do mês
                      </h2>
                      <p className="text-xs text-slate-500">
                        Navegue pelas 3 abas abaixo para revisar entradas, contas fixas e lazer
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-100 border border-emerald-600 text-emerald-950 font-bold">
                        Renda: {formatarMoeda(receitasMensaisTotais)}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-400 text-slate-900 font-bold">
                        Gastos: {formatarMoeda(totalGastosMensaisPlanejados)}
                      </span>
                    </div>
                  </div>

                  {/* 3 Abas de Navegação Rápida */}
                  <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-slate-100 border border-slate-300">
                    <button
                      type="button"
                      onClick={() => {
                        tocarSomArcade('clique');
                        setAbaOrcamento('renda');
                      }}
                      className={`py-2 px-2 rounded-lg font-display font-bold text-xs sm:text-sm cursor-pointer transition-all ${
                        abaOrcamento === 'renda'
                          ? 'bg-slate-900 text-amber-300 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      1. Renda ({formatarMoeda(receitasMensaisTotais)})
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        tocarSomArcade('clique');
                        setAbaOrcamento('essenciais');
                      }}
                      className={`py-2 px-2 rounded-lg font-display font-bold text-xs sm:text-sm cursor-pointer transition-all ${
                        abaOrcamento === 'essenciais'
                          ? 'bg-slate-900 text-amber-300 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      2. Contas Fixas ({formatarMoeda(totalDespesasEssenciais)})
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        tocarSomArcade('clique');
                        setAbaOrcamento('estilo_reserva');
                      }}
                      className={`py-2 px-2 rounded-lg font-display font-bold text-xs sm:text-sm cursor-pointer transition-all ${
                        abaOrcamento === 'estilo_reserva'
                          ? 'bg-slate-900 text-amber-300 shadow-xs'
                          : 'text-slate-600 hover:bg-slate-900'
                      }`}
                    >
                      3. Lazer e Reserva ({formatarMoeda(totalDespesasEstiloVida + metaReserva)})
                    </button>
                  </div>
                </div>

                {/* CONTEÚDO DA ABA 1: RENDA */}
                {abaOrcamento === 'renda' && (
                  <div className="space-y-3 my-auto">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-300 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2 font-display font-bold text-xs sm:text-sm text-slate-900">
                          <Coins className="w-4 h-4 text-emerald-700" />
                          <span>Salário do trabalho ou estágio</span>
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-mono font-semibold text-slate-500">R$</span>
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
                            className="w-26 px-2.5 py-1 rounded-lg border border-slate-400 bg-white font-mono font-bold text-sm text-right tabular-nums"
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

                    {(modoJogo === 'familia' || modoJogo === 'familia_grande') && (
                      <div className="p-3.5 rounded-xl bg-sky-50/70 border border-sky-200 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-2 font-display font-bold text-xs sm:text-sm text-slate-900">
                            <HandCoins className="w-4 h-4 text-sky-700" />
                            <span>Benefício Bolsa Família (somente no modo família)</span>
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-mono font-semibold text-slate-500">R$</span>
                            <input
                              type="number"
                              min={0}
                              max={1500}
                              step={50}
                              value={bolsaFamilia}
                              onChange={(e) =>
                                setBolsaFamilia(Math.max(0, Number(e.target.value) || 0))
                              }
                              aria-label="Bolsa Família"
                              className="w-24 px-2.5 py-1 rounded-lg border border-slate-400 bg-white font-mono font-bold text-sm text-right tabular-nums"
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
                        <p className="text-[11px] text-slate-600">
                          Valor somado todo início de mês à renda da família.
                        </p>
                      </div>
                    )}

                    {modoJogo === 'individual' && (
                      <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-2 font-display font-bold text-xs sm:text-sm text-slate-900">
                            <GraduationCap className="w-4 h-4 text-purple-700" />
                            <span>Incentivo Pé-de-Meia (somente no modo jovem solo)</span>
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-mono font-semibold text-slate-500">R$</span>
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
                              className="w-24 px-2.5 py-1 rounded-lg border border-slate-400 bg-white font-mono font-bold text-sm text-right tabular-nums"
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
                        <p className="text-[11px] text-slate-600">
                          Incentivo estudantil mensal pago ao manter a frequência escolar acima de 80%.
                        </p>
                      </div>
                    )}

                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => setAbaOrcamento('essenciais')}
                        className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 flex items-center gap-1 cursor-pointer"
                      >
                        <span>Revisar Contas Fixas</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* CONTEÚDO DA ABA 2: CONTAS FIXAS E ESSENCIAIS */}
                {abaOrcamento === 'essenciais' && (
                  <div className="space-y-2.5 my-auto">
                    {[
                      {
                        label: 'Moradia (aluguel, luz, água e internet)',
                        variavel: 'gastoMoradia',
                        valor: gastoMoradia,
                        setter: setGastoMoradia,
                        max: Math.round(receitasMensaisTotais * 0.65),
                        cor: 'bg-teal-500',
                        icone: <Home className="w-4 h-4 text-teal-700" />,
                      },
                      {
                        label: 'Alimentação (supermercado e feira do mês)',
                        variavel: 'gastoAlimentacao',
                        valor: gastoAlimentacao,
                        setter: setGastoAlimentacao,
                        max: Math.round(receitasMensaisTotais * 0.6),
                        cor: 'bg-sky-500',
                        icone: <ShoppingCart className="w-4 h-4 text-sky-700" />,
                      },
                      {
                        label: 'Transporte (ônibus, combustível ou aplicativo)',
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
                          className="p-3 rounded-xl bg-slate-50 border border-slate-300 space-y-1.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="flex items-center gap-2 font-display font-bold text-xs sm:text-sm text-slate-900">
                              {item.icone}
                              <span>{item.label}</span>
                            </span>
                            <span className="font-mono font-bold text-sm text-slate-900 tabular-nums">
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
                              className="w-6 h-6 rounded bg-white hover:bg-slate-100 border border-slate-400 flex items-center justify-center cursor-pointer shrink-0"
                              aria-label={`Diminuir ${item.label}`}
                            >
                              <Minus className="w-3 h-3" />
                            </button>

                            <div className="flex-1 h-3 bg-slate-200 rounded-full border border-slate-400 overflow-hidden relative">
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
                              className="w-6 h-6 rounded bg-white hover:bg-slate-100 border border-slate-400 flex items-center justify-center cursor-pointer shrink-0"
                              aria-label={`Aumentar ${item.label}`}
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    <div className="flex justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => setAbaOrcamento('renda')}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1 cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Voltar para Renda</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAbaOrcamento('estilo_reserva')}
                        className="px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 flex items-center gap-1 cursor-pointer"
                      >
                        <span>Revisar Lazer e Reserva</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* CONTEÚDO DA ABA 3: DIA A DIA, LAZER E RESERVA */}
                {abaOrcamento === 'estilo_reserva' && (
                  <div className="space-y-2.5 my-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {[
                        {
                          label: 'Roupas e calçados',
                          variavel: 'gastoRoupas',
                          valor: gastoRoupas,
                          setter: setGastoRoupas,
                          max: Math.round(receitasMensaisTotais * 0.35),
                          icone: <Shirt className="w-3.5 h-3.5 text-pink-600" />,
                        },
                        {
                          label: 'Passeios e viagens',
                          variavel: 'gastoViagens',
                          valor: gastoViagens,
                          setter: setGastoViagens,
                          max: Math.round(receitasMensaisTotais * 0.35),
                          icone: <Plane className="w-3.5 h-3.5 text-purple-600" />,
                        },
                        {
                          label:
                            modoJogo === 'individual' && generoPersonagem === 'mulher'
                              ? 'Cuidados e salão'
                              : modoJogo === 'individual' && generoPersonagem === 'homem'
                              ? 'Barbearia e treino'
                              : 'Cuidados e farmácia',
                          variavel: 'gastoCuidadosPessoais',
                          valor: gastoCuidadosPessoais,
                          setter: setGastoCuidadosPessoais,
                          max: Math.round(receitasMensaisTotais * 0.35),
                          icone: <Scissors className="w-3.5 h-3.5 text-rose-600" />,
                        },
                      ].map((item) => (
                        <div
                          key={item.variavel}
                          className="p-2.5 rounded-xl bg-slate-50 border border-slate-300 space-y-1.5"
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="flex items-center gap-1 font-display font-bold text-xs text-slate-900 truncate">
                              {item.icone}
                              <span className="truncate">{item.label}</span>
                            </span>
                            <span className="font-mono font-bold text-xs text-slate-900 tabular-nums">
                              {formatarMoeda(item.valor)}
                            </span>
                          </div>
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
                            className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Outro Gasto Personalizável Compacto */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-300 flex flex-col sm:flex-row items-center gap-2">
                      <span className="flex items-center gap-1.5 font-display font-bold text-xs text-slate-800 shrink-0">
                        <FilePlus2 className="w-3.5 h-3.5 text-indigo-700" />
                        <span>Outro gasto:</span>
                      </span>
                      <input
                        type="text"
                        placeholder="Ex: Ração do pet, curso..."
                        value={nomeOutrosGastos}
                        onChange={(e) => setNomeOutrosGastos(e.target.value)}
                        aria-label="Nome do gasto personalizado"
                        className="flex-1 w-full px-2.5 py-1 rounded-lg border border-slate-400 bg-white text-xs"
                      />
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-xs font-mono text-slate-500">R$</span>
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
                          className="w-20 px-2 py-1 rounded-lg border border-slate-400 bg-white font-mono font-bold text-xs text-right tabular-nums"
                        />
                      </div>
                    </div>

                    {/* Reserva de Emergência Mensal */}
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5 font-display font-bold text-xs sm:text-sm text-emerald-950">
                          <PiggyBank className="w-4 h-4 text-emerald-700" />
                          <span>Guardar por mês na reserva de emergência</span>
                        </span>
                        <span className="font-mono font-bold text-sm text-emerald-800 tabular-nums">
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
                        aria-label="Reserva de emergência mensal"
                        className="w-full accent-emerald-600 cursor-pointer h-2 bg-white rounded-lg border border-emerald-400"
                      />
                    </div>
                  </div>
                )}

                {/* BARRA FIXA DE RESUMO E BOTÃO COMEÇAR (SEMPRE VISÍVEL) */}
                <div
                  className={`p-3.5 rounded-xl border-2 border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 ${
                    percentualComprometidoFixosEVida > 80 || moedasLivresParaImprevistos < 0
                      ? 'bg-rose-500 text-white'
                      : percentualComprometidoFixosEVida > 68
                      ? 'bg-amber-200 text-slate-950'
                      : 'bg-emerald-200 text-slate-950'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {percentualComprometidoFixosEVida > 80 || moedasLivresParaImprevistos < 0 ? (
                      <AlertTriangle className="w-6 h-6 shrink-0" />
                    ) : (
                      <ShieldCheck className="w-6 h-6 shrink-0" />
                    )}
                    <div>
                      <div className="font-display font-bold text-xs sm:text-sm">
                        {percentualComprometidoFixosEVida > 80 || moedasLivresParaImprevistos < 0
                          ? 'Atenção: despesas acima do limite seguro'
                          : `${percentualComprometidoFixosEVida}% da renda comprometida com gastos planejados`}
                      </div>
                      <p className="text-xs opacity-90">
                        Sobra livre no mês para imprevistos:{' '}
                        <span className="font-mono font-bold underline">
                          {formatarMoeda(moedasLivresParaImprevistos)}
                        </span>{' '}
                        · Reserva: <span className="font-mono font-bold">{formatarMoeda(metaReserva)}/mês</span>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={apertarStartJogo}
                    className="arcade-btn px-5 py-2.5 rounded-xl bg-slate-900 text-amber-300 font-display font-bold text-sm flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Play className="w-4 h-4 fill-amber-300" />
                    <span>Começar os 6 meses</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {/* =====================================================================
          TELA 2: SIMULAÇÃO DOS 6 MESES (LADO A LADO — CABE 100% NA TELA!)
         ===================================================================== */}
      {telaJogo === 'gameplay' && eventoAtualNPC && faseEmAndamento && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-3 flex flex-col justify-center space-y-3">
          {/* BARRA SUPERIOR DE STATUS DO MÊS (COMPACTA) */}
          <section className="arcade-card rounded-2xl bg-slate-900 text-white px-4 py-2.5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 items-center">
              {/* 1. Mês atual */}
              <div className="flex items-center justify-between gap-2 bg-slate-800 px-3 py-2 rounded-xl border border-slate-700">
                <div>
                  <div className="text-[10px] font-mono text-slate-300">
                    Situação {indiceTurnoNoMes + 1} de 2
                  </div>
                  <div className="font-display font-bold text-sm text-amber-300">
                    {NOMES_FASES_MESES[mesAtual - 1]}
                  </div>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5, 6].map((m) => (
                    <div
                      key={m}
                      className={`w-2.5 h-2.5 rounded-full ${
                        m < mesAtual
                          ? 'bg-emerald-400'
                          : m === mesAtual
                          ? 'bg-amber-400'
                          : 'bg-slate-700'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* 2. Saldo disponível */}
              <div
                className={`px-3 py-2 rounded-xl border flex items-center justify-between ${
                  saldoAtual >= 0
                    ? 'bg-slate-800 border-emerald-500/60'
                    : 'bg-rose-950 border-rose-500'
                }`}
              >
                <div>
                  <div className="text-[10px] text-slate-300">Saldo na conta</div>
                  <div
                    className={`font-mono font-bold text-base sm:text-lg tabular-nums leading-tight ${
                      saldoAtual >= 0 ? 'text-emerald-300' : 'text-rose-400'
                    }`}
                  >
                    {formatarMoeda(saldoAtual)}
                  </div>
                </div>
                <div className="text-right text-[10px] font-mono text-slate-400">
                  {saldoAtual < 0 ? (
                    <span className="text-rose-300 font-bold">Juros 8%/mês</span>
                  ) : modoJogo === 'individual' ? (
                    <span>+Pé-de-Meia R${peDeMeiaEfetivo}</span>
                  ) : (
                    <span>+Bolsa Fam. R${bolsaFamiliaEfetivo}</span>
                  )}
                </div>
              </div>

              {/* 3. Reserva guardada */}
              <div className="px-3 py-2 rounded-xl bg-slate-800 border border-sky-500/50 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-sky-300">Reserva guardada</div>
                  <div className="font-mono font-bold text-base sm:text-lg text-white tabular-nums leading-tight">
                    {formatarMoeda(reservaEmergencia)}
                  </div>
                </div>
                <div className="text-right text-[10px] font-mono text-slate-400">
                  Cartão: -{formatarMoeda(faseEmAndamento.parcelasCartaoAnteriores)}
                </div>
              </div>

              {/* 4. Bem-estar */}
              <div className="px-3 py-2 rounded-xl bg-slate-800 border border-rose-400/50 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-rose-300">Bem-estar</div>
                  <div className="font-mono font-bold text-base sm:text-lg text-white leading-tight">
                    {felicidadeFamilia}%
                  </div>
                </div>
                <div className="flex items-center gap-0.5">
                  {[20, 40, 60, 80, 100].map((limite) => (
                    <Heart
                      key={limite}
                      className={`w-3.5 h-3.5 ${
                        felicidadeFamilia >= limite
                          ? 'fill-rose-500 text-rose-400'
                          : felicidadeFamilia >= limite - 10
                          ? 'fill-rose-500/40 text-rose-400'
                          : 'text-slate-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ÁREA PRINCIPAL LADO A LADO: PALCO + DIÁLOGO (ESQUERDA) E OPÇÕES (DIREITA) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            {/* Esquerda (7 cols): Palco 2D da Sala + Visitante */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <PalcoSalaFamilia
                modoJogo={modoJogo}
                generoPersonagem={generoPersonagem}
                humor={humorFamiliaAtual}
                saldoAtual={saldoAtual}
                felicidadeFamilia={felicidadeFamilia}
                mesNome={NOMES_CURTOS_MESES[mesAtual - 1]}
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
            </div>

            {/* Direita (5 cols): As 3 Opções de Decisão empilhadas na mesma tela */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              {!decisaoDoTurno ? (
                <div className="flex flex-col justify-between gap-2.5 h-full">
                  <div className="text-xs font-semibold text-slate-600 px-1 flex items-center justify-between">
                    <span>Como você prefere resolver essa situação?</span>
                    <span className="font-mono text-[11px] text-slate-500">Teclas 1, 2 ou 3</span>
                  </div>

                  {eventoAtualNPC.cartas.map((carta, index) => {
                    const coresBadge =
                      index === 0
                        ? 'bg-emerald-200 text-slate-900'
                        : index === 1
                        ? 'bg-amber-200 text-slate-900'
                        : 'bg-rose-200 text-slate-900';

                    return (
                      <button
                        key={carta.codigo}
                        type="button"
                        onClick={() => processarDecisao(carta)}
                        className="arcade-btn rounded-xl bg-white p-3.5 text-left cursor-pointer group flex-1 flex flex-col justify-between"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`px-2 py-0.5 rounded border border-slate-900 font-mono text-[11px] font-bold ${coresBadge}`}
                            >
                              {carta.rotuloAcao}
                            </span>
                            <div className="flex items-center gap-2 font-mono text-xs">
                              <span
                                className={
                                  carta.impactoMoedas > 0
                                    ? 'text-emerald-700 font-bold'
                                    : carta.impactoMoedas === 0
                                    ? 'text-slate-700 font-semibold'
                                    : 'text-rose-600 font-bold'
                                }
                              >
                                {carta.impactoMoedas > 0
                                  ? `+${formatarMoeda(carta.impactoMoedas)}`
                                  : carta.impactoMoedas === 0
                                  ? 'R$ 0 agora'
                                  : formatarMoeda(carta.impactoMoedas)}
                                {carta.usaCofreReserva && reservaEmergencia > 0
                                  ? ' (usa reserva)'
                                  : ''}
                              </span>
                              <span
                                className={
                                  carta.impactoCoracoes >= 0
                                    ? 'text-emerald-700 font-semibold'
                                    : 'text-rose-600 font-semibold'
                                }
                              >
                                {carta.impactoCoracoes > 0
                                  ? `+${carta.impactoCoracoes}%`
                                  : `${carta.impactoCoracoes}%`}{' '}
                                ♥
                              </span>
                            </div>
                          </div>

                          <h3 className="font-display font-bold text-sm sm:text-base text-slate-900 group-hover:text-indigo-700 transition-colors">
                            {carta.titulo}
                          </h3>
                          <p className="text-xs text-slate-600 leading-snug">
                            {carta.descricao}
                          </p>
                        </div>

                        {carta.parcelaCartaoFutura > 0 && (
                          <div className="mt-2 pt-1.5 border-t border-slate-200 flex items-center justify-between font-mono text-[11px] text-amber-800">
                            <span>Parcelado no cartão:</span>
                            <span className="font-bold">
                              +{carta.mesesParcela}x de {formatarMoeda(carta.parcelaCartaoFutura)} nos próximos meses
                            </span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="arcade-card rounded-2xl bg-amber-100 p-5 h-full flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    <div className="inline-block px-2.5 py-0.5 rounded bg-slate-900 text-amber-200 font-mono text-xs font-semibold">
                      Resultado da escolha
                    </div>
                    <h3 className="font-display font-bold text-lg sm:text-xl text-slate-950">
                      {decisaoDoTurno.tituloAcao}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                      {decisaoDoTurno.explicacaoMestre}
                    </p>

                    <div className="p-3 rounded-xl bg-white/80 border border-slate-300 space-y-1 font-mono text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Impacto na conta:</span>
                        <span
                          className={
                            decisaoDoTurno.impactoCaixa >= 0
                              ? 'text-emerald-700 font-bold'
                              : 'text-rose-600 font-bold'
                          }
                        >
                          {decisaoDoTurno.impactoCaixa > 0
                            ? `+${formatarMoeda(decisaoDoTurno.impactoCaixa)}`
                            : formatarMoeda(decisaoDoTurno.impactoCaixa)}
                        </span>
                      </div>
                      {decisaoDoTurno.usouReserva > 0 && (
                        <div className="flex justify-between text-emerald-800 font-bold">
                          <span>Coberto pela reserva:</span>
                          <span>{formatarMoeda(decisaoDoTurno.usouReserva)}</span>
                        </div>
                      )}
                      {decisaoDoTurno.dividaFuturaGerada > 0 && (
                        <div className="flex justify-between text-amber-800 font-bold">
                          <span>Total jogado para o cartão:</span>
                          <span>{formatarMoeda(decisaoDoTurno.dividaFuturaGerada)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={avancarProximoTurno}
                    className="arcade-btn w-full py-3.5 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-bold text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>
                      {indiceTurnoNoMes === 0
                        ? 'Próxima situação do mês'
                        : mesAtual < 6
                        ? `Avançar para ${NOMES_CURTOS_MESES[mesAtual]}`
                        : 'Ver balanço dos 6 meses'}
                    </span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      )}

      {/* =====================================================================
          TELA 3: BALANÇO FINAL DOS 6 MESES + GRÁFICOS E PLANILHA
         ===================================================================== */}
      {telaJogo === 'zeramento' && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6">
          {/* RESUMO DO RESULTADO */}
          <section
            className={`arcade-card rounded-2xl p-6 flex flex-col lg:flex-row items-center justify-between gap-6 ${relatorioFinal.ranking.corBg}`}
          >
            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
              <div className="w-20 h-20 rounded-2xl bg-slate-900 text-amber-300 border-2 border-white flex items-center justify-center shrink-0">
                {relatorioFinal.ranking.icone === 'trofeu' ? (
                  <Trophy className="w-10 h-10 text-amber-300" />
                ) : relatorioFinal.ranking.icone === 'caveira' ? (
                  <Skull className="w-10 h-10 text-rose-400" />
                ) : (
                  <Award className="w-10 h-10 text-amber-300" />
                )}
              </div>

              <div className="space-y-1">
                <div className="inline-block px-2.5 py-0.5 rounded bg-slate-900 text-amber-200 font-mono text-xs font-semibold">
                  Fim dos 6 meses · {relatorioFinal.ranking.rank} · {presetAtivo.titulo}
                </div>
                <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight">
                  {relatorioFinal.ranking.titulo}
                </h1>
                <p className="text-sm sm:text-base opacity-90 max-w-2xl">
                  {relatorioFinal.ranking.subtitulo}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2.5 shrink-0 no-print">
              <button
                type="button"
                onClick={exportarPlanilhaCSV}
                className="arcade-btn px-4 py-2.5 rounded-xl bg-white text-slate-900 font-display font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Baixar planilha (CSV)</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="arcade-btn px-4 py-2.5 rounded-xl bg-white text-slate-900 font-display font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir</span>
              </button>

              <button
                type="button"
                onClick={reiniciarFliperama}
                className="arcade-btn px-5 py-2.5 rounded-xl bg-slate-900 text-amber-300 font-display font-bold text-sm flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Jogar novamente</span>
              </button>
            </div>
          </section>

          {/* 4 INDICADORES PRINCIPAIS */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="arcade-card-sm rounded-xl bg-white p-4">
              <div className="text-xs font-medium text-slate-500">
                Saldo total + reserva (líquido)
              </div>
              <div
                className={`text-2xl font-mono font-bold tabular-nums mt-1 ${
                  relatorioFinal.patrimonioFinal >= 0 ? 'text-emerald-700' : 'text-rose-600'
                }`}
              >
                {formatarMoeda(relatorioFinal.patrimonioFinal)}
              </div>
              <div className="text-xs text-slate-600 mt-1">
                Conta: {formatarMoeda(saldoAtual)} · Reserva: {formatarMoeda(reservaEmergencia)}
              </div>
            </div>

            <div className="arcade-card-sm rounded-xl bg-white p-4">
              <div className="text-xs font-medium text-slate-500">
                Renda acumulada nos 6 meses
              </div>
              <div className="text-2xl font-mono font-bold text-slate-900 tabular-nums mt-1">
                {formatarMoeda(relatorioFinal.rendaTotal6Meses)}
              </div>
              <div className="text-xs text-slate-600 mt-1">
                {modoJogo === 'individual'
                  ? 'Salário + Pé-de-Meia + rendas extras'
                  : 'Salário + Bolsa Família + rendas extras'}
              </div>
            </div>

            <div className="arcade-card-sm rounded-xl bg-white p-4">
              <div className="text-xs font-medium text-slate-500">
                Dinheiro perdido com juros
              </div>
              <div
                className={`text-2xl font-mono font-bold tabular-nums mt-1 ${
                  totalJurosPagos > 0 ? 'text-rose-600' : 'text-emerald-700'
                }`}
              >
                {formatarMoeda(totalJurosPagos)}
              </div>
              <div className="text-xs text-slate-600 mt-1">
                {dividaCartaoResidual > 0
                  ? `+ ${formatarMoeda(dividaCartaoResidual)} em parcelas restantes`
                  : 'Nenhuma parcela pendente'}
              </div>
            </div>

            <div className="arcade-card-sm rounded-xl bg-white p-4">
              <div className="text-xs font-medium text-slate-500">
                Bem-estar ao final de junho
              </div>
              <div className="text-2xl font-mono font-bold text-rose-600 tabular-nums mt-1">
                {felicidadeFamilia}%
              </div>
              <div className="text-xs text-slate-600 mt-1">
                {felicidadeFamilia >= 70 ? 'Qualidade de vida equilibrada' : 'Rotina desgastante'}
              </div>
            </div>
          </section>

          {/* GRÁFICOS */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 arcade-card rounded-2xl bg-white p-5 flex flex-col justify-between">
              <div>
                <h2 className="font-display font-bold text-lg text-slate-900">
                  Para onde foi o dinheiro nos 6 meses?
                </h2>
                <p className="text-xs text-slate-500">
                  Divisão entre contas fixas, estilo de vida, imprevistos, juros e reserva
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
                          strokeWidth={1.5}
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

            <div className="lg:col-span-7 arcade-card rounded-2xl bg-white p-5 flex flex-col justify-between">
              <div>
                <h2 className="font-display font-bold text-lg text-slate-900">
                  Evolução mês a mês
                </h2>
                <p className="text-xs text-slate-500">
                  Comparativo entre saldo em conta, reserva acumulada e juros pagos de janeiro a junho
                </p>
              </div>

              <div className="h-76 w-full mt-3">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={relatorioFinal.dadosBarras}
                    margin={{ top: 10, right: 15, left: 5, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                    <XAxis dataKey="mes" tick={{ fontSize: 12, fontWeight: 600 }} />
                    <YAxis tick={{ fontSize: 12, fontWeight: 600 }} />
                    <RechartsTooltip
                      formatter={(valor, nome) => [
                        formatarMoeda(Number(valor ?? 0)),
                        String(nome ?? ''),
                      ]}
                    />
                    <Legend />
                    <ReferenceLine y={0} stroke="#0f172a" strokeWidth={1.5} />
                    <Bar
                      dataKey="SaldoFinal"
                      name="Saldo em conta"
                      fill="#10b981"
                      stroke="#0f172a"
                      strokeWidth={1.5}
                      radius={[5, 5, 0, 0]}
                    />
                    <Bar
                      dataKey="CofreReserva"
                      name="Reserva guardada"
                      fill="#0284c7"
                      stroke="#0f172a"
                      strokeWidth={1.5}
                      radius={[5, 5, 0, 0]}
                    />
                    <Bar
                      dataKey="JurosPagos"
                      name="Juros pagos"
                      fill="#ef4444"
                      stroke="#0f172a"
                      strokeWidth={1.5}
                      radius={[5, 5, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* TABELA MÊS A MÊS */}
          <section className="arcade-card rounded-2xl bg-white p-5 sm:p-6 space-y-4 overflow-hidden">
            <div>
              <h2 className="font-display font-bold text-lg sm:text-xl text-slate-900">
                Extrato mês a mês
              </h2>
              <p className="text-xs text-slate-500">
                Resumo das entradas ({modoJogo === 'individual' ? 'Salário + Pé-de-Meia' : 'Salário + Bolsa Família'}) e saídas de cada mês
              </p>
            </div>

            <div className="overflow-x-auto -mx-5 px-5">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-900 text-amber-200 font-mono text-[11px]">
                    <th className="py-3 px-2.5">Mês</th>
                    <th className="py-3 px-2.5 text-right">Renda total</th>
                    <th className="py-3 px-2.5 text-right">Alimentação</th>
                    <th className="py-3 px-2.5 text-right">Moradia e transp.</th>
                    <th className="py-3 px-2.5 text-right">Roupas e lazer</th>
                    <th className="py-3 px-2.5 text-right">Cuidados e outros</th>
                    <th className="py-3 px-2.5 text-right">Imprevistos e cartão</th>
                    <th className="py-3 px-2.5 text-right">Juros (8%)</th>
                    <th className="py-3 px-2.5 text-right">Saldo final</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono tabular-nums text-xs">
                  {historicoMensal.map((m) => (
                    <tr key={m.mes} className="hover:bg-amber-50/50">
                      <td className="py-3 px-2.5 font-sans font-bold text-slate-900">
                        <div>{m.nomeMes}</div>
                        <div className="text-[10px] font-normal text-slate-500">
                          {m.decisoes.map((d) => d.eventoTitulo).join(' · ')}
                        </div>
                      </td>
                      <td className="py-3 px-2.5 text-right text-emerald-700 font-semibold">
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
                      <td className="py-3 px-2.5 text-right text-amber-800">
                        -{formatarMoeda(m.gastosEventosDireto + m.parcelasCartaoAnteriores)}
                      </td>
                      <td
                        className={`py-3 px-2.5 text-right ${
                          m.jurosChequeEspecial > 0 ? 'text-rose-600 font-bold' : 'text-slate-400'
                        }`}
                      >
                        {m.jurosChequeEspecial > 0
                          ? `-${formatarMoeda(m.jurosChequeEspecial)}`
                          : 'R$ 0'}
                      </td>
                      <td
                        className={`py-3 px-2.5 text-right font-bold ${
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

          {/* ANÁLISE DA PARTIDA */}
          <section className="arcade-card rounded-2xl bg-slate-900 text-white p-6 space-y-5">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 text-xs font-mono text-amber-300">
                  <BookOpen className="w-4 h-4" />
                  <span>Análise das suas escolhas</span>
                </div>
                <h2 className="text-xl font-display font-bold text-white">
                  O que mais pesou no seu orçamento?
                </h2>
              </div>

              <div className="px-3.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono">
                Compras parceladas ou por impulso:{' '}
                <strong className="text-amber-300">
                  {relatorioFinal.armadilhasEscolhidas.length} de 12 situações
                </strong>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-800/90 border border-slate-700 space-y-1.5">
                <h3 className="font-display font-bold text-amber-300 text-base">
                  Impacto do cartão e dos juros
                </h3>
                {totalJurosPagos > 0 || dividaCartaoResidual > 0 ? (
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    Ao longo do semestre, foram pagos{' '}
                    <strong className="text-rose-300">{formatarMoeda(totalJurosPagos)}</strong> só
                    em juros de cheque especial, além de{' '}
                    <strong className="text-amber-300">
                      {formatarMoeda(relatorioFinal.totalDesperdicadoArmadilhas)}
                    </strong>{' '}
                    em parcelamentos e gastos por impulso. Quando várias parcelas se somam, o salário
                    do mês seguinte já entra comprometido.
                  </p>
                ) : (
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    Você passou os 6 meses sem pagar juros ao banco e evitou acumular prestações no
                    cartão. Isso permitiu preservar a renda para o que realmente importava.
                  </p>
                )}
              </div>

              <div className="p-4 rounded-xl bg-slate-800/90 border border-slate-700 space-y-1.5">
                <h3 className="font-display font-bold text-emerald-300 text-base">
                  Particularidades do perfil ({presetAtivo.titulo})
                </h3>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {presetAtivo.dicaEducativa}
                </p>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* RODAPÉ COMPACTO */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-2.5 px-4 sm:px-6 text-xs no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Projeto Educacional · O Dinheiro Desaparece? Para onde vai o salário?</span>
          <span className="font-mono text-[11px]">Atalhos: teclas 1, 2, 3 e Enter</span>
        </div>
      </footer>
    </div>
  );
}
